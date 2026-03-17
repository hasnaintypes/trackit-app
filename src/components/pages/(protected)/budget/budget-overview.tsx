"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Progress } from "@ui/progress";
import { Badge } from "@ui/badge";
import { AlertTriangle } from "lucide-react";
import { toNum } from "@shared/decimal";

// Define a minimal type for the budget prop based on what we know the router returns
type Budget = {
  id: string;
  amount: { toNumber: () => number } | number | string; // Prisma Decimal handling
  spentAmount: { toNumber: () => number } | number | string;
  category: {
    name: string;
    icon?: string | null;
  };
};

export default function BudgetOverview({ budgets }: { budgets: Budget[] }) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground pt-6 text-center">
          No budgets set up yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {budgets.map((b) => {
        const total = toNum(b.amount);
        const spent = toNum(b.spentAmount);

        const percent = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
        const isOver = spent > total;

        return (
          <Card
            key={b.id}
            className="group relative overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <span>{b.category.icon ?? ""}</span>
                {b.category.name}
              </CardTitle>
              {isOver && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" /> Over Budget
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-end justify-between">
                <div className="text-2xl font-bold">
                  ${spent.toFixed(2)}
                  <span className="text-muted-foreground ml-1 text-sm font-normal">
                    / ${total.toFixed(2)}
                  </span>
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  {percent.toFixed(0)}%
                </div>
              </div>
              <Progress
                value={percent}
                className={`h-2 ${isOver ? "[&>div]:bg-red-500" : ""}`}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
