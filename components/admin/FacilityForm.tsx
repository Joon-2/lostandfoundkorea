"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/config/categories";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/config/locales";
import { inputCls } from "@/components/admin/styles";
import Field from "@/components/admin/Field";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import type {
  Facility,
  FacilityCategory,
  FacilityTranslationFields,
} from "@/types/facility";
import { adminFetch } from "@/lib/admin-fetch";

type FacilityFormProps = {
  facility: Facility | null; // null = create mode
  password: string;
  onUnauthorized?: () => void;
  onSaved: (facility: Facility) => void;
  onDeleted?: (id: string) => void;
  onClose: () => void;
};

type SharedFields = {
  category: FacilityCategory | "";
  phone: string;
  phone_2: string;
  email: string;
  hours: string;
  hours_note: string;
  website: string;
  location_detail: string;
  how_to_report: string;
  how_to_trace: string;
  retention_period: string;
  tags: string;
  sort_order: string;
  is_active: boolean;
};

type TranslationDraft = { name: string; address: string; description: string };
type TranslationDrafts = Record<Locale, TranslationDraft>;

function emptyShared(): SharedFields {
  return {
    category: "",
    phone: "",
    phone_2: "",
    email: "",
    hours: "",
    hours_note: "",
    website: "",
    location_detail: "",
    how_to_report: "",
    how_to_trace: "",
    retention_period: "",
    tags: "",
    sort_order: "",
    is_active: true,
  };
}

function emptyTranslation(): TranslationDraft {
  return { name: "", address: "", description: "" };
}

function emptyDrafts(): TranslationDrafts {
  return SUPPORTED_LOCALES.reduce((acc, l) => {
    acc[l] = emptyTranslation();
    return acc;
  }, {} as TranslationDrafts);
}

