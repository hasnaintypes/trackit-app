"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@ui/sheet";
import { Calendar } from "@ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
import {
  CalendarIcon,
  Loader2,
  Sparkles,
  Wand2,
  Equal,
  Hash,
  Percent,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/trpc/react";
import type { GroupMember } from "@/types/group";
import type { SplitMethod } from "@/types/expense";
import { SplitInput } from "./split-input";
import type { SplitParticipant } from "./split-input";
import type { CreateExpenseInput } from "@/validation/expense";

const formSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  amount: z.number().min(0.01, "Amount must be positive"),
  date: z.date().optional(),
  splitMethod: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARES"]),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SPLIT_METHODS: {
  value: SplitMethod;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "EQUAL",
    label: "Equal",
    description: "Split evenly",
    icon: Equal,
  },
  {
    value: "EXACT",
    label: "Exact",
    description: "Set amounts",
    icon: Hash,
  },
  {
    value: "PERCENTAGE",
    label: "Percent",
    description: "By percentage",
    icon: Percent,
  },
  {
    value: "SHARES",
    label: "Shares",
    description: "By ratio",
    icon: Users,
  },
];

const VALID_SPLIT_METHODS = new Set<string>([
  "EQUAL",
  "EXACT",
  "PERCENTAGE",
  "SHARES",
]);

function normalizeSplitMethod(raw: string): FormValues["splitMethod"] {
  const upper = raw.toUpperCase();
  if (VALID_SPLIT_METHODS.has(upper)) return upper as FormValues["splitMethod"];
  return "EQUAL";
}

interface ExpenseFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  members: GroupMember[];
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
  isSubmitting?: boolean;
}

function buildParticipants(members: GroupMember[]): SplitParticipant[] {
  return members.map((m, i) => ({
    contactId: m.contactId,
    name: m.contact?.name ?? "You",
    avatarUrl: m.contact?.avatarUrl ?? null,
    isPayer: i === 0,
    paidAmount: 0,
    customValue: undefined,
  }));
}

