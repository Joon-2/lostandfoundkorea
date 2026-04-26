// Centralized legal-page config. Update values here and they propagate
// to /legal (Terms, Privacy, Refund). [TBD] values render with a
// distinguishable amber pill so they're easy to find and replace.

export const LEGAL_INFO = {
  // Brand
  businessName: "Lost & Found Korea",
  businessNameKorean: "로스트앤드파운드코리아",

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

  // Business registration (fill in once registration completes)
  businessRegistrationNumber: "[TBD]",
  ecommerceRegistration: "[TBD]",
} as const;

export type LegalInfo = typeof LEGAL_INFO;
