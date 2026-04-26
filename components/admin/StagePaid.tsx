"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import RecoveryReadonly from "@/components/admin/RecoveryReadonly";
import { plans } from "@/config/plans";

type StagePaidProps = {
  report: any;
  deliveryRequired: boolean;
  onComplete: () => void;
  stageMoving: boolean;
  stageMsg: StatusMsg | null;
};

// On the Reports page this is the last action surface for a paid case.
// For non-delivery cases admin still closes them out here. For delivery
// cases the next step (pickup → ship → deliver) lives on the Deliveries
// page; CaseDetail renders a "View delivery" link separately.

export default function StagePaid({
  report,
  deliveryRequired,
  onComplete,
  stageMoving,
  stageMsg,
}: StagePaidProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="emerald">
        <strong className="font-semibold">Payment received.</strong>{" "}
        {report.paypal_transaction_id ? (
          <>
            Transaction{" "}
            <span className="font-mono text-xs">
              {report.paypal_transaction_id}
            </span>
            .
          </>
        ) : (
          "No transaction ID on file."
        )}
      </StageBanner>
      <SummaryLine report={report} />
      <RecoveryReadonly report={report} />
      {Array.isArray(report.found_images) && report.found_images.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Found Item Photos
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {report.found_images.map((src: string, i: number) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-lg border border-border bg-alt"
              >
                <img
                  src={src}
                  alt={`Found photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      {deliveryRequired ? (
        <div className="rounded-2xl border border-border bg-alt p-5 text-sm text-body">
          {report.plan === "all_in_one"
            ? "All-in-One plan — we pick up and deliver."
            : report.pickup_addon_transaction_id
            ? `Pickup add-on purchased (+$${plans.pickup_addon.price}).`
            : "Delivery Only case."}{" "}
          The next steps (pickup, shipping quote, tracking) live in the
          Deliveries section.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-alt p-5 text-sm text-body">
          Recovery plan — the customer collects the item themselves. Close the
          case when they&rsquo;ve picked it up.
          <div className="mt-4">
            <button
              onClick={onComplete}
              disabled={stageMoving}
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {stageMoving ? "Marking…" : "Mark as Completed"}
            </button>
          </div>
        </div>
      )}
      <StatusPill msg={stageMsg} />
    </div>
  );
}
