import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Santa Cruz Tree Pros",
  description: "Privacy Policy for Santa Cruz Tree Pros — how we collect, use, and protect your personal information under California law.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://santacruztreepros.com/privacy-policy" },
};
const EFFECTIVE_DATE = "March 25, 2026";
const BUSINESS_NAME = "Santa Cruz Tree Pros";
const CONTACT_EMAIL = "info@santacruztreepros.com";
const SITE_URL = "https://santacruztreepros.com";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-[860px] px-4 py-12 space-y-10">

      <header className="space-y-3 border-b border-[var(--border)] pb-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-[var(--muted)]">Effective Date: {EFFECTIVE_DATE}</p>
        <p className="text-[var(--muted)] leading-7">
          {BUSINESS_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website{" "}
          <a href={SITE_URL} className="text-[var(--brand-accent)] underline underline-offset-2">{SITE_URL}</a>{" "}
          (the &ldquo;Site&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard
          your personal information when you visit our Site or submit a service inquiry, and describes your
          rights under applicable California law, including the California Consumer Privacy Act of 2018 as
          amended by the California Privacy Rights Act of 2020 (&ldquo;CCPA/CPRA&rdquo;).
        </p>
        <p className="text-[var(--muted)] leading-7 font-medium">
          Please read this policy carefully. By using our Site, you agree to the terms described below.
        </p>
      </header>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">1. Information We Collect</h2>
        <p className="text-[var(--muted)] leading-7">
          We collect information you voluntarily provide and information automatically collected when you use our Site.
        </p>

        <h3 className="text-base font-semibold">A. Information You Provide</h3>
        <p className="text-[var(--muted)] leading-7">
          When you submit a free estimate request or contact form, we may collect:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li>Full name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Street address and city (for service location)</li>
          <li>Description of requested services</li>
          <li>Photos of trees or property you choose to upload</li>
          <li>Any other information you include in your message</li>
        </ul>

        <h3 className="text-base font-semibold mt-4">B. Automatically Collected Information</h3>
        <p className="text-[var(--muted)] leading-7">
          When you visit our Site, we or our third-party service providers may automatically collect:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li>IP address and general geographic location</li>
          <li>Browser type and version</li>
          <li>Device type and operating system</li>
          <li>Pages visited, time spent on pages, and referring URLs</li>
          <li>Date and time of your visit</li>
          <li>Clickstream data and interactions with the Site</li>
        </ul>

        <h3 className="text-base font-semibold mt-4">C. CAPTCHA and Bot Prevention</h3>
        <p className="text-[var(--muted)] leading-7">
          Our Site uses Cloudflare Turnstile to verify that form submissions are made by humans. This service
          may collect certain browser and device signals. Please review Cloudflare&rsquo;s privacy policy at{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" className="text-[var(--brand-accent)] underline underline-offset-2" target="_blank" rel="noopener noreferrer">cloudflare.com/privacypolicy</a>.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
        <p className="text-[var(--muted)] leading-7">We use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li>Respond to your service inquiries and provide free estimates</li>
          <li>Schedule and fulfill tree care services</li>
          <li>Communicate with you regarding your request, appointment, or service</li>
          <li>Send follow-up communications related to services you&rsquo;ve requested</li>
          <li>Improve our Site, services, and customer experience</li>
          <li>Prevent fraud and ensure the security of our Site</li>
          <li>Comply with applicable legal obligations</li>
        </ul>
        <p className="text-[var(--muted)] leading-7">
          We do not sell your personal information to third parties. We do not use your information for
          automated profiling or decision-making that produces legal or similarly significant effects.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">3. How We Share Your Information</h2>
        <p className="text-[var(--muted)] leading-7">
          We may share your information in the following circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li>
            <strong>Partner Tree Service Providers:</strong> When you submit an estimate request, your
            contact information and project details may be shared with vetted local tree service companies
            in your area so they can follow up regarding your request. By submitting the estimate form,
            you consent to this sharing. You will be informed of this at the point of form submission.
          </li>
          <li>
            <strong>Infrastructure Service Providers:</strong> We use trusted third-party infrastructure to operate
            this Site. These providers access your information only to perform services on our behalf and
            are contractually obligated to protect it:
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Vercel</strong> — website hosting and serverless infrastructure (vercel.com)</li>
              <li><strong>Vercel Blob</strong> — cloud storage for photos you upload with your estimate request</li>
              <li><strong>Neon</strong> — PostgreSQL database hosting for estimate submissions (neon.tech)</li>
              <li><strong>Resend</strong> — transactional email delivery for inquiry notifications (resend.com)</li>
              <li><strong>Google Analytics 4</strong> — anonymous website traffic analytics; data is aggregated and does not identify you personally (see Section 5)</li>
              <li><strong>Cloudflare Turnstile</strong> — bot and spam prevention on our estimate form (cloudflare.com)</li>
            </ul>
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose information if required by law, subpoena,
            court order, or to protect the rights, property, or safety of our business, customers, or others.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a
            portion of our business, your information may be transferred as part of that transaction.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">4. Data Retention</h2>
        <p className="text-[var(--muted)] leading-7">
          We retain personal information submitted through our contact and estimate forms for as long as
          necessary to fulfill the purposes described in this policy, including responding to your inquiry
          and providing ongoing services. If you have not engaged our services, we typically retain inquiry
          data for no longer than 24 months. You may request deletion of your data at any time (see Section 6).
        </p>
        <p className="text-[var(--muted)] leading-7">
          Photos you upload as part of a service inquiry are stored on our servers solely to assist in
          evaluating your tree service request and are not shared with third parties for marketing purposes.
        </p>
      </section>

      {/* Section 5 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">5. Cookies and Tracking Technologies</h2>
        <p className="text-[var(--muted)] leading-7">
          Our Site may use cookies and similar tracking technologies (such as pixels and web beacons) to
          enhance functionality and understand how visitors interact with the Site. Types of cookies we
          may use include:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li><strong>Essential cookies:</strong> Required for the Site to function (e.g., security tokens).</li>
          <li><strong>Analytics cookies:</strong> We use Google Analytics 4 (GA4) to understand Site traffic and
          user behavior in aggregate. GA4 uses cookies to collect anonymized data such as pages visited, session
          duration, and general geographic location. This data is not linked to your name or contact information.
          You can opt out of Google Analytics tracking by installing the{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" className="text-[var(--brand-accent)] underline underline-offset-2" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</li>
        </ul>
        <p className="text-[var(--muted)] leading-7">
          You may disable cookies through your browser settings. Disabling cookies may affect certain Site
          features. We do not respond to browser &ldquo;Do Not Track&rdquo; signals at this time, but we do not engage
          in cross-site behavioral tracking.
        </p>
      </section>

      {/* Section 6 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">6. California Privacy Rights (CCPA/CPRA)</h2>
        <p className="text-[var(--muted)] leading-7">
          If you are a California resident, you have specific rights regarding your personal information
          under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act
          (CPRA):
        </p>

        <h3 className="text-base font-semibold">Right to Know</h3>
        <p className="text-[var(--muted)] leading-7">
          You have the right to request that we disclose: (a) the categories of personal information we
          have collected about you; (b) the categories of sources from which we collected it; (c) our
          business or commercial purpose for collecting it; (d) the categories of third parties with whom
          we share it; and (e) the specific pieces of personal information we have collected about you.
        </p>

        <h3 className="text-base font-semibold">Right to Delete</h3>
        <p className="text-[var(--muted)] leading-7">
          You have the right to request deletion of personal information we have collected from you,
          subject to certain exceptions (e.g., where retention is required to complete a transaction or
          comply with a legal obligation).
        </p>

        <h3 className="text-base font-semibold">Right to Correct</h3>
        <p className="text-[var(--muted)] leading-7">
          You have the right to request that we correct inaccurate personal information we maintain about you.
        </p>

        <h3 className="text-base font-semibold">Right to Opt-Out of Sale or Sharing</h3>
        <p className="text-[var(--muted)] leading-7">
          When you submit an estimate request, your contact information and project details may be shared
          with vetted local tree service companies for the purpose of fulfilling your request. This
          sharing is disclosed at the point of form submission and is necessary to connect you with
          service providers. We do not sell or share your personal information for cross-context
          behavioral advertising. To opt out of having your information shared with partner tree service
          providers, simply do not submit the estimate form, or contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>{" "}
          after submission and we will not forward your information to any additional partners.
        </p>

        <h3 className="text-base font-semibold">Right to Limit Use of Sensitive Personal Information</h3>
        <p className="text-[var(--muted)] leading-7">
          We do not use or disclose sensitive personal information beyond what is necessary to provide
          our services or as otherwise permitted by the CPRA.
        </p>

        <h3 className="text-base font-semibold">Right to Non-Discrimination</h3>
        <p className="text-[var(--muted)] leading-7">
          We will not discriminate against you for exercising any of your CCPA/CPRA rights. We will not
          deny you services, charge different prices, or provide a different quality of service because
          you exercised your privacy rights.
        </p>

        <h3 className="text-base font-semibold">Shine the Light (Cal. Civ. Code § 1798.83)</h3>
        <p className="text-[var(--muted)] leading-7">
          California residents may request, once per calendar year and free of charge, information about
          the personal information we have shared with third parties (including our partner tree service
          providers) for their own direct marketing purposes during the prior calendar year. This includes
          the categories of personal information shared and the names and addresses of those third parties.
        </p>
        <p className="text-[var(--muted)] leading-7">
          To submit a Shine the Light request, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>{" "}
          with the subject line <strong>&ldquo;Shine the Light Request&rdquo;</strong> and include your
          current California mailing address and a statement that you are a California resident. We will
          respond within 30 days.
        </p>

        <h3 className="text-base font-semibold">How to Submit a Request</h3>
        <p className="text-[var(--muted)] leading-7">
          To exercise any of the rights above, please contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>.
          We will verify your identity before processing your request and respond within 45 days as required
          by law. We may extend this period by an additional 45 days when necessary, with prior notice.
        </p>
        <p className="text-[var(--muted)] leading-7">
          You may designate an authorized agent to submit a request on your behalf. We will require written
          authorization or a power of attorney and may verify your identity directly.
        </p>
      </section>

      {/* Section 7 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">7. Communications &amp; How to Opt Out</h2>
        <p className="text-[var(--muted)] leading-7">
          When you submit an estimate request, you consent to being contacted by {BUSINESS_NAME} and/or
          matched local tree service providers via the phone number and/or email address you provide, for
          the purpose of following up on your service inquiry, scheduling an on-site assessment, or
          providing a quote. We and our partner providers may contact you by phone, email, or — if you
          opt in separately — text (SMS) message.
        </p>
        <p className="text-[var(--muted)] leading-7 font-medium">
          Consent to be contacted is not required to receive a free estimate or to use our services.
        </p>
        <h3 className="text-base font-semibold">Opting Out</h3>
        <p className="text-[var(--muted)] leading-7">
          You may withdraw your consent to be contacted at any time:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li><strong>Email:</strong> Reply &ldquo;UNSUBSCRIBE&rdquo; or &ldquo;STOP&rdquo; to any email we send, or contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>.</li>
          <li><strong>SMS/Text:</strong> Reply <strong>STOP</strong> to any text message. Standard message and data rates may apply.</li>
          <li><strong>Phone:</strong> Tell our team member you do not wish to receive further calls.</li>
        </ul>
        <p className="text-[var(--muted)] leading-7">
          We will honor opt-out requests within 10 business days. After opting out, you may still receive a
          single, non-marketing confirmation message.
        </p>
        <h3 className="text-base font-semibold">CAN-SPAM Compliance</h3>
        <p className="text-[var(--muted)] leading-7">
          Any commercial emails we send comply with the federal CAN-SPAM Act. Each email includes a clear
          identification of the sender, a physical mailing address, and an easy, functional opt-out mechanism.
          We do not use deceptive subject lines or misleading headers.
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">8. Children&rsquo;s Privacy</h2>
        <p className="text-[var(--muted)] leading-7">
          Our Site is not directed to children under the age of 13, and we do not knowingly collect personal
          information from children under 13. If we become aware that we have inadvertently collected
          personal information from a child under 13, we will delete it promptly. If you believe we have
          collected such information, please contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>.
        </p>
      </section>

      {/* Section 9 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">9. Security</h2>
        <p className="text-[var(--muted)] leading-7">
          We implement reasonable administrative, technical, and physical security measures to protect
          your personal information from unauthorized access, use, or disclosure. These measures include
          encrypted data transmission (HTTPS), access controls for administrative systems, and secure
          storage of submitted inquiries and photos.
        </p>
        <p className="text-[var(--muted)] leading-7">
          No method of transmission over the internet or electronic storage is 100% secure. While we
          strive to protect your personal information, we cannot guarantee absolute security.
        </p>
      </section>

      {/* Section 10 — Third-Party Links */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">10. Third-Party Links</h2>
        <p className="text-[var(--muted)] leading-7">
          Our Site may contain links to third-party websites. We are not responsible for the privacy
          practices or content of those sites. We encourage you to review the privacy policies of any
          third-party sites you visit.
        </p>
      </section>

      {/* Section 11 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">11. Changes to This Policy</h2>
        <p className="text-[var(--muted)] leading-7">
          We may update this Privacy Policy from time to time to reflect changes in our practices or
          applicable law. When we make material changes, we will update the &ldquo;Effective Date&rdquo; at the top
          of this page. Your continued use of the Site after any changes constitutes your acceptance of
          the updated policy. We encourage you to review this policy periodically.
        </p>
      </section>

      {/* Section 12 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">12. Contact Us</h2>
        <p className="text-[var(--muted)] leading-7">
          If you have questions, concerns, or requests regarding this Privacy Policy or our data practices,
          please contact us:
        </p>
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
        <p className="text-sm text-[var(--muted)] italic">
          This privacy policy was prepared for informational purposes and does not constitute legal advice.
          We recommend consulting a licensed California attorney to ensure full compliance with applicable law.
        </p>
      </section>

    </main>
  );
}
