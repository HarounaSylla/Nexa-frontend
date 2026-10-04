"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

import { PageTabs } from "@/components/page-tabs";
import { errorMessage } from "@/lib/api";
import { listDeliveryZones, type DeliveryZone } from "@/lib/orders-api";
import { PARAMETRES_TABS } from "@/lib/nav";
import {
  getPreferences,
  type MerchantPreferences,
} from "@/lib/preferences-api";
import {
  bannerErrorClass,
  btnSecondary,
  pageTitleClass,
} from "@/lib/ui";

import { DeliveryZonesCard } from "./delivery-zones-card";
import { ShopPreferencesForm } from "./shop-preferences-form";

export function PreferencesView({
  initialPreferences,
  initialZones,
  initialError = null,
}: {
  initialPreferences: MerchantPreferences | null;
  initialZones: DeliveryZone[] | null;
  initialError?: string | null;
}) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<(typeof PARAMETRES_TABS)[number]["id"]>(
    "preferences",
  );
  const [preferences, setPreferences] = useState(initialPreferences);
  const [zones, setZones] = useState(initialZones);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const loadFailed = preferences === null || zones === null;

  async function retry() {
    setLoading(true);
    try {
      const token = await getToken();
      const [nextPreferences, nextZones] = await Promise.all([
        getPreferences(token),
        listDeliveryZones(token),
      ]);
      setPreferences(nextPreferences);
      setZones(nextZones);
      setError(null);
    } catch (err) {
      setPreferences(null);
      setZones(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className={pageTitleClass}>Paramètres</h1>
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
          <button
            type="button"
            disabled={loading}
            onClick={retry}
            className={`${btnSecondary} mt-3`}
          >
            {loading ? "Chargement…" : "Réessayer"}
          </button>
        </div>
      ) : null}
      {tab === "preferences" && !loadFailed ? (
        <div className="mt-6 flex flex-col gap-4">
          <DeliveryZonesCard
            getToken={getToken}
            zones={zones}
            onZonesChange={setZones}
          />
          <ShopPreferencesForm
            getToken={getToken}
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        </div>
      ) : null}
    </div>
  );
}
