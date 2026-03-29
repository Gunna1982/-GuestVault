import { NextResponse } from 'next/server';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
}

const templates: EmailTemplate[] = [
  {
    id: 'intro',
    name: 'Initial Outreach',
    subject: 'Quick Question About Your Vacation Rental',
    body: `Hi [Guest Name],

I came across [Property Name] and noticed you're operating a vacation rental in Florida. I wanted to reach out because we've been helping property managers like you streamline guest communications and boost revenue.

StaySteward is a digital concierge platform that handles guest guides, manages upsell opportunities (early check-in, late checkout, local experiences), and automates your email sequences—all while building your brand.

Would you be open to a quick 15-minute conversation to see if it could be a good fit for your business?

Best regards,
StaySteward Team
hello@staysteward.com`,
    description: 'Perfect first touchpoint. Introduces StaySteward and requests a brief conversation.',
  },
  {
    id: 'follow_up',
    name: 'Follow Up',
    subject: 'Following Up: Digital Concierge for Your Rental',
    body: `Hi [Guest Name],

I hope my previous message found you well. I wanted to follow up and see if you'd had a chance to think about ways to improve your guest experience and unlock additional revenue streams.

Many property managers are seeing great results with StaySteward:
- 40% higher guest satisfaction scores
- Additional revenue from upsell opportunities
- Automated guest communication sequences
- Professional brand builder tools

Would a brief call this week work for you? I'm confident we can find ways to help you grow.

Looking forward to connecting,
StaySteward Team
hello@staysteward.com`,
    description: 'Second touchpoint. Adds social proof and reinforces benefits.',
  },
  {
    id: 'demo_invite',
    name: 'Demo Invitation',
    subject: 'Your Personal Demo: StaySteward Platform',
    body: `Hi [Guest Name],

Thank you for your interest in StaySteward! I'd love to show you exactly how our platform works and how it can transform your guest management workflow.

In your personalized 20-minute demo, you'll see:
✓ Digital guest guides that wow your guests
✓ The upsell marketplace in action (early check-in, late checkout, experiences)
✓ Automated email sequences that save you time
✓ Analytics dashboard to track revenue impact

I have a few slots open this week. What works best for your schedule?

Thanks,
StaySteward Team
hello@staysteward.com`,
    description: 'For qualified leads ready to see a demo. Highlights key features.',
  },
  {
    id: 'value_prop',
    name: 'Value Proposition',
    subject: 'The #1 Way Property Managers Are Boosting Guest Revenue',
    body: `Hi [Guest Name],

The best property managers we work with aren't just managing bookings—they're creating premium guest experiences and capturing ancillary revenue.

That's exactly what StaySteward helps you do. Our platform gives you:

🏆 Digital Concierge: Professional guest guides that elevate your brand
💰 Revenue Opportunities: Upsell marketplace (early check-in, late checkout, local experiences)
⚡ Automation: Email sequences that work 24/7
📊 Intelligence: Analytics to optimize pricing and guest satisfaction

The average property manager working with us adds $2,500+ in annual ancillary revenue per property.

Curious how this could work for [Property Name]? Let's talk.

Best,
StaySteward Team
hello@staysteward.com`,
    description: 'Focuses on revenue impact and concrete benefits. Great for mid-funnel.',
  },
  {
    id: 'case_study',
    name: 'Case Study',
    subject: 'How Other Florida STR Operators Are Growing Their Revenue',
    body: `Hi [Guest Name],

I wanted to share a quick success story that might be relevant to [Property Name].

A property manager in Miami Beach was struggling with:
• Guest communication overhead
• Missed revenue opportunities
• Inconsistent guest experiences

After implementing StaySteward, they saw:
✓ 35% increase in ancillary revenue in 90 days
✓ 2 hours saved per week on guest communications
✓ Higher 5-star review ratings

How? Through our digital concierge platform, automated email sequences, and smart upsell marketplace.

I think we could achieve similar results for you. Would you be open to a brief conversation about your current challenges and where you see opportunities?

Looking forward to connecting,
StaySteward Team
hello@staysteward.com`,
    description: 'Uses social proof and case study. Effective for building credibility.',
  },
];

export async function GET() {
  return NextResponse.json({
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      body: t.body,
      description: t.description,
    })),
  });
}
