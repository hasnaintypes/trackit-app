import { inngest } from "@/lib/inngest/client";

export const RECURRING_EVENT = "recurring/run";
export const TRANSACTION_PROCESSED_EVENT = "transaction/processed";
export const SEND_EMAIL_EVENT = "notification/send-email";
export const BUDGET_THRESHOLD_REACHED_EVENT = "budget/threshold.reached";
export const TRANSACTION_ALERT_EVENT = "transaction/large-transaction.detected";

type InngestSendOptions = {
  delayUntil?: string;
  env?: string;
};

export async function enqueueRecurringRun(
  ruleId: string,
  runAt: Date,
): Promise<void> {
  const opts: InngestSendOptions = { delayUntil: runAt.toISOString() };
  await inngest.send({ name: RECURRING_EVENT, data: { ruleId } }, opts);
}

export async function emitTransactionProcessed(params: {
  userId: string;
  transactionId: string;
  accountId: string;
  categoryId: string | null;
  date: Date;
}) {
  await inngest.send({
    name: TRANSACTION_PROCESSED_EVENT,
    data: params,
  });
}

export async function emitTransactionAlert(params: {
  userId: string;
  amount: number;
  description: string;
  threshold: number;
}) {
  await inngest.send({
    name: TRANSACTION_ALERT_EVENT,
    data: params,
  });
}

export async function enqueueEmail(params: {
  to: string;
  subject: string;
  body: string;
}) {
  await inngest.send({
    name: SEND_EMAIL_EVENT,
    data: params,
  });
}
