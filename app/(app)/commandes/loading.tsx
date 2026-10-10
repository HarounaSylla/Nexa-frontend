import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader title="Commandes" />
      <Skeleton className="mt-4 h-11 w-full" />
      <div className="mt-3 flex flex-col gap-3">
        <div>
          <Skeleton className="h-3 w-36" />
          <div className="mt-1 flex gap-2">
            <Skeleton className="h-11 w-20 rounded-full" />
            <Skeleton className="h-11 w-36 rounded-full" />
            <Skeleton className="h-11 w-20 rounded-full" />
          </div>
        </div>
        <div>
          <Skeleton className="h-3 w-20" />
          <div className="mt-1 flex gap-2">
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-11 w-44 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-card border border-zinc-200/80 bg-white">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-[72px] items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-2 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-3 w-36" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
