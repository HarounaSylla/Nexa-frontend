"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";

import {
  delivererErrorFromUnknown,
  type Deliverer,
} from "@/lib/orders-api";
import {
  bannerErrorClass,
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
} from "@/lib/ui";

const FOCUSABLE =
  "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

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
  const titleId = useId();
  const nameId = useId();
  const phoneId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(deliverer?.name ?? "");
  const [phone, setPhone] = useState(deliverer?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    nameRef.current?.focus();
    return () => {
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (!pending) {
          event.preventDefault();
          event.stopImmediatePropagation();
          onClose();
        }
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const nodes = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => node.offsetParent !== null);
      if (nodes.length === 0) {
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, pending]);

  function closeBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || pending) {
      return;
    }
    onClose();
  }

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
    <div
      className="fixed inset-0 z-70 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={closeBackdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={error ? errorId : undefined}
        className={`${cardClass} w-full rounded-t-2xl p-5 sm:max-w-md sm:rounded-card`}
      >
        <h3 id={titleId} className="font-display text-lg font-bold">
          {mode === "add" ? "Ajouter un livreur" : "Modifier le livreur"}
        </h3>
        <form className="mt-4 flex flex-col gap-3" onSubmit={submit}>
          <label htmlFor={nameId} className="flex flex-col gap-1 text-sm font-medium">
            Nom du livreur
            <input
              id={nameId}
              ref={nameRef}
              autoFocus
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </label>
          <label htmlFor={phoneId} className="flex flex-col gap-1 text-sm font-medium">
            Téléphone du livreur
            <input
              id={phoneId}
              type="tel"
              placeholder="Ex. 77 123 45 67"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={inputClass}
            />
          </label>
          <p className="text-sm text-zinc-500">
            Un numéro ne peut être utilisé que par un seul livreur.
          </p>
          {error ? (
            <p id={errorId} className={bannerErrorClass} role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={onClose}
              className={btnSecondary}
            >
              Annuler
            </button>
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending
                ? "Enregistrement…"
                : mode === "add"
                  ? "Ajouter"
                  : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
