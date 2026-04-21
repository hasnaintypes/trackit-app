"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@ui/popover";
import { Calendar } from "@ui/calendar";
import {
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateTransactionInput } from "@/validation/transaction";

export interface BasicInfoStepProps {
  form: UseFormReturn<CreateTransactionInput>;
}

const BasicInfoStep = React.memo(function BasicInfoStep({
  form,
}: BasicInfoStepProps) {
  return (
    <>
      <input type="hidden" {...form.register("accountId")} />
      <input type="hidden" {...form.register("receipt_url")} />

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
              <div className="relative">
                <div className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 text-lg font-semibold">
                  $
                </div>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="bg-card h-12 border pl-10 text-2xl font-bold tracking-tight tabular-nums shadow-sm transition-shadow hover:shadow"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
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
                  <SelectTrigger className="bg-card h-10 w-full border font-medium shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="DEBIT">
                      <span className="flex items-center gap-2">
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        <span className="font-medium text-red-500">Debit</span>
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
                        "bg-card h-10 w-full justify-start text-left font-medium shadow-sm",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? new Date(field.value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Pick"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(d) => d && field.onChange(d.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
});

BasicInfoStep.displayName = "BasicInfoStep";

export { BasicInfoStep };
export default BasicInfoStep;
