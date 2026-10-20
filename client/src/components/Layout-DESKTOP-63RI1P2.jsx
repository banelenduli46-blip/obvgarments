import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../cart.jsx";
import { api } from "../api.js";
import { useEffect, useMemo, useState } from "react";
import AccountAccess from "./AccountAccess.jsx";
import Footer from "./Footer.jsx";

export const SHIPPING = { freeOver: 500, fee: 95 };

const IconBag = () => (<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>);
const IconMenu = () => (<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
const IconSearch = () => (<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>);
const IconHeart = () => (<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>);
const IconAccount = () => (<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);

function StorePanel({ panel, close }) {
  const { products, wishlist, toggleWishlist, add, member, authReady, token, logout } = useCart();
  const [query, setQuery] = useState("");
  const [orderHistory, setOrderHistory] = useState(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const savedProducts = products.filter((product) => wishlist.includes(product.id));
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? products.filter((product) => product.name.toLowerCase().includes(term)) : products;
  }, [products, query]);

  const toggleOrderHistory = async () => {
    if (historyVisible) {
      setHistoryVisible(false);
      return;
    }
    setHistoryVisible(true);
    if (orderHistory !== null || historyLoading) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const result = await api.orderHistory(token);
      setOrderHistory(result.orders);
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!panel) return null;

  return (
    <>
      <div className="overlay open" onClick={close} />
      <aside className="side-panel open store-panel">
        <div className="panel-head">
          <h3>{panel === "search" ? "Search" : panel === "wishlist" ? "Wishlist" : "Your account"}</h3>
          <button className="icon-btn" onClick={close} aria-label="Close">&times;</button>
        </div>
        {panel === "search" && (
          <div className="panel-body">
            <label className="search-field">
              <span className="sr-only">Search products</span>
              <IconSearch />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the collection" />
            </label>
            <p className="muted-label">{query ? "Search results" : "Popular pieces"}</p>
            <div className="result-list">
              {results.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} onClick={close}>
                  <span>{product.name}</span><span>R{product.price.toFixed(2)}</span>
                </Link>
              ))}
              {results.length === 0 && <p className="panel-empty">No pieces found. Try another search.</p>}
            </div>
          </div>
        )}
        {panel === "wishlist" && (
          <div className="panel-body">
            {savedProducts.length === 0 ? (
              <p className="panel-empty">Your wishlist is empty. Tap the heart on any piece to save it.</p>
            ) : savedProducts.map((product) => (
              <div className="wish-item" key={product.id}>
                <Link to={`/product/${product.id}`} onClick={close} className="cart-thumb">
                  <img src={product.img} alt={product.name} />
                </Link>
                <div>
                  <Link to={`/product/${product.id}`} onClick={close} className="cl-name">{product.name}</Link>
                  <div className="cl-meta">R{product.price.toFixed(2)}</div>
                  <div className="cl-actions">
                    <button
                      className="add-link"
                      onClick={() => { add(product.id, product.sizes[0]); toggleWishlist(product.id); close(); }}
                    >
                      Add to cart
                    </button>
                    <button className="cl-remove" onClick={() => toggleWishlist(product.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {panel === "account" && (
          <div className="panel-body account-panel">
            {!authReady ? (
              <p className="panel-empty">Checking your account…</p>
            ) : member ? (
              <div className="account-profile">
                <p className="account-intro">Welcome back</p>
                <p className="account-name">{member.name}</p>
                <p className="account-email">{member.email}</p>
                <p className="account-membership">
                  {member.isMember ? "Member · 10% off eligible products" : "Membership unlocks after a paid order over R1,000 or 10 paid orders."}
                </p>
                <button
                  type="button"
                  className="btn btn-plain full"
                  onClick={toggleOrderHistory}
                  aria-expanded={historyVisible}
                  aria-controls="account-order-history"
                >
                  <span>{historyLoading ? "Loading history…" : historyVisible ? "Hide purchase history" : "View purchase history"}</span>
                </button>
                {historyVisible && (
                  <section className="order-history" id="account-order-history" aria-label="Purchase history">
                    <h4>Purchase history</h4>
                    {historyLoading && <p className="panel-empty">Loading your purchases…</p>}
                    {historyError && <p className="history-error" role="alert">{historyError}</p>}
                    {orderHistory?.length === 0 && <p className="panel-empty">No completed purchases yet.</p>}
                    {orderHistory?.map((order) => (
                      <article className="order-history-item" key={order.publicNo}>
                        <div className="order-history-heading">
                          <strong>{order.publicNo}</strong>
                          <span>R{order.total.toFixed(2)}</span>
                        </div>
                        <p className="order-history-date">
                          {new Date(`${order.createdAt.replace(" ", "T")}Z`).toLocaleDateString()}
                        </p>
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={`${order.publicNo}-${item.id}-${item.size}-${index}`}>
                              {item.name} · Size {item.size} × {item.qty}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </section>
                )}
                <Link to="/account" className="btn btn-dark full" onClick={close}><span>View profile</span></Link>
                <button
                  type="button"
                  className="btn btn-plain full"
                  onClick={() => { setOrderHistory(null); setHistoryVisible(false); logout(); }}
                >
                  <span>Log out</span>
                </button>
              </div>
            ) : <AccountAccess />}
          </div>
        )}
        <div className="panel-foot">
          <div className="drawer-brand panel-brand">
            <img src="/images/logo.png" alt="OBVGANG" className="logo-img small" />
            <span>OBVGANG</span>
          </div>
        </div>
      </aside>
    </>
  );
}

function CartPanel() {
  const { cartOpen, setCartOpen, lines, subtotal, change, remove } = useCart();
  const fee = subtotal === 0 || subtotal >= SHIPPING.freeOver ? 0 : SHIPPING.fee;
  return (
    <>
      <div className={`overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <aside className={`side-panel ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <div className="panel-head"><h3>Your cart</h3><button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="Close">&times;</button></div>
        <div className="ship-progress">
          <div className="ship-bar" style={{ width: `${Math.min(100, (subtotal / SHIPPING.freeOver) * 100)}%` }} />
          <p>{subtotal >= SHIPPING.freeOver ? "You've unlocked free local delivery." : `Add R${(SHIPPING.freeOver - subtotal).toFixed(2)} for free local delivery.`}</p>
        </div>
        <div className="panel-body">
          {lines.length === 0 && <p className="panel-empty">Your cart is empty.</p>}
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
          <div className="cart-total"><span>Total{fee ? " (incl. delivery)" : ""}</span><strong>R{(subtotal + fee).toFixed(2)}</strong></div>
          {lines.length > 0 && (
            <Link to="/checkout" className="btn btn-red full" onClick={() => setCartOpen(false)}><span>Checkout</span></Link>
          )}
        </div>
        <div className="panel-foot">
          <div className="drawer-brand panel-brand">
            <img src="/images/logo.png" alt="OBVGANG" className="logo-img small" />
            <span>OBVGANG</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function Layout() {
  const location = useLocation();
  const { count, wishlist, cartOpen, setCartOpen, activePanel, setActivePanel, member, authReady, logout } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
    const timer = window.setTimeout(() => {
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        target?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);
  const openPanel = (panel) => {
    setMenuOpen(false);
    setCartOpen(false);
    setActivePanel(panel);
  };
  const closePanel = () => setActivePanel(null);
  return (
    <>
      <div className="announce">
        <div className="marquee" aria-hidden="true">
          {Array.from({ length: 8 }).flatMap((_, k) => ["The dreaming never ends"]
            .map((t) => <span key={`${k}-${t}`}>{t}</span>))}
        </div>
      </div>

      <header className="header">
        <div className="header-left">
          <button
            className="icon-btn menu-toggle"
            onClick={() => {
              setActivePanel(null);
              setCartOpen(false);
              setMenuOpen((open) => !open);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <IconMenu />
          </button>
          <nav className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>
          </nav>
        </div>
        <Link to="/" className="logo drawer-brand nav-brand" aria-label="OBVGANG home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span>OBV</span>
          <img src="/images/logo.png" alt="OBVGANG" className="logo-img" />
          <span>GNG</span>
        </Link>
        <div className="header-right">
          <button className="icon-btn" onClick={() => openPanel("search")} aria-label="Search"><IconSearch /></button>
          <button className="icon-btn wishlist-btn" onClick={() => openPanel("wishlist")} aria-label="Wishlist">
            <IconHeart />
            <span className="badge" data-zero={wishlist.length === 0 ? "true" : "false"}>{wishlist.length}</span>
          </button>
          <button className="icon-btn" onClick={() => openPanel("account")} aria-label="Account"><IconAccount /></button>
          <button className="icon-btn cart-btn" onClick={() => { setActivePanel(null); setCartOpen(true); }} aria-label="Cart">
            <IconBag />
            <span className="badge" data-zero={count === 0 ? "true" : "false"}>{count}</span>
          </button>
        </div>
      </header>

      <div className={`overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer-head">
          <Link to="/" className="drawer-brand" aria-label="OBVGANG home" onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <img src="/images/logo.png" alt="OBVGANG" className="logo-img small" />
            <span>OBVGANG</span>
          </Link>
          <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">&times;</button>
        </div>
        <ul className="drawer-links">
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home <span>→</span></NavLink></li>
          <li><NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop all <span>→</span></NavLink></li>
          <li><NavLink to="/shop?category=shorts" onClick={() => setMenuOpen(false)}>Shorts <span>→</span></NavLink></li>
          <li><NavLink to="/shop?category=tshirt" onClick={() => setMenuOpen(false)}>T-shirts <span>→</span></NavLink></li>
          <li><NavLink to="/gallery" onClick={() => setMenuOpen(false)}>Gallery <span>→</span></NavLink></li>
        </ul>
        <div className="drawer-foot">
          {!authReady ? null : member ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)}>My profile</Link>
              <button onClick={() => { setMenuOpen(false); logout(); }}>Log out</button>
            </>
          ) : <button onClick={() => openPanel("account")}>Sign in / Register</button>}
          <button onClick={() => openPanel("wishlist")}>Wishlist ({wishlist.length})</button>
          <button onClick={() => { setMenuOpen(false); setActivePanel(null); setCartOpen(true); }}>Cart ({count})</button>
        </div>
      </aside>

      <StorePanel panel={activePanel} close={closePanel} />
      <CartPanel />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {location.pathname !== "/shop" && location.pathname !== "/gallery" && <Footer />}
    </>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                       