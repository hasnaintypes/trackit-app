import { Skeleton } from "@ui/skeleton";

export default function GroupDetailLoading() {
  return (
    <div className="space-y-12">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-6 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Stats — 3 cards */}
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

      {/* Tabs skeleton */}
      <div className="bg-card rounded-xl border p-2">
        <Skeleton className="h-9 w-72 rounded-lg" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="col-span-full space-y-2 lg:col-span-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
        <div className="col-span-full lg:col-span-2">
          <div className="bg-card rounded-xl border p-6 shadow-sm">
            <Skeleton className="mb-4 h-5 w-20" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
