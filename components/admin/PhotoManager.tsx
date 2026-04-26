"use client";

import { useEffect, useState } from "react";
import { processImage } from "@/lib/image-processing";
import { adminFetch } from "@/lib/admin-fetch";

type PhotoManagerProps = {
  caseNumber: string;
  images: any;
  password: string;
  onUnauthorized?: () => void;
  onChange: (next: string[]) => void;
};

export default function PhotoManager({
  caseNumber,
  images,
  password,
  onUnauthorized,
  onChange,
}: PhotoManagerProps) {
  const list: string[] = Array.isArray(images) ? images : [];
  const [uploading, setUploading] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    console.log(
      "[PhotoManager] images prop for",
      caseNumber,
      "— type:",
      Array.isArray(images) ? "array" : typeof images,
      "length:",
      Array.isArray(images) ? images.length : "n/a",
      images
    );
  }, [images, caseNumber]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || uploading) return;
    setUploading(true);
    setMsg(null);
    try {
      console.log("[upload] selected file:", {
        name: selected.name,
        size: selected.size,
        type: selected.type,
      });

      const processed = await (processImage as any)(selected, (text: string) =>
        setProgressStatus(text)
      );
      console.log("[upload] processed blob size:", processed.size);
      setProgressStatus("Uploading…");

      const jpegFile = new File(
        [processed],
        `${caseNumber}-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );
      const fd = new FormData();
      fd.append("file", jpegFile);
      fd.append("caseNumber", caseNumber);

      const res = await fetch("/api/admin/upload-found-image", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: fd,
      });
      console.log("[upload] response status:", res.status);
      console.log(
        "[upload] response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (res.status === 401) {
        onUnauthorized?.();
        return;
      }
      const json = await res.json().catch(() => ({}));
      console.log("[upload] response body:", json);

      if (!res.ok || !json.ok) {
        const parts = [json.error || json.hint || "Upload failed"];
        if (json.hint && json.hint !== json.error) parts.push(json.hint);
        if (json.bucket) parts.push(`bucket: ${json.bucket}`);
        if (json.debug?.statusCode) parts.push(`status: ${json.debug.statusCode}`);
        if (json.debug?.code) parts.push(`code: ${json.debug.code}`);
        throw new Error(parts.join(" · "));
      }
      onChange(json.images);
      setMsg({ kind: "ok", text: "Photo uploaded." });
    } catch (err: any) {
      console.error("[upload] failed:", err);
      setMsg({ kind: "err", text: err.message });
    } finally {
      setUploading(false);
      setProgressStatus(null);
      e.target.value = "";
    }
  };

  const handleDelete = async (url: string) => {
    if (deletingUrl) return;
    if (!window.confirm("Delete this photo?")) return;
    setDeletingUrl(url);
    setMsg(null);
    try {
      const json = await adminFetch<{
        ok: boolean;
        images: string[];
        error?: string;
      }>("/api/admin/delete-found-image", {
        method: "POST",
        body: { caseNumber, url },
        password,
        onUnauthorized,
      });
      if (!json.ok) {
        throw new Error(json.error || "Delete failed");
      }
      onChange(json.images);
    } catch (err: any) {
      setMsg({ kind: "err", text: err.message });
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
        Found Item Photos
      </h3>
      <p className="mt-1 text-sm text-muted">
        Up to 5 photos. Any image format works (JPG, PNG, WebP, HEIC from
        iPhone, etc.) — photos are compressed to JPEG in the browser before
        upload. Shown on the customer&rsquo;s /pay page once their case is
        marked found.
      </p>

      {list.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {list.map((src, i) => (
            <div
              key={src + i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-alt"
            >
              <a href={src} target="_blank" rel="noopener noreferrer">
                <img
                  src={src}
                  alt={`Found photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
              <button
                type="button"
                onClick={() => handleDelete(src)}
                disabled={deletingUrl === src}
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow ring-1 ring-red-200 transition-colors hover:bg-red-50 disabled:opacity-60"
                aria-label="Delete photo"
              >
                {deletingUrl === src ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                ) : (
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {list.length >= 5 ? (
        <p className="mt-4 rounded-xl border border-border bg-alt px-4 py-3 text-sm text-muted">
          Photo limit reached (5 / 5). Delete a photo to upload a new one.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*,.heic,.heif,.bmp,.tif,.tiff,.svg,.raw"
            onChange={handleFileChange}
            disabled={uploading}
            className="block text-sm text-foreground file:mr-4 file:rounded-full file:border file:border-border file:bg-alt file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-card disabled:opacity-60 disabled:file:opacity-60"
          />
          {progressStatus && (
            <span className="inline-flex items-center gap-2 text-sm text-muted">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
              {progressStatus}
            </span>
          )}
        </div>
      )}

      {msg && msg.kind === "err" && (
        <div
          role="alert"
          className="mt-3 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 text-lg leading-none text-red-600">
              ⚠
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Upload failed</p>
              <p className="mt-1 break-words text-red-700">{msg.text}</p>
              <p className="mt-2 text-xs text-red-600/80">
                Open the browser console and the Vercel Functions logs for the
                full error object.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMsg(null)}
              className="flex-none rounded-full p-1 text-red-600 hover:bg-red-100"
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {msg && msg.kind === "ok" && (
        <p
          className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-accent"
          role="status"
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
