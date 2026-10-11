"use client";

import {
  useId,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api";
import {
  type MerchantPreferences,
  updatePreferences,
} from "@/lib/preferences-api";
import { bannerErrorClass } from "@/lib/ui";

import {
  formFromPreferences,
  payloadFromForm,
  preferencesEqual,
  TEXT_FIELD_MAX,
  timezoneOptions,
} from "./preferences-helpers";

const PAYMENT_REQUIRED = "Au moins un mode de paiement est requis.";
const FORM_ID = "shop-preferences-form";

export function ShopPreferencesForm({
  getToken,
  preferences,
  onPreferencesChange,
  afterPayment,
}: {
  getToken: () => Promise<string | null>;
  preferences: MerchantPreferences;
  onPreferencesChange: (preferences: MerchantPreferences) => void;
  afterPayment?: (acceptsOnlinePayment: boolean) => ReactNode;
}) {
  const cashId = useId();
  const onlineId = useId();
  const timezoneId = useId();
  const addressId = useId();
  const hoursId = useId();
  const returnsId = useId();
  const feeId = useId();
  const extraId = useId();
  const [form, setForm] = useState(() => formFromPreferences(preferences));
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const zones = useMemo(
    () => timezoneOptions(form.timezone),
    [form.timezone],
  );
  const dirty = !preferencesEqual(payloadFromForm(form), preferences);

  function setPayment(
    field: "accepts_cash_on_delivery" | "accepts_online_payment",
    next: boolean,
  ) {
    const other =
      field === "accepts_cash_on_delivery"
        ? form.accepts_online_payment
        : form.accepts_cash_on_delivery;
    if (!next && !other) {
      setPaymentError(PAYMENT_REQUIRED);
      return;
    }
    setPaymentError(null);
    setForm((current) => ({ ...current, [field]: next }));
  }

  function resetForm() {
    setForm(formFromPreferences(preferences));
    setPaymentError(null);
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.accepts_cash_on_delivery && !form.accepts_online_payment) {
      setPaymentError(PAYMENT_REQUIRED);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await updatePreferences(
        await getToken(),
        payloadFromForm(form),
      );
      onPreferencesChange(saved);
      setForm(formFromPreferences(saved));
      toast.success("Préférences enregistrées.");
    } catch (err) {
      const message = errorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`flex flex-col gap-4 ${dirty ? "pb-28 sm:pb-0" : ""}`}>
      <Card>
        <CardHeader>
          <CardTitle>Paiement</CardTitle>
          <p className="text-sm text-zinc-500">
            Les modes de paiement que votre boutique accepte. L&apos;agent ne
            propose que ceux-ci.
          </p>
        </CardHeader>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={cashId}
            className="flex min-h-11 items-center gap-3 text-sm font-medium"
          >
            <input
              id={cashId}
              type="checkbox"
              checked={form.accepts_cash_on_delivery}
              onChange={(event) =>
                setPayment("accepts_cash_on_delivery", event.target.checked)
              }
              className="size-5"
            />
            Paiement à la livraison
          </label>
          <div>
            <label
              htmlFor={onlineId}
              className="flex min-h-11 items-center gap-3 text-sm font-medium"
            >
              <input
                id={onlineId}
                type="checkbox"
                checked={form.accepts_online_payment}
                onChange={(event) =>
                  setPayment("accepts_online_payment", event.target.checked)
                }
                className="size-5"
              />
              Paiement en ligne
            </label>
            <p className="mt-1 pl-8 text-xs text-zinc-500">
              Ajoutez vos liens (Wave, Orange Money…) dans la carte « Liens de
              paiement » plus bas. Vous les envoyez depuis la page Commandes.
            </p>
          </div>
        </div>
        {paymentError ? (
          <p className={`mt-3 ${bannerErrorClass}`} role="alert">
            {paymentError}
          </p>
        ) : null}
      </Card>

      {afterPayment?.(form.accepts_online_payment)}

      <form id={FORM_ID} className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Infos de la boutique</CardTitle>
            <p className="text-sm text-zinc-500">
              Ce que l&apos;agent peut répondre aux clients. S&apos;il ne trouve
              pas l&apos;information ici, il ne l&apos;invente pas : il vous
              passe la conversation.
            </p>
          </CardHeader>

          <div className="flex flex-col gap-4">
            <Field
              label="Fuseau horaire"
              htmlFor={timezoneId}
              hint="Sert à l'agent à savoir si votre boutique est ouverte quand un client écrit."
            >
              <Select
                id={timezoneId}
                value={form.timezone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    timezone: event.target.value,
                  }))
                }
              >
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </Select>
            </Field>

            <PrefTextarea
              id={addressId}
              label="Adresse de la boutique"
              placeholder="Ex. : 12 rue du Marché, centre-ville"
              value={form.shop_address}
              onChange={(value) =>
                setForm((current) => ({ ...current, shop_address: value }))
              }
            />
            <PrefTextarea
              id={hoursId}
              label="Horaires d'ouverture"
              placeholder="Ex. : Lundi au samedi, 9h à 19h"
              value={form.opening_hours}
              onChange={(value) =>
                setForm((current) => ({ ...current, opening_hours: value }))
              }
            />
            <PrefTextarea
              id={returnsId}
              label="Retours et échanges"
              placeholder="Ex. : Échange possible sous 48h si l'article est intact."
              value={form.return_policy}
              onChange={(value) =>
                setForm((current) => ({ ...current, return_policy: value }))
              }
            />
            <PrefTextarea
              id={feeId}
              label="Frais de livraison"
              placeholder="Ex. : 1 500 F en ville, à régler au livreur."
              help="Précisez les tarifs ou comment ils sont fixés. Laissez vide si vous les confirmez au cas par cas : l'agent dira alors au client que les frais lui seront confirmés."
              value={form.delivery_fee_note}
              onChange={(value) =>
                setForm((current) => ({ ...current, delivery_fee_note: value }))
              }
            />
            <PrefTextarea
              id={extraId}
              label="Autres informations"
              placeholder="Ex. : Nous livrons aussi le dimanche sur demande."
              value={form.extra_info}
              onChange={(value) =>
                setForm((current) => ({ ...current, extra_info: value }))
              }
            />
          </div>
        </Card>

        {error ? (
          <p className={bannerErrorClass} role="alert">
            {error}
          </p>
        ) : null}

        <div className={dirty ? "hidden sm:block" : undefined}>
          <Button
            type="submit"
            disabled={saving || !dirty}
            className="w-full sm:w-auto"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>

      {dirty ? (
        <div className="fixed inset-x-0 z-header border-t border-zinc-200 bg-white px-4 py-3 sm:hidden bottom-[calc(3.5rem+env(safe-area-inset-bottom))]">
          <div className="flex flex-col gap-2">
            <Button type="submit" form={FORM_ID} disabled={saving} className="w-full">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={saving}
              onClick={resetForm}
            >
              Annuler les modifications
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PrefTextarea({
  id,
  label,
  placeholder,
  help,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Field label={label} htmlFor={id}>
        <Textarea
          id={id}
          rows={3}
          maxLength={TEXT_FIELD_MAX}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
      {help ? <p className="mt-1 text-xs text-zinc-500">{help}</p> : null}
      <p className="mt-1 text-right text-xs tabular-nums text-zinc-500">
        {value.length} / {TEXT_FIELD_MAX}
      </p>
    </div>
  );
}
