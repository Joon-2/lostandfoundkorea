"use client";

// StagePickup is the Phase-2 router. The admin workflow has 6 granular
// sub-stages between "paid" (end of Phase 1) and "completed" (terminal):
// pickup_scheduled → picked_up → shipping_quote → quote_accepted →
// shipped → delivered. Each sub-stage renders different UI with its own
// form fields and email actions. The parent (CaseDetail) selects which
// sub-stage to render by passing `subStage`; this file owns all six.

import { useState } from "react";
import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import AuthorizationStatus from "@/components/admin/AuthorizationStatus";
import PhotoManager from "@/components/admin/PhotoManager";
import Field from "@/components/admin/Field";
import { inputCls } from "@/components/admin/styles";
import { formatDate } from "@/lib/format";
import { adminFetch } from "@/lib/admin-fetch";
import type { StagePickupProps } from "@/components/admin/stage-pickup/shared";

// SubStage is re-exported for back-compat with existing importers
// (DeliveryDetail). Once all sub-stages migrate to the new folder this
// file becomes a thin dispatcher and the type lives in stage-pickup/shared.
export type { SubStage } from "@/components/admin/stage-pickup/shared";

export default function StagePickup(props: StagePickupProps) {
  switch (props.subStage) {
    case "pickup_scheduled":
      return <PickupScheduled {...props} />;
    case "picked_up":
      return <PickedUp {...props} />;
    case "shipping_quote":
      return <ShippingQuote {...props} />;
    case "quote_accepted":
      return <QuoteAccepted {...props} />;
    case "shipped":
      return <Shipped {...props} />;
    case "delivered":
      return <Delivered {...props} />;
    default:
      return null;
  }
}

function PickupScheduled({
  report,
  pickupScheduledAt,
  setPickupScheduledAt,
  onSave,
  saving,
  saveMsg,
  onAdvance,
  stageMoving,
  stageMsg,
}: StagePickupProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Pickup scheduled.</strong> Confirm
        the pickup window with the holder, then collect the item.
      </StageBanner>
      <SummaryLine report={report} />
      <AuthorizationStatus report={report} />
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Pickup facility
        </h3>
        <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-alt text-sm">
          {([
            ["Location", report.recovery_location],
            ["Contact phone", report.recovery_contact],
            ["Operating hours", report.recovery_hours],
          ] as [string, any][]).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-3 gap-3 px-4 py-2.5 sm:grid-cols-4"
            >
              <dt className="text-muted">{k}</dt>
              <dd className="col-span-2 break-words text-foreground sm:col-span-3">
                {v || <span className="text-muted/60">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <Field label="Pickup date / time">
          <input
            type="text"
            className={inputCls}
            value={pickupScheduledAt}
            onChange={(e) => setPickupScheduledAt(e.target.value)}
            placeholder="e.g. Tue 2026-04-23, 14:00 KST"
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save pickup details"}
        </button>
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Item picked up →"}
        </button>
      </div>
      <StatusPill msg={saveMsg} />
      <StatusPill msg={stageMsg} />
    </div>
  );
}

function PickedUp({
  report,
  password,
  onUnauthorized,
  onUpdate,
  onAdvance,
  stageMoving,
  stageMsg,
}: StagePickupProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="emerald">
        <strong className="font-semibold">Item picked up.</strong> Upload an
        in-hand photo for the customer, then prepare a shipping quote.
      </StageBanner>
      <SummaryLine report={report} />
      <PhotoManager
        caseNumber={report.case_number}
        images={report.found_images}
        password={password}
        onUnauthorized={onUnauthorized}
        onChange={(next) => onUpdate({ ...report, found_images: next })}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Prepare shipping quote →"}
        </button>
      </div>
      <StatusPill msg={stageMsg} />
    </div>
  );
}

