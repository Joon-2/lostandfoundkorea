"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDate, formatDateTime } from "@/lib/format";
import { PROCESS_STAGES } from "@/lib/process-stages";
import { processImage } from "@/lib/image-processing";
import Header from "@/components/Header";

const STATUS_OPTIONS = ["pending", "found", "paid", "closed"];
const STATUS_LABELS = {
  pending: "Pending",
  found: "Found",
  paid: "Paid",
  closed: "Closed",
};
const STATUS_BADGE = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  found: "bg-sky-50 text-sky-700 border-sky-200",
  paid: "bg-emerald-50 text-accent border-emerald-200",
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-8">
        <Dashboard password={password} onUnauthorized={logout} />
      </main>
    </div>
  );
}

function AdminHeader({ onLogout }) {
  return (
    <Header
      variant="simple"
      action={
        onLogout ? (
          <button
            onClick={onLogout}
            className="text-sm text-[#4a5568] transition-colors hover:text-black"
          >
            Sign out
          </button>
        ) : (
          <span className="text-sm text-[#4a5568]">Admin</span>
        )
      }
    />
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
      console.log(
        "[fetchReports] received",
        (json.reports || []).length,
        "reports. found_images summary:",
        (json.reports || []).map((r) => ({
          case_number: r.case_number,
          found_images: Array.isArray(r.found_images)
            ? r.found_images.length
            : typeof r.found_images,
        }))
      );
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
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">
          Reports
        </h1>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
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
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {filtered.length === 0 && !loading && (
          <p className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted">
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
    </>
  );
}

function StatsRow({ stats }) {
  const items = [
    { label: "Total cases", value: stats.total },
    { label: "Pending", value: stats.pending, tone: "amber" },
    { label: "Found", value: stats.found, tone: "sky" },
    { label: "Paid", value: stats.paid, tone: "emerald" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, tone: "emerald" },
  ];
  const toneColor = {
    amber: "text-amber-700",
    emerald: "text-accent",
    sky: "text-sky-700",
  };
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm"
        >
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted">
            {it.label}
          </div>
          <div
            className={`mt-0.5 font-serif text-xl tracking-tight ${
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
  const compact =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by case number, name, or email"
        className={compact + " sm:flex-1"}
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={compact + " sm:w-44"}
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
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-left"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-sm font-semibold text-foreground">
            {report.case_number || "—"}
          </span>
          <span className="text-sm text-foreground">{report.name}</span>
          <span className="text-xs text-muted">{report.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}
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

const LOCATION_TYPES = [
  {
    key: "taxi",
    label: "Taxi",
    match: /taxi|cab|uber|kakao\s*t|택시|카카오/i,
    contacts: [
      { name: "Kakao T", phone: "1599-9400" },
      { name: "Seoul taxi dispatch", phone: "02-120" },
      { name: "T-money / lost items center", phone: "1644-1188" },
    ],
  },
  {
    key: "subway",
    label: "Subway / Train",
    match: /subway|metro|station|line\s*\d|ktx|korail|지하철|역|전철/i,
    contacts: [
      { name: "Lost112", phone: "182" },
      { name: "Seoul Metro lost & found", phone: "02-6311-6765" },
      { name: "Korail", phone: "1544-7788" },
    ],
  },
  {
    key: "bus",
    label: "Bus",
    match: /\bbus\b|버스/i,
    contacts: [
      { name: "Seoul bus", phone: "02-120" },
      { name: "Lost112", phone: "182" },
    ],
  },
  {
    key: "restaurant",
    label: "Restaurant / Cafe",
    match: /restaurant|cafe|coffee|\bbar\b|pub|diner|식당|카페|음식점/i,
    contacts: [
      { name: "Naver Map", link: "https://map.naver.com/" },
      { name: "Kakao Map", link: "https://map.kakao.com/" },
      { hint: "Find the venue on the map and call the number in its listing." },
    ],
  },
  {
    key: "hotel",
    label: "Hotel / Accommodation",
    match: /hotel|hostel|airbnb|motel|guesthouse|호텔|민박/i,
    contacts: [{ hint: "Call the hotel front desk directly." }],
  },
  {
    key: "airport",
    label: "Airport",
    match: /airport|incheon|gimpo|\bicn\b|\bgmp\b|공항/i,
    contacts: [
      { name: "Incheon Airport lost & found", phone: "032-741-3110" },
      { name: "Gimpo Airport lost & found", phone: "02-2660-2285" },
    ],
  },
  {
    key: "street",
    label: "Street / Park",
    match: /street|park|road|avenue|sidewalk|공원|거리|도로/i,
    contacts: [
      { hint: "Call the nearest police station." },
      { name: "Lost112", phone: "182" },
    ],
  },
  {
    key: "attraction",
    label: "Tourist Attraction",
    match: /palace|museum|tower|\bmarket\b|\bmall\b|경복궁|남산|박물관|시장/i,
    contacts: [{ hint: "Call the venue directly." }],
  },
];

function detectLocationType(report) {
  const hay = [report.location, report.location_detail, report.category]
    .filter(Boolean)
    .join(" ");
  for (const t of LOCATION_TYPES) {
    if (t.match.test(hay)) return t.key;
  }
  return "street";
}

function StatusPill({ msg }) {
  if (!msg) return null;
  return (
    <p
      className={`mt-2 rounded-lg px-3 py-2 text-sm ${
        msg.kind === "ok"
          ? "bg-emerald-50 text-accent"
          : "bg-red-50 text-red-700"
      }`}
      role="status"
    >
      {msg.text}
    </p>
  );
}

function StageBanner({ tone = "muted", children }) {
  const tones = {
    muted: "border-border bg-alt text-body",
    emerald: "border-accent/40 bg-emerald-50 text-accent",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

function SummaryRow({ report }) {
  const plan =
    report.plan === "all_in_one" ? "All-in-One ($79)" : "Recovery ($39)";
  const items = [
    ["Case", report.case_number || "—"],
    ["Item", report.category || "—"],
    ["Location", report.location || "—"],
    ["Plan", plan],
    ["Submitted", formatDate(report.created_at) || "—"],
  ];
  return (
    <div className="mb-6 grid gap-3 rounded-2xl border border-border bg-alt px-4 py-3 text-sm sm:grid-cols-5">
      {items.map(([k, v]) => (
        <div key={k}>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
            {k}
          </div>
          <div className="mt-0.5 break-words font-medium text-foreground">
            {v}
          </div>
        </div>
      ))}
    </div>
  );
}

function SummaryLine({ report }) {
  const parts = [
    report.case_number,
    report.category,
    report.color,
    report.location,
  ].filter(Boolean);
  return (
    <p className="mb-5 rounded-xl border border-border bg-alt px-4 py-2 text-sm text-body">
      <span className="font-medium text-foreground">
        {report.name || "Customer"}
      </span>{" "}
      · {parts.join(" · ") || "—"}
    </p>
  );
}

function RecoveryReadonly({ report }) {
  const items = [
    ["Recovery location", report.recovery_location],
    ["Contact phone", report.recovery_contact],
    ["Operating hours", report.recovery_hours],
    ["English pickup instructions", report.recovery_instructions],
  ];
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Recovery details
      </h3>
      <dl className="mt-3 divide-y divide-border rounded-xl border border-border bg-alt">
        {items.map(([k, v]) => (
          <div
            key={k}
            className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm sm:grid-cols-4"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="col-span-2 whitespace-pre-wrap break-words text-foreground sm:col-span-3">
              {v || <span className="text-muted/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RecoveryForm({
  recoveryLocation,
  setRecoveryLocation,
  recoveryContact,
  setRecoveryContact,
  recoveryHours,
  setRecoveryHours,
  recoveryInstructions,
  setRecoveryInstructions,
}) {
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

function SearchPlanPanel({ report, selectedKey, onChange }) {
  const type = LOCATION_TYPES.find((t) => t.key === selectedKey) || LOCATION_TYPES[0];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Search plan
        </h3>
        <label className="flex items-center gap-2 text-xs text-muted">
          <span>Type</span>
          <select
            value={selectedKey}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {LOCATION_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs text-muted">
        Detected from:{" "}
        <span className="text-foreground">
          {report.location || "—"}
          {report.location_detail ? ` — ${report.location_detail}` : ""}
        </span>
      </p>
      <div className="mt-3 rounded-xl border border-border bg-alt p-4">
        <div className="text-sm font-semibold text-foreground">{type.label}</div>
        <ul className="mt-2 space-y-1.5 text-sm">
          {type.contacts.map((c, i) => (
            <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-body">
              {c.name && (
                <span className="font-medium text-foreground">{c.name}</span>
              )}
              {c.phone && (
                <a
                  href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                  className="font-mono text-accent hover:underline"
                >
                  {c.phone}
                </a>
              )}
              {c.link && (
                <a
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {c.link.replace(/^https?:\/\//, "")}
                </a>
              )}
              {c.hint && <span className="text-muted">{c.hint}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RequestInfoForm({ report, password, onUnauthorized, onSent }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSend = async () => {
    if (sending) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/request-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
          infoText: trimmed,
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Send failed");
      setText("");
      setMsg({ kind: "ok", text: `Request sent to ${report.email}.` });
      onSent?.();
    } catch (err) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Request more info
      </h3>
      <p className="mt-1 text-sm text-muted">
        Ask the customer for missing details. We&rsquo;ll email them and log
        the request in this case.
      </p>
      <textarea
        className={`${inputCls} mt-3 min-h-28 resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          "e.g. Can you describe the case color? Do you remember the taxi number? What time exactly did you get out?"
        }
      />
      <div className="mt-3">
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send request email"}
        </button>
      </div>
      <StatusPill msg={msg} />
    </div>
  );
}

function NoteForm({ caseNumber, password, onUnauthorized, onAdded, placeholder, buttonLabel = "Save note" }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/add-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ caseNumber, note: trimmed }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      setText("");
      onAdded?.();
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <textarea
        className={`${inputCls} min-h-24 resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        maxLength={1000}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || !text.trim()}
          className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {saving ? "Saving…" : buttonLabel}
        </button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}

function StageReceived({
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
}) {
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

function StageSearching({
  report,
  password,
  onUnauthorized,
  onAdvance,
  stageMoving,
  stageMsg,
  onUpdate,
  refreshThisCase,
}) {
  const [typeKey, setTypeKey] = useState(() => detectLocationType(report));
  const [closeReason, setCloseReason] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeMsg, setCloseMsg] = useState(null);

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
        const updated = (fresh.reports || []).find((r) => r.id === report.id);
        if (updated) onUpdate(updated);
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

  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Searching.</strong> Work the contacts
        for this location type and log progress as you go.
      </StageBanner>
      <SummaryRow report={report} />
      <SearchPlanPanel report={report} selectedKey={typeKey} onChange={setTypeKey} />
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

function StageFound({
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
}) {
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
      <FoundImagesEditor
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

function StagePaymentSent({
  report,
  paymentLink,
  onCopyLink,
  linkCopied,
  onResendPayment,
  sendingPayment,
  emailMsg,
  amount,
}) {
  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Payment link sent.</strong> Waiting
        for the customer to pay ${amount}. They&rsquo;ll receive recovery
        details automatically on payment.
      </StageBanner>
      <SummaryLine report={report} />
      <RecoveryReadonly report={report} />
      {Array.isArray(report.found_images) && report.found_images.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Found Item Photos
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {report.found_images.map((src, i) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-lg border border-border bg-alt"
              >
                <img
                  src={src}
                  alt={`Found photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onResendPayment}
          disabled={sendingPayment}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sendingPayment ? "Sending…" : "Resend payment link"}
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

