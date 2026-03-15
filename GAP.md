# GAP.md - Trackit SaaS Optimization Roadmap

> Comprehensive gap analysis across server, frontend, hooks, stores, and architecture.
> Organized into incremental phases — each phase is independently shippable.

---

## Phase 1: Quick Wins (Low Effort, High Impact)

### 1.1 Reduce Transaction Batch Sizes

**Files:** `overview/page.tsx`, `analytics/page.tsx`, `budget/page.tsx`

- All protected pages load `limit: 500` transactions when only displaying 10-20 items
- Change to `limit: 100-150` for overview/analytics; use proper server-side pagination for transaction list
- **Impact:** 3-5x bandwidth reduction, faster initial load

### 1.2 Move Constants Outside Components

**Files:** Multiple pages and components

| File                     | Constant                                                 | Issue                                                                            |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `accounts/page.tsx`      | `ICONS.find()` in AccountCard                            | Linear search O(n) per render → pre-compute `ICON_MAP` as `Record<string, Icon>` |
| `account-form.tsx`       | `ACCOUNT_TYPES`, `CURRENCIES`                            | Recreated every render → move to module level                                    |
| `transactions-table.tsx` | `methodMap` (line ~406)                                  | Object in cell renderer → move to constant                                       |
| `reports/page.tsx`       | `getStatusBadge`, `getTypeLabel`, `getReportDescription` | Functions inside component → move outside                                        |
| `bar-chart.tsx`          | `formatAxisValue`                                        | Already outside (good)                                                           |

### 1.3 Wrap Layout Components with React.memo

**Files:** `navbar.tsx`, `dashboard-header.tsx`

- These re-render on every route change despite no prop changes
- Wrap exports with `React.memo()`
- **Impact:** Prevents unnecessary re-renders during navigation

### 1.4 Use `useFormatter` Hook Consistently

**Files:** `accounts/page.tsx` (line ~270), `accounts/[id]/page.tsx` (line ~46)

- Both create `new Intl.NumberFormat()` inline on every render
- Replace with existing `useFormatter()` hook for consistency and memoization

### 1.5 Combine Related useState Calls

**Files:** `accounts/page.tsx`, `accounts/[id]/page.tsx`, `profile/page.tsx`

- Accounts page has 5+ scattered `useState` calls for modal/dialog state
- Combine into a single `uiState` object to batch updates and reduce re-renders:
  ```ts
  const [uiState, setUiState] = useState({
    modal: null as "create" | "edit" | "delete" | null,
    selectedId: null as string | null,
    showFilters: false,
    layoutMode: "grid" as "grid" | "list",
  });
  ```

---

## Phase 2: Decimal & Data Layer Standardization

### 2.1 Create Unified Decimal Utility

**New file:** `src/lib/shared/decimal.ts`

- Found **45+ inconsistent Decimal conversions** across the codebase:
  - `.toNumber()` — 15 occurrences
  - `Number()` — 25 occurrences
  - `toString()` — 5+ occurrences
  - Defensive ternary pattern — 10+ occurrences (especially in budget page, AI service)
- Create a single `toNum(value: unknown): number` helper and use it everywhere
- **Files affected:** `transactionRouter.ts`, `accountRouter.ts`, `overviewRouter.ts`, `budgetService.ts`, `reportService.ts`, `aiService.ts`, `budget/page.tsx`, all Inngest workers
- **Impact:** Eliminates 40+ lines of defensive code, prevents precision bugs

### 2.2 Optimize Prisma Selects

**Files:** All routers in `src/server/api/routers/`

- Category list returns all fields when only ID/name needed
- Transaction list fetches full `recurringRule` data for every row
- Add `select` clauses to return only needed fields:
  ```ts
  // categoryRouter.ts
  select: { id: true, name: true, color: true, children: { select: { id: true, name: true } } }
  ```
- **Impact:** 35-50% payload reduction, 20-30% API response improvement

### 2.3 Extract AI Service Boilerplate

**File:** `src/server/services/aiService.ts` (~827 LOC)

- Repeated Decimal conversion pattern (lines 77-81, 154-160, 169-173, 227-234, 327-329, 337-341)
- Repeated JSON extraction regex (lines 108-110, 196-199, 287-290, 365-367)
- Extract both into shared utilities
- **Impact:** Reduces aiService by ~100 LOC, easier maintenance

