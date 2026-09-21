"use client";

import { useEffect, useId } from "react";

import type { CatalogueCategory, CatalogueProduct, ProductInput } from "@/lib/catalogue-api";
import { bannerErrorClass, btnPrimary, btnSecondary, cardClass, inputClass } from "@/lib/ui";

const emptyForm: ProductInput = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock_qty: 0,
};

export function productToInput(product: CatalogueProduct): ProductInput {
  return {
    name: product.name,
    description: product.description ?? "",
    price: product.price == null ? "" : String(product.price),
    category: product.category ?? "",
    stock_qty: product.stock_qty,
  };
}

export function ProductFormDialog({
  title,
  initial,
  categories,
  error,
  pending,
  onClose,
  onSubmit,
}: {
  title: string;
  initial?: ProductInput;
  categories: CatalogueCategory[];
  error: string | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}) {
  const titleId = useId();
  const listId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending]);

  const values = initial ?? emptyForm;
  const options = categories
    .map((row) => row.category)
    .filter((name): name is string => Boolean(name));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
      >
        <h2 id={titleId} className="font-display text-lg font-bold">
          {title}
        </h2>
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onSubmit({
              name: String(data.get("name") ?? "").trim(),
              description: String(data.get("description") ?? "").trim(),
              price: String(data.get("price") ?? "").trim(),
              category: String(data.get("category") ?? "").trim(),
              stock_qty: Number(data.get("stock_qty") ?? 0),
            });
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nom
            <input
              name="name"
              required
              defaultValue={values.name}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Description
            <textarea
              name="description"
              rows={3}
              defaultValue={values.description}
              className={`${inputClass} h-auto py-2`}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Prix
            <input
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={values.price}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Catégorie
            <input
              name="category"
              required
              list={listId}
              defaultValue={values.category}
              placeholder="Choisissez une catégorie existante ou saisissez-en une nouvelle"
              className={inputClass}
            />
            <datalist id={listId}>
              {options.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Quantité en stock
            <input
              name="stock_qty"
              type="number"
              required
              min="0"
              step="1"
              defaultValue={values.stock_qty}
              className={inputClass}
            />
          </label>
          {error ? (
            <p className={bannerErrorClass} role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className={btnSecondary}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className={btnPrimary}
            >
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
