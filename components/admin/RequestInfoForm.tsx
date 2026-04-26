"use client";

import { useState } from "react";
import { inputCls } from "@/components/admin/styles";
import StatusPill, { type StatusMsg } from "@/components/admin/StatusPill";
import { adminFetch } from "@/lib/admin-fetch";

type RequestInfoFormProps = {
  report: any;
  password: string;
  onUnauthorized?: () => void;
  onSent?: () => void;
};

export default function RequestInfoForm({
  report,
  password,
  onUnauthorized,
  onSent,
}: RequestInfoFormProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<StatusMsg | null>(null);

  const handleSend = async () => {
    if (sending) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setMsg(null);
    try {
      const json = await adminFetch<{ ok: boolean; error?: string }>(
        "/api/admin/request-info",
        {
          method: "POST",
          body: {
            name: report.name,
            email: report.email,
            caseNumber: report.case_number,
            infoText: trimmed,
          },
          password,
          onUnauthorized,
        }
      );
      if (!json.ok) throw new Error(json.error || "Send failed");
      setText("");
      setMsg({ kind: "ok", text: `Request sent to ${report.email}.` });
      onSent?.();
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Request more info
      </h3>
      <p className="mt-1 text-sm text-muted">
        Ask the customer for missing details. We&rsquo;ll email them and log
        the request in this case.
      </p>
      <textarea
        className={`${inputCls} mt-3 min-h-28 resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          "e.g. Can you describe the case color? Do you remember the taxi number? What time exactly did you get out?"
        }
      />
      <div className="mt-3">
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className="inline-flex items-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send request email"}
        </button>
      </div>
      <StatusPill msg={msg} />
    </div>
  );
}
