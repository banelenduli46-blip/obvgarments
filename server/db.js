// Uses Node's built-in SQLite (Node 22.13+), so there is no native build step.
import { DatabaseSync } from "node:sqlite";

export const db = new DatabaseSync(process.env.DB_PATH || "orders.db");
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_no TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    items TEXT NOT NULL,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    stripe_session_id TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    google_sub TEXT,
    paid_orders INTEGER NOT NULL DEFAULT 0,
    total_paid_cents INTEGER NOT NULL DEFAULT 0,
    is_member INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS auth_sessions (
    token_hash TEXT PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
  );
`);
const memberColumns = db.prepare("PRAGMA table_info(members)").all();
if (!memberColumns.some((column) => column.name === "google_sub"))
  db.exec("ALTER TABLE members ADD COLUMN google_sub TEXT;");
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS members_google_sub_idx ON members(google_sub) WHERE google_sub IS NOT NULL;");
db.exec("CREATE INDEX IF NOT EXISTS orders_email_status_idx ON orders(email, status);");
