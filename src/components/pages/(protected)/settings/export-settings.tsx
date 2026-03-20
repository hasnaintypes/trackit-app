"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useFormatter } from "@/hooks/use-formatter";
import { Button } from "@ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Label } from "@ui/label";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Shared row component
// ---------------------------------------------------------------------------
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
            <Icon className="text-muted-foreground h-4 w-4" />
          </div>
        )}
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
      </div>
      <div className="w-full sm:w-48">{children}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wider uppercase">
        {title}
      </h3>
      <div className="bg-card divide-border divide-y rounded-xl border px-5 shadow-sm dark:border-white/10">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------
type DateRange =
  | "all"
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year";

function getDateRange(range: DateRange): {
  startDate?: string;
  endDate?: string;
} {
  const now = new Date();
  const endDate = now.toISOString();

  switch (range) {
    case "all":
      return {};
    case "this_month":
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate,
      };
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case "last_3_months":
      return {
        startDate: new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          1,
        ).toISOString(),
        endDate,
      };
    case "last_6_months":
      return {
        startDate: new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          1,
        ).toISOString(),
        endDate,
      };
    case "this_year":
      return {
        startDate: new Date(now.getFullYear(), 0, 1).toISOString(),
        endDate,
      };
  }
}

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  all: "All Time",
  this_month: "This Month",
  last_month: "Last Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  this_year: "This Year",
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ExportSettings() {
  const [dateRange, setDateRange] = useState<DateRange>("this_month");
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportCount, setLastExportCount] = useState<number | null>(null);
  const { formatAmount, formatDate } = useFormatter();
  const utils = api.useUtils();

  const handleExportCSV = async () => {
    setIsExporting(true);
    const range = getDateRange(dateRange);
    try {
      const allTransactions: Array<{
        date: string;
        description: string | null;
        amount: string;
        type: string;
        notes: string | null;
        paymentMethod: string | null;
      }> = [];

      let cursor: string | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const res = await utils.transaction.list.fetch({
          limit: 100,
          cursor,
          ...range,
        });

        allTransactions.push(...res.transactions);
        cursor = res.nextCursor;
        hasMore = !!cursor;
      }

      if (allTransactions.length === 0) {
        toast.error("No transactions found for the selected period");
        setIsExporting(false);
        return;
      }

      // Build CSV
      const headers = [
        "Date",
        "Description",
        "Amount",
        "Type",
        "Payment Method",
        "Notes",
      ];
      const rows = allTransactions.map((t) => [
        formatDate(t.date),
        `"${(t.description ?? "").replace(/"/g, '""')}"`,
        formatAmount(Number(t.amount)),
        t.type,
        t.paymentMethod ?? "",
        `"${(t.notes ?? "").replace(/"/g, '""')}"`,
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      );

      // Download
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `trackit-transactions-${dateRange}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setLastExportCount(allTransactions.length);
      toast.success(`Exported ${allTransactions.length} transactions`);
    } catch {
      toast.error("Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-10">
      <Section title="Export Transactions">
        <SettingRow
          icon={Calendar}
          label="Date Range"
          description="Select the period to export"
        >
          <Select
            value={dateRange}
            onValueChange={(val) => {
              setDateRange(val as DateRange);
              setLastExportCount(null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DATE_RANGE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={FileText}
          label="Format"
          description="Export file format"
        >
          <Select value="csv" disabled>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV (.csv)</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>

        {/* Info banner */}
        <div className="py-5">
          <div className="bg-muted/50 flex items-center justify-between rounded-xl border px-5 py-4">
            <div className="space-y-0.5">
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {lastExportCount !== null ? "Last Export" : "Ready to Export"}
              </p>
              <p className="text-foreground text-lg font-semibold">
                {lastExportCount !== null
                  ? `${lastExportCount.toLocaleString()} records`
                  : DATE_RANGE_LABELS[dateRange]}
              </p>
            </div>
            <FileSpreadsheet className="text-muted-foreground/40 h-8 w-8" />
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="min-w-32"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>
    </div>
  );
}
