"use client";

import Field from "@/components/admin/Field";
import { inputCls } from "@/components/admin/styles";

export type RecoveryState = {
  recoveryLocation: string;
  setRecoveryLocation: (v: string) => void;
  recoveryContact: string;
  setRecoveryContact: (v: string) => void;
  recoveryHours: string;
  setRecoveryHours: (v: string) => void;
  recoveryInstructions: string;
  setRecoveryInstructions: (v: string) => void;
};

export default function RecoveryForm({
  recoveryLocation,
  setRecoveryLocation,
  recoveryContact,
  setRecoveryContact,
  recoveryHours,
  setRecoveryHours,
  recoveryInstructions,
  setRecoveryInstructions,
}: RecoveryState) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Recovery details
      </h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field label="Recovery location">
          <input
            type="text"
            className={inputCls}
            value={recoveryLocation}
            onChange={(e) => setRecoveryLocation(e.target.value)}
            placeholder="e.g. Hongdae Police Station, Lost Items Desk"
          />
        </Field>
        <Field label="Contact phone">
          <input
            type="text"
            className={inputCls}
            value={recoveryContact}
            onChange={(e) => setRecoveryContact(e.target.value)}
            placeholder="e.g. +82 2 1234 5678"
          />
        </Field>
        <Field label="Operating hours">
          <input
            type="text"
            className={inputCls}
            value={recoveryHours}
            onChange={(e) => setRecoveryHours(e.target.value)}
            placeholder="e.g. Mon–Fri 09:00–18:00"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="English pickup instructions">
          <textarea
            className={`${inputCls} min-h-32 resize-y`}
            value={recoveryInstructions}
            onChange={(e) => setRecoveryInstructions(e.target.value)}
            placeholder="Step-by-step English instructions for the user…"
          />
        </Field>
      </div>
    </div>
  );
}
