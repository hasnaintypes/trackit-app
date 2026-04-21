"use client";

import React, { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@ui/sheet";
import { Separator } from "@ui/separator";
import { ScrollArea } from "@ui/scroll-area";
import { useCategories } from "@/hooks/use-categories";
import {
  createSubcategorySchema,
  type CreateSubcategoryInput,
  type UpdateSubcategoryInput,
} from "@/validation/category";
import { Loader2, LayoutGrid, Palette, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { IconPicker } from "@common/pickers/icon-picker";
import { ColorPicker } from "@common/pickers/color-picker";
import { createLogger } from "@/lib/logging";

const logger = createLogger("subcategory-form");

type SubcategoryFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: {
    id?: string;
    name?: string;
    parentId?: string | null;
    icon?: string | null;
    color?: string | null;
    sortOrder?: number | null;
  };
  onSubmit?: (values: CreateSubcategoryInput | UpdateSubcategoryInput) => void;
  className?: string;
};

export function SubcategoryForm({
  open,
  onOpenChange,
  initialValues,
  onSubmit,
  className,
}: SubcategoryFormProps) {
  const { all, createSubcategory, updateSubcategory } = useCategories();
  const isMobile = useIsMobile();

  type FormValues = CreateSubcategoryInput;

  const normalize = React.useCallback(
    (vals?: SubcategoryFormProps["initialValues"]) => ({
      name: vals?.name ?? "",
      parentId: vals?.parentId ?? undefined,
      icon: vals?.icon ?? undefined,
      color: vals?.color ?? undefined,
      sortOrder: vals?.sortOrder ?? undefined,
    }),
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(
      createSubcategorySchema,
    ) as unknown as Resolver<FormValues>,
    defaultValues: normalize(initialValues),
  });

  useEffect(() => {
    if (open) {
      form.reset(normalize(initialValues));
    }
  }, [open, initialValues, form, normalize]);

  const handleSubmit = async (values: FormValues) => {
    try {
      if (initialValues?.id) {
        const payload: UpdateSubcategoryInput = {
          id: initialValues.id,
          ...values,
        };
        await updateSubcategory.mutateAsync(payload);
        toast.success("Subcategory updated successfully");
        if (onSubmit) onSubmit(payload);
      } else {
        const payload = values;
        await createSubcategory.mutateAsync(payload);
        toast.success("Subcategory created successfully");
        if (onSubmit) onSubmit(payload);
      }
      onOpenChange(false);
    } catch (err) {
      logger.error("Failed to save subcategory", {
        error: err instanceof Error ? err.message : String(err),
      });
      toast.error("Failed to save subcategory");
    }
  };

  const isEditing = !!initialValues?.id;
  const isLoading = createSubcategory.isPending || updateSubcategory.isPending;

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
            <span>Details</span>
          </div>

          <div className="grid gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Dining Out"
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="parentId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background w-full">
                        <SelectValue placeholder="Select a parent category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(all.data ?? [])
                        .filter(
                          (c: { parentCategoryId: string | null }) =>
                            !c.parentCategoryId,
                        )
                        .map((c: { id: string; name: string }) => (
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
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEditing ? "Save Changes" : "Create Subcategory"}
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
            {isEditing ? "Edit Subcategory" : "New Subcategory"}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update your subcategory details."
              : "Add a new subcategory to a parent category."}
          </SheetDescription>
        </SheetHeader>
        <div className="max-h-[80vh] overflow-y-auto pb-8">{formContent}</div>
      </SheetContent>
    </Sheet>
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Subcategory" : "New Subcategory"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your subcategory details below."
              : "Create a new subcategory to organize transactions."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mr-4 flex-1 pr-4">{formContent}</ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default SubcategoryForm;
