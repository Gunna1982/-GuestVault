import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceNote: 'forever',
    description: 'Perfect for getting started',
    properties: 'Up to 4 properties',
    fee: '10% of upsell revenue',
    features: [
      'Branded check-in portal',
      'WiFi-gated email capture',
      'Up to 3 upsell services',
      'Post-stay thank you email',
      'Basic analytics',
    ],
    cta: 'Start Free',
    ctaHref: '/signup',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$49',
    priceNote: '/month',
    description: 'For growing property managers',
    properties: 'Up to 20 properties',
    fee: '5% of upsell revenue',
    features: [
      'Everything in Starter',
      'Unlimited upsell services',
      'Full email sequence builder',
      'Win-back campaigns',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
    ],
    cta: 'Start 14-Day Trial',
    ctaHref: '/signup',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$149',
    priceNote: '/month',
    description: 'For professional managers',
    properties: 'Up to 100 properties',
    fee: '3% of upsell revenue',
    features: [
      'Everything in Growth',
      'PMS integration (Hostaway)',
      'Custom domain portal',
      'Revenue attribution',
      'Guest lifetime value tracking',
      'API access',
      'Dedicated support',
    ],
    cta: 'Start 14-Day Trial',
    ctaHref: '/signup',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50" style={{ background: 'rgba(9,9,20,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-400 tracking-wide">GuestVault</Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-amber-400 text-gray-950 text-sm font-semibold hover:bg-amber-300 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">Start free. Upgrade when you grow. We only make more when you make more.</p>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? 'border-2 border-amber-400/40 bg-amber-400/[0.03] relative'
                  : 'border border-gray-800 bg-gray-900/30'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-gray-950 text-xs font-bold">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-gray-500 ml-1">{plan.priceNote}</span>
              </div>
              <div className="space-y-2 mb-6 text-sm">
                <p className="text-amber-400 font-medium">{plan.properties}</p>
                <p className="text-gray-500">{plan.fee}</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className={`block text-center py-3 rounded-lg font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-amber-400 text-gray-950 hover:bg-amber-300'
                    : 'border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Unit Economics */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto rounded-2xl border border-gray-800 bg-gray-900/30 p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">The Math: 50 Properties on Growth Plan</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Monthly Investment</p>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Growth plan</span><span className="text-white">$49/mo</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Platform fee (5%)</span><span className="text-white">~$180/mo</span></div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-800 pt-2"><span className="text-gray-300">Total cost</span><span className="text-white">~$229/mo</span></div>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Monthly Revenue</p>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Upsell revenue (8% conversion)</span><span className="text-green-400">$3,600/mo</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">OTA fees saved (direct rebookings)</span><span className="text-green-400">$3,600/yr</span></div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-800 pt-2"><span className="text-gray-300">Net new revenue</span><span className="text-green-400">~$3,370/mo</span></div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">Based on 1,000 bookings/mo, 8% upsell conversion, $45 avg upsell value</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20 border-t border-gray-800/50 pt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Does this violate Airbnb\'s Terms of Service?', a: 'No. Sending check-in information via Airbnb messaging is explicitly allowed. Data capture happens on your own portal, and remarketing occurs post-stay — outside Airbnb\'s platform.' },
              { q: 'Do guests need to download an app?', a: 'No. The check-in portal is a simple web page that works on any phone browser. Guests click a link, fill out a form, and get WiFi access immediately.' },
              { q: 'How do I get paid for upsells?', a: 'Guests pay via Stripe Elements (credit card, Apple Pay, Google Pay). Money goes to your connected Stripe account automatically, minus the platform fee.' },
              { q: 'Can I use this with my PMS?', a: 'Hostaway integration is coming soon. For now, you can manually create reservations or import them. We\'ll add Guesty, Hostfully, and more PMS integrations over time.' },
              { q: 'What happens after the free tier?', a: 'Nothing changes until you decide to upgrade. Free tier includes up to 4 properties, 3 upsell services, and basic email sequences — forever. Upgrade when you need more properties or features.' },
            ].map(faq => (
              <div key={faq.q} className="rounded-xl border border-gray-800 bg-gray-900/30 p-5">
                <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 border-t border-gray-800/50 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Own Your Guest Relationship?</h2>
        <p className="text-gray-400 mb-8">Set up in under 10 minutes. Free forever for small hosts.</p>
        <Link href="/signup" className="inline-block px-10 py-4 rounded-lg bg-amber-400 text-gray-950 font-bold hover:bg-amber-300 transition-colors">
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-6 text-center">
        <p className="text-xs text-gray-700">&copy; 2026 GuestVault. Built by Stelliform Digital.</p>
      </footer>
    </div>
  );
}
