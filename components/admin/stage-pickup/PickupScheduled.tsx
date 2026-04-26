"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import AuthorizationStatus from "@/components/admin/AuthorizationStatus";
import Field from "@/components/admin/Field";
import { inputCls } from "@/components/admin/styles";
import type { StagePickupProps } from "./shared";

export default function PickupScheduled({
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
