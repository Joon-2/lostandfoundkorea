"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import CaseList from "@/components/admin/CaseList";

const SESSION_KEY = "lfk_admin_password";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

function AdminHeader({ onLogout }: { onLogout?: () => void }) {
  return (
    <Header
      variant="simple"
      action={
        onLogout ? (
          <button
            onClick={onLogout}
            className="text-sm text-body transition-colors hover:text-black"
          >
            Sign out
          </button>
        ) : (
          <span className="text-sm text-body">Admin</span>
        )
      }
    />
  );
}

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
        <CaseList password={password} onUnauthorized={logout} />
      </main>
    </div>
  );
}
