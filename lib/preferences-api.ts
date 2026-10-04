import { backendFetch } from "@/lib/api";

export type MerchantPreferences = {
  accepts_cash_on_delivery: boolean;
  accepts_online_payment: boolean;
  timezone: string;
  shop_address: string | null;
  opening_hours: string | null;
  return_policy: string | null;
  delivery_fee_note: string | null;
  extra_info: string | null;
};

export async function getPreferences(token: string | null) {
  return backendFetch<MerchantPreferences>("/merchants/me/preferences", {
    token,
  });
}

export async function updatePreferences(
  token: string | null,
  body: MerchantPreferences,
) {
  return backendFetch<MerchantPreferences>("/merchants/me/preferences", {
    token,
    method: "PUT",
    body: JSON.stringify(body),
  });
}
