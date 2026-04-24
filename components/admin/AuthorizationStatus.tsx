export default function AuthorizationStatus({ report }: { report: any }) {
  return (
    <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Customer authorization
      </h3>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="text-muted">ID / signed authorization:</span>
        {report.authorization_url ? (
          <a
            href={report.authorization_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline"
          >
            Uploaded — View
          </a>
        ) : (
          <span className="font-medium text-amber-700">Not uploaded yet</span>
        )}
      </div>
      {report.shipping_address && (
        <div className="mt-3 border-t border-border pt-3 text-sm">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted">
            Shipping to
          </div>
          <p className="mt-1 whitespace-pre-wrap text-foreground">
            {report.shipping_address}
          </p>
        </div>
      )}
    </div>
  );
}
