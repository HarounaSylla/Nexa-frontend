import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader title="Commandes" />
      <Skeleton className="mt-6 h-11 w-full max-w-xs" />
      <Skeleton className="mt-4 h-24 w-full" />
      <Skeleton className="mt-3 h-24 w-full" />
    </div>
  );
}
