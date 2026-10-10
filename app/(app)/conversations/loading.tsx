import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader title="Conversations" />
      <Skeleton className="mt-6 h-24 w-full" />
      <Skeleton className="mt-3 h-24 w-full" />
    </div>
  );
}
