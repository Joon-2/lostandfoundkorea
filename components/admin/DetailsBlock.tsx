import { formatDate, formatDateTime } from "@/lib/format";
import { plans } from "@/config/plans";

export default function DetailsBlock({ report }: { report: any }) {
  const rows: [string, any][] = [
    ["Category", report.category],
    ["Brand / Model", report.brand_model],
    ["Color", report.color],
    ["Description", report.item_description],
    ["Distinguishing features", report.distinguishing_features],
    ["Location", report.location],
    ["Specific location", report.location_detail],
    [
      "Plan",
      report.plan === "all_in_one"
        ? `${plans.all_in_one.name} ($${plans.all_in_one.priceSeoul})`
        : `${plans.recovery.name} ($${plans.recovery.paymentPrice})`,
    ],
    ["Date lost", formatDate(report.date_lost)],
    ["Date confidence", report.date_confidence],
    ["Time of day", report.time_lost],
    ["Additional info", report.additional_info],
    ["Submitted", formatDateTime(report.created_at)],
  ];
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Submission
      </h3>
      <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-alt">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm sm:grid-cols-4"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="col-span-2 break-words text-foreground sm:col-span-3">
              {v || <span className="text-muted/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
