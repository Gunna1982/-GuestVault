import Link from 'next/link';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50" style={{ background: 'rgba(9, 9, 20, 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-400 tracking-wider">StaySteward</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm text-gray-400 hover:text-white transition-colors">Why StaySteward</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
          </div>
          <Link href="/signup" className="px-5 py-2 rounded-lg bg-amber-400 text-gray-950 text-sm font-semibold hover:bg-amber-300 transition-all duration-200 shadow-lg hover:shadow-amber-400/25">Get Started Free</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-40 pb-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full border border-amber-400/30 bg-amber-400/10 mb-8">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">The Guest Operating System for STR Hosts</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-8 text-white">
            Own the Guest Relationship.<br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">Monetize Every Stay.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Airbnb hides your guests behind their platform. StaySteward gives you back control — capture real guest data through compliant digital check-in, sell upsells through your own branded storefront, and build direct booking relationships that eliminate OTA commissions forever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/signup" className="px-8 py-4 rounded-lg bg-amber-400 text-gray-950 font-bold text-base hover:bg-amber-300 transition-all duration-200 shadow-2xl hover:shadow-amber-400/30 w-full sm:w-auto text-center">
              Start Free — No Credit Card
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-lg border border-gray-700 text-gray-300 font-semibold hover:border-amber-400/50 hover:text-amber-400 transition-all duration-200 w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-600">Set up in under 10 minutes. No app download required for guests.</p>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section id="problem" className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">The Problem</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">You&apos;re Leaving Money on the Table</h2>
            <p className="text-lg text-gray-400 max-w-3xl">
              Every time a guest books through Airbnb or VRBO, you lose. You lose their contact information. You lose 15-20% in commissions. And you lose the chance to build a direct relationship that brings them back. Most property managers don&apos;t even realize how much revenue they&apos;re giving away.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                stat: '0',
                title: 'Guest Emails from Airbnb',
                desc: 'Airbnb deliberately hides guest email addresses. You manage their stay, clean their property, handle their complaints — but you can\'t even send them a thank-you email afterward.'
              },
              {
                stat: '15-20%',
                title: 'Lost to OTA Commissions',
                desc: 'Every booking through Airbnb or VRBO costs you 15-20% in platform fees. Without guest data, you can\'t drive direct rebookings — so you keep paying the commission, forever.'
              },
              {
                stat: '82%',
                title: 'Of Hosts Never Sell Upsells',
                desc: 'Early check-in, late checkout, airport transfers, grocery stocking, local experiences — guests will pay $25-$100+ for these. Most hosts never offer them because they have no system to do it.'
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-7 hover:border-amber-400/20 transition-all duration-300">
                <p className="text-4xl font-bold text-amber-400 mb-2">{item.stat}</p>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* The Compliance Problem */}
          <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center text-red-400 font-bold text-lg">!</div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">The 2025 Compliance Problem</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Airbnb&apos;s 2025 Off-Platform Policy changed the rules. Legacy digital guidebooks that were introduced as &quot;extra reading&quot; are being flagged and penalized. The only compliant way to capture guest data now is through a <span className="text-amber-400 font-medium">mandatory digital check-in system</span> — one that serves an operational purpose (ID verification, rental agreement, access codes) while also building your guest database. That&apos;s exactly what StaySteward is built to do.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE SOLUTION ===== */}
      <section className="py-24 px-6 border-t border-gray-800/50 relative">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)' }} />
        <div className="relative max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">The Solution</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">A Complete Guest Operating System</h2>
            <p className="text-lg text-gray-400 max-w-3xl">
              StaySteward isn&apos;t another digital guidebook. It&apos;s a full guest lifecycle platform — from the moment they book to the day they rebook directly. We built it because property managers with 10-100+ units deserve enterprise-grade tools without the enterprise complexity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                title: 'We Capture the Data Airbnb Hides',
                desc: 'Through mandatory digital check-in, guests provide their real email, phone, and ID — all in exchange for WiFi access, door codes, and property details. You own this data. Not Airbnb.',
              },
              {
                title: 'We Monetize Every Guest Touchpoint',
                desc: 'Our one-click upsell storefront lets guests buy early check-in, late checkout, grocery stocking, airport transfers, and local experiences. Guests pay via Stripe. Money hits your account instantly.',
              },
              {
                title: 'We Build the Relationship for You',
                desc: 'Automated post-stay email sequences handle thank-yous, review requests, win-back offers, and anniversary discounts. Every sequence is designed to drive a direct rebooking — eliminating OTA commissions.',
              },
              {
                title: 'We Keep You Compliant',
                desc: 'Digital check-in is introduced as a mandatory operational tool — not optional reading. ID verification, rental agreements, and guest registration all serve a legal purpose, keeping you within Airbnb\'s 2025 Off-Platform Policy.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-800 bg-gray-900/30 p-7 hover:border-amber-400/20 transition-all duration-300">
                <h3 className="text-amber-400 font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">The Guest Lifecycle</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Four Stages. One Platform.</h2>
            <p className="text-lg text-gray-400 max-w-3xl">
              Every guest interaction is an opportunity. StaySteward turns the entire stay lifecycle into a revenue engine — automatically.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Capture',
                subtitle: 'Mandatory Digital Check-In',
                desc: 'Within 1 hour of booking confirmation, guests receive a branded check-in link. To get their door codes, WiFi password, and property guide, they provide their email, phone, and complete ID verification. The interface mirrors a modern airline boarding pass — no app download, works on any phone browser.',
              },
              {
                step: '02',
                title: 'Monetize',
                subtitle: 'One-Click Upsell Storefront',
                desc: 'Once checked in, guests see your personalized experience storefront. Convenience upsells (airport transfers, grocery stocking) are highlighted 3-7 days before arrival. Experience upsells (boat tours, private chef, spa) are highlighted during the stay. Guests buy with one click via Stripe — Apple Pay, Google Pay, cards. You set the price, you keep the revenue.',
              },
              {
                step: '03',
                title: 'Automate',
                subtitle: 'Intelligent Email Sequences',
                desc: 'Pre-arrival guides, check-in reminders, mid-stay experience offers, post-stay thank-yous, review requests, and win-back campaigns — all automated, all branded to your business. Each sequence is timed to maximize engagement and drive the next booking.',
              },
              {
                step: '04',
                title: 'Retain',
                subtitle: 'Direct Booking Flywheel',
                desc: 'You now have verified guest emails, stay history, and spending data — everything Airbnb hides from you. Automated remarketing offers "Book Direct & Save 10%" to past guests, effectively buying back the 15% OTA commission for just a 10% discount. Guests save money, you make more per booking, and Airbnb loses the repeat.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start rounded-xl border border-gray-800 bg-gray-900/20 p-7 hover:border-amber-400/20 transition-all duration-300">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-lg">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {item.title} <span className="text-gray-500 font-normal text-base">— {item.subtitle}</span>
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6 border-t border-gray-800/50 relative">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 70% 50%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)' }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">What You Get</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Built for Property Managers<br />Who Want to Grow</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Not another static guidebook. A revenue platform that works while you sleep.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Branded Guest Portal',
                desc: 'Your logo, your colors, your domain. Guests see your brand — not ours. White-labeled check-in that builds trust and prevents Airbnb from flagging your links.',
              },
              {
                title: 'Upsell Marketplace',
                desc: 'Early check-in ($25-$50), late checkout ($25-$50), airport transfers, grocery stocking, private chef, boat tours — create unlimited services. One-click purchase via Stripe.',
              },
              {
                title: 'Automated Email Sequences',
                desc: 'Pre-arrival welcome, check-in reminder, mid-stay offers, post-stay thank you, review request, win-back campaign, anniversary offer. Set it once, runs forever.',
              },
              {
                title: 'ID Verification & Compliance',
                desc: 'Guest identity verification with photo ID upload. Digital rental agreement signing. Fully compliant with Airbnb\'s 2025 Off-Platform Policy and Florida guest registration requirements.',
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Guest capture rate, upsell conversion, revenue per property, email performance, direct booking attribution. See exactly what\'s working and what to optimize.',
              },
              {
                title: 'Stripe Connect Payments',
                desc: 'Apple Pay, Google Pay, credit cards. Guests pay through your portal, money goes straight to your connected Stripe account. Automatic payouts, detailed reporting.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-800 bg-gray-900/30 p-7 hover:border-amber-400/20 hover:bg-gray-900/50 transition-all duration-300">
                <h3 className="text-white font-semibold text-base mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO THIS IS FOR ===== */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Who This Is For</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">Built for Growth-Stage<br />Property Managers</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                range: '5-20 Units',
                title: 'Scaling Operators',
                desc: 'You\'ve proven the model, now you need systems. StaySteward replaces the patchwork of tools you\'ve outgrown — guest guides, upsells, email marketing, and compliance — with one platform that actually talks to each other.',
              },
              {
                range: '20-50 Units',
                title: 'Growth Operators',
                desc: 'You\'re hitting the "Revenue Plateau" — more properties but not proportionally more profit. StaySteward creates new revenue streams (upsells, direct bookings) without adding headcount or complexity.',
              },
              {
                range: '50-200+ Units',
                title: 'Enterprise Operators',
                desc: 'At scale, every percentage point matters. Reducing OTA commissions by driving direct rebookings, automating guest communication, and capturing upsell revenue across your portfolio adds up to hundreds of thousands per year.',
              },
            ].map((segment) => (
              <div key={segment.range} className="rounded-xl border border-gray-800 bg-gray-900/30 p-7 text-center hover:border-amber-400/20 transition-all duration-300">
                <p className="text-3xl font-bold text-amber-400 mb-2">{segment.range}</p>
                <h3 className="text-white font-semibold mb-3">{segment.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{segment.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THE MATH ===== */}
      <section className="py-24 px-6 border-t border-gray-800/50 relative">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.06) 0%, transparent 50%)' }} />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">The ROI</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Do the Math</h2>
            <p className="text-lg text-gray-400">Here&apos;s what a 30-property manager can realistically expect.</p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-8 sm:p-10">
            <div className="grid sm:grid-cols-2 gap-10">
              <div>
                <h3 className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-6">New Revenue You&apos;re Missing</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b border-gray-800/50 pb-3">
                    <span className="text-gray-400">Upsell revenue (8% conversion, $45 avg)</span>
                    <span className="text-green-400 font-semibold">+$3,240/mo</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-800/50 pb-3">
                    <span className="text-gray-400">Direct rebookings (save 15% commission)</span>
                    <span className="text-green-400 font-semibold">+$2,700/mo</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-800/50 pb-3">
                    <span className="text-gray-400">Reduced guest support time</span>
                    <span className="text-green-400 font-semibold">+10 hrs/mo</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2">
                    <span className="text-white">Total new monthly revenue</span>
                    <span className="text-green-400">+$5,940/mo</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-6">Assumptions</h3>
                <div className="space-y-3 text-sm text-gray-500">
                  <p>30 properties, avg 20 nights/month booked</p>
                  <p>600 guest-nights per month</p>
                  <p>87% email capture rate via check-in portal</p>
                  <p>8% upsell conversion, $45 avg order value</p>
                  <p>15% of past guests rebook direct within 12 months</p>
                  <p>$600 avg booking value, 15% OTA commission saved</p>
                </div>
                <div className="mt-6 rounded-lg bg-amber-400/10 border border-amber-400/20 p-4">
                  <p className="text-amber-400 font-semibold text-sm">Bottom line: ~$71K in new annual revenue from a portfolio that was already fully booked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FLORIDA ADVANTAGE ===== */}
      <section className="py-24 px-6 border-t border-gray-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-8 sm:p-10">
            <div className="sm:flex items-start gap-10">
              <div className="flex-1 mb-8 sm:mb-0">
                <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">The Florida Advantage</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for the Largest STR Market in America</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Florida represents 26% of national short-term rental activity — over $30 billion annually. With DBPR licensing requirements and some of the highest guest volumes in the country, Florida property managers need a platform that understands their market, their compliance requirements, and their guests.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  StaySteward was built in Florida, for Florida operators. We understand DBPR licensing, local ordinances, and the unique dynamics of markets like Destin/30A, Tampa Bay, Miami Beach, Orlando, and the Keys.
                </p>
              </div>
              <div className="flex-shrink-0 sm:w-64">
                <div className="space-y-4">
                  {[
                    { stat: '$30B+', label: 'Florida STR market annually' },
                    { stat: '26%', label: 'Of national STR activity' },
                    { stat: '700+', label: 'Licensed operators in our database' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-amber-400/10 bg-gray-900/50 p-4">
                      <p className="text-2xl font-bold text-amber-400">{item.stat}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-4">Integrations</p>
          <h2 className="text-3xl font-bold text-white mb-10">Works With Your Existing Stack</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {[
              { name: 'Stripe', status: 'Live' },
              { name: 'Airbnb', status: 'Live' },
              { name: 'VRBO', status: 'Live' },
              { name: 'Hostaway', status: 'Coming Soon' },
              { name: 'Guesty', status: 'Coming Soon' },
              { name: 'Resend', status: 'Live' },
            ].map((integration) => (
              <div key={integration.name} className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 hover:border-gray-700 transition-colors">
                <p className="text-white font-medium text-sm">{integration.name}</p>
                <p className={`text-xs mt-1 ${integration.status === 'Live' ? 'text-green-400' : 'text-gray-600'}`}>{integration.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-28 px-6 border-t border-gray-800/50 relative">
        <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Stop Giving Away Your Guest Revenue</h2>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
            Every day without a guest capture system is another day of lost emails, missed upsells, and repeat guests booking through Airbnb instead of directly with you.
          </p>
          <Link href="/signup" className="inline-block px-10 py-4 rounded-lg bg-amber-400 text-gray-950 font-bold text-lg hover:bg-amber-300 transition-all duration-200 shadow-2xl hover:shadow-amber-400/30">
            Get Started Free
          </Link>
          <p className="text-sm text-gray-600 mt-4">No credit card required. Set up in under 10 minutes.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-800/50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="sm:flex items-start justify-between">
            <div className="mb-8 sm:mb-0">
              <p className="text-amber-400 font-bold text-lg mb-2">StaySteward</p>
              <p className="text-xs text-gray-600">The Guest Operating System for Short-Term Rentals</p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="space-y-2">
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Product</p>
                <a href="#features" className="block text-gray-600 hover:text-gray-400 transition-colors">Features</a>
                <a href="#how-it-works" className="block text-gray-600 hover:text-gray-400 transition-colors">How It Works</a>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Account</p>
                <Link href="/login" className="block text-gray-600 hover:text-gray-400 transition-colors">Login</Link>
                <Link href="/signup" className="block text-gray-600 hover:text-gray-400 transition-colors">Sign Up</Link>
              </div>
              <div className="space-y-2">
                <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">Company</p>
                <span className="block text-gray-600">Privacy</span>
                <span className="block text-gray-600">Terms</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800/30 text-center">
            <p className="text-xs text-gray-700">&copy; 2026 StaySteward. Built by Stelliform Digital.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
