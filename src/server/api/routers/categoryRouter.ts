import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createCategorySchema,
  updateCategorySchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  categoryIdParam,
} from "@/validation/category";

export const categoryRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { userId: ctx.user.id, parentCategoryId: null }, // Only top-level
      include: { children: true },
      orderBy: { sortOrder: "asc" },
    });
  }),

  allFlat: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { userId: ctx.user.id },
      orderBy: { name: "asc" },
    });
  }),

  byId: protectedProcedure
    .input(categoryIdParam)
    .query(async ({ ctx, input }) => {
      const cat = await ctx.db.category.findUnique({ where: { id: input.id } });
      if (cat?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
      return cat;
    }),

  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          parentCategoryId: input.parentCategoryId ?? null,
          type: input.type,
          color: input.color ?? null,
          icon: input.icon ?? null,
          sortOrder: input.sortOrder ?? 0,
        },
      });
    }),

  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.category.findUnique({
        where: { id: input.id },
      });
      if (exists?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Cycle detection for parent change
      if (
        Object.prototype.hasOwnProperty.call(input, "parentCategoryId") &&
        input.parentCategoryId
      ) {
        if (input.parentCategoryId === input.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot set category as its own parent",
          });
        }
        let ancestorId: string | null = input.parentCategoryId;
        while (ancestorId) {
          const ancestor: { parentCategoryId: string | null } | null =
            await ctx.db.category.findUnique({
              where: { id: ancestorId },
              select: { parentCategoryId: true },
            });
          if (!ancestor) break;
          if (ancestor.parentCategoryId === input.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot create a circular parent-child relationship",
            });
          }
          ancestorId = ancestor.parentCategoryId;
        }
      }

      return ctx.db.category.update({
        where: { id: input.id },
        data: {
          name: input.name ?? undefined,
          parentCategoryId: Object.prototype.hasOwnProperty.call(
            input,
            "parentCategoryId",
          )
            ? input.parentCategoryId
            : undefined,
          type: Object.prototype.hasOwnProperty.call(input, "type")
            ? input.type
            : undefined,
          color: input.color ?? undefined,
          icon: input.icon ?? undefined,
          sortOrder: input.sortOrder ?? undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(categoryIdParam)
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.category.findUnique({
        where: { id: input.id },
      });
      if (exists?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
      // Iterative BFS: collect all descendant IDs in O(depth) queries
      const idsToDelete: string[] = [input.id];
      let currentIds = [input.id];
      while (currentIds.length > 0) {
        const children = await ctx.db.category.findMany({
          where: { parentCategoryId: { in: currentIds } },
          select: { id: true },
        });
        currentIds = children.map((c) => c.id);
        idsToDelete.push(...currentIds);
      }

      await ctx.db.category.deleteMany({
        where: { id: { in: idsToDelete } },
      });

      return { success: true };
    }),

  // Subcategory-specific routes. These provide explicit endpoints for working
  // directly with subcategories while reusing the same underlying model.
  subcategory: createTRPCRouter({
    create: protectedProcedure
      .input(createSubcategorySchema)
      .mutation(async ({ ctx, input }) => {
        const parent = await ctx.db.category.findUnique({
          where: { id: input.parentId },
        });
        if (parent?.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent category not found",
          });
        }

        return ctx.db.category.create({
          data: {
            userId: ctx.user.id,
            name: input.name,
            parentCategoryId: input.parentId,
            type: parent.type, // inherit type from parent for consistency
            color: input.color ?? null,
            icon: input.icon ?? null,
            sortOrder: input.sortOrder ?? 0,
          },
        });
      }),

    update: protectedProcedure
      .input(updateSubcategorySchema)
      .mutation(async ({ ctx, input }) => {
        const exists = await ctx.db.category.findUnique({
          where: { id: input.id },
        });
        if (exists?.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subcategory not found",
          });
        }

        if (input.parentId) {
          // Prevent setting parent to self
          if (input.parentId === input.id) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot set category as its own parent",
            });
          }
          const newParent = await ctx.db.category.findUnique({
            where: { id: input.parentId },
          });
          if (newParent?.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "New parent not found",
            });
          }
          // Prevent cycle: check that newParent is not a descendant of this category
          let ancestorId: string | null = newParent.parentCategoryId;
          while (ancestorId) {
            if (ancestorId === input.id) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Cannot create a circular parent-child relationship",
              });
            }
            const ancestor = await ctx.db.category.findUnique({
              where: { id: ancestorId },
              select: { parentCategoryId: true },
            });
            ancestorId = ancestor?.parentCategoryId ?? null;
          }
        }

        return ctx.db.category.update({
          where: { id: input.id },
          data: {
            name: input.name ?? undefined,
            parentCategoryId: Object.prototype.hasOwnProperty.call(
              input,
              "parentId",
            )
              ? input.parentId
              : undefined,
            color: input.color ?? undefined,
            icon: input.icon ?? undefined,
            sortOrder: input.sortOrder ?? undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(categoryIdParam)
      .mutation(async ({ ctx, input }) => {
        const exists = await ctx.db.category.findUnique({
          where: { id: input.id },
        });
        if (exists?.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subcategory not found",
          });
        }

        // Iterative BFS: collect all descendant IDs in O(depth) queries
        const idsToDelete: string[] = [input.id];
        let currentIds = [input.id];
        while (currentIds.length > 0) {
          const children = await ctx.db.category.findMany({
            where: { parentCategoryId: { in: currentIds } },
            select: { id: true },
          });
          currentIds = children.map((c) => c.id);
          idsToDelete.push(...currentIds);
        }

        await ctx.db.category.deleteMany({
          where: { id: { in: idsToDelete } },
        });

        return { success: true };
      }),
  }),
});
