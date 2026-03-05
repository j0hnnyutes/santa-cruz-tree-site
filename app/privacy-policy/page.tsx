import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Santa Cruz Tree Pros",
  description: "Privacy Policy for Santa Cruz Tree Pros — how we collect, use, and protect your personal information under California law.",
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "March 1, 2026";
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
          We do not sell, rent, or trade your personal information. We may share your information only in the
          following limited circumstances:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--muted)]">
          <li>
            <strong>Service Providers:</strong> We use Resend (a transactional email platform) to deliver
            email notifications containing your inquiry details to our team. These providers are contractually
            obligated to protect your information and may not use it for their own purposes.
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
          data for no longer than 24 months. You may request deletion of your data at any time (see Section 7).
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
          <li><strong>Analytics cookies:</strong> Help us understand Site traffic and user behavior in aggregate.</li>
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
          We do not sell or share your personal information for cross-context behavioral advertising.
          You therefore do not need to opt out of any such sale or sharing.
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
        <h2 className="text-xl font-bold">7. Children&rsquo;s Privacy</h2>
        <p className="text-[var(--muted)] leading-7">
          Our Site is not directed to children under the age of 13, and we do not knowingly collect personal
          information from children under 13. If we become aware that we have inadvertently collected
          personal information from a child under 13, we will delete it promptly. If you believe we have
          collected such information, please contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand-accent)] underline underline-offset-2">{CONTACT_EMAIL}</a>.
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">8. Security</h2>
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

      {/* Section 9 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">9. Third-Party Links</h2>
        <p className="text-[var(--muted)] leading-7">
          Our Site may contain links to third-party websites. We are not responsible for the privacy
          practices or content of those sites. We encourage you to review the privacy policies of any
          third-party sites you visit.
        </p>
      </section>

      {/* Section 10 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">10. Changes to This Policy</h2>
        <p className="text-[var(--muted)] leading-7">
          We may update this Privacy Policy from time to time to reflect changes in our practices or
          applicable law. When we make material changes, we will update the &ldquo;Effective Date&rdquo; at the top
          of this page. Your continued use of the Site after any changes constitutes your acceptance of
          the updated policy. We encourage you to review this policy periodically.
        </p>
      </section>

      {/* Section 11 */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">11. Contact Us</h2>
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