function StagePaid({ report, plan, onAdvance, stageMoving, stageMsg }) {
  return (
    <div className="space-y-6">
      <StageBanner tone="emerald">
        <strong className="font-semibold">Payment received.</strong>{" "}
        {report.paypal_transaction_id ? (
          <>
            Transaction{" "}
            <span className="font-mono text-xs">
              {report.paypal_transaction_id}
            </span>
            .
          </>
        ) : (
          "No transaction ID on file."
        )}
      </StageBanner>
      <SummaryLine report={report} />
      <RecoveryReadonly report={report} />
      {Array.isArray(report.found_images) && report.found_images.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Found Item Photos
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {report.found_images.map((src, i) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-lg border border-border bg-alt"
              >
                <img
                  src={src}
                  alt={`Found photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Customer authorization
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted">ID / signed authorization:</span>
          {report.authorization_url ? (
            <a
              href={report.authorization_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline"
            >
              Uploaded — View
            </a>
          ) : (
            <span className="font-medium text-amber-700">
              Not uploaded yet
            </span>
          )}
        </div>
      </div>
      {plan === "all_in_one" ? (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Shipping address
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
            {report.shipping_address || (
              <span className="text-amber-700">
                Not provided yet — ask the customer on WhatsApp.
              </span>
            )}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-body">
              All-in-One plan. Arrange pickup with the holder, then advance
              this case to the Pickup stage.
            </p>
            <button
              onClick={onAdvance}
              disabled={stageMoving}
              className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {stageMoving ? "Advancing…" : "Arrange pickup →"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-alt p-5 text-sm text-body">
          Pickup instructions have been sent to the customer via the recovery
          email. They will collect the item themselves.
        </div>
      )}
      <StatusPill msg={stageMsg} />
    </div>
  );
}

function StagePickup({
  report,
  trackingNumber,
  setTrackingNumber,
  shippingMethod,
  setShippingMethod,
  estimatedDelivery,
  setEstimatedDelivery,
  onSave,
  saving,
  saveMsg,
  onMarkShipped,
  shipping,
  onAdvance,
  stageMoving,
  stageMsg,
}) {
  return (
    <div className="space-y-6">
      <StageBanner tone="muted">
        <strong className="font-semibold">Pickup &amp; shipping.</strong> Enter
        tracking details, mark as shipped, and complete the case on delivery.
      </StageBanner>
      <SummaryLine report={report} />
      <RecoveryReadonly report={report} />
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Shipping details
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="Tracking number">
            <input
              type="text"
              className={inputCls}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
            />
          </Field>
          <Field label="Shipping method">
            <input
              type="text"
              className={inputCls}
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value)}
              placeholder="e.g. DHL Express, Korea Post EMS"
            />
          </Field>
          <Field label="Estimated delivery">
            <input
              type="date"
              className={inputCls}
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
          </Field>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save shipping details"}
        </button>
        <button
          onClick={onMarkShipped}
          disabled={shipping}
          className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
        >
          {shipping ? "Logging…" : "Mark as shipped"}
        </button>
        <button
          onClick={onAdvance}
          disabled={stageMoving}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {stageMoving ? "Advancing…" : "Mark as completed →"}
        </button>
      </div>
      <StatusPill msg={saveMsg} />
      <StatusPill msg={stageMsg} />
    </div>
  );
}

function StageCompleted({ report }) {
  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-accent">
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
        Case completed
      </div>
      <SummaryLine report={report} />
      <DetailsBlock report={report} />
      <UserImages images={report.user_images} />
      <RecoveryReadonly report={report} />
      {Array.isArray(report.found_images) && report.found_images.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Found Item Photos
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {report.found_images.map((src, i) => (
              <a
                key={src + i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-lg border border-border bg-alt"
              >
                <img
                  src={src}
                  alt={`Found photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}
      <dl className="divide-y divide-border rounded-xl border border-border bg-alt">
        {[
          ["Tracking number", report.tracking_number],
          ["Shipping method", report.shipping_method],
          ["Estimated delivery", formatDate(report.estimated_delivery)],
          ["Transaction ID", report.paypal_transaction_id],
        ].map(([k, v]) => (
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

function ReportEditor({ report, password, onUnauthorized, onUpdate }) {
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
  const [trackingNumber, setTrackingNumber] = useState(
    report.tracking_number || ""
  );
  const [shippingMethod, setShippingMethod] = useState(
    report.shipping_method || ""
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    report.estimated_delivery || ""
  );

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [emailMsg, setEmailMsg] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [sendingPayment, setSendingPayment] = useState(false);
  const [stageMoving, setStageMoving] = useState(false);
  const [stageMsg, setStageMsg] = useState(null);
  const [shipping, setShipping] = useState(false);

  const currentStage = report.process_stage || "received";
  const plan = report.plan === "all_in_one" ? "all_in_one" : "recovery";
  const amount = plan === "all_in_one" ? 79 : 39;
  const paymentLink = `https://lostandfoundkorea.com/pay/${report.case_number || ""}`;

  const flashEmail = (msg) => {
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
      const updated = (fresh.reports || []).find((r) => r.id === report.id);
      if (updated) onUpdate(updated);
    } catch (err) {
      console.error("[refreshThisCase] failed:", err);
    }
  };

  const advanceToStage = async (stageKey) => {
    if (stageMoving) return;
    const stage = PROCESS_STAGES.find((s) => s.key === stageKey);
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
    } catch (err) {
      setStageMsg({ kind: "err", text: err.message });
    } finally {
      setStageMoving(false);
    }
  };

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
          tracking_number: trackingNumber,
          shipping_method: shippingMethod,
          estimated_delivery: estimatedDelivery,
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
    } catch (err) {
      flashEmail({
        kind: "err",
        text: `Confirmation email failed: ${err.message}`,
      });
    } finally {
      setSendingConfirmation(false);
    }
  };

  const handleSendPayment = async ({ advance = false } = {}) => {
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
    } catch (err) {
      flashEmail({
        kind: "err",
        text: `Payment email failed: ${err.message}`,
      });
    } finally {
      setSendingPayment(false);
    }
  };

  const handleMarkShipped = async () => {
    if (shipping) return;
    setShipping(true);
    setStageMsg(null);
    try {
      const res = await fetch("/api/admin/mark-shipped", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ caseNumber: report.case_number }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      await refreshThisCase();
      setStageMsg({ kind: "ok", text: "Marked as shipped." });
    } catch (err) {
      setStageMsg({ kind: "err", text: err.message });
    } finally {
      setShipping(false);
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
      <StageTracker
        report={report}
        password={password}
        onUnauthorized={onUnauthorized}
        onUpdate={onUpdate}
      />

      {currentStage === "received" && (
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

      {currentStage === "searching" && (
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

      {currentStage === "found" && (
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

      {currentStage === "payment_sent" && (
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

      {currentStage === "paid" && (
        <StagePaid
          report={report}
          plan={plan}
          onAdvance={() => advanceToStage("pickup")}
          stageMoving={stageMoving}
          stageMsg={stageMsg}
        />
      )}

      {currentStage === "pickup" && (
        <StagePickup
          report={report}
          trackingNumber={trackingNumber}
          setTrackingNumber={setTrackingNumber}
          shippingMethod={shippingMethod}
          setShippingMethod={setShippingMethod}
          estimatedDelivery={estimatedDelivery}
          setEstimatedDelivery={setEstimatedDelivery}
          onSave={handleSave}
          saving={saving}
          saveMsg={saveMsg}
          onMarkShipped={handleMarkShipped}
          shipping={shipping}
          onAdvance={() => advanceToStage("completed")}
          stageMoving={stageMoving}
          stageMsg={stageMsg}
        />
      )}

      {currentStage === "completed" && <StageCompleted report={report} />}

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

function ActivityLog({ entries, caseNumber, password, onUnauthorized, onAdded }) {
  const list = Array.isArray(entries) ? entries : [];
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (saving) return;
    const trimmed = note.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/add-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ caseNumber, note: trimmed }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Failed");
      setNote("");
      onAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Activity log
      </h3>

      <form
        onSubmit={handleAdd}
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start"
      >
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note to this case…"
          maxLength={500}
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={!note.trim() || saving}
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Adding…" : "Add note"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {list.length === 0 ? (
        <p className="mt-3 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          No activity recorded yet.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {list.map((entry, i) => {
            const text = entry?.note || entry?.action || "event";
            return (
              <li
                key={i}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <p className="flex-1 text-sm text-foreground">{text}</p>
                <span className="whitespace-nowrap text-xs text-muted">
                  {entry?.user || "admin"}
                  {" · "}
                  {entry?.timestamp ? formatDateTime(entry.timestamp) : "—"}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function UserImages({ images }) {
  const list = Array.isArray(images) ? images : [];
  if (list.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Customer Photos
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {list.map((src, i) => (
          <a
            key={src + i}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-square overflow-hidden rounded-lg border border-border bg-alt"
          >
            <img
              src={src}
              alt={`User photo ${i + 1}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function FoundImagesEditor({
  caseNumber,
  images,
  password,
  onUnauthorized,
  onChange,
}) {
  const list = Array.isArray(images) ? images : [];
  const [uploading, setUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState(null);
  const [deletingUrl, setDeletingUrl] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    console.log(
      "[FoundImagesEditor] images prop for",
      caseNumber,
      "— type:",
      Array.isArray(images) ? "array" : typeof images,
      "length:",
      Array.isArray(images) ? images.length : "n/a",
      images
    );
  }, [images, caseNumber]);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected || uploading) return;
    setUploading(true);
    setMsg(null);
    try {
      console.log("[upload] selected file:", {
        name: selected.name,
        size: selected.size,
        type: selected.type,
      });

      const processed = await processImage(selected, (text) =>
        setProgressStatus(text)
      );
      console.log("[upload] processed blob size:", processed.size);
      setProgressStatus("Uploading…");

      const jpegFile = new File(
        [processed],
        `${caseNumber}-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );
      const fd = new FormData();
      fd.append("file", jpegFile);
      fd.append("caseNumber", caseNumber);

      const res = await fetch("/api/admin/upload-found-image", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      console.log("[upload] response status:", res.status);
      console.log(
        "[upload] response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      console.log("[upload] response body:", json);

      if (!res.ok || !json.ok) {
        const parts = [json.error || json.hint || "Upload failed"];
        if (json.hint && json.hint !== json.error) parts.push(json.hint);
        if (json.bucket) parts.push(`bucket: ${json.bucket}`);
        if (json.debug?.statusCode) parts.push(`status: ${json.debug.statusCode}`);
        if (json.debug?.code) parts.push(`code: ${json.debug.code}`);
        throw new Error(parts.join(" · "));
      }
      onChange(json.images);
      setMsg({ kind: "ok", text: "Photo uploaded." });
    } catch (err) {
      console.error("[upload] failed:", err);
      setMsg({ kind: "err", text: err.message });
    } finally {
      setUploading(false);
      setProgressStatus(null);
      e.target.value = "";
    }
  };

  const handleDelete = async (url) => {
    if (deletingUrl) return;
    if (!window.confirm("Delete this photo?")) return;
    setDeletingUrl(url);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/delete-found-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ caseNumber, url }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Delete failed");
      }
      onChange(json.images);
    } catch (err) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Found Item Photos
      </h3>
      <p className="mt-1 text-sm text-muted">
        Up to 5 photos. Any image format works (JPG, PNG, WebP, HEIC from
        iPhone, etc.) — photos are compressed to JPEG in the browser
        before upload. Shown on the customer&rsquo;s /pay page once their
        case is marked found.
      </p>

      {list.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {list.map((src, i) => (
            <div
              key={src + i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-alt"
            >
              <a href={src} target="_blank" rel="noopener noreferrer">
                <img
                  src={src}
                  alt={`Found photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
              <button
                type="button"
                onClick={() => handleDelete(src)}
                disabled={deletingUrl === src}
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow ring-1 ring-red-200 transition-colors hover:bg-red-50 disabled:opacity-60"
                aria-label="Delete photo"
              >
                {deletingUrl === src ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {list.length >= 5 ? (
        <p className="mt-4 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          Photo limit reached (5 / 5). Delete a photo to upload a new one.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*,.heic,.heif,.bmp,.tif,.tiff,.svg,.raw"
            onChange={handleFileChange}
            disabled={uploading}
            className="block text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-border file:bg-alt file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-card disabled:opacity-60 disabled:file:opacity-60"
          />
          {progressStatus && (
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              {progressStatus}
            </span>
          )}
        </div>
      )}

      {msg && msg.kind === "err" && (
        <div
          role="alert"
          className="mt-3 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-lg leading-none text-red-600">
              ⚠
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Upload failed</p>
              <p className="mt-1 break-words text-red-700">{msg.text}</p>
              <p className="mt-2 text-xs text-red-600/80">
                Open the browser console and the Vercel Functions logs for
                the full error object.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMsg(null)}
              className="flex-none rounded-full p-1 text-red-600 hover:bg-red-100"
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {msg && msg.kind === "ok" && (
        <p
          className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-accent"
          role="status"
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}

function StageTracker({ report, password, onUnauthorized, onUpdate, onStatusChange }) {
  const currentKey = report.process_stage || "received";
  const currentIdx = Math.max(
    0,
    PROCESS_STAGES.findIndex((s) => s.key === currentKey)
  );
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState(null);

  const changeStage = async (stage) => {
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
      onStatusChange?.(json.report.status || stage.status);
    } catch (err) {
      setError(err.message);
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-border bg-alt p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
          Process stage
        </h3>
        {changing && <span className="text-xs text-muted">Updating…</span>}
      </div>
      <ol className="flex items-start overflow-x-auto pb-1">
        {PROCESS_STAGES.map((stage, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = i === currentIdx;
          const lineActive = i < currentIdx;
          return (
            <li key={stage.key} className="flex items-start">
              <button
                type="button"
                onClick={() => changeStage(stage)}
                disabled={changing}
                className="flex min-w-[72px] flex-col items-center gap-1.5 px-1 disabled:opacity-60"
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
                  className={`text-[11px] leading-tight ${
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
              {i < PROCESS_STAGES.length - 1 && (
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
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
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

