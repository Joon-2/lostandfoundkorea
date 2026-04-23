import type { ReactNode } from "react";

type Status = "pending" | "found" | "paid" | "closed";

const STATUS_CLASSES: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  found: "bg-sky-50 text-sky-700 border-sky-200",
  paid: "bg-emerald-50 text-accent border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_LABELS: Record<Status, string> = {
  pending: "Pending",
  found: "Found",
  paid: "Paid",
  closed: "Closed",
};

type BadgeProps = {
  status?: Status;
  className?: string;
  children?: ReactNode;
};

export default function Badge({ status, className, children }: BadgeProps) {
  const toneCls = status ? STATUS_CLASSES[status] : "bg-alt text-muted border-border";
  const content = children ?? (status ? STATUS_LABELS[status] : null);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneCls} ${className ?? ""}`.trim()}
    >
      {content}
    </span>
  );
}
