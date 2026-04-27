import { LEGAL_INFO } from "@/config/legal";
import { H1, H2, H3, P, UL, HR, Meta, Strong } from "@/components/legal/prose";

export default function Terms() {
  const L = LEGAL_INFO;
  return (
    <article>
      <H1>Terms of Service</H1>
      <Meta>
        <Strong>Effective Date:</Strong> {L.effectiveDate}
        <br />
        <Strong>Last Updated:</Strong> {L.lastUpdated}
      </Meta>

      <P>
        Welcome to Lost &amp; Found Korea ("LFK," "we," "us," or "our"). These
        Terms of Service ("Terms") govern your use of our website and services.
        By using our services, you agree to these Terms.
      </P>

      <HR />

      <H2>1. About Our Service</H2>
      <P>
        LFK provides lost item recovery and delivery services in Korea for
        users worldwide. We act as your authorized agent to locate, retrieve,
        and deliver lost items from Korean facilities (airports, lockers,
        public transportation, hotels, etc.).
      </P>
      <P>
        This service is a commercial service contract (a paid agency service
        under the Korean Civil Code), separate from any statutory finder's
        reward system under Korea's Lost Articles Act.
      </P>

      <HR />

      <H2>2. Service Options</H2>
      <P>
        LFK offers three service tiers. All fees are quoted in USD. Equivalent
        amounts in other currencies (KRW, JPY, etc.) may be available based on
        your payment method, calculated at the prevailing exchange rate at the
        time of payment.
      </P>

      <H3>2.1 Recovery — FREE to start, $39 if found</H3>
      <P>A pay-if-found search service.</P>
      <UL>
        <li>Free to start. No payment information required upfront.</li>
        <li>Submit a brief report describing your lost item.</li>
        <li>Our team conducts the search in Korean on your behalf.</li>
        <li>You receive an email update within 24–48 hours.</li>
        <li>
          If we successfully locate your item: you may pay $39 to unlock the
          pickup details (location, contact, and retrieval instructions).
        </li>
        <li>If we do not locate your item: no charge.</li>
        <li>
          After paying $39, you may handle pickup yourself, or add our Pickup
          service starting at +$59.
        </li>
      </UL>

      <H3>2.2 All-in-One — $79 (Recommended)</H3>
      <P>
        A single-price, end-to-end service combining search, coordination, and
        shipping.
      </P>
      <UL>
        <li>Includes everything in the Recovery tier.</li>
        <li>
          We coordinate pickup with the venue, facility, or authorities holding
          the item.
        </li>
        <li>Domestic or international shipping included in the price.</li>
        <li>
          Single price upfront — no hidden add-on fees (subject to surcharges
          in Section 2.4).
        </li>
      </UL>

      <H3>2.3 Delivery Only — $49</H3>
      <P>
        For users who already know exactly where their lost item is being held.
      </P>
      <UL>
        <li>You provide us the location and any reference numbers.</li>
        <li>We pick up the item and ship it to your address.</li>
        <li>Korean-language coordination handled on your behalf.</li>
        <li>Tracking number emailed once the item ships.</li>
      </UL>

      <H3>2.4 Surcharges</H3>
      <P>
        The following surcharges apply where applicable, in addition to the
        base service fee:
      </P>
      <UL>
        <li>Outside Seoul/Gyeonggi region: +$20</li>
        <li>Pickup add-on (Recovery tier only): from +$59</li>
      </UL>

      <H3>2.5 Costs Charged Separately</H3>
      <P>Service fees do not include:</P>
      <UL>
        <li>Storage fees charged by lockers, airports, or facilities</li>
        <li>
          International shipping fees beyond what's included in the All-in-One
          tier
        </li>
        <li>Optional shipping insurance</li>
        <li>Customs duties and import taxes</li>
        <li>Special packaging materials beyond standard</li>
      </UL>
      <P>
        We will provide an itemized cost estimate before you commit to any
        chargeable service.
      </P>

      <HR />

      <H2>3. User Responsibilities</H2>
      <P>By using our services, you agree to:</P>
      <UL>
        <li>
          Provide accurate information about the lost item, the approximate
          location and time of loss, and your delivery address.
        </li>
        <li>
          Authorize LFK to act as your agent in retrieving the item from
          third-party facilities.
        </li>
        <li>
          Confirm that you are the rightful owner of the item or have the legal
          authority to recover it.
        </li>
        <li>
          Pay all applicable fees in a timely manner once you have agreed to a
          service.
        </li>
      </UL>
      <P>You may not use our services to recover items that:</P>
      <UL>
        <li>Do not belong to you</li>
        <li>Are illegal, prohibited, or restricted by law</li>
        <li>Are subject to ongoing legal disputes</li>
        <li>Cannot be legally transported across borders</li>
      </UL>

      <HR />

      <H2>4. Authorization to Act on Your Behalf</H2>
      <P>When you engage our service, you authorize LFK to:</P>
      <UL>
        <li>Communicate with facility operators on your behalf</li>
        <li>Receive and take physical possession of your item</li>
        <li>Pay third-party fees on your behalf, to be reimbursed by you</li>
        <li>Package and arrange shipment of the item</li>
      </UL>
      <P>
        This authorization is limited to the specific item and purpose stated
        in your service request.
      </P>

      <HR />

      <H2>5. Inspection of Contents</H2>
      <P>
        We do not routinely inspect the contents of recovered items beyond what
        is necessary for safe packaging. If you specifically request that we
        not inspect the contents, we will honor that request and our records
        will reflect that the item was sealed and intact upon receipt.
      </P>
      <P>
        We are not responsible for verifying the contents of any sealed bag,
        box, or container.
      </P>

      <HR />

      <H2>6. Shipping and Delivery</H2>
      <H3>6.1 Carrier Options</H3>
      <P>
        We offer multiple shipping options (EMS, EMS Premium, DHL, FedEx, UPS,
        etc.). You select the carrier and service level. We are not responsible
        for the operations or service quality of third-party carriers.
      </P>
      <H3>6.2 Shipping Risk</H3>
      <P>
        You assume all risk of loss or damage during shipping, including but
        not limited to items lost in transit, items damaged by carriers, items
        delayed or seized by customs, and items returned or refused.
      </P>
      <P>
        LFK is not liable for any loss, damage, or delay occurring after the
        item leaves our possession and is handed over to the carrier.
      </P>
      <H3>6.3 Insurance (Recommended)</H3>
      <P>
        We strongly recommend purchasing shipping insurance for items of
        significant value. Insurance is provided by the carrier, not LFK;
        claims are handled directly between you and the carrier.
      </P>
      <H3>6.4 Customs and Duties</H3>
      <P>
        You are responsible for any customs duties, import taxes, or fees
        imposed by your country.
      </P>

      <HR />

      <H2>7. Fees, Payments, and Refunds</H2>
      <H3>7.1 Payment Methods</H3>
      <P>
        We accept payment via PayPal and other electronic methods indicated at
        checkout.
      </P>
      <H3>7.2 Prepayment Required</H3>
      <P>
        For All-in-One and Delivery Only services, full payment (LFK service
        fee + all third-party costs) is required before service begins.
      </P>
      <H3>7.3 Refund Policy</H3>
      <P>See our Refund Policy for full details.</P>

      <HR />

      <H2>8. Service Limitations</H2>
      <P>We do not guarantee:</P>
      <UL>
        <li>That any specific item can be located</li>
        <li>The condition of recovered items</li>
        <li>Specific delivery timelines (carrier-dependent)</li>
        <li>Recovery from facilities that decline to cooperate</li>
      </UL>
      <P>
        If we are unable to locate or recover an item, no fees are charged for
        the search component.
      </P>

      <HR />

      <H2>9. Limitation of Liability</H2>
      <P>To the maximum extent permitted by law:</P>
      <UL>
        <li>
          LFK's total liability for any claim related to our services shall not
          exceed the amount of LFK service fees paid by you for that specific
          service request.
        </li>
        <li>
          We are not liable for indirect, incidental, consequential, or
          punitive damages.
        </li>
        <li>
          We are not liable for actions of third parties (carriers, facilities,
          customs authorities, etc.).
        </li>
        <li>
          We are not liable for items lost or damaged during shipping (see
          Section 6.2).
        </li>
      </UL>
      <P>
        This limitation does not apply where prohibited by mandatory consumer
        protection laws.
      </P>

      <HR />

      <H2>10. Privacy</H2>
      <P>
        Your privacy is important to us. Please review our Privacy Policy for
        details on how we collect, use, and protect your information.
      </P>

      <HR />

      <H2>11. Intellectual Property</H2>
      <P>
        All content on the LFK website is the property of LFK or its licensors
        and is protected by copyright and trademark laws. You may not
        reproduce, distribute, or create derivative works without our written
        permission.
      </P>

      <HR />

      <H2>12. Modifications</H2>
      <P>
        We may update these Terms from time to time. Material changes will be
        communicated via email or website notice. Continued use of our services
        after changes constitutes acceptance.
      </P>

      <HR />

      <H2>13. Termination</H2>
      <P>
        We reserve the right to refuse, suspend, or terminate service to any
        user who violates these Terms or engages in fraudulent or abusive
        behavior.
      </P>

      <HR />

      <H2>14. Dispute Resolution</H2>
      <H3>14.1 Governing Law</H3>
      <P>These Terms are governed by the laws of the Republic of Korea.</P>
      <H3>14.2 Jurisdiction</H3>
      <P>
        Any dispute arising from these Terms or our services shall be subject
        to the exclusive jurisdiction of the Seoul Central District Court,
        Republic of Korea.
      </P>
      <H3>14.3 Informal Resolution</H3>
      <P>
        We encourage you to contact us first to resolve any concerns informally
        before pursuing formal action.
      </P>

      <HR />

      <H2>15. Contact</H2>
      <P>
        <Strong>{L.businessName}</Strong> ("LFK") is a service operated by{" "}
        {L.operatingCompany}.
      </P>
      <UL>
        <li>
          Email:{" "}
          <a
            href={`mailto:${L.supportEmail}`}
            className="text-accent hover:underline"
          >
            {L.supportEmail}
          </a>
        </li>
        <li>Service Name: {L.businessName}</li>
        <li>Operating Company: {L.operatingCompany}</li>
        <li>CEO: {L.ceo}</li>
        <li>Business Registration Number: {L.businessRegistrationNumber}</li>
        <li>E-Commerce Registration: {L.ecommerceRegistration}</li>
        <li>Address: {L.address}</li>
      </UL>

      <HR />

      <P>
        By using LFK's services, you acknowledge that you have read,
        understood, and agree to be bound by these Terms of Service.
      </P>
    </article>
  );
}
