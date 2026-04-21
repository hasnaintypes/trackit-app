"use client";

import React, { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { invalidateCategories } from "@/trpc/invalidation";
import { useCategories } from "@/hooks/use-categories";
import CategoryForm from "@/components/forms/categories/category-form";
import SubcategoryForm from "@/components/forms/categories/subcategory-form";
import { cn } from "@/lib/utils";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@ui/alert";
import {
  Trash2,
  Edit2,
  PlusCircle,
  AlertTriangle,
  FolderOpen,
  ChevronDown,
  Plus,
} from "lucide-react";
import { ICONS } from "@/constants/icons";
import type { Category } from "@/types/category";
import type {
  CreateCategoryInput,
  CreateSubcategoryInput,
} from "@/validation/category";
import { DeleteDialog } from "@common/delete-dialog";

type CategoryWithChildren = Category & { children?: CategoryWithChildren[] };

// ---------------------------------------------------------------------------
// Icon resolver helper
// ---------------------------------------------------------------------------
// Type badge color map
function typeBadgeClass(type: string) {
  switch (type) {
    case "INCOME":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "EXPENSE":
      return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400";
    case "TRANSFER":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function CategoryIcon({
  icon,
  color,
  name,
  size = "md",
}: {
  icon?: string | null;
  color?: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const IconEntry = ICONS.find((i) => i.name === icon);
  const IconComp = IconEntry?.Icon;
  const dims = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const iconDims = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const iconColor = color ?? "#666";

  return (
    <div
      className={cn(
        "bg-muted flex shrink-0 items-center justify-center rounded-lg",
        dims,
      )}
    >
      {IconComp ? (
        <IconComp className={iconDims} style={{ color: iconColor }} />
      ) : (
        <span className="text-xs font-bold" style={{ color: iconColor }}>
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parent category row with collapsible subcategories
// ---------------------------------------------------------------------------
function ParentRow({
  category,
  onEditParent,
  onEditSub,
  onAddSub,
  onDelete,
}: {
  category: CategoryWithChildren;
  onEditParent: (c: Category) => void;
  onEditSub: (c: Category) => void;
  onAddSub: (c: Category) => void;
  onDelete: (c: CategoryWithChildren) => void;
}) {
  const [open, setOpen] = useState(false);
  const children = category.children ?? [];

  return (
    <div className="bg-card border-border/60 rounded-xl border">
      {/* Parent header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Expand toggle */}
        <button
          onClick={() => setOpen((s) => !s)}
          className="text-muted-foreground hover:text-foreground -ml-1 p-0.5 transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>

        <CategoryIcon
          icon={category.icon}
          color={category.color}
          name={category.name}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {category.name}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase",
                typeBadgeClass(category.type),
              )}
            >
              {category.type}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {children.length} subcategor{children.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onAddSub(category)}
            title="Add subcategory"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEditParent(category)}
            title="Edit"
          >
            <Edit2 className="text-muted-foreground h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => onDelete(category)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Subcategories (collapsible) */}
      {open && (
        <div className="border-border/60 border-t">
          {children.length > 0 ? (
            <div className="divide-border/40 divide-y">
              {children.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-card hover:bg-muted/40 flex items-center gap-3 py-2.5 pr-4 pl-12 transition-colors"
                >
                  <CategoryIcon
                    icon={sub.icon}
                    color={sub.color}
                    name={sub.name}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {sub.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditSub(sub)}
                      title="Edit"
                    >
                      <Edit2 className="text-muted-foreground h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-7 w-7"
                      onClick={() => onDelete(sub)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
              <span>No subcategories</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 h-7 text-xs"
                onClick={() => onAddSub(category)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add one
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CategoriesSettings() {
  const { all, categories: categoryTree, remove } = useCategories();
  const utils = api.useUtils();

  const [openCategory, setOpenCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<
    (Partial<CreateCategoryInput> & { id?: string }) | null
  >(null);

  const [openSub, setOpenSub] = useState(false);
  const [subInitial, setSubInitial] = useState<
    (Partial<CreateSubcategoryInput> & { id?: string }) | null
  >(null);

  const [deleteCandidate, setDeleteCandidate] =
    useState<CategoryWithChildren | null>(null);

  const refresh = useCallback(() => {
    void invalidateCategories(utils);
  }, [utils]);

  const parentCategories: CategoryWithChildren[] = (
    (categoryTree ?? []) as CategoryWithChildren[]
  )
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .map((p) => ({
      ...p,
      children: (p.children ?? [])
        .slice()
        .sort(
          (x: CategoryWithChildren, y: CategoryWithChildren) =>
            new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
        ),
    }));

  // --- Handlers ---

  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setOpenCategory(true);
  };

  const handleEditCategory = (cat: Category) => {
    setCategoryToEdit({
      id: cat.id,
      name: cat.name,
      parentCategoryId: cat.parentCategoryId ?? undefined,
      color: cat.color ?? undefined,
      icon: cat.icon ?? undefined,
      type: cat.type,
      sortOrder: cat.sortOrder ?? undefined,
    });
    setOpenCategory(true);
  };

  const handleAddSub = (cat: Category) => {
    setSubInitial({ parentId: cat.id });
    setOpenSub(true);
  };

  const handleEditSubcategory = (sub: Category) => {
    setSubInitial({
      id: sub.id,
      name: sub.name,
      parentId: sub.parentCategoryId ?? undefined,
      color: sub.color ?? undefined,
      icon: sub.icon ?? undefined,
      sortOrder: sub.sortOrder ?? undefined,
    });
    setOpenSub(true);
  };

  const countDescendants = (c: CategoryWithChildren): number => {
    const children = c.children ?? [];
    if (children.length === 0) return 0;
    let total = children.length;
    for (const child of children) total += countDescendants(child);
    return total;
  };

  // --- Loading / Error ---

  if (all.status === "pending") {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted/50 h-16 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (all.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Categories</AlertTitle>
        <AlertDescription>
          Failed to fetch category data. ({all.error?.message})
        </AlertDescription>
      </Alert>
    );
  }

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">
            Categories{" "}
            <span className="text-muted-foreground font-normal">
              ({parentCategories.length})
            </span>
          </h3>
          <p className="text-muted-foreground text-xs">
            Organize transactions with parent categories and subcategories.
          </p>
        </div>
        <Button size="sm" onClick={handleAddCategory}>
          <PlusCircle className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Category list */}
      {parentCategories.length === 0 ? (
        <div className="border-border/70 bg-muted/20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
          <FolderOpen className="text-muted-foreground mb-3 h-8 w-8" />
          <p className="text-sm font-medium">No categories yet</p>
          <p className="text-muted-foreground mb-4 text-xs">
            Create your first category to get started.
          </p>
          <Button size="sm" onClick={handleAddCategory}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Create Category
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {parentCategories.map((c) => (
            <ParentRow
              key={c.id}
              category={c}
              onEditParent={handleEditCategory}
              onEditSub={handleEditSubcategory}
              onAddSub={handleAddSub}
              onDelete={setDeleteCandidate}
            />
          ))}
        </div>
      )}

      {/* Forms */}
      <CategoryForm
        open={openCategory}
        onOpenChange={setOpenCategory}
        initialValues={categoryToEdit ?? undefined}
        onSubmit={() => {
          setOpenCategory(false);
          void refresh();
        }}
      />
      <SubcategoryForm
        open={openSub}
        onOpenChange={setOpenSub}
        initialValues={subInitial ?? undefined}
        onSubmit={() => {
          setOpenSub(false);
          void refresh();
        }}
      />

      {/* Delete confirmation */}
      <DeleteDialog
        open={!!deleteCandidate}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null);
        }}
        title="Confirm Deletion"
        description={
          deleteCandidate
            ? deleteCandidate.parentCategoryId
              ? `Delete subcategory "${deleteCandidate.name}"? This action cannot be undone.`
              : `Delete category "${deleteCandidate.name}"? This will permanently remove it along with all ${countDescendants(deleteCandidate)} of its subcategories. This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          if (!deleteCandidate) return;
          await remove.mutateAsync({ id: deleteCandidate.id });
          void refresh();
          setDeleteCandidate(null);
        }}
        successMessage={
          deleteCandidate ? `"${deleteCandidate.name}" deleted.` : "Deleted."
        }
        errorMessage="Failed to delete category."
      />
    </div>
  );
}
