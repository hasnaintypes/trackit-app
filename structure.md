# Structure Refactor Plan

> Current state analysis + proposed folder structure changes.
> Each change includes rationale, affected files, and import update count.

---

## Problems Identified

### P1. `src/lib/` is a catch-all (7 dirs + 5 loose files)

Server-only infra (`email/`, `inngest/`, `logging/`, `redis.ts`), client-only utils (`device-map.ts`, `formatters.ts`), shared utils (`shared/`), and tRPC helpers (`trpc/`) all live under the same `lib/` umbrella. There's no boundary enforcement — nothing stops a client component from importing server-only code.

### P2. `src/lib/server/utils.ts` is dead weight

This file (`renderTemplate`) does the same thing as `template-cache.ts` but with `process.cwd()` (the exact bug we just fixed). It's only imported by `src/lib/email/index.ts`. Should be deleted and replaced with the template-cache import.

### P3. `src/server/services/fileService.ts` is misplaced

A 5-line re-export barrel that forwards browser `File` API code from `lib/shared/file-parser.ts`. Lives in `server/services/` but is imported by client components (bulk-import steps). Misleading — anything in `server/services/` implies server-only.

### P4. `src/components/layout/` has only 2 files

`navbar.tsx` and `dashboard-header.tsx` sit alone in `layout/` while all other shared components live in `common/`. No meaningful distinction.

### P5. 3 overview-specific hooks pollute global `hooks/`

`use-overview-stats.ts`, `use-bar-chart-data.ts`, and `use-pie-chart-data.ts` are each imported by exactly one file (`overview/_client.tsx`). They inflate the global hooks directory and suggest broader reuse that doesn't exist.

### P6. `src/constants/` is underutilized

Only contains `prompt.ts` while actual constants are scattered:

- `src/lib/format-options.ts` — enum display maps (GenderOptions, CurrencyOptions, etc.)
- `src/lib/inngest/events.ts` — event name strings
- `src/lib/shared/avatar.ts` — default avatar URLs

### P7. `src/lib/trpc/` is disconnected from `src/trpc/`

Query invalidation helpers sit in `lib/trpc/invalidation.ts` while all other tRPC client code lives in `src/trpc/`. Split brain.

---

## What's Fine (No Changes Needed)

| Directory                   | Why it's fine                                 |
| --------------------------- | --------------------------------------------- |
| `src/app/`                  | Clean RSC + client split, proper route groups |
| `src/server/api/`           | Standard tRPC router composition              |
| `src/server/services/`      | Clear service layer (minus fileService)       |
| `src/types/`                | Domain-organized, broadly imported            |
| `src/validation/`           | Mirrors routers, shared by client + server    |
| `src/components/ui/`        | shadcn/ui convention, don't touch             |
| `src/components/pages/`     | Properly scoped to their page                 |
| `src/components/forms/`     | Domain-organized form containers              |
| `src/components/charts/`    | Clean chart primitives                        |
| `src/components/skeletons/` | Loading state components                      |
| `src/store/`                | Single Zustand store, appropriate             |
| `src/lib/auth/`             | Better Auth config, 2 files                   |
| `src/lib/email/`            | Email infra with templates                    |
| `src/lib/logging/`          | Logger wrapper                                |

---

## Proposed Structure

