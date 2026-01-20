"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { Category } from "@/types/account";

export function useCategories() {
  const all = api.category.all.useQuery();

  const categories = useMemo(() => {
    if (!all.data) return [] as Category[];
    // Build tree grouping children under parentCategoryId
    const map = new Map<string, Category & { children?: Category[] }>();
    all.data.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: (Category & { children?: Category[] })[] = [];
    map.forEach((c) => {
      const parentId = c.parentCategoryId ?? null;
      if (parentId) {
        const parent = map.get(parentId);
        if (parent) parent.children = parent.children ?? [];
        parent?.children?.push(c as Category & { children?: Category[] });
      } else {
        roots.push(c);
      }
    });
    return roots;
  }, [all.data]);

  const create = api.category.create.useMutation();
  const update = api.category.update.useMutation();
  const remove = api.category.delete.useMutation();
  const createSubcategory = api.category.subcategory.create.useMutation();
  const updateSubcategory = api.category.subcategory.update.useMutation();
  const deleteSubcategory = api.category.subcategory.delete.useMutation();
  const byId = api.category.byId.useQuery;

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
  };
}
