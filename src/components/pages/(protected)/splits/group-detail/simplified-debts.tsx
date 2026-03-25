"use client";

import React from "react";
import { ArrowRight, HandCoins } from "lucide-react";
import { Avatar, AvatarFallback } from "@ui/avatar";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";

interface DebtPerson {
  contactId: string | null;
  name: string;
  avatarUrl: string | null;
}

interface SimplifiedDebt {
  from: DebtPerson;
  to: DebtPerson;
  amount: number;
}

interface SimplifiedDebtsProps {
  debts: SimplifiedDebt[];
  isLoading?: boolean;
  formatAmount: (value: string | number) => string;
  onSettle: (debt: SimplifiedDebt) => void;
}

function SimplifiedDebtsInner({
  debts,
  isLoading,
  formatAmount,
  onSettle,
}: SimplifiedDebtsProps) {
  return (
    <Card className="shadow-md dark:border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <HandCoins className="h-4 w-4" />
          Settle Up
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                <div className="bg-muted h-4 w-8 animate-pulse rounded" />
                <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
                <div className="flex-1" />
                <div className="bg-muted h-8 w-20 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        ) : debts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            All settled up! No payments needed.
          </p>
        ) : (
          <div className="space-y-3">
            {debts.map((debt, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs font-medium">
                    {debt.from.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{debt.from.name}</span>
                <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs font-medium">
                    {debt.to.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{debt.to.name}</span>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSettle(debt)}
                  className="shrink-0 text-xs"
                >
                  {formatAmount(debt.amount)}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const SimplifiedDebts = React.memo(SimplifiedDebtsInner);
