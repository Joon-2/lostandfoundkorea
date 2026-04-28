"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import { siteConfig } from "@/config/site";
import { Link, useRouter } from "@/i18n/navigation";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export default function CheckoutForm({ plan, title, subtitle, price, fields }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const initial = fields.reduce(
    (acc, f) => ({ ...acc, [f.name]: "" }),
    { fullName: "", email: "" }
  );
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const update = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!data.fullName.trim()) e.fullName = t("required");
    if (!data.email.trim()) e.email = t("required");
    else if (!EMAIL_RE.test(data.email)) e.email = t("emailInvalid");
    for (const f of fields) {
      if (f.required && !data[f.name].trim()) e[f.name] = t("required");
    }
    return e;
  };

  const formIsValid = Object.keys(validate()).length === 0;

  const createOrder = useCallback(async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      throw new Error("Please complete the form first.");
    }
    setPaymentError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/paypal/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok || !json.id) {
        console.error("checkout create failed:", json);
        throw new Error(json.error || "Failed to create PayPal order");
      }
      return json.id;
    } catch (err) {
      setPaymentError(err.message);
      setPaying(false);
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, data]);

  const onApprove = useCallback(
    async (paypalData) => {
      try {
        const res = await fetch("/api/paypal/checkout/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: paypalData.orderID,
            plan,
            formData: data,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          console.error("checkout capture failed:", json);
          throw new Error(json.error || "Payment capture failed");
        }
        router.push(`/pay/${json.caseNumber}`);
      } catch (err) {
        setPaymentError(err.message);
      } finally {
        setPaying(false);
      }
    },
    [plan, data, router]
  );

  const paypalConfigured = Boolean(PAYPAL_CLIENT_ID);

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-white"
          >
            {siteConfig.name}
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-300 transition-colors hover:text-white"
          >
            {t("needHelp")}
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          {t("header")}
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-body">{subtitle}</p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-baseline justify-between border-b border-border pb-4">
            <span className="text-sm font-medium text-foreground">
              {t("totalToday")}
            </span>
            <span className="font-serif text-3xl tracking-tight text-foreground">
              ${price}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <Field label={t("fullName")} required error={errors.fullName}>
              <input
                type="text"
                className={inputCls}
                value={data.fullName}
                onChange={update("fullName")}
                placeholder={t("fullNamePlaceholder")}
              />
            </Field>
            <Field label={t("email")} required error={errors.email}>
              <input
                type="email"
                className={inputCls}
                value={data.email}
                onChange={update("email")}
                placeholder={t("emailPlaceholder")}
              />
            </Field>
            {fields.map((f) => (
              <Field
                key={f.name}
                label={f.label + (f.required ? "" : t("optional"))}
                required={f.required}
                error={errors[f.name]}
              >
                {f.multiline ? (
                  <textarea
                    className={`${inputCls} min-h-28 resize-y`}
                    value={data[f.name]}
                    onChange={update(f.name)}
                    placeholder={f.placeholder}
                  />
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={data[f.name]}
                    onChange={update(f.name)}
                    placeholder={f.placeholder}
                  />
                )}
              </Field>
            ))}
          </div>

          <div className="mt-8">
            {paypalConfigured ? (
              <div className={formIsValid ? "" : "pointer-events-none opacity-60"}>
                <PayPalScriptProvider
                  options={{
                    "client-id": PAYPAL_CLIENT_ID,
                    currency: "USD",
                    intent: "capture",
                    locale: "en_US",
                  }}
                >
                  <PayPalButtons
                    disabled={paying || !formIsValid}
                    style={{ layout: "vertical", color: "gold", shape: "pill" }}
                    forceReRender={[plan, JSON.stringify(data)]}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                      console.error("PayPal button error:", err);
                      setPaymentError(t("paymentFailed"));
                      setPaying(false);
                    }}
                    onCancel={() => {
                      setPaying(false);
                    }}
                  />
                </PayPalScriptProvider>
                {!formIsValid && (
                  <p className="mt-2 text-xs text-muted">
                    {t("completeToEnable")}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {t("paymentUnavailable")}
              </p>
            )}

            {paymentError && (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {paymentError}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
