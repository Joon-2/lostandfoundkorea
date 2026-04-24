"use client";

import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import DetailsBlock from "@/components/admin/DetailsBlock";
import UserImages from "@/components/admin/UserImages";
import RequestInfoForm from "@/components/admin/RequestInfoForm";

type StageReceivedProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onAdvance: () => void;
  stageMoving: boolean;
  stageMsg: StatusMsg | null;
  onSendConfirmation: () => void;
  sendingConfirmation: boolean;
  emailMsg: StatusMsg | null;
  refreshThisCase: () => void;
};

export default function StageReceived({
  report,
  password,
  onUnauthorized,
  onAdvance,
  stageMoving,
  stageMsg,
  onSendConfirmation,
  sendingConfirmation,
  emailMsg,
  refreshThisCase,
}: StageReceivedProps) {
  return (
    <div className="space-y-6">
      <StageBanner tone="amber">
        <strong className="font-semibold">New report.</strong> Review the
        submission and ask the customer for anything missing before starting
        the search.
      </StageBanner>
      <DetailsBlock report={report} />
      <UserImages images={report.user_images} />
      <RequestInfoForm
        report={report}
        password={password}
        onUnauthorized={onUnauthorized}
        onSent={refreshThisCase}
      />
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Info complete — Start searching →"}
        </button>
        <button
          onClick={onSendConfirmation}
          disabled={sendingConfirmation}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {sendingConfirmation ? "Sending…" : "Send confirmation email"}
        </button>
      </div>
      <StatusPill msg={emailMsg} />
      <StatusPill msg={stageMsg} />
    </div>
  );
}
