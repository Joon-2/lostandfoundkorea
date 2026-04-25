"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/config/categories";
import { inputCls } from "@/components/admin/styles";
import Field from "@/components/admin/Field";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import type { Facility, FacilityCategory } from "@/types/facility";

type FacilityFormProps = {
  facility: Facility | null; // null = create mode
  password: string;
  onUnauthorized?: () => void;
  onSaved: (facility: Facility) => void;
  onDeleted?: (id: string) => void;
  onClose: () => void;
};

type FormState = {
  category: FacilityCategory | "";
  name: string;
  name_ko: string;
  phone: string;
  phone_2: string;
  email: string;
  hours: string;
  hours_note: string;
  address_en: string;
  address_ko: string;
  website: string;
  location_detail: string;
  notes: string;
  how_to_report: string;
  how_to_trace: string;
  retention_period: string;
  tags: string;
  sort_order: string;
  is_active: boolean;
};

function emptyState(): FormState {
  return {
    category: "",
    name: "",
    name_ko: "",
    phone: "",
    phone_2: "",
    email: "",
    hours: "",
    hours_note: "",
    address_en: "",
    address_ko: "",
    website: "",
    location_detail: "",
    notes: "",
    how_to_report: "",
    how_to_trace: "",
    retention_period: "",
    tags: "",
    sort_order: "",
    is_active: true,
  };
}

function fromFacility(f: Facility): FormState {
  return {
    category: f.category,
    name: f.name || "",
    name_ko: f.name_ko || "",
    phone: f.phone || "",
    phone_2: f.phone_2 || "",
    email: f.email || "",
    hours: f.hours || "",
    hours_note: f.hours_note || "",
    address_en: f.address_en || "",
    address_ko: f.address_ko || "",
    website: f.website || "",
    location_detail: f.location_detail || "",
    notes: f.notes || "",
    how_to_report: f.how_to_report || "",
    how_to_trace: f.how_to_trace || "",
    retention_period: f.retention_period || "",
    tags: Array.isArray(f.tags) ? f.tags.join(", ") : "",
    sort_order: f.sort_order != null ? String(f.sort_order) : "",
    is_active: f.is_active,
  };
}

export default function FacilityForm({
  facility,
  password,
  onUnauthorized,
  onSaved,
  onDeleted,
  onClose,
}: FacilityFormProps) {
  const isEdit = facility !== null;
  const [data, setData] = useState<FormState>(() =>
    facility ? fromFacility(facility) : emptyState()
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<StatusMsg | null>(null);

  // Lock body scroll while modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const v = target.type === "checkbox" ? target.checked : target.value;
      setData((d) => ({ ...d, [key]: v as FormState[K] }));
    };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setMsg(null);
    if (!data.category) {
      setMsg({ kind: "err", text: "Category is required." });
      return;
    }
    if (!data.name.trim()) {
      setMsg({ kind: "err", text: "Name (English) is required." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category: data.category,
        name: data.name,
        name_ko: data.name_ko,
        phone: data.phone,
        phone_2: data.phone_2,
        email: data.email,
        hours: data.hours,
        hours_note: data.hours_note,
        address_en: data.address_en,
        address_ko: data.address_ko,
        website: data.website,
        location_detail: data.location_detail,
        notes: data.notes,
        how_to_report: data.how_to_report,
        how_to_trace: data.how_to_trace,
        retention_period: data.retention_period,
        tags: data.tags,
        sort_order: data.sort_order,
        is_active: data.is_active,
      };
      const url = isEdit ? `/api/facilities/${facility!.id}` : "/api/facilities";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");
      onSaved(json.facility);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || deleting) return;
    if (!window.confirm(`Delete "${facility!.name}"? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/facilities/${facility!.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": password },
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Delete failed");
      onDeleted?.(facility!.id);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-serif text-xl tracking-tight">
            {isEdit ? "Edit facility" : "Add new facility"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted hover:text-foreground"
          >
            Close
          </button>
        </header>
        <form onSubmit={handleSave} className="space-y-5 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category *">
              <select
                className={inputCls}
                value={data.category}
                onChange={update("category")}
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                inputMode="numeric"
                className={inputCls}
                value={data.sort_order}
                onChange={update("sort_order")}
                placeholder="e.g. 10"
              />
            </Field>
            <Field label="Name *">
              <input
                type="text"
                className={inputCls}
                value={data.name}
                onChange={update("name")}
                required
              />
            </Field>
            <Field label="Name (Korean)">
              <input
                type="text"
                className={inputCls}
                value={data.name_ko}
                onChange={update("name_ko")}
              />
            </Field>
            <Field label="Phone">
              <input
                type="text"
                className={inputCls}
                value={data.phone}
                onChange={update("phone")}
                placeholder="e.g. 1599-9400"
              />
            </Field>
            <Field label="Phone 2">
              <input
                type="text"
                className={inputCls}
                value={data.phone_2}
                onChange={update("phone_2")}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                value={data.email}
                onChange={update("email")}
              />
            </Field>
            <Field label="Website">
              <input
                type="url"
                className={inputCls}
                value={data.website}
                onChange={update("website")}
                placeholder="https://"
              />
            </Field>
            <Field label="Hours">
              <input
                type="text"
                className={inputCls}
                value={data.hours}
                onChange={update("hours")}
                placeholder="e.g. Mon–Fri 09:00–18:00"
              />
            </Field>
            <Field label="Hours note">
              <input
                type="text"
                className={inputCls}
                value={data.hours_note}
                onChange={update("hours_note")}
                placeholder="e.g. Closed on holidays"
              />
            </Field>
          </div>

          <Field label="Address (English)">
            <input
              type="text"
              className={inputCls}
              value={data.address_en}
              onChange={update("address_en")}
            />
          </Field>
          <Field label="Address (Korean)">
            <input
              type="text"
              className={inputCls}
              value={data.address_ko}
              onChange={update("address_ko")}
            />
          </Field>
          <Field label="Location detail">
            <input
              type="text"
              className={inputCls}
              value={data.location_detail}
              onChange={update("location_detail")}
              placeholder="e.g. T1 East, B1 floor"
            />
          </Field>

          <Field label="Notes">
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              value={data.notes}
              onChange={update("notes")}
            />
          </Field>
          <Field label="How to report">
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              value={data.how_to_report}
              onChange={update("how_to_report")}
            />
          </Field>
          <Field label="How to trace">
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              value={data.how_to_trace}
              onChange={update("how_to_trace")}
            />
          </Field>
          <Field label="Retention period">
            <input
              type="text"
              className={inputCls}
              value={data.retention_period}
              onChange={update("retention_period")}
              placeholder="e.g. 6 months"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input
              type="text"
              className={inputCls}
              value={data.tags}
              onChange={update("tags")}
              placeholder="e.g. seoul, english-support, 24h"
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-alt px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={update("is_active")}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
            />
            <span>
              <span className="font-medium text-foreground">Active</span>
              <span className="block text-xs text-muted">
                Inactive entries are hidden from the public Info Book.
              </span>
            </span>
          </label>

          <StatusPill msg={msg} />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Create facility"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-muted hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
