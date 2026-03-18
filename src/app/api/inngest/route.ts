import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  processRecurringTransaction,
  notifyUpcomingRecurring,
} from "@/lib/inngest/functions/recurring";
import { evaluateBudgetOnTransaction } from "@/lib/inngest/functions/budget";
import { generateMonthlyReport } from "@/lib/inngest/functions/generate-monthly-report";
import { sendWeeklyDigest } from "@/lib/inngest/functions/send-weekly-digest";
import { sendBudgetAlertEmail } from "@/lib/inngest/functions/send-budget-alert-email";
import { sendAiInsights } from "@/lib/inngest/functions/send-ai-insights";
import { sendTransactionAlertEmail } from "@/lib/inngest/functions/send-transaction-alert-email";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRecurringTransaction,
    notifyUpcomingRecurring,
    evaluateBudgetOnTransaction,
    generateMonthlyReport,
    sendWeeklyDigest,
    sendBudgetAlertEmail,
    sendAiInsights,
    sendTransactionAlertEmail,
  ],
});