function ShippingQuote({
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

function QuoteAccepted({
  report,
  onAdvance,
  stageMoving,
  stageMsg,
}: StagePickupProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="emerald">
        <strong className="font-semibold">Quote accepted.</strong> Ship the
        item and enter the tracking details.
      </StageBanner>
      <SummaryLine report={report} />
      <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted">
              Agreed amount
            </div>
            <div className="mt-1 font-medium text-foreground">
              {report.shipping_quote_amount
                ? `$${report.shipping_quote_amount}`
                : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted">
              Shipping to
            </div>
            <div className="mt-1 whitespace-pre-wrap text-foreground">
              {report.shipping_address || "—"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Item shipped →"}
        </button>
      </div>
      <StatusPill msg={stageMsg} />
    </div>
  );
}

function Shipped({
  report,
  password,
  onUnauthorized,
  onUpdate,
  trackingNumber,
  setTrackingNumber,
  shippingMethod,
  setShippingMethod,
  estimatedDelivery,
  setEstimatedDelivery,
  onSave,
  saving,
  saveMsg,
  onMarkShipped,
  shipping,
  onAdvance,
  stageMoving,
  stageMsg,
}: StagePickupProps) {
  const [sendingTracking, setSendingTracking] = useState(false);
  const [trackingMsg, setTrackingMsg] = useState<StatusMsg | null>(null);

  const handleSendTracking = async () => {
    if (sendingTracking) return;
    if (!trackingNumber.trim()) {
      setTrackingMsg({ kind: "err", text: "Enter a tracking number first." });
      return;
    }
    setSendingTracking(true);
    setTrackingMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        "/api/admin/send-tracking",
        {
          method: "POST",
          body: {
            name: report.name,
            email: report.email,
            caseNumber: report.case_number,
            trackingNumber: trackingNumber.trim(),
            shippingMethod: shippingMethod.trim(),
            estimatedDelivery,
          },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Send failed");
      onUpdate({
        ...report,
        tracking_number: trackingNumber.trim(),
        shipping_method: shippingMethod.trim(),
        estimated_delivery: estimatedDelivery,
      });
      setTrackingMsg({
        kind: "ok",
        text: `Tracking email sent to ${report.email}.`,
      });
    } catch (err: any) {
      setTrackingMsg({ kind: "err", text: err.message });
    } finally {
      setSendingTracking(false);
    }
  };

  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Shipped.</strong> Log tracking info
        and email it to the customer.
      </StageBanner>
      <SummaryLine report={report} />
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Tracking details
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Tracking number">
            <input
              type="text"
              className={inputCls}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
            />
          </Field>
          <Field label="Shipping method">
            <input
              type="text"
              className={inputCls}
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
              placeholder="e.g. DHL Express, Korea Post EMS"
            />
          </Field>
          <Field label="Estimated delivery">
            <input
              type="date"
              className={inputCls}
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save tracking"}
        </button>
        <button
          onClick={onMarkShipped}
          disabled={shipping}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {shipping ? "Logging…" : "Log 'shipped' to activity"}
        </button>
        <button
          onClick={handleSendTracking}
          disabled={sendingTracking}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sendingTracking ? "Sending…" : "Send tracking email"}
        </button>
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Mark delivered →"}
        </button>
      </div>
      <StatusPill msg={saveMsg} />
      <StatusPill msg={trackingMsg} />
      <StatusPill msg={stageMsg} />
    </div>
  );
}

function Delivered({
  report,
  onAdvance,
  stageMoving,
  stageMsg,
}: StagePickupProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="emerald">
        <strong className="font-semibold">Delivered.</strong> Close the case
        once the customer confirms receipt.
      </StageBanner>
      <SummaryLine report={report} />
      <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5 text-sm">
        <dl className="divide-y divide-border">
          {([
            ["Tracking number", report.tracking_number],
            ["Shipping method", report.shipping_method],
            [
              "Estimated delivery",
              formatDate(report.estimated_delivery) ||
                report.estimated_delivery,
            ],
          ] as [string, any][]).map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-3 gap-3 py-2.5 sm:grid-cols-4"
            >
              <dt className="text-muted">{k}</dt>
              <dd className="col-span-2 break-words text-foreground sm:col-span-3">
                {v || <span className="text-muted/60">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Completing…" : "Mark as Completed →"}
        </button>
      </div>
      <StatusPill msg={stageMsg} />
    </div>
  );
}
