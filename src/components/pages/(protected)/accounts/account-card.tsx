import React from "react";
import { Wallet, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/constants/icons";
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
  formatDate: (date: Date | string) => string;
}

export const AccountCard = React.memo(function AccountCard({
  account,
  onEdit,
  onDelete,
  onClick,
  formatAmount,
  formatDate,
}: AccountCardProps) {
  const IconComponent = ICON_MAP.get(account.icon ?? "") ?? Wallet;
  const formattedBalance = formatAmount(Number(account.balance));
  const accentColor = account.color ?? "#6366f1";

  const updatedLabel = account.updatedAt ? formatDate(account.updatedAt) : null;

  return (
    <div
      onClick={onClick}
      className="group border-border bg-card hover:ring-ring/20 relative w-full cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-1"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 right-0 left-0 h-[2px] opacity-80"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
      />

      {/* Header: Icon + Name + Menu */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-card-foreground text-[15px] leading-tight font-semibold tracking-tight">
                {account.name}
              </span>
              {account.isDefault && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500 dark:text-emerald-400">
                  Default
                </span>
              )}
            </div>
            <span className="text-muted-foreground mt-0.5 text-[11px] font-medium">
              {account.type} &middot; {account.currency}
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:bg-accent hover:text-foreground h-8 w-8 rounded-lg transition"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem
              onClick={(e) => onEdit(e, account)}
              className="cursor-pointer gap-2"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => onDelete(e, account.id)}
              disabled={account.isDefault}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-muted-foreground mb-1.5 text-[11px] font-medium tracking-wider uppercase">
          Balance
        </p>
        <h2
          className={cn(
            "text-3xl font-bold tracking-tight",
            Number(account.balance) < 0
              ? "text-destructive"
              : "text-card-foreground",
          )}
        >
          {formattedBalance}
        </h2>
      </div>

      {/* Footer */}
      {updatedLabel && (
        <div className="border-border border-t pt-3">
          <span className="text-muted-foreground/70 text-[10px] font-medium tracking-wider uppercase">
            Updated {updatedLabel}
          </span>
        </div>
      )}
    </div>
  );
});
