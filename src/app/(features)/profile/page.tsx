import { api, HydrateClient } from "@/trpc/server";
import ProfilePageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  void api.user.getMe.prefetch();

  return (
    <HydrateClient>
      <ProfilePageClient />
    </HydrateClient>
  );
}
