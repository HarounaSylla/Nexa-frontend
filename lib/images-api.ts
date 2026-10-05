import { API_BASE, BackendApiError } from "@/lib/api";

export async function fetchImageBlob(
  token: string | null,
  imageId: string,
): Promise<Blob> {
  if (!token) {
    throw new BackendApiError(401, "missing_token");
  }

  const response = await fetch(`${API_BASE}/images/${imageId}`, {
    headers: {
      Accept: "image/*,application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let detail: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        detail = JSON.parse(text);
      } catch {
        detail = text;
      }
    }
    throw new BackendApiError(response.status, detail);
  }

  return response.blob();
}

export function isDeletedImageError(error: unknown): boolean {
  return error instanceof BackendApiError && error.status === 410;
}
