"use client";

import React from "react";
import { api } from "@/trpc/react";
import { invalidateReports } from "@/trpc/invalidation";
import { format } from "date-fns";
import {
  Loader2,
  Eye,
  Send,
  FileText,
  Search,
  Download,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";
import type { Report } from "@prisma/client";

import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Input } from "@ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

function getStatusBadge(status: string) {
  switch (status) {
    case "SENT":
      return (
        <Badge className="border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
          Ready
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-500"
        >
          Scheduled
        </Badge>
      );
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getTypeLabel(type: string) {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getReportDescription(type: string) {
  switch (type) {
    case "MONTHLY_SUMMARY":
      return "Monthly financial summary";
    case "BUDGET_EXCEEDED":
      return "Budget limit alert analysis";
    case "WEEKLY_DIGEST":
      return "Weekly spending breakdown";
    case "SPENDING_INSIGHTS":
      return "AI-powered spending analysis";
    default:
      return "Financial report details";
  }
}

export default function ReportsPageClient() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filters, setFilters] = useState({
    typeFilter: "all",
    searchQuery: "",
  });
  const utils = api.useUtils();

  const { data, isLoading } = api.report.list.useQuery({ limit: 100 });

  const generateMutation = api.report.generate.useMutation({
    onSuccess: () => {
      toast.success("Report generated successfully");
      void invalidateReports(utils);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const resendMutation = api.report.resend.useMutation({
    onSuccess: () => {
      toast.success("Report resent successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleResend = useCallback(
    (id: string) => {
      resendMutation.mutate({ id });
    },
    [resendMutation],
  );

  const handleGenerateMonthly = useCallback(() => {
    const currentPeriod = format(new Date(), "yyyy-MM");
    generateMutation.mutate({
      type: "MONTHLY_SUMMARY",
      period: currentPeriod,
    });
  }, [generateMutation]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
    },
    [],
  );

  const handleExport = useCallback(() => {
    toast.info("Export feature coming soon");
  }, []);

  const handleFilterChange = useCallback((typeFilter: string) => {
    setFilters((prev) => ({ ...prev, typeFilter }));
  }, []);

  const handleClosePreview = useCallback(() => {
    setSelectedReport(null);
  }, []);

  const filteredReports = useMemo(() => {
    const reports = data?.items ?? [];
    return reports.filter((r) => {
      const matchesType =
        filters.typeFilter === "all" || r.type === filters.typeFilter;
      const label = r.type.replace(/_/g, " ").toLowerCase();
      const matchesSearch =
        label.includes(filters.searchQuery.toLowerCase()) ||
        r.period.toLowerCase().includes(filters.searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [data?.items, filters]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section with Welcome text similar to other pages */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Reports & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            View generated reports and email history.
          </p>
        </div>
        <Button
          onClick={handleGenerateMonthly}
          disabled={generateMutation.isPending}
          className="gap-2 shadow-sm"
        >
          {generateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate Monthly Report
        </Button>
      </div>

      <div className="bg-card rounded-xl border p-1 shadow-sm">
        {/* Toolbar inspired by the reference image */}
        <div className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <h2 className="px-2 text-xl font-semibold">Generated Reports</h2>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:min-w-[300px]">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search here..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="bg-muted/30 ring-offset-background focus-visible:ring-ring h-10 border-none pl-9 focus-visible:ring-1"
              />
            </div>
            <Button
              variant="outline"
              className="hover:bg-muted/50 h-10 gap-2 border-dashed shadow-xs"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="hover:bg-muted/50 h-10 gap-2 border-dashed shadow-xs"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => handleFilterChange("all")}
                  className={filters.typeFilter === "all" ? "bg-accent" : ""}
                >
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("MONTHLY_SUMMARY")}
                  className={
                    filters.typeFilter === "MONTHLY_SUMMARY" ? "bg-accent" : ""
                  }
                >
                  Monthly Summary
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("WEEKLY_DIGEST")}
                  className={
                    filters.typeFilter === "WEEKLY_DIGEST" ? "bg-accent" : ""
                  }
                >
                  Weekly Digest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("BUDGET_EXCEEDED")}
                  className={
                    filters.typeFilter === "BUDGET_EXCEEDED" ? "bg-accent" : ""
                  }
                >
                  Budget Exceeded
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFilterChange("SPENDING_INSIGHTS")}
                  className={
                    filters.typeFilter === "SPENDING_INSIGHTS"
                      ? "bg-accent"
                      : ""
                  }
                >
                  Spending Insights
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table layout exactly like the reference image */}
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30 border-y">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] py-4 text-xs font-semibold tracking-wider uppercase">
                  Report Name
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Date Range
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Format
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Generated On
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Status
                </TableHead>
                <TableHead className="w-[100px] text-right text-xs font-semibold tracking-wider uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center p-8">
                      <FileText className="text-muted-foreground/30 mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No Reports Found
                      </h3>
                      <p className="text-muted-foreground max-w-sm text-center">
                        Try adjusting your search or filters to see your
                        generated reports.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="group hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground leading-tight font-semibold">
                          {getTypeLabel(report.type)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {getReportDescription(report.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm font-medium">
                        {report.type === "MONTHLY_SUMMARY"
                          ? "Income"
                          : "Analysis"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {report.period}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        <Badge
                          variant="secondary"
                          className="bg-muted h-5 rounded-md px-1.5 text-[10px] font-bold tracking-tighter uppercase"
                        >
                          PDF
                        </Badge>
                        {report.type === "MONTHLY_SUMMARY" && (
                          <Badge
                            variant="secondary"
                            className="bg-muted h-5 rounded-md px-1.5 text-[10px] font-bold tracking-tighter uppercase"
                          >
                            Excel
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm whitespace-nowrap">
                        {format(new Date(report.generatedAt), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-muted h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => setSelectedReport(report)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResend(report.id)}
                            disabled={resendMutation.isPending}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>
                              {resendMutation.isPending
                                ? "Sending..."
                                : "Resend Email"}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="glass flex max-h-[80vh] max-w-3xl flex-col overflow-hidden border p-0 shadow-2xl">
          <DialogHeader className="bg-card border-b p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {selectedReport && getTypeLabel(selectedReport.type)}
                </DialogTitle>
                <DialogDescription>
                  {selectedReport &&
                    `Period: ${selectedReport.period} • Generated: ${format(new Date(selectedReport.generatedAt), "MMM d, yyyy HH:mm")}`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="bg-muted/20 flex-1 overflow-y-auto p-6">
            {selectedReport && (
              <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
                <div className="bg-muted/10 flex items-center justify-between border-b px-4 py-3">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Report Data Summary
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    JSON Format
                  </Badge>
                </div>
                <pre className="text-foreground/80 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(selectedReport.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div className="bg-card flex justify-end gap-3 border-t p-4">
            <Button variant="outline" onClick={handleClosePreview}>
              Close Preview
            </Button>
            <Button
              className="gap-2"
              onClick={() => selectedReport && handleResend(selectedReport.id)}
            >
              <Send className="h-4 w-4" />
              Send to Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
