import { formatDate } from "@/lib/format";
import { plans } from "@/config/plans";

export default function SummaryRow({ report }: { report: any }) {
  const plan =
    report.plan === "all_in_one"
      ? `${plans.all_in_one.name} ($${plans.all_in_one.priceSeoul})`
      : `${plans.recovery.name} ($${plans.recovery.paymentPrice})`;
  const items: [string, string][] = [
    ["Case", report.case_number || "—"],
    ["Item", report.category || "—"],
    ["Location", report.location || "—"],
    ["Plan", plan],
    ["Submitted", formatDate(report.created_at) || "—"],
  ];
  return (
    <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-alt px-4 py-3 text-sm sm:grid-cols-5">
      {items.map(([k, v]) => (
        <div key={k}>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {k}
          </div>
          <div className="mt-0.5 break-words font-medium text-foreground">
            {v}
          </div>
        </div>
      ))}
    </div>
  );
}
