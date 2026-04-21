import { api, HydrateClient } from "@/trpc/server";
import AnalyticsPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  void api.transaction.list.prefetch({ limit: 100 });
  void api.category.list.prefetch();
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <AnalyticsPageClient />
    </HydrateClient>
  );
}
