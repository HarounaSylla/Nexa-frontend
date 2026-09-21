import { auth } from "@clerk/nextjs/server";

import { CatalogueView } from "@/components/catalogue/catalogue-view";
import { errorMessage } from "@/lib/api";
import {
  type CatalogueCategory,
  type CatalogueProduct,
  listCategories,
  listProducts,
} from "@/lib/catalogue-api";

export default async function CataloguePage() {
  const { getToken } = await auth.protect();
  const token = await getToken();

  let products: CatalogueProduct[] = [];
  let categories: CatalogueCategory[] = [];
  let initialError: string | null = null;
  try {
    [products, categories] = await Promise.all([
      listProducts(token),
      listCategories(token),
    ]);
  } catch (error) {
    initialError = errorMessage(error);
  }

  return (
    <CatalogueView
      initialProducts={products}
      initialCategories={categories}
      initialError={initialError}
    />
  );
}
