"use client";

import { useId, useState, type FormEvent } from "react";
import { Info, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import {
  type CatalogueCategory,
  renameCategory,
} from "@/lib/catalogue-api";
import { bannerErrorClass, bannerInfoClass } from "@/lib/ui";

import { CategoryRow } from "./category-row";

export function CategoriesPanel({
  getToken,
  categories,
  loading,
  error,
  onRefresh,
}: {
  getToken: () => Promise<string | null>;
  categories: CatalogueCategory[];
  loading: boolean;
  error: string | null;
  onRefresh: () => Promise<unknown>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function saveRename(oldName: string) {
    const next = draft.trim();
    if (!next || next === oldName) {
      setEditing(null);
      return;
    }
    setPending(true);
    setActionError(null);
    try {
      await renameCategory(await getToken(), oldName, next);
      setEditing(null);
      toast.success("Catégorie renommée.");
      await onRefresh();
    } catch (err) {
      const message = errorMessage(err);
      setActionError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <Card className="mt-6 overflow-hidden p-0">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-[72px] items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-20" />
            </div>
            <Skeleton className="h-11 w-28" />
          </div>
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <p className={`mt-6 ${bannerErrorClass}`} role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-6">
      <p className={`${bannerInfoClass} flex items-start gap-2`}>
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          {
            "Une catégorie existe dès qu'un produit l'utilise. Ajoutez ou modifiez la catégorie d'un produit pour ça — il n'y a pas de bouton de création séparé ici."
          }
        </span>
      </p>

      {actionError && !editing ? (
        <p className={`mt-4 ${bannerErrorClass}`} role="alert">
          {actionError}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Tags className="size-5" aria-hidden="true" />}
          title="Aucune catégorie pour le moment"
          description="Attribuez une catégorie en ajoutant un produit."
        />
      ) : (
        <Card className="mt-4 overflow-hidden p-0">
          <ul className="divide-y divide-zinc-100">
            {categories.map((row) => (
              <CategoryRow
                key={row.category ?? "uncategorized"}
                row={row}
                onRename={(name) => {
                  setActionError(null);
                  setDraft(name);
                  setEditing(name);
                }}
              />
            ))}
          </ul>
        </Card>
      )}

      {editing ? (
        <RenameCategoryDialog
          value={draft}
          pending={pending}
          error={actionError}
          onChange={setDraft}
          onClose={() => {
            if (!pending) {
              setEditing(null);
              setActionError(null);
            }
          }}
          onSubmit={() => void saveRename(editing)}
        />
      ) : null}
    </div>
  );
}

function RenameCategoryDialog({
  value,
  pending,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  value: string;
  pending: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const inputId = useId();

  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <DialogContent title="Renommer la catégorie">
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Field label="Nouveau nom" htmlFor={inputId}>
            <Input
              id={inputId}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              autoFocus
              onFocus={(event) => event.currentTarget.select()}
            />
          </Field>
          {error ? (
            <p className={bannerErrorClass} role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
