import { inngest } from "./client";

export const RECURRING_EVENT = "recurring/run";

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
