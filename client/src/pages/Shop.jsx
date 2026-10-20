import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../cart.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Footer from "../components/Footer.jsx";

const CATEGORIES = [["all", "All"], ["shorts", "Shorts"], ["tshirt", "T-shirts"]];

export default function Shop() {
  const { products, productsError } = useCart();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("featured");
  useEffect(() => {
    const category = searchParams.get("category");
    setFilter(CATEGORIES.some(([key]) => key === category) ? category : "all");
  }, [searchParams]);

  const items = useMemo(() => {
    let list = products.filter((p) => filter === "all" || p.cat === filter);
    const off = (p) => (p.was > p.price ? 1 - p.price / p.was : 0);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "sale") list = [...list].sort((a, b) => off(b) - off(a));
    return list;
  }, [products, filter, sort]);

  return (
    <>
      <section className="page-top">
        <div className="section-head">
          <div>
            <p className="home-eyebrow shop-eyebrow">The collection</p>
          </div>
          <div className="toolbar">
            <div className="chips">
              {CATEGORIES.map(([key, label]) => (
                <button key={key} className={`chip ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>{label}</button>
              ))}
            </div>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="sale">Biggest saving</option>
            </select>
          </div>
        </div>
        {productsError ? <p className="empty form-msg error">{productsError}</p> : (
          <div className="grid">
            {items.length ? items.map((p, i) => <ProductCard key={p.id} p={p} index={i} />) : <p className="empty">Loading pieces…</p>}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
