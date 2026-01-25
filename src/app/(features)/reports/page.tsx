"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import {
  Loader2,
  Eye,
  Send,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Report } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const utils = api.useUtils();

  const { data, isLoading } = api.report.list.useQuery({ limit: 50 });

  const generateMutation = api.report.generate.useMutation({
    onSuccess: () => {
      toast.success("Report generated successfully");
      void utils.report.list.invalidate();
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

  const handleResend = (id: string) => {
    resendMutation.mutate({ id });
  };

  const handleGenerateMonthly = () => {
    const currentPeriod = format(new Date(), "yyyy-MM");
    generateMutation.mutate({
      type: "MONTHLY_SUMMARY",
      period: currentPeriod,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const reports = data?.items ?? [];
  const filteredReports =
    typeFilter === "all"
      ? reports
      : reports.filter((r) => r.type === typeFilter);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SENT":
        return "default";
      case "FAILED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "MONTHLY_SUMMARY":
        return <FileText className="h-5 w-5" />;
      case "BUDGET_EXCEEDED":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            View generated reports and email history.
          </p>
        </div>
        <Button
          onClick={handleGenerateMonthly}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Generate Monthly Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-[200px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="MONTHLY_SUMMARY">Monthly Summary</SelectItem>
              <SelectItem value="WEEKLY_DIGEST">Weekly Digest</SelectItem>
              <SelectItem value="BUDGET_EXCEEDED">Budget Exceeded</SelectItem>
              <SelectItem value="SPENDING_INSIGHTS">
                Spending Insights
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Reports Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm text-center">
              Generate your first report to see financial summaries and
              insights.
            </p>
            <Button
              onClick={handleGenerateMonthly}
              disabled={generateMutation.isPending}
            >
              Generate Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <Card key={report.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {getTypeLabel(report.type)}
                      </CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <span>Period: {report.period}</span>
                        <span>•</span>
                        <span>
                          Generated:{" "}
                          {format(
                            new Date(report.generatedAt),
                            "MMM d, yyyy HH:mm",
                          )}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResend(report.id)}
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Resend Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={(open) => !open && setSelectedReport(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport && getTypeLabel(selectedReport.type)}
            </DialogTitle>
            <DialogDescription>
              {selectedReport &&
                `Period: ${selectedReport.period} • Generated: ${format(new Date(selectedReport.generatedAt), "MMM d, yyyy HH:mm")}`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedReport && (
              <div className="bg-muted/50 rounded-md border p-4">
                <pre className="overflow-x-auto text-sm whitespace-pre-wrap">
                  {JSON.stringify(selectedReport.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
