import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createContactSchema,
  updateContactSchema,
  listContactsSchema,
} from "@/validation/contact";
import { uploadForProfile } from "@shared/imagekit";
import { encryptField, decryptField } from "@shared/encryption";
import { env } from "@/env";

const linkedUserSelect = {
  select: { id: true, name: true, image: true },
} as const;

async function resolveAvatarUrl(
  avatarUrl: string | null,
): Promise<string | null> {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("data:")) {
    const result = await uploadForProfile(
      avatarUrl,
      `contact-${Date.now()}`,
      "Trackit-Uploads/Contacts",
    );
    return result.url ?? null;
  }
  return avatarUrl;
}

export const contactRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listContactsSchema)
    .query(async ({ ctx, input }) => {
      const { search, cursor, limit } = input;

      const contacts = await ctx.db.contact.findMany({
        where: {
          userId: ctx.user.id,
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          linkedUserId: true,
          linkedUser: linkedUserSelect,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { name: "asc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined;
      if (contacts.length > limit) {
        const next = contacts.pop();
        nextCursor = next?.id;
      }

      return {
        contacts: contacts.map((c) => ({
          ...c,
          phone: decryptField(c.phone, env.FIELD_ENCRYPTION_KEY),
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        nextCursor,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.contact.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          linkedUserId: true,
          linkedUser: linkedUserSelect,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!contact || contact.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      return {
        ...contact,
        phone: decryptField(contact.phone, env.FIELD_ENCRYPTION_KEY),
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      };
    }),

  create: protectedProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      const email = input.email ?? null;
      const phone = input.phone ?? null;
      const rawAvatar = input.avatarUrl ?? null;

      // Check for duplicate email within user's contacts
      if (email) {
        const existing = await ctx.db.contact.findUnique({
          where: { userId_email: { userId: ctx.user.id, email } },
          select: { id: true },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A contact with this email already exists",
          });
        }
      }

      // Upload avatar if it's a data URI
      const avatarUrl = await resolveAvatarUrl(rawAvatar);

      // Auto-link: look up user by email
      let linkedUserId: string | null = null;
      let linkedAvatar: string | null = null;
      if (email) {
        const linkedUser = await ctx.db.user.findUnique({
          where: { email },
          select: { id: true, image: true },
        });
        if (linkedUser) {
          linkedUserId = linkedUser.id;
          // Copy linked user's avatar if contact has no explicit avatar
          if (!avatarUrl && linkedUser.image) {
            linkedAvatar = linkedUser.image;
          }
        }
      }

      const encryptedPhone = encryptField(phone, env.FIELD_ENCRYPTION_KEY);

      const contact = await ctx.db.contact.create({
        data: {
          userId: ctx.user.id,
          name: input.name,
          email,
          phone: encryptedPhone,
          avatarUrl: avatarUrl ?? linkedAvatar,
          linkedUserId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          linkedUserId: true,
          linkedUser: linkedUserSelect,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        ...contact,
        phone: decryptField(contact.phone, env.FIELD_ENCRYPTION_KEY),
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      };
    }),

  update: protectedProcedure
    .input(updateContactSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.contact.findUnique({
        where: { id: input.id },
        select: { userId: true, email: true, avatarUrl: true },
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      const email = input.email === "" ? null : input.email;
      const phone = input.phone === "" ? null : input.phone;
      const rawAvatar = input.avatarUrl === "" ? null : input.avatarUrl;

      // Check duplicate email if changing it
      if (email) {
        const duplicate = await ctx.db.contact.findFirst({
          where: {
            userId: ctx.user.id,
            email,
            id: { not: input.id },
          },
          select: { id: true },
        });
        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A contact with this email already exists",
          });
        }
      }

      // Upload avatar if it's a data URI
      const avatarUrl =
        rawAvatar !== undefined ? await resolveAvatarUrl(rawAvatar) : undefined;

      // Re-check auto-link if email changed
      const emailChanged =
        input.email !== undefined && email !== existing.email;
      let linkedUserId: string | null | undefined;
      let linkedAvatar: string | null | undefined;
      if (emailChanged) {
        if (email) {
          const linkedUser = await ctx.db.user.findUnique({
            where: { email },
            select: { id: true, image: true },
          });
          if (linkedUser) {
            linkedUserId = linkedUser.id;
            if (!avatarUrl && !existing.avatarUrl && linkedUser.image) {
              linkedAvatar = linkedUser.image;
            }
          } else {
            linkedUserId = null;
          }
        } else {
          linkedUserId = null;
        }
      }

      const encryptedPhone =
        phone !== undefined
          ? encryptField(phone, env.FIELD_ENCRYPTION_KEY)
          : undefined;

      const contact = await ctx.db.contact.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.email !== undefined && { email }),
          ...(input.phone !== undefined && { phone: encryptedPhone }),
          ...(avatarUrl !== undefined && {
            avatarUrl: avatarUrl ?? linkedAvatar ?? null,
          }),
          ...(linkedUserId !== undefined && { linkedUserId }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          linkedUserId: true,
          linkedUser: linkedUserSelect,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        ...contact,
        phone: decryptField(contact.phone, env.FIELD_ENCRYPTION_KEY),
        createdAt: contact.createdAt.toISOString(),
        updatedAt: contact.updatedAt.toISOString(),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.contact.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      await ctx.db.contact.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
