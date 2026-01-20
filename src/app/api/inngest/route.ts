import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processRecurringTransaction } from "@/lib/inngest/functions/recurring";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processRecurringTransaction],
});
