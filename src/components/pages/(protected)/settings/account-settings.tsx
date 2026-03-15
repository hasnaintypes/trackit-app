"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createLogger } from "@/lib/logging";
import { useAccounts } from "@/hooks/use-accounts";

const logger = createLogger("account-settings");

const AccountForm = dynamic(
  () => import("@/components/forms/accounts/account-form"),
  { ssr: false, loading: () => null },
);
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Wallet,
  CreditCard,
  PiggyBank,
  CheckCircle2,
  Trash2,
  Landmark,
  PlusCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/common/delete-dialog";

export default function AccountSettings() {
  const [open, setOpen] = useState(false);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const { accounts, deleteAccount, updateAccount } = useAccounts();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Logic to toggle default account — calls hook which performs optimistic update
  const handleToggleDefault = async (id: string) => {
    try {
      toast.loading?.("Updating default account...");
    } catch {}
    setUpdatingId(id);
    try {
      await updateAccount({ id, isDefault: true });
      try {
        toast.dismiss?.();
      } catch {}
      toast.success("Default account updated");
    } catch (err) {
      logger.error("Account settings error", {
        error: err instanceof Error ? err.message : String(err),
      });
      try {
        toast.dismiss?.();
      } catch {}
      toast.error("Failed to set default account");
    } finally {
      setUpdatingId(null);
    }
  };

  // Logic to delete account
  const handleDelete = async (id: string) => {
    try {
      await deleteAccount({ id });
    } catch (err) {
      logger.error("Account settings error", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const visibleAccounts = showAllAccounts
    ? accounts
    : (accounts ?? []).slice(0, 2);
  const defaultAccount = (accounts ?? []).find((a) => a.isDefault);

  const ICON_MAP: Record<string, LucideIcon> = {
    wallet: Wallet,
    "credit-card": CreditCard,
    "piggy-bank": PiggyBank,
    // add more mappings as needed
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <AccountForm open={open} onOpenChange={setOpen} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Account</h1>
          <p className="text-muted-foreground mt-1">
            Manage your financial connections and preferences
          </p>
        </div>
        {/* Only show top button if we have accounts (Empty state has its own button) */}
        {accounts.length > 0 && (
          <Button
            onClick={() => setOpen(true)}
            className="cursor-pointer gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        )}
      </div>

      {/* --- CONDITIONAL RENDERING --- */}
      {accounts.length === 0 ? (
        // EMPTY STATE
        <Card className="flex flex-col items-center justify-center border-dashed py-16 text-center">
          <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
            <Landmark className="text-muted-foreground/50 h-10 w-10" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No accounts added yet</h2>
          <p className="text-muted-foreground mt-2 mb-8 max-w-sm text-center text-sm">
            Add your first bank account, credit card, or cash wallet to start
            tracking your finances effectively.
          </p>
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="cursor-pointer gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Add Your First Account
          </Button>
        </Card>
      ) : (
        // DATA VIEW
        <div className="space-y-6">
          {/* 1. List of Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>My Accounts</CardTitle>
              <CardDescription>
                Manage your created accounts. Set a default account for quick
                actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visibleAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-all",
                      account.isDefault
                        ? "border-primary/50 bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="bg-background flex h-10 w-10 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: account.color ?? undefined,
                          color: account.color ?? undefined,
                        }}
                      >
                        {(() => {
                          const IconComp = account.icon
                            ? ICON_MAP[account.icon]
                            : Wallet;
                          const Comp = IconComp ?? Wallet;
                          return <Comp className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-foreground font-semibold">
                            {account.name}
                          </p>
                          {account.isDefault && (
                            <Badge variant="secondary" className="h-5 text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm capitalize">
                          {account.type.toLowerCase()} • Balance:{" "}
                          {Number(account.balance).toLocaleString(undefined, {
                            style: "currency",
                            currency: account.currency ?? "USD",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground hidden text-sm sm:inline-block">
                          {account.isDefault ? "Active" : "Set Default"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Switch
                            className="cursor-pointer"
                            checked={account.isDefault}
                            onCheckedChange={() =>
                              handleToggleDefault(account.id)
                            }
                            disabled={updatingId === account.id}
                          />
                          {/* {updatingId === account.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )} */}
                        </div>
                      </div>
                      <div className="bg-border hidden h-4 w-px sm:block" />
                      <DeleteDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            disabled={account.isDefault}
                            title={
                              account.isDefault
                                ? "Cannot delete the default account"
                                : "Delete account successfully"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="Delete account"
                        description="This will permanently delete the account and all its transactions. This action cannot be undone."
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={async () => {
                          await handleDelete(account.id);
                        }}
                        successMessage="Account deleted successfully"
                        errorMessage="Failed to delete account"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {accounts.length > 2 && (
                <div className="mt-4 flex justify-center border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllAccounts(!showAllAccounts)}
                    className="text-muted-foreground hover:text-foreground cursor-pointer gap-2"
                  >
                    {showAllAccounts ? (
                      <>
                        Show Less <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Show {accounts.length - 2} More{" "}
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Default Account Highlight */}
          <Card>
            <CardHeader>
              <CardTitle>Default Account</CardTitle>
              <CardDescription>
                This account is used primarily for your dashboard overview and
                quick actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {defaultAccount ? (
                <div className="from-background to-muted/50 rounded-xl border bg-gradient-to-br p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">
                        Current Default
                      </p>
                      <h3 className="text-foreground text-2xl font-bold">
                        {defaultAccount.name}
                      </h3>
                      <p className="text-muted-foreground text-sm tracking-wider uppercase">
                        {defaultAccount.type}
                      </p>
                    </div>
                    <div
                      className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ color: defaultAccount.color ?? undefined }}
                    >
                      {(() => {
                        const IconComp = defaultAccount.icon
                          ? ICON_MAP[defaultAccount.icon]
                          : Wallet;
                        const Comp = IconComp ?? Wallet;
                        return <Comp className="h-6 w-6" />;
                      })()}
                    </div>
                  </div>
                  <div className="text-muted-foreground mt-6 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Active for auto-categorization</span>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground flex h-24 items-center justify-center rounded-lg border border-dashed">
                  No default account selected
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
