"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/trpc/react";
import { invalidateBudgets } from "@/lib/trpc/invalidation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { BudgetPeriod } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Zod schema for budget creation
const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  period: z.nativeEnum(BudgetPeriod),
  startDate: z.date(),
});

type CreateBudgetValues = z.infer<typeof createBudgetSchema>;

export function CreateBudgetDialog() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  // Fetch categories for the select dropdown
  const { data: categories } = api.category.list.useQuery();

  const form = useForm<CreateBudgetValues>({
    resolver: zodResolver(createBudgetSchema),
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

  // Flatten categories for easy selection (handling subcategories)
  const flattenedCategories = (categories ?? []).flatMap((cat) => [
    { id: cat.id, name: cat.name, isParent: true },
    ...(cat.children ?? []).map((sub) => ({
      id: sub.id,
      name: `${cat.name} > ${sub.name}`,
      isParent: false,
    })),
  ]);

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
            Set spending limits for categories. Alerts will trigger at 70%, 90%,
            and 100%.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Select */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {flattenedCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Input */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limit Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period Select */}
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={BudgetPeriod.WEEKLY}>
                        Weekly
                      </SelectItem>
                      <SelectItem value={BudgetPeriod.MONTHLY}>
                        Monthly
                      </SelectItem>
                      <SelectItem value={BudgetPeriod.YEARLY}>
                        Yearly
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
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
