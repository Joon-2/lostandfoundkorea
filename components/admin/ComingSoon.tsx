// Placeholder for sidebar items not yet implemented (Lost Items, Found
// Items, Payments, Revenue, Users, Settings). Kept dead-simple so it's
// obvious to anyone reading the source that there's no real screen here
// yet — just visual scaffold.

type ComingSoonProps = {
  title: string;
  description?: string;
};

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-alt/40 px-8 py-16 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="mt-4 font-serif text-2xl tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        {description ||
          "This section isn't built yet. The sidebar item is in place so the layout is complete; the screen behind it will land in a future iteration."}
      </p>
    </div>
  );
}
