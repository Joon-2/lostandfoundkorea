"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryLine from "@/components/admin/SummaryLine";
import RecoveryForm, { type RecoveryState } from "@/components/admin/RecoveryForm";
import PhotoManager from "@/components/admin/PhotoManager";

type StageFoundProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
  recoveryState: RecoveryState;
  onSave: () => void;
  saving: boolean;
  saveMsg: StatusMsg | null;
  onSendPaymentAndAdvance: () => void;
  sendingPayment: boolean;
  emailMsg: StatusMsg | null;
  paymentLink: string;
  onCopyLink: () => void;
  linkCopied: boolean;
  amount: number | string;
};

export default function StageFound({
  report,
  password,
  onUnauthorized,
  onUpdate,
  recoveryState,
  onSave,
  saving,
  saveMsg,
  onSendPaymentAndAdvance,
  sendingPayment,
  emailMsg,
  paymentLink,
  onCopyLink,
  linkCopied,
  amount,
}: StageFoundProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="emerald">
        <strong className="font-semibold">Item found.</strong> Fill in recovery
        details and upload a found-item photo, then send the payment link for
        ${amount}.
      </StageBanner>
      <SummaryLine report={report} />
      <RecoveryForm {...recoveryState} />
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save recovery details"}
        </button>
        <StatusPill msg={saveMsg} />
      </div>
      <PhotoManager
        caseNumber={report.case_number}
        images={report.found_images}
        password={password}
        onUnauthorized={onUnauthorized}
        onChange={(next) => onUpdate({ ...report, found_images: next })}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onSendPaymentAndAdvance}
          disabled={sendingPayment}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sendingPayment ? "Sending…" : `Send payment link ($${amount}) →`}
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
