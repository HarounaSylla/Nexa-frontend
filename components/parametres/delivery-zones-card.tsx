"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import {
  deleteDeliveryZone,
  type DeliveryZone,
  listDeliveryZones,
  saveDeliveryZone,
} from "@/lib/orders-api";
import { bannerErrorClass } from "@/lib/ui";

import { ZoneDialog, type ZoneDraft } from "./zone-dialog";
import { ZoneRow } from "./zone-row";

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

  async function refresh() {
    onZonesChange(await listDeliveryZones(await getToken()));
  }

  async function onSave(draft: ZoneDraft) {
    setPending(true);
    setError(null);
    try {
      await saveDeliveryZone(await getToken(), {
        city: draft.city.trim(),
        available: draft.available,
        min_delivery_hours: Number(draft.minHours),
        max_delivery_hours: Number(draft.maxHours),
      });
      await refresh();
      setEditing(null);
      toast.success("Zone enregistrée.");
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
    try {
      await deleteDeliveryZone(await getToken(), deleting.id);
      await refresh();
      setDeleting(null);
      toast.success("Zone supprimée.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card flush className="overflow-hidden">
      <CardHeader className="mb-0 flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:pt-5">
        <div className="min-w-0">
          <CardTitle>Zones de livraison</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Les villes où vous livrez. L&apos;agent n&apos;accepte une commande que
            pour une ville disponible.
          </p>
        </div>
        <Button
          icon={<Plus className="size-4" />}
          onClick={() => {
            setError(null);
            setEditing("new");
          }}
        >
          Ajouter une zone
        </Button>
      </CardHeader>

      {error && !editing ? (
        <p className={`mx-4 mt-4 sm:mx-5 ${bannerErrorClass}`} role="alert">
          {error}
        </p>
      ) : null}

      {zones.length === 0 ? (
        <EmptyState
          className="mx-4 my-4 sm:mx-5"
          icon={<MapPin className="size-5" aria-hidden="true" />}
          title="Aucune zone de livraison"
          description="Ajoutez au moins une ville pour que l'agent puisse prendre des commandes."
        />
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
          {zones.map((zone) => (
            <ZoneRow
              key={zone.id}
              zone={zone}
              onEdit={() => {
                setError(null);
                setEditing(zone);
              }}
              onDelete={() => {
                setError(null);
                setDeleting(zone);
              }}
            />
          ))}
        </ul>
      )}

      {editing !== null ? (
        <ZoneDialog
          zone={editing === "new" ? null : editing}
          pending={pending}
          error={error}
          onClose={() => {
            if (!pending) {
              setEditing(null);
              setError(null);
            }
          }}
          onSubmit={(draft) => void onSave(draft)}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer cette zone ?"
        description="Les clients de cette ville ne pourront plus commander."
        cancelLabel="Garder la zone"
        confirmLabel="Supprimer la zone"
        confirmPendingLabel="Suppression…"
        variant="danger"
        pending={pending}
        onCancel={() => {
          if (!pending) {
            setDeleting(null);
          }
        }}
        onConfirm={() => void onConfirmDelete()}
      />
    </Card>
  );
}
