import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db as prisma } from "@/server/db";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "../server/utils";
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
      const html = renderTemplate("password-reset", {
        name: user.name || user.email,
        resetUrl: url,
      });
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your password",
          html,
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
      const html = renderTemplate("verification", {
        name: user.name || user.email,
        verificationUrl: url,
      });
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          html,
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
