"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import { StatusPill } from "@/components/status-pill";
import { errorMessage } from "@/lib/api";
import {
  deleteDeliveryZone,
  type DeliveryZone,
  listDeliveryZones,
  saveDeliveryZone,
} from "@/lib/orders-api";
import {
  bannerErrorClass,
  bannerSuccessClass,
  btnDanger,
  btnDangerGhost,
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
  sectionTitleClass,
} from "@/lib/ui";

import { formatDeliveryDelay } from "./preferences-helpers";

type ZoneDraft = {
  city: string;
  available: boolean;
  minHours: string;
  maxHours: string;
};

const emptyDraft: ZoneDraft = {
  city: "",
  available: true,
  minHours: "24",
  maxHours: "48",
};

export function DeliveryZonesCard({
  getToken,
  zones,
  onZonesChange,
}: {
  getToken: () => Promise<string | null>;
  zones: DeliveryZone[];
  onZonesChange: (zones: DeliveryZone[]) => void;
}) {
  const [editing, setEditing] = useState<DeliveryZone | null | "new">(null);
  const [deleting, setDeleting] = useState<DeliveryZone | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function refresh() {
    onZonesChange(await listDeliveryZones(await getToken()));
  }

  async function onSave(draft: ZoneDraft) {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await saveDeliveryZone(await getToken(), {
        city: draft.city.trim(),
        available: draft.available,
        min_delivery_hours: Number(draft.minHours),
        max_delivery_hours: Number(draft.maxHours),
      });
      await refresh();
      setEditing(null);
      setNotice("Zone enregistrée.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function onConfirmDelete() {
    if (!deleting) {
      return;
    }
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await deleteDeliveryZone(await getToken(), deleting.id);
      await refresh();
      setDeleting(null);
      setNotice("Zone supprimée.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={`${cardClass} p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className={sectionTitleClass}>Zones de livraison</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Les villes où vous livrez. L&apos;agent n&apos;accepte une commande que
            pour une ville disponible.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing("new");
          }}
          className={btnPrimary}
        >
          Ajouter une zone
        </button>
      </div>

      {notice ? (
        <p className={`mt-4 ${bannerSuccessClass}`} role="status">
          {notice}
        </p>
      ) : null}
      {error && !editing ? (
        <p className={`mt-4 ${bannerErrorClass}`} role="alert">
          {error}
        </p>
      ) : null}

      {zones.length === 0 ? (
        <p
          className="mt-4 rounded-control border border-warning/30 bg-warning-soft px-3 py-3 text-sm text-warning"
          role="status"
        >
          Aucune zone de livraison. Ajoutez au moins une ville pour que
          l&apos;agent puisse prendre des commandes.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {zones.map((zone) => (
            <li
              key={zone.id}
              className="flex flex-col gap-3 rounded-control border border-zinc-100 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">{zone.city}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDeliveryDelay(
                    zone.min_delivery_hours,
                    zone.max_delivery_hours,
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={zone.available ? "success" : "muted"}>
                  {zone.available ? "Disponible" : "Indisponible"}
                </StatusPill>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setEditing(zone);
                  }}
                  className={btnSecondary}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setDeleting(zone);
                  }}
                  className={`${btnDangerGhost} min-h-11`}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== null ? (
        <ZoneFormDialog
          zone={editing === "new" ? null : editing}
          pending={pending}
          error={error}
          onClose={() => {
            if (!pending) {
              setEditing(null);
              setError(null);
            }
          }}
          onSubmit={onSave}
        />
      ) : null}

      {deleting ? (
        <DeleteZoneDialog
          pending={pending}
          onKeep={() => {
            if (!pending) {
              setDeleting(null);
            }
          }}
          onDelete={onConfirmDelete}
        />
      ) : null}
    </section>
  );
}

function ZoneFormDialog({
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
  const titleId = useId();
  const cityId = useId();
  const availableId = useId();
  const minId = useId();
  const maxId = useId();
  const isEdit = zone !== null;
  const [draft, setDraft] = useState<ZoneDraft>(
    zone
      ? {
          city: zone.city,
          available: zone.available,
          minHours: String(zone.min_delivery_hours),
          maxHours: String(zone.max_delivery_hours),
        }
      : emptyDraft,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, pending]);

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
      >
        <h3 id={titleId} className="font-display text-lg font-bold">
          {isEdit ? "Modifier" : "Ajouter une zone"}
        </h3>
        <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
          <label htmlFor={cityId} className="flex flex-col gap-1 text-sm font-medium">
            Ville
            <input
              id={cityId}
              required
              value={draft.city}
              readOnly={isEdit}
              onChange={(event) =>
                setDraft((current) => ({ ...current, city: event.target.value }))
              }
              className={inputClass}
            />
          </label>
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
          <label htmlFor={minId} className="flex flex-col gap-1 text-sm font-medium">
            Délai minimum (heures)
            <input
              id={minId}
              type="number"
              required
              min="0"
              step="1"
              value={draft.minHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  minHours: event.target.value,
                }))
              }
              className={`${inputClass} tabular-nums`}
            />
          </label>
          <label htmlFor={maxId} className="flex flex-col gap-1 text-sm font-medium">
            Délai maximum (heures)
            <input
              id={maxId}
              type="number"
              required
              min="0"
              step="1"
              value={draft.maxHours}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  maxHours: event.target.value,
                }))
              }
              className={`${inputClass} tabular-nums`}
            />
          </label>
          {localError || error ? (
            <p className={bannerErrorClass} role="alert">
              {localError ?? error}
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
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteZoneDialog({
  pending,
  onKeep,
  onDelete,
}: {
  pending: boolean;
  onKeep: () => void;
  onDelete: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onKeep();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeep, pending]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
      >
        <h3 id={titleId} className="font-display text-lg font-bold">
          Supprimer cette zone ?
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Les clients de cette ville ne pourront plus commander.
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={onKeep}
            className={btnSecondary}
          >
            Garder la zone
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className={btnDanger}
          >
            {pending ? "Suppression…" : "Supprimer la zone"}
          </button>
        </div>
      </div>
    </div>
  );
}
