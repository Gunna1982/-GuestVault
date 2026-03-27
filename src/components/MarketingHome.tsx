import Link from 'next/link';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800/50" style={{ background: 'rgba(9,9,20,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-amber-400 tracking-wide">GuestVault</Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="px-5 py-2 rounded-lg bg-amber-400 text-gray-950 text-sm font-semibold hover:bg-amber-300 transition-colors">Get Started Free</Link>
          </div>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 rounded-full border border-amber-400/20 bg-amber-400/5 mb-6">
            <span className="text-xs text-amber-400 font-medium">Now in Beta — Free for Early Hosts</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">Turn Every Guest Into<br /><span className="text-amber-400">Repeat Revenue</span></h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">Capture guest emails at check-in, sell upsells through your own branded portal, and drive direct rebookings with automated marketing.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="px-8 py-4 rounded-lg bg-amber-400 text-gray-950 font-bold text-base hover:bg-amber-300 transition-colors">Start Free — No Credit Card</Link>
            <a href="#how-it-works" className="px-8 py-4 rounded-lg border border-gray-700 text-gray-300 text-sm hover:border-gray-600 hover:text-white transition-colors">See How It Works</a>
          </div>
          <p className="text-xs text-gray-600 mt-4">Free forever for up to 4 properties.</p>
        </div>
      </section>
      <section className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-4">The Problem</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Airbnb Owns Your Guest Relationship</h2>
          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            {[{ stat: '0', label: 'guest emails you capture from Airbnb' },{ stat: '15-20%', label: 'commission on every OTA booking' },{ stat: '82%', label: 'of hosts offer zero upsells' }].map(item => (
              <div key={item.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center">
                <p className="text-3xl font-bold text-amber-400 mb-2">{item.stat}</p>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="how-it-works" className="py-20 px-6 border-t border-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">Four Steps to Guest Revenue</h2>
          <div className="space-y-8">
            {[{ step:'1',emoji:'📱',title:'Capture',desc:'Send guests a branded check-in link. They give email + phone to get WiFi.' },{ step:'2',emoji:'🛒',title:'Upsell',desc:'Late checkout, airport transfers, grocery, private chef — guests buy instantly via Stripe.' },{ step:'3',emoji:'📧',title:'Remarket',desc:'Automated post-stay emails: thank you, review request, win-back offers, anniversary.' },{ step:'4',emoji:'📊',title:'Grow',desc:'Track capture rates, upsell revenue, email performance, and direct booking conversions.' }].map(item => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-xl">{item.emoji}</div>
                <div><h3 className="text-lg font-semibold text-white mb-1"><span className="text-amber-400 mr-2">Step {item.step}:</span>{item.title}</h3><p className="text-sm text-gray-400">{item.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6 border-t border-gray-800/50 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Start Capturing Guest Revenue Today</h2>
          <p className="text-gray-400 mb-8">Free forever for up to 4 properties. Set up in under 10 minutes.</p>
          <Link href="/signup" className="inline-block px-10 py-4 rounded-lg bg-amber-400 text-gray-950 font-bold hover:bg-amber-300 transition-colors">Get Started Free</Link>
        </div>
      </section>
      <footer className="border-t border-gray-800/50 py-8 px-6 text-center">
        <p className="text-xs text-gray-700">&copy; 2026 GuestVault. Built by Stelliform Digital.</p>
      </footer>
    </div>
  );
}