```
trackit-saas/src/
│
├── app/                                    # Next.js App Router
│   ├── (auth)/                             # Auth pages (sign-in, sign-up, etc.)
│   ├── (features)/                         # Protected app pages
│   │   ├── accounts/
│   │   │   ├── [id]/
│   │   │   │   ├── _client.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── budget/
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── overview/
│   │   │   ├── _hooks/                     # MOVED: co-located overview-only hooks
│   │   │   │   ├── use-bar-chart-data.ts
│   │   │   │   ├── use-overview-stats.ts
│   │   │   │   └── use-pie-chart-data.ts
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── transactions/
│   │   │   ├── _client.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (public)/                           # Marketing pages
│   │   ├── about/
│   │   ├── blog/
│   │   ├── changelog/
│   │   ├── contact/
│   │   ├── features/
│   │   ├── help/
│   │   ├── pricing/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                                # API routes
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── inngest/
│   │   └── trpc/
│   ├── error.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── onboarding/
│
├── components/                             # UI Components
│   ├── common/                             # Shared app-wide components
│   │   ├── avatars.tsx
│   │   ├── background-pattern.tsx
│   │   ├── color-picker.tsx
│   │   ├── dashboard-header.tsx            # MOVED from layout/
│   │   ├── delete-dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── footer.tsx
│   │   ├── header.tsx
│   │   ├── icon-picker.tsx
│   │   ├── index.ts
│   │   ├── info-menu.tsx
│   │   ├── logo.tsx
│   │   ├── navbar.tsx                      # MOVED from layout/
│   │   ├── notification-menu.tsx
│   │   ├── page-loader.tsx
│   │   ├── theme-switcher-button.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── transactions-table.tsx
│   │   ├── user-menu.tsx
│   │   └── waitlist-section.tsx
│   ├── charts/                             # Chart primitives
│   │   ├── area-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── pie-chart.tsx
│   │   └── radar-chart.tsx
│   ├── forms/                              # Form components by domain
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── categories/
│   │   └── transaction/
│   │       ├── steps/
│   │       └── transaction-form.tsx
│   ├── pages/                              # Page-specific components
│   │   ├── (protected)/
│   │   │   ├── accounts/
│   │   │   ├── budget/
│   │   │   ├── onboarding/
│   │   │   ├── overview/
│   │   │   ├── profile/
│   │   │   ├── settings/
│   │   │   └── transactions/
│   │   └── (public)/
│   │       ├── about/
│   │       ├── blog/
│   │       ├── features/
│   │       ├── help/
│   │       └── home/
│   ├── providers/
│   │   └── theme-provider.tsx
│   ├── skeletons/                          # Loading skeletons
│   │   ├── accounts-skeleton.tsx
│   │   ├── budget-skeleton.tsx
│   │   ├── chart-skeleton.tsx
│   │   ├── section-skeleton.tsx
│   │   ├── stats-skeleton.tsx
│   │   └── table-skeleton.tsx
│   └── ui/                                 # shadcn/ui primitives (untouched)
│
├── constants/                              # All application constants
│   ├── events.ts                           # MOVED from lib/inngest/events.ts
│   ├── formatting.ts                       # MOVED from lib/format-options.ts
│   └── prompt.ts                           # AI prompts (existing)
│
├── hooks/                                  # Globally reusable hooks ONLY
│   ├── use-accounts.ts
│   ├── use-auth.ts
│   ├── use-categories.ts
│   ├── use-debounce.ts
│   ├── use-formatter.ts
│   ├── use-mobile.ts
│   ├── use-sessions.ts
│   ├── use-settings.ts
│   ├── use-transactions.ts
│   └── use-user.ts
│
├── lib/                                    # Infrastructure & utilities
│   ├── auth/                               # Better Auth config
│   │   ├── client.ts
│   │   └── index.ts
│   ├── email/                              # Email sending
│   │   ├── index.ts
│   │   ├── template-cache.ts
│   │   └── templates/
│   │       ├── ai-insight.html
│   │       ├── budget-alert.html
│   │       ├── monthly-summary.html
│   │       ├── password-reset.html
│   │       ├── transaction-alert.html
│   │       ├── verification.html
│   │       └── weekly-digest.html
│   ├── inngest/                            # Background workers
│   │   ├── client.ts
│   │   └── functions/
│   │       ├── budget.ts
│   │       ├── generate-monthly-report.ts
│   │       ├── recurring.ts
│   │       ├── send-ai-insights.ts
│   │       ├── send-budget-alert-email.ts
│   │       └── send-weekly-digest.ts
│   ├── logging/                            # Logger
│   │   └── index.ts
│   ├── shared/                             # Shared utilities (client + server safe)
│   │   ├── ai-utils.ts
│   │   ├── avatar.ts
│   │   ├── decimal.ts
│   │   ├── error.ts
│   │   ├── file-parser.ts
│   │   └── imagekit.ts
│   ├── device-map.ts                       # UA parsing utility
│   ├── formatters.ts                       # Currency/date formatting functions
│   ├── recurrence.ts                       # Recurrence calculation
│   ├── redis.ts                            # Upstash Redis client
│   └── utils.ts                            # cn() + misc utilities
│
├── server/                                 # Server-only code
│   ├── api/
│   │   ├── rateLimit.ts
│   │   ├── root.ts
│   │   ├── routers/
│   │   │   ├── accountRouter.ts
│   │   │   ├── aiRouter.ts
│   │   │   ├── budgetRouter.ts
│   │   │   ├── categoryRouter.ts
│   │   │   ├── notificationRouter.ts
│   │   │   ├── overviewRouter.ts
│   │   │   ├── reportRouter.ts
│   │   │   ├── sessionRouter.ts
│   │   │   ├── settingsRouter.ts
│   │   │   ├── transactionRouter.ts
│   │   │   └── userRouter.ts
│   │   └── trpc.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── budgetService.ts
│   │   ├── notificationService.ts
│   │   └── reportService.ts
│   └── db.ts
│
├── store/
│   └── userStore.ts
│
├── styles/
│   └── globals.css
│
├── trpc/                                   # tRPC client setup
│   ├── invalidation.ts                     # MOVED from lib/trpc/invalidation.ts
│   ├── query-client.ts
│   ├── react.tsx
│   └── server.ts
│
├── types/                                  # TypeScript type definitions
│   ├── account.ts
│   ├── ai.ts
│   ├── auth.ts
│   ├── budget.ts
│   ├── bulk-import.ts
│   ├── category.ts
│   ├── file.ts
│   ├── google-generative-ai.d.ts
│   ├── index.ts
│   ├── inngest-next.d.ts
│   ├── recurrence.ts
│   ├── report.ts
│   ├── session.ts
│   ├── site.ts
│   ├── transaction.ts
│   └── user.ts
│
├── validation/                             # Zod schemas (shared client + server)
│   ├── account.ts
│   ├── ai.ts
│   ├── auth.ts
│   ├── budget.ts
│   ├── category.ts
│   ├── notification.ts
│   ├── report.ts
│   ├── session.ts
│   ├── settings.ts
│   ├── transaction.ts
│   └── user.ts
│
└── env.js
```

