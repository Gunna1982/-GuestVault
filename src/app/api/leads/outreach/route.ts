import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'hello@staysteward.com';

interface OutreachRequest {
  lead_id: string;
  template: string;
  subject?: string;
  custom_message?: string;
}

async function sendEmailViaResend(
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    console.log('[Outreach] Resend not configured, logging email:');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${body}`);
    return { success: true };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        html: body.replace(/\n/g, '<br />'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

async function getTemplateContent(
  templateId: string,
  leadData: { name: string; property_name?: string }
): Promise<{ subject: string; body: string }> {
  const templates: Record<string, { subject: string; body: (data: typeof leadData) => string }> = {
    intro: {
      subject: 'Quick Question About Your Vacation Rental',
      body: (data) =>
        `Hi ${data.name},

I came across ${data.property_name || 'your property'} and noticed you're operating a vacation rental in Florida. I wanted to reach out because we've been helping property managers like you streamline guest communications and boost revenue.

StaySteward is a digital concierge platform that handles guest guides, manages upsell opportunities (early check-in, late checkout, local experiences), and automates your email sequences—all while building your brand.

Would you be open to a quick 15-minute conversation to see if it could be a good fit for your business?

Best regards,
StaySteward Team
hello@staysteward.com`,
    },
    follow_up: {
      subject: 'Following Up: Digital Concierge for Your Rental',
      body: (data) =>
        `Hi ${data.name},

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
    },
    demo_invite: {
      subject: 'Your Personal Demo: StaySteward Platform',
      body: (data) =>
        `Hi ${data.name},

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
    },
    value_prop: {
      subject: 'The #1 Way Property Managers Are Boosting Guest Revenue',
      body: (data) =>
        `Hi ${data.name},

The best property managers we work with aren't just managing bookings—they're creating premium guest experiences and capturing ancillary revenue.

That's exactly what StaySteward helps you do. Our platform gives you:

🏆 Digital Concierge: Professional guest guides that elevate your brand
💰 Revenue Opportunities: Upsell marketplace (early check-in, late checkout, local experiences)
⚡ Automation: Email sequences that work 24/7
📊 Intelligence: Analytics to optimize pricing and guest satisfaction

The average property manager working with us adds $2,500+ in annual ancillary revenue per property.

Curious how this could work for ${data.property_name || 'your property'}? Let's talk.

Best,
StaySteward Team
hello@staysteward.com`,
    },
    case_study: {
      subject: 'How Other Florida STR Operators Are Growing Their Revenue',
      body: (data) =>
        `Hi ${data.name},

I wanted to share a quick success story that might be relevant to ${data.property_name || 'your business'}.

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
    },
  };

  const template = templates[templateId];
  if (!template) {
    throw new Error(`Template "${templateId}" not found`);
  }

  return {
    subject: template.subject,
    body: template.body(leadData),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: OutreachRequest = await request.json();
    const { lead_id, template, subject, custom_message } = body;

    if (!lead_id || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: lead_id, template' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!lead.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 });
    }

    // Get template content
    let emailSubject: string;
    let emailBody: string;

    try {
      const templateContent = await getTemplateContent(template, {
        name: lead.contact_person || lead.licensee_name || 'there',
        property_name: lead.brand_name || lead.company_name,
      });
      emailSubject = subject || templateContent.subject;
      emailBody = custom_message || templateContent.body;
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Template not found' },
        { status: 400 }
      );
    }

    // Send email
    const emailResult = await sendEmailViaResend(lead.email, emailSubject, emailBody);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    // Update lead status
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      date_last_contacted: now,
    };

    // Only set status to 'contacted' if it hasn't progressed further
    if (lead.outreach_status === 'not_contacted' || lead.outreach_status === 'researching') {
      updateData.outreach_status = 'contacted';
      if (!lead.date_first_contacted) {
        updateData.date_first_contacted = now;
      }
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', lead_id);

    if (updateError) {
      console.error('Error updating lead:', updateError);
    }

    // Log activity
    const { error: activityError } = await supabase.from('lead_activities').insert({
      lead_id,
      organization_id: lead.organization_id,
      activity_type: 'email_sent',
      title: `Email sent: ${emailSubject}`,
      description: `Sent "${template}" template to ${lead.email}`,
      metadata: { template, subject: emailSubject, message_id: emailResult.messageId },
    });

    if (activityError) {
      console.error('Error logging activity:', activityError);
    }

    return NextResponse.json({
      success: true,
      lead_id,
      template,
      email_sent_to: lead.email,
      message_id: emailResult.messageId,
    });
  } catch (error) {
    console.error('Outreach error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
