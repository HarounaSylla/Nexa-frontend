import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader title="Paramètres" />
      <div className="mt-4 flex gap-2 border-b border-zinc-200">
        <Skeleton className="h-11 w-28" />
      </div>
      <div className="mt-6 flex max-w-2xl flex-col gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-card border border-zinc-200/80 bg-white p-4"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-64" />
            <Skeleton className="mt-4 h-11 w-full" />
            <Skeleton className="mt-3 h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
