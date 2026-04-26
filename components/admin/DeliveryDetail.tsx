"use client";

import { useState } from "react";
import {
  PROCESS_STAGES,
  normalizeStageKey,
} from "@/lib/process-stages";
import ProcessTracker from "@/components/admin/ProcessTracker";
import StagePickup, { type SubStage } from "@/components/admin/StagePickup";
import DeliveryPanel from "@/components/admin/DeliveryPanel";
import type { StatusMsg } from "@/components/admin/StatusPill";
import { adminFetch } from "@/lib/admin-fetch";

// The phase-2 half of the old CaseDetail, lifted into Deliveries.
// Owns delivery-specific form state (pickup time, shipping quote,
// tracking, etc.) and the StagePickup router. ProcessTracker renders
// the delivery progress bar.

const PICKUP_STAGES: SubStage[] = [
  "pickup_scheduled",
  "picked_up",
  "shipping_quote",
  "quote_accepted",
  "shipped",
  "delivered",
];

type DeliveryDetailProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

export default function DeliveryDetail({
  report,
  password,
  onUnauthorized,
  onUpdate,
}: DeliveryDetailProps) {
  const [trackingNumber, setTrackingNumber] = useState(
    report.tracking_number || ""
  );
  const [shippingMethod, setShippingMethod] = useState(
    report.shipping_method || ""
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    report.estimated_delivery || ""
  );
  const [pickupScheduledAt, setPickupScheduledAt] = useState(
    report.pickup_scheduled_at || ""
  );
  const [shippingQuoteAmount, setShippingQuoteAmount] = useState(
    report.shipping_quote_amount || ""
  );
  const [shippingQuoteNotes, setShippingQuoteNotes] = useState(
    report.shipping_quote_notes || ""
  );

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<StatusMsg | null>(null);
  const [stageMoving, setStageMoving] = useState(false);
  const [stageMsg, setStageMsg] = useState<StatusMsg | null>(null);
  const [shipping, setShipping] = useState(false);

  const currentStage = normalizeStageKey(report.process_stage);

  const advanceToStage = async (stageKey: string) => {
    if (stageMoving) return;
    const stage = PROCESS_STAGES.find((s: any) => s.key === stageKey);
    if (!stage) return;
    setStageMoving(true);
    setStageMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; report: any; error?: string }>(
        `/api/admin/reports/${report.id}`,
        {
          method: "PATCH",
          body: { process_stage: stage.key, status: stage.status },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Failed");
      onUpdate(json.report);
    } catch (err: any) {
      setStageMsg({ kind: "err", text: err.message });
    } finally {
      setStageMoving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; report: any; error?: string }>(
        `/api/admin/reports/${report.id}`,
        {
          method: "PATCH",
          body: {
            tracking_number: trackingNumber,
            shipping_method: shippingMethod,
            estimated_delivery: estimatedDelivery,
            pickup_scheduled_at: pickupScheduledAt,
            shipping_quote_amount: shippingQuoteAmount,
            shipping_quote_notes: shippingQuoteNotes,
          },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Save failed");
      onUpdate(json.report);
      setSaveMsg({ kind: "ok", text: "Saved." });
    } catch (err: any) {
      setSaveMsg({ kind: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkShipped = async () => {
    if (shipping) return;
    setShipping(true);
    setStageMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        "/api/admin/mark-shipped",
        {
          method: "POST",
          body: { caseNumber: report.case_number },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Failed");
      // Refresh just this case from the list endpoint.
      try {
        const fresh = await adminFetch<{ ok: boolean; reports: any[] }>(
          `/api/admin/reports`,
          { password }
        );
        const updated = (fresh.reports || []).find(
          (r: any) => r.id === report.id
        );
        if (updated) onUpdate(updated);
      } catch {
        // Refresh failure shouldn't block the success message.
      }
      setStageMsg({ kind: "ok", text: "Marked as shipped." });
    } catch (err: any) {
      setStageMsg({ kind: "err", text: err.message });
    } finally {
      setShipping(false);
    }
  };

  const isPickupStage = (PICKUP_STAGES as string[]).includes(currentStage);

  // Map current sub-stage to the next one for the StagePickup advance button.
  const pickupAdvanceMap: Record<SubStage, string> = {
    pickup_scheduled: "picked_up",
    picked_up: "shipping_quote",
    shipping_quote: "quote_accepted",
    quote_accepted: "shipped",
    shipped: "delivered",
    delivered: "completed",
  };

  return (
    <div className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
      <ProcessTracker
        report={report}
        password={password}
        onUnauthorized={onUnauthorized}
        onUpdate={onUpdate}
        phase="delivery"
      />

      {currentStage === "paid" && (
        <div className="rounded-2xl border border-border bg-alt p-5 text-sm text-body">
          Case is paid and ready for pickup. Click{" "}
          <strong className="text-foreground">Pickup Scheduled</strong> on the
          tracker above to start the delivery flow.
        </div>
      )}

      {isPickupStage && (
        <StagePickup
          subStage={currentStage as SubStage}
          report={report}
          password={password}
          onUnauthorized={onUnauthorized}
          onUpdate={onUpdate}
          pickupScheduledAt={pickupScheduledAt}
          setPickupScheduledAt={setPickupScheduledAt}
          shippingQuoteAmount={shippingQuoteAmount}
          setShippingQuoteAmount={setShippingQuoteAmount}
          shippingQuoteNotes={shippingQuoteNotes}
          setShippingQuoteNotes={setShippingQuoteNotes}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          shippingMethod={shippingMethod}
          setShippingMethod={setShippingMethod}
          estimatedDelivery={estimatedDelivery}
          setEstimatedDelivery={setEstimatedDelivery}
          onSave={handleSave}
          saving={saving}
          saveMsg={saveMsg}
          onMarkShipped={handleMarkShipped}
          shipping={shipping}
          onAdvance={() =>
            advanceToStage(pickupAdvanceMap[currentStage as SubStage])
          }
          stageMoving={stageMoving}
          stageMsg={stageMsg}
        />
      )}

      {currentStage === "completed" && (
        <div className="rounded-2xl border border-accent/30 bg-emerald-50 p-5 text-sm text-accent">
          Delivery complete. Case is marked as completed.
        </div>
      )}

      <DeliveryPanel
        report={report}
        password={password}
        onUnauthorized={onUnauthorized}
      />
    </div>
  );
}
