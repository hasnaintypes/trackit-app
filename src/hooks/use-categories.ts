"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
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

  const create = api.category.create.useMutation();
  const update = api.category.update.useMutation();
  const remove = api.category.delete.useMutation();
  const createSubcategory = api.category.subcategory.create.useMutation();
  const updateSubcategory = api.category.subcategory.update.useMutation();
  const deleteSubcategory = api.category.subcategory.delete.useMutation();
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
