# SnapTab

Mobile-first, zero-login bill splitter. Snap a bill in, share the link, everyone taps what they ordered, done. No accounts, no app store.

Live at [snaptab.vercel.app](https://snaptab.vercel.app).

## Stack (all free tier)

| Layer | Service | Free-tier limit |
| --- | --- | --- |
| Hosting | Vercel Hobby | CDN + HTTPS + preview deploys |
| Database + Realtime | Supabase | 500 MB DB, 2 GB egress, 200 concurrent realtime |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | 10k commands/day |
| Error monitoring | Sentry Developer | 5k errors/mo |
| Analytics | PostHog Cloud (anonymous) | 1M events/mo |
| Uptime | UptimeRobot | 50 monitors, 5-min interval |
| CI | GitHub Actions | Free minutes |
| Testing | Vitest | OSS |
| Cron / TTL | Supabase `pg_cron` | Bundled |

## Setup

1. Clone and install:
   ```bash
   npm install
   ```
2. Create a Supabase project (Free tier). Copy the URL, anon key, and service role key into `.env.local` (see `.env.local.example`).
3. Provision Upstash Redis (Free). Copy the REST URL + token.
4. Create a Sentry Next.js project. Copy the DSN.
5. Create a PostHog project. Copy the public key.
6. Push the schema:
   ```bash
   # Option 1: Supabase CLI
   supabase db push

   # Option 2: Paste supabase/migrations/0001_init.sql into the Supabase SQL editor.
   ```
   Enable the `pg_cron` extension in the Supabase Database → Extensions panel.
7. Run locally:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check without emit
- `npm run test` — Vitest suite (`lib/calc.ts` proportional math)

## Deployment

Push to GitHub, connect the repo in Vercel (Hobby), set the env vars above in Project → Settings → Environment Variables, and deploy. Preview deployments for PRs are on by default.

Set up a UptimeRobot ping to `https://snaptab.vercel.app/api/health` at a 5-minute interval.

## Custom domain

`snaptab.vercel.app` is the free launch domain. When you buy a real one, add it in Vercel → Project → Domains and set `NEXT_PUBLIC_APP_URL` to the new host.
