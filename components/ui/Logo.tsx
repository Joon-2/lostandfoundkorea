import Link from "next/link";

type LogoProps = {
  name: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
};

// Wordmark + brand mark. The mark is the same image used as the site
// favicon, served from /public so it stays in sync with whatever icon
// the favicon points at.
export default function Logo({
  name,
  href = "/",
  onClick,
  className,
  iconClassName = "h-[22px] w-[22px]",
}: LogoProps) {
  const cls = `inline-flex items-center gap-2 text-[17px] font-bold tracking-tight text-black ${className ?? ""}`.trim();
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/web-app-manifest-192x192.png?v=2"
        alt=""
        aria-hidden="true"
        className={iconClassName}
      />
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
