import type { jsPDF } from "jspdf";
import type {
  MonthlySummaryData,
  BudgetExceededData,
  WeeklyDigestData,
  SpendingInsightsData,
} from "@/types/report";

const COLORS = {
  black: "#111827",
  gray: "#6b7280",
  green: "#059669",
  red: "#dc2626",
  amber: "#d97706",
  lightGray: "#f3f4f6",
  border: "#e5e7eb",
  brand: "#2abb7f",
} as const;

function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Load image as base64 data URL */
async function loadImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Shared PDF layout helper */
class PdfBuilder {
  private y: number;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin = 15;
  private logoBase64: string | null = null;

  constructor(private readonly pdf: jsPDF) {
    this.y = this.margin;
    this.pageWidth = pdf.internal.pageSize.getWidth();
    this.pageHeight = pdf.internal.pageSize.getHeight();
  }

  async loadLogo() {
    try {
      this.logoBase64 = await loadImageAsBase64("/images/brand/logo.png");
    } catch {
      // Logo is optional — PDF works without it
    }
  }

  /** Branded header: logo + "Trackit" + accent line */
  brandHeader(generatedAt: string) {
    const logoSize = 10;
    let textX = this.margin;

    if (this.logoBase64) {
      this.pdf.addImage(
        this.logoBase64,
        "PNG",
        this.margin,
        this.y - 2,
        logoSize,
        logoSize,
      );
      textX = this.margin + logoSize + 3;
    }

    // Brand name
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(COLORS.brand);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text("Trackit", textX, this.y + 5);

    // Generated date on the right
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(COLORS.gray);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(
      `Generated: ${generatedAt}`,
      this.margin + this.contentWidth,
      this.y + 5,
      { align: "right" },
    );

    this.y += logoSize + 4;

    // Brand accent line
    this.pdf.setDrawColor(COLORS.brand);
    this.pdf.setLineWidth(0.6);
    this.pdf.line(this.margin, this.y, this.margin + this.contentWidth, this.y);
    this.y += 6;
  }

  /** Footer on every page: brand + page number */
  addFooters() {
    const totalPages = this.pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      const footerY = this.pageHeight - 8;

      // Subtle line
      this.pdf.setDrawColor(COLORS.border);
      this.pdf.setLineWidth(0.3);
      this.pdf.line(
        this.margin,
        footerY - 3,
        this.margin + this.contentWidth,
        footerY - 3,
      );

      // Left: branding
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(COLORS.gray);
      this.pdf.setFont("helvetica", "normal");
      this.pdf.text(
        "Trackit — Personal Finance Dashboard",
        this.margin,
        footerY,
      );

      // Right: page number
      this.pdf.text(
        `Page ${i} of ${totalPages}`,
        this.margin + this.contentWidth,
        footerY,
        { align: "right" },
      );
    }
  }

  private get contentWidth() {
    return this.pageWidth - this.margin * 2;
  }

  private checkPage(needed: number) {
    if (this.y + needed > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.y = this.margin;
    }
  }

  title(text: string) {
    this.checkPage(14);
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(COLORS.black);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(text, this.margin, this.y);
    this.y += 12;
  }

  subtitle(text: string) {
    this.checkPage(8);
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(COLORS.gray);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.text(text, this.margin, this.y);
    this.y += 8;
  }

  gap(size = 8) {
    this.y += size;
  }

  divider() {
    this.checkPage(4);
    this.pdf.setDrawColor(COLORS.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.y, this.margin + this.contentWidth, this.y);
    this.y += 4;
  }

  sectionHeader(text: string) {
    this.checkPage(12);
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(COLORS.black);
    this.pdf.setFont("helvetica", "bold");
    this.pdf.text(text, this.margin, this.y);
    this.y += 8;
  }

  statRow(items: Array<{ label: string; value: string; color?: string }>) {
    const colWidth = this.contentWidth / items.length;
    this.checkPage(18);

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const x = this.margin + i * colWidth;

      // Background
      this.pdf.setFillColor(COLORS.lightGray);
      this.pdf.roundedRect(x, this.y, colWidth - 4, 16, 2, 2, "F");

      // Label
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(COLORS.gray);
      this.pdf.setFont("helvetica", "normal");
      this.pdf.text(item.label.toUpperCase(), x + 4, this.y + 5);

      // Value
      this.pdf.setFontSize(13);
      this.pdf.setTextColor(item.color ?? COLORS.black);
      this.pdf.setFont("helvetica", "bold");
      this.pdf.text(item.value, x + 4, this.y + 12);
    }

    this.y += 20;
  }

  listRow(label: string, value: string) {
    this.checkPage(7);
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(COLORS.black);
    this.pdf.text(label, this.margin, this.y);

    this.pdf.setTextColor(COLORS.gray);
    this.pdf.text(value, this.margin + this.contentWidth, this.y, {
      align: "right",
    });
    this.y += 7;
  }

  progressBar(label: string, percentage: number, detail: string) {
    this.checkPage(14);

    // Label row
    this.pdf.setFontSize(10);
    this.pdf.setFont("helvetica", "normal");
    this.pdf.setTextColor(COLORS.black);
    this.pdf.text(label, this.margin, this.y);
    this.pdf.setTextColor(COLORS.gray);
    this.pdf.text(detail, this.margin + this.contentWidth, this.y, {
      align: "right",
    });
    this.y += 5;

    // Bar background
    const barHeight = 3;
    this.pdf.setFillColor(COLORS.lightGray);
    this.pdf.roundedRect(
      this.margin,
      this.y,
      this.contentWidth,
      barHeight,
      1,
      1,
      "F",
    );

    // Bar fill
    const color =
      percentage >= 100
        ? COLORS.red
        : percentage >= 80
          ? COLORS.amber
          : COLORS.green;
    this.pdf.setFillColor(color);
    const fillWidth = Math.min(percentage / 100, 1) * this.contentWidth;
    if (fillWidth > 0) {
      this.pdf.roundedRect(
        this.margin,
        this.y,
        fillWidth,
        barHeight,
        1,
        1,
        "F",
      );
    }

    this.y += 8;
  }

  wrappedText(text: string) {
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(COLORS.black);
    this.pdf.setFont("helvetica", "normal");

    const lines = this.pdf.splitTextToSize(text, this.contentWidth) as string[];
    for (const line of lines) {
      this.checkPage(5);
      this.pdf.text(line, this.margin, this.y);
      this.y += 5;
    }
  }
}

