"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PHASE2_STAGES,
  PROCESS_STAGES,
  isDeliveryRequired,
  normalizeStageKey,
} from "@/lib/process-stages";
import { plans } from "@/config/plans";
import { siteConfig } from "@/config/site";
import ProcessTracker from "@/components/admin/ProcessTracker";
import ActivityLog from "@/components/admin/ActivityLog";
import CustomerMessages from "@/components/admin/CustomerMessages";
import StageReceived from "@/components/admin/StageReceived";
import StageSearching from "@/components/admin/StageSearching";
import StageFound from "@/components/admin/StageFound";
import StagePaymentSent from "@/components/admin/StagePaymentSent";
import StagePaid from "@/components/admin/StagePaid";
import StageClosed from "@/components/admin/StageClosed";
import StageCompleted from "@/components/admin/StageCompleted";
import type { StatusMsg } from "@/components/admin/StatusPill";

// Reports-page case detail. Owns search-phase state only — delivery
// (pickup → ship → deliver) lives in DeliveriesView. When a case is
// in delivery, this view shows the "View delivery" link instead of
// rendering the phase-2 stepper inline.

const PHASE2_KEYS = new Set<string>(PHASE2_STAGES.map((s: any) => s.key));

type CaseDetailProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

export default function CaseDetail({
  report,
  password,
  onUnauthorized,
  onUpdate,
}: CaseDetailProps) {
  const [recoveryLocation, setRecoveryLocation] = useState(
    report.recovery_location || ""
  );
  const [recoveryContact, setRecoveryContact] = useState(
    report.recovery_contact || ""
  );
  const [recoveryHours, setRecoveryHours] = useState(
    report.recovery_hours || ""
  );
  const [recoveryInstructions, setRecoveryInstructions] = useState(
    report.recovery_instructions || ""
  );

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<StatusMsg | null>(null);
  const [emailMsg, setEmailMsg] = useState<StatusMsg | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [stageMoving, setStageMoving] = useState(false);
  const [stageMsg, setStageMsg] = useState<StatusMsg | null>(null);

  // Mark unread customer messages as read when admin opens the case.
  useEffect(() => {
    const messages = Array.isArray(report.messages) ? report.messages : [];
    const hasUnread = messages.some(
      (m: any) => m && m.from === "customer" && !m.read
    );
    if (!hasUnread) return;
    fetch("/api/admin/messages/mark-read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify({ caseNumber: report.case_number }),
    })
      .then((r) => (r.status === 401 ? null : r.json()))
      .then((j) => {
        if (j && j.ok && j.report) onUpdate(j.report);
      })
      .catch((err) => console.error("[mark-read] failed:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  const currentStage = normalizeStageKey(report.process_stage);
  const plan = report.plan === "all_in_one" ? "all_in_one" : "recovery";
  const amount =
    plan === "all_in_one"
      ? plans.all_in_one.priceSeoul
      : plans.recovery.paymentPrice;
  const paymentLink = `${siteConfig.url}/pay/${report.case_number || ""}`;
  const deliveryRequired = isDeliveryRequired(report);
  const closed = (report.status || "") === "closed";
  const inDelivery =
    deliveryRequired && (currentStage === "paid" || PHASE2_KEYS.has(currentStage));

  const flashEmail = (msg: StatusMsg) => {
    setEmailMsg(msg);
    setTimeout(() => {
      setEmailMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const refreshThisCase = async () => {
    try {
      const refresh = await fetch(`/api/admin/reports`, {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (!refresh.ok) return;
      const fresh = await refresh.json();
      const updated = (fresh.reports || []).find((r: any) => r.id === report.id);
      if (updated) onUpdate(updated);
    } catch (err) {
      console.error("[refreshThisCase] failed:", err);
    }
  };

  const advanceToStage = async (stageKey: string) => {
    if (stageMoving) return;
    const stage = PROCESS_STAGES.find((s: any) => s.key === stageKey);
    if (!stage) return;
    setStageMoving(true);
    setStageMsg(null);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          process_stage: stage.key,
          status: stage.status,
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      onUpdate(json.report);
    } catch (err: any) {
      setStageMsg({ kind: "err", text: err.message });
    } finally {
      setStageMoving(false);
    }
  };

  // Search-phase save only; delivery fields are saved from DeliveryDetail.
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`/api/admin/reports/${report.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          recovery_location: recoveryLocation,
          recovery_contact: recoveryContact,
          recovery_hours: recoveryHours,
          recovery_instructions: recoveryInstructions,
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      onUpdate(json.report);
      setSaveMsg({ kind: "ok", text: "Saved." });
    } catch (err: any) {
      setSaveMsg({ kind: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard write failed:", err);
    }
  };

  const handleSendConfirmation = async () => {
    if (sendingConfirmation) return;
    setSendingConfirmation(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/admin/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
          category: report.category,
          itemDescription: report.item_description,
          location: report.location,
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Send failed");
      await refreshThisCase();
      flashEmail({
        kind: "ok",
        text: `Confirmation email sent to ${report.email}.`,
      });
    } catch (err: any) {
      flashEmail({
        kind: "err",
        text: `Confirmation email failed: ${err.message}`,
      });
    } finally {
      setSendingConfirmation(false);
    }
  };

  const handleSendPayment = async ({ advance = false }: { advance?: boolean } = {}) => {
    if (sendingPayment) return;
    setSendingPayment(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/admin/send-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Send failed");
      await refreshThisCase();
      flashEmail({
        kind: "ok",
        text: `Payment link sent to ${report.email}.`,
      });
      if (advance) {
        await advanceToStage("payment_sent");
      }
    } catch (err: any) {
      flashEmail({
        kind: "err",
        text: `Payment email failed: ${err.message}`,
      });
    } finally {
      setSendingPayment(false);
    }
  };

  const recoveryState = {
    recoveryLocation,
    setRecoveryLocation,
    recoveryContact,
    setRecoveryContact,
    recoveryHours,
    setRecoveryHours,
    recoveryInstructions,
    setRecoveryInstructions,
  };

  return (
    <div className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
      <ProcessTracker
        report={report}
        password={password}
        onUnauthorized={onUnauthorized}
        onUpdate={onUpdate}
        phase="search"
      />

      {!closed && currentStage === "received" && (
        <StageReceived
          report={report}
          password={password}
          onUnauthorized={onUnauthorized}
          onAdvance={() => advanceToStage("searching")}
          stageMoving={stageMoving}
          stageMsg={stageMsg}
          onSendConfirmation={handleSendConfirmation}
          sendingConfirmation={sendingConfirmation}
          emailMsg={emailMsg}
          refreshThisCase={refreshThisCase}
        />
      )}

      {!closed && currentStage === "searching" && (
        <StageSearching
          report={report}
          password={password}
          onUnauthorized={onUnauthorized}
          onAdvance={() => advanceToStage("found")}
          stageMoving={stageMoving}
          stageMsg={stageMsg}
          onUpdate={onUpdate}
          refreshThisCase={refreshThisCase}
        />
      )}

      {!closed && currentStage === "found" && (
        <StageFound
          report={report}
          password={password}
          onUnauthorized={onUnauthorized}
          onUpdate={onUpdate}
          recoveryState={recoveryState}
          onSave={handleSave}
          saving={saving}
          saveMsg={saveMsg}
          onSendPaymentAndAdvance={() => handleSendPayment({ advance: true })}
          sendingPayment={sendingPayment}
          emailMsg={emailMsg}
          paymentLink={paymentLink}
          onCopyLink={handleCopyLink}
          linkCopied={linkCopied}
          amount={amount}
        />
      )}

      {!closed && currentStage === "payment_sent" && (
        <StagePaymentSent
          report={report}
          paymentLink={paymentLink}
          onCopyLink={handleCopyLink}
          linkCopied={linkCopied}
          onResendPayment={() => handleSendPayment({ advance: false })}
          sendingPayment={sendingPayment}
          emailMsg={emailMsg}
          amount={amount}
        />
      )}

      {!closed && currentStage === "paid" && (
        <StagePaid
          report={report}
          deliveryRequired={deliveryRequired}
          onComplete={() => advanceToStage("completed")}
          stageMoving={stageMoving}
          stageMsg={stageMsg}
        />
      )}

      {!closed && currentStage === "completed" && (
        <StageCompleted report={report} />
      )}

      {closed && <StageClosed report={report} />}

      {!closed && inDelivery && (
        <ViewDeliveryLink caseNumber={report.case_number} stage={currentStage} />
      )}

      <CustomerMessages report={report} />

      <ActivityLog
        entries={report.activity_log}
        caseNumber={report.case_number}
        password={password}
        onUnauthorized={onUnauthorized}
        onAdded={refreshThisCase}
      />
    </div>
  );
}

function ViewDeliveryLink({
  caseNumber,
  stage,
}: {
  caseNumber: string;
  stage: string;
}) {
  const subtitle =
    stage === "paid"
      ? "Ready for pickup."
      : `Currently in delivery (${stage.replace(/_/g, " ")}).`;
  return (
    <section className="mt-6 rounded-2xl border border-accent/30 bg-emerald-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg tracking-tight text-foreground">
            Delivery
          </h3>
          <p className="mt-1 text-sm text-body">{subtitle}</p>
        </div>
        <Link
          href={`/admin?section=deliveries&case=${encodeURIComponent(caseNumber)}`}
          className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          View delivery →
        </Link>
      </div>
    </section>
  );
}
