// ============================================================
//  Petit client API pour le frontend DFD
// ============================================================
const BASE = "/api";

function token() {
  return localStorage.getItem("dfd_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
    throw new Error(err.error || "Erreur");
  }
  return res.json();
}

export const api = {
  // Public
  getProjects: (cat) => request(`/projects${cat && cat !== "all" ? `?category=${cat}` : ""}`),
  getNews: () => request("/news"),
  getDocuments: () => request("/documents"),
  donate: (data) => request("/donations", { method: "POST", body: data }),
  volunteer: (data) => request("/volunteers", { method: "POST", body: data }),
  membership: (data) => request("/memberships", { method: "POST", body: data }),
  contact: (data) => request("/contact", { method: "POST", body: data }),
  subscribe: (email) => request("/subscribe", { method: "POST", body: { email } }),
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
  // Admin
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me", { auth: true }),
  dashboard: () => request("/auth/dashboard", { auth: true }),
  submissions: (type) => request(`/auth/submissions/${type}`, { auth: true }),
  exportUrl: (type) => `${BASE}/auth/export/${type}`,
  listUsers: () => request("/auth/users", { auth: true }),
  createUser: (data) => request("/auth/users", { method: "POST", body: data, auth: true }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: "DELETE", auth: true }),
  token,
  setToken: (t) => localStorage.setItem("dfd_token", t),
  logout: () => localStorage.removeItem("dfd_token"),
};
