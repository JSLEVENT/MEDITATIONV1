# Serenity AI V1

Full-stack AI-guided meditation platform with web, API, and mobile apps.

## Stack
- Web: Next.js 14 + Tailwind
- API: Express + TypeScript
- DB/Auth: Supabase + Drizzle ORM
- AI: Anthropic Claude
- TTS: Deepgram
- Audio: FFmpeg mixing + Cloudflare R2
- Payments: Stripe
- Mobile: Expo (React Native)

## Monorepo Structure
- `apps/web` — Next.js web app
- `apps/api` — Express API
- `apps/mobile` — Expo mobile app
- `packages/shared` — shared types + auth helpers
- `packages/db` — Drizzle schema + migrations

## Local Setup
1. Install dependencies:
```bash
corepack prepare pnpm@9.12.0 --activate
pnpm install
```

2. Configure env files:
- `.env`
- `apps/api/.env`
- `apps/web/.env`
- `apps/mobile/.env`

Start from the `.env.example` files.
Set `ADMIN_EMAILS` (comma-separated) to enable admin-only settings like default TTS voice.

3. Database migrations + seed:
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

4. Apply RLS policies:
- Run SQL in `packages/db/src/rls.sql` inside Supabase.

5. Upload background audio stems to R2:
- `stems/528hz.mp3`
- `stems/432hz.mp3`
- `stems/rain.mp3`
- `stems/ocean.mp3`
- `stems/forest.mp3`

6. Run dev servers:
```bash
pnpm api:dev
pnpm web:dev
pnpm mobile:start
```

## Scripts
- `pnpm api:dev` — start API dev server
- `pnpm web:dev` — start Next.js dev server
- `pnpm mobile:start` — start Expo
- `pnpm db:generate` — Drizzle migrations
- `pnpm db:migrate` — apply migrations
- `pnpm db:seed` — seed prompt templates + stems

## Deployment Notes
- Web: Vercel
- API: Railway (Dockerfile included)
- DB/Auth: Supabase
- Audio: Cloudflare R2
- Payments: Stripe webhooks

## Stripe Webhook
Set webhook to:
```
POST https://<api-domain>/webhooks/stripe
```
Add `STRIPE_WEBHOOK_SECRET` to API env.

## Mobile
Expo config is in `apps/mobile/app.config.js` and uses:
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_URL
```

## Support
Serenity AI is a wellness tool and not a substitute for professional mental health treatment.
