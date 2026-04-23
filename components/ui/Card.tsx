import type { ReactNode } from "react";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export default function Card({ className, children }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-card ${className ?? ""}`.trim()}
    >
      {children}
    </div>
  );
}
