import { StatsSkeleton } from "@skeletons/stats-skeleton";
import { ChartSkeleton } from "@skeletons/chart-skeleton";
import { TableSkeleton } from "@skeletons/table-skeleton";

export default function OverviewLoading() {
  return (
    <div className="space-y-8">
      <StatsSkeleton />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ChartSkeleton height={300} />
        </div>
        <div className="col-span-3">
          <ChartSkeleton height={300} />
        </div>
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
