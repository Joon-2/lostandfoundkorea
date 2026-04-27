// Centralized legal-page config. Update values here and they propagate
// to /legal (Terms, Privacy, Refund) and /business-info.

export const LEGAL_INFO = {
  // Brand
  businessName: "Lost & Found Korea",
  businessNameKorean: "로스트앤드파운드코리아",

  // Legal entity. LFK is the service brand; Kustody is the operating
  // company. Always spell "Kustody" — never KUSTODY or kustody.
  operatingCompany: "Kustody",
  ceo: "Sim Hanjoon",

  // Contact
  supportEmail: "support@lostandfoundkorea.com",
  privacyContactName: "Sim Hanjoon",
  privacyContactTitle: "Privacy Officer",
  privacyContactEmail: "support@lostandfoundkorea.com",

  // Dates
  effectiveDate: "April 26, 2026",
  lastUpdated: "April 26, 2026",

  // Address
  address:
    "17-11 Yongsu-ro, Cheoin-gu, Yongin-si, Gyeonggi-do, Republic of Korea",
  addressKorean: "경기도 용인시 처인구 용수로 17-11",

  // Business registration. E-commerce registration is still pending; the
  // wording "To be issued" is shown verbatim until a number is assigned.
  businessRegistrationNumber: "756-08-03111",
  ecommerceRegistration: "To be issued",
} as const;

export type LegalInfo = typeof LEGAL_INFO;
