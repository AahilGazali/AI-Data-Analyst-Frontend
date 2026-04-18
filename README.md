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

1. Deploy the backend on Render and copy its public URL (e.g. `https://your-api.onrender.com`).
2. In the Vercel project → **Settings → Environment Variables**, add:
   - **`VITE_API_BASE_URL`** = `https://your-api.onrender.com` (no trailing slash)
3. On **Render**, add the same variable for cookies to work across origins:
   - **`SESSION_COOKIE_SAMESITE`** = `none`
4. Redeploy both services after changing env vars. Vite bakes `VITE_*` in at **build time**, so trigger a new Vercel build after setting the variable.

Local development: do **not** set `VITE_API_BASE_URL`; requests use the Vite dev server proxy to `localhost:5000`.

The built app falls back to the production Render URL in `src/api.js` if `VITE_API_BASE_URL` is missing (so Vercel works even when env is misconfigured). Override with `VITE_API_BASE_URL` if your API URL changes.
