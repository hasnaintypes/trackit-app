import { api, HydrateClient } from "@/trpc/server";
import ReportsPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  void api.report.list.prefetch({ limit: 100 });

  return (
    <HydrateClient>
      <ReportsPageClient />
    </HydrateClient>
  );
}
