import Link from 'next/link';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-sky-100" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-wider" style={{ color: '#0891B2' }}>StaySteward</Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">Why StaySteward</a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">How It Works</a>
            <a href="#features" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">Features</a>
            <Link href="/login" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">Login</Link>
          </div>
          <Link href="/signup" className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl" style={{ background: 'linear-gradient(135deg, #0891B2, #0E7490)' }}>Book an ROI Audit</Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-40 pb-28 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 40%, #FFFBEB 100%)' }}>
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full border border-cyan-200 bg-cyan-50 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#0891B2' }}>The Profit Protection System for Florida Growth Operators</span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-8 text-gray-900">
            Own the Guest Relationship.<br />
            <span style={{ background: 'linear-gradient(135deg, #0891B2, #0369A1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Protect Your Net Operating Income.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            OTAs hide your guests. Commissions erode your NOI. And without guest data, you can&apos;t prove ancillary revenue lift to your homeowners. StaySteward gives you back control — capture real guest data through legally compliant digital check-in, monetize every stay through your own branded storefront, and build the direct booking relationships that protect your margins.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link href="/signup" className="px-8 py-4 rounded-lg text-white font-bold text-base transition-all duration-200 shadow-xl hover:shadow-2xl w-full sm:w-auto text-center" style={{ background: 'linear-gradient(135deg, #0891B2, #0E7490)' }}>
              Book an ROI Audit
            </Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-lg border-2 border-cyan-200 text-cyan-800 font-semibold hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200 w-full sm:w-auto text-center">
              Get Your Custom Revenue Projection
            </a>
          </div>
          <p className="text-sm text-gray-400">App-like guest portal — no download required. Set up in under 10 minutes.</p>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section id="problem" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#F59E0B' }}>The Problem</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">You&apos;re Leaving Money on the Table</h2>
            <p className="text-lg text-gray-500 max-w-3xl">
              Every time a guest books through Airbnb or VRBO, you lose. You lose their contact information. You lose 15-20% in commissions. And you lose the chance to build a direct relationship that brings them back. Most property managers don&apos;t even realize how much revenue they&apos;re giving away.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 mb-16">
            {[
              {
                stat: '0',
                title: 'Guest Emails from Airbnb',
                desc: 'Airbnb deliberately hides guest email addresses. You manage their stay, clean their property, handle their complaints — but you can\'t even send them a thank-you email afterward.',
                gradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              },
              {
                stat: '15-20%',
                title: 'Lost to OTA Commissions',
                desc: 'Every booking through Airbnb or VRBO costs you 15-20% in platform fees. Without guest data, you can\'t drive direct rebookings — so you keep paying the commission, forever.',
                gradient: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
              },
              {
                stat: '82%',
                title: 'Of Hosts Never Sell Upsells',
                desc: 'Early check-in, late checkout, airport transfers, grocery stocking, local experiences — guests will pay $25-$100+ for these. Most hosts never offer them because they have no system to do it.',
                gradient: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl p-7 hover:shadow-lg transition-all duration-300" style={{ background: item.gradient }}>
                <p className="text-4xl font-bold mb-2" style={{ color: '#0891B2' }}>{item.stat}</p>
                <h3 className="text-gray-900 font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* The Compliance Problem */}
          <div className="rounded-2xl border-2 border-amber-200 p-8" style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' }}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-white font-bold text-lg">!</div>
              <div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">The 2025 Compliance Problem</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Airbnb&apos;s 2025 Off-Platform Policy changed the rules. Legacy digital guidebooks introduced as &quot;extra reading&quot; are being flagged and penalized. But here&apos;s the legal exception: <span className="font-semibold" style={{ color: '#0891B2' }}>Florida Statute Chapter 509</span> requires Transient Public Lodging Establishments to maintain a guest registry with verified identification. StaySteward automates these mandatory guest registry requirements — moving ID verification, rental agreement signing, and legal compliance into a digital-first workflow. You capture 100% of guest data <em>legally</em>, stay protected under Airbnb&apos;s Off-Platform Policy, and satisfy DBPR licensing requirements — all in one check-in flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE SOLUTION ===== */}
      <section className="py-24 px-6 relative" style={{ background: 'linear-gradient(180deg, #F0F9FF, #FFFFFF)' }}>
        <div className="relative max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#0891B2' }}>The Solution</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">A Complete Guest Operating System</h2>
            <p className="text-lg text-gray-500 max-w-3xl">
              StaySteward isn&apos;t another digital guidebook. It&apos;s a full guest lifecycle platform — from the moment they book to the day they rebook directly. We built it because property managers with 10-100+ units deserve enterprise-grade tools without the enterprise complexity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                title: 'We Capture the Data Airbnb Hides',
                desc: 'Through mandatory digital check-in, guests provide their real email, phone, and ID — all in exchange for WiFi access, door codes, and property details. You own this data. Not Airbnb.',
                bg: '#F0F9FF',
                border: '#BAE6FD',
              },
              {
                title: 'We Monetize Every Guest Touchpoint',
                desc: 'Our one-click upsell storefront lets guests buy early check-in, late checkout, grocery stocking, airport transfers, and local experiences. Guests pay via Stripe. Money hits your account instantly.',
                bg: '#FFFBEB',
                border: '#FDE68A',
              },
              {
                title: 'We Build the Relationship for You',
                desc: 'Automated post-stay email sequences handle thank-yous, review requests, win-back offers, and anniversary discounts. Every sequence is designed to drive a direct rebooking — eliminating OTA commissions.',
                bg: '#F0FDF4',
                border: '#BBF7D0',
              },
              {
                title: 'We Keep You Legally Protected',
                desc: 'StaySteward automates the guest registry requirements mandated by Florida Statute Chapter 509. ID verification, rental agreement signing, and guest registration all serve a documented legal purpose — keeping you compliant with DBPR licensing and protected under Airbnb\'s 2025 Off-Platform Policy. Zero risk. Zero gray area.',
                bg: '#FFF7ED',
                border: '#FED7AA',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border-2 p-7 hover:shadow-lg transition-all duration-300" style={{ background: item.bg, borderColor: item.border }}>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#0891B2' }}>{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#0891B2' }}>The Guest Lifecycle</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Four Stages. One Platform.</h2>
            <p className="text-lg text-gray-500 max-w-3xl">
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
                color: '#0891B2',
                bg: '#F0F9FF',
              },
              {
                step: '02',
                title: 'Monetize',
                subtitle: 'One-Click Upsell Storefront',
                desc: 'Once checked in, guests see your personalized experience storefront. Convenience upsells (airport transfers, grocery stocking) are highlighted 3-7 days before arrival. Experience upsells (boat tours, private chef, spa) are highlighted during the stay. Guests buy with one click via Stripe — Apple Pay, Google Pay, cards. You set the price, you keep the revenue.',
                color: '#F59E0B',
                bg: '#FFFBEB',
              },
              {
                step: '03',
                title: 'Automate',
                subtitle: 'Intelligent Email Sequences',
                desc: 'Pre-arrival guides, check-in reminders, mid-stay experience offers, post-stay thank-yous, review requests, and win-back campaigns — all automated, all branded to your business. Each sequence is timed to maximize engagement and drive the next booking.',
                color: '#10B981',
                bg: '#F0FDF4',
              },
              {
                step: '04',
                title: 'Retain',
                subtitle: 'Direct Booking Flywheel',
                desc: 'You now have verified guest emails, stay history, and spending data — everything Airbnb hides from you. Automated remarketing offers "Book Direct & Save 10%" to past guests, effectively buying back the 15% OTA commission for just a 10% discount. Guests save money, you make more per booking, and Airbnb loses the repeat.',
                color: '#F97316',
                bg: '#FFF7ED',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start rounded-2xl border-2 p-7 hover:shadow-lg transition-all duration-300" style={{ background: item.bg, borderColor: `${item.color}30` }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15`, border: `2px solid ${item.color}40` }}>
                  <span className="font-bold text-lg" style={{ color: item.color }}>{item.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {item.title} <span className="text-gray-400 font-normal text-base">— {item.subtitle}</span>
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #FFFBEB, #FEF3C7 50%, #FFFFFF)' }}>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#F59E0B' }}>What You Get</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Built for Property Managers<br />Who Want to Grow</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
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
                title: 'Upsell Marketplace — Zero Operational Effort',
                desc: 'Early check-in ($25-$50), late checkout ($25-$50), airport transfers, grocery stocking, private chef, boat tours — create unlimited services. One-click purchase via Stripe. Fulfillment partners handle the logistics so your team doesn\'t add headcount.',
              },
              {
                title: 'Automated Email Sequences',
                desc: 'Pre-arrival welcome, check-in reminder, mid-stay offers, post-stay thank you, review request, win-back campaign, anniversary offer. Set it once, runs forever.',
              },
              {
                title: 'ID Verification & FL Statute 509 Compliance',
                desc: 'Guest identity verification with photo ID upload. Digital rental agreement signing. Automates the guest registry requirements mandated by Florida Statute Chapter 509, fully compliant with DBPR licensing and Airbnb\'s 2025 Off-Platform Policy.',
              },
              {
                title: 'Analytics Dashboard',
                desc: 'Guest capture rate, upsell conversion, revenue per property, email performance, direct booking attribution. See exactly what\'s working and what to optimize.',
              },
              {
                title: 'Stripe Connect Payments',
                desc: 'Apple Pay, Google Pay, credit cards. Guests pay through your portal, money goes straight to your connected Stripe account. Automatic payouts, detailed reporting.',
              },
              {
                title: 'Multi-Language Guest Portal',
                desc: 'Florida hosts millions of international travelers from Latin America, Europe, and beyond. StaySteward automatically detects guest language preferences, ensuring high conversion on upsells and a frictionless check-in experience regardless of where your guests are from.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border-2 border-white bg-white p-7 hover:shadow-lg hover:border-cyan-100 transition-all duration-300 shadow-sm">
                <h3 className="text-gray-900 font-semibold text-base mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOMEOWNER HERO ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="relative max-w-5xl mx-auto">
          <div className="sm:flex items-start gap-10">
            <div className="flex-1 mb-8 sm:mb-0">
              <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#10B981' }}>Owner Retention</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Make Your Homeowners Heroes</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                A property manager&apos;s biggest risk isn&apos;t vacancy — it&apos;s owner churn. When homeowners see you as a 3% co-host commodity, they leave. StaySteward gives you hard data to prove you&apos;re a revenue partner, not just a booking agent.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our dashboard generates per-property <span className="font-semibold" style={{ color: '#0891B2' }}>Ancillary Revenue Lift</span> reports — showing your owners exactly how much extra profit you&apos;ve generated beyond the nightly rate through upsells, direct rebookings, and commission savings. Give them a number they can&apos;t argue with.
              </p>
              <p className="text-gray-600 leading-relaxed">
                When your owner sees &quot;+$4,200 in ancillary revenue this quarter&quot; on their dashboard, they&apos;re not shopping for a cheaper manager. They&apos;re referring their friends.
              </p>
            </div>
            <div className="flex-shrink-0 sm:w-72">
              <div className="rounded-2xl border-2 border-emerald-100 p-6 space-y-4" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' }}>
                <h4 className="text-gray-900 font-semibold text-sm uppercase tracking-wider">Owner Dashboard Preview</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Upsell Revenue</span>
                    <span className="text-emerald-600 font-semibold">+$1,840</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Direct Rebooking Savings</span>
                    <span className="text-emerald-600 font-semibold">+$1,260</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Guest Support Hours Saved</span>
                    <span className="text-emerald-600 font-semibold">+8 hrs</span>
                  </div>
                  <div className="pt-3 border-t border-emerald-200">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-gray-900">Ancillary Revenue Lift</span>
                      <span style={{ color: '#0891B2' }}>+$3,100/qtr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHO THIS IS FOR ===== */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #F0F9FF, #E0F2FE 50%, #F0F9FF)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#0891B2' }}>Who This Is For</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Built for Growth-Stage<br />Property Managers</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                range: '5-20 Units',
                title: 'Scaling Operators',
                desc: 'You\'ve proven the model, now you need systems. StaySteward replaces the patchwork of tools you\'ve outgrown — guest guides, upsells, email marketing, and compliance — with one platform that actually talks to each other.',
                gradient: 'linear-gradient(135deg, #FFFFFF, #F0F9FF)',
              },
              {
                range: '20-50 Units',
                title: 'Growth Operators',
                desc: 'You\'re hitting the "Revenue Plateau" — more properties but not proportionally more profit. StaySteward creates new revenue streams (upsells, direct bookings) without adding headcount or complexity.',
                gradient: 'linear-gradient(135deg, #FFFFFF, #FFFBEB)',
              },
              {
                range: '50-200+ Units',
                title: 'Enterprise Operators',
                desc: 'At scale, every percentage point matters. Reducing OTA commissions by driving direct rebookings, automating guest communication, and capturing upsell revenue across your portfolio adds up to hundreds of thousands per year.',
                gradient: 'linear-gradient(135deg, #FFFFFF, #F0FDF4)',
              },
            ].map((segment) => (
              <div key={segment.range} className="rounded-2xl border-2 border-white p-7 text-center hover:shadow-lg transition-all duration-300 shadow-sm" style={{ background: segment.gradient }}>
                <p className="text-3xl font-bold mb-2" style={{ color: '#0891B2' }}>{segment.range}</p>
                <h3 className="text-gray-900 font-semibold mb-3">{segment.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{segment.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== THE MATH ===== */}
      <section className="py-24 px-6 bg-white">
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#F59E0B' }}>The ROI</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Do the Math</h2>
            <p className="text-lg text-gray-500">Here&apos;s what a 30-property manager can realistically expect.</p>
          </div>

          {/* Industry Benchmarks */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10">
            {[
              { stat: '$36:$1', label: 'Email Marketing ROI', desc: 'Average return on every dollar spent on email marketing in the STR industry.', bg: '#F0F9FF', border: '#BAE6FD' },
              { stat: '40%', label: 'Higher Guest LTV', desc: 'Direct booking guests have 40% higher lifetime value and spend 15\u201330% more per stay than OTA guests.', bg: '#FFFBEB', border: '#FDE68A' },
              { stat: '11-15%', label: 'RevPAR Lift', desc: 'Properties using automated upsells see an average 11\u201315% increase in Revenue Per Available Rental.', bg: '#F0FDF4', border: '#BBF7D0' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border-2 p-6 text-center" style={{ background: item.bg, borderColor: item.border }}>
                <p className="text-3xl font-bold mb-1" style={{ color: '#0891B2' }}>{item.stat}</p>
                <p className="text-gray-900 font-semibold text-sm mb-2">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border-2 border-sky-100 p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, #F0F9FF, #FFFFFF)' }}>
            <div className="grid sm:grid-cols-2 gap-10">
              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-6">New Revenue You&apos;re Missing</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b border-sky-100 pb-3">
                    <span className="text-gray-500">Upsell revenue (8% conversion, $45 avg)</span>
                    <span className="text-emerald-600 font-semibold">+$3,240/mo</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-sky-100 pb-3">
                    <span className="text-gray-500">Direct rebookings (save 15% commission)</span>
                    <span className="text-emerald-600 font-semibold">+$2,700/mo</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-sky-100 pb-3">
                    <span className="text-gray-500">RevPAR lift from automated upsells</span>
                    <span className="text-emerald-600 font-semibold">+11-15%</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-sky-100 pb-3">
                    <span className="text-gray-500">Reduced guest support time</span>
                    <span className="text-emerald-600 font-semibold">+10 hrs/mo</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2">
                    <span className="text-gray-900">Total new monthly revenue</span>
                    <span className="text-emerald-600">+$5,940/mo</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-6">Assumptions</h3>
                <div className="space-y-3 text-sm text-gray-500">
                  <p>30 properties, avg 20 nights/month booked</p>
                  <p>600 guest-nights per month</p>
                  <p>87% email capture rate via check-in portal</p>
                  <p>8% upsell conversion, $45 avg order value</p>
                  <p>15% of past guests rebook direct within 12 months</p>
                  <p>$600 avg booking value, 15% OTA commission saved</p>
                </div>
                <div className="mt-6 rounded-xl p-4" style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}>
                  <p className="text-emerald-700 font-semibold text-sm">Bottom line: ~$71K in new annual revenue from a portfolio that was already fully booked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FLORIDA ADVANTAGE ===== */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #FFFBEB, #FEF3C7 30%, #FDE68A 70%, #FFFBEB)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border-2 border-amber-200 bg-white/80 p-8 sm:p-10 shadow-sm" style={{ backdropFilter: 'blur(8px)' }}>
            <div className="sm:flex items-start gap-10">
              <div className="flex-1 mb-8 sm:mb-0">
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#F59E0B' }}>The Florida Advantage</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Built for the Largest STR Market in America</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Florida represents 26% of national short-term rental activity — over $30 billion annually. With DBPR licensing requirements and some of the highest guest volumes in the country, Florida property managers need a platform that understands their market, their compliance requirements, and their guests.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  StaySteward was built in Florida, for Florida operators. We understand DBPR licensing, local ordinances, and the unique dynamics of every major market.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Whether you&apos;re managing luxury beachfront estates in 30A/Destin, high-volume condos near Disney in Osceola County, vacation rentals along the Emerald Coast in Okaloosa, or urban lofts in Miami-Dade and Broward — StaySteward adapts to your local county-specific permits and guest demographics.
                </p>
              </div>
              <div className="flex-shrink-0 sm:w-64">
                <div className="space-y-4">
                  {[
                    { stat: '$30B+', label: 'Florida STR market annually' },
                    { stat: '26%', label: 'Of national STR activity' },
                    { stat: '700+', label: 'Licensed operators in our database' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border-2 border-amber-100 bg-white p-4">
                      <p className="text-2xl font-bold" style={{ color: '#0891B2' }}>{item.stat}</p>
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
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#0891B2' }}>Integrations</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Works With Your Existing Stack</h2>
          <p className="text-gray-500 text-sm mb-10">Partner API access for Guesty, Hostaway, and Lodgify — beta integration available now.</p>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
            {[
              { name: 'Stripe', status: 'Live' },
              { name: 'Airbnb', status: 'Live' },
              { name: 'VRBO', status: 'Live' },
              { name: 'Hostaway', status: 'Beta Access' },
              { name: 'Guesty', status: 'Beta Access' },
              { name: 'Lodgify', status: 'Beta Access' },
              { name: 'Resend', status: 'Live' },
            ].map((integration) => (
              <div key={integration.name} className="rounded-xl border-2 border-gray-100 bg-gray-50 p-4 hover:border-cyan-200 hover:bg-cyan-50 transition-all duration-200">
                <p className="text-gray-900 font-medium text-sm">{integration.name}</p>
                <p className={`text-xs mt-1 font-medium ${integration.status === 'Live' ? 'text-emerald-500' : 'text-amber-500'}`}>{integration.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-28 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0891B2, #0E7490 40%, #0369A1)' }}>
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(251,191,36,0.2) 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Stop Giving Away Your NOI</h2>
          <p className="text-lg text-cyan-100 mb-10 max-w-2xl mx-auto">
            Every day without a guest capture system is another day of lost emails, missed upsells, and repeat guests booking through Airbnb instead of directly with you. Your homeowners deserve to see the ancillary revenue you&apos;re leaving on the table.
          </p>
          <Link href="/signup" className="inline-block px-10 py-4 rounded-lg bg-white font-bold text-lg transition-all duration-200 shadow-2xl hover:shadow-white/20 hover:bg-amber-50" style={{ color: '#0891B2' }}>
            Book Your Custom ROI Audit
          </Link>
          <p className="text-sm text-cyan-200 mt-4">See exactly how much revenue your portfolio is missing. No obligation.</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-gray-100 py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="sm:flex items-start justify-between">
            <div className="mb-8 sm:mb-0">
              <p className="font-bold text-lg mb-2" style={{ color: '#0891B2' }}>StaySteward</p>
              <p className="text-xs text-gray-400">The Guest Operating System for Short-Term Rentals</p>
            </div>
            <div className="flex gap-12 text-sm">
              <div className="space-y-2">
                <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">Product</p>
                <a href="#features" className="block text-gray-500 hover:text-cyan-700 transition-colors">Features</a>
                <a href="#how-it-works" className="block text-gray-500 hover:text-cyan-700 transition-colors">How It Works</a>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">Account</p>
                <Link href="/login" className="block text-gray-500 hover:text-cyan-700 transition-colors">Login</Link>
                <Link href="/signup" className="block text-gray-500 hover:text-cyan-700 transition-colors">Sign Up</Link>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">Company</p>
                <span className="block text-gray-500">Privacy</span>
                <span className="block text-gray-500">Terms</span>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">&copy; 2026 StaySteward. Built by Stelliform Digital.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
