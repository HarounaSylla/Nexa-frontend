import type { MerchantPreferences } from "@/lib/preferences-api";

export const TEXT_FIELD_MAX = 1000;

export const FALLBACK_TIMEZONES = [
  "Africa/Dakar",
  "Africa/Abidjan",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Europe/Paris",
  "Europe/London",
  "America/New_York",
  "America/Sao_Paulo",
  "Asia/Dubai",
  "UTC",
];

export type ShopPreferencesForm = {
  accepts_cash_on_delivery: boolean;
  accepts_online_payment: boolean;
  timezone: string;
  shop_address: string;
  opening_hours: string;
  return_policy: string;
  delivery_fee_note: string;
  extra_info: string;
};

export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function formFromPreferences(
  preferences: MerchantPreferences,
): ShopPreferencesForm {
  return {
    accepts_cash_on_delivery: preferences.accepts_cash_on_delivery,
    accepts_online_payment: preferences.accepts_online_payment,
    timezone: preferences.timezone,
    shop_address: preferences.shop_address ?? "",
    opening_hours: preferences.opening_hours ?? "",
    return_policy: preferences.return_policy ?? "",
    delivery_fee_note: preferences.delivery_fee_note ?? "",
    extra_info: preferences.extra_info ?? "",
  };
}

export function payloadFromForm(
  form: ShopPreferencesForm,
): MerchantPreferences {
  return {
    accepts_cash_on_delivery: form.accepts_cash_on_delivery,
    accepts_online_payment: form.accepts_online_payment,
    timezone: form.timezone,
    shop_address: emptyToNull(form.shop_address),
    opening_hours: emptyToNull(form.opening_hours),
    return_policy: emptyToNull(form.return_policy),
    delivery_fee_note: emptyToNull(form.delivery_fee_note),
    extra_info: emptyToNull(form.extra_info),
  };
}

export function preferencesEqual(
  left: MerchantPreferences,
  right: MerchantPreferences,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function timezoneOptions(current: string): string[] {
  let values: string[] = [];
  try {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      values = Intl.supportedValuesOf("timeZone");
    }
  } catch {
    values = [];
  }
  if (values.length === 0) {
    values = [...FALLBACK_TIMEZONES];
  }
  if (current && !values.includes(current)) {
    values = [current, ...values];
  }
  return values;
}

export function formatDeliveryDelay(minHours: number, maxHours: number): string {
  return `${minHours}–${maxHours} h`;
}
