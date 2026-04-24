import type { CSSProperties } from "react";

type Direction = "up" | "down" | "left" | "right";

const ROTATION: Record<Direction, string> = {
  down: "rotate(0deg)",
  up: "rotate(180deg)",
  left: "rotate(90deg)",
  right: "rotate(-90deg)",
};

// Chevron polyline used for expand/collapse arrows (admin report cards,
// accordion disclosures). The default direction is "down"; pass direction
// to rotate the glyph.
export default function ChevronIcon({
  className = "h-4 w-4",
  direction = "down",
  style,
}: {
  className?: string;
  direction?: Direction;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: ROTATION[direction], ...style }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
