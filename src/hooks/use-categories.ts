"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import type { CategoryWithChildren } from "@/types/category";

export function useCategories() {
  const all = api.category.list.useQuery();

  const categories = useMemo(() => {
    if (!all.data) return [] as CategoryWithChildren[];
    const map = new Map<string, CategoryWithChildren>();
    all.data.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: CategoryWithChildren[] = [];
    map.forEach((c) => {
      const parentId = c.parentCategoryId;
      if (parentId) {
        const parent = map.get(parentId);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(c);
        }
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

  const allFlat = api.category.allFlat.useQuery();

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    allFlat.data?.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [allFlat.data]);

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
