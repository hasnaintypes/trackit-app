import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db as prisma } from "@/server/db";
import { sendTemplateEmail } from "@/lib/email";
import { admin, twoFactor } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { dash, sentinel } from "@better-auth/infra";
import { createLogger } from "@/lib/logging";
import { env } from "@/env";

const logger = createLogger("auth");

export const auth = betterAuth({
  plugins: [
    admin(),
    nextCookies(),
    dash({ apiKey: env.BETTER_AUTH_API_KEY }),
    sentinel({
      apiKey: env.BETTER_AUTH_API_KEY,
      // Disabled: normalizes Gmail-style emails (strips dots/+tags) on every
      // sign-in/sign-up/reset lookup and on user creation, but existing
      // accounts stored before this was enabled (or created via OAuth) keep
      // their literal email — causing a permanent lookup mismatch and
      // effectively locking those users out. See auth debugging 2026-09-26.
      security: { emailValidation: { enabled: false } },
    }),
    twoFactor({
      issuer: "Trackit",
      skipVerificationOnEnable: false,
      backupCodeOptions: {
        amount: 10,
        length: 10,
      },
    }),
  ],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
    sendResetPassword: async ({ user, url }) => {
      try {
        await sendTemplateEmail({
          to: user.email,
          subject: "Reset your password",
          template: "password-reset",
          data: { name: user.name || user.email, resetUrl: url },
        });
        logger.info("Password reset email sent", { email: user.email });
      } catch (error) {
        logger.error("Failed to send password reset email", {
          email: user.email,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    onPasswordReset: async ({ user }) => {
      logger.info("Password reset for user", { email: user.email });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendTemplateEmail({
          to: user.email,
          subject: "Verify your email address",
          template: "verification",
          data: { name: user.name || user.email, verificationUrl: url },
        });
        logger.info("Verification email sent", { email: user.email });
      } catch (error) {
        logger.error("Failed to send verification email", {
          email: user.email,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  },
});
