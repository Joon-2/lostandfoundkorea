"use client";

import { searchContacts } from "@/config/search-contacts";

// Auto-detection data: each location type has a regex matcher, label, and a
// contact list. Phone numbers are rendered as click-to-call, links as
// anchors, hints as muted text. The flat searchContacts map from
// /config/search-contacts.ts is imported alongside as a cross-reference —
// entries there are shown at the bottom when the selected label exists in
// the shared config.
type Contact = { name?: string; phone?: string; link?: string; hint?: string };
export type LocationType = {
  key: string;
  label: string;
  match: RegExp;
  contacts: Contact[];
};

export const LOCATION_TYPES: LocationType[] = [
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

export function detectLocationType(report: any): string {
  const hay = [report.location, report.location_detail, report.category]
    .filter(Boolean)
    .join(" ");
  for (const t of LOCATION_TYPES) {
    if (t.match.test(hay)) return t.key;
  }
  return "street";
}

type SearchPlanProps = {
  report: any;
  selectedKey: string;
  onChange: (key: string) => void;
};

export default function SearchPlan({ report, selectedKey, onChange }: SearchPlanProps) {
  const type = LOCATION_TYPES.find((t) => t.key === selectedKey) || LOCATION_TYPES[0];
  const extra = searchContacts[type.label];

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
        {extra && extra.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Additional references
            </div>
            <ul className="mt-1.5 space-y-1 text-xs text-body">
              {extra.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