### 2.4 Standardize Query Invalidation

**New file:** `src/lib/trpc/invalidation.ts`

- Create centralized invalidation map so all mutations invalidate related queries consistently:
  ```ts
  export const invalidate = {
    transaction: (utils) => {
      utils.transaction.list.invalidate();
      utils.account.list.invalidate();
      utils.overview.invalidate();
    },
    account: (utils) => {
      utils.account.list.invalidate();
      utils.overview.invalidate();
    },
    budget: (utils) => {
      utils.budget.all.invalidate();
    },
  };
  ```
- **Impact:** Prevents stale data, consistent cache behavior

---

## Phase 3: Component Architecture & Memoization

### 3.1 Extract Nested Components

**Priority extractions:**

| Current Location                            | Extract To                                                   | Reason                                                  |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `accounts/page.tsx` AccountCard (line ~266) | `src/components/pages/(protected)/accounts/account-card.tsx` | Cannot memo while nested; recreated every parent render |
| `overview/page.tsx` spending section        | Separate component                                           | Giant 147-line useMemo could be split                   |

- Wrap extracted components with `React.memo`
- **Impact:** Eliminates re-renders of unchanged cards when search/layout changes

### 3.2 Split Overview Page Mega-Memo

**File:** `overview/page.tsx` (lines 106-253)

- Single 147-line `useMemo` computes stats + bar chart + pie chart simultaneously
- Split into 3 isolated `useMemo` hooks with independent dependency arrays
- When `barRange` changes, only bar chart data recalculates (not stats or pie chart)
- **Impact:** Granular memoization, prevents unnecessary recalculations

### 3.3 Add React.memo to Presentational Components

Components that should be wrapped:

- `StatsCards` — props change infrequently
- `BudgetCard` — pure presentational
- `TransactionTypeBadge` — pure presentational
- Chart components (`BarChart`, `PieChart`, `AreaChart`)
- `AccountCard` (after extraction)

### 3.4 Add useCallback to Event Handlers

**Files:** `transactions/page.tsx`, `accounts/page.tsx`, `budget/page.tsx`

- `handleDeleteTransactions`, `handleEditTransaction`, modal open/close handlers — all recreated every render
- Wrap with `useCallback` so memoized children don't re-render
- **Impact:** 40-60% reduction in unnecessary child re-renders

### 3.5 Split Transaction Form (1,331 LOC)

**File:** `src/components/forms/transaction/transaction-form.tsx`

- Massive single-file component handling category selection, recurring rules, receipt upload, all validation
- Split into sub-components:
  ```
  forms/transaction/
    transaction-form.tsx        (~300 lines) - wrapper + orchestration
    steps/basic-info-step.tsx   (~200 lines) - amount, date, description
    steps/category-step.tsx     (~300 lines) - category selector
    steps/recurring-step.tsx    (~250 lines) - recurrence config
    steps/receipt-step.tsx      (~200 lines) - receipt upload
  ```
- Extract file upload logic to `useReceiptUpload` custom hook
- Combine `form.watch("isRecurring")` + `form.watch("recurrence")` into single subscription
- **Impact:** Smaller bundles per step, easier testing, allows lazy loading

---

## Phase 4: Performance — Virtualization, Code Splitting, Suspense

### 4.1 Add Virtual Scrolling to TransactionsTable

**File:** `src/components/common/transactions-table.tsx`

**Package:** `@tanstack/react-virtual`

- Table renders all filtered rows in the DOM even with pagination
- For users with 1000+ transactions, this causes significant DOM bloat
- Integrate virtualizer with existing TanStack Table:
  ```ts
  import { useVirtualizer } from "@tanstack/react-virtual";
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });
  ```
- **Impact:** DOM nodes from 500+ to ~20, 70% render improvement, 60fps scroll

### 4.2 Lazy Load Heavy Components

**Files:** Multiple pages

- Transaction form, bulk import dialog, chart components, profile/settings sections — all loaded upfront
- Use `next/dynamic` for modals and heavy sections:
  ```ts
  const TransactionForm = dynamic(
    () => import("@/components/forms/transaction/transaction-form"),
    { ssr: false, loading: () => <Skeleton className="h-64 w-full" /> }
  );
  ```
- Apply to: TransactionForm, BulkImportDialog, profile sections, settings sections, chart components
- **Impact:** 20-30% initial JS bundle reduction, 150-300ms LCP improvement

