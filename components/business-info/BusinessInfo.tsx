import { LEGAL_INFO } from "@/config/legal";
import { H1, H2, P, UL, HR, Strong } from "@/components/legal/prose";

// Korean e-commerce-law mandated business info disclosure. Reuses the
// same prose primitives as the legal pages so the typography matches.

export default function BusinessInfo() {
  const L = LEGAL_INFO;
  return (
    <article>
      <H1>Business Information</H1>

      <H2>Service Operator</H2>
      <P>
        <Strong>{L.businessName}</Strong> is a service operated by{" "}
        {L.operatingCompany}.
      </P>

      <H2>Company Details</H2>
      <UL>
        <li>Operating Company: {L.operatingCompany}</li>
        <li>CEO: {L.ceo}</li>
        <li>Business Registration Number: {L.businessRegistrationNumber}</li>
        <li>Address: {L.address}</li>
        <li>
          Email:{" "}
          <a
            href={`mailto:${L.supportEmail}`}
            className="text-accent hover:underline"
          >
            {L.supportEmail}
          </a>
        </li>
        <li>E-Commerce Registration: {L.ecommerceRegistration}</li>
        <li>Customer Support: Use the chat widget or email above</li>
      </UL>

      <HR />

      <H2>Notice</H2>
      <P>
        This information is provided in accordance with the Korean Act on
        the Consumer Protection in Electronic Commerce.
      </P>
    </article>
  );
}
