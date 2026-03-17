import { TableSkeleton } from "@/components/skeletons/table-skeleton";

export default function TransactionsLoading() {
  return (
    <div className="space-y-8 pt-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-40 animate-pulse rounded" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="bg-muted h-10 w-32 animate-pulse rounded-lg" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded-lg" />
        </div>
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
