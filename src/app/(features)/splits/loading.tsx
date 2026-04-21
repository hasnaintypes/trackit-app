import { Skeleton } from "@ui/skeleton";

export default function SplitsLoading() {
  return (
    <div className="space-y-12">
      {/* Stats cards skeleton — 3 cards matching overview style */}
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border px-6 py-5 shadow-md dark:border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="mt-5 flex items-end justify-between">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Unified toolbar skeleton */}
      <div className="bg-card flex items-center justify-between rounded-xl border p-2">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[280px] rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Groups grid skeleton — full width */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card relative overflow-hidden rounded-2xl border p-5 shadow-sm dark:border-white/10"
          >
            <Skeleton className="absolute inset-x-0 top-0 h-[2px]" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-7 w-7 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
