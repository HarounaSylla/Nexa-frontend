"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

import { CategoriesPanel } from "@/components/catalogue/categories-panel";
import { ProductsPanel } from "@/components/catalogue/products-panel";
import { PageTabs } from "@/components/page-tabs";
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

  async function refresh() {
    setError(null);
    try {
      const token = await getToken();
      const [nextProducts, nextCategories] = await Promise.all([
        listProducts(token),
        listCategories(token),
      ]);
      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function token() {
    return getToken();
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Catalogue" />
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
          onRefresh={refresh}
        />
      ) : (
        <CategoriesPanel
          getToken={token}
          categories={categories}
          loading={false}
          error={error}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
