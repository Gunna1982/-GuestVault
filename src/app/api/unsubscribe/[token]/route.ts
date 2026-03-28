import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/unsubscribe/:token — one-click unsubscribe (CAN-SPAM compliant)
// Must work with a simple GET request per RFC 8058 (List-Unsubscribe-Post)
// and also handle the browser click case.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, email, first_name, organization_id')
    .eq('unsubscribe_token', token)
    .single();

  if (error || !guest) {
    return new Response(unsubscribeHtml('Invalid Link', 'This unsubscribe link is invalid or has already been used.', false), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Update guest record — revoke marketing consent
  await supabase
    .from('guests')
    .update({
      marketing_consent: false,
      consent_timestamp: new Date().toISOString(),
    })
    .eq('id', guest.id);

  // Also mark all pending email_sends as unsubscribed
  await supabase
    .from('email_sends')
    .update({ status: 'unsubscribed' })
    .eq('guest_id', guest.id)
    .in('status', ['queued', 'sent']);

  return new Response(
    unsubscribeHtml(
      'Unsubscribed',
      `You've been successfully unsubscribed from marketing emails. You may still receive essential stay-related communications (check-in confirmations, safety info).`,
      true
    ),
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// POST — for List-Unsubscribe-Post header (RFC 8058)
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  return GET(req, { params });
}

function unsubscribeHtml(title: string, message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — StaySteward</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #06060C; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { max-width: 420px; padding: 40px; text-align: center; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    p { color: #9CA3AF; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : '⚠'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
