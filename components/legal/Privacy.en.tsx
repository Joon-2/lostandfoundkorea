import { LEGAL_INFO } from "@/config/legal";
import { H1, H2, H3, P, UL, HR, Meta, Strong } from "@/components/legal/prose";

export default function PrivacyEn() {
  const L = LEGAL_INFO;
  return (
    <article>
      <H1>Privacy Policy</H1>
      <Meta>
        <Strong>Effective Date:</Strong> {L.effectiveDate}
        <br />
        <Strong>Last Updated:</Strong> {L.lastUpdated}
      </Meta>

      <P>
        Lost &amp; Found Korea ("LFK," "we," "us," or "our") respects your
        privacy. This Privacy Policy explains how we collect, use, share, and
        protect your personal information when you use our website and
        services.
      </P>
      <P>
        By using our services, you consent to the practices described in this
        policy.
      </P>

      <HR />

      <H2>1. Information We Collect</H2>

      <H3>1.1 Information You Provide</H3>
      <P>
        When you submit a lost item report or contact us, you may provide:
      </P>
      <UL>
        <li>Identity information: name, email address, phone number</li>
        <li>
          Lost item details: description, approximate location and time of
          loss, photos
        </li>
        <li>
          Delivery information: shipping address, country, recipient name and
          contact
        </li>
        <li>
          Payment information: processed through PayPal or other third-party
          payment providers (we do not store full card details)
        </li>
        <li>Communication content: messages you send us</li>
      </UL>

      <H3>1.2 Information Collected Automatically</H3>
      <UL>
        <li>IP address and approximate location</li>
        <li>Browser type, operating system, device information</li>
        <li>Pages visited, time spent, referring URLs</li>
        <li>Cookies and similar tracking technologies</li>
      </UL>

      <H3>1.3 Information from Third Parties</H3>
      <UL>
        <li>Payment processors (transaction confirmation)</li>
        <li>Shipping carriers (tracking and delivery status)</li>
        <li>Facility operators (item details, pickup confirmation)</li>
      </UL>

      <HR />

      <H2>2. How We Use Your Information</H2>
      <P>We use your information to:</P>
      <UL>
        <li>Process your lost item recovery and delivery requests</li>
        <li>Communicate with facilities, carriers, and authorities on your behalf</li>
        <li>Send updates about your case</li>
        <li>Process payments and issue receipts</li>
        <li>Respond to inquiries and provide customer support</li>
        <li>Improve our services and website</li>
        <li>Comply with legal obligations</li>
        <li>Detect and prevent fraud or abuse</li>
      </UL>
      <P>We do not sell your personal information to third parties.</P>

      <HR />

      <H2>3. Inspection of Item Contents</H2>
      <P>
        In the course of recovery and packaging, we may handle items that
        contain personal effects. Our policy is:
      </P>
      <UL>
        <li>
          We do not routinely inspect contents beyond what is necessary for
          safe packaging.
        </li>
        <li>
          If you specifically request that we not inspect contents, we will
          honor that request.
        </li>
        <li>
          Any incidental observation of contents during handling is treated as
          confidential and is not recorded, photographed, or shared.
        </li>
      </UL>

      <HR />

      <H2>4. Sharing Your Information</H2>
      <P>We share information only as necessary to provide our services:</P>

      <H3>4.1 Service Providers</H3>
      <UL>
        <li>Shipping carriers (EMS, DHL, FedEx, UPS, etc.)</li>
        <li>Facility operators (lockers, airports, hotels)</li>
        <li>Payment processors (PayPal, etc.)</li>
        <li>Hosting and infrastructure providers</li>
      </UL>

      <H3>4.2 Legal Requirements</H3>
      <P>
        We may disclose information if required by law, court order, or
        government request, or to protect our legal rights, prevent fraud, or
        protect the safety of others.
      </P>

      <H3>4.3 Business Transfers</H3>
      <P>
        If LFK is involved in a merger, acquisition, or sale of assets, your
        information may be transferred. You will be notified of any change.
      </P>

      <HR />

      <H2>5. International Data Transfers</H2>
      <P>
        LFK is based in the Republic of Korea. If you are using our service
        from outside Korea, your information will be transferred to, stored,
        and processed in Korea.
      </P>
      <P>
        For users in the European Economic Area (EEA), United Kingdom, or
        other regions with data protection regulations, we rely on your
        consent and the necessity of the transfer to perform the service you
        requested as the legal basis for this transfer.
      </P>

      <HR />

      <H2>6. Cookies and Tracking</H2>
      <P>
        Our website uses cookies and similar technologies to remember your
        preferences, analyze website traffic, and improve user experience. You
        can control cookies through your browser settings.
      </P>

      <HR />

      <H2>7. Data Retention</H2>
      <P>We retain your personal information only as long as necessary:</P>
      <UL>
        <li>
          Active case data: for the duration of the service plus reasonable
          follow-up period
        </li>
        <li>
          Transaction records: as required by Korean tax and commercial law
          (typically 5 years)
        </li>
        <li>Communication history: up to 3 years</li>
        <li>
          Account/contact data: until you request deletion or the data is no
          longer needed
        </li>
      </UL>
      <P>
        After the retention period, your information is securely deleted or
        anonymized.
      </P>

      <HR />

      <H2>8. Your Rights</H2>
      <P>Depending on your jurisdiction, you may have the right to:</P>
      <UL>
        <li>Access the personal information we hold about you</li>
        <li>Correct inaccurate or incomplete information</li>
        <li>Delete your information (subject to legal retention obligations)</li>
        <li>Object to or restrict certain uses of your information</li>
        <li>Withdraw consent for processing based on consent</li>
        <li>Data portability</li>
        <li>Lodge a complaint with a data protection authority</li>
      </UL>
      <P>
        To exercise these rights, contact us at{" "}
        <a
          href={`mailto:${L.supportEmail}`}
          className="text-accent hover:underline"
        >
          {L.supportEmail}
        </a>
        .
      </P>

      <HR />

      <H2>9. Security</H2>
      <P>
        We implement reasonable technical and organizational measures to
        protect your information, including HTTPS encryption, restricted access
        to personal data, and secure third-party services for payment
        processing.
      </P>
      <P>
        However, no system is entirely secure. We cannot guarantee absolute
        security of information transmitted over the internet.
      </P>

      <HR />

      <H2>10. Children's Privacy</H2>
      <P>
        Our services are not directed to individuals under 14 years of age. We
        do not knowingly collect personal information from children. If we
        become aware that we have collected information from a child, we will
        delete it promptly.
      </P>

      <HR />

      <H2>11. Third-Party Links</H2>
      <P>
        Our website may contain links to third-party websites. We are not
        responsible for the privacy practices of those sites.
      </P>

      <HR />

      <H2>12. Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy from time to time. Material changes
        will be communicated via email or website notice.
      </P>

      <HR />

      <H2>13. Privacy Officer</H2>
      <P>
        <Strong>Privacy Contact</Strong>
      </P>
      <UL>
        <li>Name: {L.privacyContactName}</li>
        <li>Title: {L.privacyContactTitle}</li>
        <li>
          Email:{" "}
          <a
            href={`mailto:${L.privacyContactEmail}`}
            className="text-accent hover:underline"
          >
            {L.privacyContactEmail}
          </a>
        </li>
        <li>Postal Address: {L.address}</li>
      </UL>
      <P>
        <Strong>{L.businessName}</Strong> ("LFK") is a service operated by{" "}
        {L.operatingCompany}.
      </P>
      <UL>
        <li>Service Name: {L.businessName}</li>
        <li>Operating Company: {L.operatingCompany}</li>
        <li>CEO: {L.ceo}</li>
        <li>Business Registration Number: {L.businessRegistrationNumber}</li>
        <li>E-Commerce Registration: {L.ecommerceRegistration}</li>
        <li>Address: {L.address}</li>
      </UL>

      <HR />

      <P>
        By using LFK's services, you acknowledge that you have read and
        understood this Privacy Policy.
      </P>
    </article>
  );
}
