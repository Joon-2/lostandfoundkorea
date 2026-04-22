"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { formatDate } from "@/lib/format";
import { WHATSAPP_URL } from "@/components/WhatsApp";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

export default function PayPage({ params }) {
  const { caseNumber } = use(params);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paying, setPaying] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/case/${caseNumber}`, { cache: "no-store" });
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
          />
        )}

        {!loading && !error && report && report.status === "paid" && (
          <PaidState report={report} />
        )}
      </main>
    </div>
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
}) {
  const paypalConfigured = Boolean(PAYPAL_CLIENT_ID);

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
        onPaid();
      } catch (err) {
        setPaymentError(err.message);
      } finally {
        setPaying(false);
      }
    },
    [report.case_number, onPaid, setPaying, setPaymentError]
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
          <p className="mt-3 text-body">
            Pay <strong className="text-foreground">$39</strong> to unlock the
            exact recovery location, contact info, and step-by-step English
            pickup instructions.
          </p>
          <p className="mt-2 text-sm text-muted">
            If this turns out not to be your item, we refund in full.
          </p>
        </div>
      </div>

      <SummaryCard report={report} />

      <div className="mt-6">
        {paypalConfigured ? (
          <PayPalScriptProvider
            options={{
              "client-id": PAYPAL_CLIENT_ID,
              currency: "USD",
              intent: "capture",
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

function PaidState({ report }) {
  const rows = [
    ["Location", report.recovery_location],
    ["Contact phone", report.recovery_contact],
    ["Operating hours", report.recovery_hours],
  ];
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

      <p className="mt-6 text-sm text-muted">
        Need help on location?{" "}
        <a
          href={WHATSAPP_URL}
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
