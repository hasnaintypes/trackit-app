"use client";

import React, { useEffect } from "react";
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
import { ArrowRight, CalendarIcon, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateNamedAvatar } from "@/lib/shared/avatar";
import type { CreateSettlementInput } from "@/validation/settlement";

const formSchema = z.object({
  amount: z.number().min(0.01, "Amount must be positive"),
  date: z.date().optional(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SettleUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  from: {
    contactId: string | null;
    name: string;
    avatarUrl?: string | null;
  } | null;
  to: {
    contactId: string | null;
    name: string;
    avatarUrl?: string | null;
  } | null;
  amount: number;
  onSubmit: (data: CreateSettlementInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function SettleUpDialog({
  open,
  onOpenChange,
  groupId,
  from,
  to,
  amount,
  onSubmit,
  isSubmitting,
}: SettleUpDialogProps) {
  const isMobile = useIsMobile();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount, date: new Date(), notes: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ amount, date: new Date(), notes: "" });
    }
  }, [open, amount, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!from || !to) return;
    try {
      await onSubmit({
        groupId,
        fromContactId: from.contactId,
        toContactId: to.contactId,
        amount: values.amount,
        date: values.date,
        notes: values.notes,
        linkTransaction: false,
      });
      toast.success("Settlement recorded");
      onOpenChange(false);
    } catch {
      toast.error("Failed to record settlement");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          isMobile
            ? "max-h-[92vh] overflow-y-auto rounded-t-2xl"
            : "w-full overflow-y-auto sm:max-w-md",
        )}
      >
        <SheetHeader>
          <SheetTitle>Settle Up</SheetTitle>
          <SheetDescription>Record a payment between members</SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-4">
          {/* From → To visual */}
          {from && to && (
            <div className="flex items-center justify-center gap-4 rounded-xl border p-4">
              <div className="flex flex-col items-center gap-1.5">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={from.avatarUrl ?? generateNamedAvatar(from.name)}
                  />
                  <AvatarFallback className="bg-rose-100 text-sm font-medium text-rose-600 dark:bg-rose-900/60 dark:text-rose-400">
                    {from.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{from.name}</span>
              </div>
              <ArrowRight className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="flex flex-col items-center gap-1.5">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={to.avatarUrl ?? generateNamedAvatar(to.name)}
                  />
                  <AvatarFallback className="bg-emerald-100 text-sm font-medium text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400">
                    {to.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{to.name}</span>
              </div>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
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
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        className="bg-card h-12 border text-xl font-bold shadow-sm"
                      />
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
                        placeholder="Optional notes..."
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

              <SheetFooter className="px-0 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record Settlement"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
