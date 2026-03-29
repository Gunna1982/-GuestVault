import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceNote: 'forever',
    description: 'Perfect for getting started',
    properties: 'Up to 4 properties',
    fee: '10% upsell fee',
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
    price: '$12',
    priceNote: '/property/month (Min $49/mo)',
    description: 'For scaling operators',
    properties: 'Up to 50 properties',
    fee: '5% upsell fee',
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
    price: '$8',
    priceNote: '/property/month (Min $149/mo)',
    description: 'For enterprise operators',
    properties: 'Unlimited properties',
    fee: '3% upsell fee',
    features: [
      'Everything in Growth',
      'PMS integration (Hostaway & more)',
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
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'volume pricing',
    description: 'For high-volume operations',
    properties: 'Custom volume',
    fee: 'Negotiable upsell fee',
    features: [
      'Everything in Pro',
      'Volume-based pricing',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Priority onboarding',
    ],
    cta: 'Contact Us',
    ctaHref: '/contact',
    highlight: false,
  },
];

const comparisonFeatures = [
  { name: 'Branded check-in portal', starter: true, growth: true, pro: true, enterprise: true },
  { name: 'WiFi-gated email capture', starter: true, growth: true, pro: true, enterprise: true },
  { name: 'Upsell services', starter: '3', growth: 'Unlimited', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Email sequence builder', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Win-back campaigns', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Advanced analytics', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'Custom branding', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'PMS integrations', starter: false, growth: false, pro: true, enterprise: true },
  { name: 'Custom domain portal', starter: false, growth: false, pro: true, enterprise: true },
  { name: 'API access', starter: false, growth: false, pro: true, enterprise: true },
  { name: 'Dedicated support', starter: false, growth: true, pro: true, enterprise: true },
  { name: 'SLA guarantee', starter: false, growth: false, pro: false, enterprise: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50" style={{ background: 'rgba(9,9,20,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-400 tracking-wide">StaySteward</Link>
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
      <section className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Pricing Built for Growth</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">Pay only for what you use. Start free with up to 4 properties. Scale to hundreds with predictable per-property pricing. We win when you win.</p>
      </section>

      {/* Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl p-7 flex flex-col transition-all ${
                plan.highlight
                  ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-400/10 to-amber-400/5 ring-1 ring-amber-400/20 relative md:col-span-2 lg:col-span-1 lg:scale-105'
                  : 'border border-gray-800 bg-gray-900/30 hover:border-gray-700'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-gray-950 text-xs font-bold tracking-widest">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className={`text-4xl font-bold ${plan.highlight ? 'text-amber-400' : 'text-white'}`}>
                  {plan.price}
                </span>
                <span className="text-xs text-gray-500 ml-2 block mt-1">{plan.priceNote}</span>
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
                    ? 'bg-amber-400 text-gray-950 hover:bg-amber-300 font-bold'
                    : plan.name === 'Enterprise'
                    ? 'border-2 border-gray-700 text-gray-300 hover:border-amber-400 hover:text-amber-400'
                    : 'border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="px-6 pb-20 border-t border-gray-800/50 pt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Detailed Feature Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="px-6 py-4 text-left text-white font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-semibold">Starter</th>
                  <th className="px-6 py-4 text-center text-amber-400 font-semibold">Growth</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-semibold">Pro</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={feature.name} className={idx % 2 === 0 ? 'bg-gray-900/20' : ''}>
                    <td className="px-6 py-4 text-gray-300">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-gray-400">{feature.starter}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold bg-amber-400/5">
                      {typeof feature.growth === 'boolean' ? (
                        feature.growth ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-amber-400">{feature.growth}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-gray-400">{feature.pro}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? <span className="text-green-400">✓</span> : <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-gray-400">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Unit Economics */}
      <section className="px-6 pb-20 border-t border-gray-800/50 pt-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">The Math: 25-Property Growth Customer</h2>
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/5 to-amber-400/0 p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Monthly Platform Cost</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">25 properties × $12</span>
                    <span className="text-white font-semibold">$300/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Platform fee (5% of upsells)</span>
                    <span className="text-white font-semibold">~$150/mo</span>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-300">Total Monthly Cost</span>
                    <span className="text-amber-400">~$450/mo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Guest Revenue</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">500 bookings/mo at $45 avg</span>
                    <span className="text-white font-semibold">$22,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">8% upsell conversion</span>
                    <span className="text-green-400 font-semibold">$1,800/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">After platform fee (5%)</span>
                    <span className="text-green-400 font-semibold">$1,710/mo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4 bg-green-400/10 rounded-xl p-4 border border-green-400/20">
                <p className="text-xs text-green-400 uppercase tracking-wider font-semibold">Net Monthly Impact</p>
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">+$1,260</p>
                    <p className="text-xs text-gray-500 mt-1">Net new revenue per month</p>
                  </div>
                  <div className="border-t border-green-400/20 pt-3 text-center">
                    <p className="text-sm font-semibold text-white">2.8x ROI</p>
                    <p className="text-xs text-gray-500">Return on platform investment</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-600 mt-6">Assumptions: 20 bookings per property per month, $45 average upsell value, 8% conversion rate</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-20 border-t border-gray-800/50 pt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does per-property pricing work?', a: 'Growth and Pro plans charge per active property on your account. If you have 25 properties, you pay $12 (Growth) or $8 (Pro) for each. Minimum monthly commitments apply ($49 for Growth, $149 for Pro). You only pay for properties you actively use.' },
              { q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate your billing accordingly. No cancellation fees — switch whenever it makes sense for your business.' },
              { q: 'Does this violate Airbnb\'s Terms of Service?', a: 'No. Sending check-in information via Airbnb messaging is explicitly allowed. Data capture happens on your own portal, and remarketing occurs post-stay — outside Airbnb\'s platform.' },
              { q: 'Do guests need to download an app?', a: 'No. The check-in portal is a simple web page that works on any phone browser. Guests click a link, fill out a form, and get WiFi access immediately.' },
              { q: 'How do I get paid for upsells?', a: 'Guests pay via Stripe Elements (credit card, Apple Pay, Google Pay). Money goes to your connected Stripe account automatically, minus the platform fee.' },
              { q: 'Can I use this with my PMS?', a: 'Hostaway integration is available now. Pro and Enterprise customers also get access to integrations with Guesty, Hostfully, and more coming soon. Reach out to our support team to set up your integration.' },
              { q: 'What happens after the free tier?', a: 'Nothing changes until you decide to upgrade. Free tier includes up to 4 properties, 3 upsell services, and basic email sequences — forever. Upgrade when you need more properties or features.' },
            ].map(faq => (
              <div key={faq.q} className="rounded-xl border border-gray-800 bg-gray-900/30 p-6 hover:border-gray-700 transition-colors">
                <h3 className="text-sm font-semibold text-white mb-3">{faq.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
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
        <p className="text-xs text-gray-700">&copy; 2026 StaySteward. Built by Stelliform Digital.</p>
      </footer>
    </div>
  );
}
