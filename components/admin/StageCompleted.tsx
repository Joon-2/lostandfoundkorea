import SummaryLine from "@/components/admin/SummaryLine";
import DetailsBlock from "@/components/admin/DetailsBlock";
import UserImages from "@/components/admin/UserImages";
import RecoveryReadonly from "@/components/admin/RecoveryReadonly";
import { formatDate } from "@/lib/format";

export default function StageCompleted({ report }: { report: any }) {
  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-accent">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Case completed
      </div>
      <SummaryLine report={report} />
      <DetailsBlock report={report} />
      <UserImages images={report.user_images} />
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
      <dl className="divide-y divide-border rounded-xl border border-border bg-alt">
        {([
          ["Tracking number", report.tracking_number],
          ["Shipping method", report.shipping_method],
          ["Estimated delivery", formatDate(report.estimated_delivery)],
          ["Transaction ID", report.paypal_transaction_id],
        ] as [string, any][]).map(([k, v]) => (
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
