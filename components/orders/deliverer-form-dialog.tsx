"use client";

import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import {
  delivererErrorFromUnknown,
  type Deliverer,
} from "@/lib/orders-api";
import { bannerErrorClass } from "@/lib/ui";

export function DelivererFormDialog({
  mode,
  deliverer,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  deliverer?: Deliverer;
  onClose: () => void;
  onSubmit: (input: { name: string; phone: string }) => Promise<void>;
}) {
  const nameId = useId();
  const phoneId = useId();
  const errorId = useId();
  const [name, setName] = useState(deliverer?.name ?? "");
  const [phone, setPhone] = useState(deliverer?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    const nextPhone = phone.trim();
    if (!nextName) {
      setError("Indiquez le nom du livreur.");
      return;
    }
    if (!nextPhone) {
      setError("Numéro de téléphone invalide.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onSubmit({ name: nextName, phone: nextPhone });
    } catch (err) {
      setError(delivererErrorFromUnknown(err));
    } finally {
      setPending(false);
    }
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
      <DialogContent
        elevated
        title={mode === "add" ? "Ajouter un livreur" : "Modifier le livreur"}
        description="Un numéro ne peut être utilisé que par un seul livreur."
      >
        <form
          className="flex flex-col gap-3"
          onSubmit={submit}
          aria-describedby={error ? errorId : undefined}
        >
          <Field label="Nom du livreur" htmlFor={nameId}>
            <Input
              id={nameId}
              autoFocus
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Téléphone du livreur" htmlFor={phoneId}>
            <Input
              id={phoneId}
              type="tel"
              placeholder="Ex. 77 123 45 67"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          {error ? (
            <p id={errorId} className={bannerErrorClass} role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Enregistrement…"
                : mode === "add"
                  ? "Ajouter"
                  : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
