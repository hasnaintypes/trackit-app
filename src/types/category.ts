export interface Category {
  id: string;
  userId: string;
  parentCategoryId?: string | null;
  name: string;
  color?: string | null;
  icon?: string | null;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  sortOrder?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

export interface CategoryForAI {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  parentCategoryId?: string | null;
  subcategories?: CategoryForAI[];
}
