import { getTranslations } from "next-intl/server";
import { LEGAL_INFO } from "@/config/legal";
import { H1, H2, P, UL, HR } from "@/components/legal/prose";

// Korean e-commerce-law mandated business info disclosure. Reuses the
// same prose primitives as the legal pages so the typography matches.
// Headings/sentences come from the businessInfo namespace; data values
// (operating company name, CEO, registration number, address, email)
// stay in config/legal.ts as Layer 1 shared data — the law mandates
// the disclosure regardless of viewer locale.

export default async function BusinessInfo() {
  const L = LEGAL_INFO;
  const t = await getTranslations("businessInfo");
  return (
    <article>
      <H1>{t("h1")}</H1>

      <H2>{t("serviceOperatorH2")}</H2>
      <P>
        {t("serviceOperatorBody", {
          businessName: L.businessName,
          operatingCompany: L.operatingCompany,
        })}
      </P>

      <H2>{t("companyDetailsH2")}</H2>
      <UL>
        <li>{t("fields.operatingCompany")}: {L.operatingCompany}</li>
        <li>{t("fields.ceo")}: {L.ceo}</li>
        <li>{t("fields.businessRegistrationNumber")}: {L.businessRegistrationNumber}</li>
        <li>{t("fields.address")}: {L.address}</li>
        <li>
          {t("fields.email")}:{" "}
          <a
            href={`mailto:${L.supportEmail}`}
            className="text-accent hover:underline"
          >
            {L.supportEmail}
          </a>
        </li>
        <li>{t("fields.ecommerceRegistration")}: {t("fields.ecommerceRegistrationValue")}</li>
        <li>{t("fields.customerSupport")}: {t("fields.customerSupportValue")}</li>
      </UL>

      <HR />

      <H2>{t("noticeH2")}</H2>
      <P>{t("noticeBody")}</P>
    </article>
  );
}
