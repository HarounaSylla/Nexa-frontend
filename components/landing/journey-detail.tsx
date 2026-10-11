import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { NexaAppIcon } from "@/components/brand/nexa-logo";
import { cn } from "@/lib/cn";

import { RedDressIcon } from "./journey-icons";
import { ScenePill } from "./scene-pill";

function Reveal({
  delay,
  reduceMotion,
  className,
  inline,
  children,
}: {
  delay: number;
  reduceMotion: boolean;
  className?: string;
  inline?: boolean;
  children: ReactNode;
}) {
  const Tag = inline ? "span" : "div";
  return (
    <Tag
      className={cn(reduceMotion ? undefined : "journey-reveal", className)}
      style={reduceMotion ? undefined : { animationDelay: `${delay}s` }}
    >
      {children}
    </Tag>
  );
}

function TagRow({
  label,
  soon,
  hidePill,
}: {
  label: string;
  soon?: boolean;
  hidePill?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold tracking-[0.05em] text-zinc-500 uppercase">
      <span>{label}</span>
      {hidePill ? null : soon ? (
        <ScenePill tone="warning">Bientôt</ScenePill>
      ) : (
        <ScenePill tone="success">Disponible</ScenePill>
      )}
    </div>
  );
}

function Comment({
  handle,
  initial,
  color,
  text,
  highlight,
  extra,
}: {
  handle: string;
  initial: string;
  color: string;
  text: string;
  highlight?: boolean;
  extra?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 rounded-xl border bg-white px-2.5 py-2",
        highlight ? "border-accent" : "border-zinc-200/80",
      )}
    >
      <span
        className="flex size-[30px] shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ background: color }}
      >
        {initial}
      </span>
      <p className="min-w-0 text-[13px] text-zinc-700">
        <b className="block text-[11.5px] font-semibold text-zinc-500">
          {handle}
        </b>
        {text}
        {extra}
      </p>
    </div>
  );
}

