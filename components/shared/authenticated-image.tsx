"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useId, useState } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { fetchImageBlob, isDeletedImageError } from "@/lib/images-api";
import { X } from "lucide-react";

export function AuthenticatedImage({
  imageId,
  alt,
  className,
  onClick,
  deleted = false,
}: {
  imageId: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  deleted?: boolean;
}) {
  const { getToken } = useAuth();
  const [result, setResult] = useState<{
    imageId: string;
    src: string | null;
    ok: boolean;
    gone: boolean;
  } | null>(null);

  useEffect(() => {
    if (deleted) {
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const blob = await fetchImageBlob(await getToken(), imageId);
        if (cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setResult({ imageId, src: objectUrl, ok: true, gone: false });
      } catch (error) {
        if (!cancelled) {
          const gone = isDeletedImageError(error);
          setResult({ imageId, src: null, ok: false, gone });
        }
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [deleted, getToken, imageId]);

  const boxClass = className ?? "h-24 w-24";

  if (deleted) {
    return <DeletedImageBox className={boxClass} />;
  }

  const current = result?.imageId === imageId ? result : null;
  if (!current) {
    return (
      <div
        className={`animate-pulse rounded-control bg-zinc-100 ${boxClass}`}
        aria-hidden="true"
      />
    );
  }
  if (current.gone) {
    return <DeletedImageBox className={boxClass} />;
  }
  if (!current.ok || !current.src) {
    return (
      <div
        className={`flex items-center justify-center rounded-control border border-zinc-200 bg-zinc-50 px-2 text-center text-xs text-zinc-500 ${boxClass}`}
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

function DeletedImageBox({ className }: { className: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-control bg-zinc-100 px-2 text-center text-xs text-zinc-400 ${className}`}
    >
      Image supprimée
    </div>
  );
}

export function ImagePreviewDialog({
  imageId,
  onClose,
  title = "Photo",
}: {
  imageId: string;
  onClose: () => void;
  title?: string;
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
    <div className="fixed inset-0 z-preview flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-zinc-200/80 bg-white p-5 shadow-card sm:max-w-lg sm:rounded-card"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id={titleId} className="font-display text-lg font-bold">
            {title}
          </h3>
          <IconButton label="Fermer" onClick={onClose}>
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="mt-4">
          <AuthenticatedImage
            imageId={imageId}
            alt={title}
            className="mx-auto max-h-[70dvh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
