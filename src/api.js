/**
 * API origin for fetch calls. Prefer relative `/api/...` so:
 * - Local dev: Vite proxies /api → localhost:5000 (vite.config.js)
 * - Vercel: vercel.json rewrites /api → Render (no env-injection issues)
 * Override with VITE_API_BASE_URL (full origin, no trailing slash) if needed.
 *
 * Session: Vercel→Render proxy often drops Set-Cookie. We store JWT from login
 * and send Authorization: Bearer on protected routes (backend supports both).
 */
function getApiBase() {
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  return "";
}

const API_BASE = getApiBase();

const SESSION_TOKEN_KEY = "ai_analyst_session_token";

export function getStoredSessionToken() {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredSessionToken(token) {
  try {
    if (token) sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    else sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

function bearerHeaders() {
  const t = getStoredSessionToken();
  if (!t) return {};
  return { Authorization: `Bearer ${t}` };
}

const fetchOpts = { credentials: "include" };

export async function uploadCsv(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: fd,
    headers: { ...bearerHeaders() },
    ...fetchOpts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export async function sendQuery(uploadId, message, history) {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...bearerHeaders(),
    },
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
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    ...fetchOpts,
    headers: { ...bearerHeaders() },
  });
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
  if (data.token && typeof data.token === "string") {
    setStoredSessionToken(data.token);
  }
  return data;
}

export async function authLogout() {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: "POST",
      headers: { ...bearerHeaders() },
      ...fetchOpts,
    });
  } finally {
    setStoredSessionToken(null);
  }
}
