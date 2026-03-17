import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db as prisma } from "@/server/db";
import { sendTemplateEmail } from "@/lib/email";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { createLogger } from "@/lib/logging";

const logger = createLogger("auth");

export const auth = betterAuth({
  plugins: [admin(), nextCookies()],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
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
