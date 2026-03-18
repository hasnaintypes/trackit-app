"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/trpc/react";
import { invalidateBudgets } from "@/trpc/invalidation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";
import { BudgetPeriod } from "@prisma/client";

import { Button } from "@ui/button";
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
import { Card, CardContent } from "@ui/card";

const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  period: z.nativeEnum(BudgetPeriod),
  startDate: z.date(),
});

type CreateBudgetValues = z.infer<typeof createBudgetSchema>;

export function BudgetQuickAdd() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

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
      setIsOpen(false);
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

  const flattenedCategories = (categories ?? []).flatMap((cat) => [
    { id: cat.id, name: cat.name, isParent: true },
    ...(cat.children ?? []).map((sub) => ({
      id: sub.id,
      name: `${cat.name} > ${sub.name}`,
      isParent: false,
    })),
  ]);

  if (!isOpen) {
    return (
      <Card
        className="hover:border-primary/50 cursor-pointer border-2 border-dashed transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <Plus className="text-primary h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold">Quick Add Budget</h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Click to create a new budget
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Create Budget</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsOpen(false);
              form.reset();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
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

              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createBudgetMutation.isPending}>
                {createBudgetMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Budget
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
