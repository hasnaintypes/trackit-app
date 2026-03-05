"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  Wallet,
  ArrowUpRight,
  History,
  Pencil,
  Trash2,
  PlusCircle,
  LayoutGrid,
  List as ListIcon,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

import AccountForm from "@/components/forms/accounts/account-form";
import { DeleteDialog } from "@/components/common/delete-dialog";
import { ICONS } from "@/components/common/icon-picker";
import { useAccounts } from "@/hooks/use-accounts";
import type { BankAccount as Account } from "@/types/account";

type ApiAccount = Omit<Account, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  color?: string | null;
  icon?: string | null;
  balance: string;
};

export default function AccountsPage() {
  const router = useRouter();
  const { accounts, isLoading } = useAccounts();

  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<
    Account | ApiAccount | null
  >(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");

  const filteredAccounts = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (e: React.MouseEvent, account: Account | ApiAccount) => {
    e.stopPropagation();
    setEditingAccount(account);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const { deleteAccount } = useAccounts();

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteAccount({ id: deletingId });
    } finally {
      setDeletingId(null);
    }
  };

  const mapToInitialValues = (a: Account | ApiAccount) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    currency: a.currency,
    balance: String(a.balance ?? "0"),
    color: a.color ?? undefined,
    icon: a.icon ?? undefined,
    isDefault: !!a.isDefault,
  });

  return (
    <div className="animate-in fade-in-50 mx-auto flex min-h-screen max-w-7xl flex-col space-y-8 p-8 duration-500">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Accounts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bank accounts, credit cards, and cash wallets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {accounts.length > 0 && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Add Account
            </Button>
          )}
        </div>
      </div>

      {!isLoading && accounts.length > 0 && (
        <div className="bg-card/50 border-border/50 flex items-center justify-between gap-4 rounded-lg border p-1 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background h-9 w-full border-none pl-9 shadow-none focus-visible:ring-1"
            />
          </div>
          <div className="relative flex items-center gap-1 pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setShowFilters((s) => !s);
              }}
            >
              <Filter className="h-4 w-4" />
            </Button>

            <div className="bg-border mx-1 h-4 w-px" />

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${layoutMode === "grid" ? "bg-muted/10" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setLayoutMode("grid");
              }}
              aria-pressed={layoutMode === "grid"}
            >
              <LayoutGrid className="cusror-pointer h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${layoutMode === "list" ? "bg-muted/10" : "text-muted-foreground hover:text-foreground cursor-pointer"}`}
              onClick={(e) => {
                e.stopPropagation();
                setLayoutMode("list");
              }}
              aria-pressed={layoutMode === "list"}
            >
              <ListIcon className="h-4 w-4 cursor-pointer" />
            </Button>

            {showFilters && (
              <div className="bg-background absolute top-full right-0 mt-2 w-64 rounded-lg border p-3 shadow-lg">
                <div className="text-sm font-medium">Filters</div>
                <div className="text-muted-foreground mt-2 text-sm">
                  No filters configured yet.
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFilters(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1">
        {isLoading ? (
          <AccountSkeleton />
        ) : accounts.length === 0 ? (
          <EmptyState onCreate={() => setIsCreateOpen(true)} />
        ) : filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="text-muted-foreground/30 mb-4 h-12 w-12" />
            <h3 className="text-lg font-semibold">No accounts found</h3>
            <p className="text-muted-foreground">
              No accounts match your search query:{" "}
              <span className="font-medium">{`"${searchQuery}"`}</span>
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onClick={() => router.push(`/accounts/${account.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <AccountForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {editingAccount && (
        <AccountForm
          open={true}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          initialValues={mapToInitialValues(editingAccount)}
        />
      )}

      <DeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Account"
        description="Are you sure you want to delete this account? All associated transactions will be permanently removed."
        confirmText="Delete Account"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

interface AccountCardProps {
  account: Account | ApiAccount;
  onEdit: (e: React.MouseEvent, account: Account | ApiAccount) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onClick: () => void;
}

function AccountCard({ account, onEdit, onDelete, onClick }: AccountCardProps) {
  const IconComponent =
    ICONS.find((i) => i.name === account.icon)?.Icon ?? Wallet;

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: account.currency,
  }).format(Number(account.balance));

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
}

function AccountSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card/50 space-y-4 rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="pt-4">
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="bg-muted/10 animate-in zoom-in-95 flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center duration-500">
      <div className="bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <Wallet className="text-primary h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">No accounts yet</h2>
      <p className="text-muted-foreground mt-2 mb-8 max-w-md">
        You have not added any accounts yet. Connect your bank accounts, credit
        cards, or cash wallets to start tracking your finances.
      </p>
      <Button
        onClick={onCreate}
        size="lg"
        className="gap-2 shadow-lg transition-all hover:shadow-xl"
      >
        <PlusCircle className="h-5 w-5" />
        Add Your First Account
      </Button>
    </div>
  );
}
