import { siteConfig } from "@/config/site";

export const WHATSAPP_URL = `${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

function WhatsAppIcon({ className = "h-7 w-7" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39-.101 0-.237-.061-.386-.135-.897-.452-1.826-.975-2.744-1.487-.45-.252-.9-.504-1.35-.756-.45-.252-.9-.504-1.3-.806-.4-.302-.7-.604-1-.906-.3-.302-.6-.604-.9-.906-.3-.302-.55-.604-.7-.906-.15-.302-.25-.604-.25-.856 0-.252.1-.504.3-.705.2-.202.45-.353.7-.504.25-.151.5-.252.7-.302.2-.05.4-.05.5-.05.15 0 .3.05.45.151.15.101.25.252.35.403.1.151.2.302.25.453.05.151.1.302.1.403 0 .101-.05.202-.15.302-.1.101-.2.202-.35.302-.15.101-.25.202-.3.302-.05.101-.05.202 0 .353.1.302.3.604.5.856.2.252.5.554.75.806.25.252.5.504.8.705.3.202.6.353.85.453.25.101.5.151.65.151.15 0 .3-.05.4-.151.1-.101.25-.252.4-.403.15-.151.25-.302.4-.403.15-.101.3-.151.5-.101.2.05.45.151.75.302.3.151.55.302.75.453.2.151.35.252.4.302.05.05.05.202-.05.403zM16 2C8.268 2 2 8.268 2 16c0 2.47.64 4.79 1.766 6.807L2 30l7.326-1.735A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.648c-2.087 0-4.034-.608-5.676-1.658l-.407-.24-4.22.998 1.002-4.11-.266-.42A11.597 11.597 0 0 1 4.351 16C4.351 9.573 9.573 4.35 16 4.35c6.428 0 11.65 5.223 11.65 11.65 0 6.426-5.222 11.648-11.65 11.648z" />
    </svg>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-[9999] flex items-center gap-3"
      style={{ zIndex: 9999 }}
    >
      <span className="hidden items-center rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white shadow-lg sm:inline-flex">
        Urgent? Chat now
      </span>
      <span className="relative flex h-14 w-14">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-60" />
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-[#25D366]/30 transition-transform hover:scale-105">
          <WhatsAppIcon />
        </span>
      </span>
    </a>
  );
}

export function WhatsAppBanner() {
  return (
    <div className="border-y border-[#25D366]/30 bg-[#25D366]/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm font-medium text-foreground sm:text-base">
          Leaving Korea soon?{" "}
          <span className="text-muted">
            Chat with us now for urgent help.
          </span>
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1ebe57]"
        >
          <WhatsAppIcon className="h-4 w-4" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
