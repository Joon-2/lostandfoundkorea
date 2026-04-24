"use client";

import { useState } from "react";
import { inputCls } from "@/components/admin/styles";

type NoteFormProps = {
  caseNumber: string;
  password: string;
  onUnauthorized?: () => void;
  onAdded?: () => void;
  placeholder?: string;
  buttonLabel?: string;
};

export default function NoteForm({
  caseNumber,
  password,
  onUnauthorized,
  onAdded,
  placeholder,
  buttonLabel = "Save note",
}: NoteFormProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
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
    } catch (error: any) {
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
