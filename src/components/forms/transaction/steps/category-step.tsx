"use client";

import React, { useMemo, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@ui/form";
import { Button } from "@ui/button";
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
import {
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
import { cn } from "@/lib/utils";
import type { CreateTransactionInput } from "@/validation/transaction";

export interface CategoryItem {
  id: string;
  name: string;
  icon: string | null;
  children?: CategoryItem[];
}

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

function renderCategoryIcon(icon?: string | null) {
  if (!icon) {
    return <Tag className="text-muted-foreground mr-2 h-3.5 w-3.5" />;
  }
  const IconComponent = iconMap[icon.toLowerCase()];
  if (IconComponent) {
    return <IconComponent className="text-muted-foreground mr-2 h-4 w-4" />;
  }
  return <Tag className="text-muted-foreground mr-2 h-3.5 w-3.5" />;
}

function getCategoryDetails(
  id: string | null | undefined,
  list: CategoryItem[],
): CategoryItem | null {
  if (!id) return null;
  for (const cat of list) {
    if (cat.id === id) return cat;
    if (cat.children) {
      const found = cat.children.find((c: CategoryItem) => c.id === id);
      if (found) return found;
    }
  }
  return null;
}

function toCategorySafe(c: unknown): CategoryItem {
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
}

export interface CategoryStepProps {
  form: UseFormReturn<CreateTransactionInput>;
  categories: unknown[] | undefined;
}

const CategoryStep = React.memo(function CategoryStep({
  form,
  categories,
}: CategoryStepProps) {
  const categoryList = useMemo(
    () => (categories ?? []).map(toCategorySafe),
    [categories],
  );

  const getCategoryDetailsCb = useCallback(
    (id: string | null | undefined) => getCategoryDetails(id, categoryList),
    [categoryList],
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField
        name="categoryId"
        control={form.control}
        render={({ field }) => {
          const selectedCat = getCategoryDetailsCb(field.value);
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
                          <span className="truncate">{selectedCat.name}</span>
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
                <DropdownMenuContent className="w-[240px]" align="start">
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
                                  onClick={() => field.onChange(sub.id)}
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
                value={(field.value as string | undefined) ?? undefined}
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
  );
});

CategoryStep.displayName = "CategoryStep";

export { CategoryStep };
export default CategoryStep;
