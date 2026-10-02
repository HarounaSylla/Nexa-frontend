import { cache } from "react";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type Merchant = {
  id: string;
  name: string;
  clerk_user_id: string | null;
  created_at: string;
};

export class MerchantNotOnboardedError extends Error {
  constructor() {
    super("merchant_not_onboarded");
    this.name = "MerchantNotOnboardedError";
  }
}

export class BackendApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(`Backend request failed (${status})`);
    this.name = "BackendApiError";
    this.status = status;
    this.detail = detail;
  }
}

type BackendFetchInit = RequestInit & { token: string | null };

/**
 * Authenticated fetch for the Nexa backend. Every dashboard page should use
 * this so the Clerk session token is attached as Bearer auth once, here.
 */
export async function backendFetch<T>(
  path: string,
  { token, headers, ...init }: BackendFetchInit,
): Promise<T> {
  if (!token) {
    throw new BackendApiError(401, "missing_token");
  }

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  });

  const body = await readJson(response);

  if (response.status === 404 && isMerchantNotOnboarded(body)) {
    throw new MerchantNotOnboardedError();
  }

  if (!response.ok) {
    throw new BackendApiError(response.status, body);
  }

  return body as T;
}

export async function fetchMerchantMe(token: string | null) {
  return backendFetch<Merchant>("/merchants/me", { token });
}

export const getMerchantMe = cache(fetchMerchantMe);

export async function onboardMerchant(token: string | null, name: string) {
  return backendFetch<Merchant>("/merchants/onboarding", {
    token,
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

function isMerchantNotOnboarded(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    "detail" in body &&
    (body as { detail: unknown }).detail === "merchant_not_onboarded"
  );
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE}${path}`;
}

export function errorMessage(error: unknown): string {
  if (error instanceof BackendApiError) {
    const detail = error.detail;
    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }
    if (typeof detail === "object" && detail !== null && "detail" in detail) {
      const nested = (detail as { detail: unknown }).detail;
      if (typeof nested === "string" && nested.trim()) {
        return nested;
      }
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Something went wrong. Try again.";
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
