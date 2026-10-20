import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart.jsx";
import { api } from "../api.js";
import { WordSlide } from "../components/WordSlide.jsx";

const SHIPPING = { freeOver: 500, fee: 95 };

export default function Checkout() {
  const { lines, subtotal, change, remove, member, token } = useCart();
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fee = subtotal === 0 || subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.fee;
  useEffect(() => {
    if (member) setForm((current) => ({ ...current, name: member.name, email: member.email }));
  }, [member]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pay = async (e) => {
    e.preventDefault();
    setError("");
    if (!lines.length) return setError("Your cart is empty.");
    setBusy(true);
    try {
      const { url } = await api.checkout({
        ...form,
        items: lines.map((l) => ({ id: l.id, size: l.size, qty: l.qty }))
      }, token);
      window.location.href = url; // Stripe-hosted payment page
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="page-top checkout-page">
      <WordSlide as="h1" className="section-title" text="Checkout" immediate />

      {lines.length === 0 ? (
        <p className="body-copy">Your cart is empty. <Link to="/shop" className="link-arrow">Continue shopping &rarr;</Link></p>
      ) : (
        <>
          <div className="checkout-lines">
            {lines.map((l) => (
              <div className="cart-line" key={`${l.id}-${l.size}`}>
                <div className="cart-thumb"><img src={l.product.img} alt={l.product.name} /></div>
                <div>
                  <div className="cl-name">{l.product.name}</div>
                  <div className="cl-meta">Size {l.size} · R{l.product.price.toFixed(2)}</div>
                  <div className="qty" style={{ marginTop: 8 }}>
                    <button onClick={() => change(l.id, l.size, -1)} aria-label="Decrease">&minus;</button>
                    <span>{l.qty}</span>
                    <button onClick={() => change(l.id, l.size, 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="cl-remove" onClick={() => remove(l.id, l.size)}>Remove</button>
                </div>
                <strong>R{(l.product.price * l.qty).toFixed(2)}</strong>
              </div>
            ))}
            <div className="cart-total">
              <span>Delivery</span><strong>{fee ? `R${fee.toFixed(2)}` : "Free"}</strong>
            </div>
            <div className="cart-total">
              <span>Total</span><strong>R{(subtotal + fee).toFixed(2)}</strong>
            </div>
          </div>

          <form className="checkout" onSubmit={pay} noValidate>
            <h4>Delivery details</h4>
            <input className="input" name="name" placeholder="Full name" value={form.name} onChange={onChange} required />
            <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required readOnly={Boolean(member)} />
            <input className="input" name="address" placeholder="Delivery address" value={form.address} onChange={onChange} required />
            {member?.isMember && <p className="form-msg success">Your 10% member discount is applied to eligible products.</p>}
            <button className="btn btn-red full" type="submit" disabled={busy}>
              <span>{busy ? "Redirecting to secure payment…" : "Pay securely with Stripe"}</span>
            </button>
            {error && <p className="form-msg error">{error}</p>}
            <p className="muted-label" style={{ marginTop: 14 }}>You'll enter card details on Stripe's secure page. We never see your card number.</p>
          </form>
        </>
      )}
    </section>
  );
}
