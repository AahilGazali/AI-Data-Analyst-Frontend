# AI Data Analyst — Frontend

Vite + React dashboard for CSV upload, preview, and conversational analysis (connects to the project backend API).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Configure the backend URL / proxy as needed (see `vite.config.js`).

## Build

```bash
npm run build
```

Output is written to `dist/`.

## Deploy on Vercel (frontend) + API on Render

`vercel.json` rewrites `/api/*` to your Render service, so the browser only talks to your Vercel domain (same-origin `/api/...`) and you do **not** rely on `VITE_API_BASE_URL` for a working deploy.

1. Deploy the backend on Render (note its URL — it must match `vercel.json` or edit that file).
2. On **Render**, set **`SESSION_COOKIE_SAMESITE`** = **`none`** so session cookies work when the UI is on Vercel and the API on Render (responses are still proxied; cookies apply to your Vercel origin).
3. Push to GitHub; Vercel redeploys. No env var is required for the API URL unless you override.

Optional: **`VITE_API_BASE_URL`** if you want the client to call Render directly (e.g. no rewrite); must match your Render URL.

Local development: do **not** set `VITE_API_BASE_URL`; the Vite dev server proxies `/api` to `localhost:5000`. For `npm run preview`, the config proxies `/api` to Render.

## Deploy on Netlify

1. **New site from Git** → pick this repo, branch `main`.
2. Build settings are read from **`netlify.toml`**: `npm run build`, publish **`dist`**.
3. The file proxies **`/api/*`** to your Render backend (edit `netlify.toml` if the API URL changes).
4. After deploy, sign in again so the JWT is stored (same as Vercel + Render flow).

No environment variables are required unless you use **`VITE_API_BASE_URL`** to bypass the proxy.
