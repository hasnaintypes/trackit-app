import { api, HydrateClient } from "@/trpc/server";
import BudgetPageClient from "./_client";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  void api.budget.all.prefetch();

  return (
    <HydrateClient>
      <BudgetPageClient />
    </HydrateClient>
  );
}
