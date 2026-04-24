"use client";

// Reusable admin email-action buttons. Stage components currently own their
// own wired-up email buttons (StageReceived sends confirmation, StageFound
// sends the payment link, StageSearching handles "not found", etc.) so we
// preserve the existing button placement. This file exports the same four
// actions as small, composable buttons for future consolidation into a
// single EmailActions panel.

import { useState } from "react";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";

type ActionButtonProps = {
  onClick: () => void | Promise<void>;
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

function ActionButton({
  onClick,
  label,
  pendingLabel,
  variant = "secondary",
  disabled,
}: ActionButtonProps) {
  const [pending, setPending] = useState(false);
  const cls =
    variant === "primary"
      ? "bg-accent text-white hover:bg-accent-hover"
      : "border border-border bg-card text-foreground hover:bg-alt";
  return (
    <button
      onClick={async () => {
        if (pending) return;
        setPending(true);
        try {
          await onClick();
        } finally {
          setPending(false);
        }
      }}
      disabled={pending || disabled}
      className={`inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${cls}`}
    >
      {pending ? pendingLabel ?? "Working…" : label}
    </button>
  );
}

type BaseProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onSent?: () => void;
};

async function postJson(
  url: string,
  password: string,
  body: any,
  onUnauthorized?: () => void
) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Unauthorized");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(json.error || "Request failed");
  return json;
}

export function SendConfirmationButton({
  report,
  password,
  onUnauthorized,
  onSent,
}: BaseProps) {
  const [msg, setMsg] = useState<StatusMsg | null>(null);
  const handler = async () => {
    try {
      await postJson(
        "/api/admin/send-confirmation",
        password,
        {
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
          category: report.category,
          itemDescription: report.item_description,
          location: report.location,
        },
        onUnauthorized
      );
      setMsg({ kind: "ok", text: `Confirmation email sent to ${report.email}.` });
      onSent?.();
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    }
  };
  return (
    <div>
      <ActionButton
        label="Send confirmation email"
        pendingLabel="Sending…"
        onClick={handler}
      />
      <StatusPill msg={msg} />
    </div>
  );
}

export function SendPaymentLinkButton({
  report,
  password,
  onUnauthorized,
  onSent,
}: BaseProps) {
  const [msg, setMsg] = useState<StatusMsg | null>(null);
  const handler = async () => {
    try {
      await postJson(
        "/api/admin/send-payment",
        password,
        {
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
        },
        onUnauthorized
      );
      setMsg({ kind: "ok", text: `Payment link sent to ${report.email}.` });
      onSent?.();
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    }
  };
  return (
    <div>
      <ActionButton
        label="Send payment link"
        pendingLabel="Sending…"
        variant="primary"
        onClick={handler}
      />
      <StatusPill msg={msg} />
    </div>
  );
}

export function RequestInfoButton({
  report,
  password,
  onUnauthorized,
  onSent,
  infoText,
}: BaseProps & { infoText: string }) {
  const [msg, setMsg] = useState<StatusMsg | null>(null);
  const handler = async () => {
    try {
      await postJson(
        "/api/admin/request-info",
        password,
        {
          name: report.name,
          email: report.email,
          caseNumber: report.case_number,
          infoText,
        },
        onUnauthorized
      );
      setMsg({ kind: "ok", text: `Request sent to ${report.email}.` });
      onSent?.();
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    }
  };
  return (
    <div>
      <ActionButton
        label="Send request email"
        pendingLabel="Sending…"
        onClick={handler}
        disabled={!infoText.trim()}
      />
      <StatusPill msg={msg} />
    </div>
  );
}

export function NotFoundButton({
  report,
  password,
  onUnauthorized,
  onSent,
  reason,
}: BaseProps & { reason?: string }) {
  const [msg, setMsg] = useState<StatusMsg | null>(null);
  const handler = async () => {
    if (!window.confirm("Send the 'no item found' email and close this case?")) {
      return;
    }
    try {
      await postJson(
        "/api/admin/close-case",
        password,
        {
          caseNumber: report.case_number,
          reason: reason || "",
        },
        onUnauthorized
      );
      setMsg({ kind: "ok", text: `Case closed and email sent to ${report.email}.` });
      onSent?.();
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    }
  };
  return (
    <div>
      <ActionButton
        label="Send 'not found' email & close"
        pendingLabel="Closing…"
        onClick={handler}
      />
      <StatusPill msg={msg} />
    </div>
  );
}

export default function EmailActions(props: BaseProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <SendConfirmationButton {...props} />
      <SendPaymentLinkButton {...props} />
    </div>
  );
}
