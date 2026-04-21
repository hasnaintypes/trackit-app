import { api, HydrateClient } from "@/trpc/server";
import SettingsPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  void api.settings.getAll.prefetch();
  void api.category.list.prefetch();

  return (
    <HydrateClient>
      <SettingsPageClient />
    </HydrateClient>
  );
}
