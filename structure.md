# Folder Structure

> Current folder structure after refactoring. All changes verified with `pnpm typecheck && pnpm lint`.

---

## Import Aliases (`tsconfig.json`)

| Alias                 | Maps To                                    | Usage                                  |
| --------------------- | ------------------------------------------ | -------------------------------------- |
| `@/*`                 | `./src/*`                                  | General fallback                       |
| `@ui/*`               | `./src/components/ui/*`                    | shadcn/ui primitives (~106 files)      |
| `@common/*`           | `./src/components/common/*`                | Shared app-wide components (~21 files) |
| `@shared/*`           | `./src/lib/shared/*`                       | Shared utilities (~17 files)           |
| `@skeletons/*`        | `./src/components/skeletons/*`             | Loading skeletons (~9 files)           |
| `@component/home`     | `./src/components/pages/(public)/home`     | Home page barrel                       |
| `@component/about`    | `./src/components/pages/(public)/about`    | About page barrel                      |
| `@component/features` | `./src/components/pages/(public)/features` | Features page barrel                   |
| `@component/blog`     | `./src/components/pages/(public)/blog`     | Blog page barrel                       |
| `@component/help`     | `./src/components/pages/(public)/help`     | Help page barrel                       |
| `@content/*`          | `./src/content/*`                          | Site content                           |
| `@content/site`       | `./src/content/site`                       | Site config barrel                     |
| `@types/*`            | `./src/types/*`                            | Type definitions                       |
| `@types/site`         | `./src/types/site`                         | Site types barrel                      |

---

## Directory Tree

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
│   │   │   ├── _hooks/                     # Co-located overview-only hooks
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
│   │   ├── branding/                       # Visual identity
│   │   │   ├── avatars.tsx
│   │   │   ├── background-pattern.tsx
│   │   │   └── logo.tsx
│   │   ├── layout/                         # App shell & navigation
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── notification-menu.tsx
│   │   │   └── user-menu.tsx
│   │   ├── pickers/                        # Form input pickers
│   │   │   ├── color-picker.tsx
│   │   │   └── icon-picker.tsx
│   │   ├── theme/                          # Theme switching
│   │   │   ├── theme-switcher-button.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── delete-dialog.tsx
│   │   ├── empty-state.tsx
│   │   ├── index.ts
│   │   ├── page-loader.tsx
│   │   ├── transactions-table.tsx
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
│   ├── events.ts                           # Inngest event names + dispatch helpers
│   ├── formatting.ts                       # Enum display maps (Gender, Currency, etc.)
│   └── prompt.ts                           # AI prompts
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
│   ├── invalidation.ts                     # Query invalidation helpers
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

## Changes Applied

| #   | Change                                                                                                                          | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Deleted `src/server/services/fileService.ts` (dead re-export barrel)                                                            | Done   |
| 2   | Deleted `src/lib/server/utils.ts` + dir (buggy `renderTemplate` duplicate). Migrated `auth/index.ts` to use `sendTemplateEmail` | Done   |
| 3   | Merged `src/components/layout/` (2 files) into `src/components/common/`                                                         | Done   |
| 4   | Co-located 3 overview hooks into `src/app/(features)/overview/_hooks/`                                                          | Done   |
| 5   | Moved `src/lib/format-options.ts` → `src/constants/formatting.ts`                                                               | Done   |
| 6   | Moved `src/lib/inngest/events.ts` → `src/constants/events.ts`                                                                   | Done   |
| 7   | Moved `src/lib/trpc/invalidation.ts` → `src/trpc/invalidation.ts`                                                               | Done   |
| 8   | Deleted dead `src/components/common/info-menu.tsx`                                                                              | Done   |
| 9   | Added `@ui/*`, `@common/*`, `@shared/*`, `@skeletons/*` aliases                                                                 | Done   |
| 10  | Removed generic `@component/*` and `@component/common` aliases                                                                  | Done   |
| 11  | Migrated ~150 files to use new import aliases                                                                                   | Done   |
| 12  | Organized `common/` into subfolders: `layout/`, `branding/`, `pickers/`, `theme/`                                               | Done   |
