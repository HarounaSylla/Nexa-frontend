"use client";

import { useId, useRef, useState } from "react";
import { Camera, Minus, Plus, Trash2 } from "lucide-react";

import { PhotoPlaceholderIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { mediaUrl } from "@/lib/api";
import { cn } from "@/lib/cn";
import type {
  CatalogueCategory,
  CatalogueProduct,
  ProductInput,
} from "@/lib/catalogue-api";
import { bannerErrorClass, focusRingClass } from "@/lib/ui";

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
  product,
  categories,
  error,
  pending,
  photoPending = false,
  deletePending = false,
  onClose,
  onSubmit,
  onUploadPhoto,
  onDelete,
}: {
  title: string;
  initial?: ProductInput;
  product?: CatalogueProduct | null;
  categories: CatalogueCategory[];
  error: string | null;
  pending: boolean;
  photoPending?: boolean;
  deletePending?: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
  onUploadPhoto?: (file: File) => void;
  onDelete?: () => void | Promise<void>;
}) {
  const listId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const priceId = useId();
  const categoryId = useId();
  const stockId = useId();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const values = initial ?? emptyForm;
  const [category, setCategory] = useState(values.category);
  const [stock, setStock] = useState(values.stock_qty);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = pending || photoPending || deletePending;
  const editing = Boolean(product);
  const options = categories
    .map((row) => row.category)
    .filter((name): name is string => Boolean(name));
  const photoSrc = mediaUrl(product?.image_url ?? null);

  return (
    <>
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy && !confirmDelete) {
          onClose();
        }
      }}
    >
      <DialogContent title={title} className="sm:max-w-lg">
        <form
          className="flex flex-col gap-3"
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
          {editing ? (
            <div className="flex flex-wrap items-center gap-3">
              {photoSrc ? (
                // Backend static files, not the Next.js image optimizer.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoSrc}
                  alt=""
                  className="size-24 shrink-0 rounded-control object-cover"
                />
              ) : (
                <div className="flex size-24 shrink-0 items-center justify-center rounded-control bg-accent-soft text-zinc-400">
                  <PhotoPlaceholderIcon className="size-8" />
                </div>
              )}
              <Button
                type="button"
                variant="secondary"
                loading={photoPending}
                icon={<Camera className="size-4" />}
                disabled={busy}
                onClick={() => photoInputRef.current?.click()}
              >
                {product?.image_url ? "Remplacer la photo" : "Ajouter une photo"}
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                suppressHydrationWarning
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onUploadPhoto?.(file);
                  }
                  event.target.value = "";
                }}
              />
            </div>
          ) : (
            <p className="text-caption text-zinc-500">
              Vous pourrez ajouter une photo après l&apos;enregistrement.
            </p>
          )}

          <Field label="Nom" htmlFor={nameId}>
            <Input
              id={nameId}
              name="name"
              required
              defaultValue={values.name}
            />
          </Field>
          <Field label="Description" htmlFor={descriptionId}>
            <Textarea
              id={descriptionId}
              name="description"
              rows={3}
              defaultValue={values.description}
            />
          </Field>
          <Field label="Prix" htmlFor={priceId}>
            <div className="relative">
              <Input
                id={priceId}
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={values.price}
                className="pr-9"
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-zinc-500">
                F
              </span>
            </div>
          </Field>
          <Field label="Catégorie" htmlFor={categoryId}>
            <Input
              id={categoryId}
              name="category"
              required
              list={listId}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Choisissez une catégorie existante ou saisissez-en une nouvelle"
            />
            <datalist id={listId}>
              {options.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            {options.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {options.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCategory(name)}
                    className={cn(
                      "inline-flex h-11 items-center rounded-full px-3 text-sm font-medium",
                      "motion-safe:transition-colors motion-safe:duration-150",
                      focusRingClass,
                      category === name
                        ? "bg-accent text-white"
                        : "bg-accent-soft text-accent-text hover:bg-zinc-200",
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            ) : null}
          </Field>
          <Field label="Quantité en stock" htmlFor={stockId}>
            <div className="flex items-center gap-2">
              <IconButton
                label="Diminuer le stock"
                className="shrink-0"
                disabled={stock <= 0 || busy}
                onClick={() => setStock((value) => Math.max(0, value - 1))}
              >
                <Minus className="size-4" aria-hidden="true" />
              </IconButton>
              <Input
                id={stockId}
                name="stock_qty"
                type="number"
                required
                min="0"
                step="1"
                inputMode="numeric"
                value={stock}
                onChange={(event) =>
                  setStock(Math.max(0, Number(event.target.value) || 0))
                }
                className="min-w-0 flex-1 text-center tabular-nums"
              />
              <IconButton
                label="Augmenter le stock"
                className="shrink-0"
                disabled={busy}
                onClick={() => setStock((value) => value + 1)}
              >
                <Plus className="size-4" aria-hidden="true" />
              </IconButton>
            </div>
          </Field>

          {error ? (
            <p className={bannerErrorClass} role="alert">
              {error}
            </p>
          ) : null}

          {editing && onDelete ? (
            <div className="border-t border-zinc-100 pt-3">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-danger hover:bg-danger-soft hover:text-danger"
                icon={<Trash2 className="size-4" />}
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                Supprimer le produit
              </Button>
            </div>
          ) : null}

          <div className="sticky bottom-0 -mx-4 mt-2 border-t border-zinc-100 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={busy}>
                {pending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce produit ?"
        description="Cette action est irréversible. Les produits déjà présents sur des commandes ne peuvent pas être supprimés."
        cancelLabel="Annuler"
        confirmLabel="Supprimer"
        confirmPendingLabel="Suppression…"
        variant="danger"
        pending={deletePending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          void Promise.resolve(onDelete?.()).finally(() => {
            setConfirmDelete(false);
          });
        }}
      />
    </>
  );
}
