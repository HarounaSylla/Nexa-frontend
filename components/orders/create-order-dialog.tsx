"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api";
import { listProducts, type CatalogueProduct } from "@/lib/catalogue-api";
import {
  createOrder,
  type DeliveryZone,
  listDeliveryZones,
} from "@/lib/orders-api";
import { bannerErrorClass } from "@/lib/ui";

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) {
          onClose();
        }
      }}
    >
      <DialogContent title="Nouvelle commande" className="sm:max-w-lg">
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : loadError ? (
          <p className={bannerErrorClass} role="alert">
            {loadError}
          </p>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <Field label="Téléphone du client" htmlFor={phoneId}>
              <Input
                id={phoneId}
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-zinc-800">
                Articles
              </legend>
              {lines.map((line, index) => (
                <div
                  key={line.key}
                  className="rounded-card border border-zinc-200 bg-white p-3 shadow-card"
                >
                  <p className="sr-only">Article {index + 1}</p>
                  {lines.length > 1 ? (
                    <div className="mb-1 flex justify-end">
                      <IconButton
                        label="Retirer la ligne"
                        onClick={() =>
                          setLines((current) =>
                            current.filter((row) => row.key !== line.key),
                          )
                        }
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <Field label="Produit">
                        <Select
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
                        >
                          <option value="">Choisir un produit</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} · stock {product.stock_qty}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                    <div className="sm:w-28">
                      <Field label="Quantité">
                        <Input
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
                          className="tabular-nums"
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                icon={<Plus className="size-4" />}
                onClick={() => setLines((current) => [...current, emptyLine()])}
              >
                Ajouter une ligne
              </Button>
            </fieldset>

            <Field label="Adresse de livraison" htmlFor={addressId}>
              <Textarea
                id={addressId}
                required
                rows={2}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </Field>

            <Field label="Ville" htmlFor={cityId}>
              <Select
                id={cityId}
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
              >
                <option value="">Choisir une ville</option>
                {selectableZones.map((zone) => (
                  <option key={zone.id} value={zone.city}>
                    {zone.available
                      ? zone.city
                      : `${zone.city} (non desservie)`}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Mode de paiement" htmlFor={paymentId}>
              <Select
                id={paymentId}
                required
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value as "cash_on_delivery" | "online",
                  )
                }
              >
                <option value="cash_on_delivery">
                  {formatEnum("cash_on_delivery")}
                </option>
                <option value="online">{formatEnum("online")}</option>
              </Select>
            </Field>

            {submitError ? (
              <p className={bannerErrorClass} role="alert">
                {submitError}
              </p>
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
                  {busy ? "Création…" : "Créer la commande"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
