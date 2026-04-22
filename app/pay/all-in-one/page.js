"use client";

import Link from "next/link";
import { useState } from "react";
import { WHATSAPP_URL } from "@/components/WhatsApp";

const ITEM_CATEGORIES = [
  "Phone / Electronics",
  "Bag / Wallet",
  "Passport / ID",
  "Keys",
  "Clothing / Accessories",
  "Other",
];

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initial = {
  fullName: "",
  email: "",
  itemCategory: "",
  itemDescription: "",
  location: "",
  date: "",
  shippingAddress: "",
  notes: "",
};

export default function AllInOnePage() {
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(null);

  const update = (key) => (e) => {
    setData((d) => ({ ...d, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!data.fullName.trim()) e.fullName = "Required";
    if (!data.email.trim()) e.email = "Required";
    else if (!EMAIL_RE.test(data.email)) e.email = "Enter a valid email";
    if (!data.itemCategory) e.itemCategory = "Required";
    if (!data.itemDescription.trim()) e.itemDescription = "Required";
    if (!data.location.trim()) e.location = "Required";
    if (!data.date) e.date = "Required";
    if (!data.shippingAddress.trim()) e.shippingAddress = "Required";
    return e;
  };

  const submit = async () => {
    if (submitting) return;
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit-all-in-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setSubmitError(
          "Too many submissions from this network. Please try again later."
        );
        return;
      }
      if (!res.ok || !json.ok || !json.caseNumber) {
        console.error("submit-all-in-one failed:", json);
        setSubmitError("Something went wrong, please try again.");
        return;
      }
      setSubmitted({ caseNumber: json.caseNumber });
    } catch (err) {
      console.error("submit-all-in-one fetch failed:", err);
      setSubmitError("Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessScreen email={data.email} caseNumber={submitted.caseNumber} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-white"
          >
            Lost & Found Korea
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-300 transition-colors hover:text-white"
          >
            Need help?
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          All-in-One request
        </p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">
          Tell us about your lost item
        </h1>
        <p className="mt-2 text-body">
          We&rsquo;ll start searching in Korean immediately. Payment of{" "}
          <strong className="text-foreground">$79</strong> (Seoul/Gyeonggi) or{" "}
          <strong className="text-foreground">$99</strong> (other regions) is
          requested only after we locate your item.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
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
            <Field
              label="Item description"
              required
              error={errors.itemDescription}
            >
              <textarea
                className={`${inputCls} min-h-28 resize-y`}
                value={data.itemDescription}
                onChange={update("itemDescription")}
                placeholder="Brand, model, color, distinguishing features, what's inside, etc."
              />
            </Field>
            <Field
              label="Where did you lose it?"
              required
              error={errors.location}
            >
              <textarea
                className={`${inputCls} min-h-20 resize-y`}
                value={data.location}
                onChange={update("location")}
                placeholder="e.g. Hongdae area, Subway Line 2, around 3pm"
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
            <Field
              label="Shipping address"
              required
              error={errors.shippingAddress}
            >
              <textarea
                className={`${inputCls} min-h-24 resize-y`}
                value={data.shippingAddress}
                onChange={update("shippingAddress")}
                placeholder="Full address including country and postal code (we ship domestically and internationally)."
              />
            </Field>
            <Field label="Additional notes (optional)">
              <textarea
                className={`${inputCls} min-h-20 resize-y`}
                value={data.notes}
                onChange={update("notes")}
                placeholder="Anything else that might help us find it."
              />
            </Field>
          </div>

          {submitError && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </p>
          )}

          <button
            onClick={submit}
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
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

function SuccessScreen({ email, caseNumber }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-white"
          >
            Lost & Found Korea
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-accent ring-4 ring-emerald-100">
          <svg
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
          Request received
        </h1>
        <p className="mt-4 max-w-md text-lg text-body">
          We&rsquo;ll start searching immediately and contact you within 24
          hours
          {email ? (
            <>
              {" "}
              at <span className="font-semibold text-foreground">{email}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-4 max-w-md text-base text-body">
          Payment of{" "}
          <span className="font-semibold text-foreground">$79</span> (Seoul/
          Gyeonggi) or{" "}
          <span className="font-semibold text-foreground">$99</span> (other
          regions) will be requested once we locate your item.
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

        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-border bg-card px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-alt"
        >
          Back to Home
        </Link>
      </main>
    </div>
  );
}
