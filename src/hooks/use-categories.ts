"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import { invalidateCategories } from "@/trpc/invalidation";
import type { CategoryWithChildren } from "@/types/category";

export function useCategories() {
  const all = api.category.list.useQuery();

  // The backend query already returns top-level categories with children included
  // via Prisma's `include: { children: true }`. Use them directly.
  const categories = useMemo(() => {
    if (!all.data) return [] as CategoryWithChildren[];
    return all.data.map((c) => ({
      ...c,
      children: (c.children ?? []) as CategoryWithChildren[],
    }));
  }, [all.data]);

  const utils = api.useUtils();
  const onSuccess = () => void invalidateCategories(utils);
  const create = api.category.create.useMutation({ onSuccess });
  const update = api.category.update.useMutation({ onSuccess });
  const remove = api.category.delete.useMutation({ onSuccess });
  const createSubcategory = api.category.subcategory.create.useMutation({
    onSuccess,
  });
  const updateSubcategory = api.category.subcategory.update.useMutation({
    onSuccess,
  });
  const deleteSubcategory = api.category.subcategory.delete.useMutation({
    onSuccess,
  });
  const byId = api.category.byId.useQuery;

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!all.data) return map;
    for (const c of all.data) {
      map.set(c.id, c.name);
      if (c.children) {
        for (const child of c.children) {
          map.set(child.id, child.name);
        }
      }
    }
    return map;
  }, [all.data]);

  const allFlat = useMemo(() => {
    if (!all.data) return { data: undefined };
    const flat: Array<{ id: string; name: string; color: string | null }> = [];
    for (const c of all.data) {
      flat.push({ id: c.id, name: c.name, color: c.color });
      if (c.children) {
        for (const child of c.children) {
          flat.push({ id: child.id, name: child.name, color: child.color });
        }
      }
    }
    return { data: flat };
  }, [all.data]);

  return {
    all,
    categories,
    byId,
    create,
    update,
    remove,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    allFlat,
    categoryMap,
  };
}
