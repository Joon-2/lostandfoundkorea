import type { ReactNode } from "react";

type Tone = "muted" | "emerald" | "amber";

const TONES: Record<Tone, string> = {
  muted: "border-border bg-alt text-body",
  emerald: "border-accent/40 bg-emerald-50 text-accent",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
};

export default function StageBanner({
  tone = "muted",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${TONES[tone]}`}>
      {children}
    </div>
  );
}
