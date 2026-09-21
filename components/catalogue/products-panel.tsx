"use client";

import { useRef, useState } from "react";

import { PhotoPlaceholderIcon } from "@/components/icons";
import { errorMessage, mediaUrl } from "@/lib/api";
import {
  createProduct,
  deleteProduct,
  type CatalogueCategory,
  type CatalogueProduct,
  type ProductInput,
  updateProduct,
  uploadProductPhoto,
} from "@/lib/catalogue-api";
import {
  bannerErrorClass,
  btnDanger,
  btnDangerGhost,
  btnPrimary,
  btnSecondary,
  cardClass,
  cardInteractiveClass,
  emptyStateClass,
} from "@/lib/ui";

import {
  ProductFormDialog,
  productToInput,
} from "./product-form-dialog";

export function ProductsPanel({
  getToken,
  products,
  categories,
  loading,
  error,
  onRefresh,
}: {
  getToken: () => Promise<string | null>;
  products: CatalogueProduct[];
  categories: CatalogueCategory[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
}) {
  const [formMode, setFormMode] = useState<"create" | CatalogueProduct | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formPending, setFormPending] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoProductId = useRef<string | null>(null);

  async function submitForm(input: ProductInput) {
    setFormPending(true);
    setFormError(null);
    try {
      const token = await getToken();
      if (formMode === "create") {
        await createProduct(token, input);
      } else if (formMode) {
        await updateProduct(token, formMode.id, input);
      }
      setFormMode(null);
      await onRefresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setFormPending(false);
    }
  }

  async function confirmDelete(productId: string) {
    setPendingId(productId);
    setActionError(null);
    try {
      await deleteProduct(await getToken(), productId);
      setConfirmId(null);
      await onRefresh();
    } catch (err) {
      setConfirmId(null);
      setActionError(errorMessage(err));
    } finally {
      setPendingId(null);
    }
  }

  async function onPhotoSelected(file: File | undefined) {
    const productId = photoProductId.current;
    if (!file || !productId) {
      return;
    }
    setPendingId(productId);
    setActionError(null);
    try {
      await uploadProductPhoto(await getToken(), productId, file);
      await onRefresh();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setPendingId(null);
      photoProductId.current = null;
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  }

  if (loading) {
    return <p className="mt-6 text-sm text-zinc-500">Chargement des produits…</p>;
  }

  if (error) {
    return (
      <p className={`mt-6 ${bannerErrorClass}`} role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 tabular-nums">
          {products.length} produit{products.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setFormMode("create");
          }}
          className={btnPrimary}
        >
          Ajouter un produit
        </button>
      </div>

      {actionError ? (
        <p className={`mt-4 ${bannerErrorClass}`} role="alert">
          {displayCatalogueError(actionError)}
        </p>
      ) : null}

      {products.length === 0 ? (
        <div className={`mt-8 ${emptyStateClass}`}>
          <p className="font-medium text-zinc-800">Aucun produit pour le moment</p>
          <p className="mt-1 text-sm">
            Ajoutez votre premier produit pour constituer le catalogue.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const src = mediaUrl(product.image_url);
            return (
              <li key={product.id} className={`${cardInteractiveClass} overflow-hidden`}>
                {src ? (
                  // Backend static files, not the Next.js image optimizer.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt=""
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-accent-soft text-zinc-400">
                    <PhotoPlaceholderIcon className="size-8" />
                  </div>
                )}
                <div className="flex flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="mt-1 truncate text-sm text-zinc-500 tabular-nums">
                      {product.category ?? "Sans catégorie"} · Stock {product.stock_qty}
                    </p>
                    <p className="mt-1 font-medium tabular-nums">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={pendingId === product.id}
                      onClick={() => {
                        setFormError(null);
                        setFormMode(product);
                      }}
                      className={btnSecondary}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === product.id}
                      onClick={() => {
                        photoProductId.current = product.id;
                        photoInputRef.current?.click();
                      }}
                      className={btnSecondary}
                    >
                      {product.image_url ? "Remplacer la photo" : "Ajouter une photo"}
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === product.id}
                      onClick={() => {
                        setActionError(null);
                        setConfirmId(product.id);
                      }}
                      className={btnDangerGhost}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        suppressHydrationWarning
        onChange={(event) => onPhotoSelected(event.target.files?.[0])}
      />

      {formMode ? (
        <ProductFormDialog
          title={formMode === "create" ? "Ajouter un produit" : "Modifier le produit"}
          initial={formMode === "create" ? undefined : productToInput(formMode)}
          categories={categories}
          error={formError ? displayCatalogueError(formError) : null}
          pending={formPending}
          onClose={() => setFormMode(null)}
          onSubmit={submitForm}
        />
      ) : null}

      {confirmId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
          >
            <h2 id="delete-title" className="font-display text-lg font-bold">
              Supprimer ce produit ?
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Cette action est irréversible. Les produits déjà présents sur des
              commandes ne peuvent pas être supprimés.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={pendingId === confirmId}
                onClick={() => setConfirmId(null)}
                className={btnSecondary}
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={pendingId === confirmId}
                onClick={() => confirmDelete(confirmId)}
                className={btnDanger}
              >
                {pendingId === confirmId ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatPrice(price: string | number | null): string {
  if (price == null || price === "") {
    return "Pas de prix";
  }
  const value = typeof price === "number" ? price : Number(price);
  if (Number.isNaN(value)) {
    return String(price);
  }
  return `${value.toLocaleString("fr-FR")} F`;
}

const DELETE_BLOCKED_EN =
  "This product has existing orders and cannot be deleted. Set stock to 0 instead of removing it from the catalogue.";
const DELETE_BLOCKED_FR =
  "Ce produit a des commandes existantes et ne peut pas être supprimé. Mettez le stock à 0 plutôt que de le retirer du catalogue.";

function displayCatalogueError(message: string): string {
  return message === DELETE_BLOCKED_EN ? DELETE_BLOCKED_FR : message;
}
