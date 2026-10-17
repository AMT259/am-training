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
 
 
export const dynamic = 'force-dynamic';
 
 
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
 
      return NextResponse.json({ sent: 0, nota: 'nessun dispositivo registrato per questo utente' });
 
    }
 
 
    const payload = JSON.stringify({ title, body: message || '', url: url || '/' });
 
 
    // urgency 'high': il telefono la consegna subito anche se è in risparmio energetico.
 
    // TTL di un giorno: se il telefono è spento o senza rete, arriva appena si riconnette.
 
    const opzioni = { TTL: 86400, urgency: 'high' as const };
 
 
    const invia = (sub: any) =>
 
      webpush.sendNotification(
 
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
 
        payload,
 
        opzioni
 
      );
 
 
    const results = await Promise.allSettled(subs.map(invia));
 
 
    // Prima si cancellava il dispositivo a QUALSIASI errore, anche temporaneo:
 
    // da quel momento quel telefono non riceveva più niente finché non si
 
    // riattivavano le notifiche. Ora lo cancello solo se il servizio push dice
 
    // che l'iscrizione non esiste più (404 / 410). Sugli altri errori riprovo una volta.
 
    const scaduti: string[] = [];
 
    const errori: string[] = [];
 
    for (let i = 0; i < results.length; i++) {
 
      const r = results[i];
 
      if (r.status === 'fulfilled') continue;
 
      const codice = (r.reason as any)?.statusCode;
 
      if (codice === 404 || codice === 410) {
 
        scaduti.push(subs[i].endpoint);
 
        continue;
 
      }
 
      try {
 
        await invia(subs[i]);
 
        (results as any)[i] = { status: 'fulfilled', value: null };
 
      } catch (e: any) {
 
        const c2 = e?.statusCode;
 
        if (c2 === 404 || c2 === 410) scaduti.push(subs[i].endpoint);
 
        else errori.push(`${c2 || ''} ${e?.body || e?.message || 'errore'}`.trim());
 
      }
 
    }
 
 
    if (scaduti.length > 0) {
 
      await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', scaduti);
 
    }
 
    if (errori.length > 0) console.error('Errori invio push:', errori);
 
 
    const sentCount = results.filter((r) => r.status === 'fulfilled').length;
 
    return NextResponse.json({ sent: sentCount, rimossi: scaduti.length, errori });
 
  } catch (err: any) {
 
    return NextResponse.json({ error: err.message || 'Errore invio push' }, { status: 500 });
 
  }
 
}
 
 
