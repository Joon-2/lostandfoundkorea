export type StatusMsg = { kind: "ok" | "err"; text: string };

export default function StatusPill({ msg }: { msg: StatusMsg | null | undefined }) {
  if (!msg) return null;
  return (
    <p
      className={`mt-2 rounded-lg px-3 py-2 text-sm ${
        msg.kind === "ok" ? "bg-emerald-50 text-accent" : "bg-red-50 text-red-700"
      }`}
      role="status"
    >
      {msg.text}
    </p>
  );
}
