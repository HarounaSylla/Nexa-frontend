"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import { errorMessage } from "@/lib/api";
import { listProducts, type CatalogueProduct } from "@/lib/catalogue-api";
import {
  createOrder,
  type DeliveryZone,
  listDeliveryZones,
} from "@/lib/orders-api";
import {
  bannerErrorClass,
  btnDangerGhost,
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
} from "@/lib/ui";

import { displayOrderError, formatEnum } from "./order-helpers";

type Line = { key: string; productId: string; quantity: string };

function emptyLine(): Line {
  return { key: crypto.randomUUID(), productId: "", quantity: "1" };
}

export function CreateOrderDialog({
  getToken,
  pending,
  onClose,
  onCreated,
}: {
  getToken: () => Promise<string | null>;
  pending: boolean;
  onClose: () => void;
  onCreated: (orderId: string, orderNumber: number) => Promise<void>;
}) {
  const titleId = useId();
  const phoneId = useId();
  const addressId = useId();
  const cityId = useId();
  const paymentId = useId();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "cash_on_delivery" | "online"
  >("cash_on_delivery");
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [products, setProducts] = useState<CatalogueProduct[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const busy = pending || submitting;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const token = await getToken();
        const [nextProducts, nextZones] = await Promise.all([
          listProducts(token),
          listDeliveryZones(token),
        ]);
        if (cancelled) {
          return;
        }
        setProducts(nextProducts);
        setZones(nextZones);
      } catch (err) {
        if (!cancelled) {
          setLoadError(errorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const selectableZones = [...zones].sort((a, b) => {
    if (a.available !== b.available) {
      return a.available ? -1 : 1;
    }
    return a.city.localeCompare(b.city, "fr");
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const items = lines
      .map((line) => ({
        product_id: line.productId,
        quantity: Number(line.quantity),
      }))
      .filter((item) => item.product_id && item.quantity > 0);
    if (items.length === 0) {
      setSubmitError("Ajoutez au moins un article.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createOrder(await getToken(), {
        customer_phone: phone.trim(),
        items,
        payment_method: paymentMethod,
        delivery_address: address.trim(),
        ville: city,
      });
      await onCreated(created.id, created.order_number);
    } catch (err) {
      setSubmitError(displayOrderError(errorMessage(err)));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-display text-lg font-bold">
            Nouvelle commande
          </h2>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Fermer
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Chargement…</p>
        ) : loadError ? (
          <p className={`mt-4 ${bannerErrorClass}`} role="alert">
            {loadError}
          </p>
        ) : (
          <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
            <label htmlFor={phoneId} className="flex flex-col gap-1 text-sm font-medium">
              Téléphone du client
              <input
                id={phoneId}
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                className={inputClass}
              />
            </label>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Articles</legend>
              {lines.map((line, index) => (
                <div key={line.key} className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
                    Produit
                    <select
                      required
                      value={line.productId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLines((current) =>
                          current.map((row) =>
                            row.key === line.key
                              ? { ...row, productId: value }
                              : row,
                          ),
                        );
                      }}
                      className={inputClass}
                    >
                      <option value="">Choisir un produit</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} · stock {product.stock_qty}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex w-full flex-col gap-1 text-sm font-medium sm:w-28">
                    Quantité
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLines((current) =>
                          current.map((row) =>
                            row.key === line.key
                              ? { ...row, quantity: value }
                              : row,
                          ),
                        );
                      }}
                      className={`${inputClass} tabular-nums`}
                    />
                  </label>
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLines((current) =>
                          current.filter((row) => row.key !== line.key),
                        )
                      }
                      className={`${btnDangerGhost} sm:mt-6`}
                    >
                      Retirer
                    </button>
                  ) : null}
                  <span className="sr-only">
                    Article {index + 1}
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setLines((current) => [...current, emptyLine()])}
                className={btnSecondary}
              >
                Ajouter un article
              </button>
            </fieldset>

            <label htmlFor={addressId} className="flex flex-col gap-1 text-sm font-medium">
              Adresse de livraison
              <textarea
                id={addressId}
                required
                rows={2}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className={`${inputClass} h-auto py-2`}
              />
            </label>

            <label htmlFor={cityId} className="flex flex-col gap-1 text-sm font-medium">
              Ville
              <select
                id={cityId}
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={inputClass}
              >
                <option value="">Choisir une ville</option>
                {selectableZones.map((zone) => (
                  <option key={zone.id} value={zone.city}>
                    {zone.available
                      ? zone.city
                      : `${zone.city} (non desservie)`}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor={paymentId} className="flex flex-col gap-1 text-sm font-medium">
              Mode de paiement
              <select
                id={paymentId}
                required
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value as "cash_on_delivery" | "online",
                  )
                }
                className={inputClass}
              >
                <option value="cash_on_delivery">
                  {formatEnum("cash_on_delivery")}
                </option>
                <option value="online">{formatEnum("online")}</option>
              </select>
            </label>

            {submitError ? (
              <p className={bannerErrorClass} role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={onClose}
                className={btnSecondary}
              >
                Annuler
              </button>
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? "Création…" : "Créer la commande"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
