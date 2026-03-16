# Trackit

A personal finance SaaS application for bank account management, transaction tracking, hierarchical budgeting, AI-powered insights, and automated reporting.

Built with the T3 stack: **Next.js 15** (App Router) + **tRPC 11** + **Prisma 7** + **TypeScript**.

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
| Testing         | Vitest (unit) + Playwright (E2E)                      |

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

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `pnpm dev`             | Start dev server (Turbo-enabled) |
| `pnpm build`           | Production build                 |
| `pnpm start`           | Start production server          |
| `pnpm check`           | Lint + typecheck                 |
| `pnpm lint`            | ESLint check                     |
| `pnpm lint:fix`        | ESLint auto-fix                  |
| `pnpm typecheck`       | TypeScript type check            |
| `pnpm format:check`    | Prettier check                   |
| `pnpm format:write`    | Prettier auto-fix                |
| `pnpm test`            | Run unit tests                   |
| `pnpm test:watch`      | Unit tests in watch mode         |
| `pnpm test:ui`         | Unit tests with UI               |
| `pnpm test:e2e`        | Run E2E tests                    |
| `pnpm test:e2e:headed` | E2E tests in headed browser      |
| `pnpm db:generate`     | Create Prisma migration          |
| `pnpm db:migrate`      | Deploy migrations                |
| `pnpm db:push`         | Push schema without migration    |
| `pnpm db:studio`       | Open Prisma Studio               |

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
| `PRISMA_ACCELERATE_URL`             | Prisma Accelerate URL (if using)                                |

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
test/
  unit/                   # Vitest unit tests
  e2e/                    # Playwright E2E tests
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
