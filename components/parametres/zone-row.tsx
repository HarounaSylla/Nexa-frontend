import { Pencil, Trash2 } from "lucide-react";

import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import type { DeliveryZone } from "@/lib/orders-api";

import { formatDeliveryDelay } from "./preferences-helpers";

export function ZoneRow({
  zone,
  onEdit,
  onDelete,
}: {
  zone: DeliveryZone;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex min-h-[72px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-900">{zone.city}</p>
        <p className="text-sm text-zinc-500">
          {formatDeliveryDelay(zone.min_delivery_hours, zone.max_delivery_hours)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <StatusPill tone={zone.available ? "success" : "muted"}>
          {zone.available ? "Disponible" : "Indisponible"}
        </StatusPill>
        <Button
          variant="ghost"
          size="sm"
          icon={<Pencil className="size-4" />}
          onClick={onEdit}
        >
          Modifier
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger hover:bg-danger-soft hover:text-danger"
          icon={<Trash2 className="size-4" />}
          onClick={onDelete}
        >
          Supprimer
        </Button>
      </div>
    </li>
  );
}
