# Contributing to Trackit

Thanks for your interest in contributing! This guide will help you get started.

## Prerequisites

- **Node.js** 20+
- **pnpm** 10.15+ (`corepack enable && corepack prepare pnpm@10.15.0 --activate`)
- **PostgreSQL** (or a Neon/Supabase database URL)
- **Git** with conventional commits knowledge

## Getting Started

```bash
# 1. Fork and clone
git clone https://github.com/hasnaintypes/trackit-app.git
cd trackit-app

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env
# Fill in required values (DATABASE_URL, BETTER_AUTH_SECRET, etc.)

# 4. Push schema to your database
pnpm db:push

# 5. Generate Prisma client
npx prisma generate --config ./prisma.config.ts

# 6. Start dev server
pnpm dev
```

## Development Workflow

### Branch Naming

Create branches from `develop` using these prefixes:

- `feat/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code improvements (no behavior change)
- `hotfix/` — Urgent production fixes
- `docs/` — Documentation only

Example: `feat/budget-forecasting`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add budget forecasting chart
fix(recurring): handle end-of-month clamping for Feb
refactor(router): split transaction router into sub-modules
docs: update API examples in README
```

**Scopes**: `schema`, `types`, `router`, `ui`, `recurring`, `budget`, `auth`, `email`, `ai`, `splits`, `settings`, `export`

### Code Style

- **TypeScript** strict mode with `noUncheckedIndexedAccess`
- **Prettier** formats on save (Tailwind class sorting enabled)
- **ESLint** with `consistent-type-imports` enforced
- **Pre-commit hook** auto-runs lint + format on staged files

Run checks before pushing:

```bash
pnpm check          # lint + typecheck
pnpm format:write   # auto-format
```

## Architecture Overview

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Marketing pages
│   ├── (auth)/             # Sign-in, sign-up
│   └── (features)/        # Protected app pages
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── forms/              # Multi-step form components
│   └── pages/              # Page-specific components
├── server/
│   ├── api/routers/        # tRPC routers (API layer)
│   └── services/           # Business logic
├── lib/
│   ├── inngest/            # Background jobs (Inngest)
│   ├── email/              # Email templates (Handlebars)
│   └── recurrence.ts       # Recurring transaction engine
├── validation/             # Zod schemas (shared client/server)
├── types/                  # TypeScript interfaces
└── constants/              # Static config and options
```

**Data flow**: Client → tRPC → Router → Service → Prisma → PostgreSQL

## Key Conventions

| Area           | Convention                                                               |
| -------------- | ------------------------------------------------------------------------ |
| UI components  | shadcn/ui (`npx shadcn@latest add <component>`)                          |
| Path aliases   | `@/*` → `src/*`, `@ui/*` → `src/components/ui/*`                         |
| Error handling | Use `TRPCError` in routers, not plain `Error`                            |
| Logging        | Use `createLogger()` from `src/lib/logging/`                             |
| Env vars       | Declare in `src/env.js` (T3 Env with Zod)                                |
| DB changes     | Run `npx prisma generate --config ./prisma.config.ts` after schema edits |

## Making a Pull Request

1. Create a feature branch from `develop`
2. Make your changes with clear, atomic commits
3. Run `pnpm check` to verify lint + types pass
4. Push your branch and open a PR against `develop`
5. Fill out the PR template (description, test plan, screenshots if UI)
6. Wait for review — maintainers will respond within a few days

### PR Requirements

- All CI checks must pass (lint, typecheck, format)
- No unrelated changes bundled in
- New features should update relevant types in `src/types/`
- Schema changes need `pnpm db:push` verification
- UI changes should include a screenshot or recording

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:

- Steps to reproduce
- Expected vs actual behavior
- Browser/OS info
- Screenshots if applicable

## Need Help?

- Open a [Discussion](https://github.com/hasnaintypes/trackit-app/discussions) for questions
- Check existing issues before creating new ones
- Tag `@hasnaintypes` for architecture questions
