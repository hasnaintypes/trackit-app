import { Skeleton } from "@/components/ui/skeleton";

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}
