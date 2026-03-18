import { inngest } from "@/lib/inngest/client";
import { createLogger } from "@/lib/logging";
import { db } from "@/server/db";
import { TRANSACTION_ALERT_EVENT } from "@/constants/events";
import { sendTemplateEmail } from "@/lib/email";

const logger = createLogger("inngest-transaction-alert");

/**
 * Send Transaction Alert Email
 * Triggered when a transaction exceeds the user's large transaction threshold.
 */
export const sendTransactionAlertEmail = inngest.createFunction(
  {
    id: "send-transaction-alert-email",
    name: "Send Transaction Alert Email",
  },
  { event: TRANSACTION_ALERT_EVENT },

  async ({ event, step }) => {
    const { userId, amount, description, threshold } = event.data as {
      userId: string;
      amount: number;
      description: string;
      threshold: number;
    };

    const user = await step.run("fetch-user", async () => {
      return db.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });
    });

    if (!user) {
      logger.error("User not found for transaction alert", { userId });
      return;
    }

    await step.run("send-email", async () => {
      try {
        await sendTemplateEmail({
          to: user.email,
          subject: `Large Transaction Alert: $${amount.toFixed(2)}`,
          template: "transaction-alert",
          data: {
            userName: user.name,
            amount: amount.toFixed(2),
            description,
            threshold: threshold.toFixed(2),
            date: new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
        });

        logger.info("Transaction alert email sent", {
          userId,
          amount,
          threshold,
        });

        return { success: true, emailSent: true };
      } catch (error) {
        logger.error("Failed to send transaction alert email", {
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });
  },
);
