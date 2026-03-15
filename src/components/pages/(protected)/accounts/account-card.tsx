import React from "react";
import {
  Wallet,
  MoreHorizontal,
  Pencil,
  ArrowRightLeft,
  Plus,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/components/common/icon-picker";
import { format } from "date-fns";
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

  const updatedLabel = account.updatedAt
    ? format(new Date(account.updatedAt), "MMM d, yyyy")
    : null;

  return (
    <div
      onClick={onClick}
      className="group relative w-full max-w-md cursor-pointer overflow-hidden rounded-[28px] bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-1 hover:ring-white/10"
    >
      {/* subtle glow overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
      </div>

      {/* Header */}
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icon with glow */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full opacity-40 blur-md"
              style={{ backgroundColor: account.color ?? "#ff4f00" }}
            />
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: account.color ?? "#ff4f00" }}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-semibold tracking-tight">
                {account.name}
              </span>

              {account.isDefault && (
                <span className="rounded-full bg-emerald-500/20 px-2 py-[2px] text-[10px] font-medium text-emerald-400">
                  Default
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium tracking-widest text-white/40 uppercase">
              {account.type} Account
            </span>
          </div>
        </div>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-9 rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl border-zinc-800 bg-zinc-900 text-zinc-200"
          >
            <DropdownMenuLabel>Account Options</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />

            <DropdownMenuItem
              onClick={(e) => onEdit(e, account)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => onDelete(e, account.id)}
              disabled={account.isDefault}
              className="cursor-pointer text-red-400 focus:bg-red-400/10 focus:text-red-400"
            >
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Balance */}
      <div className="mb-7 px-1">
        <p className="mb-1 text-xs font-medium tracking-wide text-white/40 uppercase">
          Available balance
        </p>

        <h2
          className={cn(
            "text-4xl font-bold tracking-tight",
            Number(account.balance) < 0 ? "text-red-400" : "text-white",
          )}
        >
          {formattedBalance}
        </h2>
      </div>

      {/* Divider */}
      <div className="mb-6 h-px w-full bg-white/5" />

      {/* Actions */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Button
          variant="secondary"
          className="h-10 rounded-full border-0 bg-white/10 text-xs font-medium text-white transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Top Up
        </Button>

        <Button
          variant="secondary"
          className="h-10 rounded-full border-0 bg-white/10 text-xs font-medium text-white transition hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <ArrowRightLeft className="mr-1 h-4 w-4" />
          Transfer
        </Button>

        <Button
          variant="secondary"
          className="h-10 rounded-full border-0 bg-white/10 text-xs font-medium text-white transition hover:bg-white/20"
          onClick={(e) => onEdit(e, account)}
        >
          <History className="mr-1 h-4 w-4" />
          Activity
        </Button>
      </div>

      {/* Footer */}
      {updatedLabel && (
        <div className="flex items-center justify-center gap-3 pt-2 text-[10px] font-medium tracking-[0.2em] text-white/30 uppercase">
          <span>{updatedLabel}</span>
          <div className="h-3 w-[1px] bg-white/10" />
          <span>Refreshed</span>
        </div>
      )}
    </div>
  );
});
