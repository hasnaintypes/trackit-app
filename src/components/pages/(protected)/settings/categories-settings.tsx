"use client";

import React, { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { useCategories } from "@/hooks/use-categories";
import CategoryForm from "@/components/forms/categories/category-form";
import SubcategoryForm from "@/components/forms/categories/subcategory-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Tabs/Separator removed (not used)
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Trash2,
  Edit2,
  PlusCircle,
  AlertTriangle,
  FolderOpen,
  LayoutGrid,
  List,
} from "lucide-react";
import { ICONS } from "@/components/common/icon-picker";
// toast removed (not used in this file)
import type { Category } from "@/types/account";
import type {
  CreateCategoryInput,
  CreateSubcategoryInput,
} from "@/validation/category";
import { DeleteDialog } from "@/components/common/delete-dialog";

type CategoryWithChildren = Category & { children?: CategoryWithChildren[] };

// --- SKELETON, EMPTY, AND STATUS COMPONENTS ---

const CategoryListSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
          <div className="space-y-1">
            <div className="bg-muted h-4 w-32 animate-pulse rounded" />
            <div className="bg-muted h-3 w-20 animate-pulse rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{
  title: string;
  description: string;
  action: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="border-border/70 bg-muted/20 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
    <FolderOpen className="text-muted-foreground mb-4 h-10 w-10" />
    <h3 className="text-xl font-semibold">{title}</h3>
    <p className="text-muted-foreground mb-6 text-sm">{description}</p>
    {action}
  </div>
);

const noop = () => undefined;

