// app/api/notify-user/route.ts
 
import { NextRequest, NextResponse } from 'next/server';
 
import { createClient } from '@supabase/supabase-js';
 
 
const supabaseAdmin = createClient(
 
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
 
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
 
);
 
 
export const dynamic = 'force-dynamic';
 
 
// Avvisi che devono arrivare UNA volta sola per lo stesso programma:
 
// il codice resta quello esatto (senza l'ora in fondo), così l'app e il database
 
// riconoscono i doppioni e non parte una seconda notifica né una seconda push.
 
const UNA_VOLTA_SOLA = ['program_assigned_'];
 
 
export async function POST(req: NextRequest) {
 
  try {
 
    const { user_id, type, title, message } = await req.json();
 
 
    if (!user_id || !title || !message) {
 
      return NextResponse.json({ error: 'user_id, title e message sono obbligatori' }, { status: 400 });
 
    }
 
 
    const tipo = String(type || 'generic');
 
    const unaVolta = UNA_VOLTA_SOLA.some((p) => tipo.startsWith(p));
 
    // Gli altri avvisi (abbonamento, proroga prova...) possono ripetersi nel tempo: restano con l'ora in fondo
 
    const chiave = unaVolta ? tipo : `${tipo}_${Date.now()}`;
 
 
    if (unaVolta) {
 
      // Già mandato? Controllo anche quelli vecchi che avevano l'ora in fondo (program_assigned_81_1729...)
 
      const { data: gia } = await supabaseAdmin
 
        .from('notifications')
 
        .select('notification_type')
 
        .eq('user_id', user_id)
 
        .like('notification_type', 'program_assigned%')
 
        .limit(1000);
 
      const esiste = (gia || []).some((n: any) => {
 
        const t = String(n.notification_type || '');
 
        return t === tipo || t.startsWith(`${tipo}_`);
 
      });
 
      if (esiste) return NextResponse.json({ ok: true, saltata: 'già inviata' });
 
    }
 
 
    const { error } = await supabaseAdmin.from('notifications').insert([{
 
      user_id,
 
      title,
 
      message,
 
      notification_type: chiave,
 
      is_read: false,
 
      dismissed: false,
 
    }]);
 
 
    // 23505 = il database ha bloccato un doppione: niente push
 
    if (error) {
 
      if ((error as any).code === '23505') return NextResponse.json({ ok: true, saltata: 'doppione' });
 
      return NextResponse.json({ error: error.message }, { status: 500 });
 
    }
 
 
    const origin = req.nextUrl.origin;
 
    await fetch(`${origin}/api/send-push`, {
 
      method: 'POST',
 
      headers: { 'Content-Type': 'application/json' },
 
      body: JSON.stringify({ user_id, title, message }),
 
    }).catch(() => {});
 
 
    return NextResponse.json({ ok: true });
 
  } catch (err: any) {
 
    return NextResponse.json({ error: err.message || 'Errore notifica utente' }, { status: 500 });
 
  }
 
}
 
 
