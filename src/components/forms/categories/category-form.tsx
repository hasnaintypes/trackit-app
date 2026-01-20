"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import { cn } from "@/lib/utils";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Palette,
  LayoutGrid,
  ArrowRight,
  Wallet,
  PiggyBank,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Validation & Hooks
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/validation/category";
import { useCategories } from "@/hooks/use-categories";

// Custom Pickers
import { IconPicker } from "@/components/common/icon-picker";
import { ColorPicker } from "@/components/common/color-picker";

type CategoryFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CreateCategoryInput> & { id?: string };
  onSubmit?: (values: CreateCategoryInput | UpdateCategoryInput) => void;
  className?: string;
};

export function CategoryForm({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  className,
}: CategoryFormProps) {
  const { all, create, update } = useCategories();

  const CATEGORY_TYPES = [
    { value: "EXPENSE", label: "Expense", icon: Wallet },
    { value: "INCOME", label: "Income", icon: PiggyBank },
    { value: "TRANSFER", label: "Transfer", icon: ArrowLeftRight },
  ] as const;

  const isEditing = !!initialValues?.id;
  const resolverSchema = isEditing
    ? updateCategorySchema
    : createCategorySchema;

  type FormValues = CreateCategoryInput | UpdateCategoryInput;

  const form = useForm<FormValues>({
    resolver: zodResolver(resolverSchema as ZodTypeAny),
    defaultValues: {
      name: "",
      parentCategoryId: undefined,
      type: "EXPENSE",
      color: "#3B82F6",
      icon: "circle",
      sortOrder: 0,
      ...initialValues,
    },
  });

  // Reset form on open
  useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        parentCategoryId: undefined,
        type: "EXPENSE",
        color: "#3B82F6",
        icon: "circle",
        ...initialValues,
      });
    }
  }, [open, initialValues, form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        // UPDATE
        const editingId = initialValues?.id;
        if (!editingId) throw new Error("Missing category id");

        const payload: UpdateCategoryInput = {
          id: editingId,
          ...values,
        };
        await update.mutateAsync(payload);
        toast.success("Category updated successfully");
        if (onSubmit) onSubmit(payload);
      } else {
        // CREATE
        await create.mutateAsync(values);
        toast.success("Category created successfully");
        if (onSubmit) onSubmit(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const isLoading = create.isPending || update.isPending;
  const isMobile = useIsMobile();

  const formContent = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-6 p-1", className)}
      >
        {/* SECTION 1: DETAILS */}
        <div className="space-y-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
            <LayoutGrid className="h-4 w-4" />
            <span>Category Details</span>
          </div>

          <div className="grid gap-4">
            {/* ROW 1: Name and Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Groceries"
                        {...field}
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_TYPES.map((t) => {
                          const Icon = t.icon;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              <span className="flex items-center gap-2">
                                <Icon className="text-muted-foreground h-4 w-4" />
                                {t.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ROW 2: Parent Category (Optional) */}
            {isEditing && !!initialValues?.parentCategoryId && (
              <FormField
                name="parentCategoryId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category (Optional)</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "none" ? undefined : v)
                      }
                      value={field.value ?? "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No Parent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Parent</SelectItem>
                        {(all.data ?? [])
                          .filter((c) => c.id !== initialValues?.id) // Prevent self-parenting
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* SECTION 2: APPEARANCE */}
        <div className="space-y-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="icon"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="w-full">
                      <IconPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="color"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1">
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="w-full">
                      <ColorPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-2 flex items-center justify-end gap-3 pt-4">
          <Button
            className="cursor-pointer"
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEditing ? "Save Changes" : "Create Category"}
                {!isEditing && (
                  <ArrowRight className="ml-2 h-4 w-4 opacity-50" />
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  return isMobile ? (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="px-4 pb-6">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle>
            {isEditing ? "Edit Category" : "New Category"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update your category details."
              : "Add a new category for your transactions."}
          </SheetDescription>
        </SheetHeader>
        <div className="max-h-[80vh] overflow-y-auto pb-8">{formContent}</div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your category details below."
              : "Create a new category to organize your expenses."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mr-4 flex-1 pr-4">{formContent}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryForm;
