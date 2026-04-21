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
import { RadioGroup, RadioGroupItem } from "@ui/radio-group";
import { Label } from "@ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@ui/popover";
import { Calendar } from "@ui/calendar";
import { Switch } from "@ui/switch";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateTransactionInput } from "@/validation/transaction";
import {
  FREQUENCY_OPTIONS,
  DAYS_OF_WEEK,
  WEEK_OF_MONTH_OPTIONS,
} from "@/constants/recurrence";
import type { MonthlyMode } from "@/constants/recurrence";

export interface RecurringStepProps {
  form: UseFormReturn<CreateTransactionInput>;
  isRecurringSelected: boolean | undefined;
}

const RecurringStep = React.memo(function RecurringStep({
  form,
  isRecurringSelected,
}: RecurringStepProps) {
  const frequency = form.watch("recurrence.frequency");
  const weekOfMonth = form.watch("recurrence.weekOfMonth");
  const lastDayOfMonth = form.watch("recurrence.lastDayOfMonth");

  // Determine if current state is "bi-weekly" (WEEKLY + interval=2)
  const interval = form.watch("recurrence.interval");
  const isBiweekly = frequency === "WEEKLY" && interval === 2;

  // Determine monthly mode from form state
  const monthlyMode: MonthlyMode = lastDayOfMonth
    ? "last-day"
    : typeof weekOfMonth === "number"
      ? "day-pattern"
      : "specific-day";

  const handleFrequencyChange = (value: string) => {
    if (value === "BIWEEKLY") {
      form.setValue("recurrence.frequency", "WEEKLY");
      form.setValue("recurrence.interval", 2);
    } else {
      form.setValue(
        "recurrence.frequency",
        value as "DAILY" | "WEEKLY" | "SEMI_MONTHLY" | "MONTHLY" | "YEARLY",
      );
      if (value !== "WEEKLY") {
        form.setValue("recurrence.interval", 1);
      }
      // Clear fields not relevant to new frequency
      if (value !== "SEMI_MONTHLY") {
        form.setValue("recurrence.semiMonthlyDay", undefined);
      }
      if (value !== "MONTHLY") {
        form.setValue("recurrence.weekOfMonth", undefined);
        form.setValue("recurrence.lastDayOfMonth", undefined);
      }
    }
  };

  const handleMonthlyModeChange = (mode: MonthlyMode) => {
    switch (mode) {
      case "specific-day":
        form.setValue("recurrence.weekOfMonth", undefined);
        form.setValue("recurrence.lastDayOfMonth", undefined);
        break;
      case "day-pattern":
        form.setValue("recurrence.lastDayOfMonth", undefined);
        if (!form.getValues("recurrence.weekOfMonth")) {
          form.setValue("recurrence.weekOfMonth", 1);
        }
        if (form.getValues("recurrence.dayOfWeek") === undefined) {
          form.setValue("recurrence.dayOfWeek", 1);
        }
        break;
      case "last-day":
        form.setValue("recurrence.weekOfMonth", undefined);
        form.setValue("recurrence.dayOfMonth", undefined);
        form.setValue("recurrence.lastDayOfMonth", true);
        break;
    }
  };

  // Display value for the frequency select
  const displayFrequency = isBiweekly ? "BIWEEKLY" : (frequency ?? "MONTHLY");

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="space-y-0.5">
          <p className="text-sm font-semibold">Recurring Transaction</p>
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
            {/* Frequency select */}
            <FormItem>
              <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Frequency
              </FormLabel>
              <Select
                onValueChange={handleFrequencyChange}
                value={displayFrequency}
              >
                <SelectTrigger className="bg-background h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            {/* Interval — hidden for bi-weekly and semi-monthly */}
            {!isBiweekly && frequency !== "SEMI_MONTHLY" && (
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-background h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* WEEKLY / BIWEEKLY: day of week */}
            {(frequency === "WEEKLY" || isBiweekly) && (
              <FormField
                name="recurrence.dayOfWeek"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Day of week
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value ?? 1)}
                      >
                        <SelectTrigger className="bg-background h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((d) => (
                            <SelectItem key={d.value} value={String(d.value)}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* SEMI_MONTHLY: two day pickers */}
            {frequency === "SEMI_MONTHLY" && (
              <>
                <FormField
                  name="recurrence.dayOfMonth"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        First day
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
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
                  name="recurrence.semiMonthlyDay"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        Second day
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={field.value ?? 15}
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
              </>
            )}

            {/* MONTHLY: mode selector */}
            {frequency === "MONTHLY" && (
              <div className="col-span-full space-y-3">
                <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Repeat on
                </FormLabel>
                <RadioGroup
                  value={monthlyMode}
                  onValueChange={(v) =>
                    handleMonthlyModeChange(v as MonthlyMode)
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="specific-day" id="specific-day" />
                    <Label htmlFor="specific-day" className="text-sm">
                      Specific day of month
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="day-pattern" id="day-pattern" />
                    <Label htmlFor="day-pattern" className="text-sm">
                      Day pattern (e.g., 2nd Tuesday)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="last-day" id="last-day" />
                    <Label htmlFor="last-day" className="text-sm">
                      Last day of month
                    </Label>
                  </div>
                </RadioGroup>

                {/* Specific day input */}
                {monthlyMode === "specific-day" && (
                  <FormField
                    name="recurrence.dayOfMonth"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={31}
                            placeholder="Day (1-31)"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                            className="bg-background h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Day pattern selects */}
                {monthlyMode === "day-pattern" && (
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      name="recurrence.weekOfMonth"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={(v) => field.onChange(Number(v))}
                              value={String(field.value ?? 1)}
                            >
                              <SelectTrigger className="bg-background h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {WEEK_OF_MONTH_OPTIONS.map((w) => (
                                  <SelectItem
                                    key={w.value}
                                    value={String(w.value)}
                                  >
                                    {w.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="recurrence.dayOfWeek"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              onValueChange={(v) => field.onChange(Number(v))}
                              value={String(field.value ?? 1)}
                            >
                              <SelectTrigger className="bg-background h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS_OF_WEEK.map((d) => (
                                  <SelectItem
                                    key={d.value}
                                    value={String(d.value)}
                                  >
                                    {d.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Start Date */}
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
                            ? new Date(field.value).toLocaleDateString()
                            : "Pick date"}
                          <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(d) => d && field.onChange(d.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
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
                            ? new Date(field.value).toLocaleDateString()
                            : "No end date"}
                          <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(d) =>
                          field.onChange(d ? d.toISOString() : undefined)
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
  );
});

RecurringStep.displayName = "RecurringStep";

export { RecurringStep };
export default RecurringStep;
