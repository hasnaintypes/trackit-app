import { api, HydrateClient } from "@/trpc/server";
import TransactionsPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  void api.transaction.list.prefetch({ limit: 20, page: 1 });
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <TransactionsPageClient />
    </HydrateClient>
  );
}
