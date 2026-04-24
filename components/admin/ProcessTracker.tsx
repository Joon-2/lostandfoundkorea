"use client";

import { useState } from "react";
import {
  PHASE1_STAGES,
  PHASE2_STAGES,
  getStagePhase,
  isDeliveryRequired,
  normalizeStageKey,
} from "@/lib/process-stages";

type Stage = { key: string; label: string; status?: string };

type PhaseBarProps = {
  label: string;
  stages: Stage[];
  currentKey: string;
  phase: number;
  currentPhase: number;
  muted: boolean;
  closed: boolean;
  changing: boolean;
  onStageClick: (stage: Stage) => void;
};

function PhaseBar({
  label,
  stages,
  currentKey,
  phase,
  currentPhase,
  muted,
  closed,
  changing,
  onStageClick,
}: PhaseBarProps) {
  const currentIdx = stages.findIndex((s) => s.key === currentKey);
  const phaseDone = currentPhase > phase;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${
        muted
          ? "border-dashed border-border bg-alt/40"
          : "border-border bg-alt"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3
          className={`text-xs font-semibold uppercase tracking-widest ${
            muted ? "text-muted/70" : "text-muted"
          }`}
        >
          {label}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          {closed && (
            <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
              Not Found — Case Closed
            </span>
          )}
          {muted && !closed && (
            <span className="text-muted/70">Not applicable</span>
          )}
          {changing && <span className="text-muted">Updating…</span>}
        </div>
      </div>
      <ol className="flex items-start overflow-x-auto pb-1">
        {stages.map((stage, i) => {
          const isCurrent = i === currentIdx && currentPhase === phase;
          const isCompleted =
            (currentPhase === phase && i < currentIdx) || phaseDone;
          const lineActive = isCompleted;
          const disabledByMute = muted && !closed;
          return (
            <li key={stage.key} className="flex items-start">
              <button
                type="button"
                onClick={() => !disabledByMute && onStageClick(stage)}
                disabled={changing || disabledByMute}
                className={`flex min-w-[72px] flex-col items-center gap-1.5 px-1 disabled:opacity-60 ${
                  disabledByMute ? "cursor-not-allowed" : ""
                }`}
                title={disabledByMute ? "Delivery not required for this case" : stage.label}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                    muted && !isCurrent && !isCompleted
                      ? "border-border/60 bg-card/60 text-muted/70"
                      : isCurrent
                      ? "border-accent bg-accent text-white shadow-sm"
                      : isCompleted
                      ? "border-accent/50 bg-emerald-50 text-accent"
                      : "border-border bg-card text-muted"
                  }`}
                >
                  {isCompleted ? (
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
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-center text-[11px] leading-tight ${
                    muted && !isCurrent && !isCompleted
                      ? "text-muted/70"
                      : isCurrent
                      ? "font-semibold text-foreground"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted"
                  }`}
                >
                  {stage.label}
                </span>
              </button>
              {i < stages.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mt-4 h-0.5 w-6 sm:w-8 ${
                    lineActive
                      ? "bg-accent"
                      : muted
                      ? "bg-border/50"
                      : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type ProcessTrackerProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

export default function ProcessTracker({
  report,
  password,
  onUnauthorized,
  onUpdate,
}: ProcessTrackerProps) {
  const currentKey = normalizeStageKey(report.process_stage);
  const currentPhase = getStagePhase(currentKey);
  const deliveryRequired = isDeliveryRequired(report);
  const closed = (report.status || "") === "closed";
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStage = async (stage: Stage) => {
    if (changing || stage.key === currentKey) return;
    setChanging(true);
    setError(null);
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
      if (!res.ok || !json.ok) throw new Error(json.error || "Update failed");
      onUpdate(json.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="mb-6 space-y-3">
      <PhaseBar
        label="Phase 1: Search"
        stages={PHASE1_STAGES}
        currentKey={currentKey}
        phase={1}
        currentPhase={currentPhase}
        muted={false}
        closed={closed}
        changing={changing}
        onStageClick={changeStage}
      />
      <PhaseBar
        label="Phase 2: Delivery"
        stages={PHASE2_STAGES}
        currentKey={currentKey}
        phase={2}
        currentPhase={currentPhase}
        muted={!deliveryRequired}
        closed={false}
        changing={changing}
        onStageClick={changeStage}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