function CategoryItem({
  category,
  onEdit,
  onAddSub,
  onDelete,
  isSubcategory = false,
}: {
  category: CategoryWithChildren;
  onEdit: (c: Category) => void;
  onAddSub: (c: Category) => void;
  onDelete: (c: Category) => void;
  isSubcategory?: boolean;
}) {
  const IconEntry = ICONS.find((i) => i.name === category.icon);
  const IconComp = IconEntry?.Icon;
  const isParent = !isSubcategory;
  // Subcategories are handled within the parent Card Header, so this is now only used for sub-items
  const canAddSub = isParent && !category.parentCategoryId;

  return (
    <div
      className={`border-border/50 hover:bg-muted/50 flex items-center justify-between gap-4 rounded-lg border px-2 py-2 transition-colors ${
        isSubcategory ? "bg-background shadow-sm" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: category.color ?? "#666" }}
        >
          {IconComp ? (
            <IconComp className="h-4 w-4" />
          ) : (
            <span className="text-xs font-semibold">
              {category.name?.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="truncate text-sm font-medium">{category.name}</div>
          <div className="text-muted-foreground text-xs tracking-wider uppercase">
            {isSubcategory ? "Subcategory" : "Main Category"}
            {isParent && (
              <span className="text-primary/80 ml-2">
                ({category.children?.length ?? 0} subs)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isParent && (
          // This button is kept but hidden for main categories here, as the primary add sub is in the CardHeader
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAddSub(category)}
            disabled={!canAddSub}
            title={
              canAddSub
                ? "Add Subcategory"
                : "Cannot nest subcategories further"
            }
            className="hidden"
          >
            <PlusCircle className="text-primary/80 h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
          title="Edit"
        >
          <Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category)}
          className="text-destructive hover:bg-destructive/10"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// --- MAIN SETTINGS COMPONENT ---

export default function CategoriesSettings() {
  const { all, categories: categoryTree, remove } = useCategories();
  const utils = api.useContext();

  // Category Form State
  const [openCategory, setOpenCategory] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<
    (Partial<CreateCategoryInput> & { id?: string }) | null
  >(null);

  // Subcategory Form State
  const [openSub, setOpenSub] = useState(false);
  const [subInitial, setSubInitial] = useState<
    (Partial<CreateSubcategoryInput> & { id?: string }) | null
  >(null);

  // Deletion Confirmation State
  const [deleteCandidate, setDeleteCandidate] =
    useState<CategoryWithChildren | null>(null);

  const refresh = useCallback(() => {
    void utils.category.all.invalidate();
  }, [utils]);

  // Use the tree built by the hook so `children` arrays are already attached
  // Ensure stable ordering by creation time (oldest first)
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
          (x, y) =>
            new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
        ),
    }));

  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  // --- HANDLERS ---

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

  // listExpanded will be added when list expand behavior is implemented

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

  const prepareDelete = (cat: CategoryWithChildren) => {
    setDeleteCandidate(cat);
  };

  const onCategorySaved = () => {
    setOpenCategory(false);
    void refresh();
  };

  const onSubSaved = () => {
    setOpenSub(false);
    void refresh();
  };

  // --- RENDERING STATUS STATES ---

  if (all.status === "pending") {
    return (
      <div className="mx-auto max-w-6xl flex-1 space-y-6 p-4 md:p-8">
        <div className="bg-muted h-8 w-64 animate-pulse rounded" />
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader>
                <CardTitle className="bg-muted h-6 w-1/3 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <CategoryListSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (all.status === "error") {
    return (
      <div className="mx-auto max-w-6xl flex-1 space-y-6 p-4 md:p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Categories</AlertTitle>
          <AlertDescription>
            Failed to fetch category data. Please try again. (
            {all.error?.message})
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // --- MAIN RENDER ---

  return (
    <div className="mx-auto max-w-6xl flex-1 space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">
          Transaction Categories
        </h1>
        <p className="text-muted-foreground mt-1">
          Organize your finances with custom categories and subcategories.
        </p>
      </div>

      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-foreground text-2xl font-semibold">
          Category Groups ({parentCategories.length})
        </h2>
        <div className="flex items-center gap-3">
          <div className="bg-muted/10 hidden items-center gap-2 rounded-md px-2 py-1 sm:flex">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("cards")}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleAddCategory}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Main Category
          </Button>
        </div>
      </div>

      {/* Main Categories Display Area */}
      {parentCategories.length === 0 ? (
        <EmptyState
          title="No Main Categories Found"
          description="Start by creating your first main category to organize transactions. Subcategories will be nested inside."
          action={
            <Button onClick={handleAddCategory}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create First Category
            </Button>
          }
        />
      ) : (
        <div>
          {viewMode === "cards" ? (
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {parentCategories.map((c: CategoryWithChildren) => (
                <CategoryCard
                  key={c.id}
                  category={c}
                  onAddSub={handleAddSub}
                  onEditParent={(cat) => handleEditCategory(cat)}
                  onEditSub={(sub) => handleEditSubcategory(sub)}
                  onDelete={(cat) => prepareDelete(cat)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {parentCategories.map((p) => (
                <div
                  key={p.id}
                  className="border-border/50 rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white"
                        style={{ background: p.color ?? "#666" }}
                      >
                        {(() => {
                          const IconEntry = ICONS.find(
                            (i) => i.name === p.icon,
                          );
                          const IconComp = IconEntry?.Icon;
                          return IconComp ? (
                            <IconComp className="h-5 w-5" />
                          ) : (
                            p.name?.charAt(0)
                          );
                        })()}
                      </div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {p.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddSub(p)}
                        className="cursor-pointer"
                      >
                        <PlusCircle className="text-primary h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCategory(p)}
                        className="cursor-pointer"
                      >
                        <Edit2 className="text-muted-foreground h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => prepareDelete(p)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* children tree */}
                  <div className="mt-3 pl-12">
                    {p.children && p.children.length > 0 ? (
                      <div className="space-y-2">
                        {p.children.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                                style={{ background: sub.color ?? "#666" }}
                              >
                                {(() => {
                                  const IconEntry = ICONS.find(
                                    (i) => i.name === sub.icon,
                                  );
                                  const IconComp = IconEntry?.Icon;
                                  return IconComp ? (
                                    <IconComp className="h-4 w-4" />
                                  ) : (
                                    sub.name?.charAt(0)
                                  );
                                })()}
                              </div>
                              <div>
                                <div className="font-medium">{sub.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  Subcategory
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditSubcategory(sub)}
                                className="cursor-pointer"
                              >
                                <Edit2 className="text-muted-foreground h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => prepareDelete(sub)}
                                className="text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        No subcategories
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category/Subcategory Forms */}
      <CategoryForm
        open={openCategory}
        onOpenChange={setOpenCategory}
        initialValues={categoryToEdit ?? undefined}
        onSubmit={onCategorySaved}
      />
      <SubcategoryForm
        open={openSub}
        onOpenChange={setOpenSub}
        initialValues={subInitial ?? undefined}
        onSubmit={onSubSaved}
      />

      {/* Delete Confirmation - use shared DeleteDialog component */}
      <DeleteDialog
        open={!!deleteCandidate}
        onOpenChange={(open) => {
          if (!open) setDeleteCandidate(null);
        }}
        title={"Confirm Deletion"}
        description={
          deleteCandidate
            ? deleteCandidate.parentCategoryId
              ? `Are you sure you want to delete the subcategory "${deleteCandidate.name}"? This will remove it from its parent category. This action cannot be undone.`
              : `Are you sure you want to delete the category "${deleteCandidate.name}"? This will also delete ${
                  deleteCandidate.children &&
                  deleteCandidate.children.length > 0
                    ? countDescendants(deleteCandidate)
                    : 0
                } associated subcategories. This action cannot be undone.`
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
          deleteCandidate
            ? deleteCandidate.parentCategoryId
              ? `Subcategory "${deleteCandidate.name}" deleted.`
              : `Category "${deleteCandidate.name}" deleted.`
            : "Deleted."
        }
        errorMessage="Failed to delete category."
      />
    </div>
  );
}

function CategoryCard({
  category,
  onAddSub,
  onEditParent,
  onEditSub,
  onDelete,
}: {
  category: CategoryWithChildren;
  onAddSub: (c: Category) => void;
  onEditParent: (c: Category) => void;
  onEditSub: (c: Category) => void;
  onDelete: (c: CategoryWithChildren) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const children = category.children ?? [];
  const visibleChildren = expanded ? children : children.slice(0, 2);

  return (
    <Card className="rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-start justify-between px-4 pt-0 pb-2">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white shadow-md"
            style={{ background: category.color ?? "#666" }}
          >
            {(() => {
              const IconEntry = ICONS.find((i) => i.name === category.icon);
              const IconComp = IconEntry?.Icon;
              return IconComp ? (
                <IconComp className="h-5 w-5" />
              ) : (
                category.name?.charAt(0)
              );
            })()}
          </div>
          <div>
            <CardTitle className="text-lg leading-tight font-bold">
              {category.name}
            </CardTitle>
            <p className="text-muted-foreground mt-0 text-xs">
              {category.type}
            </p>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => onAddSub(category)}
            title="Add Subcategory"
          >
            <PlusCircle className="text-primary hover:text-primary/80 h-5 w-5" />
          </Button>
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => onEditParent(category)}
            title="Edit Main Category"
          >
            <Edit2 className="text-muted-foreground hover:text-foreground h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category)}
            className="text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Delete Main Category"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {children.length > 0 ? (
          <div className="space-y-2 pt-0">
            <div className="border-border/50 flex items-center justify-between border-b pb-1">
              <p className="text-muted-foreground text-sm font-semibold">
                Subcategories ({children.length})
              </p>
              {children.length > 2 && (
                <Button
                  className="cursor-pointer"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded((s) => !s)}
                >
                  {expanded ? "Show less" : `Show ${children.length - 2} more`}
                </Button>
              )}
            </div>

            <div className="space-y-2 pt-2">
              {visibleChildren.map((sub) => (
                <CategoryItem
                  key={sub.id}
                  category={sub}
                  isSubcategory={true}
                  onEdit={(c) => onEditSub(c)}
                  onAddSub={noop}
                  onDelete={(c) => onDelete(c)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="bg-muted/30 rounded-full p-3">
              <PlusCircle className="text-primary h-5 w-5" />
            </div>
            <div className="text-muted-foreground text-center text-sm">
              No subcategories yet
            </div>
            <Button
              className="cursor-pointer"
              variant="outline"
              size="sm"
              onClick={() => onAddSub(category)}
            >
              Add subcategory
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
