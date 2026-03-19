import type { Report } from "@prisma/client";
import type {
  MonthlySummaryData,
  BudgetExceededData,
  WeeklyDigestData,
  SpendingInsightsData,
} from "@/types/report";
import { Progress } from "@ui/progress";
import { AlertTriangle } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function MonthlySummaryPreview({ data }: { data: MonthlySummaryData }) {
  const netSavingsPositive = data.netSavings >= 0;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-emerald-500/5 p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Income
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {formatCurrency(data.totalIncome)}
          </p>
        </div>
        <div className="rounded-lg border bg-red-500/5 p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Expenses
          </p>
          <p className="mt-1 text-xl font-bold text-red-600">
            {formatCurrency(data.totalExpenses)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Net Savings
          </p>
          <p
            className={`mt-1 text-xl font-bold ${netSavingsPositive ? "text-emerald-600" : "text-red-600"}`}
          >
            {formatCurrency(data.netSavings)}
          </p>
        </div>
      </div>

      {/* Transaction count */}
      <p className="text-muted-foreground text-sm">
        {data.transactionCount} transactions in this period
      </p>

      {/* Top categories */}
      {data.topCategories.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">
            Top Spending Categories
          </h4>
          <div className="space-y-2">
            {data.topCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm">{cat.name}</span>
                <span className="text-muted-foreground text-sm font-medium">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget status */}
      {data.budgetStatus.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">Budget Status</h4>
          <div className="space-y-3">
            {data.budgetStatus.map((b) => (
              <div key={b.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{b.category}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(b.spent)} / {formatCurrency(b.limit)} (
                    {b.percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={Math.min(b.percentage, 100)}
                  className={
                    b.percentage >= 100
                      ? "[&>[data-slot=progress-indicator]]:bg-red-500"
                      : b.percentage >= 80
                        ? "[&>[data-slot=progress-indicator]]:bg-amber-500"
                        : ""
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyDigestPreview({ data }: { data: WeeklyDigestData }) {
  const netSavingsPositive = data.netSavings >= 0;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">{data.period}</p>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-emerald-500/5 p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Income
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-600">
            {formatCurrency(data.totalIncome)}
          </p>
        </div>
        <div className="rounded-lg border bg-red-500/5 p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Expenses
          </p>
          <p className="mt-1 text-xl font-bold text-red-600">
            {formatCurrency(data.totalExpenses)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Net Savings
          </p>
          <p
            className={`mt-1 text-xl font-bold ${netSavingsPositive ? "text-emerald-600" : "text-red-600"}`}
          >
            {formatCurrency(data.netSavings)}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        {data.transactionCount} transactions this week
      </p>

      {data.topCategories.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">Top Categories</h4>
          <div className="space-y-2">
            {data.topCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm">{cat.name}</span>
                <span className="text-muted-foreground text-sm font-medium">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetExceededPreview({ data }: { data: BudgetExceededData }) {
  const remaining = data.limit - data.spent;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-500/5 p-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Budget exceeded for <strong>{data.categoryName}</strong>
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span>{data.categoryName}</span>
          <span className="text-muted-foreground">
            {data.percentage.toFixed(0)}%
          </span>
        </div>
        <Progress
          value={Math.min(data.percentage, 100)}
          className="[&>[data-slot=progress-indicator]]:bg-red-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Spent
          </p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {formatCurrency(data.spent)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Limit
          </p>
          <p className="mt-1 text-lg font-bold">{formatCurrency(data.limit)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-xs font-medium uppercase">
            Over By
          </p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>
    </div>
  );
}

function SpendingInsightsPreview({ data }: { data: SpendingInsightsData }) {
  return (
    <div className="space-y-6">
      {data.hasAnomalies && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-500/5 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            Unusual spending patterns detected
          </p>
        </div>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none">
        {data.aiContent
          .split("\n")
          .map((paragraph, i) =>
            paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
          )}
      </div>
    </div>
  );
}

export function ReportPreview({ report }: { report: Report }) {
  const data = report.data as Record<string, unknown> | null;

  if (!data) {
    return (
      <p className="text-muted-foreground text-sm">
        No data available for this report.
      </p>
    );
  }

  switch (report.type) {
    case "MONTHLY_SUMMARY":
      return (
        <MonthlySummaryPreview data={data as unknown as MonthlySummaryData} />
      );
    case "WEEKLY_DIGEST":
      return <WeeklyDigestPreview data={data as unknown as WeeklyDigestData} />;
    case "BUDGET_EXCEEDED":
      return (
        <BudgetExceededPreview data={data as unknown as BudgetExceededData} />
      );
    case "SPENDING_INSIGHTS":
      return (
        <SpendingInsightsPreview
          data={data as unknown as SpendingInsightsData}
        />
      );
    default:
      return (
        <pre className="text-foreground/80 overflow-x-auto font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
  }
}
