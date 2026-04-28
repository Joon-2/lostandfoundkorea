import type { ReactNode, MouseEventHandler } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "border border-border bg-card text-foreground hover:bg-alt",
  danger: "bg-error text-white hover:brightness-110",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonProps = BaseProps & {
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

function buildClass(variant: Variant, size: Size, className?: string) {
  return [
    "inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className || "",
  ]
    .join(" ")
    .trim();
}

export default function Button(props: ButtonProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const cls = buildClass(variant, size, props.className);

  if (props.href !== undefined) {
    const isExternal =
      props.href.startsWith("http") ||
      props.href.startsWith("mailto:") ||
      props.href.startsWith("#");
    if (isExternal) {
      return (
        <a
          href={props.href}
          target={props.target}
          rel={props.rel}
          className={cls}
        >
          {props.children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        {props.children}
      </Link>
    );
  }

  const { type = "button", onClick, disabled, children } = props;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
