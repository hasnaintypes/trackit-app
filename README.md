# Trackit

A personal finance SaaS for bank account management, transaction tracking, hierarchical budgeting, AI-powered insights, and automated reporting.

<p>
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white" alt="tRPC" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/shadcn/ui-latest-000000?logo=shadcnui&logoColor=white" alt="shadcn/ui" />
</p>
<p>
  <img src="https://img.shields.io/badge/Google_Gemini-AI-8E75B2?logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Inngest-Jobs-6366F1?logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SW5uZ2VzdDwvdGl0bGU+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik00LjUgMEE0LjUgNC41IDAgMCAwIDAgNC41djE1QTQuNSA0LjUgMCAwIDAgNC41IDI0aDE1YTQuNSA0LjUgMCAwIDAgNC41LTQuNXYtMTVBNC41IDQuNSAwIDAgMCAxOS41IDBoLTE1Wk03IDZoMTBhMSAxIDAgMSAxIDAgMkg3YTEgMSAwIDAgMSAwLTJabTMgNWg3YTEgMSAwIDEgMSAwIDJoLTdhMSAxIDAgMSAxIDAtMlptLTMgNWgxMGExIDEgMCAxIDEgMCAySDdhMSAxIDAgMSAxIDAtMloiLz48L3N2Zz4K&logoColor=white" alt="Inngest" />
  <img src="https://img.shields.io/badge/Resend-Email-000000?logo=resend&logoColor=white" alt="Resend" />
  <img src="https://img.shields.io/badge/Upstash-Redis-00E9A3?logo=upstash&logoColor=black" alt="Upstash" />
  <img src="https://img.shields.io/badge/Better_Auth-Auth-FF6B35" alt="Better Auth" />
  <img src="https://img.shields.io/badge/Better_Stack-Logging-5046E5" alt="Better Stack" />
  <img src="https://img.shields.io/badge/ImageKit-Uploads-1B64F2" alt="ImageKit" />
</p>

---

## Tech Stack

