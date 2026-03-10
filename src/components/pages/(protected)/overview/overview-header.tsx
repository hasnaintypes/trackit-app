"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OverviewActionsProps {
  period: string;
  onPeriodChange: (period: string) => void;
  onAddTransaction: () => void;
}

export function OverviewActions({
  period,
  onPeriodChange,
  onAddTransaction,
}: OverviewActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <Select value={period} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7">Last 7 days</SelectItem>
          <SelectItem value="last30">Last 30 days</SelectItem>
          <SelectItem value="last90">Last 90 days</SelectItem>
          <SelectItem value="year">Last year</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onAddTransaction} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Transaction
      </Button>
    </div>
  );
}
