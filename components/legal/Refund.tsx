import { LEGAL_INFO } from "@/config/legal";
import TbdValue from "@/components/legal/TbdValue";
import {
  H1,
  H2,
  H3,
  P,
  UL,
  OL,
  HR,
  Meta,
  Strong,
} from "@/components/legal/prose";

export default function Refund() {
  const L = LEGAL_INFO;
  return (
    <article>
      <H1>Refund Policy</H1>
      <Meta>
        <Strong>Effective Date:</Strong> {L.effectiveDate}
        <br />
        <Strong>Last Updated:</Strong> {L.lastUpdated}
      </Meta>

      <P>
        This Refund Policy explains LFK's refund and cancellation terms. By
        using our services, you agree to this policy.
      </P>

      <HR />

      <H2>1. Our Refund Approach</H2>
      <P>
        Our services are structured as prepay-and-go: you pay only when you've
        decided to proceed, and once payment is made, the service is initiated
        immediately. Because each stage involves real-time coordination,
        third-party costs, and physical handling, payments are non-refundable
        once made.
      </P>
      <P>
        This policy is provided in accordance with Article 17, Paragraph 2 of
        Korea's Act on the Consumer Protection in Electronic Commerce, which
        permits limitations on the right to withdraw for services that, by
        their nature, cannot be reversed once provided.
      </P>
      <P>
        We strongly encourage you to review the service details and cost
        estimate carefully before committing to payment.
      </P>

      <HR />

      <H2>2. Recovery (FREE → $39 if found)</H2>

      <H3>2.1 Search is Free</H3>
      <P>
        There is no charge for the initial search. If we cannot locate your
        item, no payment is required and no refund applies.
      </P>

      <H3>2.2 $39 Information Fee — Non-Refundable</H3>
      <P>
        If we successfully locate your item, you may choose to pay $39 to
        unlock the pickup details. The $39 is an information access fee. Once
        paid and the information has been delivered, the service is complete
        and the fee is non-refundable.
      </P>
      <P>
        If you choose not to pay, no information is shared and nothing is
        owed.
      </P>

      <HR />

      <H2>3. All-in-One ($79)</H2>

      <H3>3.1 Prepayment Required</H3>
      <P>The All-in-One service requires upfront payment of:</P>
      <UL>
        <li>LFK service fee: $79</li>
        <li>
          All third-party costs: storage fees, locker charges, packaging
          materials, shipping fees
        </li>
        <li>Any applicable surcharges</li>
      </UL>
      <P>You will receive an itemized cost estimate before payment.</P>

      <H3>3.2 Non-Refundable</H3>
      <P>
        Once payment is made, all amounts are non-refundable. This includes
        both the LFK service fee and third-party costs, because:
      </P>
      <UL>
        <li>
          LFK begins coordination, pickup, and shipping arrangement immediately
          upon payment.
        </li>
        <li>
          Third-party costs are paid out to facilities and carriers on your
          behalf and cannot be recovered.
        </li>
      </UL>
      <P>
        Please review the cost estimate carefully and confirm you are ready to
        proceed before paying.
      </P>

      <HR />

      <H2>4. Delivery Only ($49)</H2>

      <H3>4.1 Prepayment Required</H3>
      <P>
        Includes the $49 LFK service fee plus all shipping and related
        third-party costs.
      </P>

      <H3>4.2 Non-Refundable</H3>
      <P>
        Once payment is made, all amounts are non-refundable, as pickup and
        shipping coordination begin immediately.
      </P>

      <HR />

      <H2>5. Third-Party Costs</H2>
      <P>
        Third-party costs (storage fees, shipping fees, packaging, insurance,
        customs duties) are forwarded to the relevant third party. LFK does
        not retain these amounts.
      </P>
      <P>
        These costs are non-refundable by LFK in all cases. If you have a
        dispute with a third party, claims must be filed directly with that
        party.
      </P>

      <HR />

      <H2>6. Shipping Risk</H2>
      <P>Once your item is handed over to a shipping carrier:</P>
      <UL>
        <li>Risk transfers entirely to the carrier and recipient.</li>
        <li>
          LFK is not liable for items lost, damaged, delayed, or seized during
          shipping.
        </li>
        <li>
          All paid amounts (LFK fees and third-party costs) are non-refundable
          for issues occurring after handover.
        </li>
        <li>
          Claims for lost or damaged shipments must be filed directly with the
          carrier or the shipping insurance provider.
        </li>
        <li>
          We will provide reasonable assistance with documentation for your
          claim.
        </li>
      </UL>
      <P>
        We strongly recommend purchasing shipping insurance for items of
        significant value before shipment.
      </P>

      <HR />

      <H2>7. Cancellation by LFK</H2>
      <P>In rare cases, we may cancel a service if:</P>
      <UL>
        <li>The item cannot be legally recovered or shipped</li>
        <li>The facility holding the item refuses cooperation</li>
        <li>
          Information you provided is materially incorrect or fraudulent
        </li>
        <li>Continued service would violate applicable laws</li>
      </UL>
      <P>
        In such cases, we will refund LFK service fees paid, minus any
        third-party costs already incurred on your behalf (documented and
        itemized).
      </P>
      <P>
        This is the only scenario in which a refund of LFK service fees is
        issued.
      </P>

      <HR />

      <H2>8. Currency and Exchange Rate</H2>
      <P>
        All payments and refunds (where applicable under Section 7) are
        processed in the original payment currency. LFK is not responsible for
        currency conversion losses or exchange rate fluctuations.
      </P>

      <HR />

      <H2>9. Disputes</H2>
      <P>If you have concerns about a charge:</P>
      <OL>
        <li>
          Contact us first at{" "}
          <a
            href={`mailto:${L.supportEmail}`}
            className="text-accent hover:underline"
          >
            {L.supportEmail}
          </a>{" "}
          for informal resolution.
        </li>
        <li>
          If unresolved, you may pursue formal dispute resolution per Section
          14 of our Terms of Service.
        </li>
        <li>
          PayPal transactions may also be disputed through PayPal's resolution
          center.
        </li>
      </OL>

      <HR />

      <H2>10. Korean Consumer Protection</H2>
      <P>
        For users covered by Korean consumer protection laws, the rights
        provided under those laws apply in addition to this policy. Where this
        policy conflicts with mandatory consumer protection law, the law
        prevails.
      </P>

      <HR />

      <H2>11. Changes to This Policy</H2>
      <P>
        We may update this Refund Policy from time to time. Changes apply only
        to services purchased after the update.
      </P>

      <HR />

      <H2>12. Contact</H2>
      <P>
        <Strong>Lost &amp; Found Korea</Strong>
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
        <li>Business Name: {L.businessName}</li>
        <li>
          Business Registration Number:{" "}
          <TbdValue value={L.businessRegistrationNumber} />
        </li>
        <li>Address: {L.address}</li>
      </UL>

      <HR />

      <P>
        By using LFK's services, you acknowledge you have read and understood
        this Refund Policy, including the prepayment requirement and the
        non-refundable nature of all payments.
      </P>
    </article>
  );
}