| Layer           | Technology                                            |
| --------------- | ----------------------------------------------------- |
| Framework       | Next.js 15 (App Router, React Server Components)      |
| API             | tRPC 11 with React Query                              |
| Database        | PostgreSQL via Prisma 7                               |
| Auth            | Better Auth (email/password + email verification)     |
| AI              | Google Gemini (categorization, insights, receipt OCR) |
| Background Jobs | Inngest (event-driven + cron workers)                 |
| Email           | Resend + Handlebars templates                         |
| Rate Limiting   | Upstash Redis (with in-memory fallback)               |
| Image Uploads   | ImageKit                                              |
| Logging         | Better Stack (Logtail)                                |
| Styling         | Tailwind CSS + shadcn/ui                              |

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10
- **PostgreSQL** database (local or hosted, e.g. [Neon](https://neon.tech))

### 1. Clone and Install

```bash
git clone <repo-url>
cd trackit-saas
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials. See the [Environment Variables](#environment-variables) section for details.

### 3. Set Up Database

```bash
# Push schema to database (no migration history)
pnpm db:push

# Or create a migration
pnpm db:generate
```

### 4. Start Development Server

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

To run background jobs locally:

```bash
pnpm dev:inngest
```

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Start dev server (Turbo-enabled) |
| `pnpm build`        | Production build                 |
| `pnpm start`        | Start production server          |
| `pnpm check`        | Lint + typecheck                 |
| `pnpm lint`         | ESLint check                     |
| `pnpm lint:fix`     | ESLint auto-fix                  |
| `pnpm typecheck`    | TypeScript type check            |
| `pnpm format:check` | Prettier check                   |
| `pnpm format:write` | Prettier auto-fix                |
| `pnpm analyze`      | Bundle analysis                  |
| `pnpm db:generate`  | Create Prisma migration          |
| `pnpm db:migrate`   | Deploy migrations                |
| `pnpm db:push`      | Push schema without migration    |
| `pnpm db:studio`    | Open Prisma Studio               |

## Environment Variables

All environment variables are validated at startup via [T3 Env](https://env.t3.gg/) in `src/env.js`.

### Required

| Variable                                 | Description                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`                           | PostgreSQL connection string                                             |
| `BETTER_AUTH_SECRET`                     | Random secret for session signing (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_URL`                        | App URL (e.g. `http://localhost:3000`)                                   |
| `NEXT_PUBLIC_APP_URL`                    | Public app URL                                                           |
| `RESEND_API_KEY`                         | [Resend](https://resend.com) API key for transactional emails            |
| `EMAIL_FROM`                             | Sender email address                                                     |
| `GEMINI_API_KEY`                         | [Google AI Studio](https://aistudio.google.com) API key                  |
| `NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN`  | [Better Stack](https://betterstack.com) source token                     |
| `NEXT_PUBLIC_BETTER_STACK_INGESTING_URL` | Better Stack ingesting endpoint                                          |
| `NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL`     | Log level (`debug`, `info`, `warn`, `error`)                             |

### Optional

| Variable                            | Description                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| `UPSTASH_REDIS_REST_URL`            | [Upstash](https://upstash.com) Redis REST URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN`          | Upstash Redis REST token                                        |
| `INNGEST_EVENT_KEY`                 | [Inngest](https://inngest.com) event key for background jobs    |
| `INNGEST_SIGNING_KEY`               | Inngest signing key                                             |
| `IMAGEKIT_PRIVATE_KEY`              | [ImageKit](https://imagekit.io) private key                     |
| `IMAGEKIT_URL_ENDPOINT`             | ImageKit URL endpoint                                           |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`   | ImageKit public key                                             |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | ImageKit public URL endpoint                                    |

When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are not set, rate limiting falls back to in-memory — suitable for development but not production multi-instance deployments.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    (public)/             # Marketing pages (/, /about, /blog, etc.)
    (auth)/               # Sign-in, sign-up, reset password
    (features)/           # Protected app pages (RSC + client)
    api/                  # API routes (tRPC, auth, inngest)
  server/
    api/                  # tRPC router definitions + middleware
    services/             # Business logic layer
  components/
    ui/                   # shadcn/ui primitives
    charts/               # Recharts-based chart components
    pages/                # Page-specific components
    skeletons/            # Loading skeleton components
    common/               # Shared components
  hooks/                  # Custom React hooks
  lib/                    # Utilities (auth, email, logging, redis)
  store/                  # Zustand client state
  trpc/                   # tRPC client + server helpers
  types/                  # TypeScript type definitions
  validation/             # Zod schemas
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Database seed script
```

## Architecture

### Data Flow

```
Client Component → tRPC React Query Hook → tRPC Router → Service Layer → Prisma → PostgreSQL
```

- **tRPC routers** (`src/server/api/routers/`) define API endpoints
- **Services** (`src/server/services/`) contain business logic
- **RSC pages** prefetch data server-side via `api.*.prefetch()` and hydrate to client components via `<HydrateClient>`

### Authentication

Better Auth with email/password. Edge middleware provides cookie-based route heuristics; `protectedProcedure` in tRPC enforces actual auth.

### Background Jobs

Inngest handles event-driven and cron-scheduled work:

- Transaction processing triggers budget evaluation
- Budget threshold alerts via email
- Recurring transactions, weekly digests, monthly reports
- AI-powered spending insights

## Git Workflow

| Branch       | Purpose                                |
| ------------ | -------------------------------------- |
| `main`       | Production releases (semantic release) |
| `develop`    | Default development branch             |
| `feat/*`     | New features                           |
| `fix/*`      | Bug fixes                              |
| `refactor/*` | Code improvements                      |
| `hotfix/*`   | Urgent production fixes                |

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, etc.).

## License

Private. All rights reserved.
