import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CatalogueCategory } from "@/lib/catalogue-api";

export function CategoryRow({
  row,
  onRename,
}: {
  row: CatalogueCategory;
  onRename: (name: string) => void;
}) {
  const name = row.category;

  return (
    <li className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-900">
          {name ?? "Sans catégorie"}
        </p>
        <p className="text-sm tabular-nums text-zinc-500">
          {row.product_count} produit{row.product_count === 1 ? "" : "s"}
        </p>
      </div>
      {name ? (
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil className="size-4" />}
          onClick={() => onRename(name)}
        >
          Renommer
        </Button>
      ) : null}
    </li>
  );
}