### 4.3 Add Suspense Boundaries

**Files:** All protected pages

- No Suspense components used — entire page waits for all data
- Wrap independent sections in Suspense for progressive rendering:
  ```tsx
  <Suspense fallback={<StatsSkeleton />}>
    <StatsSection />
  </Suspense>
  <Suspense fallback={<ChartSkeleton />}>
    <ChartsSection />
  </Suspense>
  ```
- **Impact:** Better perceived performance, 200-400ms improvement in time-to-interactive

### 4.4 Add Bundle Analyzer

**Package:** `@next/bundle-analyzer`

- No visibility into bundle composition currently
- Add analyzer to `next.config.js`:
  ```ts
  import withBundleAnalyzer from "@next/bundle-analyzer";
  const withAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
  });
  ```
- Run with `ANALYZE=true pnpm build` to identify largest chunks
- **Impact:** Data-driven optimization decisions

### 4.5 Prefetch on Navigation Intent

- No data prefetching when user hovers navigation links
- Add prefetch on hover/focus for anticipated routes:
  ```ts
  onMouseEnter={() => utils.transaction.list.prefetch({ limit: 50 })}
  ```
- **Impact:** Faster perceived navigation

---

## Phase 5: Backend & Service Layer Optimization

### 5.1 Move In-Memory Aggregations to Database

**Files:** `overviewRouter.ts`, `reportService.ts`

- `balanceOverview` (overviewRouter line ~157) loads ALL transactions for 24 months into memory, groups in JS
- `reportService` runs 5 parallel queries that could be 1-2 combined queries
- Replace with Prisma `groupBy` or raw SQL aggregation:
  ```ts
  const monthly = await ctx.db.transaction.groupBy({
    by: ["date"],
    _sum: { amount: true },
    where: { userId, date: { gte: startDate } },
  });
  ```
- **Impact:** O(1) memory instead of O(n), prevents OOM with large datasets

### 5.2 Fix N+1 Query Patterns

| Location                                         | Issue                                      | Fix                                         |
| ------------------------------------------------ | ------------------------------------------ | ------------------------------------------- |
| `categoryRouter.ts` delete (lines 133-146)       | Recursive queries per child level          | Single `findMany` + batch `deleteMany`      |
| `budgetService.ts` evaluateBudgets (lines 19-52) | Queries budgets per category in loop       | Pre-load all user budgets, filter in-memory |
| `aiService.ts`                                   | Multiple separate queries for related data | Combine with `include` or batch             |

### 5.3 Add Transaction Wrapping for Critical Operations

**Files:** `notificationService.ts`, `budgetService.ts`

- `notificationService.createNotification` — notification + email queue not atomic
- `budgetService.checkThresholds` — update + event emit not atomic
- Wrap in `prisma.$transaction()` to prevent partial updates

### 5.4 Remove Unnecessary Transaction Wrapping

**File:** `accountRouter.ts` (lines 110-115, 175-180)

- `$transaction` wrapping single `updateMany` call — overhead without benefit
- Replace with direct `await prisma.bankAccount.updateMany(...)`

### 5.5 Extract Rate Limit Middleware for AI Router

**File:** `aiRouter.ts`

- Same rate limit check duplicated 6 times (lines 13-18, 26-31, 37-42, 47-52, 61-66, 78-83)
- Create reusable middleware:
  ```ts
  const aiRateLimitedProcedure = protectedProcedure.use(
    async ({ ctx, next }) => {
      checkRateLimit(ctx.user.id, "ai", AI_MAX_REQUESTS);
      return next();
    },
  );
  ```

### 5.6 Fix Error Handling Inconsistencies

| File                         | Issue                                                    |
| ---------------------------- | -------------------------------------------------------- |
| `userRouter.ts` line 187     | Throws `Error` instead of `TRPCError`                    |
| `aiService.ts` lines 396-410 | Returns empty `{ results: [] }` instead of throwing      |
| `reportService.ts` line 125  | Throws generic `Error` instead of `TRPCError`            |
| `accountRouter.ts`           | No cascade delete validation — could orphan transactions |

### 5.7 Fix Timing Middleware Production Leak

**File:** `src/server/api/trpc.ts` (lines 217-225)

- `console.log` / `timingLogger.info()` runs in all environments including production
- Random 100-500ms delay blocks every tRPC call in development
- Guard with `process.env.NODE_ENV !== 'production'`

