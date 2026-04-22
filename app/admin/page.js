"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

const SESSION_KEY = "lfk_admin_password";

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

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPassword("");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="bg-navy text-white">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
            <Link
              href="/"
              className="font-serif text-xl tracking-tight text-white"
            >
              Lost & Found Korea
            </Link>
            <span className="text-sm text-slate-300">Admin</span>
          </div>
        </header>
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
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
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
      <header className="bg-navy text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="font-serif text-xl tracking-tight text-white"
          >
            Lost & Found Korea
          </Link>
          <button
            onClick={logout}
            className="text-sm text-slate-300 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8 sm:py-12">
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Admin
        </h1>
        <p className="mt-2 text-body">
          Dashboard scaffold. Reports table, recovery editor, and payment-link
          tools land here once the full admin spec lands.
        </p>
        <SystemStatus password={password} onUnauthorized={logout} />
      </main>
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
    <section className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
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
