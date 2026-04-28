"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES, getCategoryDef } from "@/config/categories";
import FacilityForm from "@/components/admin/FacilityForm";
import type { Facility } from "@/types/facility";
import { adminFetch } from "@/lib/admin-fetch";

type FacilitiesViewProps = {
  password: string;
  onUnauthorized?: () => void;
};

export default function FacilitiesView({
  password,
  onUnauthorized,
}: FacilitiesViewProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Facility | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchFacilities = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const json = await adminFetch<{
        ok: boolean;
        facilities: Facility[];
        error?: string;
      }>("/api/facilities", { password, onUnauthorized });
      if (!json.ok) {
        throw new Error(json.error || "Failed to load facilities");
      }
      setFacilities(json.facilities || []);
    } catch (err: any) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password, onUnauthorized]);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const filtered = useMemo(() => {
    let arr = facilities;
    if (categoryFilter !== "all") {
      arr = arr.filter((f) => f.category === categoryFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(
        (f) =>
          (f.name || "").toLowerCase().includes(q) ||
          (f.translations?.ja?.name || "").toLowerCase().includes(q) ||
          (f.phone || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [facilities, search, categoryFilter]);

  const onSaved = (saved: Facility) => {
    setFacilities((prev) => {
      const idx = prev.findIndex((f) => f.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setEditing(null);
    setCreating(false);
  };

  const onDeleted = (id: string) => {
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    setEditing(null);
  };

  const handleToggleActive = async (f: Facility) => {
    try {
      const json = await adminFetch<{
        ok: boolean;
        facility: Facility;
        error?: string;
      }>(`/api/facilities/${f.id}`, {
        method: "PUT",
        body: { is_active: !f.is_active },
        password,
        onUnauthorized,
      });
      if (!json.ok) throw new Error(json.error || "Toggle failed");
      onSaved(json.facility);
    } catch (err: any) {
      console.error("[facilities] toggle active failed:", err);
    }
  };

  const compact =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">
          Facilities
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFacilities}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-alt disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            + Add new facility
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone"
          className={compact + " sm:flex-1"}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={compact + " sm:w-52"}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
      </div>

      {loadError && (
        <p className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </p>
      )}

      {!loading && filtered.length === 0 && facilities.length === 0 && (
        <p className="mt-6 rounded-2xl border border-border bg-card px-5 py-12 text-center text-sm text-muted">
          No facilities yet. Add your first one.
        </p>
      )}

      {!loading && filtered.length === 0 && facilities.length > 0 && (
        <p className="mt-6 rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted">
          No facilities match the current filter.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-alt text-xs uppercase tracking-widest text-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Active</th>
                <th className="px-4 py-3 text-right font-semibold">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const cat = getCategoryDef(f.category);
                return (
                  <tr
                    key={f.id}
                    className="border-t border-border hover:bg-alt/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {f.name}
                        </span>
                        {!f.translations?.ja?.name && (
                          <span
                            title="Japanese translation missing"
                            className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-amber-700"
                          >
                            JA missing
                          </span>
                        )}
                      </div>
                      {f.translations?.ja?.name && (
                        <div className="text-xs text-muted">
                          {f.translations.ja.name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-body">
                      {cat ? `${cat.emoji} ${cat.label}` : f.category}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-body">
                      {f.phone || <span className="text-muted/60">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(f)}
                        aria-label={`Toggle active for ${f.name}`}
                        className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          f.is_active ? "bg-accent" : "bg-border"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            f.is_active ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(f)}
                        className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-alt"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(editing || creating) && (
        <FacilityForm
          facility={editing}
          password={password}
          onUnauthorized={onUnauthorized}
          onSaved={onSaved}
          onDeleted={onDeleted}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </>
  );
}
