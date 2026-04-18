const API_BASE = "";

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
