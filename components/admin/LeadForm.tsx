"use client";

import { useEffect, useState } from "react";
import {
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  type Lead,
} from "@/types/lead";
import { adminFetch } from "@/lib/admin-fetch";

// New-lead modal. Editing existing leads happens inline in LeadsView's
// expanded row (matching the Reports edit-in-place pattern), so this
// component is currently used only in create mode. Edit mode is
// supported here too in case we ever want a modal-edit flow.

type LeadFormProps = {
  lead: Lead | null; // null = create
  password: string;
  onUnauthorized?: () => void;
  onSaved: (lead: Lead) => void;
  onClose: () => void;
};

const fieldInput =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadForm({
  lead,
  password,
  onUnauthorized,
  onSaved,
  onClose,
}: LeadFormProps) {
  const isEdit = lead !== null;
  const [companyName, setCompanyName] = useState(lead?.company_name || "");
  const [contactPerson, setContactPerson] = useState(
    lead?.contact_person || ""
  );
  const [email, setEmail] = useState(lead?.email || "");
  const [partnerType, setPartnerType] = useState<string>(
    lead?.partner_type || "insurance"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setError(null);
    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      const url = isEdit ? `/api/leads/${lead!.id}` : "/api/leads";
      const method = isEdit ? "PUT" : "POST";
      const json = await adminFetch<{ ok: boolean; lead: Lead; error?: string }>(
        url,
        {
          method,
          body: {
            company_name: companyName,
            contact_person: contactPerson,
            email,
            partner_type: partnerType,
          },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Save failed");
      onSaved(json.lead);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-xl tracking-tight">
            {isEdit ? "Edit lead" : "New lead"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground"
          >
            Close
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <FieldLabel label="Company name *">
            <input
              type="text"
              autoFocus
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className={fieldInput}
              placeholder="e.g. Samsung Fire & Marine Insurance"
            />
          </FieldLabel>

          <FieldLabel label="Contact person">
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className={fieldInput}
              placeholder="e.g. Park Ji-hye"
            />
          </FieldLabel>

          <FieldLabel label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldInput}
              placeholder="contact@company.com"
            />
          </FieldLabel>

          <FieldLabel label="Partner type">
            <select
              value={partnerType}
              onChange={(e) => setPartnerType(e.target.value)}
              className={fieldInput}
            >
              {PARTNER_TYPES.map((p) => (
                <option key={p} value={p}>
                  {PARTNER_TYPE_LABELS[p] || p}
                </option>
              ))}
            </select>
          </FieldLabel>

          {!isEdit && (
            <p className="rounded-lg bg-alt px-3 py-2 text-xs text-muted">
              New leads start as <strong>Lead</strong>. Advance the status from
              the row editor after creation.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create lead"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
