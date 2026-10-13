"use client";

import { useId, useState, type RefObject } from "react";
import { Plus, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { bannerErrorClass } from "@/lib/ui";

import type { OnboardingDraft, OnboardingProductDraft } from "./onboarding-types";

const MAX_PRODUCTS = 3;

export function StepCatalogue({
  draft,
  headingRef,
  onChange,
}: {
  draft: OnboardingDraft;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const nameId = useId();
  const priceId = useId();
  const stockId = useId();
  const categoryId = useId();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setPrice("");
    setStock("0");
    setCategory("");
    setError(null);
  }

  function addProduct() {
    const trimmedName = name.trim();
    const trimmedPrice = price.trim();
    const trimmedCategory = category.trim();
    const stockQty = Number(stock);
    if (!trimmedName) {
      setError("Le nom du produit est requis.");
      return;
    }
    if (!trimmedPrice || Number(trimmedPrice) < 0) {
      setError("Indiquez un prix valide.");
      return;
    }
    if (!trimmedCategory) {
      setError("La catégorie est requise.");
      return;
    }
    if (!Number.isInteger(stockQty) || stockQty < 0) {
      setError("Le stock doit être un entier supérieur ou égal à 0.");
      return;
    }
    if (draft.products.length >= MAX_PRODUCTS) {
      setError("Vous pourrez ajouter d'autres produits depuis Catalogue.");
      return;
    }
    const next: OnboardingProductDraft = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `p-${Date.now()}`,
      name: trimmedName,
      price: trimmedPrice,
      category: trimmedCategory,
      stock_qty: stockQty,
    };
    onChange({ products: [...draft.products, next] });
    resetForm();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-page-title text-balance outline-none"
        >
          Ajoutez vos produits
        </h2>
        <Badge tone="muted">Facultatif</Badge>
      </div>

      {!showForm ? (
        <>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-card border border-zinc-200/80 bg-white p-4 text-left shadow-card outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text">
                <Plus className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-medium text-zinc-900">Ajouter à la main</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Ajoutez un à trois produits pour essayer. Vous pourrez en
                  ajouter d&apos;autres, avec leurs photos, depuis l&apos;écran
                  Catalogue.
                </p>
              </div>
            </div>
          </button>
          <p className="rounded-control border border-info/20 bg-info-soft px-3 py-2 text-sm text-info">
            Le catalogue de l&apos;application WhatsApp Business ne peut pas
            être repris automatiquement. Vous pourrez toujours le remplir plus
            tard.
          </p>
        </>
      ) : (
        <Card>
          <p className="mb-3 text-sm font-medium text-zinc-800">Nouveau produit</p>
          <div className="flex flex-col gap-3">
            <Field label="Nom du produit" htmlFor={nameId}>
              <Input
                id={nameId}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            <Field label="Prix" htmlFor={priceId}>
              <div className="relative">
                <Input
                  id={priceId}
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="pr-9 text-base"
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-zinc-500">
                  F
                </span>
              </div>
            </Field>
            <Field label="Stock" htmlFor={stockId}>
              <Input
                id={stockId}
                type="number"
                required
                min="0"
                step="1"
                inputMode="numeric"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="text-base tabular-nums"
              />
            </Field>
            <Field label="Catégorie" htmlFor={categoryId}>
              <Input
                id={categoryId}
                required
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Choisissez une catégorie existante ou saisissez-en une nouvelle"
              />
            </Field>
            {error ? (
              <p className={bannerErrorClass} role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={draft.products.length >= MAX_PRODUCTS}
              onClick={addProduct}
            >
              Ajouter ce produit
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Terminer cette étape
            </Button>
          </div>
        </Card>
      )}

      {draft.products.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {draft.products.map((product) => (
            <li
              key={product.id}
              className="flex min-h-11 items-center justify-between gap-3 rounded-card border border-zinc-200 bg-white px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900">
                  {product.name}
                </p>
                <p className="text-caption text-zinc-500">
                  {product.price} F · {product.category} · stock {product.stock_qty}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    products: draft.products.filter((row) => row.id !== product.id),
                  })
                }
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      ) : showForm ? null : (
        <p className="flex items-center gap-2 text-sm text-zinc-500">
          <ShoppingBag className="size-4 shrink-0" aria-hidden="true" />
          Aucun produit pour l&apos;instant.
        </p>
      )}
    </div>
  );
}
