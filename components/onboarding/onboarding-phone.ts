/** National SN mobile: 9 digits after stripping spaces and a leading 221. */
export function normalizeNationalNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const withoutCountry = digits.startsWith("221") ? digits.slice(3) : digits;
  return withoutCountry.slice(0, 9);
}

export function isCompleteNationalNumber(national: string): boolean {
  return /^\d{9}$/.test(national);
}

export function formatSenegalDisplay(national: string): string {
  const d = normalizeNationalNumber(national);
  const a = d.slice(0, 2);
  const b = d.slice(2, 5);
  const c = d.slice(5, 7);
  const e = d.slice(7, 9);
  return ["+221", a, b, c, e].filter(Boolean).join(" ");
}

export function waMeUrl(national: string): string {
  return `https://wa.me/221${normalizeNationalNumber(national)}`;
}
