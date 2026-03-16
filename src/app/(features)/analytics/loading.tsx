import { ChartSkeleton } from "@/components/skeletons/chart-skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
        <div className="bg-muted h-4 w-64 animate-pulse rounded" />
      </div>
      <ChartSkeleton height={400} />
    </div>
  );
}
