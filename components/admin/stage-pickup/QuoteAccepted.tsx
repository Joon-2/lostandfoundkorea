"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import type { StagePickupProps } from "./shared";

export default function QuoteAccepted({
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
