// Renders a `[TBD]` placeholder as an amber pill so it's instantly
// visible during pre-launch review. Resolved values render plain.

export default function TbdValue({ value }: { value: string }) {
  if (value !== "[TBD]") return <>{value}</>;
  return (
    <span className="inline-block rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[0.95em] italic text-amber-700">
      [TBD]
    </span>
  );
}
