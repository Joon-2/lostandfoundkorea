"use client";

import { useState } from "react";
import StageBanner from "@/components/admin/StageBanner";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import SummaryRow from "@/components/admin/SummaryRow";
import NoteForm from "@/components/admin/NoteForm";
import SearchPlan, { detectLocationType } from "@/components/admin/SearchPlan";
import FacilityLinker from "@/components/admin/FacilityLinker";
import { inputCls } from "@/components/admin/styles";

type StageSearchingProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onAdvance: () => void;
  stageMoving: boolean;
  stageMsg: StatusMsg | null;
  onUpdate: (report: any) => void;
  refreshThisCase: () => void;
};

export default function StageSearching({
  report,
  password,
  onUnauthorized,
  onAdvance,
  stageMoving,
  stageMsg,
  onUpdate,
  refreshThisCase,
}: StageSearchingProps) {
  const [typeKey, setTypeKey] = useState(() => detectLocationType(report));
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeMsg, setCloseMsg] = useState<StatusMsg | null>(null);

  const handleCloseCase = async () => {
    if (closing) return;
    if (
      !window.confirm(
        "Send the 'no item found' email to the customer and close this case?"
      )
    )
      return;
    setClosing(true);
    setCloseMsg(null);
    try {
      const res = await fetch("/api/admin/close-case", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          caseNumber: report.case_number,
          reason: closeReason,
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Close failed");
      const refresh = await fetch(`/api/admin/reports`, {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (refresh.ok) {
        const fresh = await refresh.json();
        const updated = (fresh.reports || []).find((r: any) => r.id === report.id);
        if (updated) onUpdate(updated);
      }
      setCloseReason("");
      setCloseMsg({
        kind: "ok",
        text: json.emailSent
          ? `Case closed. Email sent to ${report.email}.`
          : `Case closed. Email failed: ${json.emailError || "unknown"}.`,
      });
    } catch (err: any) {
      setCloseMsg({ kind: "err", text: err.message });
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Searching.</strong> Work the contacts
        for this location type and log progress as you go.
      </StageBanner>
      <SummaryRow report={report} />
      <SearchPlan report={report} selectedKey={typeKey} onChange={setTypeKey} />
      <FacilityLinker
        report={report}
        password={password}
        onUnauthorized={onUnauthorized}
        onUpdate={onUpdate}
      />
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Search progress note
        </h3>
        <p className="mt-1 text-sm text-muted">
          Each note is saved to the activity log so the rest of the team can
          see where you&rsquo;ve checked.
        </p>
        <div className="mt-3">
          <NoteForm
            caseNumber={report.case_number}
            password={password}
            onUnauthorized={onUnauthorized}
            onAdded={refreshThisCase}
            placeholder="e.g. Called Kakao T dispatch at 14:20 — no record yet. Will check Lost112 tomorrow morning."
            buttonLabel="Log search note"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Item found →"}
        </button>
      </div>
      <StatusPill msg={stageMsg} />
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-red-700">
          Close — not found
        </h3>
        <p className="mt-2 text-sm text-body">
          Sends the &lsquo;no item found&rsquo; email (&ldquo;no charge since
          we didn&rsquo;t find it&rdquo;) and marks the case as closed.
        </p>
        <textarea
          className={`${inputCls} mt-3 min-h-24 resize-y bg-white`}
          value={closeReason}
          onChange={(e) => setCloseReason(e.target.value)}
          placeholder="Optional: brief reason to include in the email (e.g. 'We checked Lost112, Hongdae station, and surrounding restaurants but it has not been turned in.')"
        />
        <button
          onClick={handleCloseCase}
          disabled={closing}
          className="mt-4 inline-flex items-center rounded-full border border-red-300 bg-white px-5 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60"
        >
          {closing ? "Closing…" : "Send 'no item found' email & close"}
        </button>
        <StatusPill msg={closeMsg} />
      </div>
    </div>
  );
}
