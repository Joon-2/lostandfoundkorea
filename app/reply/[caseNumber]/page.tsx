"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { WHATSAPP_URL } from "@/components/WhatsApp";

const MAX_TEXT = 4000;
const MAX_BYTES = 10 * 1024 * 1024;

type CaseStub = {
  case_number: string;
  name?: string;
  status?: string;
};

export default function ReplyPage({
  params,
}: {
  params: Promise<{ caseNumber: string }>;
}) {
  const { caseNumber } = use(params);
  const [caseInfo, setCaseInfo] = useState<CaseStub | null>(null);
  const [caseError, setCaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/reports/${caseNumber}`, {
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 404) {
          setCaseError("not_found");
          return;
        }
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) {
          setCaseError(json.error || "Failed to load case");
          return;
        }
        setCaseInfo(json.report);
      } catch (err: any) {
        if (!cancelled) setCaseError(err?.message || "Failed to load case");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [caseNumber]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > MAX_BYTES) {
      setSubmitError("File is larger than 10 MB.");
      e.target.value = "";
      return;
    }
    setSubmitError(null);
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!text.trim() && !file) {
      setSubmitError("Please write a message or attach a file.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append("text", text);
      if (file) fd.append("file", file);
      const res = await fetch(
        `/api/reply/${encodeURIComponent(caseNumber)}`,
        { method: "POST", body: fd }
      );
      if (res.status === 429) {
        setSubmitError(
          "Too many replies from this network. Please try again later."
        );
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Submit failed");
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header
        variant="simple"
        action={
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-body transition-colors hover:text-black"
          >
            Need help?
          </a>
        }
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Case reference
        </p>
        <h1 className="mt-1 font-mono text-2xl font-semibold tracking-wider text-foreground">
          {caseNumber}
        </h1>

        {loading && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-muted">Loading case…</p>
          </div>
        )}

        {!loading && caseError === "not_found" && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl tracking-tight">Case not found</h2>
            <p className="mt-3 text-body">
              We couldn&rsquo;t find a case with that reference. Double-check
              the link from your email.
            </p>
          </div>
        )}

        {!loading && caseError && caseError !== "not_found" && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-7 shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl tracking-tight">
              Something went wrong
            </h2>
            <p className="mt-3 text-body">{caseError}</p>
          </div>
        )}

        {!loading && !caseError && submitted && (
          <div className="mt-10 rounded-2xl border border-accent/30 bg-emerald-50 p-7 shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl tracking-tight text-accent">
              Message sent
            </h2>
            <p className="mt-3 text-body">
              Thanks{caseInfo?.name ? `, ${caseInfo.name}` : ""}. Our team has
              your message and will get back to you by email shortly.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-alt"
              >
                Back to home
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1ebe57]"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}

        {!loading && !caseError && !submitted && (
          <form
            onSubmit={submit}
            className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          >
            <h2 className="font-serif text-2xl tracking-tight">
              Reply to our team
            </h2>
            <p className="mt-2 text-sm text-body">
              Send us a message about your case. Add a photo or document if
              it helps.
            </p>

            <div className="mt-5">
              <label
                htmlFor="reply-text"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Your message
              </label>
              <textarea
                id="reply-text"
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
                placeholder="Type your reply here…"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-40 resize-y"
              />
              <p className="mt-1 text-xs text-muted">
                {text.length} / {MAX_TEXT}
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Attachment (optional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf,.heic,.heif"
                onChange={onFile}
                className="block text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-border file:bg-alt file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-card"
              />
              {file && (
                <p className="mt-2 text-xs text-muted">
                  {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>

            {submitError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="text-sm text-muted hover:text-foreground"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
