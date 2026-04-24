// Green pin mark used in the Header's logo. Extracted from the inline SVG
// that was duplicated across Header and other layout components.
export default function LogoIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.33 6.62 11.77 6.9 12.04a.85.85 0 0 0 1.2 0C12.88 21.27 19.5 14.83 19.5 9.5 19.5 5.36 16.14 2 12 2zm0 10a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}
