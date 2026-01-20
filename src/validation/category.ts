import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  parentCategoryId: z.string().min(1).nullable().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  color: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1),
});

export const createSubcategorySchema = z.object({
  parentId: z.string().min(1),
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
});

export const updateSubcategorySchema = createSubcategorySchema.extend({
  id: z.string().min(1),
});

export const categoryIdParam = z.object({ id: z.string().min(1) });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;

// No default export