---

## Change List

### 1. Delete `src/server/services/fileService.ts`

**Why:** 5-line re-export barrel that masks client-side code as a server service. Client components already know where `file-parser.ts` lives.

**Action:** Delete file. Update 2 imports in bulk-import steps:

```
- import { parseCSV } from "@/server/services/fileService"
+ import { parseCSV } from "@/lib/shared/file-parser"
```

**Files changed:** 3 (1 deleted, 2 import updates)

---

### 2. Delete `src/lib/server/utils.ts` (and `src/lib/server/` dir)

**Why:** `renderTemplate()` duplicates `template-cache.ts` functionality and still uses `process.cwd()` (the bug we just fixed in 6.1). Only imported by `src/lib/email/index.ts`.

**Action:** Delete file and directory. Update `email/index.ts` to use `template-cache.ts` instead:

```
- import { renderTemplate } from "@/lib/server/utils"
+ import { getTemplate } from "./template-cache"
```

**Files changed:** 2 (1 deleted, 1 import update)

---

### 3. Merge `src/components/layout/` into `src/components/common/`

**Why:** Only 2 files (`navbar.tsx`, `dashboard-header.tsx`). No architectural reason to keep them separate from `common/`.

**Action:** Move both files, delete `layout/` dir.

**Files changed:** 2 moved + all files importing from `@component/layout/*` updated to `@component/common/*`

---

### 4. Co-locate overview hooks in `src/app/(features)/overview/_hooks/`

**Why:** `use-overview-stats.ts`, `use-bar-chart-data.ts`, `use-pie-chart-data.ts` are each used by exactly 1 file (`overview/_client.tsx`). They aren't reusable hooks — they're implementation details of the overview page.

The `_` prefix follows Next.js convention for private folders (ignored by the router).

**Action:** Move 3 files. Update imports in `_client.tsx` and the 2 extracted card components.

**Old imports:**

