import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-navy text-slate-300" id="footer">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </span>
        <span>{siteConfig.location} &middot; English-speaking support</span>
      </div>
    </footer>
  );
}
