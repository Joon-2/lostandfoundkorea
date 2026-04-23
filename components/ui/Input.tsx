import type { ChangeEvent, ReactNode } from "react";

type InputProps = {
  label?: string;
  required?: boolean;
  error?: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  multiline?: boolean;
  type?: "text" | "email" | "tel" | "url" | "date" | "password" | "number";
};

const INPUT_CLS =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors";

export default function Input(props: InputProps) {
  const {
    label,
    required,
    error,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    className,
    multiline,
    type = "text",
  } = props;

  const shared = {
    name,
    value,
    placeholder,
    disabled,
    onChange: onChange as (e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => void,
  };

  const field = multiline ? (
    <textarea
      {...shared}
      className={`${INPUT_CLS} min-h-28 resize-y ${className ?? ""}`.trim()}
    />
  ) : (
    <input
      {...shared}
      type={type}
      className={`${INPUT_CLS} ${className ?? ""}`.trim()}
    />
  );

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      {field}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
