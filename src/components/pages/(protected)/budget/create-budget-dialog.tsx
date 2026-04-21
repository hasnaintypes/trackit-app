"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/trpc/react";
import { invalidateBudgets } from "@/trpc/invalidation";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Tag,
  ChevronDown,
  Check,
  CalendarRange,
} from "lucide-react";
import { BudgetPeriod } from "@prisma/client";
import { ICONS } from "@/constants/icons";

import { Button } from "@ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";
import { Input } from "@ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
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
} from "@ui/dropdown-menu";
import { ScrollArea } from "@ui/scroll-area";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  period: z.nativeEnum(BudgetPeriod),
  startDate: z.date(),
});

type CreateBudgetValues = z.infer<typeof createBudgetSchema>;

// ---------------------------------------------------------------------------
// Category helpers
// ---------------------------------------------------------------------------
interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  children?: CategoryItem[];
}

function toCategorySafe(c: unknown): CategoryItem {
  if (typeof c !== "object" || c === null)
    return { id: "", name: "", icon: null, color: null, children: [] };

  const obj = c as Record<string, unknown>;
  const childrenRaw = obj.children;
  const children = Array.isArray(childrenRaw)
    ? childrenRaw.map((ch) => {
        const chObj = ch as Record<string, unknown>;
        return {
          id: String(chObj.id),
          name: String(chObj.name),
          icon: typeof chObj.icon === "string" ? chObj.icon : null,
          color: typeof chObj.color === "string" ? chObj.color : null,
        };
      })
    : [];

  return {
    id: String(obj.id),
    name: String(obj.name),
    icon: typeof obj.icon === "string" ? obj.icon : null,
    color: typeof obj.color === "string" ? obj.color : null,
    children,
  };
}

function findCategory(
  id: string | null | undefined,
  list: CategoryItem[],
): CategoryItem | null {
  if (!id) return null;
  for (const cat of list) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = cat.children.find((c) => c.id === id);
      if (found) return found;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// CategoryIconInline — renders the icon inline for dropdown items
// ---------------------------------------------------------------------------
function CategoryIconInline({
  icon,
  color,
}: {
  icon?: string | null;
  color?: string | null;
}) {
  const IconEntry = ICONS.find((i) => i.name === icon);
  const IconComp = IconEntry?.Icon;
  const iconColor = color ?? undefined;

  if (IconComp) {
    return (
      <IconComp
        className="mr-2 h-4 w-4 shrink-0"
        style={iconColor ? { color: iconColor } : undefined}
      />
    );
  }
  return <Tag className="text-muted-foreground mr-2 h-3.5 w-3.5 shrink-0" />;
}

// ---------------------------------------------------------------------------
// Period config
// ---------------------------------------------------------------------------
const PERIOD_OPTIONS = [
  { value: BudgetPeriod.WEEKLY, label: "Weekly" },
  { value: BudgetPeriod.MONTHLY, label: "Monthly" },
  { value: BudgetPeriod.YEARLY, label: "Yearly" },
] as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CreateBudgetDialog() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: categories } = api.category.list.useQuery();

  const form = useForm<CreateBudgetValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(createBudgetSchema) as any,
    defaultValues: {
      categoryId: "",
      amount: 0,
      period: BudgetPeriod.MONTHLY,
      startDate: new Date(),
    },
  });

  const createBudgetMutation = api.budget.create.useMutation({
    onSuccess: () => {
      toast.success("Budget created successfully");
      setOpen(false);
      form.reset();
      void invalidateBudgets(utils);
    },
    onError: (error) => {
      toast.error(`Failed to create budget: ${error.message}`);
    },
  });

  const onSubmit = (data: CreateBudgetValues) => {
    createBudgetMutation.mutate(data);
  };

  const categoryList = useMemo(
    () => (categories ?? []).map(toCategorySafe),
    [categories],
  );

  const findCategoryCb = useCallback(
    (id: string | null | undefined) => findCategory(id, categoryList),
    [categoryList],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set spending limits for categories. You&apos;ll be alerted at 70%,
            90%, and 100%.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category + Period row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Category — hierarchical dropdown */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => {
                  const selectedCat = findCategoryCb(field.value);
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
                                "bg-card h-11 w-full justify-start border px-3 font-medium shadow-sm transition-shadow hover:shadow",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {selectedCat ? (
                                <span className="flex items-center">
                                  <CategoryIconInline
                                    icon={selectedCat.icon}
                                    color={selectedCat.color}
                                  />
                                  <span className="truncate">
                                    {selectedCat.name}
                                  </span>
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Tag className="text-muted-foreground mr-2 h-4 w-4" />
                                  <span>Select</span>
                                </span>
                              )}
                              <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-[220px]"
                          align="start"
                        >
                          <DropdownMenuLabel className="text-muted-foreground text-xs">
                            Select Category
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <ScrollArea className="max-h-[280px]">
                            {categoryList.map((c) => (
                              <React.Fragment key={c.id}>
                                {c.children && c.children.length > 0 ? (
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="flex items-center gap-2">
                                      <CategoryIconInline
                                        icon={c.icon}
                                        color={c.color}
                                      />
                                      <span>{c.name}</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      {c.children.map((sub) => (
                                        <DropdownMenuItem
                                          key={sub.id}
                                          onClick={() => field.onChange(sub.id)}
                                          className="flex items-center gap-2"
                                        >
                                          <CategoryIconInline
                                            icon={sub.icon}
                                            color={sub.color}
                                          />
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
                                    <CategoryIconInline
                                      icon={c.icon}
                                      color={c.color}
                                    />
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

              {/* Period */}
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Period
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-card h-11 w-full border font-medium shadow-sm">
                          <div className="flex items-center gap-2">
                            <CalendarRange className="text-muted-foreground h-4 w-4 shrink-0" />
                            <SelectValue placeholder="Period" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {PERIOD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
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

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                    Limit Amount
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 text-lg font-semibold">
                        $
                      </div>
                      <Input
                        {...field}
                        value={field.value || ""}
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        className="bg-card h-12 border pl-10 text-2xl font-bold tracking-tight tabular-nums shadow-sm transition-shadow hover:shadow"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                            field.onChange(value === "" ? "" : value);
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBudgetMutation.isPending}>
                {createBudgetMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Budget
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
