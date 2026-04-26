"use client";

import { useState } from "react";
import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import Field from "@/components/admin/Field";
import { inputCls } from "@/components/admin/styles";
import { adminFetch } from "@/lib/admin-fetch";
import type { StagePickupProps } from "./shared";

export default function Shipped({
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
      const trimmedTracking = trackingNumber.trim();
      const trimmedMethod = shippingMethod.trim();
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        "/api/email",
        {
          method: "POST",
          body: {
            type: "tracking",
            to: report.email,
            caseNumber: report.case_number,
            data: {
              name: report.name,
              trackingNumber: trimmedTracking,
              shippingMethod: trimmedMethod,
              estimatedDelivery,
            },
            logAction: `Tracking info emailed to ${report.email} (${
              trimmedMethod || "shipment"
            }: ${trimmedTracking})`,
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
