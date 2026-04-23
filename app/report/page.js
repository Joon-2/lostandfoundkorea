"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import Header from "@/components/Header";
import { formatDate } from "@/lib/format";
import {
  CATEGORIES,
  LOCATIONS,
  TIME_OPTIONS,
  DATE_CONFIDENCE,
} from "@/lib/constants";
import { plans } from "@/config/plans";

const PLAN_OPTIONS = [
  {
    value: "recovery",
    title: plans.recovery.name,
    tagline: `FREE to start, $${plans.recovery.paymentPrice} when found`,
  },
  {
    value: "all_in_one",
    title: plans.all_in_one.name,
    tagline: `FREE to start, $${plans.all_in_one.priceSeoul} when found (includes pickup & delivery)`,
  },
];

const TOTAL_STEPS = 2;

const ITEM_CATEGORIES = CATEGORIES.map((c) => c.value);
const DATE_CONFIDENCE_OPTIONS = DATE_CONFIDENCE;
const TIME_OF_DAY_OPTIONS = TIME_OPTIONS;
const LOCATION_TYPES = LOCATIONS;

const STEP_LABELS = {
  1: "You & your item",
  2: "Where & when",
};

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
  dateConfidence: DATE_CONFIDENCE[0],
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

function validateStep(step, data) {
  const errors = {};
  if (step === 1) {
    if (!data.fullName.trim()) errors.fullName = "Required";
    if (!data.email.trim()) errors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errors.email = "Enter a valid email address";
    if (!data.itemCategory) errors.itemCategory = "Required";
    if (!data.itemDescription.trim()) errors.itemDescription = "Required";
  }
  if (step === 2) {
    if (!data.locationType) errors.locationType = "Required";
    if (!data.date) errors.date = "Required";
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
  const searchParams = useSearchParams();
  const initialPlan =
    searchParams.get("plan") === "all_in_one" ? "all_in_one" : "recovery";

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
    const e = validateStep(step, data);
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
    const e = validateStep(step, data);
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
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error("Submit fetch failed:", err);
      setSubmitError("Something went wrong, please try again.");
      setSubmitting(false);
      return;
    }

    if (res.status === 429) {
      setSubmitError(
        "Too many submissions from this network. Please try again later."
      );
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
      setSubmitError("Something went wrong, please try again.");
      setSubmitting(false);
      return;
    }

    console.log("Calling email API for case:", result.caseNumber);
    try {
      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName.trim(),
          email: data.email.trim(),
          caseNumber: result.caseNumber,
          category: data.itemCategory,
          itemDescription: data.itemDescription.trim(),
          location: data.locationType,
        }),
      });
      const emailJson = await emailRes.json().catch(() => ({}));
      console.log("Email API response:", {
        status: emailRes.status,
        body: emailJson,
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
            Cancel
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Step {step} of {TOTAL_STEPS}
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
            />
          )}
          {step === 2 && (
            <Step2 data={data} update={update} errors={errors} />
          )}
        </div>

        {step === TOTAL_STEPS && <Summary data={data} />}

        {submitError && step === TOTAL_STEPS && (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">Submission failed</p>
            <p className="mt-1 text-red-700">{submitError}</p>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="mt-3 inline-flex items-center rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
            >
              Try again
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
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Continue &rarr;
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
                  <span>Submitting…</span>
                </>
              ) : (
                <span>Submit report</span>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function PlanPicker({ plan, setPlan }) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-foreground">
        Choose your plan
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLAN_OPTIONS.map((opt) => {
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

function Step1({ data, update, errors, setPlan }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">You & your item</h2>
        <p className="mt-1 text-sm text-muted">
          Tell us how to reach you and what you lost.
        </p>
      </div>
      <PlanPicker plan={data.plan} setPlan={setPlan} />
      <Field label="Name" required error={errors.fullName}>
        <input
          type="text"
          className={inputCls}
          value={data.fullName}
          onChange={update("fullName")}
          placeholder="Jane Smith"
        />
      </Field>
      <Field label="Email" required error={errors.email}>
        <input
          type="email"
          className={inputCls}
          value={data.email}
          onChange={update("email")}
          placeholder="you@example.com"
        />
      </Field>
      <Field label="Category" required error={errors.itemCategory}>
        <select
          className={inputCls}
          value={data.itemCategory}
          onChange={update("itemCategory")}
        >
          <option value="">Select category</option>
          {ITEM_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Brand / Model (optional)">
          <input
            type="text"
            className={inputCls}
            value={data.brandModel}
            onChange={update("brandModel")}
            placeholder="e.g. iPhone 15 Pro, Louis Vuitton"
          />
        </Field>
        <Field label="Color (optional)">
          <input
            type="text"
            className={inputCls}
            value={data.color}
            onChange={update("color")}
            placeholder="e.g. Black"
          />
        </Field>
      </div>
      <Field
        label="Brief item description"
        required
        error={errors.itemDescription}
      >
        <textarea
          className={`${inputCls} min-h-28 resize-y`}
          value={data.itemDescription}
          onChange={update("itemDescription")}
          placeholder="What it looks like, what's inside, model number, etc."
        />
      </Field>
      <Field label="Distinguishing features (optional)">
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          value={data.distinguishingFeatures}
          onChange={update("distinguishingFeatures")}
          placeholder="Any unique marks, stickers, engravings, or contents that would help identify it"
        />
      </Field>
    </div>
  );
}

function Step2({ data, update, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Where & when</h2>
        <p className="mt-1 text-sm text-muted">
          The last place you remember having it.
        </p>
      </div>
      <Field label="Location type" required error={errors.locationType}>
        <select
          className={inputCls}
          value={data.locationType}
          onChange={update("locationType")}
        >
          <option value="">Select type</option>
          {LOCATION_TYPES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Specific location (optional)">
        <input
          type="text"
          className={inputCls}
          value={data.locationDetails}
          onChange={update("locationDetails")}
          placeholder="e.g. Line 2, Hongik Univ Station, exit 9"
        />
      </Field>
      <Field label="Date lost" required error={errors.date}>
        <input
          type="date"
          className={inputCls}
          value={data.date}
          onChange={update("date")}
        />
      </Field>
      <Field label="How sure are you about this date?">
        <select
          className={inputCls}
          value={data.dateConfidence}
          onChange={update("dateConfidence")}
        >
          {DATE_CONFIDENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Time of day (optional)">
        <select
          className={inputCls}
          value={data.time}
          onChange={update("time")}
        >
          {TIME_OF_DAY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Additional info (optional)">
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          value={data.notes}
          onChange={update("notes")}
          placeholder="Anything else — were you with someone? Did you contact any staff?"
        />
      </Field>
    </div>
  );
}

function Summary({ data }) {
  const rows = [
    ["Name", data.fullName],
    ["Email", data.email],
    ["Category", data.itemCategory],
    ["Brand / Model", data.brandModel],
    ["Color", data.color],
    ["Description", data.itemDescription],
    ["Distinguishing features", data.distinguishingFeatures],
    ["Location type", data.locationType],
    ["Specific location", data.locationDetails],
    ["Date lost", formatDate(data.date)],
    ["Date confidence", data.dateConfidence],
    ["Time of day", data.time],
    ["Additional info", data.notes],
  ];
  return (
    <div className="mt-4 rounded-2xl border border-border bg-alt p-5 sm:p-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
        Review before submitting
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
          Report Submitted &mdash; We&rsquo;re On It
        </h1>
        <p className="mt-4 max-w-md text-lg text-body">
          Our team will search for your item and notify you
          {email ? (
            <>
              {" "}
              at <span className="font-semibold text-foreground">{email}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-4 max-w-md text-base text-body">
          If we find it, you can unlock the full details for just{" "}
          <span className="font-semibold text-foreground">${plans.recovery.paymentPrice}</span>.
        </p>
        <p className="mt-3 font-serif text-xl tracking-tight">
          No item found?{" "}
          <span className="text-accent">You pay nothing.</span>
        </p>

        <div className="mt-8 w-full max-w-sm rounded-2xl border border-border bg-alt px-6 py-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            Case reference
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-foreground">
            {caseNumber}
          </p>
          <p className="mt-2 text-xs text-muted">
            Save this number to track your case.
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
            Chat with us on WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-alt sm:w-auto"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
