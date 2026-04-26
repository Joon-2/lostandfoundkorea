import { LEGAL_INFO, isRegistrationPending } from "@/config/legal";

// Subtle amber notice shown at the top of every legal page until both
// businessRegistrationNumber and ecommerceRegistration are filled in.
// Returns null otherwise.

export default function RegistrationBanner() {
  if (!isRegistrationPending()) return null;
  return (
    <div
      role="note"
      className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      Our business registration is being finalized. For inquiries, contact{" "}
      <a
        href={`mailto:${LEGAL_INFO.supportEmail}`}
        className="font-medium underline hover:text-amber-900"
      >
        {LEGAL_INFO.supportEmail}
      </a>
      .
    </div>
  );
}
