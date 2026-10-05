import { auth } from "@clerk/nextjs/server";

import { PreferencesView } from "@/components/parametres/preferences-view";
import { errorMessage } from "@/lib/api";
import { listDeliveryZones, type DeliveryZone } from "@/lib/orders-api";
import {
  listPaymentLinks,
  type PaymentLink,
} from "@/lib/payment-links-api";
import {
  getPreferences,
  type MerchantPreferences,
} from "@/lib/preferences-api";

export default async function ParametresPage() {
  const { getToken } = await auth.protect();
  const token = await getToken();

  let preferences: MerchantPreferences | null = null;
  let zones: DeliveryZone[] | null = null;
  let paymentLinks: PaymentLink[] | null = null;
  let initialError: string | null = null;
  try {
    [preferences, zones, paymentLinks] = await Promise.all([
      getPreferences(token),
      listDeliveryZones(token),
      listPaymentLinks(token),
    ]);
  } catch (error) {
    preferences = null;
    zones = null;
    paymentLinks = null;
    initialError = errorMessage(error);
  }

  return (
    <PreferencesView
      initialPreferences={preferences}
      initialZones={zones}
      initialPaymentLinks={paymentLinks}
      initialError={initialError}
    />
  );
}
