import { api, HydrateClient } from "@/trpc/server";
import AccountDetailPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  void api.account.list.prefetch();
  void api.transaction.list.prefetch({ accountId: id, limit: 20, page: 1 });
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <AccountDetailPageClient />
    </HydrateClient>
  );
}
