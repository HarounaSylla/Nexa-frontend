"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import type { DeliveryZone } from "@/lib/orders-api";
import { bannerErrorClass } from "@/lib/ui";

export type ZoneDraft = {
  city: string;
  available: boolean;
  minHours: string;
  maxHours: string;
};

export const emptyZoneDraft: ZoneDraft = {
  city: "",
  available: true,
  minHours: "24",
  maxHours: "48",
};

export function draftFromZone(zone: DeliveryZone): ZoneDraft {
  return {
    city: zone.city,
    available: zone.available,
    minHours: String(zone.min_delivery_hours),
    maxHours: String(zone.max_delivery_hours),
  };
}

export function ZoneDialog({
  zone,
  pending,
  error,
  onClose,
  onSubmit,
}: {
  zone: DeliveryZone | null;
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: ZoneDraft) => void;
}) {
  const cityId = useId();
  const availableId = useId();
  const minId = useId();
  const maxId = useId();
  const isEdit = zone !== null;
  const [draft, setDraft] = useState<ZoneDraft>(
    zone ? draftFromZone(zone) : emptyZoneDraft,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const city = draft.city.trim();
    const minHours = Number(draft.minHours);
    const maxHours = Number(draft.maxHours);
    if (!city) {
      setLocalError("Ville est obligatoire.");
      return;
    }
    if (
      !Number.isInteger(minHours) ||
      !Number.isInteger(maxHours) ||
      minHours < 0 ||
      maxHours < 0
    ) {
      setLocalError(
        "Les délais doivent être des nombres entiers supérieurs ou égaux à 0.",
      );
      return;
    }
    if (maxHours < minHours) {
      setLocalError(
        "Le délai maximum doit être supérieur ou égal au délai minimum.",
      );
      return;
    }
    setLocalError(null);
    onSubmit({ ...draft, city });
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <DialogContent title={isEdit ? "Modifier" : "Ajouter une zone"}>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Field label="Ville" htmlFor={cityId}>
            <Input
              id={cityId}
              required
              value={draft.city}
              readOnly={isEdit}
              onChange={(event) =>
                setDraft((current) => ({ ...current, city: event.target.value }))
              }
            />
          </Field>
          {isEdit ? (
            <p className="text-xs text-zinc-500">
              La ville ne peut pas être renommée ici. Pour changer le nom,
              supprimez cette zone et ajoutez-en une nouvelle.
            </p>
          ) : null}
          <label
            htmlFor={availableId}
            className="flex min-h-11 items-center gap-3 text-sm font-medium"
          >
            <input
              id={availableId}
              type="checkbox"
              checked={draft.available}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  available: event.target.checked,
                }))
              }
              className="size-5"
            />
            Disponible
          </label>
          <Field label="Délai minimum (heures)" htmlFor={minId}>
            <Input
              id={minId}
              type="number"
              required
              min="0"
              step="1"
              inputMode="numeric"
              value={draft.minHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  minHours: event.target.value,
                }))
              }
              className="tabular-nums"
            />
          </Field>
          <Field label="Délai maximum (heures)" htmlFor={maxId}>
            <Input
              id={maxId}
              type="number"
              required
              min="0"
              step="1"
              inputMode="numeric"
              value={draft.maxHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  maxHours: event.target.value,
                }))
              }
              className="tabular-nums"
            />
          </Field>
          {localError || error ? (
            <p className={bannerErrorClass} role="alert">
              {localError ?? error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
