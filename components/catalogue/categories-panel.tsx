"use client";

import { useId, useState } from "react";

import { errorMessage } from "@/lib/api";
import {
  type CatalogueCategory,
  renameCategory,
} from "@/lib/catalogue-api";
import {
  bannerErrorClass,
  btnPrimary,
  btnSecondary,
  cardClass,
  emptyStateClass,
  inputClass,
} from "@/lib/ui";

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
  onRefresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) {
    return <p className="mt-6 text-sm text-zinc-500">Chargement des catégories…</p>;
  }

  if (error) {
    return (
      <p className={`mt-6 ${bannerErrorClass}`} role="alert">
        {error}
      </p>
    );
  }

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
      await onRefresh();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-zinc-500">
        {"Une catégorie existe dès qu'un produit l'utilise. Ajoutez ou modifiez la catégorie d'un produit pour ça — il n'y a pas de bouton de création séparé ici."}
      </p>

      {actionError ? (
        <p className={`mt-4 ${bannerErrorClass}`} role="alert">
          {actionError}
        </p>
      ) : null}

      {categories.length === 0 ? (
        <div className={`mt-8 ${emptyStateClass}`}>
          <p className="font-medium text-zinc-800">Aucune catégorie pour le moment</p>
          <p className="mt-1 text-sm">
            Attribuez une catégorie en ajoutant un produit.
          </p>
        </div>
      ) : (
        <ul className={`${cardClass} mt-4 divide-y divide-zinc-100`}>
          {categories.map((row) => {
            const name = row.category;
            return (
              <li
                key={name ?? "uncategorized"}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  {editing === name && name ? (
                    <RenameInput
                      value={draft}
                      onChange={setDraft}
                    />
                  ) : (
                    <>
                      <p className="font-medium">{name ?? "Sans catégorie"}</p>
                      <p className="text-sm text-zinc-500 tabular-nums">
                        {row.product_count} produit
                        {row.product_count === 1 ? "" : "s"}
                      </p>
                    </>
                  )}
                </div>
                {name ? (
                  <div className="flex flex-wrap gap-2">
                    {editing === name ? (
                      <>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => saveRename(name)}
                          className={btnPrimary}
                        >
                          {pending ? "Enregistrement…" : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => setEditing(null)}
                          className={btnSecondary}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActionError(null);
                          setDraft(name);
                          setEditing(name);
                        }}
                        className={btnSecondary}
                      >
                        Renommer
                      </button>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RenameInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="sr-only">
        New category name
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} w-full sm:max-w-sm`}
      />
    </>
  );
}
