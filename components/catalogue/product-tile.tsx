import { PhotoPlaceholderIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { mediaUrl } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { CatalogueProduct } from "@/lib/catalogue-api";
import { focusRingClass } from "@/lib/ui";

import { formatPrice } from "./catalogue-helpers";

export const LOW_STOCK_THRESHOLD = 3;

export function ProductTile({
  product,
  onOpen,
}: {
  product: CatalogueProduct;
  onOpen: () => void;
}) {
  const src = mediaUrl(product.image_url);
  const stock = product.stock_qty;

  return (
    <li className="flex h-full min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-card border border-zinc-200/80 bg-white text-left shadow-card",
          "hover:shadow-card-hover motion-safe:transition-shadow motion-safe:duration-150",
          focusRingClass,
        )}
      >
        {src ? (
          // Backend static files, not the Next.js image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className="aspect-square w-full rounded-t-[inherit] object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-accent-soft text-zinc-400">
            <PhotoPlaceholderIcon className="size-8" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <p className="line-clamp-2 font-medium text-zinc-900">{product.name}</p>
          <p className="truncate text-caption text-zinc-500">
            {product.category ?? "Sans catégorie"}
          </p>
          <p className="mt-auto pt-1 font-medium tabular-nums text-zinc-900">
            {formatPrice(product.price)}
          </p>
          <StockIndicator stock={stock} />
        </div>
      </button>
    </li>
  );
}

function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) {
    return <Badge tone="danger">Rupture</Badge>;
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return <Badge tone="warning">Stock bas</Badge>;
  }
  return (
    <p className="text-caption tabular-nums text-zinc-500">Stock {stock}</p>
  );
}