export function ExpenseFormSheet({
  open,
  onOpenChange,
  groupId,
  members,
  onSubmit,
  isSubmitting,
}: ExpenseFormSheetProps) {
  const isMobile = useIsMobile();
  const [aiText, setAiText] = useState("");
  const prevOpenRef = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      splitMethod: "EQUAL",
      notes: "",
    },
  });

  const splitMethod = form.watch("splitMethod") as SplitMethod;
  const amount = form.watch("amount");

  const baseParticipants = useMemo(() => buildParticipants(members), [members]);

  const [participants, setParticipants] =
    useState<SplitParticipant[]>(baseParticipants);

  // Reset form only on open transition (false → true)
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;

    if (open && !wasOpen) {
      form.reset({
        description: "",
        amount: 0,
        date: new Date(),
        splitMethod: "EQUAL",
        notes: "",
      });
      setParticipants(buildParticipants(members));
      setAiText("");
    }
  }, [open, members, form]);

  // Sync paidAmount when amount changes (don't touch other fields)
  useEffect(() => {
    if (!open) return;
    setParticipants((prev) => {
      const payers = prev.filter((p) => p.isPayer);
      if (payers.length === 0) return prev;
      const perPayer = Math.round((amount / payers.length) * 100) / 100;
      return prev.map((p) => ({
        ...p,
        paidAmount: p.isPayer ? perPayer : 0,
      }));
    });
  }, [amount, open]);

  // Sync customValue defaults when splitMethod changes
  useEffect(() => {
    if (!open) return;
    setParticipants((prev) =>
      prev.map((p) => ({
        ...p,
        customValue:
          splitMethod === "SHARES"
            ? 1
            : splitMethod === "PERCENTAGE"
              ? Math.round(100 / (prev.length || 1))
              : splitMethod === "EXACT"
                ? Math.round((amount / (prev.length || 1)) * 100) / 100
                : undefined,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitMethod, open]);

  // AI parse mutation
  const parseExpense = api.ai.parseExpense.useMutation();

  const handleAiParse = useCallback(async () => {
    if (!aiText.trim()) return;
    try {
      const result = await parseExpense.mutateAsync({
        text: aiText,
        groupId,
      });

      // Set form values
      if (result.amount) form.setValue("amount", result.amount);
      if (result.description) form.setValue("description", result.description);
      if (result.splitMethod) {
        form.setValue("splitMethod", normalizeSplitMethod(result.splitMethod));
      }

      // Update participants: set payer + paidAmount in one shot
      const parsedAmount = result.amount ?? 0;
      setParticipants((prev) =>
        prev.map((p) => {
          const isThePayer = result.payer
            ? result.payer === "self"
              ? p.contactId === null
              : p.name.toLowerCase() === result.payer.toLowerCase()
            : p.isPayer;

          return {
            ...p,
            isPayer: isThePayer,
            paidAmount: isThePayer ? parsedAmount : 0,
          };
        }),
      );

      toast.success("Parsed expense from text");
    } catch {
      toast.error("Failed to parse expense");
    }
  }, [aiText, groupId, parseExpense, form]);

  // AI suggest split mutation
  const suggestSplit = api.ai.suggestSplit.useMutation();

  const handleSuggestSplit = useCallback(async () => {
    const desc = form.getValues("description");
    const amt = form.getValues("amount");
    if (!desc || !amt) {
      toast.error("Enter description and amount first");
      return;
    }
    try {
      const result = await suggestSplit.mutateAsync({
        groupId,
        description: desc,
        amount: amt,
      });
      if (result.suggestedMethod) {
        form.setValue(
          "splitMethod",
          normalizeSplitMethod(result.suggestedMethod),
        );
      }
      toast.success(result.reasoning);
    } catch {
      toast.error("Failed to get split suggestion");
    }
  }, [groupId, suggestSplit, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      await onSubmit({
        groupId,
        description: values.description,
        amount: values.amount,
        date: values.date,
        splitMethod: values.splitMethod,
        notes: values.notes,
        participants: participants.map((p) => ({
          contactId: p.contactId,
          isPayer: p.isPayer,
          paidAmount: p.paidAmount,
          customValue: p.customValue,
        })),
        linkTransaction: false,
      });
      onOpenChange(false);
    } catch {
      toast.error("Failed to create expense");
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
                New Expense
              </SheetTitle>
              <SheetDescription className="text-sm">
                Add a shared expense to split with the group
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                {/* AI Parse Section */}
                <div className="space-y-2">
                  <label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Quick Add with AI
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder='e.g. "Dinner at Olive Garden, $85, I paid, split with Alex and Sara"'
                      value={aiText}
                      onChange={(e) => setAiText(e.target.value)}
                      className="bg-card min-h-[60px] border shadow-sm"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAiParse}
                      disabled={parseExpense.isPending || !aiText.trim()}
                      className="h-auto min-h-[60px] w-12 shrink-0"
                    >
                      {parseExpense.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Amount */}
                <FormField
                  name="amount"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          className="bg-card h-12 border text-2xl font-bold shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
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
                          placeholder="What was this expense for?"
                          {...field}
                          className="bg-card h-10 border shadow-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
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
                                "bg-card h-10 w-full justify-start border text-left font-normal shadow-sm",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Split Method — proper button group */}
                <FormField
                  name="splitMethod"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                          Split Method
                        </FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleSuggestSplit}
                          disabled={suggestSplit.isPending}
                          className="h-6 gap-1 text-xs"
                        >
                          {suggestSplit.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Suggest
                        </Button>
                      </div>
                      <FormControl>
                        <div className="grid grid-cols-4 gap-1.5">
                          {SPLIT_METHODS.map((method) => {
                            const active = field.value === method.value;
                            const Icon = method.icon;
                            return (
                              <button
                                key={method.value}
                                type="button"
                                onClick={() => field.onChange(method.value)}
                                className={cn(
                                  "flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all",
                                  active
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-card hover:bg-accent border-border hover:border-primary/30",
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                <span>{method.label}</span>
                                <span
                                  className={cn(
                                    "text-[10px] font-normal",
                                    active
                                      ? "text-primary-foreground/70"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {method.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Split Input */}
                <SplitInput
                  totalAmount={amount}
                  splitMethod={splitMethod}
                  participants={participants}
                  onChange={setParticipants}
                  formatAmount={(v) => `${Number(v).toFixed(2)}`}
                />

                {/* Notes */}
                <FormField
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes..."
                          {...field}
                          value={field.value ?? ""}
                          className="bg-card min-h-[60px] border shadow-sm"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SheetFooter className="bg-background mt-auto border-t px-6 py-4">
              <div className="flex w-full items-center justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="h-10 min-w-[100px] font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 min-w-[140px] font-semibold shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Expense"
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
