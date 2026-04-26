"use client";

import { useState } from "react";
import {
  PHASE1_STAGES,
  PHASE2_STAGES,
  getStagePhase,
  normalizeStageKey,
} from "@/lib/process-stages";

// Single PhaseBar that renders either the search or the delivery
// progression. Caller picks via `phase`. Reports page uses "search";
// Deliveries page uses "delivery".

type Stage = { key: string; label: string; status?: string };

type ProcessTrackerProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
  phase?: "search" | "delivery";
};

const PHASE_CONFIG = {
  search: {
    label: "Progress",
    stages: PHASE1_STAGES,
    phaseNumber: 1,
  },
  delivery: {
    label: "Delivery progress",
    stages: PHASE2_STAGES,
    phaseNumber: 2,
  },
} as const;

export default function ProcessTracker({
  report,
  password,
  onUnauthorized,
  onUpdate,
  phase = "search",
}: ProcessTrackerProps) {
  const cfg = PHASE_CONFIG[phase];
  const currentKey = normalizeStageKey(report.process_stage);
  const currentPhase = getStagePhase(currentKey);
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
    <div className="mb-6">
      <PhaseBar
        label={cfg.label}
        stages={cfg.stages}
        currentKey={currentKey}
        phase={cfg.phaseNumber}
        currentPhase={currentPhase}
        closed={closed && phase === "search"}
        changing={changing}
        onStageClick={changeStage}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

type PhaseBarProps = {
  label: string;
  stages: Stage[];
  currentKey: string;
  phase: number;
  currentPhase: number;
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
  closed,
  changing,
  onStageClick,
}: PhaseBarProps) {
  const currentIdx = stages.findIndex((s) => s.key === currentKey);
  const phaseDone = currentPhase > phase;

  return (
    <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          {label}
        </h3>
        <div className="flex items-center gap-2 text-xs">
          {closed && (
            <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
              Not Found — Case Closed
            </span>
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
          return (
            <li key={stage.key} className="flex items-start">
              <button
                type="button"
                onClick={() => onStageClick(stage)}
                disabled={changing}
                className="flex min-w-[72px] flex-col items-center gap-1.5 px-1 disabled:opacity-60"
                title={stage.label}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                    isCurrent
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
                    isCurrent
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
                    lineActive ? "bg-accent" : "bg-border"
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
