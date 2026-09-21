import { backendFetch } from "@/lib/api";

export type CatalogueProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: string | number | null;
  stock_qty: number;
  image_url: string | null;
};

export type CatalogueCategory = {
  category: string | null;
  product_count: number;
};

export type ProductInput = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock_qty: number;
};

export async function listProducts(token: string | null) {
  return backendFetch<CatalogueProduct[]>("/catalogue/products", { token });
}

export async function createProduct(token: string | null, input: ProductInput) {
  return backendFetch<CatalogueProduct>("/catalogue/products", {
    token,
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      description: input.description || null,
      price: input.price,
      category: input.category,
      stock_qty: input.stock_qty,
    }),
  });
}

export async function updateProduct(
  token: string | null,
  productId: string,
  input: ProductInput,
) {
  return backendFetch<CatalogueProduct>(`/catalogue/products/${productId}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({
      name: input.name,
      description: input.description || null,
      price: input.price,
      category: input.category,
      stock_qty: input.stock_qty,
    }),
  });
}

export async function deleteProduct(token: string | null, productId: string) {
  return backendFetch<null>(`/catalogue/products/${productId}`, {
    token,
    method: "DELETE",
  });
}

export async function uploadProductPhoto(
  token: string | null,
  productId: string,
  file: File,
) {
  const body = new FormData();
  body.append("file", file);
  return backendFetch<CatalogueProduct>(
    `/catalogue/products/${productId}/photo`,
    { token, method: "POST", body },
  );
}

export async function listCategories(token: string | null) {
  return backendFetch<CatalogueCategory[]>("/catalogue/categories", { token });
}

export async function renameCategory(
  token: string | null,
  oldName: string,
  newName: string,
) {
  return backendFetch<{ category: string; product_count: number }>(
    `/catalogue/categories/${encodeURIComponent(oldName)}`,
    {
      token,
      method: "PATCH",
      body: JSON.stringify({ new_name: newName }),
    },
  );
}
