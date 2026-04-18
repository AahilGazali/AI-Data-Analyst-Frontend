/**
 * API origin for fetch calls.
 * - Local dev: empty → Vite proxies /api to localhost (see vite.config.js).
 * - Production: VITE_API_BASE_URL (e.g. on Vercel), or the deployed Render URL below if unset.
 */
function getApiBase() {
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "";
  return "https://ai-data-analyst-backend-sclg.onrender.com";
}

const API_BASE = getApiBase();

const fetchOpts = { credentials: "include" };

export async function uploadCsv(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: fd,
    ...fetchOpts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export async function sendQuery(uploadId, message, history) {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId, message, history }),
    ...fetchOpts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Query failed");
  return data;
}

export async function health() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function fetchAuthMe() {
  const res = await fetch(`${API_BASE}/api/auth/me`, fetchOpts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { user: null };
  return data;
}

export async function authSignup(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    ...fetchOpts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Sign up failed");
  return data;
}

export async function authLogin(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    ...fetchOpts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Sign in failed");
  return data;
}

export async function authLogout() {
  await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", ...fetchOpts });
}
