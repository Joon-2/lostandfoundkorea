"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatDate } from "@/lib/format";
import { WHATSAPP_URL } from "@/components/WhatsApp";
import Header from "@/components/Header";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

export default function PayPage({ params }) {
  const { caseNumber } = use(params);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${caseNumber}`, { cache: "no-store" });
      if (res.status === 404) {
        setError("not_found");
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        console.error("Fetch case failed:", json);
        setError(json.error || "Failed to load case");
        return;
      }
      setReport(json.report);
    } catch (err) {
      console.error("Fetch case exception:", err);
      setError(err?.message || "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [caseNumber]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="flex flex-1 flex-col">
      <Header
        variant="simple"
        action={
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#4a5568] transition-colors hover:text-black"
          >
            Need help?
          </a>
        }
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Case reference
        </p>
        <h1 className="mt-1 font-mono text-2xl font-semibold tracking-wider text-foreground">
          {caseNumber}
        </h1>

        {loading && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-muted">Loading case…</p>
          </div>
        )}

        {!loading && error === "not_found" && (
          <Panel>
            <h2 className="font-serif text-2xl tracking-tight">
              Case not found
            </h2>
            <p className="mt-3 text-body">
              We couldn&rsquo;t locate a case with that reference. Please
              double-check the link from your email, or{" "}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                contact us on WhatsApp
              </a>
              .
            </p>
          </Panel>
        )}

        {!loading && error && error !== "not_found" && (
          <Panel tone="error">
            <h2 className="font-serif text-2xl tracking-tight">
              Something went wrong
            </h2>
            <p className="mt-3 text-body">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-5 inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt"
            >
              Try again
            </button>
          </Panel>
        )}

        {!loading && !error && report && report.status === "pending" && (
          <PendingState report={report} />
        )}

        {!loading && !error && report && report.status === "found" && (
          <FoundState
            report={report}
            paying={paying}
            setPaying={setPaying}
            paymentError={paymentError}
            setPaymentError={setPaymentError}
            onPaid={fetchReport}
            onReceipt={setReceipt}
          />
        )}

        {!loading && !error && report && report.status === "paid" && (
          <PaidState
            report={report}
            onRefresh={fetchReport}
            receipt={receipt}
          />
        )}

        {!loading && !error && report && report.status === "closed" && (
          <ClosedState />
        )}
      </main>
    </div>
  );
}

function AuthorizationUpload({ caseNumber, authorizationUrl, shippingAddress, onUploaded }) {
  const fileInputRef = useRef(null);
  const [legalName, setLegalName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [file, setFile] = useState(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postal, setPostal] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  const canSubmit =
    legalName.trim().length > 0 &&
    idNumber.trim().length > 0 &&
    Boolean(file) &&
    authorized &&
    street.trim().length > 0 &&
    city.trim().length > 0 &&
    country.trim().length > 0 &&
    postal.trim().length > 0 &&
    !uploading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("caseNumber", caseNumber);
      fd.append("legalName", legalName.trim());
      fd.append("idNumber", idNumber.trim());
      fd.append("authorized", "true");
      fd.append("shippingStreet", street.trim());
      fd.append("shippingCity", city.trim());
      fd.append("shippingCountry", country.trim());
      fd.append("shippingPostalCode", postal.trim());
      const res = await fetch("/api/upload-authorization", {
        method: "POST",
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        console.error("upload failed:", json);
        throw new Error(json.error || "Upload failed");
      }
      setMsg({ kind: "ok", text: "Authorization submitted." });
      setFile(null);
      setLegalName("");
      setIdNumber("");
      setAuthorized(false);
      setStreet("");
      setCity("");
      setCountry("");
      setPostal("");
      onUploaded?.();
    } catch (err) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const fieldCls =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h3 className="font-serif text-lg tracking-tight text-foreground">
        Authorization form
      </h3>
      <p className="mt-2 text-sm text-body">
        Provide your details and upload your ID so we can collect your item
        on your behalf. JPG, PNG, or PDF; up to 10 MB.
      </p>

      {authorizationUrl && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-accent">
          Authorization on file.{" "}
          <a
            href={authorizationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View
          </a>
        </p>
      )}
      {shippingAddress && (
        <div className="mt-3 rounded-lg bg-alt px-3 py-2 text-sm text-body">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Shipping to
          </span>
          <p className="mt-1 whitespace-pre-wrap text-foreground">
            {shippingAddress}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="auth-legal-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Full legal name (as shown on ID)
          </label>
          <input
            id="auth-legal-name"
            type="text"
            required
            autoComplete="name"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="e.g. Jane Alice Doe"
            className={fieldCls}
          />
        </div>

        <div>
          <label
            htmlFor="auth-id-number"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Passport / ID number
          </label>
          <input
            id="auth-id-number"
            type="text"
            required
            autoComplete="off"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="e.g. M12345678"
            className={fieldCls}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            ID photo
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="sr-only"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt"
            >
              <svg
                className="h-4 w-4 text-accent"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {file ? "Change file" : "Upload passport or ID photo"}
            </button>
            {file ? (
              <span className="truncate text-sm text-body" title={file.name}>
                {file.name}
              </span>
            ) : (
              <span className="text-sm text-muted">No file selected</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-alt p-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Shipping address
          </span>
          <p className="mt-1 text-sm text-body">
            Where should we ship your item once we collect it?
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="ship-street"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Street address
              </label>
              <input
                id="ship-street"
                type="text"
                required
                autoComplete="street-address"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 123 Main Street, Apt 4B"
                className={fieldCls}
              />
            </div>
            <div>
              <label
                htmlFor="ship-city"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                City
              </label>
              <input
                id="ship-city"
                type="text"
                required
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Tokyo"
                className={fieldCls}
              />
            </div>
            <div>
              <label
                htmlFor="ship-postal"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Postal code
              </label>
              <input
                id="ship-postal"
                type="text"
                required
                autoComplete="postal-code"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                placeholder="e.g. 100-0001"
                className={fieldCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="ship-country"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Country
              </label>
              <input
                id="ship-country"
                type="text"
                required
                autoComplete="country-name"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Japan"
                className={fieldCls}
              />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-none rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="leading-snug">
            I authorize Lost and Found Korea to collect this item on my behalf.
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {uploading ? "Submitting…" : "Submit authorization"}
        </button>
      </form>

      {msg && (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-accent"
              : "bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}

function ClosedState() {
  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className="mt-1 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </span>
        <div>
          <h2 className="font-serif text-2xl tracking-tight">
            This case has been closed
          </h2>
          <p className="mt-3 text-body">
            We were not able to locate your item. As promised, there is no
            charge.
          </p>
          <p className="mt-2 text-sm text-muted">
            Still have new information? Reply to our email or chat with us on
            WhatsApp.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function Panel({ children, tone }) {
  const toneCls =
    tone === "error"
      ? "border-red-200 bg-red-50"
      : "border-border bg-card";
  return (
    <div className={`mt-10 rounded-2xl border p-7 shadow-sm sm:p-8 ${toneCls}`}>
      {children}
    </div>
  );
}

function SummaryCard({ report }) {
  const rows = [
    ["Item", report.category],
    ["Description", report.item_description],
    ["Last seen", report.location],
    ["Date lost", formatDate(report.date_lost)],
  ];
  return (
    <div className="mt-6 rounded-2xl border border-border bg-alt p-5 sm:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Your submission
      </h3>
      <dl className="mt-3 divide-y divide-border">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-3 gap-3 py-2.5 text-sm">
            <dt className="text-muted">{k}</dt>
            <dd className="col-span-2 break-words text-foreground">
              {v || <span className="text-muted/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PendingState({ report }) {
  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className="mt-1 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>
        <div>
          <h2 className="font-serif text-2xl tracking-tight">
            Still searching
          </h2>
          <p className="mt-3 text-body">
            We&rsquo;re still searching for your item. We&rsquo;ll email you
            when we find it.
          </p>
          <p className="mt-3 text-sm text-muted">
            You&rsquo;ll only ever pay if we locate your item. No item found?
            You pay nothing.
          </p>
        </div>
      </div>
      <SummaryCard report={report} />
    </Panel>
  );
}

function FoundState({
  report,
  paying,
  setPaying,
  paymentError,
  setPaymentError,
  onPaid,
  onReceipt,
}) {
  const paypalConfigured = Boolean(PAYPAL_CLIENT_ID);
  const foundPhotos = Array.isArray(report.found_images)
    ? report.found_images
    : [];

  const createOrder = useCallback(async () => {
    setPaymentError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseNumber: report.case_number }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok || !json.id) {
        console.error("create-order failed:", json);
        throw new Error(json.error || "Failed to create PayPal order");
      }
      return json.id;
    } catch (err) {
      setPaymentError(err.message);
      setPaying(false);
      throw err;
    }
  }, [report.case_number, setPaying, setPaymentError]);

  const onApprove = useCallback(
    async (paypalData) => {
      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: paypalData.orderID,
            caseNumber: report.case_number,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          console.error("capture-order failed:", json);
          throw new Error(json.error || "Payment capture failed");
        }

        const amount = report.plan === "all_in_one" ? 79 : 39;
        const planLabel =
          report.plan === "all_in_one" ? "All-in-One" : "Recovery";
        const paidAt = new Date().toISOString();
        const transactionId = paypalData.orderID;
        onReceipt?.({ transactionId, amount, paidAt, planLabel });

        fetch("/api/send-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: report.name,
            email: report.email,
            caseNumber: report.case_number,
            amount,
            transactionId,
            paidAt,
            planLabel,
          }),
        }).catch((err) => console.error("send-receipt failed:", err));

        onPaid();
      } catch (err) {
        setPaymentError(err.message);
      } finally {
        setPaying(false);
      }
    },
    [
      report.case_number,
      report.plan,
      report.name,
      report.email,
      onPaid,
      onReceipt,
      setPaying,
      setPaymentError,
    ]
  );

  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className="mt-1 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-emerald-50 text-accent">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-2xl tracking-tight">
            Your item has been found
          </h2>
          {report.plan === "all_in_one" ? (
            <>
              <p className="mt-3 text-body">
                Pay <strong className="text-foreground">$79</strong> to unlock
                the recovery details and have your item picked up and shipped
                to your address.
              </p>
              <p className="mt-2 text-sm text-muted">
                Pickup &amp; delivery included. If this turns out not to be
                your item, we refund in full.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-body">
                Pay <strong className="text-foreground">$39</strong> to unlock
                the exact recovery location, contact info, and step-by-step
                English pickup instructions.
              </p>
              <p className="mt-2 text-sm text-muted">
                If this turns out not to be your item, we refund in full.
              </p>
            </>
          )}
        </div>
      </div>

      {foundPhotos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Found item photos
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {foundPhotos.map((src, i) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-border bg-alt"
              >
                <img
                  src={src}
                  alt={`Found item photo ${i + 1}`}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs italic text-muted">
            Photos taken by our team at the recovery location. Is this your
            item?
          </p>
        </div>
      )}

      <SummaryCard report={report} />

      <div className="mt-6">
        {paypalConfigured ? (
          <PayPalScriptProvider
            options={{
              "client-id": PAYPAL_CLIENT_ID,
              currency: "USD",
              intent: "capture",
              locale: "en_US",
            }}
          >
            <PayPalButtons
              disabled={paying}
              style={{ layout: "vertical", color: "gold", shape: "pill" }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={(err) => {
                console.error("PayPal button error:", err);
                setPaymentError("PayPal error. Please try again.");
                setPaying(false);
              }}
              onCancel={() => {
                setPaying(false);
              }}
            />
          </PayPalScriptProvider>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Payment is temporarily unavailable. Please contact us on WhatsApp.
          </p>
        )}

        {paymentError && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {paymentError}
          </p>
        )}
      </div>
    </Panel>
  );
}

function PaidState({ report, onRefresh, receipt }) {
  const rows = [
    ["Location", report.recovery_location],
    ["Contact phone", report.recovery_contact],
    ["Operating hours", report.recovery_hours],
  ];
  const mapsUrl = report.recovery_location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        report.recovery_location
      )}`
    : null;
  const photos = Array.isArray(report.found_images) ? report.found_images : [];
  const helpWhatsApp = `https://wa.me/821044921349?text=${encodeURIComponent(
    `Hi, I have a question about picking up my item. Case ${report.case_number}.`
  )}`;
  const addonPaid = Boolean(report.pickup_addon_transaction_id);
  const needsAuth = report.plan === "all_in_one" || addonPaid;

  const transactionId = receipt?.transactionId || report.paypal_transaction_id;
  const receiptAmount =
    receipt?.amount ??
    (report.plan === "all_in_one" ? 79 : 39);
  const receiptPlanLabel =
    receipt?.planLabel ||
    (report.plan === "all_in_one" ? "All-in-One" : "Recovery");

  return (
    <Panel>
      <div className="flex items-start gap-4">
        <span className="mt-1 inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-emerald-50 text-accent">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div>
          <h2 className="font-serif text-2xl tracking-tight">
            Payment complete
          </h2>
          <p className="mt-3 text-body">
            Here&rsquo;s everything you need to pick up your item.
          </p>
        </div>
      </div>

      {transactionId && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Payment receipt
          </h3>
          <dl className="mt-3 divide-y divide-border text-sm">
            <div className="grid grid-cols-3 gap-3 py-2.5 sm:grid-cols-4">
              <dt className="text-muted">Case reference</dt>
              <dd className="col-span-2 break-words font-mono text-foreground sm:col-span-3">
                {report.case_number}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-3 py-2.5 sm:grid-cols-4">
              <dt className="text-muted">Amount paid</dt>
              <dd className="col-span-2 font-medium text-foreground sm:col-span-3">
                ${receiptAmount}{" "}
                <span className="text-muted">({receiptPlanLabel})</span>
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-3 py-2.5 sm:grid-cols-4">
              <dt className="text-muted">Transaction ID</dt>
              <dd className="col-span-2 break-all font-mono text-xs text-foreground sm:col-span-3">
                {transactionId}
              </dd>
            </div>
            {receipt?.paidAt && (
              <div className="grid grid-cols-3 gap-3 py-2.5 sm:grid-cols-4">
                <dt className="text-muted">Date</dt>
                <dd className="col-span-2 text-foreground sm:col-span-3">
                  {formatDate(receipt.paidAt) || receipt.paidAt}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-3 text-sm text-muted">
            A receipt has been sent to your email.
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Your recovered item
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((src, i) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-border bg-alt"
              >
                <img
                  src={src}
                  alt={`Recovered item photo ${i + 1}`}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-alt p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Pickup details
        </h3>
        <dl className="mt-3 divide-y divide-border">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-3 py-2.5 text-sm">
              <dt className="text-muted">{k}</dt>
              <dd className="col-span-2 break-words text-foreground">
                {v || <span className="text-muted/60">—</span>}
              </dd>
            </div>
          ))}
        </dl>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card/70"
          >
            <svg
              className="h-4 w-4 text-accent"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Open in Google Maps
          </a>
        )}
      </div>

      {report.recovery_instructions && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            English pickup instructions
          </h3>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {report.recovery_instructions}
          </p>
        </div>
      )}

      {needsAuth ? (
        <>
          {addonPaid && (
            <div className="mt-6 rounded-2xl border border-accent/30 bg-emerald-50 px-5 py-3 text-sm text-accent">
              <strong className="font-semibold">Pickup add-on paid.</strong>{" "}
              Complete the authorization below so we can collect and ship your
              item.
            </div>
          )}
          <AuthorizationUpload
            caseNumber={report.case_number}
            authorizationUrl={report.authorization_url}
            shippingAddress={report.shipping_address}
            onUploaded={onRefresh}
          />
        </>
      ) : (
        <PickupUpsell
          caseNumber={report.case_number}
          onPaid={onRefresh}
        />
      )}

      <p className="mt-6 text-sm text-muted">
        Questions?{" "}
        <a
          href={helpWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          Chat with us on WhatsApp
        </a>
        .
      </p>
    </Panel>
  );
}

