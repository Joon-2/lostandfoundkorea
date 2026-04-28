"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import Header from "@/components/layout/Header";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import {
  CATEGORIES,
  LOCATIONS,
  TIME_OPTIONS,
  DATE_CONFIDENCE,
} from "@/lib/constants";
import { plans } from "@/config/plans";

const TOTAL_STEPS = 2;

// Helper: given an option list ({ value, labelKey }) and a stored
// canonical value, return the localized label. Falls back to the raw
// value if no entry matches (defensive — shouldn't happen in practice).
function labelFor(list, value, t) {
  const found = list.find((o) => o.value === value);
  return found ? t(found.labelKey) : value;
}

const initialData = {
  plan: "recovery",
  fullName: "",
  email: "",
  itemCategory: "",
  brandModel: "",
  color: "",
  itemDescription: "",
  distinguishingFeatures: "",
  locationType: "",
  locationDetails: "",
  date: "",
  dateConfidence: DATE_CONFIDENCE[0].value,
  time: "Not sure",
  notes: "",
};

const labelCls = "block text-sm font-medium text-foreground mb-1.5";
const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors";
const errorCls = "mt-1.5 text-xs text-red-600";
const requiredMark = <span className="text-accent">*</span>;

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className={labelCls}>
        {label} {required && requiredMark}
      </label>
      {children}
      {error && <p className={errorCls}>{error}</p>}
    </div>
  );
}

function validateStep(step, data, t) {
  const errors = {};
  if (step === 1) {
    if (!data.fullName.trim()) errors.fullName = t("required");
    if (!data.email.trim()) errors.email = t("required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = t("emailInvalid");
    if (!data.itemCategory) errors.itemCategory = t("required");
    if (!data.itemDescription.trim()) errors.itemDescription = t("required");
  }
  if (step === 2) {
    if (!data.locationType) errors.locationType = t("required");
    if (!data.date) errors.date = t("required");
  }
  return errors;
}

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportPageInner />
    </Suspense>
  );
}

