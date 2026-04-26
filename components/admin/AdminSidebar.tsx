"use client";

import Link from "next/link";
import LogoIcon from "@/assets/icons/LogoIcon";
import { siteConfig } from "@/config/site";

export type SidebarKey =
  | "dashboard"
  | "reports"
  | "facilities"
  | "deliveries"
  | "leads"
  | "payments"
  | "revenue"
  | "users"
  | "settings";

type SidebarProps = {
  activeKey: SidebarKey;
  onSelect: (key: SidebarKey) => void;
  counts: { reports: number };
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
};

type Item = {
  key: SidebarKey;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  enabled: boolean;
};

type Group = { label: string; items: Item[] };

function buildGroups(counts: SidebarProps["counts"]): Group[] {
  return [
    {
      label: "Overview",
      items: [
        { key: "dashboard", label: "Dashboard", icon: <DashboardIcon />, enabled: false },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          key: "reports",
          label: "Reports",
          icon: <ClipboardIcon />,
          badge: counts.reports,
          enabled: true,
        },
        { key: "facilities", label: "Facilities", icon: <PinIcon />, enabled: true },
        { key: "deliveries", label: "Deliveries", icon: <TruckIcon />, enabled: true },
      ],
    },
    {
      // First Sales sub-item is Leads. Future siblings (Airlines,
      // Hotels, etc.) plug in by adding a SidebarKey + a row here.
      label: "Sales",
      items: [
        { key: "leads", label: "Leads", icon: <BriefcaseIcon />, enabled: true },
      ],
    },
    {
      label: "Finance",
      items: [
        // Payments is shaped for the future — no count badge yet because
        // the screen behind it isn't built. Adding `badge: ...` here
        // alongside the "Soon" tag mixed two signals; keep it muted
        // until the page lands.
        { key: "payments", label: "Payments", icon: <DollarIcon />, enabled: false },
        { key: "revenue", label: "Revenue", icon: <ChartIcon />, enabled: false },
      ],
    },
    {
      label: "System",
      items: [
        { key: "users", label: "Users", icon: <UsersIcon />, enabled: false },
        { key: "settings", label: "Settings", icon: <GearIcon />, enabled: false },
      ],
    },
  ];
}

export default function AdminSidebar({
  activeKey,
  onSelect,
  counts,
  mobileOpen,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  const groups = buildGroups(counts);
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform md:sticky md:top-0 md:z-0 md:h-screen md:w-60 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[60px] items-center gap-2 border-b border-border px-5">
          <LogoIcon className="h-[18px] w-[18px] flex-none text-accent" />
          <span className="truncate text-[15px] font-bold tracking-tight text-foreground">
            Lost &amp; Found Korea
          </span>
        </div>

        {/* Menu (scroll if needed) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.key}>
                    <SidebarItem
                      item={item}
                      active={activeKey === item.key}
                      onClick={() => {
                        if (!item.enabled) return;
                        onSelect(item.key);
                        onMobileClose();
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Quick links — external sites we jump to during ops. */}
          <QuickLinks />
        </nav>

        {/* User card */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              A
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">
                Admin
              </div>
              <div className="truncate text-xs text-muted">
                {siteConfig.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium text-muted transition-colors hover:bg-alt hover:text-foreground"
          >
            Sign out
          </button>
          <div className="mt-2 px-3 text-[11px] text-muted">
            <Link href="/" className="hover:text-foreground">
              ← Back to site
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  active,
  onClick,
}: {
  item: Item;
  active: boolean;
  onClick: () => void;
}) {
  const base =
    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors";
  // Active items pop. Enabled-but-not-active items use the body text
  // color with a hover state. Unbuilt items are visibly muted via
  // opacity so the sidebar's hierarchy is read at a glance.
  const cls = active
    ? `${base} bg-accent/10 font-semibold text-accent`
    : item.enabled
    ? `${base} text-body hover:bg-alt hover:text-foreground`
    : `${base} cursor-not-allowed text-muted/70 opacity-50`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!item.enabled}
      className={cls}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center ${
          active ? "text-accent" : "text-muted/70"
        }`}
      >
        {item.icon}
      </span>
      <span className="flex-1 text-left">{item.label}</span>
      {typeof item.badge === "number" && item.badge > 0 && (
        <span
          className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active
              ? "bg-accent text-white"
              : "bg-alt text-muted group-hover:bg-card"
          }`}
        >
          {item.badge}
        </span>
      )}
      {!item.enabled && (
        <span className="rounded-full border border-border bg-alt px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-muted">
          Soon
        </span>
      )}
    </button>
  );
}

// ─── Quick links ─────────────────────────────────────────────────────────
//
// Hardcoded for now — easier to add an entry than spin up a small CRUD
// flow when the list is this short. If it grows or admins need to manage
// it through the UI, move these to a `quick_links` table (id, name, url,
// initial, sort_order, is_active) and fetch via /api/quick-links. The
// component shape stays the same.

type QuickLink = { name: string; url: string; initial: string };

const QUICK_LINKS: QuickLink[] = [
  { name: "Lost112", url: "https://www.lost112.go.kr", initial: "L" },
  {
    name: "Incheon Airport L&F",
    url: "https://www.airport.kr/ap/ko/svc/lostFoundList.do",
    initial: "I",
  },
  {
    name: "Korean Air Lost Items",
    url: "https://www.koreanair.com/contents/customer-support/lost-baggage",
    initial: "K",
  },
  {
    name: "Asiana Lost Items",
    url: "https://flyasiana.com/C/KR/EN/customer/help/lostFoundCenter",
    initial: "A",
  },
];

function QuickLinks() {
  return (
    <div className="mb-5">
      <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted">
        Quick Links
      </div>
      <ul className="space-y-0.5">
        {QUICK_LINKS.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-body transition-colors hover:bg-alt hover:text-foreground"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-border bg-alt text-[10px] font-semibold text-muted group-hover:border-accent/40 group-hover:text-accent"
              >
                {link.initial}
              </span>
              <span className="flex-1 truncate text-left">{link.name}</span>
              <ExternalLinkIcon />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="h-3 w-3 flex-none text-muted/60 transition-colors group-hover:text-muted"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

// ─── Inline icons ────────────────────────────────────────────────────────

const SVG_PROPS = {
  className: "h-4 w-4",
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function DashboardIcon() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function ClipboardIcon() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 3h6v3H9z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7" />
      <circle cx="5.5" cy="18.5" r="2" />
      <circle cx="18.5" cy="18.5" r="2" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg {...SVG_PROPS}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg {...SVG_PROPS}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg {...SVG_PROPS}>
      <line x1="3" y1="20" x2="21" y2="20" />
      <rect x="6" y="12" width="3" height="8" />
      <rect x="11" y="8" width="3" height="12" />
      <rect x="16" y="14" width="3" height="6" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg {...SVG_PROPS}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg {...SVG_PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.21 16.92l.06-.06A1.7 1.7 0 0 0 4.61 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.61 8.96 1.7 1.7 0 0 0 4.27 7.09l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.04a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.04A1.7 1.7 0 0 0 20.91 10H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
    </svg>
  );
}
