"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import {
  createPaymentLink,
  deletePaymentLink,
  listPaymentLinks,
  paymentLinkErrorFromUnknown,
  type PaymentLink,
  updatePaymentLink,
} from "@/lib/payment-links-api";
import {
  bannerErrorClass,
  btnDanger,
  btnPrimary,
  btnSecondary,
  cardClass,
  inputClass,
  sectionTitleClass,
} from "@/lib/ui";

const LABEL_SUGGESTIONS = ["Wave", "Orange Money", "Free Money"];
const LABEL_MAX = 40;

export function PaymentLinksCard({
  getToken,
  initialLinks,
  acceptsOnlinePayment,
}: {
  getToken: () => Promise<string | null>;
  initialLinks: PaymentLink[];
  acceptsOnlinePayment: boolean;
}) {
  const listId = useId();
  const labelId = useId();
  const urlId = useId();
  const [links, setLinks] = useState(initialLinks);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [deleting, setDeleting] = useState<PaymentLink | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setLabel("");
    setUrl("");
    setError(null);
    setFormOpen(true);
  }

  function openEdit(link: PaymentLink) {
    setEditingId(link.id);
    setLabel(link.label);
    setUrl(link.url);
    setError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setLabel("");
    setUrl("");
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextLabel = label.trim();
    const nextUrl = url.trim();
    if (!nextUrl.startsWith("https://")) {
      setError("Le lien doit commencer par https://");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const token = await getToken();
      if (editingId) {
        await updatePaymentLink(token, editingId, {
          label: nextLabel,
          url: nextUrl,
        });
      } else {
        await createPaymentLink(token, { label: nextLabel, url: nextUrl });
      }
      setLinks(await listPaymentLinks(token));
      closeForm();
    } catch (err) {
      setError(paymentLinkErrorFromUnknown(err));
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
      const token = await getToken();
      await deletePaymentLink(token, deleting.id);
      setLinks(await listPaymentLinks(token));
      if (editingId === deleting.id) {
        closeForm();
      }
      setDeleting(null);
    } catch (err) {
      setError(paymentLinkErrorFromUnknown(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={`${cardClass} p-5`}>
      <h2 className={sectionTitleClass}>Liens de paiement</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Créez un lien dans votre application (Wave, Orange Money…) et collez-le
        ici. Dans une commande, vous choisirez le lien à envoyer au client.
      </p>

      {acceptsOnlinePayment && links.length === 0 ? (
        <p
          className="mt-4 rounded-control border border-warning/30 bg-warning-soft px-3 py-3 text-sm text-warning"
          role="status"
        >
          Aucun lien enregistré : vous ne pourrez pas envoyer de lien de
          paiement aux clients.
        </p>
      ) : null}

      {!acceptsOnlinePayment ? (
        <p className="mt-4 text-sm text-zinc-500">
          Le paiement en ligne est désactivé : ces liens ne seront pas
          utilisés.
        </p>
      ) : null}

      {error && !formOpen ? (
        <p className={`mt-4 ${bannerErrorClass}`} role="alert">
          {error}
        </p>
      ) : null}

      {links.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-col gap-3 rounded-control border border-zinc-100 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-bold">{link.label}</p>
                <p className="truncate text-sm text-zinc-500" title={link.url}>
                  {link.url}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(link)}
                  className={btnSecondary}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setDeleting(link);
                  }}
                  className={btnSecondary}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {formOpen ? (
        <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
          <label htmlFor={labelId} className="flex flex-col gap-1 text-sm font-medium">
            Nom
            <input
              id={labelId}
              required
              maxLength={LABEL_MAX}
              list={listId}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className={inputClass}
            />
            <datalist id={listId}>
              {LABEL_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </label>
          <label htmlFor={urlId} className="flex flex-col gap-1 text-sm font-medium">
            Lien
            <input
              id={urlId}
              type="url"
              required
              placeholder="https://"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className={inputClass}
            />
          </label>
          {error ? (
            <p className={bannerErrorClass} role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={closeForm}
              className={btnSecondary}
            >
              Annuler
            </button>
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending
                ? "Enregistrement…"
                : editingId
                  ? "Enregistrer"
                  : "Ajouter le lien"}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={openAdd}
          className={`${btnPrimary} mt-4`}
        >
          Ajouter un lien
        </button>
      )}

      {deleting ? (
        <DeleteLinkDialog
          pending={pending}
          onKeep={() => setDeleting(null)}
          onDelete={onConfirmDelete}
        />
      ) : null}
    </section>
  );
}

function DeleteLinkDialog({
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
          Supprimer ce lien ?
        </h3>
        <p className="mt-2 text-sm text-zinc-500">
          Les commandes pour lesquelles ce lien a déjà été envoyé ne changent
          pas.
        </p>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={onKeep}
            className={btnSecondary}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            className={btnDanger}
          >
            {pending ? "Suppression…" : "Oui, supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
