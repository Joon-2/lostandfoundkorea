"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCategoryDef } from "@/config/categories";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import type { Facility } from "@/types/facility";

type FacilityLinkerProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onUpdate: (report: any) => void;
};

// Lets the admin pick a known facility while a case is in "searching" and
// have the recovery contact fields prefilled in one step. Persists to the
// case immediately via /api/admin/reports/[id] so the data is visible on
// the customer's /pay page once the case advances to "found".
export default function FacilityLinker({
  report,
  password,
  onUnauthorized,
  onUpdate,
}: FacilityLinkerProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [linking, setLinking] = useState(false);
  const [msg, setMsg] = useState<StatusMsg | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/facilities", {
          headers: { "x-admin-password": password },
          cache: "no-store",
        });
        if (res.status === 401) {
          onUnauthorized?.();
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          throw new Error(json.error || "Failed to load facilities");
        }
        if (!cancelled) {
          setFacilities(
            (json.facilities || []).filter((f: Facility) => f.is_active)
          );
        }
      } catch (err: any) {
        if (!cancelled) setLoadError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [password, onUnauthorized]);

  const handleLink = async () => {
    if (!selected || linking) return;
    const f = facilities.find((x) => x.id === selected);
    if (!f) return;
    setLinking(true);
    setMsg(null);

    const recoveryLocation = [f.name_en, f.address_en]
      .filter(Boolean)
      .join(" — ");
    const recoveryContact = f.phone || f.phone_2 || "";
    const recoveryHours = [f.hours, f.hours_note].filter(Boolean).join(" · ");
    const recoveryInstructions = f.how_to_report || f.notes || "";

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
        }),
      });
      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Link failed");
      onUpdate(json.report);
      setMsg({
        kind: "ok",
        text: `Linked ${f.name_en}. Recovery details prefilled.`,
      });
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-alt p-4 sm:p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Link facility
      </h3>
      <p className="mt-1 text-sm text-muted">
        Pick a known facility to prefill recovery location, contact, hours,
        and pickup instructions.
      </p>
      {loadError && (
        <p className="mt-3 text-sm text-red-600">{loadError}</p>
      )}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loading || facilities.length === 0}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 sm:flex-1"
        >
          <option value="">
            {loading
              ? "Loading facilities…"
              : facilities.length === 0
              ? "No facilities yet — add some first"
              : "Select a facility…"}
          </option>
          {CATEGORIES.map((c) => {
            const inCat = facilities.filter((f) => f.category === c.key);
            if (inCat.length === 0) return null;
            return (
              <optgroup key={c.key} label={`${c.emoji} ${c.label}`}>
                {inCat.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name_en}
                    {f.location_detail ? ` (${f.location_detail})` : ""}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <button
          type="button"
          onClick={handleLink}
          disabled={!selected || linking}
          className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {linking ? "Linking…" : "Link & fill"}
        </button>
      </div>
      <StatusPill msg={msg} />
    </div>
  );
}
