"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, formatDateTime } from "@/lib/format";

const ENV_LABELS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
  "PAYPAL_SECRET",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "ADMIN_PASSWORD",
];

const STATUS_OPTIONS = ["pending", "found", "paid", "closed"];
const STATUS_LABELS = {
  pending: "Pending",
  found: "Found",
  paid: "Paid",
  closed: "Closed",
};
const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  found: "bg-emerald-50 text-accent border-emerald-200",
  paid: "bg-sky-50 text-sky-700 border-sky-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const SESSION_KEY = "lfk_admin_password";
const PRICE = 39;

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
    if (stored) {
      setPassword(stored);
      setAuthed(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const trimmed = password.trim();
    if (!trimmed) {
      setAuthError("Enter the admin password.");
      return;
    }
    const res = await fetch("/api/health", {
      headers: { "x-admin-password": trimmed },
    });
    if (res.status === 401) {
      setAuthError("Incorrect password.");
      return;
    }
    if (!res.ok) {
      setAuthError("Server error. Please try again.");
      return;
    }
    sessionStorage.setItem(SESSION_KEY, trimmed);
    setAuthed(true);
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setPassword("");
    setAuthed(false);
  }, []);

  if (!authed) {
    return (
      <div className="flex flex-1 flex-col">
        <AdminHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-12 sm:px-8">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h1 className="font-serif text-2xl tracking-tight">Admin sign-in</h1>
            <p className="mt-1 text-sm text-muted">
              Enter the admin password to continue.
            </p>
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={inputCls}
              />
              {authError && (
                <p className="text-sm text-red-600">{authError}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Sign in
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader onLogout={logout} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 sm:py-10">
        <Dashboard password={password} onUnauthorized={logout} />
      </main>
    </div>
  );
}

function AdminHeader({ onLogout }) {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-white"
        >
          Lost & Found Korea
        </Link>
        {onLogout ? (
          <button
            onClick={onLogout}
            className="text-sm text-slate-300 transition-colors hover:text-white"
          >
            Sign out
          </button>
        ) : (
          <span className="text-sm text-slate-300">Admin</span>
        )}
      </div>
    </header>
  );
}

function Dashboard({ password, onUnauthorized }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to load reports");
      }
      const json = await res.json();
      setReports(json.reports || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, onUnauthorized]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const stats = useMemo(() => {
    const counts = { total: reports.length, pending: 0, found: 0, paid: 0 };
    for (const r of reports) {
      const s = r.status || "pending";
      if (counts[s] !== undefined) counts[s] += 1;
    }
    return { ...counts, revenue: counts.paid * PRICE };
  }, [reports]);

  const filtered = useMemo(() => {
    let arr = reports;
    if (statusFilter !== "all") {
      arr = arr.filter((r) => (r.status || "pending") === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (r) =>
          (r.case_number || "").toLowerCase().includes(q) ||
          (r.name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [reports, search, statusFilter]);

  const updateReport = useCallback(
    (updated) => {
      setReports((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    },
    []
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Reports
        </h1>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <StatsRow stats={stats} />

      <SearchBar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {loadError && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && !loading && (
          <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted">
            No reports match the current filter.
          </p>
        )}
        {filtered.map((r) => (
          <ReportCard
            key={r.id}
            report={r}
            expanded={expandedId === r.id}
            onToggle={() =>
              setExpandedId(expandedId === r.id ? null : r.id)
            }
            password={password}
            onUnauthorized={onUnauthorized}
            onUpdate={updateReport}
          />
        ))}
      </div>

      <SystemStatus password={password} onUnauthorized={onUnauthorized} />
    </>
  );
}

function StatsRow({ stats }) {
  const items = [
    { label: "Total cases", value: stats.total },
    { label: "Pending", value: stats.pending, tone: "amber" },
    { label: "Found", value: stats.found, tone: "emerald" },
    { label: "Paid", value: stats.paid, tone: "sky" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, tone: "emerald" },
  ];
  const toneColor = {
    amber: "text-amber-700",
    emerald: "text-accent",
    sky: "text-sky-700",
  };
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"
        >
          <div className="text-xs font-medium uppercase tracking-widest text-muted">
            {it.label}
          </div>
          <div
            className={`mt-1 font-serif text-2xl tracking-tight ${
              toneColor[it.tone] || "text-foreground"
            }`}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchBar({ search, onSearch, statusFilter, onStatusChange }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by case number, name, or email"
        className={inputCls + " sm:flex-1"}
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={inputCls + " sm:w-48"}
      >
        <option value="all">All statuses</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReportCard({
  report,
  expanded,
  onToggle,
  password,
  onUnauthorized,
  onUpdate,
}) {
  const status = report.status || "pending";
  return (
    <article className="rounded-2xl border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-mono text-sm font-semibold text-foreground">
            {report.case_number || "—"}
          </span>
          <span className="text-sm text-foreground">{report.name}</span>
          <span className="text-sm text-muted">{report.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
          <span className="hidden text-xs text-muted sm:inline">
            {formatDate(report.date_lost) || "—"}
          </span>
          <svg
            className={`h-4 w-4 text-muted transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      {expanded && (
        <ReportEditor
          report={report}
          password={password}
          onUnauthorized={onUnauthorized}
          onUpdate={onUpdate}
        />
      )}
    </article>
  );
}

function ReportEditor({ report, password, onUnauthorized, onUpdate }) {
  const [status, setStatus] = useState(report.status || "pending");
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
  const [saveMsg, setSaveMsg] = useState(null);
  const [emailMsg, setEmailMsg] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeMsg, setCloseMsg] = useState(null);

  const flashEmail = (msg) => {
    setEmailMsg(msg);
    setTimeout(() => {
      setEmailMsg((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

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
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Close failed");
      }
      const refresh = await fetch(`/api/admin/reports`, {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (refresh.ok) {
        const fresh = await refresh.json();
        const updated = (fresh.reports || []).find((r) => r.id === report.id);
        if (updated) {
          onUpdate(updated);
          setStatus(updated.status || "closed");
        }
      }
      setCloseReason("");
      setCloseMsg({
        kind: "ok",
        text: json.emailSent
          ? `Case closed. Email sent to ${report.email}.`
          : `Case closed. Email failed: ${json.emailError || "unknown"}.`,
      });
    } catch (err) {
      setCloseMsg({ kind: "err", text: err.message });
    } finally {
      setClosing(false);
    }
  };

  const paymentLink = `https://lostandfoundkorea.com/pay/${report.case_number || ""}`;

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
          status,
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
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Save failed");
      }
      onUpdate(json.report);
      setSaveMsg({ kind: "ok", text: "Saved." });
    } catch (err) {
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
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
          category: report.category,
          itemDescription: report.item_description,
          location: report.location,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Send failed");
      }
      flashEmail({
        kind: "ok",
        text: `Confirmation email sent to ${report.email}.`,
      });
    } catch (err) {
      flashEmail({
        kind: "err",
        text: `Confirmation email failed: ${err.message}`,
      });
    } finally {
      setSendingConfirmation(false);
    }
  };

  const handleSendPayment = async () => {
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
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Send failed");
      }
      flashEmail({
        kind: "ok",
        text: `Payment link sent to ${report.email}.`,
      });
    } catch (err) {
      flashEmail({
        kind: "err",
        text: `Payment email failed: ${err.message}`,
      });
    } finally {
      setSendingPayment(false);
    }
  };

  return (
    <div className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
      <DetailsBlock report={report} />

      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Recovery details
        </h3>
        <div className="mt-3 grid gap-4 lg:grid-cols-[200px_1fr]">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputCls}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Email actions
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSendConfirmation}
                disabled={sendingConfirmation}
                className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
              >
                {sendingConfirmation
                  ? "Sending…"
                  : "Send confirmation email"}
              </button>
              <button
                onClick={handleSendPayment}
                disabled={sendingPayment}
                className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {sendingPayment ? "Sending…" : "Send payment link"}
              </button>
            </div>
            {emailMsg && (
              <p
                className={`mt-2 rounded-lg px-3 py-2 text-sm ${
                  emailMsg.kind === "ok"
                    ? "bg-emerald-50 text-accent"
                    : "bg-red-50 text-red-700"
                }`}
                role="status"
              >
                {emailMsg.text}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt"
        >
          {linkCopied ? "Copied!" : "Copy payment link"}
        </button>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-mono text-xs text-muted">{paymentLink}</p>
        {saveMsg && (
          <p
            className={
              saveMsg.kind === "ok" ? "text-accent" : "text-red-600"
            }
          >
            {saveMsg.text}
          </p>
        )}
      </div>

      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-red-700">
          Close case — no item found
        </h3>
        <p className="mt-2 text-sm text-body">
          Sends the &lsquo;no item found&rsquo; email to the customer
          (&ldquo;no charge since we didn&rsquo;t find it&rdquo;) and marks
          the case as closed. The send is also recorded in the activity log.
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
        {closeMsg && (
          <p
            className={`mt-3 text-sm ${
              closeMsg.kind === "ok" ? "text-accent" : "text-red-600"
            }`}
          >
            {closeMsg.text}
          </p>
        )}
      </div>

      <ActivityLog entries={report.activity_log} />
    </div>
  );
}

function ActivityLog({ entries }) {
  const list = Array.isArray(entries) ? entries : [];
  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Activity log
      </h3>
      {list.length === 0 ? (
        <p className="mt-2 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          No activity recorded yet.
        </p>
      ) : (
        <ol className="mt-3 space-y-3">
          {list.map((entry, i) => (
            <li
              key={i}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {entry?.action || "event"}
                </span>
                <span className="text-xs text-muted">
                  {entry?.timestamp
                    ? formatDateTime(entry.timestamp)
                    : "—"}
                </span>
              </div>
              {entry?.note && (
                <p className="mt-1 text-sm text-foreground">{entry.note}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function DetailsBlock({ report }) {
  const rows = [
    ["Category", report.category],
    ["Brand / Model", report.brand_model],
    ["Color", report.color],
    ["Description", report.item_description],
    ["Distinguishing features", report.distinguishing_features],
    ["Location", report.location],
    ["Specific location", report.location_detail],
    ["Plan", report.plan === "all_in_one" ? "All-in-One ($79)" : "Recovery ($39)"],
    ["Date lost", formatDate(report.date_lost)],
    ["Date confidence", report.date_confidence],
    ["Time of day", report.time_lost],
    ["Additional info", report.additional_info],
    ["Submitted", formatDateTime(report.created_at)],
  ];
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Submission
      </h3>
      <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-alt">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm sm:grid-cols-4"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="col-span-2 break-words text-foreground sm:col-span-3">
              {v || <span className="text-muted/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function SystemStatus({ password, onUnauthorized }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      if (!res.ok) {
        setError("Health check failed.");
        return;
      }
      setData(await res.json());
    } catch (err) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [password, onUnauthorized]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">System status</h2>
          <p className="mt-1 text-sm text-muted">
            Verifies Supabase reachability and presence of every required env
            var.
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Checking…" : "Run checks"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {data && (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Database
            </h3>
            <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
              <StatusRow
                label="Supabase (reports table)"
                ok={data.supabase?.ok}
                detail={
                  data.supabase?.ok
                    ? `Connected${
                        typeof data.supabase.count === "number"
                          ? ` · ${data.supabase.count} rows`
                          : ""
                      }`
                    : `Not configured${
                        data.supabase?.error ? ` · ${data.supabase.error}` : ""
                      }`
                }
              />
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Environment variables
            </h3>
            <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
              {ENV_LABELS.map((key) => (
                <StatusRow
                  key={key}
                  label={key}
                  ok={!!data.env?.[key]}
                  detail={data.env?.[key] ? "Connected" : "Not configured"}
                />
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusRow({ label, ok, detail }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="flex items-center gap-3">
        {ok ? (
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-accent"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        )}
        <span className="font-mono text-[13px] text-foreground">{label}</span>
      </div>
      <span className={`text-xs ${ok ? "text-muted" : "text-red-600"}`}>
        {detail}
      </span>
    </li>
  );
}
