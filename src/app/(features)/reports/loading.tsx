import { TableSkeleton } from "@/components/skeletons/table-skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-64 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-10 w-52 animate-pulse rounded-lg" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
