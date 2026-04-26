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
import { adminFetch } from "@/lib/admin-fetch";
import type { StagePickupProps } from "@/components/admin/stage-pickup/shared";
import Delivered from "@/components/admin/stage-pickup/Delivered";
import Shipped from "@/components/admin/stage-pickup/Shipped";
import QuoteAccepted from "@/components/admin/stage-pickup/QuoteAccepted";
import ShippingQuote from "@/components/admin/stage-pickup/ShippingQuote";
import PickedUp from "@/components/admin/stage-pickup/PickedUp";

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