function renderMonthlySummary(b: PdfBuilder, d: MonthlySummaryData) {
  b.statRow([
    { label: "Income", value: fmt(d.totalIncome), color: COLORS.green },
    { label: "Expenses", value: fmt(d.totalExpenses), color: COLORS.red },
    {
      label: "Net Savings",
      value: fmt(d.netSavings),
      color: d.netSavings >= 0 ? COLORS.green : COLORS.red,
    },
  ]);

  b.subtitle(`${d.transactionCount} transactions in this period`);
  b.gap();

  if (d.topCategories.length > 0) {
    b.sectionHeader("Top Spending Categories");
    for (const cat of d.topCategories) {
      b.listRow(cat.name, fmt(cat.amount));
    }
    b.gap();
  }

  if (d.budgetStatus.length > 0) {
    b.sectionHeader("Budget Status");
    for (const budget of d.budgetStatus) {
      b.progressBar(
        budget.category,
        budget.percentage,
        `${fmt(budget.spent)} / ${fmt(budget.limit)} (${budget.percentage.toFixed(0)}%)`,
      );
    }
  }
}

function renderWeeklyDigest(b: PdfBuilder, d: WeeklyDigestData) {
  b.statRow([
    { label: "Income", value: fmt(d.totalIncome), color: COLORS.green },
    { label: "Expenses", value: fmt(d.totalExpenses), color: COLORS.red },
    {
      label: "Net Savings",
      value: fmt(d.netSavings),
      color: d.netSavings >= 0 ? COLORS.green : COLORS.red,
    },
  ]);

  b.subtitle(`${d.transactionCount} transactions this week`);
  b.gap();

  if (d.topCategories.length > 0) {
    b.sectionHeader("Top Categories");
    for (const cat of d.topCategories) {
      b.listRow(cat.name, fmt(cat.amount));
    }
  }
}

function renderBudgetExceeded(b: PdfBuilder, d: BudgetExceededData) {
  b.subtitle(`Budget exceeded for ${d.categoryName}`);
  b.gap();
  b.progressBar(d.categoryName, d.percentage, `${d.percentage.toFixed(0)}%`);
  b.gap();

  const remaining = d.limit - d.spent;
  b.statRow([
    { label: "Spent", value: fmt(d.spent), color: COLORS.red },
    { label: "Limit", value: fmt(d.limit) },
    { label: "Over By", value: fmt(Math.abs(remaining)), color: COLORS.red },
  ]);
}

function renderSpendingInsights(b: PdfBuilder, d: SpendingInsightsData) {
  if (d.hasAnomalies) {
    b.subtitle("⚠ Unusual spending patterns detected");
    b.gap();
  }
  b.wrappedText(d.aiContent);
}

function getTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export async function exportReportPdf(report: {
  type: string;
  period: string;
  data: unknown;
  generatedAt: Date | string;
}) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const b = new PdfBuilder(pdf);

  // Load logo and render branded header
  await b.loadLogo();
  const genDate =
    report.generatedAt instanceof Date
      ? report.generatedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : new Date(report.generatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  b.brandHeader(genDate);

  const data = report.data as Record<string, unknown>;

  b.title(getTypeLabel(report.type));
  b.subtitle(`Period: ${report.period}`);
  b.divider();
  b.gap(4);

  switch (report.type) {
    case "MONTHLY_SUMMARY":
      renderMonthlySummary(b, data as unknown as MonthlySummaryData);
      break;
    case "WEEKLY_DIGEST":
      renderWeeklyDigest(b, data as unknown as WeeklyDigestData);
      break;
    case "BUDGET_EXCEEDED":
      renderBudgetExceeded(b, data as unknown as BudgetExceededData);
      break;
    case "SPENDING_INSIGHTS":
      renderSpendingInsights(b, data as unknown as SpendingInsightsData);
      break;
    default:
      b.wrappedText(JSON.stringify(data, null, 2));
  }

  // Add branded footer to every page
  b.addFooters();

  pdf.save(
    `${report.type.toLowerCase().replace(/_/g, "-")}-${report.period}.pdf`,
  );
}
