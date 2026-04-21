import { api, HydrateClient } from "@/trpc/server";
import SplitsPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function SplitsPage() {
  void api.group.list.prefetch({ includeArchived: false });
  void api.contact.list.prefetch({ limit: 50 });
  void api.overview.splitSummary.prefetch();
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <SplitsPageClient />
    </HydrateClient>
  );
}
