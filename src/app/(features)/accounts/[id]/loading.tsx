import { Skeleton } from "@ui/skeleton";
import { TableSkeleton } from "@skeletons/table-skeleton";

export default function AccountDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="space-y-1 text-right">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
