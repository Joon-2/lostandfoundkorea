"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import { formatDate } from "@/lib/format";
import type { StagePickupProps } from "./shared";

export default function Delivered({
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
