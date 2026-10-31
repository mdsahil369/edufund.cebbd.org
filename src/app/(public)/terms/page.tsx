import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for using EduFund CEBBD, including donor accounts, manual donation verification, student campaigns, and acceptable use.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <>
        <p>
          By using EduFund CEBBD, creating a donor account, or submitting a donation,
          you agree to these Terms of Service and our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>. If you do not agree,
          please do not use the platform.
        </p>
        <p>
          This is a frontend prototype. Some features are simulated and no real
          payment is processed through this website.
        </p>
      </>
    ),
  },
  {
    id: "platform",
    title: "About the platform",
    body: (
      <>
        <p>
          EduFund CEBBD connects donors with students supported by Community
          Empowerment Bangladesh. Student profiles are published after a verification
          process. We may update, pause, or close a campaign if a student&apos;s
          circumstances change or verification cannot be maintained.
        </p>
        <p>
          We are not a bank, payment processor, or financial adviser. Donations are
          voluntary contributions to an education programme.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Donor accounts",
    body: (
      <>
        <ul>
          <li>You must provide accurate account information and keep it up to date.</li>
          <li>You are responsible for keeping your password confidential.</li>
          <li>You must be 18 or older, or have a parent or guardian manage the account.</li>
          <li>We may suspend accounts that are used fraudulently or abusively.</li>
        </ul>
        <p>
          In this demo, accounts exist only in your browser. Do not reuse a real
          password you use elsewhere.
        </p>
      </>
    ),
  },
  {
    id: "donations",
    title: "Donations and verification",
    body: (
      <>
        <p>
          All donations are submitted as <strong>pending</strong>. A member of the
          CEBBD finance team reviews the transaction ID and payment details before a
          donation is approved or rejected. Only approved donations are added to a
          student&apos;s public campaign total.
        </p>
        <ul>
          <li>Use the exact amount shown in your donation summary.</li>
          <li>Do not submit the same transaction ID more than once.</li>
          <li>Keep your payment receipt until verification is complete.</li>
          <li>We may reject a donation if the payment cannot be matched or appears fraudulent.</li>
        </ul>
        <p>
          Approval times are estimates, not guarantees. If a donation is rejected, the
          review note explains why where possible.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds and incorrect payments",
    body: (
      <>
        <p>
          If you believe you transferred an incorrect amount or sent a payment by
          mistake, contact us immediately with the transaction ID. Refunds are handled
          case by case and may depend on the payment provider and whether funds have
          already been applied to a student&apos;s account.
        </p>
        <p>
          Duplicate or fraudulent submissions may be reversed. We do not charge a
          platform fee in this prototype.
        </p>
      </>
    ),
  },
  {
    id: "campaigns",
    title: "Student campaigns",
    body: (
      <>
        <p>
          Student information is shared with consent and verified before publication.
          We aim to apply approved funds to education costs such as tuition,
          registration, accommodation, transport, and learning materials.
        </p>
        <p>
          If a campaign raises more than the verified requirement, or a student&apos;s
          situation changes, remaining funds may be redirected to a similar education
          purpose with the student&apos;s knowledge and CEBBD oversight.
        </p>
      </>
    ),
  },
  {
    id: "messaging",
    title: "Messaging and conduct",
    body: (
      <>
        <p>
          Messages must be respectful and relevant to the student&apos;s education.
          Do not use the platform to harass, discriminate, solicit personal contact
          details, or share another person&apos;s private information.
        </p>
        <p>
          The CEBBD team replies on behalf of students. Students do not currently
          participate directly in the messaging system.
        </p>
      </>
    ),
  },
  {
    id: "prohibited",
    title: "Prohibited use",
    body: (
      <>
        <ul>
          <li>Submitting false donation records or another person&apos;s transaction ID.</li>
          <li>Attempting to access admin areas or donor accounts without authorisation.</li>
          <li>Scraping, harvesting, or publishing private student or donor information.</li>
          <li>Interfering with the security or availability of the platform.</li>
          <li>Using the platform for unlawful purposes.</li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The EduFund CEBBD name, logo, site design, and original content belong to
          Community Empowerment Bangladesh or its licensors. Student stories remain
          the property of the students and are used with permission. You may not
          reproduce site content for commercial purposes without written permission.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <>
        <p>
          The platform is provided on an “as is” and “as available” basis. We work to
          keep information accurate, but we do not guarantee that every profile,
          amount, or status is free of error. This prototype contains illustrative
          demo data.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the extent permitted by law, CEBBD is not liable for indirect or
          consequential losses arising from use of the platform, including losses
          caused by payment provider delays or inaccurate information submitted by a
          user. Nothing in these terms limits liability that cannot legally be
          limited.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <>
        <p>
          We may update these terms as the programme develops. The “last updated” date
          at the top of this page will change when we do. Continued use of the
          platform after an update means you accept the revised terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>
          Questions about these terms? Use the{" "}
          <Link href="/contact">contact form</Link> or email{" "}
          <a href="mailto:hello@cebbd.org">hello@cebbd.org</a>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      description="The ground rules for using EduFund CEBBD, submitting donations, and supporting students."
      updated="1 October 2026"
      sections={sections}
    />
  );
}
