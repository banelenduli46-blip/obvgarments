import "dotenv/config";
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db.js";
import { PRODUCTS, SHIPPING, getProduct, getUnitPriceCents } from "./products.js";

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const scrypt = promisify(scryptCallback);
const MEMBER_DISCOUNT = 10;
const SESSION_DAYS = 30;
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function publicMember(row) {
  return {
    name: row.name,
    email: row.email,
    isMember: Boolean(row.is_member),
    paidOrders: row.paid_orders,
    totalPaid: row.total_paid_cents / 100
  };
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, encoded) {
  const [salt, expectedHex] = encoded.split(":");
  const expected = Buffer.from(expectedHex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function getSessionMember(req) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return null;
  const row = db.prepare(`
    SELECT m.* FROM auth_sessions s
    JOIN members m ON m.id = s.member_id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(hashToken(token), new Date().toISOString());
  return row || null;
}

function createSession(memberId) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO auth_sessions (token_hash, member_id, expires_at) VALUES (?, ?, ?)")
    .run(hashToken(token), memberId, expiresAt);
  return token;
}

function updateMembershipFromPaidOrder(order) {
  db.exec("BEGIN");
  try {
    const result = db.prepare("UPDATE orders SET status = 'paid' WHERE stripe_session_id = ? AND status != 'paid'")
      .run(order.id);
    if (result.changes) {
      const paidOrder = db.prepare("SELECT email, total_cents FROM orders WHERE stripe_session_id = ?").get(order.id);
      const member = db.prepare("SELECT * FROM members WHERE email = lower(?)").get(paidOrder.email);
      if (member) {
        const paidOrders = member.paid_orders + 1;
        const totalPaid = member.total_paid_cents + paidOrder.total_cents;
        const qualifies = paidOrder.total_cents > 100000;
        db.prepare(`
          UPDATE members
          SET paid_orders = ?, total_paid_cents = ?,
              is_member = CASE WHEN ? THEN 1 ELSE is_member END
          WHERE id = ?
        `).run(paidOrders, totalPaid, qualifies ? 1 : 0, member.id);
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

// Stripe webhooks need the raw body, so this route comes before express.json()
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).end();
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers["stripe-signature"], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send("Invalid signature");
  }
  if (event.type === "checkout.session.completed" && event.data.object.payment_status === "paid") {
    updateMembershipFromPaidOrder(event.data.object);
  }
  res.json({ received: true });
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/products", (req, res) => {
  const member = getSessionMember(req);
  const hasDiscount = Boolean(member?.is_member);
  res.json(PRODUCTS.map((product) => {
    if (!hasDiscount || !product.memberEligible) return product;
    const price = getUnitPriceCents(product, true) / 100;
    return { ...product, price, basePrice: product.price, memberDiscount: MEMBER_DISCOUNT };
  }));
});

app.post("/api/account/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (typeof name !== "string" || !name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail) ||
      typeof password !== "string" || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Enter your name, a valid email and a password of at least 8 characters." });
  }

  if (db.prepare("SELECT id FROM members WHERE email = ?").get(normalizedEmail)) {
    return res.status(409).json({ error: "An account with that email already exists. Please sign in." });
  }
  const history = db.prepare(`
    SELECT COUNT(*) AS paid_orders, COALESCE(SUM(total_cents), 0) AS total_paid_cents,
           COALESCE(MAX(total_cents), 0) AS largest_order_cents
    FROM orders WHERE lower(email) = ? AND status = 'paid'
  `).get(normalizedEmail);
  if (history.largest_order_cents <= 100000) {
    return res.status(403).json({ error: "An account is available after a confirmed purchase of more than R1,000. Use the same email address you used at checkout." });
  }

  const passwordHash = await hashPassword(password);
  try {
    const result = db.prepare(`
      INSERT INTO members (email, name, password_hash, paid_orders, total_paid_cents, is_member)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(normalizedEmail, name.trim(), passwordHash, history.paid_orders, history.total_paid_cents, 1);
    const member = db.prepare("SELECT * FROM members WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json({ token: createSession(member.id), member: publicMember(member) });
  } catch (error) {
    if (error.errcode === 2067) {
      return res.status(409).json({ error: "An account with that email already exists. Please sign in." });
    }
    throw error;
  }
}));

