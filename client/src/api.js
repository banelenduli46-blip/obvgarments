// Calls go to /api (proxied in development). Set VITE_API_URL for a separate API host in production.
const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}, token) {
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const requestOptions = { ...options, headers };
  const res = await fetch(BASE + path, requestOptions);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export const api = {
  products: (token) => request("/api/products", {}, token),
  register: (payload) =>
    request("/api/account/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request("/api/account/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }),
  profile: (token) => request("/api/account/profile", {}, token),
  orderHistory: (token) => request("/api/account/orders", {}, token),
  logout: (token) => request("/api/account/logout", { method: "POST" }, token),
  checkout: (payload, token) =>
    request("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, token),
  orderStatus: (sessionId) => request(`/api/orders/status?session_id=${encodeURIComponent(sessionId)}`)
};
