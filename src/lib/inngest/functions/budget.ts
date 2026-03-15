import { inngest } from "../client";
import { TRANSACTION_PROCESSED_EVENT } from "../events";
import { BudgetService } from "@/server/services/budgetService";
import { toNum } from "@/lib/shared/decimal";
import { NotificationService } from "@/server/services/notificationService";
import { NotificationType } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { env } from "@/env";
import { db } from "@/server/db";
import { AIService } from "@/server/services/aiService";
import type { AnomalyDetection } from "@/types/ai";

export const evaluateBudgetOnTransaction = inngest.createFunction(
  {
    id: "evaluate-budget-on-transaction",
    name: "Evaluate Budget on Transaction",
  },
  { event: TRANSACTION_PROCESSED_EVENT },
  async ({ event, step }) => {
    const { userId, categoryId, date, accountId, transactionId } =
      event.data as {
        userId: string;
        transactionId: string;
        accountId: string;
        categoryId: string | null;
        date: string;
      };

    // 1. Core Budget Re-evaluation
    if (categoryId) {
      await step.run("evaluate-budgets", async () => {
        await BudgetService.evaluateBudgets({
          userId,
          categoryId,
          date: new Date(date),
        });
      });
    }

    // 2. Threshold Monitoring (Large Transaction & Low Balance)
    await step.run("check-thresholds", async () => {
      const transaction = await db.transaction.findUnique({
        where: { id: transactionId },
      });
      if (transaction) {
        await BudgetService.checkLargeTransaction(
          userId,
          toNum(transaction.amount),
          transaction.description ?? "Untitled",
        );
      }
      await BudgetService.checkLowBalance(userId, accountId);
    });

    // 3. AI Anomaly Detection (High Severity only)
    await step.run("detect-severe-anomalies", async () => {
      const anomalyResult = await AIService.detectAnomalies(userId);

      if (anomalyResult && Array.isArray(anomalyResult.anomalies)) {
        const severe = anomalyResult.anomalies.find(
          (a: AnomalyDetection["anomalies"][number]) =>
            a.severity?.toLowerCase() === "high" ||
            a.severity?.toLowerCase() === "severe",
        );

        if (severe) {
          const user = await db.user.findUnique({ where: { id: userId } });
          if (!user) return;

          // 1. In-App Notification
          await NotificationService.createNotification({
            userId,
            type: NotificationType.SYSTEM_ALERT,
            title: "High Priority AI Insight",
            message: `Unusual activity detected: ${severe.reason}. Please review your recent transactions.`,
          });

          // 2. Immediate Email Alert
          const fs = await import("fs/promises");
          const path = await import("path");
          const templatePath = path.join(
            process.cwd(),
            "src/lib/email/templates/ai-insight.html",
          );
          let template = await fs.readFile(templatePath, "utf-8");

          template = template
            .replace(/{{userName}}/g, user.name ?? "there")
            .replace(
              /{{aiContent}}/g,
              `${severe.reason}. We recommend reviewing your recent transactions for accuracy.`,
            )
            .replace(/{{appUrl}}/g, env.NEXT_PUBLIC_APP_URL ?? "")
            .replace("{{#if hasAnomalies}}", "")
            .replace("{{/if}}", "");

          await sendEmail({
            to: user.email,
            subject: "High Priority: Unusual Activity Detected",
            html: template,
          });
        }
      }
    });

    return { processed: true, userId, categoryId };
  },
);
