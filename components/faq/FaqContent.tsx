import type { ReactNode } from "react";

// Pure content + slugs. Kept separate from FaqClient so the page can
// render the question text server-side for SEO while the client only
// owns the open/closed state.

export type FaqItem = {
  id: string;
  q: string;
  a: ReactNode;
};

export type FaqCategory = {
  title: string;
  items: FaqItem[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "About the Service",
    items: [
      {
        id: "what-does-lfk-do",
        q: "What does Lost & Found Korea actually do?",
        a: (
          <p>
            We help international travelers recover items they've left behind
            in Korea — bags, wallets, passports, electronics, anything you
            might have lost at an airport, hotel, locker, public transit
            station, or other Korean facility. We coordinate the search in
            Korean on your behalf, retrieve the item once located, package it
            carefully, and ship it to wherever you are in the world.
          </p>
        ),
      },
      {
        id: "why-need-this-service",
        q: "Why do I need a service like this?",
        a: (
          <p>
            Korean facilities are excellent at storing lost items, but they
            generally aren't equipped to handle international shipping,
            English correspondence, or follow-ups across time zones. Once
            you've left the country, the practical path back to your item
            often closes. We bridge that gap.
          </p>
        ),
      },
      {
        id: "where-in-korea",
        q: "Where in Korea do you operate?",
        a: (
          <p>
            We work nationwide. We coordinate with airports, hotels, train
            and subway systems, taxi companies, and various other facilities
            across Korea. Some locations outside Seoul/Gyeonggi may carry a
            small surcharge.
          </p>
        ),
      },
      {
        id: "are-you-government-affiliated",
        q: "Are you affiliated with the Korean government or any airport?",
        a: (
          <p>
            No. We're an independent, registered business in Korea. We work
            as your authorized agent — communicating with facilities and
            authorities on your behalf — but we are not part of any
            government agency or facility.
          </p>
        ),
      },
    ],
  },
  {
    title: "Pricing & Payment",
    items: [
      {
        id: "how-much-does-it-cost",
        q: "How much does it cost?",
        a: (
          <>
            <p>We offer three service tiers:</p>
            <ul>
              <li>
                <strong>Recovery</strong> — FREE to start, $39 if found. We
                search for free. You only pay $39 if we successfully locate
                your item and you wish to receive its location and pickup
                details.
              </li>
              <li>
                <strong>All-in-One</strong> — $79. A single-price service
                combining search, pickup coordination, and shipping.
              </li>
              <li>
                <strong>Delivery Only</strong> — $49. For when you already
                know where the item is being held; we handle pickup and
                shipping.
              </li>
            </ul>
            <p>
              Surcharges may apply for locations outside the Seoul/Gyeonggi
              region (+$20).
            </p>
          </>
        ),
      },
      {
        id: "other-costs",
        q: "Are there other costs beyond the service fee?",
        a: (
          <p>
            Yes. Service fees do not include third-party costs such as
            locker storage fees, international shipping, packaging materials,
            optional insurance, or customs duties. We provide an itemized
            estimate before you commit, so you'll know the full total in
            advance.
          </p>
        ),
      },
      {
        id: "how-do-i-pay",
        q: "How do I pay?",
        a: (
          <p>
            We currently accept payment via PayPal (which also supports major
            credit cards). For custom invoices that include third-party costs
            (storage, shipping, etc.), we send you an itemized invoice that
            you can pay directly through PayPal.
          </p>
        ),
      },
      {
        id: "currencies",
        q: "What currencies do you accept?",
        a: (
          <p>
            Our fees are quoted in USD. Payment is processed in USD via
            PayPal, which automatically handles currency conversion at
            PayPal's exchange rate if you pay from a different currency.
          </p>
        ),
      },
      {
        id: "why-pay-before-shipping",
        q: "Why do I have to pay before you ship?",
        a: (
          <p>
            Once we begin pickup, packaging, and shipping coordination, work
            and third-party costs are immediately incurred on your behalf —
            locker fees, packaging materials, postage. Prepayment is what
            allows us to handle those costs and ship without delay.
          </p>
        ),
      },
    ],
  },
  {
    title: "Recovery & Shipping Process",
    items: [
      {
        id: "how-to-report",
        q: "How do I report a lost item?",
        a: (
          <>
            <p>Submit a brief report through our website. Include:</p>
            <ul>
              <li>A description of the item</li>
              <li>Where you think you lost it (or last saw it)</li>
              <li>Approximate date and time of loss</li>
              <li>Your contact information and current location</li>
            </ul>
            <p>
              The initial report is free. You only commit to a service fee
              once we either locate your item (Recovery tier) or you confirm
              a service (All-in-One / Delivery Only).
            </p>
          </>
        ),
      },
      {
        id: "recovery-time",
        q: "How long does recovery typically take?",
        a: (
          <p>
            It varies depending on where the item is held and how quickly the
            facility responds. Most cases are located within 24–72 hours.
            Some take longer, particularly with smaller facilities or items
            lost in transit. We'll keep you updated throughout.
          </p>
        ),
      },
      {
        id: "if-not-found",
        q: "What if you can't find my item?",
        a: (
          <p>
            For the Recovery tier, there's no charge if we can't locate your
            item. For All-in-One service, if we cannot locate the item before
            pickup begins, we will refund the LFK service fee.
          </p>
        ),
      },
      {
        id: "will-you-open-bag",
        q: "Will you open my bag?",
        a: (
          <p>
            Only if you ask us to, or if a facility/customs requires it. If
            you prefer the bag stay sealed, we honor that completely — we'll
            repackage it in a protective outer box without opening the
            original. Just let us know your preference.
          </p>
        ),
      },
      {
        id: "how-shipped",
        q: "How will my item be shipped?",
        a: (
          <p>
            We typically use EMS (Korea Post's international express service)
            or EMS Premium, which are reliable, trackable, and well-suited
            for international delivery. Express options (DHL, FedEx, UPS) are
            available if you need faster delivery, though they cost
            significantly more. We'll recommend an option based on your
            item's size, weight, and urgency.
          </p>
        ),
      },
      {
        id: "tracking",
        q: "Do you offer tracking?",
        a: (
          <p>
            Yes. Every shipment includes a tracking number that you can use
            on Korea Post's site, USPS (for U.S. shipments), or unified
            tracking sites like 17track.net.
          </p>
        ),
      },
      {
        id: "shipping-time",
        q: "How long does shipping take?",
        a: (
          <>
            <ul>
              <li>
                <strong>EMS Standard:</strong> typically 7–14 days
              </li>
              <li>
                <strong>EMS Premium:</strong> typically 5–7 days
              </li>
              <li>
                <strong>Express (DHL/FedEx/UPS):</strong> typically 3–5 days
              </li>
            </ul>
            <p>Times vary by destination country and customs processing.</p>
          </>
        ),
      },
    ],
  },
  {
    title: "Safety, Insurance & Refunds",
    items: [
      {
        id: "insurance",
        q: "Is shipping insured?",
        a: (
          <p>
            Yes. EMS includes basic insurance, and we add declared-value
            insurance up to your stated item value at no extra cost to you,
            for protection during international transit. For high-value
            items, additional carrier insurance is available.
          </p>
        ),
      },
      {
        id: "lost-or-damaged",
        q: "What if my item is lost or damaged in shipping?",
        a: (
          <p>
            Once handed off to the carrier, the package is in their custody
            and shipping risk transfers to them. If something goes wrong in
            transit, the carrier or insurance provider handles the claim. We
            provide all documentation needed to support your claim and
            assist throughout the process.
          </p>
        ),
      },
      {
        id: "refund",
        q: "Can I get a refund?",
        a: (
          <p>
            Our services are prepay-and-go. Once payment is made, we begin
            coordination and incur third-party costs immediately on your
            behalf, so payments are generally non-refundable. The exception
            is if we cancel a service ourselves (e.g. the item cannot
            legally be shipped) — in which case we refund LFK service fees
            minus any third-party costs already incurred. See our Refund
            Policy for full details.
          </p>
        ),
      },
      {
        id: "customs-duties",
        q: "What about customs and duties?",
        a: (
          <p>
            You're responsible for any customs duties or import taxes
            imposed by your country. We declare item values honestly on
            customs forms based on the value you provide. For shipments
            under most countries' de minimis thresholds (e.g. $800 for the
            U.S.), no duties typically apply.
          </p>
        ),
      },
      {
        id: "restricted-items",
        q: "Can you ship items I'm not sure are legal to mail?",
        a: (
          <p>
            We don't ship anything illegal, hazardous, or restricted under
            Korean export law or your country's import law. This includes
            weapons, certain medications, ivory, and other regulated items.
            If we're unsure about a specific item, we'll consult with the
            post office before proceeding.
          </p>
        ),
      },
      {
        id: "personal-info",
        q: "How is my personal information handled?",
        a: (
          <p>
            We only collect what we need to coordinate the recovery and
            shipping. We never sell your data, and we share information only
            with the facilities and carriers necessary to complete your
            service. See our Privacy Policy for details.
          </p>
        ),
      },
    ],
  },
  {
    title: "Trust & Verification",
    items: [
      {
        id: "not-scam",
        q: "How do I know this isn't a scam?",
        a: (
          <p>
            Fair question. We're a registered business in Korea
            (registration number visible in our footer and legal pages). We
            provide tracking numbers, photographs of the packaging process,
            official post office receipts, and continuous updates. Payment
            is processed through PayPal, which provides its own buyer
            protection. We're happy to answer any questions before you
            commit.
          </p>
        ),
      },
      {
        id: "receipts",
        q: "Will I get receipts and documentation?",
        a: (
          <>
            <p>Yes. We provide:</p>
            <ul>
              <li>A clear estimate before payment</li>
              <li>A PayPal payment receipt</li>
              <li>Photographs of the packaging process</li>
              <li>The official shipping receipt and tracking number</li>
              <li>Customs declaration documentation</li>
            </ul>
          </>
        ),
      },
      {
        id: "problem-during-process",
        q: "What if I have a problem during the process?",
        a: (
          <p>
            Email us at{" "}
            <a
              href="mailto:support@lostandfoundkorea.com"
              className="text-accent hover:underline"
            >
              support@lostandfoundkorea.com
            </a>
            . We respond promptly. If something goes wrong, we'll work with
            you to resolve it transparently.
          </p>
        ),
      },
    ],
  },
];
