import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { CatalogueCategory } from "@/lib/catalogue-api";
import { focusRingClass } from "@/lib/ui";

import { UNCATEGORIZED_KEY } from "./catalogue-helpers";

export function ProductFilters({
  query,
  onQueryChange,
  categories,
  selectedCategories,
  onToggleCategory,
  outOfStockCount,
  outOfStockSelected,
  onToggleOutOfStock,
  filtersActive,
  onReset,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  categories: CatalogueCategory[];
  selectedCategories: Set<string>;
  onToggleCategory: (key: string) => void;
  outOfStockCount: number;
  outOfStockSelected: boolean;
  onToggleOutOfStock: () => void;
  filtersActive: boolean;
  onReset: () => void;
}) {
  const chips = categories
    .filter((row) => row.category !== null || row.product_count > 0)
    .map((row) => ({
      key: row.category ?? UNCATEGORIZED_KEY,
      label: row.category ?? "Sans catégorie",
      count: row.product_count,
    }));

  return (
    <div className="mt-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden="true"
        />
        <label htmlFor="product-search" className="sr-only">
          Rechercher un produit
        </label>
        <Input
          id="product-search"
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Nom du produit"
          className="pr-11 pl-9"
        />
        {query ? (
          <IconButton
            label="Effacer la recherche"
            onClick={() => onQueryChange("")}
            className="absolute top-1/2 right-0.5 size-10 -translate-y-1/2"
          >
            <X className="size-4" aria-hidden="true" />
          </IconButton>
        ) : null}
      </div>

      <div className="relative mt-3">
        <div
          role="group"
          aria-label="Filtrer le catalogue"
          className="flex gap-2 overflow-x-auto pb-1"
        >
          {chips.map((chip) => {
            const pressed = selectedCategories.has(chip.key);
            return (
              <button
                key={chip.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => onToggleCategory(chip.key)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular-nums",
                  "motion-safe:transition-colors motion-safe:duration-150",
                  focusRingClass,
                  pressed
                    ? "bg-accent text-white"
                    : "bg-accent-soft text-accent-text hover:bg-zinc-200",
                )}
              >
                {chip.label}
                <span className={pressed ? "text-white/80" : "text-zinc-500"}>
                  {chip.count}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={outOfStockSelected}
            onClick={onToggleOutOfStock}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-medium tabular-nums",
              "motion-safe:transition-colors motion-safe:duration-150",
              focusRingClass,
              outOfStockSelected
                ? "bg-accent text-white"
                : "bg-accent-soft text-accent-text hover:bg-zinc-200",
            )}
          >
            En rupture
            <span className={outOfStockSelected ? "text-white/80" : "text-zinc-500"}>
              {outOfStockCount}
            </span>
          </button>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent"
        />
      </div>

      {filtersActive ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 self-start"
          icon={<X className="size-4" />}
          onClick={onReset}
        >
          Tout effacer
        </Button>
      ) : null}
    </div>
  );
}
