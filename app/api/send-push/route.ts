import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:verde.lime93@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, title, message, url } = await req.json();

    if (!user_id || !title) {
      return NextResponse.json({ error: 'user_id e title sono obbligatori' }, { status: 400 });
    }

    const { data: subs, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const payload = JSON.stringify({ title, body: message, url: url || '/' });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
      )
    );

    const expiredEndpoints: string[] = [];
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        expiredEndpoints.push(subs[i].endpoint);
      }
    });

    if (expiredEndpoints.length > 0) {
      await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
    }

    const sentCount = results.filter((r) => r.status === 'fulfilled').length;
    return NextResponse.json({ sent: sentCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore invio push' }, { status: 500 });
  }
}