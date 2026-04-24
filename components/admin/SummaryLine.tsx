export default function SummaryLine({ report }: { report: any }) {
  const parts = [
    report.case_number,
    report.category,
    report.color,
    report.location,
  ].filter(Boolean);
  return (
    <p className="mb-5 rounded-xl border border-border bg-alt px-4 py-2 text-sm text-body">
      <span className="font-medium text-foreground">
        {report.name || "Customer"}
      </span>{" "}
      · {parts.join(" · ") || "—"}
    </p>
  );
}
