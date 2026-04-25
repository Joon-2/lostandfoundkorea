import { formatDateTime } from "@/lib/format";

type Message = {
  from?: "customer" | "admin";
  text?: string;
  attachment_url?: string | null;
  timestamp?: string;
  read?: boolean;
};

function isImage(url: string) {
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(url);
}

export default function CustomerMessages({ report }: { report: any }) {
  const raw: Message[] = Array.isArray(report.messages) ? report.messages : [];
  // Newest first. Sort defensively in case storage order changes someday.
  const messages = [...raw].sort((a, b) => {
    const at = a.timestamp ? Date.parse(a.timestamp) : 0;
    const bt = b.timestamp ? Date.parse(b.timestamp) : 0;
    return bt - at;
  });

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Customer messages
      </h3>

      {messages.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          No messages from the customer yet.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {messages.map((m, i) => {
            const isCustomer = m.from === "customer";
            const url = m.attachment_url || null;
            return (
              <li
                key={i}
                className={`rounded-xl border px-4 py-3 ${
                  isCustomer
                    ? "border-accent/30 bg-emerald-50/50"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-muted">
                  <span className="font-medium uppercase tracking-widest">
                    {isCustomer ? "Customer" : m.from || "—"}
                  </span>
                  <span>
                    {m.timestamp ? formatDateTime(m.timestamp) : "—"}
                  </span>
                </div>
                {m.text && (
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-foreground">
                    {m.text}
                  </p>
                )}
                {url && (
                  <div className="mt-3">
                    {isImage(url) ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block overflow-hidden rounded-lg border border-border bg-alt"
                      >
                        <img
                          src={url}
                          alt="Customer attachment"
                          className="h-32 w-32 object-cover"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-alt"
                      >
                        <svg
                          className="h-3.5 w-3.5 text-accent"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Attachment
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