function ReportPageInner() {
  const t = useTranslations("form");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialPlan =
    searchParams.get("plan") === "all_in_one" ? "all_in_one" : "recovery";

  const PLAN_OPTIONS = [
    {
      value: "recovery",
      title: t("planRecoveryTitle"),
      tagline: t("planRecoveryTagline", { amount: plans.recovery.paymentPrice }),
    },
    {
      value: "all_in_one",
      title: t("planAllInOneTitle"),
      tagline: t("planAllInOneTagline", { amount: plans.all_in_one.priceSeoul }),
    },
  ];

  const STEP_LABELS = {
    1: t("step1Label"),
    2: t("step2Label"),
  };

  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...initialData, plan: initialPlan });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [caseNumber, setCaseNumber] = useState(null);

  const update = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const setPlan = (value) => {
    setData((d) => ({ ...d, plan: value }));
  };

  const next = () => {
    const e = validateStep(step, data, t);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const submit = async () => {
    if (submitting) return;
    const e = validateStep(step, data, t);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    let res;
    try {
      res = await fetch("/api/submit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
    } catch (err) {
      console.error("Submit fetch failed:", err);
      setSubmitError(t("submitFailedGeneric"));
      setSubmitting(false);
      return;
    }

    if (res.status === 429) {
      setSubmitError(t("tooManySubmissions"));
      setSubmitting(false);
      return;
    }

    const result = await res.json().catch(() => ({}));

    if (!res.ok || !result.ok || !result.caseNumber) {
      console.error("Submit failed:", {
        status: res.status,
        error: result.error,
        debug: result.debug,
      });
      setSubmitError(t("submitFailedGeneric"));
      setSubmitting(false);
      return;
    }

    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "confirmation",
          to: data.email.trim(),
          caseNumber: result.caseNumber,
          data: {
            name: data.fullName.trim(),
            category: data.itemCategory,
            itemDescription: data.itemDescription.trim(),
            location: data.locationType,
          },
        }),
      });
    } catch (emailErr) {
      console.error("Email API request failed:", emailErr);
    }

    setCaseNumber(result.caseNumber);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted)
    return <SubmittedScreen email={data.email} caseNumber={caseNumber} />;

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="flex flex-1 flex-col">
      <Header
        variant="simple"
        action={
          <Link
            href="/"
            className="text-sm text-body transition-colors hover:text-black"
          >
            {t("cancel")}
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {t("stepCounter", { step, total: TOTAL_STEPS })}
            </span>
            <span className="text-muted">{STEP_LABELS[step]}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step === 1 && (
            <Step1
              data={data}
              update={update}
              errors={errors}
              setPlan={setPlan}
              t={t}
              planOptions={PLAN_OPTIONS}
            />
          )}
          {step === 2 && (
            <Step2 data={data} update={update} errors={errors} t={t} />
          )}
        </div>

        {step === TOTAL_STEPS && <Summary data={data} t={t} />}

        {submitError && step === TOTAL_STEPS && (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">{t("submitFailed")}</p>
            <p className="mt-1 text-red-700">{submitError}</p>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-3 inline-flex items-center rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
            >
              {t("tryAgain")}
            </button>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 1 || submitting}
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("back")}
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {t("continue")}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Spinner />
                  <span>{t("submitting")}</span>
                </>
              ) : (
                <span>{t("submit")}</span>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function PlanPicker({ plan, setPlan, t, planOptions }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-foreground">
        {t("planLegend")}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {planOptions.map((opt) => {
          const selected = plan === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                selected
                  ? "border-accent bg-emerald-50 ring-2 ring-accent/30"
                  : "border-border bg-card hover:bg-alt"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={opt.value}
                checked={selected}
                onChange={() => setPlan(opt.value)}
                className="mt-1 h-4 w-4 flex-none accent-[color:var(--accent)]"
              />
              <span className="block">
                <span className="block text-sm font-semibold text-foreground">
                  {opt.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  {opt.tagline}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Step1({ data, update, errors, setPlan, t, planOptions }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">{t("step1Title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("step1Subtitle")}</p>
      </div>
      <PlanPicker plan={data.plan} setPlan={setPlan} t={t} planOptions={planOptions} />
      <Field label={t("name")} required error={errors.fullName}>
        <input
          type="text"
          className={inputCls}
          value={data.fullName}
          onChange={update("fullName")}
          placeholder={t("namePlaceholder")}
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
      <Field label={t("category")} required error={errors.itemCategory}>
        <select
          className={inputCls}
          value={data.itemCategory}
          onChange={update("itemCategory")}
        >
          <option value="">{t("categoryPlaceholder")}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {t(cat.labelKey)}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("brandModel")}>
          <input
            type="text"
            className={inputCls}
            value={data.brandModel}
            onChange={update("brandModel")}
            placeholder={t("brandModelPlaceholder")}
          />
        </Field>
        <Field label={t("color")}>
          <input
            type="text"
            className={inputCls}
            value={data.color}
            onChange={update("color")}
            placeholder={t("colorPlaceholder")}
          />
        </Field>
      </div>
      <Field
        label={t("description")}
        required
        error={errors.itemDescription}
      >
        <textarea
          className={`${inputCls} min-h-28 resize-y`}
          value={data.itemDescription}
          onChange={update("itemDescription")}
          placeholder={t("descriptionPlaceholder")}
        />
      </Field>
      <Field label={t("distinguishingFeatures")}>
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          value={data.distinguishingFeatures}
          onChange={update("distinguishingFeatures")}
          placeholder={t("distinguishingFeaturesPlaceholder")}
        />
      </Field>
    </div>
  );
}

function Step2({ data, update, errors, t }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">{t("step2Title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("step2Subtitle")}</p>
      </div>
      <Field label={t("locationType")} required error={errors.locationType}>
        <select
          className={inputCls}
          value={data.locationType}
          onChange={update("locationType")}
        >
          <option value="">{t("locationTypePlaceholder")}</option>
          {LOCATIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {t(l.labelKey)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("specificLocation")}>
        <input
          type="text"
          className={inputCls}
          value={data.locationDetails}
          onChange={update("locationDetails")}
          placeholder={t("specificLocationPlaceholder")}
        />
      </Field>
      <Field label={t("dateLost")} required error={errors.date}>
        <input
          type="date"
          className={inputCls}
          value={data.date}
          onChange={update("date")}
        />
      </Field>
      <Field label={t("dateConfidence")}>
        <select
          className={inputCls}
          value={data.dateConfidence}
          onChange={update("dateConfidence")}
        >
          {DATE_CONFIDENCE.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("timeOfDay")}>
        <select
          className={inputCls}
          value={data.time}
          onChange={update("time")}
        >
          {TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("additionalInfo")}>
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          value={data.notes}
          onChange={update("notes")}
          placeholder={t("additionalInfoPlaceholder")}
        />
      </Field>
    </div>
  );
}

function Summary({ data, t }) {
  const rows = [
    [t("summaryName"), data.fullName],
    [t("summaryEmail"), data.email],
    [t("summaryCategory"), labelFor(CATEGORIES, data.itemCategory, t)],
    [t("summaryBrandModel"), data.brandModel],
    [t("summaryColor"), data.color],
    [t("summaryDescription"), data.itemDescription],
    [t("summaryDistinguishingFeatures"), data.distinguishingFeatures],
    [t("summaryLocationType"), labelFor(LOCATIONS, data.locationType, t)],
    [t("summarySpecificLocation"), data.locationDetails],
    [t("summaryDateLost"), formatDate(data.date)],
    [t("summaryDateConfidence"), labelFor(DATE_CONFIDENCE, data.dateConfidence, t)],
    [t("summaryTimeOfDay"), labelFor(TIME_OPTIONS, data.time, t)],
    [t("summaryAdditionalInfo"), data.notes],
  ];
  return (
    <div className="mt-4 rounded-2xl border border-border bg-alt p-5 sm:p-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
        {t("reviewBeforeSubmitting")}
      </h3>
      <dl className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-3 gap-3 py-2.5 text-sm"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="col-span-2 break-words text-foreground">
              {v || <span className="text-muted/60">&mdash;</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SubmittedScreen({ email, caseNumber }) {
  const t = useTranslations("form");
  const tw = useTranslations("whatsapp");
  return (
    <div className="flex flex-1 flex-col">
      <Header variant="simple" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-accent ring-4 ring-emerald-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
          {t("submittedTitle")}
        </h1>
        <p className="mt-4 max-w-md text-lg text-body">
          {t("submittedNotifyPrefix")}
          {email ? (
            <>
              {" "}
              {t("submittedNotifyAt")}{" "}
              <span className="font-semibold text-foreground">{email}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-4 max-w-md text-base text-body">
          {t("submittedUnlockPrefix")}{" "}
          <span className="font-semibold text-foreground">
            ${plans.recovery.paymentPrice}
          </span>
          .
        </p>
        <p className="mt-3 font-serif text-xl tracking-tight">
          {t("submittedNoItemFoundLine1")}{" "}
          <span className="text-accent">{t("submittedNoItemFoundLine2")}</span>
        </p>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-border bg-alt px-6 py-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {t("submittedCaseRef")}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-foreground">
            {caseNumber}
          </p>
          <p className="mt-2 text-xs text-muted">
            {t("submittedSaveHint")}
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1ebe57] sm:w-auto"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39-.101 0-.237-.061-.386-.135-.897-.452-1.826-.975-2.744-1.487-.45-.252-.9-.504-1.35-.756-.45-.252-.9-.504-1.3-.806-.4-.302-.7-.604-1-.906-.3-.302-.6-.604-.9-.906-.3-.302-.55-.604-.7-.906-.15-.302-.25-.604-.25-.856 0-.252.1-.504.3-.705.2-.202.45-.353.7-.504.25-.151.5-.252.7-.302.2-.05.4-.05.5-.05.15 0 .3.05.45.151.15.101.25.252.35.403.1.151.2.302.25.453.05.151.1.302.1.403 0 .101-.05.202-.15.302-.1.101-.2.202-.35.302-.15.101-.25.202-.3.302-.05.101-.05.202 0 .353.1.302.3.604.5.856.2.252.5.554.75.806.25.252.5.504.8.705.3.202.6.353.85.453.25.101.5.151.65.151.15 0 .3-.05.4-.151.1-.101.25-.252.4-.403.15-.151.25-.302.4-.403.15-.101.3-.151.5-.101.2.05.45.151.75.302.3.151.55.302.75.453.2.151.35.252.4.302.05.05.05.202-.05.403zM16 2C8.268 2 2 8.268 2 16c0 2.47.64 4.79 1.766 6.807L2 30l7.326-1.735A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.648c-2.087 0-4.034-.608-5.676-1.658l-.407-.24-4.22.998 1.002-4.11-.266-.42A11.597 11.597 0 0 1 4.351 16C4.351 9.573 9.573 4.35 16 4.35c6.428 0 11.65 5.223 11.65 11.65 0 6.426-5.222 11.648-11.65 11.648z" />
            </svg>
            {tw("chatWithUs")}
          </a>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-alt sm:w-auto"
          >
            {t("submittedBackHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}
