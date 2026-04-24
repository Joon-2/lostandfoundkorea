import Link from "next/link";
import LogoIcon from "@/assets/icons/LogoIcon";

type LogoProps = {
  name: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
};

// Wordmark + pin icon. Wraps the icon and site name in a Link by default;
// pass href={null} by omitting it for contexts that don't need navigation
// (e.g. a plain heading use).
export default function Logo({
  name,
  href = "/",
  onClick,
  className,
  iconClassName = "h-[18px] w-[18px] text-accent",
}: LogoProps) {
  const cls = `inline-flex items-center gap-2 text-[17px] font-bold tracking-tight text-black ${className ?? ""}`.trim();
  const content = (
    <>
      <LogoIcon className={iconClassName} />
      <span>{name}</span>
    </>
  );
  if (!href) {
    return <span className={cls}>{content}</span>;
  }
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {content}
    </Link>
  );
}