```ts
import { useOverviewStats } from "@/hooks/use-overview-stats";
import { useBarChartData } from "@/hooks/use-bar-chart-data";
import { usePieChartData } from "@/hooks/use-pie-chart-data";
```

**New imports:**

```ts
import { useOverviewStats } from "./_hooks/use-overview-stats";
import { useBarChartData } from "./_hooks/use-bar-chart-data";
import { usePieChartData } from "./_hooks/use-pie-chart-data";
```

**Files changed:** 3 moved + 3 import updates

---

### 5. Move `src/lib/format-options.ts` to `src/constants/formatting.ts`

**Why:** This file is 100% constants (option maps) and display formatters for Prisma enums. It's configuration data, not library infrastructure.

**Action:** Move file, update all imports.

```
- import { CurrencyOptions } from "@/lib/format-options"
+ import { CurrencyOptions } from "@/constants/formatting"
```

**Files changed:** 1 moved + ~8 import updates (settings, profile, onboarding components)

---

### 6. Move `src/lib/inngest/events.ts` to `src/constants/events.ts`

**Why:** Event name constants are referenced by both the Inngest client config and worker functions. They're string constants, not infrastructure.

**Action:** Move file, update all imports.

```
- import { EVENTS } from "@/lib/inngest/events"
+ import { EVENTS } from "@/constants/events"
```

**Files changed:** 1 moved + ~8 import updates (inngest client + all worker functions)

---

### 7. Move `src/lib/trpc/invalidation.ts` to `src/trpc/invalidation.ts`

**Why:** All other tRPC client code lives in `src/trpc/`. The invalidation helpers use `api.useUtils()` which is a client-side React hook — it belongs with the rest of the tRPC client layer, not in `lib/`.

**Action:** Move file, delete `src/lib/trpc/` dir, update all imports.

```
- import { invalidateTransactions } from "@/lib/trpc/invalidation"
+ import { invalidateTransactions } from "@/trpc/invalidation"
```

**Files changed:** 1 moved + ~12 import updates (hooks + components)

---

## Summary

| #   | Change                          | Files Touched | Risk |
| --- | ------------------------------- | ------------- | ---- |
| 1   | Delete `fileService.ts`         | 3             | None |
| 2   | Delete `lib/server/utils.ts`    | 2             | None |
| 3   | Merge `layout/` → `common/`     | ~6            | Low  |
| 4   | Co-locate overview hooks        | 6             | Low  |
| 5   | `format-options` → `constants/` | ~9            | Low  |
| 6   | `events.ts` → `constants/`      | ~9            | Low  |
| 7   | `invalidation.ts` → `trpc/`     | ~13           | Low  |

**Total: ~48 file changes (7 moves/deletes + ~41 import updates)**

All changes are mechanical import rewrites — zero logic changes, zero risk of runtime bugs. Every change can be verified with `pnpm typecheck`.

---

## What This Does NOT Change (and why)

| Item                            | Reason to keep                                                                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/` as a directory       | Still the right home for infra (auth, email, inngest, logging, redis). Removing it entirely would require a new convention with no clear benefit. |
| `src/lib/shared/` location      | Deeply imported (~15 files). Moving to `src/shared/` gains nothing — the `@/lib/shared/*` path alias is clear enough.                             |
| `src/types/` centralization     | Types are broadly imported across client + server. Co-locating them with individual modules would scatter them and lose discoverability.          |
| `src/validation/`               | Perfect as-is. Mirrors routers, shared by both client forms and server input validation.                                                          |
| `src/lib/formatters.ts`         | Contains actual formatting logic (functions), not constants. Stays in `lib/`.                                                                     |
| `src/lib/recurrence.ts`         | Business logic for date calculations, not a constant. Stays in `lib/`.                                                                            |
| `src/lib/device-map.ts`         | Utility function, not a constant. Stays in `lib/`.                                                                                                |
| `src/components/pages/` nesting | The `(protected)/(public)` mirrors `app/` route groups. Deep but intentional.                                                                     |
| `src/hooks/use-formatter.ts`    | Used by 3+ files across accounts and settings — genuinely shared.                                                                                 |
