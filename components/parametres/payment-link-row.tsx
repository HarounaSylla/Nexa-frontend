import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PaymentLink } from "@/lib/payment-links-api";

export function PaymentLinkRow({
  link,
  onEdit,
  onDelete,
}: {
  link: PaymentLink;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className="flex min-h-[72px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium text-zinc-900">{link.label}</p>
        <p className="truncate text-sm text-zinc-500" title={link.url}>
          {link.url}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
