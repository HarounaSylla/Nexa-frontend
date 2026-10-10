import type {
  ConversationMessage,
  QuotedMessage,
  QuotedMessageKind,
} from "@/lib/conversations-api";
import { cn } from "@/lib/cn";

const QUOTED_KINDS = new Set<QuotedMessageKind>([
  "shop_text",
  "shop_photo",
  "customer_text",
  "customer_photo",
]);

export function quotedForDisplay(
  quoted: ConversationMessage["quoted"],
): QuotedMessage | null {
  if (!quoted || typeof quoted !== "object") {
    return null;
  }
  if (!QUOTED_KINDS.has(quoted.kind)) {
    return null;
  }
  return {
    kind: quoted.kind,
    excerpt: quoted.excerpt ?? null,
    product_name: quoted.product_name ?? null,
    from_earlier_conversation: Boolean(quoted.from_earlier_conversation),
    message_id: quoted.message_id ?? null,
  };
}

function quotedTargetLabel(kind: QuotedMessageKind): string {
  if (kind === "shop_text") {
    return "la boutique";
  }
  if (kind === "shop_photo") {
    return "la photo de la boutique";
  }
  if (kind === "customer_text") {
    return "son propre message";
  }
  return "sa propre photo";
}

function quotedBodyText(quoted: QuotedMessage): string | null {
  const isPhoto =
    quoted.kind === "shop_photo" || quoted.kind === "customer_photo";
  if (isPhoto) {
    const productName = quoted.product_name?.trim();
    return productName ? `Photo : ${productName}` : "Photo";
  }
  const excerpt = quoted.excerpt?.trim();
  return excerpt || null;
}

export function QuotedReplyBlock({
  quoted,
  canJump,
  onJump,
}: {
  quoted: QuotedMessage;
  canJump: boolean;
  onJump: () => void;
}) {
  const target = quotedTargetLabel(quoted.kind);
  const heading = `En réponse à ${target}`;
  const body = quotedBodyText(quoted);
  const content = (
    <>
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
        <p className="min-w-0 text-[11px] font-medium text-zinc-600">{heading}</p>
        {quoted.from_earlier_conversation ? (
          <span className="shrink-0 rounded-full bg-zinc-200/90 px-1.5 py-px text-[10px] font-medium text-zinc-600">
            conversation précédente
          </span>
        ) : null}
      </div>
      {body ? (
        <p className="mt-0.5 line-clamp-2 min-w-0 wrap-break-word text-xs text-zinc-700">
          {body}
        </p>
      ) : null}
    </>
  );

  const blockClass =
    "mb-2 w-full min-w-0 overflow-hidden rounded-md border-l-[3px] border-accent bg-zinc-100 px-2 py-1.5 text-left";

  if (canJump) {
    return (
      <button
        type="button"
        onClick={onJump}
        aria-label={`Aller au message cité — ${heading}`}
        className={cn(
          blockClass,
          "cursor-pointer hover:bg-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        {content}
      </button>
    );
  }

  return <div className={blockClass}>{content}</div>;
}
