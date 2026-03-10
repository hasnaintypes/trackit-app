import { Inngest } from "inngest";
import { env } from "@/env";

export const inngest = new Inngest<{
  id: string;
  eventKey: string | undefined;
  signingKey: string | undefined;
}>({
  id: "trackit-saas",
  eventKey: env.INNGEST_EVENT_KEY ?? process.env.INNGEST_EVENT_KEY,
  signingKey: env.INNGEST_SIGNING_KEY ?? process.env.INNGEST_SIGNING_KEY,
});
