"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import PhotoManager from "@/components/admin/PhotoManager";
import type { StagePickupProps } from "./shared";

export default function PickedUp({
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
