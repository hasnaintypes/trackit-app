import { api, HydrateClient } from "@/trpc/server";
import GroupDetailPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  void api.group.getById.prefetch({ id: groupId });
  void api.group.getBalances.prefetch({ id: groupId });
  void api.group.getSimplifiedDebts.prefetch({ id: groupId });
  void api.group.activityFeed.prefetch({ id: groupId, limit: 30 });
  void api.expense.list.prefetch({ groupId, limit: 30 });
  void api.settlement.list.prefetch({ groupId, limit: 30 });
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <GroupDetailPageClient groupId={groupId} />
    </HydrateClient>
  );
}