function TypingDots({
  delay,
  reduceMotion,
  reserveTyping,
}: {
  delay: number;
  reduceMotion: boolean;
  reserveTyping?: boolean;
}) {
  if (reserveTyping || reduceMotion) {
    return (
      <div
        className="invisible h-[30px] pointer-events-none"
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      className="journey-typing"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="inline-flex gap-0.5 rounded-[14px] border border-zinc-200/80 bg-white px-3 py-2">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="journey-dot-bob size-[5px] rounded-full bg-zinc-400"
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </span>
    </div>
  );
}

export function JourneyDetail({
  step,
  reduceMotion,
  reserveTyping,
}: {
  step: number;
  reduceMotion: boolean;
  reserveTyping?: boolean;
}) {
  if (step === 0) {
    return (
      <div className="flex flex-col gap-2">
        <TagRow label="Sur TikTok" soon />
        <Reveal delay={0.1} reduceMotion={reduceMotion}>
          <Comment
            handle="fatou.s"
            initial="F"
            color="#7c8a6e"
            text="Trop belle cette tenue !"
          />
        </Reveal>
        <Reveal delay={1} reduceMotion={reduceMotion}>
          <Comment
            highlight
            handle="aminata_d"
            initial="A"
            color="#b0605a"
            text="Je veux la robe longue rouge, c'est combien ?"
            extra={
              <Reveal
                inline
                delay={2.2}
                reduceMotion={reduceMotion}
                className="mt-1.5 block"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11.5px] font-medium text-white">
                  <span aria-hidden="true">+</span>
                  Intention d&apos;achat détectée
                </span>
              </Reveal>
            }
          />
        </Reveal>
        <Reveal delay={0.5} reduceMotion={reduceMotion}>
          <Comment
            handle="moussa_k"
            initial="M"
            color="#5f7fa3"
            text="Livraison possible à Thiès ?"
          />
        </Reveal>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-2">
        <TagRow label="Sur TikTok" soon />
        <Comment
          highlight
          handle="aminata_d"
          initial="A"
          color="#b0605a"
          text="Je veux la robe longue rouge, c'est combien ?"
        />
        <Reveal delay={0.5} reduceMotion={reduceMotion}>
          <div className="rounded-xl border border-zinc-200/80 bg-white px-2.5 py-2 shadow-card">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
              <NexaAppIcon className="size-[18px]" />
              Boutique Awa
            </p>
            <p className="mt-1 text-[13px] text-zinc-700">
              Bonjour Aminata ! La robe longue rouge est à 25 000 F. Écrivez-nous
              sur WhatsApp pour commander.
            </p>
            <span className="mt-2 inline-flex items-center rounded-lg bg-success px-2.5 py-1 text-xs font-semibold text-white">
              Ouvrir WhatsApp
            </span>
            <Reveal delay={1.5} reduceMotion={reduceMotion}>
              <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-success">
                <Check className="size-3" aria-hidden="true" />
                Validée par la boutique avant publication
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-2">
        <TagRow label="Sur WhatsApp" />
        <Reveal delay={0.2} reduceMotion={reduceMotion}>
          <div className="ml-auto max-w-[84%] rounded-[14px] bg-accent px-2.5 py-1.5 text-[13px] text-white">
            Bonjour, je viens de TikTok. Je veux la robe longue rouge.
          </div>
        </Reveal>
        <TypingDots
          delay={1}
          reduceMotion={reduceMotion}
          reserveTyping={reserveTyping}
        />
        <Reveal delay={2} reduceMotion={reduceMotion}>
          <div className="mr-auto max-w-[84%] rounded-[14px] border border-zinc-200/80 bg-white px-2.5 py-1.5 text-[13px] text-zinc-800">
            <div className="mb-1.5 flex items-center gap-2 rounded-[10px] bg-accent-soft p-1.5">
              <RedDressIcon className="h-[46px] w-10 shrink-0 rounded-lg" />
              <div>
                <p className="text-xs font-semibold">Robe longue rouge de soirée</p>
                <p className="text-[11.5px] text-zinc-500">25 000 F · en stock</p>
              </div>
            </div>
            Quelle taille souhaitez-vous ?
          </div>
        </Reveal>
        <Reveal delay={3.6} reduceMotion={reduceMotion}>
          <div className="ml-auto max-w-[84%] rounded-[14px] bg-accent px-2.5 py-1.5 text-[13px] text-white">
            M, livraison à Dakar, paiement à la livraison.
          </div>
        </Reveal>
        <TypingDots
          delay={4.4}
          reduceMotion={reduceMotion}
          reserveTyping={reserveTyping}
        />
        <Reveal delay={5.4} reduceMotion={reduceMotion}>
          <div className="mr-auto max-w-[84%] rounded-[14px] border border-zinc-200/80 bg-white px-2.5 py-1.5 text-[13px] text-zinc-800">
            C&apos;est noté, je prépare votre commande.
          </div>
        </Reveal>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="flex flex-col gap-2">
        <TagRow label="Dans Nexa · Commande #166" hidePill />
        <Reveal delay={0.2} reduceMotion={reduceMotion} className="flex flex-wrap gap-1.5">
          <ScenePill tone="warning">Créée</ScenePill>
          <ScenePill tone="warning">Paiement en attente</ScenePill>
        </Reveal>
        <Reveal delay={0.6} reduceMotion={reduceMotion}>
          <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-[13px] shadow-card">
            <Row left="Robe longue rouge, M" right="1 × 25 000 F" />
            <Row left="Ville" right="Dakar" />
            <Row left="Paiement" right="À la livraison" />
            <Row left="Total" right="25 000 F" bold />
          </div>
        </Reveal>
        <Reveal delay={1.6} reduceMotion={reduceMotion}>
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-2 text-[13px] shadow-card">
            <ScenePill tone="success">Stock</ScenePill>
            <span className="text-zinc-600">
              Mis à jour automatiquement : 3 → 2
            </span>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TagRow label="Votre tableau de bord" hidePill />
      <Reveal delay={0.2} reduceMotion={reduceMotion}>
        <div
          className={cn(
            "flex items-center justify-between gap-3 rounded-xl border border-zinc-200/80 bg-white px-3 py-2 shadow-card",
            !reduceMotion && "journey-tile-pulse",
          )}
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
            <span className="size-[7px] rounded-full bg-warning" aria-hidden="true" />
            Commandes à traiter
          </p>
          <p className="font-display text-[26px] leading-none font-extrabold tabular-nums">
            1
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.9} reduceMotion={reduceMotion}>
        <div className="rounded-xl border border-zinc-200/80 bg-white px-3 py-2 shadow-card">
          <p className="mb-2 font-display text-[13px] font-bold">Notifications</p>
          <div className="flex items-start gap-2 rounded-[10px] border border-zinc-200/80 px-2.5 py-2">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-info"
              aria-hidden="true"
            />
            <div>
              <p className="text-[13px] font-semibold text-zinc-900">
                Nouvelle commande de +221 77 123 45 67, 25 000 F
              </p>
              <p className="text-[11.5px] text-zinc-500">à l&apos;instant</p>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={1.6} reduceMotion={reduceMotion}>
        <p className="text-[13px] text-zinc-500">
          Il ne reste qu&apos;à assigner un livreur.
        </p>
      </Reveal>
    </div>
  );
}

function Row({
  left,
  right,
  bold,
}: {
  left: string;
  right: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-zinc-100 py-1 last:border-b-0">
      <span className="text-zinc-500">{left}</span>
      <span
        className={cn(
          "text-right font-semibold tabular-nums",
          bold && "font-display text-[15px] font-extrabold text-zinc-900",
        )}
      >
        {right}
      </span>
    </div>
  );
}
