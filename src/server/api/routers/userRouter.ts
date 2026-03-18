import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { uploadForProfile } from "@shared/imagekit";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import {
  updateProfileSchema,
  uploadProfileImageSchema,
  searchUserSchema,
} from "@/validation/user";

/**
 * User router (user-facing).
 *
 * This module exposes a tRPC router with common user-facing endpoints. It deliberately
 * limits responses to public-safe fields where appropriate (no emails or sensitive
 * information in public procedures). Authentication/authorization is expected to be
 * handled by the `protectedProcedure` middleware and/or additional context middleware
 * in `createTRPCContext`.
 *
 * Exports:
 * - userRouter: the tRPC router exposing user endpoints
 */

/**
 * Default avatar URL for users with unspecified gender (or as a general fallback).
 * @type {string}
 */
export const DEFAULT_AVATAR_BOY = "https://avatar.iran.liara.run/public/boy";

/**
 * Default avatar URL for users who identify as female.
 * @type {string}
 */
export const DEFAULT_AVATAR_GIRL = "https://avatar.iran.liara.run/public/girl";

/**
 * Resolve which avatar URL to use for a user.
 *
 * The function prefers an explicitly provided `image`. If no image is present it
 * falls back to a gender-specific default. If gender is not provided or unrecognized
 * the boy/default avatar is returned.
 *
 * @param {string | null | undefined} image - Explicit user-provided avatar URL (may be null/undefined)
 * @param {string | null | undefined} gender - User gender string (expected values: "MALE", "FEMALE", "OTHER")
 * @returns {string} - Resolved avatar URL
 */
import { getAvatarUrl } from "@shared/avatar";

export const userRouter = createTRPCRouter({
  /**
   * Get public profile for a user by id.
   *
   * This procedure returns only public-safe fields (no email). If the user is not
   * found, `null` is returned.
   *
   * @param {{id: string}} input - Object with the user `id` string
   * @returns {Promise<null | {id:string,name:string|null,image:string,role:string,gender:string|null,createdAt:string,updatedAt:string,banned:boolean}>}
   */
  getPublicById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
          banned: true,
        },
      });
      if (!user) return null;

      const avatar = getAvatarUrl({ image: user.image, gender: user.gender });

      return {
        id: user.id,
        name: user.name ?? null,
        image: avatar,
        role: user.role,
        gender: user.gender ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        banned: user.banned ?? false,
      };
    }),

  /**
   * Update profile fields for the currently authenticated user.
   *
   * NOTE: `protectedProcedure` ensures authentication; however, this procedure
   * assumes the authenticated user is allowed to update their own profile. For
   * cross-account authorization checks, add additional middleware.
   *
   * @param {{name?:string,image?:string,gender?:"MALE"|"FEMALE"|"OTHER"}} input - Fields to update
   * @returns {Promise<{id:string,name:string|null,image:string,role:string,gender:string|null,createdAt:string,updatedAt:string}>}
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      // ctx.user is guaranteed by protectedProcedure middleware
      const userId = ctx.user.id;

      const data: Prisma.UserUpdateInput = {};

      if (typeof input.name !== "undefined") data.name = input.name;
      if (typeof input.image !== "undefined") data.image = input.image;
      if (typeof input.gender !== "undefined") data.gender = input.gender;
      if (typeof input.country !== "undefined") data.country = input.country;
      if (typeof input.timezone !== "undefined") data.timezone = input.timezone;

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          gender: true,
          country: true,
          timezone: true,
          banned: true,
          banReason: true,
          banExpires: true,
          hasCompletedOnboarding: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        emailVerified: Boolean(user.emailVerified ?? false),
        image: getAvatarUrl({ image: user.image, gender: user.gender }),
        role: user.role,
        gender: user.gender ?? null,
        country: user.country ?? null,
        timezone: user.timezone ?? null,
        banned: user.banned ?? false,
        banReason: user.banReason ?? null,
        banExpires: user.banExpires ? user.banExpires.toISOString() : null,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    }),

  /**
   * Upload and set the authenticated user's profile image.
   *
   * Accepts either a remote URL (ImageKit will fetch it) or a base64/data URI
   * and uploads it to ImageKit, then updates the user's `image` field with the
   * returned hosted URL.
   *
   * @param {{file:string,fileName?:string}} input - `file` may be a remote URL or base64 data URI
   * @returns {Promise<{id:string,name:string|null,image:string,role:string,gender:string|null,createdAt:string,updatedAt:string}>}
   */
  uploadProfileImage: protectedProcedure
    .input(uploadProfileImageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // Upload to ImageKit (throws if upload fails or env not configured)
      const result = await uploadForProfile(
        input.file,
        input.fileName,
        input.folder,
      );

      const imageUrl = result && (result.url ?? result.filePath);
      if (!imageUrl || typeof imageUrl !== "string")
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Image upload did not return a valid URL",
        });

      const user = await ctx.db.user.update({
        where: { id: userId },
        data: { image: imageUrl, updatedAt: new Date() },
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          gender: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        id: user.id,
        name: user.name ?? null,
        image: getAvatarUrl({ image: user.image, gender: user.gender }),
        role: user.role,
        gender: user.gender ?? null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    }),

  /**
   * Get profile for the currently authenticated user.
   *
   * Returns the user's public profile derived from the authentication context.
   * If there is no authenticated user in context, `null` is returned.
   *
   * Note: This is a protected procedure so it's safe to return the current
   * user's email and emailVerified flags back to the caller.
   *
   * @returns {Promise<null|{id:string,name:string|null,email:string|null,emailVerified:boolean,image:string,role:string,gender:string|null,createdAt:string|null,updatedAt:string|null}>}
   */
  getMe: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        gender: true,
        country: true,
        timezone: true,
        banned: true,
        banReason: true,
        banExpires: true,
        hasCompletedOnboarding: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      emailVerified: Boolean(user.emailVerified ?? false),
      image: getAvatarUrl({ image: user.image, gender: user.gender }),
      role: user.role,
      gender: user.gender ?? null,
      country: user.country ?? null,
      timezone: user.timezone ?? null,
      banned: user.banned ?? false,
      banReason: user.banReason ?? null,
      banExpires: user.banExpires ? user.banExpires.toISOString() : null,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }),

  /**
   * Basic search/listing for users. Returns public info only. Limited to a sensible max.
   *
   * Query params:
   * - q: optional search string to match against name or email (case-insensitive)
   * - limit: number of results to return (default 20, max 100)
   * - cursor: optional cursor id for pagination
   *
   * @param {{q?:string,limit?:number,cursor?:string}} input
   * @returns {Promise<{users:Array<object>,nextCursor?:string|undefined}>}
   */
  search: protectedProcedure
    .input(searchUserSchema)
    .query(async ({ ctx, input }) => {
      const where: Prisma.UserWhereInput = {};
      if (input.q) {
        // Only search by name to prevent email enumeration
        where.name = { contains: input.q, mode: "insensitive" };
      }

      const users = await ctx.db.user.findMany({
        where,
        take: input.limit + 1,
        orderBy: { createdAt: "desc" },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        select: {
          id: true,
          name: true,
          image: true,
          gender: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      let nextCursor: string | undefined = undefined;
      if (users.length > input.limit) {
        const next = users.pop()!;
        nextCursor = next.id;
      }

      return {
        users: users.map((u) => ({
          id: u.id,
          name: u.name ?? null,
          image: getAvatarUrl({ image: u.image, gender: u.gender }),
          role: u.role,
          gender: u.gender ?? null,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        })),
        nextCursor,
      };
    }),
});

export default userRouter;
