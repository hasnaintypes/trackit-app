"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@ui/sheet";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";

import { createTransactionSchema } from "@/validation/transaction";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/validation/transaction";
import { createLogger } from "@/lib/logging";

import { ReceiptStep } from "./steps/receipt-step";
import { BasicInfoStep } from "./steps/basic-info-step";
import { CategoryStep } from "./steps/category-step";
import { RecurringStep } from "./steps/recurring-step";

const logger = createLogger("transaction-form");

type TransactionFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: (Partial<UpdateTransactionInput> & { id?: string }) | null;
  accountId?: string | null;
  onSubmit?: (v: CreateTransactionInput | UpdateTransactionInput) => void;
  className?: string;
};

export function TransactionForm({
  open,
  onOpenChange,
  initialValues,
  accountId,
  onSubmit,
  className,
}: TransactionFormProps) {
  const isMobile = useIsMobile();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { create, update } = useTransactions();
  const defaultTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    [],
  );

  const defaultAccountId = useMemo(() => {
    if (accountId) return accountId;
    const preferred = accounts?.find((a) => a.isDefault);
    return preferred?.id ?? accounts?.[0]?.id ?? "";
  }, [accountId, accounts]);

  const normalize = React.useCallback(
    (
      vals?: TransactionFormProps["initialValues"],
    ): Partial<CreateTransactionInput> => {
      const start = vals?.date
        ? new Date(vals.date).toISOString()
        : new Date().toISOString();

      const recurrence =
        vals?.recurrence ??
        (vals?.isRecurring
          ? {
              frequency: "MONTHLY" as const,
              interval: 1,
              startDate: start,
              timezone: defaultTimezone,
            }
          : undefined);

      return {
        accountId: vals?.accountId ?? defaultAccountId,
        amount: vals?.amount ?? "",
        type: vals?.type ?? "DEBIT",
        categoryId: vals?.categoryId ?? undefined,
        description: vals?.description ?? undefined,
        notes: vals?.notes ?? undefined,
        paymentMethod: vals?.paymentMethod ?? undefined,
        receipt_url: vals?.receipt_url ?? undefined,
        receipt_extracted_text: vals?.receipt_extracted_text ?? undefined,
        date: start,
        isRecurring: vals?.isRecurring ?? Boolean(recurrence),
        recurrence,
      };
    },
    [defaultAccountId, defaultTimezone],
  );

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(
      createTransactionSchema,
    ) as unknown as Resolver<CreateTransactionInput>,
    defaultValues: normalize(),
  });

  const isRecurringSelected = form.watch("isRecurring");
  const recurrence = form.watch("recurrence");

  useEffect(() => {
    if (isRecurringSelected && !recurrence) {
      const start = form.getValues("date") ?? new Date().toISOString();
      form.setValue("recurrence", {
        frequency: "MONTHLY",
        interval: 1,
        startDate: start,
        timezone: defaultTimezone,
      });
    }

    if (!isRecurringSelected) {
      form.setValue("recurrence", undefined);
    }
  }, [isRecurringSelected, recurrence, form, defaultTimezone]);

  useEffect(() => {
    if (!isRecurringSelected || !recurrence) return;

    const start = recurrence.startDate
      ? new Date(recurrence.startDate)
      : new Date(form.getValues("date") ?? new Date().toISOString());

    if (recurrence.frequency === "WEEKLY") {
      const day = start.getDay();
      if (recurrence.dayOfWeek !== day) {
        form.setValue("recurrence.dayOfWeek", day);
      }
    }

    if (recurrence.frequency === "MONTHLY") {
      const day = start.getDate();
      if (recurrence.dayOfMonth !== day) {
        form.setValue("recurrence.dayOfMonth", day);
      }
    }
  }, [isRecurringSelected, recurrence, form]);

  useEffect(() => {
    if (open) {
      form.reset(normalize(initialValues ?? undefined));
    }
  }, [open, initialValues, accountId, normalize, form]);

  const isEditing = Boolean(initialValues?.id);
  const isLoading = create.isPending || update.isPending;

  const handleSubmit = async (values: CreateTransactionInput) => {
    try {
      const finalValues = {
        ...values,
        accountId: values.accountId ?? accountId ?? "",
        recurrence: values.isRecurring ? values.recurrence : undefined,
      };

      if (
        finalValues.isRecurring &&
        finalValues.recurrence &&
        !finalValues.recurrence.startDate
      ) {
        finalValues.recurrence.startDate =
          finalValues.date ?? new Date().toISOString();
      }

      if (isEditing && initialValues?.id) {
        const payload = { id: initialValues.id, ...finalValues };
        await update.mutateAsync(payload);
        toast.success("Transaction updated");
        if (onSubmit) onSubmit(payload);
      } else {
        await create.mutateAsync(finalValues);
        toast.success("Transaction created");
        if (onSubmit) onSubmit(finalValues);
      }
      onOpenChange(false);
    } catch (err) {
      logger.error("Failed to save transaction", {
        error: err instanceof Error ? err.message : String(err),
      });
      toast.error("Failed to save transaction");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex h-full flex-col gap-0 border-l p-0 shadow-2xl sm:max-w-[560px]",
          isMobile ? "h-[95vh] rounded-t-xl border-l-0 sm:max-w-none" : "",
        )}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex h-full flex-col"
          >
            <SheetHeader className="bg-background border-b px-6 py-4">
              <SheetTitle className="text-xl font-semibold tracking-tight">
                {isEditing ? "Edit Transaction" : "New Transaction"}
              </SheetTitle>
              <SheetDescription className="text-sm">
                {isEditing
                  ? "Update transaction details"
                  : "Add a new transaction to your account"}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className={cn("space-y-5", className)}>
                <BasicInfoStep
                  form={form}
                  accounts={accounts}
                  accountId={accountId}
                  defaultAccountId={defaultAccountId}
                />

                <ReceiptStep form={form} categories={categories} />

                <CategoryStep form={form} categories={categories} />

                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add a note about this transaction..."
                          {...field}
                          value={field.value ?? ""}
                          className="bg-card h-10 border font-normal shadow-sm transition-shadow hover:shadow"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Internal notes or additional details..."
                          {...field}
                          value={field.value ?? ""}
                          className="bg-card h-10 border font-normal shadow-sm transition-shadow hover:shadow"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <RecurringStep
                  form={form}
                  isRecurringSelected={isRecurringSelected}
                />
              </div>
            </div>

            <SheetFooter className="bg-background mt-auto border-t px-6 py-4">
              <div className="flex w-full items-center justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="h-10 min-w-[100px] font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 min-w-[140px] font-semibold shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{isEditing ? "Save Changes" : "Create Transaction"}</>
                  )}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default TransactionForm;
