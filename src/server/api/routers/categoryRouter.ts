import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      where: { userId: ctx.user.id },
      orderBy: { sortOrder: "asc" },
    });
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const cat = await ctx.db.category.findUnique({ where: { id: input.id } });
      if (!cat || cat.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
      return cat;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentCategoryId: z.string().nullable().optional(),
        type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
        color: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
        sortOrder: z.number().optional(),
      }),
    )
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
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        parentCategoryId: z.string().nullable().optional(),
        type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),
        color: z.string().nullable().optional(),
        icon: z.string().nullable().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.category.findUnique({
        where: { id: input.id },
      });
      if (!exists || exists.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const exists = await ctx.db.category.findUnique({
        where: { id: input.id },
      });
      if (!exists || exists.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }
      // Recursively delete category and its children.
      const deleteRecursive = async (id: string) => {
        const children = await ctx.db.category.findMany({
          where: { parentCategoryId: id },
        });
        for (const child of children) {
          await deleteRecursive(child.id);
        }
        await ctx.db.category.delete({ where: { id } });
      };

      await deleteRecursive(input.id);

      return { success: true };
    }),

  // Subcategory-specific routes. These provide explicit endpoints for working
  // directly with subcategories while reusing the same underlying model.
  subcategory: createTRPCRouter({
    create: protectedProcedure
      .input(
        z.object({
          parentId: z.string(),
          name: z.string().min(1),
          color: z.string().nullable().optional(),
          icon: z.string().nullable().optional(),
          sortOrder: z.number().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const parent = await ctx.db.category.findUnique({
          where: { id: input.parentId },
        });
        if (!parent || parent.userId !== ctx.user.id) {
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
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).optional(),
          parentId: z.string().nullable().optional(),
          color: z.string().nullable().optional(),
          icon: z.string().nullable().optional(),
          sortOrder: z.number().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const exists = await ctx.db.category.findUnique({
          where: { id: input.id },
        });
        if (!exists || exists.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subcategory not found",
          });
        }

        if (input.parentId) {
          const newParent = await ctx.db.category.findUnique({
            where: { id: input.parentId },
          });
          if (!newParent || newParent.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "New parent not found",
            });
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
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const exists = await ctx.db.category.findUnique({
          where: { id: input.id },
        });
        if (!exists || exists.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Subcategory not found",
          });
        }

        // Delete recursively to remove any nested subcategories.
        const deleteRecursive = async (id: string) => {
          const children = await ctx.db.category.findMany({
            where: { parentCategoryId: id },
          });
          for (const child of children) {
            await deleteRecursive(child.id);
          }
          await ctx.db.category.delete({ where: { id } });
        };

        await deleteRecursive(input.id);

        return { success: true };
      }),
  }),
});
