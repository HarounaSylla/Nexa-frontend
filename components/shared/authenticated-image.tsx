"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useId, useState } from "react";

import { fetchImageBlob } from "@/lib/images-api";
import { btnSecondary, cardClass } from "@/lib/ui";

export function AuthenticatedImage({
  imageId,
  alt,
  className,
  onClick,
}: {
  imageId: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) {
  const { getToken } = useAuth();
  const [result, setResult] = useState<{
    imageId: string;
    src: string | null;
    ok: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const blob = await fetchImageBlob(await getToken(), imageId);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setResult({ imageId, src: objectUrl, ok: true });
      } catch {
        if (!cancelled) {
          setResult({ imageId, src: null, ok: false });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [getToken, imageId]);

  const current = result?.imageId === imageId ? result : null;
  if (!current) {
    return (
      <div
        className={`animate-pulse rounded-control bg-zinc-100 ${className ?? "h-24 w-24"}`}
        aria-hidden="true"
      />
    );
  }
  if (!current.ok || !current.src) {
    return (
      <div
        className={`flex items-center justify-center rounded-control border border-zinc-200 bg-zinc-50 px-2 text-center text-xs text-zinc-500 ${className ?? "h-24 w-24"}`}
        role="alert"
      >
        Image indisponible
      </div>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block p-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.src} alt={alt} className={className} />
      </button>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={current.src} alt={alt} className={className} />
  );
}

export function ImagePreviewDialog({
  imageId,
  onClose,
}: {
  imageId: string;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${cardClass} max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl p-5 sm:max-w-lg sm:rounded-card`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id={titleId} className="font-display text-lg font-bold">
            Preuve de paiement
          </h3>
          <button type="button" onClick={onClose} className={btnSecondary}>
            Fermer
          </button>
        </div>
        <div className="mt-4">
          <AuthenticatedImage
            imageId={imageId}
            alt="Preuve de paiement"
            className="mx-auto max-h-[70dvh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
