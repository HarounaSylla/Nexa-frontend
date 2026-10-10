import Link from "next/link";

import {
  AuthenticatedImage,
} from "@/components/shared/authenticated-image";
import type {
  ConversationListItem,
  ConversationMessage,
  MessageImage,
  QuotedMessage,
} from "@/lib/conversations-api";
import { formatMoney } from "@/components/orders/order-helpers";
import { cn } from "@/lib/cn";

import { formatBubbleTime, roleLabel } from "./helpers";
import { QuotedReplyBlock } from "./quoted-reply-block";

export function threadMessageDomId(messageId: string): string {
  return `thread-msg-${messageId}`;
}

export function MessageBubble({
  message,
  showRole,
  tight,
  highlighted,
  quoted,
  canJumpToQuoted,
  onJumpToQuoted,
  onPreviewImage,
  orders,
}: {
  message: ConversationMessage;
  showRole: boolean;
  tight: boolean;
  highlighted: boolean;
  quoted: QuotedMessage | null;
  canJumpToQuoted: boolean;
  onJumpToQuoted: () => void;
  onPreviewImage: (imageId: string, title: string) => void;
  orders: ConversationListItem["orders"];
}) {
  const role = message.turn_role;
  const merchant = role === "merchant";
  const quotedTargetId = quoted?.message_id ?? null;

  return (
    <li
      id={threadMessageDomId(message.id)}
      className={cn(
        "flex flex-col",
        merchant ? "items-end" : "items-start",
        tight ? "mt-1" : "mt-3",
      )}
    >
      {showRole && role !== "customer" ? (
        <p className="mb-1 px-1 text-caption text-zinc-500">{roleLabel(role)}</p>
      ) : null}
      <div
        className={cn(
          "max-w-[80%] min-w-0 px-3 py-2 text-sm sm:max-w-[70%]",
          merchant
            ? "rounded-2xl rounded-br-md bg-accent text-white"
            : role === "agent"
              ? "rounded-2xl rounded-bl-md bg-info-soft text-info"
              : "rounded-2xl rounded-bl-md border border-zinc-200/80 bg-white text-zinc-900",
          highlighted && "ring-2 ring-warning ring-offset-2 ring-offset-background",
          "motion-safe:transition-shadow motion-safe:duration-500",
        )}
      >
        {quoted ? (
          <QuotedReplyBlock
            quoted={quoted}
            canJump={canJumpToQuoted}
            onJump={() => {
              if (quotedTargetId) {
                onJumpToQuoted();
              }
            }}
          />
        ) : null}
        {message.image ? (
          <div className="flex flex-col gap-2">
            <AuthenticatedImage
              imageId={message.image.id}
              alt={message.display_text || "Photo"}
              className="max-h-60 w-full rounded-control bg-zinc-100 object-cover"
              deleted={Boolean(message.image.deleted)}
              onClick={
                message.image.deleted
                  ? undefined
                  : () =>
                      onPreviewImage(
                        message.image!.id,
                        message.image!.classification === "payment_proof"
                          ? "Preuve de paiement"
                          : "Photo",
                      )
              }
            />
            <p className="wrap-break-word">{message.display_text || "Photo"}</p>
            <ImageTag image={message.image} orders={orders} />
          </div>
        ) : (
          <p className="wrap-break-word whitespace-pre-wrap">{message.display_text}</p>
        )}
        <p
          className={cn(
            "mt-1 text-right text-[10px] tabular-nums",
            merchant ? "text-white/70" : "text-zinc-500",
          )}
        >
          {formatBubbleTime(message.created_at)}
        </p>
      </div>
    </li>
  );
}

function ImageTag({
  image,
  orders,
}: {
  image: MessageImage;
  orders: ConversationListItem["orders"];
}) {
  const amount =
    image.detected_amount != null && image.detected_amount !== "" ? (
      <span> Montant lu : {formatMoney(image.detected_amount)} (à vérifier)</span>
    ) : null;

  if (image.classification === "payment_proof" && image.order_id) {
    const matched = orders.find((order) => order.id === image.order_id);
    if (matched) {
      return (
        <p className="text-xs">
          <Link href={`/commandes?order=${matched.id}`} className="underline">
            Preuve de paiement probable · commande #{matched.order_number}
          </Link>
          {amount}
        </p>
      );
    }
    return (
      <p className="text-xs text-warning">
        Preuve de paiement probable · commande à identifier. Ouvrez la
        commande concernée pour vérifier.
        {amount}
      </p>
    );
  }

  if (image.classification === "payment_proof") {
    return (
      <p className="text-xs text-warning">
        Preuve de paiement probable · commande à identifier. Ouvrez la
        commande concernée pour vérifier.
        {amount}
      </p>
    );
  }

  if (image.classification === "unknown") {
    return (
      <p className="text-xs">
        Image non analysée
        {amount}
      </p>
    );
  }

  if (image.classification === "product_photo") {
    const name = (image.matched_product_name ?? "").trim();
    if (image.match_kind === "exact" && name) {
      return <p className="text-xs">Produit reconnu : {name}</p>;
    }
    if (image.match_kind === "similar" && name) {
      return (
        <p className="text-xs">
          Produit proche : {name} (pas exactement le même modèle)
        </p>
      );
    }
    return (
      <p className="text-xs text-warning">Photo de produit non reconnue</p>
    );
  }

  return null;
}
