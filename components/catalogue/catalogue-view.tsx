"use client";

import { useAuth } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";

import { CategoriesPanel } from "@/components/catalogue/categories-panel";
import { ProductsPanel } from "@/components/catalogue/products-panel";
import { PageTabs } from "@/components/page-tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { errorMessage } from "@/lib/api";
import {
  type CatalogueCategory,
  type CatalogueProduct,
  listCategories,
  listProducts,
} from "@/lib/catalogue-api";
import { CATALOGUE_TABS } from "@/lib/nav";

export function CatalogueView({
  initialProducts,
  initialCategories,
  initialError = null,
}: {
  initialProducts: CatalogueProduct[];
  initialCategories: CatalogueCategory[];
  initialError?: string | null;
}) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<(typeof CATALOGUE_TABS)[number]["id"]>(
    "produits",
  );
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [error, setError] = useState<string | null>(initialError);
  const [editing, setEditing] = useState<"create" | CatalogueProduct | null>(
    null,
  );
  const [subtitle, setSubtitle] = useState(
    `${initialProducts.length} produit${initialProducts.length === 1 ? "" : "s"}`,
  );

  const handleSubtitle = useCallback((value: string) => {
    setSubtitle(value);
  }, []);

  async function refresh() {
    setError(null);
    const token = await getToken();
    const [nextProducts, nextCategories] = await Promise.all([
      listProducts(token),
      listCategories(token),
    ]);
    setProducts(nextProducts);
    setCategories(nextCategories);
    return nextProducts;
  }

  async function refreshSafe() {
    try {
      return await refresh();
    } catch (err) {
      setError(errorMessage(err));
      return products;
    }
  }

  async function token() {
    return getToken();
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Catalogue"
        subtitle={tab === "produits" ? subtitle : undefined}
        actions={
          tab === "produits" ? (
            <Button
              icon={<Plus className="size-4" />}
              onClick={() => setEditing("create")}
            >
              Ajouter un produit
            </Button>
          ) : null
        }
      />
      <PageTabs
        label="Sections du catalogue"
        tabs={CATALOGUE_TABS}
        selectedId={tab}
        onSelect={(id) => setTab(id as typeof tab)}
      />
      {tab === "produits" ? (
        <ProductsPanel
          getToken={token}
          products={products}
          categories={categories}
          loading={false}
          error={error}
          editing={editing}
          onEditingChange={setEditing}
          onSubtitleChange={handleSubtitle}
          onRefresh={refreshSafe}
        />
      ) : (
        <CategoriesPanel
          getToken={token}
          categories={categories}
          loading={false}
          error={error}
          onRefresh={refreshSafe}
        />
      )}
    </div>
  );
}
