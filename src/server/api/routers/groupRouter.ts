import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createGroupSchema,
  updateGroupSchema,
  addMemberSchema,
  removeMemberSchema,
  listGroupsSchema,
} from "@/validation/group";
import { SplitService } from "@/server/services/splitService";

export const groupRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listGroupsSchema)
    .query(async ({ ctx, input }) => {
      const groups = await ctx.db.group.findMany({
        where: {
          userId: ctx.user.id,
          ...(input.includeArchived ? {} : { isArchived: false }),
        },
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          color: true,
          type: true,
          currency: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { members: true } },
          members: {
            select: {
              id: true,
              contactId: true,
              role: true,
              contact: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                },
              },
            },
            take: 5,
            orderBy: { joinedAt: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      return groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        icon: g.icon,
        color: g.color,
        type: g.type,
        currency: g.currency,
        isArchived: g.isArchived,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
        memberCount: g._count.members,
        members: g.members.map((m) => ({
          id: m.id,
          contactId: m.contactId,
          role: m.role,
          contact: m.contact,
        })),
      }));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
          name: true,
          description: true,
          icon: true,
          color: true,
          type: true,
          currency: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
          members: {
            select: {
              id: true,
              groupId: true,
              contactId: true,
              userId: true,
              role: true,
              joinedAt: true,
              contact: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
        },
      });

      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return {
        id: group.id,
        userId: group.userId,
        name: group.name,
        description: group.description,
        icon: group.icon,
        color: group.color,
        type: group.type,
        currency: group.currency,
        isArchived: group.isArchived,
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
        memberCount: group.members.length,
        members: group.members.map((m) => ({
          ...m,
          joinedAt: m.joinedAt.toISOString(),
        })),
      };
    }),

  create: protectedProcedure
    .input(createGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const { memberContactIds, ...groupData } = input;

      // Validate that all contacts belong to the user
      if (memberContactIds?.length) {
        const contacts = await ctx.db.contact.findMany({
          where: {
            id: { in: memberContactIds },
            userId: ctx.user.id,
          },
          select: { id: true },
        });
        if (contacts.length !== memberContactIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more contacts not found",
          });
        }
      }

      const group = await ctx.db.$transaction(async (tx) => {
        const created = await tx.group.create({
          data: {
            userId: ctx.user.id,
            name: groupData.name,
            description: groupData.description,
            icon: groupData.icon,
            color: groupData.color,
            type: groupData.type,
            currency: groupData.currency,
          },
        });

        // Add the owner as a member (contactId = null means "self")
        await tx.groupMember.create({
          data: {
            groupId: created.id,
            userId: ctx.user.id,
            contactId: null,
            role: "OWNER",
          },
        });

        // Add contacts as members
        if (memberContactIds?.length) {
          await tx.groupMember.createMany({
            data: memberContactIds.map((contactId) => ({
              groupId: created.id,
              userId: ctx.user.id,
              contactId,
              role: "MEMBER" as const,
            })),
          });
        }

        return created;
      });

      return {
        id: group.id,
        name: group.name,
        createdAt: group.createdAt.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(updateGroupSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (existing?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      const { id, ...data } = input;
      const group = await ctx.db.group.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          color: true,
          type: true,
          currency: true,
          updatedAt: true,
        },
      });

      return {
        ...group,
        updatedAt: group.updatedAt.toISOString(),
      };
    }),

  addMember: protectedProcedure
    .input(addMemberSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify group ownership
      const group = await ctx.db.group.findUnique({
        where: { id: input.groupId },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      // Verify contact belongs to user
      const contact = await ctx.db.contact.findUnique({
        where: { id: input.contactId },
        select: { userId: true },
      });
      if (contact?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contact not found",
        });
      }

      // Check if already a member
      const existing = await ctx.db.groupMember.findUnique({
        where: {
          groupId_contactId: {
            groupId: input.groupId,
            contactId: input.contactId,
          },
        },
        select: { id: true },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Contact is already a member of this group",
        });
      }

      const member = await ctx.db.groupMember.create({
        data: {
          groupId: input.groupId,
          userId: ctx.user.id,
          contactId: input.contactId,
          role: "MEMBER",
        },
        select: {
          id: true,
          contactId: true,
          role: true,
          joinedAt: true,
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      return {
        ...member,
        joinedAt: member.joinedAt.toISOString(),
      };
    }),

  removeMember: protectedProcedure
    .input(removeMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const member = await ctx.db.groupMember.findUnique({
        where: { id: input.memberId },
        select: {
          id: true,
          groupId: true,
          role: true,
          group: { select: { userId: true } },
        },
      });

      if (member?.group.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        });
      }

      if (member.groupId !== input.groupId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Member does not belong to this group",
        });
      }

      if (member.role === "OWNER") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot remove the group owner",
        });
      }

      await ctx.db.groupMember.delete({
        where: { id: input.memberId },
      });

      return { success: true };
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      await ctx.db.group.update({
        where: { id: input.id },
        data: { isArchived: true },
      });

      return { success: true };
    }),

  unarchive: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      await ctx.db.group.update({
        where: { id: input.id },
        data: { isArchived: false },
      });

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      await ctx.db.group.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getBalances: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: {
          userId: true,
          members: {
            select: {
              contactId: true,
              contact: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      const balanceMap = await SplitService.calculateGroupBalances(
        input.id,
        ctx.user.id,
      );

      // Map contact IDs to names for display
      const memberLookup = new Map(
        group.members.map((m) => [
          m.contactId ?? "self",
          {
            contactId: m.contactId,
            name: m.contact?.name ?? "You",
            avatarUrl: m.contact?.avatarUrl ?? null,
          },
        ]),
      );

      const balances = Array.from(balanceMap.entries()).map(
        ([key, balance]) => ({
          contactId: key === "self" ? null : key,
          name: memberLookup.get(key)?.name ?? "Unknown",
          avatarUrl: memberLookup.get(key)?.avatarUrl ?? null,
          balance,
        }),
      );

      return balances;
    }),

  getPairwiseDebts: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: {
          userId: true,
          members: {
            select: {
              contactId: true,
              contact: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      const debts = await SplitService.calculatePairwiseDebts(
        input.id,
        ctx.user.id,
      );

      const memberLookup = new Map(
        group.members.map((m) => [
          m.contactId ?? "self",
          {
            name: m.contact?.name ?? "You",
            avatarUrl: m.contact?.avatarUrl ?? null,
          },
        ]),
      );

      return debts.map((d) => ({
        from: {
          contactId: d.from === "self" ? null : d.from,
          name: memberLookup.get(d.from)?.name ?? "Unknown",
          avatarUrl: memberLookup.get(d.from)?.avatarUrl ?? null,
        },
        to: {
          contactId: d.to === "self" ? null : d.to,
          name: memberLookup.get(d.to)?.name ?? "Unknown",
          avatarUrl: memberLookup.get(d.to)?.avatarUrl ?? null,
        },
        amount: d.amount,
      }));
    }),

  getSimplifiedDebts: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: {
          userId: true,
          members: {
            select: {
              contactId: true,
              contact: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      const pairwise = await SplitService.calculatePairwiseDebts(
        input.id,
        ctx.user.id,
      );
      const simplified = SplitService.simplifyDebts(pairwise);

      const memberLookup = new Map(
        group.members.map((m) => [
          m.contactId ?? "self",
          {
            name: m.contact?.name ?? "You",
            avatarUrl: m.contact?.avatarUrl ?? null,
          },
        ]),
      );

      return simplified.map((d) => ({
        from: {
          contactId: d.from === "self" ? null : d.from,
          name: memberLookup.get(d.from)?.name ?? "Unknown",
          avatarUrl: memberLookup.get(d.from)?.avatarUrl ?? null,
        },
        to: {
          contactId: d.to === "self" ? null : d.to,
          name: memberLookup.get(d.to)?.name ?? "Unknown",
          avatarUrl: memberLookup.get(d.to)?.avatarUrl ?? null,
        },
        amount: d.amount,
      }));
    }),

  activityFeed: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        limit: z.number().min(1).max(100).default(30),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.group.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });
      if (group?.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      }

      return SplitService.getActivityFeed(input.id, input.limit, input.cursor);
    }),
});
