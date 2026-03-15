import React from "react";
import {
  Wallet,
  MoreVertical,
  ArrowUpRight,
  History,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/components/common/icon-picker";
import type { BankAccount as Account } from "@/types/account";

export type ApiAccount = Omit<Account, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  color?: string | null;
  icon?: string | null;
  balance: string;
};

export interface AccountCardProps {
  account: Account | ApiAccount;
  onEdit: (e: React.MouseEvent, account: Account | ApiAccount) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
  formatAmount: (amount: number | string) => string;
}

export const AccountCard = React.memo(function AccountCard({
  account,
  onEdit,
  onDelete,
  onClick,
  formatAmount,
}: AccountCardProps) {
  const IconComponent = ICON_MAP.get(account.icon ?? "") ?? Wallet;

  const formattedBalance = formatAmount(Number(account.balance));

  return (
    <Card
      onClick={onClick}
      className="group hover:border-primary/50 from-card to-card/50 relative cursor-pointer overflow-hidden bg-gradient-to-br transition-all hover:shadow-md"
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 h-1 w-full"
        style={{ backgroundColor: account.color ?? undefined }}
      />

      <CardHeader className="flex flex-row items-start justify-between pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="bg-background flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-110"
            style={{
              borderColor: account.color ? `${account.color}40` : undefined,
              color: account.color ?? undefined,
            }}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base leading-none font-semibold tracking-tight">
              {account.name}
            </CardTitle>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {account.type}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="flex items-center gap-1">
          {account.isDefault && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 mr-2 h-5 px-1.5 text-[10px]"
            >
              Default
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground -mr-2 h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => onEdit(e, account)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => onDelete(e, account.id)}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                disabled={account.isDefault}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="mt-2">
          <span
            className={cn(
              "text-2xl font-bold tracking-tight",
              Number(account.balance) < 0
                ? "text-destructive"
                : "text-foreground",
            )}
          >
            {formattedBalance}
          </span>
        </div>
      </CardContent>

      <CardFooter className="text-muted-foreground flex items-center justify-between pt-0 pb-4 text-xs">
        <div className="flex items-center gap-1">
          <History className="h-3 w-3" />
          <span>Last updated today</span>
        </div>

        <div className="-translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowUpRight className="text-primary h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
});