function PickupUpsell({ caseNumber, onPaid }) {
  const paypalConfigured = Boolean(PAYPAL_CLIENT_ID);
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState(null);

  const createOrder = useCallback(async () => {
    setErr(null);
    setPaying(true);
    try {
      const res = await fetch("/api/paypal/pickup-addon/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseNumber }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok || !json.id) {
        throw new Error(json.error || "Failed to start pickup checkout");
      }
      return json.id;
    } catch (e) {
      setErr(e.message);
      setPaying(false);
      throw e;
    }
  }, [caseNumber]);

  const onApprove = useCallback(
    async (paypalData) => {
      try {
        const res = await fetch("/api/paypal/pickup-addon/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: paypalData.orderID,
            caseNumber,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          throw new Error(json.error || "Pickup capture failed");
        }
        onPaid?.();
      } catch (e) {
        setErr(e.message);
      } finally {
        setPaying(false);
      }
    },
    [caseNumber, onPaid]
  );

  return (
    <div className="mt-6 rounded-2xl border border-accent/30 bg-emerald-50 p-5 sm:p-6">
      <h3 className="font-serif text-lg tracking-tight text-foreground">
        Need help picking it up?
      </h3>
      <p className="mt-2 text-sm text-body">
        Add <strong className="text-foreground">Pickup &amp; Delivery</strong>{" "}
        for just <strong className="text-foreground">+$49</strong> more. We&rsquo;ll
        collect the item on your behalf and ship it straight to you.
      </p>
      <p className="mt-2 text-xs text-muted">
        Charged only if you agree &mdash; no impact on your $39 recovery
        payment.
      </p>
      <div className="mt-4">
        {paypalConfigured ? (
          <PayPalScriptProvider
            options={{
              "client-id": PAYPAL_CLIENT_ID,
              currency: "USD",
              intent: "capture",
              locale: "en_US",
            }}
          >
            <PayPalButtons
              disabled={paying}
              style={{
                layout: "horizontal",
                color: "gold",
                shape: "pill",
                label: "pay",
                tagline: false,
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={(e) => {
                console.error("PayPal pickup error:", e);
                setErr("PayPal error. Please try again.");
                setPaying(false);
              }}
              onCancel={() => setPaying(false)}
            />
          </PayPalScriptProvider>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Pickup checkout is temporarily unavailable. Please contact us on
            WhatsApp.
          </p>
        )}
        {err && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </p>
        )}
      </div>
    </div>
  );
}
