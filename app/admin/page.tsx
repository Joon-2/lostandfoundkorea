"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminSidebar, { type SidebarKey } from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import CaseList from "@/components/admin/CaseList";
import FacilitiesView from "@/components/admin/FacilitiesView";
import DeliveriesView from "@/components/admin/DeliveriesView";
import LeadsView from "@/components/admin/LeadsView";
import ComingSoon from "@/components/admin/ComingSoon";

const SESSION_KEY = "lfk_admin_password";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

// Per-section breadcrumb + page metadata. Sections that aren't built
// yet reuse <ComingSoon> with their own copy so the visual layout is
// complete even though the screen behind the sidebar item doesn't
// exist.
const SECTIONS: Record<
  SidebarKey,
  {
    section: string;
    page: string;
    comingSoon?: { title: string; description?: string };
  }
> = {
  dashboard: { section: "Overview", page: "Dashboard", comingSoon: { title: "Dashboard" } },
  reports: { section: "Operations", page: "Reports" },
  facilities: { section: "Operations", page: "Facilities" },
  deliveries: { section: "Operations", page: "Deliveries" },
  leads: { section: "Sales", page: "Leads" },
  payments: { section: "Finance", page: "Payments", comingSoon: { title: "Payments" } },
  revenue: { section: "Finance", page: "Revenue", comingSoon: { title: "Revenue" } },
  users: { section: "System", page: "Users", comingSoon: { title: "Users" } },
  settings: { section: "System", page: "Settings", comingSoon: { title: "Settings" } },
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem(SESSION_KEY)
        : null;
    if (stored) {
      setPassword(stored);
      setAuthed(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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
      <SignInScreen
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
        authError={authError}
      />
    );
  }

  return <AdminShell password={password} onLogout={logout} />;
}

// ─── Sign-in card ────────────────────────────────────────────────────────

function SignInScreen({
  password,
  onPasswordChange,
  onSubmit,
  authError,
}: {
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  authError: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-alt px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-card">
        <h1 className="font-serif text-2xl tracking-tight">Admin sign-in</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the admin password to continue.
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
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
    </div>
  );
}

// Read ?section=deliveries from the URL on first paint so the
// "View delivery →" link in CaseDetail lands on the right tab.
function initialSection(): SidebarKey {
  if (typeof window === "undefined") return "reports";
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("section");
  const valid: SidebarKey[] = [
    "dashboard",
    "reports",
    "facilities",
    "deliveries",
    "leads",
    "payments",
    "revenue",
    "users",
    "settings",
  ];
  return valid.includes(requested as SidebarKey)
    ? (requested as SidebarKey)
    : "reports";
}

// ─── Authenticated shell ────────────────────────────────────────────────

function AdminShell({
  password,
  onLogout,
}: {
  password: string;
  onLogout: () => void;
}) {
  const [section, setSection] = useState<SidebarKey>(() => initialSection());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { "x-admin-password": password },
        cache: "no-store",
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to load reports");
      }
      const json = await res.json();
      setReports(json.reports || []);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, onLogout]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateReport = useCallback((updated: any) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }, []);

  const counts = useMemo(() => {
    return { reports: reports.length };
  }, [reports]);

  const meta = SECTIONS[section];
  const isReports = section === "reports";
  const isDeliveries = section === "deliveries";
  // Reports + Deliveries both read from the lifted `reports` list, so the
  // top-bar Refresh button is meaningful on either. Export + New Report
  // stay scoped to Reports.
  const showTopActions = isReports || isDeliveries;

  const handleExport = () => {
    if (!isReports) return;
    const headers = [
      "case_number",
      "name",
      "email",
      "status",
      "category",
      "location",
      "date_lost",
      "created_at",
    ];
    const escape = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = reports.map((r) =>
      headers.map((h) => escape((r as any)[h])).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `cases-${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-alt md:grid-cols-[240px_1fr]">
      <AdminSidebar
        activeKey={section}
        onSelect={(k) => setSection(k)}
        counts={counts}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        onLogout={onLogout}
      />

      <div className="flex min-w-0 flex-col">
        <AdminTopBar
          section={meta.section}
          page={meta.page}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
          refreshing={loading}
          onRefresh={showTopActions ? fetchReports : undefined}
          onExport={isReports ? handleExport : undefined}
          showActions={showTopActions}
          showNewReport={isReports}
        />

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          {section === "reports" && (
            <CaseList
              reports={reports}
              loading={loading}
              loadError={loadError}
              password={password}
              onUnauthorized={onLogout}
              onUpdate={updateReport}
            />
          )}
          {section === "facilities" && (
            <FacilitiesView password={password} onUnauthorized={onLogout} />
          )}
          {section === "deliveries" && (
            <DeliveriesView
              reports={reports}
              loading={loading}
              loadError={loadError}
              password={password}
              onUnauthorized={onLogout}
              onUpdate={updateReport}
            />
          )}
          {section === "leads" && (
            <LeadsView password={password} onUnauthorized={onLogout} />
          )}
          {meta.comingSoon && (
            <ComingSoon
              title={meta.comingSoon.title}
              description={meta.comingSoon.description}
            />
          )}
        </main>
      </div>
    </div>
  );
}