---

## Phase 6: Inngest Workers & Email Templates

### 6.1 Fix File System I/O in Workers

**Files:** `budget.ts`, `send-budget-alert-email.ts`, `generate-monthly-report.ts`

- All read templates from disk via `process.cwd()` — fails in Docker/serverless
- Options:
  - Inline templates as string constants
  - Use environment variables for template paths
  - Pre-compile templates at build time
- **Impact:** Prevents deployment failures

### 6.2 Deduplicate Decimal Handling in Workers

- Same defensive Decimal conversion in every worker
- After Phase 2.1's `toNum()` utility, import it in all workers

### 6.3 Add Retry Mechanism for AI Rate Limits

**File:** `aiService.ts`

- Retries on parse errors but not API rate limits
- Add exponential backoff for `429 Too Many Requests`

---

## Phase 7: Advanced — RSC Migration & Streaming

### 7.1 Convert Pages to Server Components Where Possible

**Files:** All 19 protected pages currently have `"use client"`

- Many pages could be Server Components that fetch data directly and pass to client children
- Pattern:
  ```tsx
  // page.tsx (Server Component — no "use client")
  import { api, HydrateClient } from "@/trpc/server";
  export default async function OverviewPage() {
    void api.transaction.list.prefetch({ limit: 100 });
    return (
      <HydrateClient>
        <OverviewPageClient />
      </HydrateClient>
    );
  }
  ```
- Start with simpler pages (reports, settings, profile) then move to complex ones
- **Impact:** 15-25% JS payload reduction, faster FCP

### 7.2 Add Streaming with Parallel Data Loading

- Use React Server Components + Suspense for streaming
- Independent sections load and render as data arrives
- **Impact:** Better perceived performance, especially on slower connections

### 7.3 Redis-Backed Rate Limiting

**File:** `src/server/api/rateLimit.ts`

- Current in-memory rate limiting fails in distributed deployments and across server restarts
- Migrate to Redis (via Upstash or ioredis) for production
- Add `RateLimit-Remaining` and `RateLimit-Reset` response headers

### 7.4 Additional TypeScript Strictness

**File:** `tsconfig.json`

Add:

```json
{
  "noFallthroughCasesInSwitch": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

- **Impact:** Catches 5-10% more potential bugs at compile time

---

## Summary: Estimated Impact by Phase

| Phase                    | Effort      | Bundle Impact | Performance Impact          | Risk     |
| ------------------------ | ----------- | ------------- | --------------------------- | -------- |
| **Phase 1: Quick Wins**  | 2-3 hours   | -5%           | +15% render perf            | Very Low |
| **Phase 2: Data Layer**  | 4-5 hours   | -2%           | +20-30% API speed           | Low      |
| **Phase 3: Components**  | 6-8 hours   | -5%           | +40-60% re-render reduction | Low      |
| **Phase 4: Performance** | 8-12 hours  | -20-30%       | +200-400ms LCP/TTI          | Medium   |
| **Phase 5: Backend**     | 6-8 hours   | None          | +30-50% query perf          | Medium   |
| **Phase 6: Workers**     | 3-4 hours   | None          | Deployment reliability      | Low      |
| **Phase 7: Advanced**    | 10-15 hours | -15-25% JS    | +200-400ms FCP              | Higher   |

---

## Key Packages to Add

| Package                       | Purpose                            | Phase   |
| ----------------------------- | ---------------------------------- | ------- |
| `@tanstack/react-virtual`     | Virtual scrolling for tables/lists | Phase 4 |
| `@next/bundle-analyzer`       | Bundle size visibility             | Phase 4 |
| `superjson` (already present) | Decimal serialization (use more)   | Phase 2 |

## Key Packages Already In Use (Leverage Better)

| Package                            | Current Usage        | Better Usage                                            |
| ---------------------------------- | -------------------- | ------------------------------------------------------- |
| `react-hook-form`                  | Used in forms        | Consolidate all inline validation to Zod schemas        |
| `@tanstack/react-query` (via tRPC) | Default staleTime    | Per-endpoint staleTime, prefetching, optimistic updates |
| `@tanstack/react-table`            | Used in transactions | Add virtualization layer on top                         |
| `zustand`                          | Single store         | Could add slices for complex pages                      |
| `next/dynamic`                     | 4 uses               | Apply to all heavy modals/forms/charts                  |
