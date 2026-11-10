import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How EduFund CEBBD collects, uses, and protects donor and student information, including our approach to anonymity and private student data.",
  alternates: { canonical: "/privacy-policy" },
};

const sections: LegalSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <>
        <p>
          EduFund CEBBD is the education crowdfunding programme of Community
          Empowerment Bangladesh (CEBBD). This policy explains what information we
          collect when you use this website, why we collect it, and how we protect
          it.
        </p>
        <p>
          We keep the website deliberately simple: you can browse student profiles
          without an account, and you only need an account to donate, message the
          team, or manage your privacy settings.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>We collect information in three ways:</p>
        <ul>
          <li>
            <strong>Donor account details:</strong> your full name, email address,
            optional phone number, optional city or address, password, and privacy
            preferences.
          </li>
          <li>
            <strong>Donation records:</strong> the student you support, amount,
            support type, payment method, transaction ID, sender reference, payment
            date, optional message, and verification status.
          </li>
          <li>
            <strong>Messages and technical data:</strong> the content of messages
            you send to the CEBBD team, plus basic technical information needed to
            keep the site secure and reliable.
          </li>
        </ul>
        <p>
          Account details are stored securely by our authentication provider.
          Sample donation and message data are kept in your browser&apos;s local
          storage.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How we use information",
    body: (
      <>
        <ul>
          <li>To create and manage your donor account.</li>
          <li>To record, verify, and report on your donations.</li>
          <li>To respond to your messages and support requests.</li>
          <li>To show your support on public pages according to your privacy settings.</li>
          <li>To prevent duplicate, fraudulent, or incorrect donation submissions.</li>
          <li>To meet legal, accounting, and safeguarding obligations.</li>
        </ul>
        <p>
          We do not sell your personal information, and we do not use donor contact
          details for third-party advertising.
        </p>
      </>
    ),
  },
  {
    id: "student-privacy",
    title: "Student privacy",
    body: (
      <>
        <p>
          Student dignity is central to our programme. Public profiles show only the
          information needed to tell a student&apos;s story and build trust:
        </p>
        <ul>
          <li>Name, education category, institution, district, and division.</li>
          <li>Academic background and the story the student has consented to share.</li>
          <li>Campaign funding requirement, verified progress, and support options.</li>
        </ul>
        <p>
          We <strong>never</strong> publish a student&apos;s mobile number,
          father&apos;s or mother&apos;s name, private address, date of birth,
          family income, guardian occupation, or internal admin notes. These fields
          are visible only to authorised CEBBD staff.
        </p>
      </>
    ),
  },
  {
    id: "donor-privacy",
    title: "Donor privacy and anonymity",
    body: (
      <>
        <p>
          Donor identities are hidden by default. When your name is hidden, public
          pages show “Anonymous Supporter” next to your verified donation. You can
          choose to show your name at any time from{" "}
          <Link href="/dashboard/privacy">Privacy Settings</Link>.
        </p>
        <p>
          Even when you show your name, we never publish your email address, phone
          number, address, donor ID, or full donation history. The CEBBD team can
          see your contact details for donation verification and support.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payment information",
    body: (
      <>
        <p>
          Donations are processed manually through bank transfer, bKash, or Nagad.
          We record the transaction ID and sender reference you submit so the finance
          team can match your payment.
        </p>
        <p>
          We do not ask for or store full card numbers, PINs, passwords, or one-time
          access codes. Never send these through the contact form or messages.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <>
        <p>
          Secure authentication cookies keep you signed in. Sample donations,
          messages, and settings are stored in your browser&apos;s local storage.
          Clearing your browser storage or using the reset option in Site Settings
          removes this sample data.
        </p>
        <p>
          We do not use advertising cookies or third-party tracking pixels. Only
          essential cookies are used for authentication and security.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "When we share information",
    body: (
      <>
        <p>We share information only when necessary:</p>
        <ul>
          <li>
            <strong>Education institutions:</strong> to confirm enrolment and apply
            approved funds to a student&apos;s account.
          </li>
          <li>
            <strong>Service providers:</strong> trusted providers that help us host,
            secure, and operate the platform, under confidentiality obligations.
          </li>
          <li>
            <strong>Legal requirements:</strong> when required by law, regulation, or
            a valid legal request.
          </li>
        </ul>
        <p>
          We do not share donor contact details with students or the public. Messages
          are handled by the CEBBD team on behalf of students.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    body: (
      <>
        <p>
          Donation and receipt records are kept for as long as needed to meet
          accounting, audit, and legal requirements. Account details are kept while
          your account is active and for a reasonable period afterward.
        </p>
        <p>
          Sample data remains in your browser until you clear it or reset it from
          Site Settings.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>You can ask us to:</p>
        <ul>
          <li>Access the personal information we hold about you.</li>
          <li>Correct inaccurate account or contact details.</li>
          <li>Change your public anonymity setting.</li>
          <li>Delete your account, subject to record-keeping obligations.</li>
          <li>Withdraw consent for optional communications.</li>
        </ul>
        <p>
          Use the <Link href="/contact">contact form</Link> to make a request. We may
          need to verify your identity before acting on it.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's privacy",
    body: (
      <>
        <p>
          Student profiles may include information about young people. We publish
          only consented, non-sensitive details and never publish private contact
          information. Donor accounts are intended for people aged 18 or over; a
          parent or guardian should manage support for younger donors.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We may update this policy as the programme grows. Material changes will be
          reflected in the “last updated” date at the top of this page. Continued use
          of the site after an update means you accept the revised policy.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>
          For privacy questions or requests, contact the CEBBD team through the{" "}
          <Link href="/contact">contact form</Link> or email{" "}
          <a href="mailto:info@cebbd.org">info@cebbd.org</a>.
        </p>
        <p>
          Community Empowerment Bangladesh, House 12, Road 5, Gulshan 1, Dhaka 1212,
          Bangladesh.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="We collect as little as possible, publish only what is consented, and keep donor identities private by default."
      updated="1 October 2026"
      sections={sections}
    />
  );
}
