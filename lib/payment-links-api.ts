import { BackendApiError, backendFetch, errorMessage } from "@/lib/api";

export type PaymentLink = {
  id: string;
  label: string;
  url: string;
};

export async function listPaymentLinks(token: string | null) {
  return backendFetch<PaymentLink[]>("/merchants/me/payment-links", { token });
}

export async function createPaymentLink(
  token: string | null,
  input: { label: string; url: string },
) {
  return backendFetch<PaymentLink>("/merchants/me/payment-links", {
    token,
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePaymentLink(
  token: string | null,
  linkId: string,
  input: { label: string; url: string },
) {
  return backendFetch<PaymentLink>(`/merchants/me/payment-links/${linkId}`, {
    token,
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deletePaymentLink(token: string | null, linkId: string) {
  return backendFetch<null>(`/merchants/me/payment-links/${linkId}`, {
    token,
    method: "DELETE",
  });
}

export function displayPaymentLinkError(message: string): string {
  if (message === "A payment link with this label already exists") {
    return "Un lien porte déjà ce nom.";
  }
  if (message === "At most 10 payment links are allowed") {
    return "Vous pouvez enregistrer 10 liens au maximum.";
  }
  if (message === "Payment link was not found") {
    return "Ce lien n'existe plus. Actualisez la page.";
  }
  if (/must be a valid https/i.test(message)) {
    return "Le lien doit commencer par https://.";
  }
  if (/1–40|1-40/.test(message)) {
    return "Le nom doit faire entre 1 et 40 caractères.";
  }
  return message;
}

export function paymentLinkErrorFromUnknown(err: unknown): string {
  if (err instanceof BackendApiError) {
    const detail = err.detail;
    if (typeof detail === "object" && detail !== null && "detail" in detail) {
      const nested = (detail as { detail: unknown }).detail;
      if (Array.isArray(nested) && nested[0] && typeof nested[0] === "object") {
        const msg = (nested[0] as { msg?: unknown }).msg;
        if (typeof msg === "string" && msg.trim()) {
          return displayPaymentLinkError(msg);
        }
      }
    }
  }
  return displayPaymentLinkError(errorMessage(err));
}
