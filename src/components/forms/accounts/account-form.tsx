"use client";

import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@ui/sheet";
import {
  createAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/validation/account";
import { useAccounts } from "@/hooks/use-accounts";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Import Custom Pickers
import { IconPicker } from "@common/pickers/icon-picker";
import { ColorPicker } from "@common/pickers/color-picker";
import { createLogger } from "@/lib/logging";

const logger = createLogger("account-form");

const ACCOUNT_TYPES = [
  { value: "BANK", label: "Bank" },
  { value: "CASH", label: "Cash" },
  { value: "CREDIT", label: "Credit" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "LOAN", label: "Loan" },
  { value: "OTHER", label: "Other" },
] as const;

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "AUD", label: "AUD (A$)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "CHF", label: "CHF (Fr)" },
  { value: "CNY", label: "CNY (¥)" },
  { value: "INR", label: "INR (₹)" },
  { value: "SGD", label: "SGD (S$)" },
  { value: "PKR", label: "PKR (₨)" },
] as const;

type AccountFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CreateAccountInput> & { id?: string };
  onSubmit?: (values: CreateAccountInput | UpdateAccountInput) => void;
  className?: string;
};

export function AccountForm({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  className,
}: AccountFormProps) {
  const { createAccount, updateAccount, accounts, createStatus } =
    useAccounts();

  const isFirstAccount = (accounts ?? []).length === 0;

  type FormValues = Omit<CreateAccountInput, "balance"> & {
    balance?: string | number;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(
      createAccountSchema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: "",
      type: "BANK",
      currency: "USD",
      balance: "",
      color: "#3B82F6",
      icon: "wallet",
      isDefault: isFirstAccount,
      ...initialValues,
    },
  });

  // Reset form when opening
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        type: "BANK",
        currency: "USD",
        balance: 0,
        color: "#3B82F6",
        icon: "wallet",
        // If there are no accounts, default to true for first account.
        isDefault: initialValues?.id
          ? (initialValues.isDefault ?? false)
          : isFirstAccount,
        ...initialValues,
      });
    }
  }, [open, initialValues, form, isFirstAccount]);

  const handleSubmit = async (values: FormValues) => {
    try {
      if (initialValues?.id) {
        const payload: UpdateAccountInput = {
          id: initialValues.id,
          ...values,
          balance:
            typeof values.balance === "number"
              ? String(values.balance)
              : values.balance,
        } as UpdateAccountInput;
        await updateAccount(payload);
        toast.success("Account updated");
        if (onSubmit) onSubmit(payload);
      } else {
        const payload: CreateAccountInput = {
          ...(values as CreateAccountInput),
          balance:
            typeof values.balance === "number"
              ? String(values.balance)
              : values.balance,
        };
        // show a loading toast and reflect loading state in the button
        try {
          toast.loading?.("Creating account...");
        } catch {}
        await createAccount(payload);
        // dismiss loading toast if supported, then show success
        try {
          toast.dismiss?.();
        } catch {}
        toast.success("Account created");
        if (onSubmit) onSubmit(payload);
      }
      onOpenChange(false);
    } catch (error) {
      logger.error("Failed to save account", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast.error("Failed to save account");
    }
  };

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-4", className)}
      >
        {/* Name */}
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Main Checking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type & Currency */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="currency"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Balance */}
        <FormField
          name="balance"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Balance</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Starting amount in this account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Default Switch */}
        <FormField
          name="isDefault"
          control={form.control}
          render={({ field }) => (
            <FormItem className="hover:bg-muted/50 flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm transition-all">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-medium">
                  Set as Default
                </FormLabel>
                <FormDescription>
                  Use this as your primary account
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Icon & Color Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Custom Icon Picker */}
          <FormField
            name="icon"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <IconPicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Custom Color Picker */}
          <FormField
            name="color"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1">
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <ColorPicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={createStatus === "pending"}
          >
            {initialValues?.id ? (
              "Save Changes"
            ) : createStatus === "pending" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Creating...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  const isMobile = useIsMobile();

  return (
    <>
      {/* Conditionally mount only one of Sheet or Dialog based on viewport */}
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="px-4 pb-6">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle>
                {initialValues?.id ? "Edit Account" : "New Account"}
              </SheetTitle>
              <SheetDescription>
                Configure your account details.
              </SheetDescription>
            </SheetHeader>
            {formContent}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>
                {initialValues?.id ? "Edit Account" : "New Account"}
              </DialogTitle>
              <DialogDescription>
                Configure your account details below.
              </DialogDescription>
            </DialogHeader>
            {formContent}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default AccountForm;
