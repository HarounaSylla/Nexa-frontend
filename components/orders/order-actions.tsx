import { Button } from "@/components/ui/button";

export function OrderActions({
  showMarkPaid,
  showConfirm,
  showCancel,
  pending,
  onMarkPaid,
  onConfirm,
  onCancel,
}: {
  showMarkPaid: boolean;
  showConfirm: boolean;
  showCancel: boolean;
  pending: boolean;
  onMarkPaid: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!showMarkPaid && !showConfirm && !showCancel) {
    return null;
  }

  return (
    <section className="border-t border-zinc-100 pt-5">
      <h3 className="text-section-title text-sm">Actions</h3>
      <div className="mt-3 flex flex-col gap-2">
        {showConfirm ? (
          <Button
            type="button"
            disabled={pending}
            className="w-full"
            onClick={onConfirm}
          >
            {pending ? "Enregistrement…" : "Confirmer la livraison"}
          </Button>
        ) : null}
        {showMarkPaid ? (
          <Button
            type="button"
            variant={showConfirm ? "secondary" : "primary"}
            disabled={pending}
            className="w-full"
            onClick={onMarkPaid}
          >
            Marquer comme payée
          </Button>
        ) : null}
        {showCancel ? (
          <Button
            type="button"
            variant="danger"
            disabled={pending}
            className="w-full"
            onClick={onCancel}
          >
            Annuler la commande
          </Button>
        ) : null}
      </div>
    </section>
  );
}
