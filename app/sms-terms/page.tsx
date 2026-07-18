import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMS Terms & Conditions | Santa Cruz Tree Pros",
  description: "Terms and conditions for SMS lead notifications sent to Santa Cruz Tree Pros partner tree service providers.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://santacruztreepros.com/sms-terms" },
};

const EFFECTIVE_DATE = "July 18, 2026";
const BUSINESS_NAME = "Santa Cruz Tree Pros";
const CONTACT_EMAIL = "info@santacruztreepros.com";
const SITE_URL = "https://santacruztreepros.com";

export default function SmsTermsPage() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-4 py-12 space-y-10">

      <header className="space-y-3 border-b border-[var(--border)] pb-8">
        <h1 className="text-3xl font-bold tracking-tight">SMS Terms &amp; Conditions</h1>
        <p className="text-[var(--muted)]">Effective Date: {EFFECTIVE_DATE}</p>
        <p className="text-[var(--muted)] leading-7">
          This page describes the text messaging (SMS) program operated by {BUSINESS_NAME} to notify
          partner tree service providers of new customer leads in their service area (&ldquo;the Program&rdquo;).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Program Description</h2>
        <p className="text-[var(--muted)] leading-7">
          {BUSINESS_NAME} operates a referral network of independent, vetted tree service companies
          across Santa Cruz County. When a customer submits a service request through our website that
          matches a partner&rsquo;s coverage area, we send that partner a one-time SMS containing the
          customer&rsquo;s name, contact information, service address, requested service, and a link to
          view the lead in our admin system. These messages are strictly transactional — they relate
          solely to lead forwarding between {BUSINESS_NAME} and its partners and do not contain marketing
          or promotional content.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Enrollment</h2>
        <p className="text-[var(--muted)] leading-7">
          Enrollment in the Program is not self-service. Partners are added directly by {BUSINESS_NAME}
          staff as part of a referral agreement, and provide their mobile number and express consent to
          receive lead-notification texts as a condition of that agreement.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Message Frequency</h2>
        <p className="text-[var(--muted)] leading-7">
          Message frequency varies and is driven entirely by incoming customer lead volume in a partner&rsquo;s
          coverage area. There is no fixed schedule — a partner may receive several messages in one day or
          none for several days.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Cost</h2>
        <p className="text-[var(--muted)] leading-7">
          Message and data rates may apply, depending on your mobile carrier and plan. {BUSINESS_NAME}
          does not charge for Program messages.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">How to Opt Out</h2>
        <p className="text-[var(--muted)] leading-7">
          Reply <strong>STOP</strong>, <strong>STOPALL</strong>, <strong>UNSUBSCRIBE</strong>,{" "}
          <strong>CANCEL</strong>, <strong>END</strong>, or <strong>QUIT</strong> to any Program message at
          any time to immediately opt out. You will receive one confirmation message and no further texts
          unless you opt back in. Reply <strong>START</strong>, <strong>YES</strong>, or{" "}
          <strong>UNSTOP</strong> to resume receiving messages.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">How to Get Help</h2>
        <p className="text-[var(--muted)] leading-7">
          Reply <strong>HELP</strong> or <strong>INFO</strong> to any Program message for support
          information, or contact us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Carrier Liability</h2>
        <p className="text-[var(--muted)] leading-7">
          Carriers are not liable for delayed or undelivered messages. Message delivery is subject to
          effective transmission from your wireless provider and factors beyond {BUSINESS_NAME}&rsquo;s
          control.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Supported Carriers</h2>
        <p className="text-[var(--muted)] leading-7">
          The Program is supported on major U.S. wireless carriers. Carriers are not liable for delayed or
          undelivered messages.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Privacy</h2>
        <p className="text-[var(--muted)] leading-7">
          Your mobile phone number and the information used in the Program are handled in accordance with
          our{" "}
          <a href="/privacy-policy" className="text-[var(--brand-accent)] underline underline-offset-2">Privacy Policy</a>.
          We do not sell or share mobile phone numbers collected as part of the Program with third parties
          for their marketing purposes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Changes to These Terms</h2>
        <p className="text-[var(--muted)] leading-7">
          We may update these terms from time to time. Material changes will be reflected by updating the
          &ldquo;Effective Date&rdquo; at the top of this page.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Contact Us</h2>
        <div className="rounded-xl border border-[var(--border)] bg-white p-6 space-y-2 text-[var(--muted)]">
          <p className="font-semibold text-[var(--text)]">{BUSINESS_NAME}</p>
          <p>Santa Cruz County, California</p>
          <p>
            Email:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Website:{" "}
            <a href={SITE_URL} className="text-[var(--brand-accent)] underline underline-offset-2">
              {SITE_URL}
            </a>
          </p>
        </div>
      </section>

    </main>
  );
}
