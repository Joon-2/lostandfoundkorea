import type { SelectHTMLAttributes, ReactNode } from "react";

type SelectProps = {
  label?: string;
  required?: boolean;
  error?: string;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
  children?: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

const CLS =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors";

export default function Select(props: SelectProps) {
  const { label, required, error, options, placeholder, className, children, ...rest } = props;
  const cls = `${CLS} ${className ?? ""}`.trim();

  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o
  );

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <select {...rest} className={cls}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
