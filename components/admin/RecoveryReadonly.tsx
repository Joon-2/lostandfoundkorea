export default function RecoveryReadonly({ report }: { report: any }) {
  const items: [string, any][] = [
    ["Recovery location", report.recovery_location],
    ["Contact phone", report.recovery_contact],
    ["Operating hours", report.recovery_hours],
    ["English pickup instructions", report.recovery_instructions],
  ];
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Recovery details
      </h3>
      <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-alt">
        {items.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm sm:grid-cols-4"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="col-span-2 whitespace-pre-wrap break-words text-foreground sm:col-span-3">
              {v || <span className="text-muted/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
