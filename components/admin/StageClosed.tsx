import SummaryLine from "@/components/admin/SummaryLine";
import DetailsBlock from "@/components/admin/DetailsBlock";

export default function StageClosed({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
        Not Found — Case closed
      </div>
      <SummaryLine report={report} />
      <DetailsBlock report={report} />
      <p className="rounded-xl border border-border bg-alt px-4 py-3 text-sm text-body">
        The &ldquo;no item found&rdquo; email has been sent to the customer.
        No charge was made.
      </p>
    </div>
  );
}
