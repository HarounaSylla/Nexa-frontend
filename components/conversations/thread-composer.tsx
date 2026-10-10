"use client";

import {
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Textarea } from "@/components/ui/field";
import { cn } from "@/lib/cn";

import { isEscalated } from "./helpers";

export function ThreadComposer({
  replyId,
  draft,
  pending,
  error,
  status,
  onDraftChange,
  onDraftKeyDown,
  onSubmit,
  onReturnToAgent,
}: {
  replyId: string;
  draft: string;
  pending: boolean;
  error: string | null;
  status: string;
  onDraftChange: (value: string) => void;
  onDraftKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent) => void;
  onReturnToAgent: () => Promise<void>;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  function resize(element: HTMLTextAreaElement) {
    element.style.height = "auto";
    const line = 24;
    element.style.height = `${Math.min(element.scrollHeight, line * 5)}px`;
  }

  return (
    <form
      className="shrink-0 border-t border-zinc-100 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onSubmit={onSubmit}
    >
      {isEscalated(status) ? (
        <div className="mb-3 flex flex-col gap-2 rounded-control bg-warning-soft px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-warning">
            Le client attend une réponse de votre part.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => void onReturnToAgent()}
          >
            Renvoyer à l&apos;agent
          </Button>
        </div>
      ) : null}
      {error ? (
        <p className="mb-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <label htmlFor={replyId} className="sr-only">
          Réponse
        </label>
        <Textarea
          ref={areaRef}
          id={replyId}
          value={draft}
          rows={1}
          onChange={(event) => {
            onDraftChange(event.target.value);
            resize(event.target);
          }}
          onKeyDown={onDraftKeyDown}
          placeholder="Écrivez votre réponse…"
          className="min-h-11 resize-none py-2.5"
        />
        <IconButton
          type="submit"
          label="Envoyer"
          disabled={pending || draft.trim() === ""}
          className={cn(
            "shrink-0 bg-accent text-white hover:bg-accent-text hover:text-white",
            (pending || draft.trim() === "") && "opacity-60",
          )}
        >
          {pending ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-5" aria-hidden="true" />
          )}
        </IconButton>
      </div>
      <p className="mt-1.5 hidden text-caption text-zinc-500 pointer-fine:block">
        Entrée pour envoyer · Maj+Entrée pour un saut de ligne
      </p>
    </form>
  );
}
