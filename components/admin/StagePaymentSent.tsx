"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import RecoveryReadonly from "@/components/admin/RecoveryReadonly";

type StagePaymentSentProps = {
  report: any;
  paymentLink: string;
  onCopyLink: () => void;
  linkCopied: boolean;
  onResendPayment: () => void;
  sendingPayment: boolean;
  emailMsg: StatusMsg | null;
  amount: number | string;
};

export default function StagePaymentSent({
  report,
  paymentLink,
  onCopyLink,
  linkCopied,
  onResendPayment,
  sendingPayment,
  emailMsg,
  amount,
}: StagePaymentSentProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Payment link sent.</strong> Waiting
        for the customer to pay ${amount}. They&rsquo;ll receive recovery
        details automatically on payment.
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
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onResendPayment}
          disabled={sendingPayment}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sendingPayment ? "Sending…" : "Resend payment link"}
        </button>
        <button
          onClick={onCopyLink}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt"
        >
          {linkCopied ? "Copied!" : "Copy payment link"}
        </button>
      </div>
      <p className="font-mono text-xs text-muted">{paymentLink}</p>
      <StatusPill msg={emailMsg} />
    </div>
  );
}
