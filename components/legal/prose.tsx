import type { ReactNode } from "react";

// Shared typographic primitives for the legal pages. Tuned to match
// the existing site (font-serif headings, body color for paragraphs,
// muted for fine print).

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
      {children}
    </h1>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-12 font-serif text-2xl tracking-tight text-foreground">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 font-serif text-lg tracking-tight text-foreground">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[15px] leading-relaxed text-body">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-body marker:text-muted">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="mt-3 list-decimal space-y-1.5 pl-6 text-[15px] leading-relaxed text-body marker:text-muted">
      {children}
    </ol>
  );
}

export function HR() {
  return <hr className="mt-10 border-t border-border" />;
}

export function Meta({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-sm text-muted">{children}</p>
  );
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}
