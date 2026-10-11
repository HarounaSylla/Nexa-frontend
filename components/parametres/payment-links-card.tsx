"use client";

import { useState, type FormEvent } from "react";
import { Link2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import {
  createPaymentLink,
  deletePaymentLink,
  listPaymentLinks,
  paymentLinkErrorFromUnknown,
  type PaymentLink,
  updatePaymentLink,
} from "@/lib/payment-links-api";
import { bannerErrorClass } from "@/lib/ui";

import { PaymentLinkDialog } from "./payment-link-dialog";
import { PaymentLinkRow } from "./payment-link-row";

export function PaymentLinksCard({
  getToken,
  initialLinks,
  acceptsOnlinePayment,
}: {
  getToken: () => Promise<string | null>;
  initialLinks: PaymentLink[];
  acceptsOnlinePayment: boolean;
}) {
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
    if (pending) {
      return;
    }
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
      setFormOpen(false);
      setEditingId(null);
      setLabel("");
      setUrl("");
      toast.success("Lien enregistré.");
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
        setFormOpen(false);
        setEditingId(null);
        setLabel("");
        setUrl("");
      }
      setDeleting(null);
      toast.success("Lien supprimé.");
    } catch (err) {
      setError(paymentLinkErrorFromUnknown(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card flush className="overflow-hidden">
      <CardHeader className="mb-0 flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:pt-5">
        <div className="min-w-0">
          <CardTitle>Liens de paiement</CardTitle>
          <p className="mt-1 text-sm text-zinc-500">
            Créez un lien dans votre application (Wave, Orange Money…) et
            collez-le ici. Dans une commande, vous choisirez le lien à envoyer
            au client.
          </p>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={openAdd}>
          Ajouter un lien
        </Button>
      </CardHeader>

      {!acceptsOnlinePayment ? (
        <p className="mx-4 mt-4 text-sm text-zinc-500 sm:mx-5">
          Le paiement en ligne est désactivé : ces liens ne seront pas
          utilisés.
        </p>
      ) : null}

      {error && !formOpen ? (
        <p className={`mx-4 mt-4 sm:mx-5 ${bannerErrorClass}`} role="alert">
          {error}
        </p>
      ) : null}

      {links.length === 0 ? (
        <EmptyState
          className="mx-4 my-4 sm:mx-5"
          icon={<Link2 className="size-5" aria-hidden="true" />}
          title="Aucun lien enregistré"
          description={
            acceptsOnlinePayment
              ? "Vous ne pourrez pas envoyer de lien de paiement aux clients."
              : undefined
          }
        />
      ) : (
        <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
          {links.map((link) => (
            <PaymentLinkRow
              key={link.id}
              link={link}
              onEdit={() => openEdit(link)}
              onDelete={() => {
                setError(null);
                setDeleting(link);
              }}
            />
          ))}
        </ul>
      )}

      {formOpen ? (
        <PaymentLinkDialog
          editing={Boolean(editingId)}
          label={label}
          url={url}
          pending={pending}
          error={error}
          onLabelChange={setLabel}
          onUrlChange={setUrl}
          onClose={closeForm}
          onSubmit={(event) => void onSubmit(event)}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Supprimer ce lien ?"
        description="Les commandes pour lesquelles ce lien a déjà été envoyé ne changent pas."
        cancelLabel="Annuler"
        confirmLabel="Oui, supprimer"
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
