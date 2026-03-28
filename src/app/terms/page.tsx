'use client';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 28, 2026</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Overview</h2>
            <p>
              StaySteward is a digital concierge platform operated by Stelliform Digital that provides guest experience
              tools for short-term rental properties. These Terms of Service (&quot;Terms&quot;) govern your use of our
              guest portal, website, and related services. By using StaySteward, you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Guest Portal Usage</h2>
            <p>
              The guest portal is provided to facilitate your check-in and stay at a short-term rental property.
              By completing the digital check-in, you agree to provide accurate identity and contact information.
              The information you provide is shared with the property host/manager for the purpose of managing your stay.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Optional Services (Upsells)</h2>
            <p>
              The guest portal may offer optional add-on services such as early check-in, late checkout, airport transfers,
              grocery pre-stocking, and local experiences. These services are optional and are not required for your stay.
              Purchasing these services is entirely voluntary.
            </p>
            <p className="mt-2">
              Prices for optional services are displayed clearly before purchase. All payments are processed securely
              through Stripe. Refund policies for individual services are determined by the property host.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Marketing Communications</h2>
            <p>
              If you opt in to receive marketing communications during check-in, you may receive emails from the
              property host about special offers, local recommendations, and direct booking opportunities.
              You can unsubscribe at any time by clicking the unsubscribe link included in every marketing email.
              Unsubscribe requests are processed within 10 business days, as required by CAN-SPAM.
            </p>
            <p className="mt-2">
              Opting out of marketing communications does not affect your ability to receive essential stay-related
              communications such as check-in confirmations, safety information, or order receipts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Host Terms</h2>
            <p>
              If you are a property host using StaySteward to manage guest check-ins and sell upsell services,
              you are responsible for: the accuracy of your property information, the legality of the services
              you offer through the upsell storefront, compliance with your booking platform&apos;s terms of service
              (Airbnb, VRBO, Booking.com, etc.), and applicable local laws regarding short-term rentals,
              tourist registration, and data collection.
            </p>
            <p className="mt-2">
              StaySteward provides tools and compliance guidance, but does not guarantee compliance with any specific
              platform&apos;s terms of service. Hosts are responsible for how they use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Payment Terms</h2>
            <p>
              StaySteward charges hosts a monthly subscription fee and a platform transaction fee on upsell purchases.
              All fees are outlined on our pricing page. Guest payments for upsell services are processed through
              Stripe Connect, with the host receiving the service revenue minus the platform fee.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>
              StaySteward is a technology platform that connects guests with property services. We are not responsible
              for the quality, safety, or legality of services offered by property hosts or third-party service providers.
              We are not a party to the rental agreement between the guest and host.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Privacy</h2>
            <p>
              Your use of StaySteward is also governed by our <a href="/privacy" className="text-amber-400 underline">Privacy Policy</a>,
              which describes how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <p className="mt-2">
              Stelliform Digital<br />
              legal@staysteward.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
