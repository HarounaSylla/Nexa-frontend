import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader title="Tableau de bord" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-card border border-zinc-200/80 bg-white p-4"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-12" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-card border border-zinc-200/80 bg-white"
          >
            <div className="border-b border-zinc-100 px-4 py-3">
              <Skeleton className="h-5 w-40" />
            </div>
            {Array.from({ length: 3 }, (_, row) => (
              <div
                key={row}
                className="flex min-h-[72px] items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-40" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
