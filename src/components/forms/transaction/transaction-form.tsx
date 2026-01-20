/* eslint-disable @typescript-eslint/no-base-to-string */
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  CalendarIcon,
  Tag,
  ChevronDown,
  Check,
  PiggyBank,
  Briefcase,
  Wallet,
  TrendingUp,
  TrendingDown,
  Gift,
  Home,
  Utensils,
  Fuel,
  Zap,
  Pill,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Music,
  Plane,
  BookOpen,
  Dumbbell,
  Heart,
  MapPin,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Calendar } from "@/components/ui/calendar";
import { api } from "@/trpc/react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";

import { createTransactionSchema } from "@/validation/transaction";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  RecurrenceInput,
} from "@/validation/transaction";

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
  const { categories } = useCategories();
  const { create, update } = useTransactions();
  const utils = api.useContext();
  const defaultTimezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    [],
  );

  // Helper to find category name/icon for the trigger button
  interface CategoryItem {
    id: string;
    name: string;
    icon: string | null;
    children?: CategoryItem[];
  }

  const getCategoryDetails = (
    id: string | null | undefined,
    list: CategoryItem[],
  ): CategoryItem | null => {
    if (!id) return null;
    for (const cat of list) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = cat.children.find((c: CategoryItem) => c.id === id);
        if (found) return found;
      }
    }
    return null;
  };

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
        accountId: vals?.accountId ?? accountId ?? "",
        amount: vals?.amount ?? "",
        type: vals?.type ?? "DEBIT",
        categoryId: vals?.categoryId ?? undefined,
        description: vals?.description ?? undefined,
        paymentMethod: vals?.paymentMethod ?? undefined,
        receipt_url: vals?.receipt_url ?? undefined,
        receipt_extracted_text: vals?.receipt_extracted_text ?? undefined,
        date: start,
        isRecurring: vals?.isRecurring ?? Boolean(recurrence),
        recurrence,
      };
    },
    [accountId, defaultTimezone],
  );

  const form = useForm<CreateTransactionInput>({
    // Ensure the resolver is typed to the same CreateTransactionInput generic so
    // react-hook-form's internal types align with the zod schema. This avoids
    // incompatible resolver/control generic errors caused by type inference.
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

  const uploadReceiptMutation = api.transaction.uploadReceipt.useMutation();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(
    null,
  );

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
      await utils.transaction.list.invalidate();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save transaction");
    }
  };

  // Safe category mapper that preserves icons if they exist in your DB
  const toCategorySafe = React.useCallback((c: unknown): CategoryItem => {
    if (typeof c !== "object" || c === null)
      return { id: "", name: "", icon: null, children: [] };

    const obj = c as Record<string, unknown>;
    const childrenRaw = obj.children;
    const children = Array.isArray(childrenRaw)
      ? childrenRaw.map((ch) => {
          const chObj = ch as Record<string, unknown>;
          return {
            id: String(chObj.id),
            name: String(chObj.name),
            icon: typeof chObj.icon === "string" ? chObj.icon : null,
          };
        })
      : [];

    return {
      id: String(obj.id),
      name: String(obj.name),
      icon: typeof obj.icon === "string" ? obj.icon : null,
      children,
    };
  }, []);

  const categoryList = useMemo(
    () => (categories ?? []).map(toCategorySafe),
    [categories, toCategorySafe],
  );

  // Function to render category icon (Lucide React icons)
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "piggy-bank": PiggyBank,
    briefcase: Briefcase,
    wallet: Wallet,
    "trending-up": TrendingUp,
    "trending-down": TrendingDown,
    gift: Gift,
    home: Home,
    utensils: Utensils,
    fuel: Fuel,
    zap: Zap,
    pill: Pill,
    "shopping-cart": ShoppingCart,
    "credit-card": CreditCard,
    smartphone: Smartphone,
    music: Music,
    plane: Plane,
    "book-open": BookOpen,
    dumbbell: Dumbbell,
    heart: Heart,
    "map-pin": MapPin,
    wrench: Wrench,
    "alert-circle": AlertCircle,
  };

  const renderCategoryIcon = (icon?: string | null) => {
    if (!icon) {
      return <Tag className="text-muted-foreground mr-2 h-3.5 w-3.5" />;
    }

    const IconComponent = iconMap[icon.toLowerCase()];
    if (IconComponent) {
      return <IconComponent className="text-muted-foreground mr-2 h-4 w-4" />;
    }

    // Fallback to Tag if icon name not found
    return <Tag className="text-muted-foreground mr-2 h-3.5 w-3.5" />;
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
                <input type="hidden" {...form.register("accountId")} />
                <input type="hidden" {...form.register("receipt_url")} />

                <div className="group border-border from-primary/5 via-primary/3 hover:border-primary/30 relative overflow-hidden rounded-xl border bg-gradient-to-br to-transparent p-4 transition-all">
                  <div className="relative flex items-start gap-4">
                    <div className="bg-primary/10 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1 transition-all">
                      <Zap className="text-primary h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">
                          AI Receipt Scanner
                        </h4>
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                          Beta
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {selectedFileName ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="font-medium">
                              {selectedFileName}
                            </span>
                          </span>
                        ) : (
                          "Upload a receipt to auto-fill transaction details"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      id="receipt-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setSelectedFile(f);
                        setSelectedFileName(f ? f.name : null);
                      }}
                    />
                    <label htmlFor="receipt-file-input" className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full cursor-pointer bg-transparent font-medium"
                        asChild
                      >
                        <span>
                          {selectedFile ? "Change File" : "Choose Receipt"}
                        </span>
                      </Button>
                    </label>
                    {selectedFile && (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-9 min-w-[80px] font-medium"
                        disabled={uploadReceiptMutation.status === "pending"}
                        onClick={async () => {
                          if (!selectedFile) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const result = reader.result;
                            if (typeof result !== "string") return;
                            try {
                              const res =
                                await uploadReceiptMutation.mutateAsync({
                                  fileDataUrl: result,
                                  fileName: selectedFile.name,
                                });
                              if (res?.url) {
                                form.setValue("receipt_url", res.url);
                                toast.success("Receipt uploaded");

                                // Call AI receipt scanner to autofill fields
                                try {
                                  const aiResp = await fetch(
                                    "/api/ai/scan-receipt",
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      // Send the raw file data URL directly so the AI can consume the image
                                      // (preferred over relying on a hosted URL).
                                      body: JSON.stringify({
                                        fileDataUrl: result,
                                        // Also include the stored URL for compatibility / persistence
                                        imageUrl: res.url,
                                        categories: (categories ?? []).map(
                                          (c) => {
                                            const cat = c as unknown as Record<
                                              string,
                                              unknown
                                            >;
                                            return {
                                              id: String(cat.id ?? ""),
                                              name: String(cat.name ?? ""),
                                              type: String(
                                                cat.type ?? "EXPENSE",
                                              ),
                                              parentCategoryId:
                                                typeof cat.parentCategoryId ===
                                                "string"
                                                  ? cat.parentCategoryId
                                                  : null,
                                              subcategories: Array.isArray(
                                                cat.children,
                                              )
                                                ? cat.children.map((s) => {
                                                    const sub = s as Record<
                                                      string,
                                                      unknown
                                                    >;
                                                    return {
                                                      id: String(sub.id ?? ""),
                                                      name: String(
                                                        sub.name ?? "",
                                                      ),
                                                      type: String(
                                                        sub.type ?? "EXPENSE",
                                                      ),
                                                    };
                                                  })
                                                : [],
                                            };
                                          },
                                        ),
                                      }),
                                    },
                                  );
                                  const jsonPayload =
                                    (await aiResp.json()) as unknown;
                                  let scan:
                                    | Record<string, unknown>
                                    | undefined = undefined;
                                  if (
                                    jsonPayload &&
                                    typeof jsonPayload === "object" &&
                                    jsonPayload !== null &&
                                    Object.prototype.hasOwnProperty.call(
                                      jsonPayload,
                                      "result",
                                    )
                                  ) {
                                    const obj = jsonPayload as Record<
                                      string,
                                      unknown
                                    >;
                                    const maybeResult = obj.result;
                                    if (
                                      maybeResult &&
                                      typeof maybeResult === "object"
                                    ) {
                                      scan = maybeResult as Record<
                                        string,
                                        unknown
                                      >;
                                    }
                                  }
                                  if (scan) {
                                    // description
                                    if (
                                      typeof scan.description === "string" &&
                                      scan.description.trim()
                                    ) {
                                      form.setValue(
                                        "description",
                                        scan.description.trim(),
                                      );
                                    }
                                    // amount
                                    if (
                                      typeof scan.amount === "string" &&
                                      scan.amount.trim()
                                    ) {
                                      form.setValue(
                                        "amount",
                                        scan.amount.trim(),
                                      );
                                    }
                                    // date
                                    if (
                                      typeof scan.date === "string" &&
                                      scan.date.trim()
                                    ) {
                                      try {
                                        const d = new Date(scan.date);
                                        if (!Number.isNaN(d.getTime())) {
                                          form.setValue(
                                            "date",
                                            d.toISOString(),
                                          );
                                        }
                                      } catch (e) {
                                        /* ignore invalid date */
                                        console.log(e);
                                      }
                                    }
                                    // paymentMethod - validate against allowed enum values
                                    if (
                                      typeof scan.paymentMethod === "string" &&
                                      scan.paymentMethod.trim()
                                    ) {
                                      const pmCandidate = scan.paymentMethod
                                        .trim()
                                        .toUpperCase();
                                      const ALLOWED_PM = [
                                        "CARD",
                                        "CASH",
                                        "BANK_TRANSFER",
                                        "AUTO_DEBIT",
                                        "UPI",
                                        "OTHER",
                                      ] as const;
                                      if (
                                        (
                                          ALLOWED_PM as readonly string[]
                                        ).includes(pmCandidate)
                                      ) {
                                        form.setValue(
                                          "paymentMethod",
                                          pmCandidate as CreateTransactionInput["paymentMethod"],
                                        );
                                      }
                                    }
                                    // recurring
                                    if (
                                      scan.isRecurring === true ||
                                      scan.isRecurring === "true"
                                    ) {
                                      form.setValue("isRecurring", true);
                                      const rec = scan.recurrence as
                                        | Record<string, unknown>
                                        | undefined;
                                      if (rec) {
                                        const recurrencePayload: Partial<RecurrenceInput> =
                                          {};
                                        if (typeof rec.frequency === "string")
                                          recurrencePayload.frequency =
                                            rec.frequency as RecurrenceInput["frequency"];
                                        if (typeof rec.interval === "number")
                                          recurrencePayload.interval =
                                            rec.interval;
                                        if (typeof rec.dayOfMonth === "number")
                                          recurrencePayload.dayOfMonth =
                                            rec.dayOfMonth;
                                        if (typeof rec.dayOfWeek === "number")
                                          recurrencePayload.dayOfWeek =
                                            rec.dayOfWeek;
                                        if (typeof rec.startDate === "string")
                                          recurrencePayload.startDate =
                                            rec.startDate;
                                        if (typeof rec.endDate === "string")
                                          recurrencePayload.endDate =
                                            rec.endDate;
                                        if (typeof rec.timezone === "string")
                                          recurrencePayload.timezone =
                                            rec.timezone;
                                        form.setValue(
                                          "recurrence",
                                          recurrencePayload as RecurrenceInput,
                                        );
                                      }
                                    }
                                    toast.success(
                                      "Receipt scanned — form autofilled (verify values)",
                                    );
                                  }
                                } catch (err) {
                                  console.error("AI receipt scan failed:", err);
                                  // don't fail the form save on AI errors
                                }
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to upload receipt");
                            }
                          };
                          reader.readAsDataURL(selectedFile);
                        }}
                      >
                        {uploadReceiptMutation.status === "pending" ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Scanning
                          </>
                        ) : (
                          "Scan Now"
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-5 shadow-sm">
                  <div className="space-y-4">
                    {/* Amount - Large and prominent */}
                    <FormField
                      name="amount"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Amount
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 text-2xl font-bold">
                                $
                              </div>
                              <Input
                                {...field}
                                value={field.value ?? ""}
                                type="text"
                                inputMode="decimal"
                                placeholder="0.00"
                                className="bg-muted/40 focus-visible:bg-muted/60 h-14 border-0 pl-10 text-3xl font-bold tracking-tight tabular-nums transition-colors"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (
                                    value === "" ||
                                    /^\d*\.?\d{0,2}$/.test(value)
                                  ) {
                                    field.onChange(value);
                                  }
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Type and Date - side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                              Type
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value ?? "DEBIT"}
                              >
                                <SelectTrigger className="bg-muted/40 h-10 border-0 font-medium">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  <SelectItem value="DEBIT">
                                    <span className="flex items-center gap-2">
                                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                                      <span className="font-medium text-red-500">
                                        Debit
                                      </span>
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="CREDIT">
                                    <span className="flex items-center gap-2">
                                      <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                                      <span className="font-medium text-green-500">
                                        Credit
                                      </span>
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="TRANSFER">
                                    <span className="flex items-center gap-2">
                                      <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                                      <span className="font-medium text-blue-500">
                                        Transfer
                                      </span>
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="date"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                              Date
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "bg-muted/40 h-10 w-full justify-start border-0 text-left font-medium",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value
                                      ? new Date(
                                          field.value,
                                        ).toLocaleDateString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                        })
                                      : "Pick"}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="end"
                              >
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(d) =>
                                    d && field.onChange(d.toISOString())
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    name="categoryId"
                    control={form.control}
                    render={({ field }) => {
                      const selectedCat = getCategoryDetails(
                        field.value,
                        categoryList,
                      );
                      return (
                        <FormItem>
                          <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            Category
                          </FormLabel>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "bg-card h-11 w-full justify-start border px-4 font-medium shadow-sm transition-shadow hover:shadow",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {selectedCat ? (
                                    <span className="flex items-center gap-2.5">
                                      {renderCategoryIcon(selectedCat.icon)}
                                      <span className="truncate">
                                        {selectedCat.name}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2.5">
                                      <Tag className="text-muted-foreground h-4 w-4" />
                                      <span>Uncategorized</span>
                                    </span>
                                  )}
                                  <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-[240px]"
                              align="start"
                            >
                              <DropdownMenuLabel className="text-muted-foreground text-xs">
                                Select Category
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <ScrollArea className="max-h-[320px]">
                                {categoryList.map((c) => (
                                  <React.Fragment key={c.id}>
                                    {c.children && c.children.length > 0 ? (
                                      <DropdownMenuSub>
                                        <DropdownMenuSubTrigger className="flex items-center gap-2">
                                          {renderCategoryIcon(c.icon)}
                                          <span>{c.name}</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          {c.children.map((sub) => (
                                            <DropdownMenuItem
                                              key={sub.id}
                                              onClick={() =>
                                                field.onChange(sub.id)
                                              }
                                              className="flex items-center gap-2"
                                            >
                                              {renderCategoryIcon(sub.icon)}
                                              <span>{sub.name}</span>
                                              {field.value === sub.id && (
                                                <Check className="ml-auto h-4 w-4" />
                                              )}
                                            </DropdownMenuItem>
                                          ))}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => field.onChange(c.id)}
                                        className="flex items-center gap-2"
                                      >
                                        {renderCategoryIcon(c.icon)}
                                        <span>{c.name}</span>
                                        {field.value === c.id && (
                                          <Check className="ml-auto h-4 w-4" />
                                        )}
                                      </DropdownMenuItem>
                                    )}
                                  </React.Fragment>
                                ))}
                              </ScrollArea>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    name="paymentMethod"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          Payment Method
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={
                              (field.value as string | undefined) ?? undefined
                            }
                          >
                            <SelectTrigger className="bg-card h-11 w-full border px-4 font-medium shadow-sm transition-shadow hover:shadow">
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CARD">
                                <span className="flex items-center gap-2">
                                  <CreditCard className="h-3.5 w-3.5" />
                                  Card
                                </span>
                              </SelectItem>
                              <SelectItem value="CASH">
                                <span className="flex items-center gap-2">
                                  <Wallet className="h-3.5 w-3.5" />
                                  Cash
                                </span>
                              </SelectItem>
                              <SelectItem value="BANK_TRANSFER">
                                <span className="flex items-center gap-2">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  Bank Transfer
                                </span>
                              </SelectItem>
                              <SelectItem value="AUTO_DEBIT">
                                <span className="flex items-center gap-2">
                                  <Zap className="h-3.5 w-3.5" />
                                  Auto Debit
                                </span>
                              </SelectItem>
                              <SelectItem value="UPI">
                                <span className="flex items-center gap-2">
                                  <Smartphone className="h-3.5 w-3.5" />
                                  UPI
                                </span>
                              </SelectItem>
                              <SelectItem value="OTHER">
                                <span className="flex items-center gap-2">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  Other
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
                  <div className="flex items-center justify-between p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold">
                        Recurring Transaction
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Automatically repeat this transaction
                      </p>
                    </div>
                    <FormField
                      name="isRecurring"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={!!field.value}
                              onCheckedChange={(v) => field.onChange(v)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {isRecurringSelected && (
                    <div className="animate-in slide-in-from-top-2 bg-muted/30 border-t p-4 duration-300">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          name="recurrence.frequency"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Frequency
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  value={
                                    (field.value as string | undefined) ??
                                    "MONTHLY"
                                  }
                                >
                                  <SelectTrigger className="bg-background h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="DAILY">Daily</SelectItem>
                                    <SelectItem value="WEEKLY">
                                      Weekly
                                    </SelectItem>
                                    <SelectItem value="MONTHLY">
                                      Monthly
                                    </SelectItem>
                                    <SelectItem value="YEARLY">
                                      Yearly
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="recurrence.interval"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Every
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  value={field.value ?? 1}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  className="bg-background h-9"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="recurrence.startDate"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                Start Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "bg-background h-9 w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value
                                        ? new Date(
                                            field.value,
                                          ).toLocaleDateString()
                                        : "Pick date"}
                                      <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(d) =>
                                      d && field.onChange(d.toISOString())
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="recurrence.endDate"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                End Date
                                <span className="text-muted-foreground/60 ml-1 text-[10px] font-normal lowercase">
                                  (optional)
                                </span>
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "bg-background h-9 w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value
                                        ? new Date(
                                            field.value,
                                          ).toLocaleDateString()
                                        : "No end date"}
                                      <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={(d) =>
                                      field.onChange(
                                        d ? d.toISOString() : undefined,
                                      )
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
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
