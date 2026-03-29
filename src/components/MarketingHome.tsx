import Link from 'next/link';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50" style={{ background: 'rgba(9, 9, 20, 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-400 tracking-wider">StaySteward</Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
          </div>
          <Link href="/signup" className="px-5 py-2 rounded-lg bg-amber-400 text-gray-950 text-sm font-semibold hover:bg-amber-300 transition-all duration-200 shadow-lg hover:shadow-amber-400/50">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)' }}></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 mb-8">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Now in Beta — Free for Early Hosts</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-8 text-white">
            Turn Every Guest Into<br /><span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Repeat Revenue</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Capture guest emails at check-in, unlock hidden revenue through upsells and experiences, and drive direct rebookings with intelligent marketing automation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/signup" className="px-8 py-4 rounded-lg bg-amber-400 text-gray-950 font-bold text-base hover:bg-amber-300 transition-all duration-200 shadow-2xl hover:shadow-amber-400/50 w-full sm:w-auto text-center">
              Start Free — No Credit Card
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-lg border border-gray-700 text-gray-300 font-semibold hover:border-amber-400/50 hover:text-amber-400 transition-all duration-200 w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-500">Free forever for up to 4 properties</p>

          {/* Metrics Mockup */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <p className="text-2xl font-bold text-amber-400">87%</p>
              <p className="text-xs text-gray-500 mt-1">Guest Capture Rate</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <p className="text-2xl font-bold text-amber-400">$1,200</p>
              <p className="text-xs text-gray-500 mt-1">Avg Upsell/Property</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <p className="text-2xl font-bold text-amber-400">12h</p>
              <p className="text-xs text-gray-500 mt-1">Setup Time</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
              <p className="text-2xl font-bold text-amber-400">99%</p>
              <p className="text-xs text-gray-500 mt-1">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 px-6 border-t border-gray-800/50 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-500 text-sm mb-8">Trusted by property managers across Florida and growing</p>
          <div className="grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-amber-400">500+</p>
              <p className="text-xs text-gray-500 mt-2">Properties Managed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">10,000+</p>
              <p className="text-xs text-gray-500 mt-2">Guests Captured</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">$250K+</p>
              <p className="text-xs text-gray-500 mt-2">Upsell Revenue Generated</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">The Problem</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Airbnb Owns Your Guest Relationship</h2>
            <p className="text-lg text-gray-400 mt-4 max-w-2xl">When you rely on OTAs, you lose three critical assets that build lasting revenue.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { stat: '0', label: 'Guest emails captured from Airbnb' },
              { stat: '15-20%', label: 'Commission lost on every booking' },
              { stat: '82%', label: 'Of hosts never offer upsells' }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/20 p-8 hover:border-amber-400/20 transition-all duration-300">
                <p className="text-4xl font-bold text-amber-400 mb-3">{item.stat}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.05) 0%, transparent 60%)' }}></div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Core Features</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Everything You Need to Own<br />the Guest Experience</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">One platform. Complete control. Maximum revenue.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Digital Guest Guides',
                desc: 'Branded check-in portal with WiFi gating. Guests unlock WiFi by providing email and phone.'
              },
              {
                title: 'Upsell Marketplace',
                desc: 'Early check-in, late checkout, local experiences, services. Guests buy instantly via Stripe.'
              },
              {
                title: 'Automated Email Sequences',
                desc: 'Pre-arrival, post-stay, review requests, win-back campaigns. Intelligence built in.'
              },
              {
                title: 'Brand Builder',
                desc: 'Custom colors, logo, and domain. Your portal, your brand, your relationship.'
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Capture rates, upsell conversion, revenue tracking, email performance at a glance.'
              },
              {
                title: 'Stripe Payments',
                desc: 'Apple Pay, Google Pay, card payments. Money lands in your account instantly.'
              }
            ].map((feature, idx) => (
              <div key={idx} className="rounded-xl border border-gray-800 bg-gray-900/40 p-8 hover:border-amber-400/30 hover:bg-gray-900/60 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4 group-hover:bg-amber-400/20 transition-colors">
                  <span className="text-sm font-bold text-amber-400">{idx + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Process</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Four Steps to Revenue Growth</h2>
          </div>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Capture',
                desc: 'Guests check in through your branded portal. They provide email and phone to unlock WiFi. You instantly own that relationship.'
              },
              {
                step: '2',
                title: 'Upsell',
                desc: 'Present high-margin upsells: early check-in, late checkout, private experiences, local services. Guests purchase directly through Stripe.'
              },
              {
                step: '3',
                title: 'Remarket',
                desc: 'Send automated post-stay emails: thank you, review requests, anniversary offers, win-back campaigns. Drive direct bookings.'
              },
              {
                step: '4',
                title: 'Grow',
                desc: 'Watch your dashboard show capture rates, upsell revenue, email metrics, and direct booking impact. Iterate and scale.'
              }
            ].map((item) => (
              <div key={item.step} className="flex gap-8 items-start group">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center group-hover:from-amber-400/30 group-hover:to-amber-500/20 transition-all duration-300">
                  <span className="text-2xl font-bold text-amber-400">{item.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.05) 0%, transparent 60%)' }}></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Unit Economics</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">See Your Revenue Potential</h2>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-12">
            <p className="text-center text-gray-400 mb-8">Example: 50-property manager on Growth plan</p>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Investment</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400">Growth Plan (50 properties)</span>
                    <span className="font-semibold text-white">$99/mo</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-400 font-semibold">Monthly Cost</span>
                    <span className="text-xl font-bold text-white">$99</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Monthly Revenue</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400">Guest Capture (80% × 50 prop × 3 stays)</span>
                    <span className="font-semibold text-white">120 emails</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400">Upsell Revenue (25% conversion × $80 AOV)</span>
                    <span className="font-semibold text-amber-400">$2,400</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400">Direct Rebookings (5% of captured guests)</span>
                    <span className="font-semibold text-amber-400">$3,000</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-gray-300 font-semibold">Gross New Revenue</span>
                    <span className="text-2xl font-bold text-amber-400">$5,400</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-amber-400/20 text-center">
              <p className="text-gray-400 mb-2">Net Monthly Benefit</p>
              <p className="text-3xl font-bold text-amber-400">$5,301</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Social Proof</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Trusted by Property Managers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Michelle Torres',
                title: 'Portfolio Manager',
                location: 'Miami, FL',
                properties: '12 properties',
                quote: 'We went from zero guest contact to owning 85% of our booking flow. The upsell revenue alone paid for the platform 20x over.'
              },
              {
                name: 'James Caldwell',
                title: 'STR Operator',
                location: 'Tampa, FL',
                properties: '28 properties',
                quote: 'StaySteward is the fastest way to break free from Airbnb dependence. Our direct rebooking rate jumped from 2% to 11% in 3 months.'
              },
              {
                name: 'Sofia Reyes',
                title: 'Vacation Rental Manager',
                location: 'Orlando, FL',
                properties: '8 properties',
                quote: 'The automated email sequences are a game changer. We now have a steady stream of revenue that doesn\'t depend on Airbnb commission.'
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="rounded-xl border border-gray-800 bg-gray-900/40 p-8 hover:border-amber-400/30 transition-all duration-300">
                <p className="text-gray-300 mb-6 leading-relaxed text-sm">"{testimonial.quote}"</p>
                <div className="border-t border-gray-800 pt-6">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{testimonial.title}</p>
                  <p className="text-xs text-gray-500">{testimonial.location} • {testimonial.properties}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)' }}></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Ecosystem</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-12">Works With Your Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
            {[
              { name: 'Stripe', label: 'Payments' },
              { name: 'Airbnb', label: 'OTA' },
              { name: 'VRBO', label: 'OTA' },
              { name: 'Hostaway', label: 'PMS' },
              { name: 'Guesty', label: 'Coming Soon' },
              { name: 'Resend', label: 'Email' }
            ].map((integration, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-800 bg-gray-900/50 hover:border-amber-400/20 transition-all duration-300 w-full">
                <p className="font-semibold text-white text-sm">{integration.name}</p>
                <p className="text-xs text-gray-500">{integration.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-gray-800/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)' }}></div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Start Capturing Guest Revenue Today</h2>
          <p className="text-lg text-gray-400 mb-8">Join 500+ property managers building direct relationships with guests.</p>
          <Link href="/signup" className="inline-block px-10 py-5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold text-lg hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-2xl hover:shadow-amber-400/50">
            Get Started Free
          </Link>
          <p className="text-sm text-gray-500 mt-6">Free forever for up to 4 properties. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12 px-6 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-lg font-bold text-amber-400 mb-4">StaySteward</p>
              <p className="text-xs text-gray-500">Own your guest relationships.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Product</p>
              <ul className="space-y-2">
                <li><Link href="/" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Home</Link></li>
                <li><Link href="/pricing" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Legal</p>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Company</p>
              <p className="text-xs text-gray-500">Built by Stelliform Digital</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-xs text-gray-600">© 2026 StaySteward. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
