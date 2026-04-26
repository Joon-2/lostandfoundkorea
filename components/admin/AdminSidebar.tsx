"use client";

import Link from "next/link";
import LogoIcon from "@/assets/icons/LogoIcon";
import {
  BriefcaseIcon,
  ChartIcon,
  ClipboardIcon,
  DashboardIcon,
  DollarIcon,
  GearIcon,
  PinIcon,
  TruckIcon,
  UsersIcon,
} from "@/assets/icons/admin";
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

