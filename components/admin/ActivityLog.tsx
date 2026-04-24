"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format";

type ActivityLogProps = {
  entries: any;
  caseNumber: string;
  password: string;
  onUnauthorized?: () => void;
  onAdded?: () => void;
};

export default function ActivityLog({
  entries,
  caseNumber,
  password,
  onUnauthorized,
  onAdded,
}: ActivityLogProps) {
  const list: any[] = Array.isArray(entries) ? entries : [];
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
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
    } catch (err: any) {
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
