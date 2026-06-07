# Rankora Dashboard

Next.js control panel for the Rankora engines. Deploys to Vercel.
Reads live data from Supabase; sends control commands to your local/VPS
engine API (`engine/server.js`).

## Pages
- **Overview** — live stats across both engines
- **Sites** — add/manage sites (build new or plug in existing WordPress)
- **Research** — launch battle plan, see GO/SKIP verdict
- **Content** — keywords, silo, trust pages, bulk write
- **Traffic Engine** — bulk publish to 8 platforms
- **Trends** — live trend signal feed
- **Accounts** — platform account health
- **Tools** — tools empire builder

## Local dev
```bash
cd dashboard
npm install
cp .env.local.example .env.local   # fill keys
npm run dev                          # http://localhost:3000
```

## Deploy to Vercel
1. Push the whole `rankora` repo to GitHub
2. Vercel → New Project → import repo
3. **Set Root Directory to `dashboard`**
4. Add env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_ENGINE_URL)
5. Deploy

## Connecting Vercel → your local engine
The dashboard sends commands to `NEXT_PUBLIC_ENGINE_URL`. Options:
- **Local only:** keep it `http://localhost:3100` and use the dashboard via `npm run dev`
- **From anywhere:** expose `engine/server.js` with a Cloudflare Tunnel or ngrok,
  then set `NEXT_PUBLIC_ENGINE_URL` to that public URL in Vercel.

Reads (sites, jobs, trends, etc.) come straight from Supabase, so the
Overview/Trends/Accounts pages work even when the engine API is offline.
