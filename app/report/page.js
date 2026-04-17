"use client";

import Link from "next/link";
import { useState } from "react";

const TOTAL_STEPS = 4;

const ITEM_CATEGORIES = [
  "Phone",
  "Wallet",
  "Passport",
  "Camera",
  "Laptop / Tablet",
  "Bag / Backpack",
  "Jewelry / Watch",
  "Clothing",
  "Documents",
  "Other",
];

const LOCATION_TYPES = [
  "Subway / Train",
  "Bus",
  "Taxi",
  "Restaurant / Cafe",
  "Hotel",
  "Airport",
  "Shopping Mall",
  "Street / Park",
  "Tourist Attraction",
  "Other",
];

const NATIONALITIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Japan",
  "China",
  "Singapore",
  "Germany",
  "France",
  "Other",
];

const initialData = {
  fullName: "",
  email: "",
  phone: "",
  nationality: "",
  itemCategory: "",
  itemBrand: "",
  itemColor: "",
  itemDescription: "",
  itemValue: "",
  locationType: "",
  locationDetails: "",
  date: "",
  time: "",
  notes: "",
};

const labelCls = "block text-sm font-medium text-foreground mb-1.5";
const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors";
const errorCls = "mt-1.5 text-xs text-red-400";
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
  }
  if (step === 2) {
    if (!data.itemCategory) errors.itemCategory = "Required";
    if (!data.itemDescription.trim()) errors.itemDescription = "Required";
  }
  if (step === 3) {
    if (!data.locationType) errors.locationType = "Required";
    if (!data.date) errors.date = "Required";
  }
  return errors;
}

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
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

  const submit = () => {
    console.log("Lost and Found Korea — Report submitted:", data);
    setSubmitted(true);
  };

  if (submitted) return <SubmittedScreen email={data.email} />;

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Lost & Found Korea
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-muted">
              {step === 1 && "Contact info"}
              {step === 2 && "Item details"}
              {step === 3 && "Location & date"}
              {step === 4 && "Review"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-card">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
          {step === 1 && (
            <Step1 data={data} update={update} errors={errors} />
          )}
          {step === 2 && (
            <Step2 data={data} update={update} errors={errors} />
          )}
          {step === 3 && (
            <Step3 data={data} update={update} errors={errors} />
          )}
          {step === 4 && <Step4 data={data} />}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-40"
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
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Submit report
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function Step1({ data, update, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">
          Tell us about you
        </h2>
        <p className="mt-1 text-sm text-muted">
          So we can reach you when we find your item.
        </p>
      </div>
      <Field label="Full name" required error={errors.fullName}>
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
      <Field label="Phone (optional)">
        <input
          type="tel"
          className={inputCls}
          value={data.phone}
          onChange={update("phone")}
          placeholder="+1 555 123 4567"
        />
      </Field>
      <Field label="Nationality (optional)">
        <select
          className={inputCls}
          value={data.nationality}
          onChange={update("nationality")}
        >
          <option value="">Select country</option>
          {NATIONALITIES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Step2({ data, update, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">
          What did you lose?
        </h2>
        <p className="mt-1 text-sm text-muted">
          The more detail, the easier to identify.
        </p>
      </div>
      <Field label="Item category" required error={errors.itemCategory}>
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
        <Field label="Brand (optional)">
          <input
            type="text"
            className={inputCls}
            value={data.itemBrand}
            onChange={update("itemBrand")}
            placeholder="e.g. Apple, Samsung"
          />
        </Field>
        <Field label="Color (optional)">
          <input
            type="text"
            className={inputCls}
            value={data.itemColor}
            onChange={update("itemColor")}
            placeholder="e.g. Black"
          />
        </Field>
      </div>
      <Field label="Description" required error={errors.itemDescription}>
        <textarea
          className={`${inputCls} min-h-32 resize-y`}
          value={data.itemDescription}
          onChange={update("itemDescription")}
          placeholder="Distinguishing features, what's inside, scratches, stickers, model number, etc."
        />
      </Field>
      <Field label="Approximate value (optional)">
        <input
          type="text"
          className={inputCls}
          value={data.itemValue}
          onChange={update("itemValue")}
          placeholder="e.g. USD 800"
        />
      </Field>
    </div>
  );
}

function Step3({ data, update, errors }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">
          Where and when?
        </h2>
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
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date" required error={errors.date}>
          <input
            type="date"
            className={inputCls}
            value={data.date}
            onChange={update("date")}
          />
        </Field>
        <Field label="Time (optional)">
          <input
            type="time"
            className={inputCls}
            value={data.time}
            onChange={update("time")}
          />
        </Field>
      </div>
      <Field label="Additional information (optional)">
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          value={data.notes}
          onChange={update("notes")}
          placeholder="Anything else that might help us locate it."
        />
      </Field>
    </div>
  );
}

function Step4({ data }) {
  const sections = [
    {
      title: "Contact",
      rows: [
        ["Name", data.fullName],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Nationality", data.nationality],
      ],
    },
    {
      title: "Item",
      rows: [
        ["Category", data.itemCategory],
        ["Brand", data.itemBrand],
        ["Color", data.itemColor],
        ["Description", data.itemDescription],
        ["Approx. value", data.itemValue],
      ],
    },
    {
      title: "Location & date",
      rows: [
        ["Location type", data.locationType],
        ["Specific location", data.locationDetails],
        ["Date", data.date],
        ["Time", data.time],
        ["Notes", data.notes],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight">Review & submit</h2>
        <p className="mt-1 text-sm text-muted">
          Double-check the details before sending.
        </p>
      </div>
      {sections.map((s) => (
        <div key={s.title}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            {s.title}
          </h3>
          <dl className="divide-y divide-border/60 rounded-xl border border-border/60 bg-background/40">
            {s.rows.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-3 gap-3 px-4 py-3 text-sm"
              >
                <dt className="text-muted">{k}</dt>
                <dd className="col-span-2 break-words text-foreground">
                  {v || <span className="text-muted/60">&mdash;</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

function SubmittedScreen({ email }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Lost & Found Korea
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
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
          Report submitted
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted">
          We&rsquo;ll contact you within 24 hours via email
          {email ? (
            <>
              {" "}
              at <span className="text-foreground">{email}</span>
            </>
          ) : null}
          .
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          Back to home
        </Link>
      </main>
    </div>
  );
}