function fromFacility(f: Facility): {
  shared: SharedFields;
  drafts: TranslationDrafts;
} {
  const shared: SharedFields = {
    category: f.category,
    phone: f.phone || "",
    phone_2: f.phone_2 || "",
    email: f.email || "",
    hours: f.hours || "",
    hours_note: f.hours_note || "",
    website: f.website || "",
    location_detail: f.location_detail || "",
    how_to_report: f.how_to_report || "",
    how_to_trace: f.how_to_trace || "",
    retention_period: f.retention_period || "",
    tags: Array.isArray(f.tags) ? f.tags.join(", ") : "",
    sort_order: f.sort_order != null ? String(f.sort_order) : "",
    is_active: f.is_active,
  };
  const drafts = emptyDrafts();
  const all = f.translations || {};
  for (const l of SUPPORTED_LOCALES) {
    const t = all[l];
    if (t) {
      drafts[l] = {
        name: t.name || "",
        address: t.address || "",
        description: t.description || "",
      };
    }
  }
  return { shared, drafts };
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
  const initial = facility
    ? fromFacility(facility)
    : { shared: emptyShared(), drafts: emptyDrafts() };
  const [shared, setShared] = useState<SharedFields>(initial.shared);
  const [drafts, setDrafts] = useState<TranslationDrafts>(initial.drafts);
  const [tab, setTab] = useState<Locale>("en");
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

  const updateShared =
    <K extends keyof SharedFields>(key: K) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const target = e.target as HTMLInputElement;
      const v = target.type === "checkbox" ? target.checked : target.value;
      setShared((d) => ({ ...d, [key]: v as SharedFields[K] }));
    };

  const updateTranslation =
    (locale: Locale, key: keyof TranslationDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setDrafts((d) => ({ ...d, [locale]: { ...d[locale], [key]: v } }));
    };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setMsg(null);
    if (!shared.category) {
      setMsg({ kind: "err", text: "Category is required." });
      return;
    }
    if (!drafts.en.name.trim()) {
      setTab("en");
      setMsg({ kind: "err", text: "English name is required." });
      return;
    }
    setSaving(true);
    try {
      // Build payload: shared fields at top level, translations as a
      // map. Empty locale blocks are dropped server-side.
      const translationsPayload: Partial<
        Record<Locale, Partial<FacilityTranslationFields>>
      > = {};
      for (const l of SUPPORTED_LOCALES) {
        translationsPayload[l] = {
          name: drafts[l].name,
          address: drafts[l].address,
          description: drafts[l].description,
        };
      }
      const payload = {
        category: shared.category,
        phone: shared.phone,
        phone_2: shared.phone_2,
        email: shared.email,
        hours: shared.hours,
        hours_note: shared.hours_note,
        website: shared.website,
        location_detail: shared.location_detail,
        how_to_report: shared.how_to_report,
        how_to_trace: shared.how_to_trace,
        retention_period: shared.retention_period,
        tags: shared.tags,
        sort_order: shared.sort_order,
        is_active: shared.is_active,
        translations: translationsPayload,
      };

      const url = isEdit ? `/api/facilities/${facility!.id}` : "/api/facilities";
      const method = isEdit ? "PUT" : "POST";
      const json = await adminFetch<{
        ok: boolean;
        facility: Facility;
        error?: string;
      }>(url, {
        method,
        body: payload,
        password,
        onUnauthorized,
      });
      if (!json.ok) throw new Error(json.error || "Save failed");
      onSaved(json.facility);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || deleting) return;
    if (
      !window.confirm(
        `Delete "${facility!.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        `/api/facilities/${facility!.id}`,
        {
          method: "DELETE",
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Delete failed");
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
        <form onSubmit={handleSave} className="space-y-6 px-6 py-5">
          {/* ─── Shared (non-translatable) fields ─────────────────── */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category *">
                <select
                  className={inputCls}
                  value={shared.category}
                  onChange={updateShared("category")}
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
                  value={shared.sort_order}
                  onChange={updateShared("sort_order")}
                  placeholder="e.g. 10"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.phone}
                  onChange={updateShared("phone")}
                  placeholder="e.g. 1599-9400"
                />
              </Field>
              <Field label="Phone 2">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.phone_2}
                  onChange={updateShared("phone_2")}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  className={inputCls}
                  value={shared.email}
                  onChange={updateShared("email")}
                />
              </Field>
              <Field label="Website">
                <input
                  type="url"
                  className={inputCls}
                  value={shared.website}
                  onChange={updateShared("website")}
                  placeholder="https://"
                />
              </Field>
              <Field label="Hours">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.hours}
                  onChange={updateShared("hours")}
                  placeholder="e.g. Mon–Fri 09:00–18:00"
                />
              </Field>
              <Field label="Hours note">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.hours_note}
                  onChange={updateShared("hours_note")}
                  placeholder="e.g. Closed on holidays"
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4">
              <Field label="Location detail">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.location_detail}
                  onChange={updateShared("location_detail")}
                  placeholder="e.g. T1 East, B1 floor"
                />
              </Field>
              <Field label="How to report">
                <textarea
                  className={`${inputCls} min-h-20 resize-y`}
                  value={shared.how_to_report}
                  onChange={updateShared("how_to_report")}
                />
              </Field>
              <Field label="How to trace">
                <textarea
                  className={`${inputCls} min-h-20 resize-y`}
                  value={shared.how_to_trace}
                  onChange={updateShared("how_to_trace")}
                />
              </Field>
              <Field label="Retention period">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.retention_period}
                  onChange={updateShared("retention_period")}
                  placeholder="e.g. 6 months"
                />
              </Field>
              <Field label="Tags (comma-separated)">
                <input
                  type="text"
                  className={inputCls}
                  value={shared.tags}
                  onChange={updateShared("tags")}
                  placeholder="e.g. seoul, english-support, 24h"
                />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-alt px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={shared.is_active}
                onChange={updateShared("is_active")}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
              />
              <span>
                <span className="font-medium text-foreground">Active</span>
                <span className="block text-xs text-muted">
                  Inactive entries are hidden from the public Info Book.
                </span>
              </span>
            </label>
          </section>

          {/* ─── Translation tabs ──────────────────────────────────── */}
          <section className="rounded-2xl border border-border bg-alt/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Translations
              </h3>
              <div className="inline-flex rounded-full border border-border bg-card p-1 text-sm">
                {SUPPORTED_LOCALES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setTab(l)}
                    className={`rounded-full px-3 py-1 font-medium transition-colors ${
                      tab === l
                        ? "bg-accent text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {LOCALE_LABELS[l]}
                    {l === "en" && (
                      <span className="ml-1 text-[10px] uppercase tracking-widest opacity-70">
                        Required
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <TranslationFields
              locale={tab}
              draft={drafts[tab]}
              required={tab === "en"}
              onChange={updateTranslation}
            />
          </section>

          <StatusPill msg={msg} />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : isEdit
                  ? "Save changes"
                  : "Create facility"}
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

function TranslationFields({
  locale,
  draft,
  required,
  onChange,
}: {
  locale: Locale;
  draft: TranslationDraft;
  required: boolean;
  onChange: (
    locale: Locale,
    key: keyof TranslationDraft
  ) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field label={`Name${required ? " *" : ""}`}>
        <input
          type="text"
          className={inputCls}
          value={draft.name}
          onChange={onChange(locale, "name")}
          required={required}
        />
      </Field>
      <Field label="Address">
        <input
          type="text"
          className={inputCls}
          value={draft.address}
          onChange={onChange(locale, "address")}
        />
      </Field>
      <Field label="Description">
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          value={draft.description}
          onChange={onChange(locale, "description")}
        />
      </Field>
    </div>
  );
}
