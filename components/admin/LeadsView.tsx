"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import {
  LEAD_STATUSES,
  LEAD_STATUS_BADGE,
  LEAD_STATUS_LABELS,
  PARTNER_TYPES,
  PARTNER_TYPE_LABELS,
  type Lead,
  type LeadStatus,
} from "@/types/lead";
import LeadForm from "@/components/admin/LeadForm";
import Pagination from "@/components/admin/Pagination";

// Sales / Leads page. Self-contained data fetch (no shared state with
// Reports). Same visual shell as CaseList: stats row → toolbar → table
// → inline expanded editor on row click.

const PAGE_SIZE = 20;

const compact =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

type LeadsViewProps = {
  password: string;
  onUnauthorized?: () => void;
};

export default function LeadsView({
  password,
  onUnauthorized,
}: LeadsViewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnerFilter, setPartnerFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/leads", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok)
        throw new Error(json.error || "Failed to load leads");
      setLeads(json.leads || []);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, onUnauthorized]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const stats = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      lead: 0,
      contacted: 0,
      negotiating: 0,
      closed: 0,
    };
    for (const l of leads) {
      if (counts[l.status] !== undefined) counts[l.status] += 1;
    }
    return counts;
  }, [leads]);

  const filtered = useMemo(() => {
    let arr = leads;
    if (statusFilter !== "all") {
      arr = arr.filter((l) => l.status === statusFilter);
    }
    if (partnerFilter !== "all") {
      arr = arr.filter((l) => l.partner_type === partnerFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (l) =>
          (l.company_name || "").toLowerCase().includes(q) ||
          (l.contact_person || "").toLowerCase().includes(q) ||
          (l.email || "").toLowerCase().includes(q) ||
          (l.lead_number || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [leads, search, statusFilter, partnerFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, partnerFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const onSaved = (saved: Lead) => {
    setLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setCreating(false);
  };

  const onDeleted = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setExpandedId((curr) => (curr === id ? null : curr));
  };

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            Sales
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage partner outreach and deals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            + New lead
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Lead"
          value={stats.lead}
          tone="slate"
          helper="Untouched"
        />
        <StatCard
          label="Contacted"
          value={stats.contacted}
          tone="sky"
          helper="Reached out"
        />
        <StatCard
          label="Negotiating"
          value={stats.negotiating}
          tone="amber"
          helper="In discussion"
        />
        <StatCard
          label="Closed"
          value={stats.closed}
          tone="emerald"
          helper="Deal landed"
        />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, contact, email, or lead number"
          className={compact}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${compact} sm:w-44`}
        >
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className={`${compact} sm:w-44`}
        >
          <option value="all">All partner types</option>
          {PARTNER_TYPES.map((p) => (
            <option key={p} value={p}>
              {PARTNER_TYPE_LABELS[p] || p}
            </option>
          ))}
        </select>
      </div>

      {loadError && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-alt text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">Company</th>
                <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">
                  Contact
                </th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && leads.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    Loading leads…
                  </td>
                </tr>
              )}
              {!loading && leads.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No leads yet. Add your first one with{" "}
                    <strong>+ New lead</strong>.
                  </td>
                </tr>
              )}
              {!loading && leads.length > 0 && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No leads match the current filter.
                  </td>
                </tr>
              )}
              {visible.map((l) => (
                <Row
                  key={l.id}
                  lead={l}
                  expanded={expandedId === l.id}
                  onToggle={() =>
                    setExpandedId(expandedId === l.id ? null : l.id)
                  }
                  password={password}
                  onUnauthorized={onUnauthorized}
                  onSaved={onSaved}
                  onDeleted={onDeleted}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={safePage}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={(p) => {
            setExpandedId(null);
            setPage(p);
          }}
        />
      </div>

      {creating && (
        <LeadForm
          lead={null}
          password={password}
          onUnauthorized={onUnauthorized}
          onSaved={onSaved}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}

// ─── Row + inline editor ──────────────────────────────────────────────

function Row({
  lead,
  expanded,
  onToggle,
  password,
  onUnauthorized,
  onSaved,
  onDeleted,
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  password: string;
  onUnauthorized?: () => void;
  onSaved: (l: Lead) => void;
  onDeleted: (id: string) => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-border transition-colors hover:bg-alt/60 ${
          expanded ? "bg-alt/40" : ""
        }`}
      >
        <td className="px-4 py-3">
          <span className="font-mono text-sm font-semibold text-foreground">
            {lead.lead_number}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-foreground">
          {lead.company_name}
        </td>
        <td className="hidden px-4 py-3 text-sm text-body sm:table-cell">
          {lead.contact_person || (
            <span className="text-muted/60">—</span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
          {lead.email || <span className="text-muted/60">—</span>}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${LEAD_STATUS_BADGE[lead.status]}`}
          >
            {LEAD_STATUS_LABELS[lead.status]}
          </span>
        </td>
        <td className="hidden px-4 py-3 text-xs text-muted md:table-cell">
          {lead.updated_at ? formatDateTime(lead.updated_at) : "—"}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border bg-card">
          <td colSpan={6} className="p-0">
            <InlineEditor
              lead={lead}
              password={password}
              onUnauthorized={onUnauthorized}
              onSaved={onSaved}
              onDeleted={onDeleted}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function InlineEditor({
  lead,
  password,
  onUnauthorized,
  onSaved,
  onDeleted,
}: {
  lead: Lead;
  password: string;
  onUnauthorized?: () => void;
  onSaved: (l: Lead) => void;
  onDeleted: (id: string) => void;
}) {
  const [companyName, setCompanyName] = useState(lead.company_name);
  const [contactPerson, setContactPerson] = useState(
    lead.contact_person || ""
  );
  const [email, setEmail] = useState(lead.email || "");
  const [partnerType, setPartnerType] = useState<string>(
    lead.partner_type || "insurance"
  );
  const [saving, setSaving] = useState(false);
  const [stageMoving, setStageMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  const submit = async (
    update: Record<string, any>,
    setBusy: (b: boolean) => void
  ): Promise<Lead | null> => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(update),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return null;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      onSaved(json.lead);
      return json.lead;
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!companyName.trim()) {
      setMsg({ kind: "err", text: "Company name is required." });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg({ kind: "err", text: "Enter a valid email address." });
      return;
    }
    submit(
      {
        company_name: companyName,
        contact_person: contactPerson,
        email,
        partner_type: partnerType,
      },
      setSaving
    ).then((l) => {
      if (l) setMsg({ kind: "ok", text: "Saved." });
    });
  };

  const handleStatusChange = (next: LeadStatus) => {
    if (stageMoving || next === lead.status) return;
    submit({ status: next }, setStageMoving);
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm(`Delete ${lead.lead_number}? This cannot be undone.`))
      return;
    setDeleting(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Delete failed");
      onDeleted(lead.id);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
      setDeleting(false);
    }
  };

  return (
    <div className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
      <StatusStepper
        current={lead.status}
        changing={stageMoving}
        onSelect={handleStatusChange}
      />

      <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Company name *">
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className={fieldInput}
          />
        </FieldLabel>
        <FieldLabel label="Contact person">
          <input
            type="text"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className={fieldInput}
          />
        </FieldLabel>
        <FieldLabel label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInput}
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

        {msg && (
          <div className="sm:col-span-2">
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.kind === "ok"
                  ? "bg-emerald-50 text-accent"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {msg.text}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 sm:col-span-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Status stepper ──────────────────────────────────────────────────

function StatusStepper({
  current,
  changing,
  onSelect,
}: {
  current: LeadStatus;
  changing: boolean;
  onSelect: (s: LeadStatus) => void;
}) {
  const currentIdx = LEAD_STATUSES.indexOf(current);
  return (
    <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Status
        </h3>
        {changing && <span className="text-xs text-muted">Updating…</span>}
      </div>
      <ol className="flex items-start overflow-x-auto pb-1">
        {LEAD_STATUSES.map((s, i) => {
          const isCurrent = s === current;
          const isCompleted = i < currentIdx;
          return (
            <li key={s} className="flex items-start">
              <button
                type="button"
                onClick={() => onSelect(s)}
                disabled={changing}
                className="flex min-w-[88px] flex-col items-center gap-1.5 px-1 disabled:opacity-60"
                title={LEAD_STATUS_LABELS[s]}
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
                  {LEAD_STATUS_LABELS[s]}
                </span>
              </button>
              {i < LEAD_STATUSES.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mt-4 h-0.5 w-6 sm:w-8 ${
                    isCompleted ? "bg-accent" : "bg-border"
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

// ─── Helpers ─────────────────────────────────────────────────────────

const fieldInput =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

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

function StatCard({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: number;
  tone: "slate" | "sky" | "amber" | "emerald";
  helper?: string;
}) {
  const tonal: Record<typeof tone, string> = {
    slate: "text-slate-700",
    sky: "text-sky-700",
    amber: "text-amber-700",
    emerald: "text-accent",
  };
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className={`mt-1 font-serif text-2xl tracking-tight ${tonal[tone]}`}>
        {value}
      </div>
      {helper && <div className="mt-1 text-xs text-muted">{helper}</div>}
    </div>
  );
}

