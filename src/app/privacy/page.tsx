'use client';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 28, 2026</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Who We Are</h2>
            <p>
              StaySteward (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a digital concierge platform operated by Stelliform Digital.
              We provide guest experience tools for short-term rental hosts and property managers.
              This Privacy Policy explains how we collect, use, and protect your personal information
              when you use our guest portal, website, or related services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">When you complete a digital check-in through a StaySteward guest portal, we collect:</p>
            <p>
              <strong className="text-white">Identity Information:</strong> First name, last name, and optionally a government ID type for verification purposes required by local regulations.
            </p>
            <p className="mt-2">
              <strong className="text-white">Contact Information:</strong> Email address, phone number, and emergency contact phone number for safety and property management purposes.
            </p>
            <p className="mt-2">
              <strong className="text-white">Consent Records:</strong> Whether you opted into marketing communications, the timestamp of your consent, and your IP address at the time of consent (for audit purposes).
            </p>
            <p className="mt-2">
              <strong className="text-white">Transaction Data:</strong> If you purchase optional services (upsells) through the portal, your payment is processed by Stripe. We do not store your credit card number. We receive a transaction reference and order details.
            </p>
            <p className="mt-2">
              <strong className="text-white">Technical Data:</strong> IP address, browser type, and device information collected automatically when you access the portal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>
            <p className="mt-2">
              <strong className="text-white">Property Management:</strong> To facilitate your check-in, provide property access details (WiFi, door codes, house rules),
              and manage your stay on behalf of the property host. This is the primary purpose and does not require marketing consent.
            </p>
            <p className="mt-2">
              <strong className="text-white">Safety & Compliance:</strong> To verify guest identity where required by local law, collect emergency contact information,
              and maintain rental agreement records.
            </p>
            <p className="mt-2">
              <strong className="text-white">Optional Services:</strong> To process purchases of add-on services you choose to buy through the portal.
            </p>
            <p className="mt-2">
              <strong className="text-white">Marketing (with consent only):</strong> If you explicitly opt in, to send you promotional emails about
              special offers, local recommendations, and direct booking opportunities from the property host. You can unsubscribe at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Legal Basis for Processing (EU/EEA/Greece)</h2>
            <p>If you are located in the European Union, European Economic Area, or Greece, we process your data under the following legal bases under GDPR:</p>
            <p className="mt-2"><strong className="text-white">Contractual Necessity:</strong> Processing your identity and contact information to facilitate your stay (check-in, property access, safety) is necessary to perform the accommodation contract.</p>
            <p className="mt-2"><strong className="text-white">Legal Obligation:</strong> Where local law requires guest identity verification or tourist registration.</p>
            <p className="mt-2"><strong className="text-white">Consent:</strong> Marketing communications are only sent with your explicit, affirmative consent. The consent checkbox is not pre-checked. You may withdraw consent at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Data Sharing</h2>
            <p>We share your personal information only with:</p>
            <p className="mt-2"><strong className="text-white">The Property Host:</strong> Your name, email, phone, and check-in data are shared with the property host/manager who operates the property you are staying at. They are the data controller for your stay.</p>
            <p className="mt-2"><strong className="text-white">Stripe:</strong> Payment processing for upsell purchases. Stripe is PCI DSS Level 1 certified. We never store your card details.</p>
            <p className="mt-2"><strong className="text-white">Resend:</strong> Email delivery service for transactional and marketing emails (when configured).</p>
            <p className="mt-2">We do not sell your personal information. We do not share your data with advertising networks or social media platforms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              Your personal information is retained for as long as necessary to fulfill the purposes described above.
              Guest check-in data is retained for a maximum of 24 months after your stay, unless a longer retention period is required by law.
              Marketing consent records are retained for as long as the consent is active, plus 12 months after withdrawal for audit purposes.
              You may request deletion of your data at any time (see Section 8).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you have the following rights:</p>
            <p className="mt-2"><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.</p>
            <p className="mt-2"><strong className="text-white">Correction:</strong> Request correction of inaccurate personal data.</p>
            <p className="mt-2"><strong className="text-white">Deletion:</strong> Request deletion of your personal data (&quot;right to be forgotten&quot;).</p>
            <p className="mt-2"><strong className="text-white">Portability:</strong> Request your data in a machine-readable format.</p>
            <p className="mt-2"><strong className="text-white">Withdraw Consent:</strong> Withdraw marketing consent at any time by clicking the unsubscribe link in any email or contacting us.</p>
            <p className="mt-2"><strong className="text-white">Object:</strong> Object to processing based on legitimate interests.</p>
            <p className="mt-2">To exercise these rights, contact us at privacy@staysteward.com.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Data Deletion Requests</h2>
            <p>
              To request deletion of your personal data, email privacy@staysteward.com with the subject &quot;Data Deletion Request&quot;
              and include the email address you used during check-in. We will process your request within 30 days.
              Note that we may retain certain information if required by law (e.g., rental agreement records).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission (TLS),
              row-level security policies to isolate tenant data, and soft-delete mechanisms to prevent accidental data loss.
              Payment data is handled entirely by Stripe and never touches our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <p className="mt-2">
              Stelliform Digital<br />
              privacy@staysteward.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
