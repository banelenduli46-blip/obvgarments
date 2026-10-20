import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

const CartContext = createContext(null);

// Cart stores product ids, sizes and quantities only. Prices shown here come from
// the API for display; the server recalculates every price at checkout.
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("obv_cart") || "[]"));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("obv_wishlist") || "[]"));
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("obv_token") || "");
  const [member, setMember] = useState(null);
  const [authReady, setAuthReady] = useState(() => !localStorage.getItem("obv_token"));
  const [cartOpen, setCartOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => { localStorage.setItem("obv_cart", JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem("obv_wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    let active = true;
    if (!token) {
      setMember(null);
      setAuthReady(true);
      return () => { active = false; };
    }
    setAuthReady(false);
    api.profile(token).then(({ member: profile }) => {
      if (active) setMember(profile);
    }).catch((error) => {
      if (!active) return;
      if (error.message === "Please sign in again.") {
        localStorage.removeItem("obv_token");
        setToken("");
        setMember(null);
      }
    }).finally(() => {
      if (active) setAuthReady(true);
    });
    return () => { active = false; };
  }, [token]);
  useEffect(() => {
    let active = true;
    setProductsError("");
    api.products(token).then((result) => {
      if (active) setProducts(result);
    }).catch((error) => {
      if (active) setProductsError(error.message);
    });
    return () => { active = false; };
  }, [token]);

  const signIn = async (email, password) => {
    const result = await api.login({ email, password });
    localStorage.setItem("obv_token", result.token);
    setToken(result.token);
    setMember(result.member);
    setAuthReady(true);
    return result.member;
  };
  const register = async (name, email, password) => {
    const result = await api.register({ name, email, password });
    localStorage.setItem("obv_token", result.token);
    setToken(result.token);
    setMember(result.member);
    setAuthReady(true);
    return result.member;
  };
  const logout = async () => {
    const currentToken = token;
    localStorage.removeItem("obv_token");
    setToken("");
    setMember(null);
    setAuthReady(true);
    if (currentToken) {
      try {
        await api.logout(currentToken);
      } catch (error) {
        console.error("Could not revoke the server session during logout:", error);
      }
    }
  };
  const refreshAccount = async () => {
    if (!token) return null;
    const result = await api.profile(token);
    setMember(result.member);
    setProducts(await api.products(token));
    return result.member;
  };

  const value = useMemo(() => {
    const lines = items
      .map((l) => ({ ...l, product: products.find((p) => p.id === l.id) }))
      .filter((l) => l.product);
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    return {
      items,
      lines,
      products,
      productsError,
      wishlist,
      token,
      member,
      authReady,
      signIn,
      register,
      logout,
      refreshAccount,
      subtotal,
      count: items.reduce((n, l) => n + l.qty, 0),
      toggleWishlist: (id) =>
        setWishlist((prev) => prev.includes(id) ? prev.filter((productId) => productId !== id) : [...prev, id]),
      isWishlisted: (id) => wishlist.includes(id),
      add: (id, size, qty = 1) =>
        setItems((prev) => {
          const hit = prev.find((l) => l.id === id && l.size === size);
          return hit
            ? prev.map((l) => (l === hit ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
            : [...prev, { id, size, qty }];
        }),
      change: (id, size, delta) =>
        setItems((prev) => prev.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.max(1, Math.min(10, l.qty + delta)) } : l))),
      remove: (id, size) => setItems((prev) => prev.filter((l) => !(l.id === id && l.size === size))),
      clear: () => setItems([]),
      cartOpen,
      setCartOpen,
      activePanel,
      setActivePanel
    };
  }, [items, wishlist, products, productsError, token, member, authReady, cartOpen, activePanel]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
