"use client";

import { useId, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { bannerErrorClass } from "@/lib/ui";

const LABEL_SUGGESTIONS = ["Wave", "Orange Money", "Free Money"];
const LABEL_MAX = 40;

export function PaymentLinkDialog({
  editing,
  label,
  url,
  pending,
  error,
  onLabelChange,
  onUrlChange,
  onClose,
  onSubmit,
}: {
  editing: boolean;
  label: string;
  url: string;
  pending: boolean;
  error: string | null;
  onLabelChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  const listId = useId();
  const labelId = useId();
  const urlId = useId();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <DialogContent title={editing ? "Modifier le lien" : "Ajouter un lien"}>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <Field label="Nom" htmlFor={labelId}>
            <Input
              id={labelId}
              required
              maxLength={LABEL_MAX}
              list={listId}
              value={label}
              onChange={(event) => onLabelChange(event.target.value)}
            />
            <datalist id={listId}>
              {LABEL_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </Field>
          <Field label="Lien" htmlFor={urlId}>
            <Input
              id={urlId}
              type="url"
              required
              placeholder="https://"
              value={url}
              onChange={(event) => onUrlChange(event.target.value)}
            />
          </Field>
          {error ? (
            <p className={bannerErrorClass} role="alert">
              {error}
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
              {pending
                ? "Enregistrement…"
                : editing
                  ? "Enregistrer"
                  : "Ajouter le lien"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
