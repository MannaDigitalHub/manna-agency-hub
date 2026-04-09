import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">Manna Digital Hub</h1>
            <p className="text-gray-400 text-xs mt-0.5">Privacy Policy</p>
          </div>
          <Link href="/client" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            Client Portal
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Privacy Policy</h2>
          <p className="text-gray-400">
            Effective date: April 2026 &nbsp;&middot;&nbsp; Version 1.0
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">1. Who We Are</h3>
          <p className="text-gray-300">
            This Privacy Policy applies to <strong className="text-white">K2026183802 (SOUTH AFRICA) (PTY) LTD</strong>,
            trading as <strong className="text-white">Manna Digital Hub</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;). We are the Responsible Party and Information Officer as defined under the Protection of
            Personal Information Act 4 of 2013 (&ldquo;POPIA&rdquo;).
          </p>
          <p className="text-gray-300">
            <strong className="text-white">Contact:</strong>{" "}
            <a href="mailto:info@mannadigitalhub.co.za" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              info@mannadigitalhub.co.za
            </a>
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">2. Services We Provide</h3>
          <p className="text-gray-300">
            Manna Digital Hub provides AI automation, WhatsApp bot development, customer relationship
            management (CRM) systems, and invoicing services to business clients.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">3. Personal Information We Collect</h3>
          <p className="text-gray-300">We collect and process the following categories of personal information:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li><strong className="text-white">Identity data:</strong> full name, contact name, business name</li>
            <li><strong className="text-white">Contact data:</strong> email address, phone number</li>
            <li><strong className="text-white">Business information:</strong> company details, registration information</li>
            <li><strong className="text-white">Payment data:</strong> billing details and transaction records (processed by our payment provider)</li>
            <li><strong className="text-white">Usage data:</strong> portal access logs, interaction history with bots and automated systems</li>
            <li><strong className="text-white">Communication data:</strong> messages sent via WhatsApp bots and email correspondence</li>
          </ul>
          <p className="text-gray-300">
            We do not collect sensitive personal information (as defined in POPIA Section 26) unless explicitly
            required and with your specific consent.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">4. Purpose of Processing</h3>
          <p className="text-gray-300">We process your personal information for the following lawful purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>Providing and managing the services you have contracted with us</li>
            <li>Billing, invoicing, and payment processing</li>
            <li>Communicating with you about your account, projects, and service updates</li>
            <li>Operating and improving our AI automation and WhatsApp bot services</li>
            <li>Complying with legal and regulatory obligations</li>
            <li>Handling queries, support requests, and complaints</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">5. Legal Basis for Processing</h3>
          <p className="text-gray-300">
            We process your personal information on the following lawful grounds under POPIA:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li><strong className="text-white">Contract performance:</strong> processing is necessary to deliver the services you have engaged us for</li>
            <li><strong className="text-white">Legal obligation:</strong> to comply with South African law, including tax and company law</li>
            <li><strong className="text-white">Legitimate interests:</strong> to operate, maintain, and improve our business systems</li>
            <li><strong className="text-white">Consent:</strong> where we have obtained your specific, informed consent (e.g., marketing communications)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">6. Third Parties We Share Data With</h3>
          <p className="text-gray-300">
            We share personal information only where necessary, with the following categories of third parties:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left text-gray-300 px-3 py-2 font-medium">Third Party</th>
                  <th className="text-left text-gray-300 px-3 py-2 font-medium">Purpose</th>
                  <th className="text-left text-gray-300 px-3 py-2 font-medium">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr>
                  <td className="px-3 py-2 text-white">Anthropic</td>
                  <td className="px-3 py-2 text-gray-300">AI processing for automation and bot services</td>
                  <td className="px-3 py-2 text-gray-300">United States</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-white">PayFast</td>
                  <td className="px-3 py-2 text-gray-300">Payment processing</td>
                  <td className="px-3 py-2 text-gray-300">South Africa</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-white">Meta (WhatsApp / Facebook)</td>
                  <td className="px-3 py-2 text-gray-300">WhatsApp Business messaging platform</td>
                  <td className="px-3 py-2 text-gray-300">United States</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-300">
            We do not sell your personal information to any third party.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">7. Cross-Border Data Transfers</h3>
          <p className="text-gray-300">
            Your data is stored on servers located in the <strong className="text-white">United Kingdom</strong>.
            The UK has been assessed as providing adequate protection for personal information under POPIA
            Section 72, which permits transfers to countries that provide an adequate level of protection. Where
            transfers are made to third parties in the United States (e.g., Anthropic, Meta), we ensure
            appropriate safeguards are in place in accordance with POPIA.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">8. Data Retention</h3>
          <p className="text-gray-300">
            We retain your personal information for as long as you are an active client and for a period of{" "}
            <strong className="text-white">5 years after the end of your contract</strong> with us, unless a longer
            retention period is required or permitted by law. After this period, your data is securely deleted or
            anonymised.
          </p>
          <p className="text-gray-300">
            Payment records may be retained for longer periods to comply with South African tax legislation
            (Income Tax Act and VAT Act).
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">9. Your Rights Under POPIA</h3>
          <p className="text-gray-300">
            As a data subject, you have the following rights under POPIA Section 5:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li><strong className="text-white">Right of access:</strong> request a copy of the personal information we hold about you</li>
            <li><strong className="text-white">Right to correction:</strong> request that inaccurate, incomplete, or outdated information be corrected</li>
            <li><strong className="text-white">Right to deletion:</strong> request the deletion of your personal information (subject to legal limitations)</li>
            <li><strong className="text-white">Right to object:</strong> object to the processing of your personal information</li>
            <li><strong className="text-white">Right to complain:</strong> lodge a complaint with the Information Regulator of South Africa</li>
          </ul>
          <p className="text-gray-300">
            To exercise any of these rights, use the &ldquo;Download My Data&rdquo; or &ldquo;Request Account Deletion&rdquo;
            options in your client portal, or contact us at{" "}
            <a href="mailto:info@mannadigitalhub.co.za" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              info@mannadigitalhub.co.za
            </a>. We will respond within <strong className="text-white">30 days</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">10. Information Regulator</h3>
          <p className="text-gray-300">
            If you believe your rights have not been adequately addressed, you may contact the Information
            Regulator of South Africa:
          </p>
          <ul className="list-none pl-0 space-y-1 text-gray-300">
            <li><strong className="text-white">Website:</strong>{" "}
              <a href="https://www.justice.gov.za/inforeg/" className="text-emerald-400 hover:text-emerald-300 transition-colors" target="_blank" rel="noopener noreferrer">
                www.justice.gov.za/inforeg
              </a>
            </li>
            <li><strong className="text-white">Email:</strong>{" "}
              <a href="mailto:inforeg@justice.gov.za" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                inforeg@justice.gov.za
              </a>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">11. Security</h3>
          <p className="text-gray-300">
            We implement appropriate technical and organisational measures to protect your personal information
            against unauthorised access, alteration, disclosure, or destruction. These include encrypted
            transmission (TLS), password hashing, access controls, and regular security reviews.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">12. Cookies and Tracking</h3>
          <p className="text-gray-300">
            Our client portal uses a session cookie (<code className="bg-gray-800 text-emerald-300 px-1 rounded text-xs">manna_client_session</code>) solely
            to maintain your authenticated session. We do not use tracking cookies or third-party analytics on
            the client portal.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">13. Changes to This Policy</h3>
          <p className="text-gray-300">
            We may update this Privacy Policy from time to time. When we do, we will update the version number
            and effective date at the top of this page, and notify active clients by email of any material changes.
            Continued use of our services after notification constitutes acceptance of the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-white">14. Contact Us</h3>
          <p className="text-gray-300">
            For any privacy-related queries, requests, or concerns, please contact our Information Officer:
          </p>
          <address className="not-italic text-gray-300 space-y-1">
            <p><strong className="text-white">Manna Digital Hub</strong></p>
            <p>K2026183802 (South Africa) (Pty) Ltd</p>
            <p>
              <a href="mailto:info@mannadigitalhub.co.za" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                info@mannadigitalhub.co.za
              </a>
            </p>
          </address>
        </section>

        <div className="border-t border-gray-800 pt-6 text-gray-500 text-xs">
          <p>Version 1.0 &nbsp;&middot;&nbsp; Effective April 2026 &nbsp;&middot;&nbsp; K2026183802 (South Africa) (Pty) Ltd T/A Manna Digital Hub</p>
        </div>
      </main>
    </div>
  );
}