app.post("/api/account/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail) || typeof password !== "string") {
    return res.status(400).json({ error: "Enter a valid email and password." });
  }
  const member = db.prepare("SELECT * FROM members WHERE email = ?").get(normalizedEmail);
  if (!member || !(await verifyPassword(password, member.password_hash))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  res.json({ token: createSession(member.id), member: publicMember(member) });
}));

app.get("/api/account/profile", (req, res) => {
  const member = getSessionMember(req);
  if (!member) return res.status(401).json({ error: "Please sign in again." });
  res.json({ member: publicMember(member) });
});

app.get("/api/account/orders", (req, res) => {
  const member = getSessionMember(req);
  if (!member) return res.status(401).json({ error: "Please sign in again." });
  const orders = db.prepare(`
    SELECT public_no, status, items, total_cents, created_at
    FROM orders
    WHERE lower(email) = ? AND status = 'paid'
    ORDER BY created_at DESC, id DESC
  `).all(member.email).map((order) => ({
    publicNo: order.public_no,
    status: order.status,
    items: JSON.parse(order.items),
    total: order.total_cents / 100,
    createdAt: order.created_at
  }));
  res.json({ orders });
});

app.post("/api/account/logout", (req, res) => {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (token) db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").run(hashToken(token));
  res.json({ ok: true });
});

app.post("/api/checkout", asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).json({ error: "Payments are not configured yet." });

  const { items, email, name, address } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 30)
    return res.status(400).json({ error: "Your cart is empty." });
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (typeof name !== "string" || !name.trim() || typeof address !== "string" || !address.trim() ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail))
    return res.status(400).json({ error: "Please check your name, email and address." });
  const account = getSessionMember(req);
  const authorization = req.get("authorization") || "";
  if (authorization.startsWith("Bearer ") && !account)
    return res.status(401).json({ error: "Please sign in again." });
  if (account && normalizedEmail !== account.email)
    return res.status(400).json({ error: "Use the email address linked to your account to check out." });
  const hasDiscount = Boolean(account?.is_member);

  const lines = [];
  for (const i of items) {
    const p = getProduct(i.id);
    const qty = Number(i.qty);
    if (!p || !p.sizes.includes(i.size) || !Number.isInteger(qty) || qty < 1 || qty > 10)
      return res.status(400).json({ error: "An item in your cart is no longer valid." });
    lines.push({ product: p, size: i.size, qty, unitPriceCents: getUnitPriceCents(p, hasDiscount) });
  }
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.qty, 0);
  const feeCents = subtotalCents === 0 || subtotalCents >= SHIPPING.freeOver * 100 ? 0 : SHIPPING.fee * 100;
  const totalCents = subtotalCents + feeCents;

  const publicNo = "OBV-" + Date.now().toString(36).toUpperCase().slice(-6);
  const order = db.prepare(
    "INSERT INTO orders (public_no, email, name, address, items, total_cents) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(publicNo, normalizedEmail, name.trim(), address.trim(),
        JSON.stringify(lines.map((line) => ({ id: line.product.id, name: line.product.name, size: line.size, qty: line.qty }))),
        totalCents);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: normalizedEmail,
    line_items: [
      ...lines.map((line) => ({
        quantity: line.qty,
        price_data: {
          currency: "zar",
          unit_amount: line.unitPriceCents,
          product_data: { name: `${line.product.name} (${line.size})` }
        }
      })),
      ...(feeCents ? [{ quantity: 1, price_data: { currency: "zar", unit_amount: feeCents, product_data: { name: "Delivery" } } }] : [])
    ],
    metadata: { order_id: String(order.lastInsertRowid), public_no: publicNo },
    success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/checkout`
  });

  db.prepare("UPDATE orders SET stripe_session_id = ? WHERE id = ?").run(session.id, order.lastInsertRowid);
  res.json({ url: session.url });
}));

app.get("/api/orders/status", (req, res) => {
  const row = db.prepare("SELECT public_no, status, total_cents FROM orders WHERE stripe_session_id = ?")
    .get(String(req.query.session_id || ""));
  if (!row) return res.status(404).json({ error: "Order not found" });
  res.json({ public_no: row.public_no, status: row.status, total: row.total_cents / 100 });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled API request error:", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

const port = process.env.PORT || 4000;
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(OBVGANG API on http://localhost:${port}));
}
export default app;
