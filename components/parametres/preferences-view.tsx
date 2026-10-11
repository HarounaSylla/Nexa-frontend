"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

import { PageTabs } from "@/components/page-tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { errorMessage } from "@/lib/api";
import { PARAMETRES_TABS } from "@/lib/nav";
import { listDeliveryZones, type DeliveryZone } from "@/lib/orders-api";
import { listPaymentLinks, type PaymentLink } from "@/lib/payment-links-api";
import {
  getPreferences,
  type MerchantPreferences,
} from "@/lib/preferences-api";
import { bannerErrorClass } from "@/lib/ui";

import { DeliveryZonesCard } from "./delivery-zones-card";
import { PaymentLinksCard } from "./payment-links-card";
import { ShopPreferencesForm } from "./shop-preferences-form";

export function PreferencesView({
  initialPreferences,
  initialZones,
  initialPaymentLinks,
  initialError = null,
}: {
  initialPreferences: MerchantPreferences | null;
  initialZones: DeliveryZone[] | null;
  initialPaymentLinks: PaymentLink[] | null;
  initialError?: string | null;
}) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<(typeof PARAMETRES_TABS)[number]["id"]>(
    "preferences",
  );
  const [preferences, setPreferences] = useState(initialPreferences);
  const [zones, setZones] = useState(initialZones);
  const [paymentLinks, setPaymentLinks] = useState(initialPaymentLinks);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const loadFailed =
    preferences === null || zones === null || paymentLinks === null;

  async function retry() {
    setLoading(true);
    try {
      const token = await getToken();
      const [nextPreferences, nextZones, nextLinks] = await Promise.all([
        getPreferences(token),
        listDeliveryZones(token),
        listPaymentLinks(token),
      ]);
      setPreferences(nextPreferences);
      setZones(nextZones);
      setPaymentLinks(nextLinks);
      setError(null);
    } catch (err) {
      setPreferences(null);
      setZones(null);
      setPaymentLinks(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <PageHeader title="Paramètres" />
      <PageTabs
        label="Sections des paramètres"
        tabs={PARAMETRES_TABS}
        selectedId={tab}
        onSelect={(id) => setTab(id as typeof tab)}
      />
      {tab === "preferences" && loadFailed ? (
        <div className={`mt-6 ${bannerErrorClass}`} role="alert">
          <p className="font-medium">Impossible de charger vos préférences.</p>
          {error ? <p className="mt-1">{error}</p> : null}
          <p className="mt-1">Vos réglages n&apos;ont pas été modifiés.</p>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => void retry()}
            className="mt-3"
          >
            {loading ? "Chargement…" : "Réessayer"}
          </Button>
        </div>
      ) : null}
      {tab === "preferences" && !loadFailed ? (
        <div className="mt-6 flex max-w-2xl flex-col gap-4">
          <DeliveryZonesCard
            getToken={getToken}
            zones={zones}
            onZonesChange={setZones}
          />
          <ShopPreferencesForm
            getToken={getToken}
            preferences={preferences}
            onPreferencesChange={setPreferences}
            afterPayment={(acceptsOnlinePayment) => (
              <PaymentLinksCard
                getToken={getToken}
                initialLinks={paymentLinks}
                acceptsOnlinePayment={acceptsOnlinePayment}
              />
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
