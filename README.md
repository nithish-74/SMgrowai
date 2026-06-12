# SMgrowai

SMgrowai is your AI Chief Marketing Officer — researches, creates, and posts content to Instagram and Twitter automatically, so you can focus on building instead of marketing.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 App Router |
| API | tRPC v11 + TanStack React Query |
| Auth | Auth.js v5 (Google, Instagram, X/Twitter OAuth) |
| Database | Prisma + Neon Postgres |
| UI | Tailwind CSS + ShadCN UI |
| Jobs | Bull MQ + Upstash Redis |
| AI | Anthropic Claude API |

## Project structure

```
app/                 # Pages and API routes
server/
  routers/           # tRPC routers
  workers/           # Bull MQ workers
  queues/            # Queue definitions
  prompts/           # LLM system prompts
  cmo/               # AI CMO logic (strategy, analysis)
lib/                 # Shared utilities (Prisma, Redis, tRPC clients)
prisma/              # Schema and migrations
```

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in `.env.local` (see `.env.example` for all keys).

3. Generate `AUTH_SECRET`:

   ```bash
   npx auth secret
   ```

4. Install dependencies and generate Prisma client:

   ```bash
   npm install
   npm run db:generate
   npm run db:push
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

6. Install Playwright Chromium (required for scrape worker):

   ```bash
   npx playwright install chromium
   ```

7. In a separate terminal, run Bull MQ workers (requires Redis env vars):

   ```bash
   npm run worker
   ```

   For development with auto-reload:

   ```bash
   npm run dev:worker
   ```

## OAuth providers

- **Google**: [Google Cloud Console](https://console.cloud.google.com/) — OAuth 2.0 app; set redirect URI to `{AUTH_URL}/api/auth/callback/google`.
- **Instagram**: [Meta for Developers](https://developers.facebook.com/) — Basic Display or Instagram API product; set redirect URI to `{AUTH_URL}/api/auth/callback/instagram`.
- **X (Twitter)**: [X Developer Portal](https://developer.x.com/) — OAuth 2.0 app; callback `{AUTH_URL}/api/auth/callback/twitter`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run worker` | Start Bull MQ workers |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push Prisma schema directly to database |
| `npm run db:migrate` | Create and apply Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |

