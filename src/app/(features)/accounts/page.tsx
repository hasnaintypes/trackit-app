import { api, HydrateClient } from "@/trpc/server";
import AccountsPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  void api.account.list.prefetch();
  void api.settings.getAll.prefetch();

  return (
    <HydrateClient>
      <AccountsPageClient />
    </HydrateClient>
  );
}
