import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../cart.jsx";
import { WordSlide } from "../components/WordSlide.jsx";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, add } = useCart();
  const p = products.find((x) => x.id === Number(id));
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");

  if (!p) return <section className="page-top center"><p className="body-copy">Loading…</p></section>;
  const comparePrice = p.basePrice ?? p.was;

  const requireSize = () => {
    if (!size) { setMsg("Please select a size first."); return false; }
    return true;
  };
  const addToCart = () => { if (requireSize()) add(p.id, size, qty); };
  const buyNow = () => { if (requireSize()) { add(p.id, size, qty); navigate("/checkout"); } };

  return (
    <section className="product-page">
      <button
        type="button"
        className="product-back"
        onClick={() => navigate(location.key === "default" ? "/shop" : -1)}
      >
        <span aria-hidden="true">←</span> Back
      </button>
      <motion.div className="pm-img" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
        <img src={p.img} alt={p.name} />
      </motion.div>
      <div className="pm-info">
        <p className="eyebrow">{p.cat === "shorts" ? "Shorts" : "T-shirts"}</p>
        <WordSlide as="h1" className="section-title" text={p.name} immediate />
        <p className="pm-price">R{p.price.toFixed(2)}</p>
        {p.memberDiscount
          ? <p className="pm-save">Member price · {p.memberDiscount}% off (was R{comparePrice.toFixed(2)})</p>
          : p.was > p.price && <p className="pm-save">Save R{(p.was - p.price).toFixed(2)}</p>}
        <p className="muted-label">Size</p>
        <div className="size-grid">
          {p.sizes.map((s) => (
            <button key={s} className={size === s ? "active" : ""} onClick={() => { setSize(s); setMsg(""); }}>{s}</button>
          ))}
        </div>
        <p className="size-msg">{msg}</p>
        <div className="pm-buy">
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">&minus;</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase">+</button>
          </div>
          <button className="btn btn-red" onClick={addToCart}><span>Add to cart</span></button>
        </div>
        <button className="btn btn-dark full" onClick={buyNow}><span>Buy it now</span></button>
        <AnimatePresence>{size && <motion.p key="ok" className="form-msg success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Size {size} selected</motion.p>}</AnimatePresence>
      </div>
    </section>
  );
}
