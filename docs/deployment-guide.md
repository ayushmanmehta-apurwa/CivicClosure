# Deployment guide

**Status:** the Docker files and the Nebius commands below were written but could not be executed where this project was generated.
Treat them as a starting point, test them yourself, and do not claim anything is deployed until you have seen it work.

## Requirements for a public demo
- It must stay reachable, free and unrestricted for the whole judging period. Check the hackathon rules for exact dates.
- Put limits on spending: keep `DAILY_TOKEN_BUDGET` and `RATE_LIMIT_PER_MINUTE` set, and set a spend limit in the Nebius console if it offers one.
- Never put a real key in the repository. Use the host's environment variables.

## Option A: one container (UI + API)
```bash
docker build -t civicclosure .
docker run -p 8000:8000 --env-file .env -e DATABASE_URL=sqlite:////data/civicclosure.db -v civic-data:/data civicclosure
```
or `docker compose up --build`. Open http://localhost:8000. The image builds the React app and serves it from FastAPI.

## Option B: a container host (Render, Railway, Fly.io, ...)
1. Create a service from this repository using the root `Dockerfile` (the host provides `PORT`).
2. Set environment variables: `NEBIUS_API_KEY`, `NEBIUS_BASE_URL`, `FAST_MODEL`, `REASON_MODEL`, `EXPORT_TOKEN`, `CORS_ORIGINS` (your site URL), `DAILY_TOKEN_BUDGET`.
3. Use PostgreSQL so data survives restarts: set `DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname` (Neon and Supabase have free tiers). SQLite files on free hosts can disappear on restart. PostgreSQL support is included but was not tested by the author.
4. Free hosts sleep. Add an uptime pinger on `/health` and tell visitors the first load may take about 30 seconds.
5. Open `/health`: it must report `"mode":"live"` when your Nebius settings are correct.

## Option C: frontend and backend separately
Build the frontend with `VITE_API_BASE=https://your-api.example.com npm run build` and host `frontend/dist` on any static host.
Set `CORS_ORIGINS` on the API to the frontend URL.

## Nebius Serverless Job (hotspots)
Follow `jobs/hotspots/README.md`: build and push the image, create the job (first from the console), pass `API_BASE`, `EXPORT_TOKEN`,
`NEBIUS_API_KEY`, `REASON_MODEL`, check `nebius ai job logs`, and confirm the Admin screen shows hotspots from "the Nebius Serverless Job".
Take a screenshot of the finished job and its logs as evidence.

## Optional: API as a Nebius Serverless Endpoint
Possible with `nebius ai endpoint create` and a container port; not attempted or verified here. Keep Option B as the dependable path.

## Before you share the link
- [ ] Open the site in a private window on a phone and complete one full report and one closure.
- [ ] Banner shows the mode you intend (live or demo) and the demo-clock label is visible in Admin.
- [ ] No secrets in the Git history (`git log -p | grep -i api_key`).
- [ ] README states what was and was not verified.
