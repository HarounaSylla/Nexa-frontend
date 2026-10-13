"use client";

import { useState, type RefObject } from "react";
import { Bell, Copy, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { focusRingClass } from "@/lib/ui";

import { formatSenegalDisplay, waMeUrl } from "./onboarding-phone";
import { registerTikTokInterest } from "./onboarding-simulated";
import type { OnboardingDraft } from "./onboarding-types";

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function StepTikTok({
  draft,
  headingRef,
  onChange,
}: {
  draft: OnboardingDraft;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = draft.whatsappNational
    ? waMeUrl(draft.whatsappNational)
    : null;

  async function toggleNotify() {
    if (draft.tiktokNotify) {
      onChange({ tiktokNotify: false });
      return;
    }
    await registerTikTokInterest();
    onChange({ tiktokNotify: true });
  }

  async function onCopy() {
    if (!link) {
      return;
    }
    const ok = await copyText(link);
    if (!ok) {
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-page-title text-balance outline-none"
        >
          TikTok
        </h2>
        <Badge tone="muted">Facultatif</Badge>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text">
            <Share2 className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-medium text-zinc-900">
              L&apos;intégration TikTok arrive
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Dès que TikTok aura approuvé l&apos;accès, vous pourrez relier
              votre compte ici. Vous validerez chaque réponse avant
              qu&apos;elle soit publiée.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-pressed={draft.tiktokNotify}
          onClick={() => void toggleNotify()}
          className={cn(
            "mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-control px-3 text-sm font-medium",
            focusRingClass,
            draft.tiktokNotify
              ? "bg-success-soft text-success"
              : "bg-accent-soft text-accent-text",
          )}
        >
          <Bell className="size-4" aria-hidden="true" />
          {draft.tiktokNotify
            ? "C'est noté, nous vous prévenons"
            : "Me prévenir quand c'est prêt"}
        </button>
      </Card>

      <Card>
        <p className="font-medium text-zinc-900">
          En attendant : mettez WhatsApp dans votre bio TikTok
        </p>
        {link ? (
          <>
            <p className="mt-2 break-all text-sm text-zinc-600">{link}</p>
            <p className="mt-1 text-caption text-zinc-500">
              Numéro : {formatSenegalDisplay(draft.whatsappNational)}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full"
              icon={<Copy className="size-4" />}
              onClick={() => void onCopy()}
            >
              {copied ? "Copié" : "Copier"}
            </Button>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            Le lien apparaîtra après la demande de branchement WhatsApp.
          </p>
        )}
      </Card>
    </div>
  );
}
