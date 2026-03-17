import { api, HydrateClient } from "@/trpc/server";
import OverviewPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  void api.account.list.prefetch();
  void api.transaction.list.prefetch({ limit: 100 });
  void api.category.list.prefetch();
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <OverviewPageClient />
    </HydrateClient>
  );
}
