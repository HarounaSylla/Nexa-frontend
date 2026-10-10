"use client";

import { useEffect, useMemo, useState } from "react";
import { Package, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import {
  createProduct,
  deleteProduct,
  type CatalogueCategory,
  type CatalogueProduct,
  type ProductInput,
  updateProduct,
  uploadProductPhoto,
} from "@/lib/catalogue-api";
import { bannerErrorClass } from "@/lib/ui";

import {
  displayCatalogueError,
  normalizeSearch,
  UNCATEGORIZED_KEY,
} from "./catalogue-helpers";
import { ProductFilters } from "./product-filters";
import { ProductFormDialog, productToInput } from "./product-form-dialog";
import { ProductTile } from "./product-tile";

function toggleValue(current: Set<string>, value: string): Set<string> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function ProductsPanel({
  getToken,
  products,
  categories,
  loading,
  error,
  editing,
  onEditingChange,
  onSubtitleChange,
  onRefresh,
}: {
  getToken: () => Promise<string | null>;
  products: CatalogueProduct[];
  categories: CatalogueCategory[];
  loading: boolean;
  error: string | null;
  editing: "create" | CatalogueProduct | null;
  onEditingChange: (value: "create" | CatalogueProduct | null) => void;
  onSubtitleChange: (value: string) => void;
  onRefresh: () => Promise<CatalogueProduct[]>;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [formPending, setFormPending] = useState(false);
  const [photoPending, setPhotoPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const [outOfStock, setOutOfStock] = useState(false);

  const filtersActive =
    query.trim() !== "" || selectedCategories.size > 0 || outOfStock;
  const outOfStockCount = products.filter((row) => row.stock_qty === 0).length;

  const visibleProducts = useMemo(() => {
    const needle = normalizeSearch(query);
    return products.filter((product) => {
      if (selectedCategories.size > 0) {
        const key = product.category ?? UNCATEGORIZED_KEY;
        if (!selectedCategories.has(key)) {
          return false;
        }
      }
      if (outOfStock && product.stock_qty !== 0) {
        return false;
      }
      if (needle && !normalizeSearch(product.name).includes(needle)) {
        return false;
      }
      return true;
    });
  }, [outOfStock, products, query, selectedCategories]);

  useEffect(() => {
    const total = products.length;
    const noun = total === 1 ? "produit" : "produits";
    onSubtitleChange(
      filtersActive
        ? `${visibleProducts.length} sur ${total} ${noun}`
        : `${total} ${noun}`,
    );
  }, [filtersActive, onSubtitleChange, products.length, visibleProducts.length]);

  function resetFilters() {
    setQuery("");
    setSelectedCategories(new Set());
    setOutOfStock(false);
  }

  async function submitForm(input: ProductInput) {
    setFormPending(true);
    setFormError(null);
    try {
      const token = await getToken();
      if (editing === "create") {
        await createProduct(token, input);
        toast.success("Produit ajouté.");
      } else if (editing) {
        await updateProduct(token, editing.id, input);
        toast.success("Produit modifié.");
      }
      onEditingChange(null);
      await onRefresh();
    } catch (err) {
      const message = displayCatalogueError(errorMessage(err));
      setFormError(message);
      toast.error(message);
    } finally {
      setFormPending(false);
    }
  }

  async function confirmDelete() {
    if (!editing || editing === "create") {
      return;
    }
    setDeletePending(true);
    setActionError(null);
    setFormError(null);
    try {
      await deleteProduct(await getToken(), editing.id);
      toast.success("Produit supprimé.");
      onEditingChange(null);
      await onRefresh();
    } catch (err) {
      const message = displayCatalogueError(errorMessage(err));
      setFormError(message);
      setActionError(message);
      toast.error(message);
    } finally {
      setDeletePending(false);
    }
  }

  async function onUploadPhoto(file: File) {
    if (!editing || editing === "create") {
      return;
    }
    setPhotoPending(true);
    setFormError(null);
    setActionError(null);
    try {
      const updated = await uploadProductPhoto(
        await getToken(),
        editing.id,
        file,
      );
      toast.success("Photo mise à jour.");
      const next = await onRefresh();
      const fresh = next.find((row) => row.id === updated.id) ?? updated;
      onEditingChange(fresh);
    } catch (err) {
      const message = displayCatalogueError(errorMessage(err));
      setFormError(message);
      toast.error(message);
    } finally {
      setPhotoPending(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-card border border-zinc-200/80 bg-white"
          >
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className={`mt-6 ${bannerErrorClass}`} role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-2">
      {actionError ? (
        <p className={`mt-4 ${bannerErrorClass}`} role="alert">
          {displayCatalogueError(actionError)}
        </p>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Package className="size-5" aria-hidden="true" />}
          title="Aucun produit pour le moment"
          description="Ajoutez votre premier produit pour constituer le catalogue."
          action={
            <Button
              icon={<Plus className="size-4" />}
              onClick={() => onEditingChange("create")}
            >
              Ajouter un produit
            </Button>
          }
        />
      ) : (
        <>
          <ProductFilters
            query={query}
            onQueryChange={setQuery}
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={(key) =>
              setSelectedCategories((current) => toggleValue(current, key))
            }
            outOfStockCount={outOfStockCount}
            outOfStockSelected={outOfStock}
            onToggleOutOfStock={() => setOutOfStock((value) => !value)}
            filtersActive={filtersActive}
            onReset={resetFilters}
          />

          {visibleProducts.length === 0 ? (
            <EmptyState
              className="mt-8"
              icon={<Package className="size-5" aria-hidden="true" />}
              title="Aucun produit ne correspond à votre recherche"
              action={
                <Button variant="secondary" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  onOpen={() => {
                    setFormError(null);
                    onEditingChange(product);
                  }}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {editing ? (
        <ProductFormDialog
          key={editing === "create" ? "create" : editing.id}
          title={
            editing === "create" ? "Ajouter un produit" : "Modifier le produit"
          }
          initial={editing === "create" ? undefined : productToInput(editing)}
          product={editing === "create" ? null : editing}
          categories={categories}
          error={formError}
          pending={formPending}
          photoPending={photoPending}
          deletePending={deletePending}
          onClose={() => onEditingChange(null)}
          onSubmit={submitForm}
          onUploadPhoto={onUploadPhoto}
          onDelete={editing === "create" ? undefined : confirmDelete}
        />
      ) : null}
    </div>
  );
}
