"use client";

import { useState } from "react";
import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import Field from "@/components/admin/Field";
import { inputCls } from "@/components/admin/styles";
import { adminFetch } from "@/lib/admin-fetch";
import type { StagePickupProps } from "./shared";

export default function ShippingQuote({
  report,
  password,
  onUnauthorized,
  onUpdate,
  shippingQuoteAmount,
  setShippingQuoteAmount,
  shippingQuoteNotes,
  setShippingQuoteNotes,
  onSave,
  saving,
  saveMsg,
  onAdvance,
  stageMoving,
  stageMsg,
}: StagePickupProps) {
  const [sending, setSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState<StatusMsg | null>(null);

  const handleSendQuote = async () => {
    if (sending) return;
    const trimmedAmount = (shippingQuoteAmount || "").trim();
    if (!trimmedAmount) {
      setEmailMsg({ kind: "err", text: "Enter a quote amount first." });
      return;
    }
    setSending(true);
    setEmailMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        "/api/admin/send-shipping-quote",
        {
          method: "POST",
          body: {
            name: report.name,
            email: report.email,
            caseNumber: report.case_number,
            amount: trimmedAmount,
            notes: shippingQuoteNotes,
            shippingAddress: report.shipping_address,
          },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Send failed");
      onUpdate({
        ...report,
        shipping_quote_amount: trimmedAmount,
        shipping_quote_notes: shippingQuoteNotes,
      });
      setEmailMsg({ kind: "ok", text: `Quote sent to ${report.email}.` });
    } catch (err: any) {
      setEmailMsg({ kind: "err", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Shipping quote.</strong> Calculate
        the cost, email the breakdown to the customer, and wait for their
        approval.
      </StageBanner>
      <SummaryLine report={report} />
      {report.shipping_address && (
        <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Shipping to
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
            {report.shipping_address}
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        <Field label="Quote amount (USD)">
          <input
            type="text"
            inputMode="decimal"
            className={inputCls}
            value={shippingQuoteAmount}
            onChange={(e) => setShippingQuoteAmount(e.target.value)}
            placeholder="e.g. 45"
          />
        </Field>
        <Field label="Breakdown / notes">
          <textarea
            className={`${inputCls} min-h-24 resize-y`}
            value={shippingQuoteNotes}
            onChange={(e) => setShippingQuoteNotes(e.target.value)}
            placeholder="e.g. EMS, 0.5 kg, small box, 5-7 business days to Tokyo."
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save quote draft"}
        </button>
        <button
          onClick={handleSendQuote}
          disabled={sending}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send quote email"}
        </button>
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Quote accepted →"}
        </button>
      </div>
      <StatusPill msg={saveMsg} />
      <StatusPill msg={emailMsg} />
      <StatusPill msg={stageMsg} />
    </div>
  );
}
