import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCart } from "../cart.jsx";

export default function ProductCard({ p, index = 0 }) {
  const { isWishlisted, toggleWishlist, add, setActivePanel } = useCart();
  const [quickOpen, setQuickOpen] = useState(false);
  const [size, setSize] = useState(p.sizes[0]);
  const comparePrice = p.basePrice ?? p.was;
  const off = comparePrice > p.price ? Math.round((1 - p.price / comparePrice) * 100) : 0;

  useEffect(() => {
    if (!quickOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setQuickOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [quickOpen]);

  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.08 }}
    >
      <div className="card-img">
        <Link className="card-image-link" to={`/product/${p.id}`}>
          <img src={p.img} alt={p.name} loading="lazy" />
          {off > 0 && <span className="sale-badge">{p.memberDiscount ? `MEMBER -${p.memberDiscount}%` : `-${off}%`}</span>}
        </Link>
        <button
          type="button"
          className={`wish-btn ${isWishlisted(p.id) ? "active" : ""}`}
          aria-label={`${isWishlisted(p.id) ? "Remove" : "Save"} ${p.name} ${isWishlisted(p.id) ? "from" : "to"} wishlist`}
          aria-pressed={isWishlisted(p.id)}
          onClick={() => toggleWishlist(p.id)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
        </button>
        <button className="card-quickview" type="button" onClick={() => setQuickOpen(true)}>Quick view</button>
      </div>
      <Link className="card-details-link" to={`/product/${p.id}`}>
        <h3 className="card-name">{p.name}</h3>
        <p className="card-price">R{p.price.toFixed(2)}{comparePrice > p.price && <s>R{comparePrice.toFixed(2)}</s>}</p>
      </Link>
      <div className={`modal ${quickOpen ? "open" : ""}`} onClick={() => setQuickOpen(false)} aria-hidden={!quickOpen}>
        <section className="modal-box product-box" role="dialog" aria-modal="true" aria-labelledby={`quick-title-${p.id}`} onClick={(event) => event.stopPropagation()}>
          <div className="modal-head">
            <h3 id={`quick-title-${p.id}`}>Quick view</h3>
            <button className="icon-btn" onClick={() => setQuickOpen(false)} aria-label="Close quick view">&times;</button>
          </div>
          <div className="pm-body">
            <div className="pm-img"><img src={p.img} alt={p.name} /></div>
            <div>
              <h4 className="section-title">{p.name}</h4>
              <p className="pm-price">R{p.price.toFixed(2)}</p>
              {comparePrice > p.price && <p className="pm-save">{p.memberDiscount ? `Member price · ${p.memberDiscount}% off` : `R${comparePrice.toFixed(2)}`}</p>}
              <p className="muted-label">Size</p>
              <div className="size-grid">
                {p.sizes.map((option) => (
                  <button key={option} className={size === option ? "active" : ""} onClick={() => setSize(option)}>{option}</button>
                ))}
              </div>
              <div className="pm-buy">
                <button
                  type="button"
                  className="btn btn-dark full"
                  onClick={() => {
                    add(p.id, size);
                    setQuickOpen(false);
                    setActivePanel(null);
                  }}
                >
                  <span>Add to cart</span>
                </button>
              </div>
              <Link className="home-text-link quick-view-details" to={`/product/${p.id}`} onClick={() => setQuickOpen(false)}>
                View details <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </motion.article>
  );
}
