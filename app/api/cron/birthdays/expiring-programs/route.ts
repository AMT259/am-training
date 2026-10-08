import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
 
// Data e ora di Roma, qualunque sia il fuso del server
const ROMA = (d: Date) => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(d);
  const v = (t: string) => p.find((x) => x.type === t)?.value || '';
  return { chiave: `${v('year')}-${v('month')}-${v('day')}`, ora: parseInt(v('hour'), 10) };
};
const sommaGiorni = (chiave: string, n: number) => {
  const [a, m, g] = chiave.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, g + n)).toISOString().split('T')[0];
};
 
export const dynamic = 'force-dynamic';
 
const GIORNI_PREAVVISO = 7;
 
export async function GET(req: NextRequest) {
  try {
    // Il cron parte alle 22 e alle 23 UTC: si lavora solo quando a Roma e' mezzanotte.
    // Per provarlo a mano a qualsiasi ora: aggiungi ?prova=1 all'indirizzo
    const adesso = ROMA(new Date());
    const prova = req.nextUrl.searchParams.get('prova') === '1';
    if (adesso.ora !== 0 && !prova) {
      return NextResponse.json({ ok: true, saltato: `a Roma sono le ${adesso.ora}: si parte solo a mezzanotte` });
    }
    const oggiKey = adesso.chiave;
 
    // Data di scadenza da cercare: fra esattamente sette giorni (data di Roma)
    const giorno = sommaGiorni(oggiKey, GIORNI_PREAVVISO);
 
    const { data: programmi } = await supabaseAdmin
      .from('programs')
      .select('id,title,end_date,visibility,assigned_athlete_ids,trial_style,is_deleted')
      .eq('end_date', giorno);
 
    if (!programmi || programmi.length === 0) {
      return NextResponse.json({ ok: true, giorno, avvisati: 0, nota: 'nessun programma in scadenza' });
    }
 
    // Atleti con abbonamento attivo: sono gli unici che vedono le schede
    const { data: atleti } = await supabaseAdmin
      .from('profiles')
      .select('id,full_name,subscription_status')
      .eq('role', 'athlete');
 
    const attivi = (atleti || []).filter((a: any) => (a.subscription_status || 'prova') === 'attivo');
    const origin = req.nextUrl.origin;
    let avvisati = 0;
 
    for (const prog of programmi) {
      if (prog.is_deleted || prog.trial_style) continue;      // cestino e settimane di prova: niente avviso
      if (prog.visibility === 'none') continue;               // bozze: l'atleta non le vede
 
      const destinatari =
        prog.visibility === 'all'
          ? attivi.map((a: any) => a.id)
          : (prog.assigned_athlete_ids || []).filter((id: string) => attivi.some((a: any) => a.id === id));
 
      for (const athleteId of destinatari) {
        const titolo = 'Il tuo programma sta per scadere';
        const testo = `"${prog.title || 'Il tuo programma'}" scade fra ${GIORNI_PREAVVISO} giorni. Contatta il coach per rinnovare il tuo percorso e non interrompere i progressi.`;
 
        // La chiave comprende programma e data: se il controllo girasse due volte
        // nello stesso giorno, l'atleta riceve comunque un solo avviso
        const chiave = `prog_expiring_${prog.id}_${giorno}`;
 
        const { data: gia } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('user_id', athleteId)
          .eq('notification_type', chiave)
          .limit(1);
 
        if (gia && gia.length > 0) continue;
 
        await supabaseAdmin.from('notifications').insert([{
          user_id: athleteId,
          title: titolo,
          message: testo,
          notification_type: chiave,
          is_read: false,
          dismissed: false,
        }]);
 
        await fetch(`${origin}/api/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: athleteId, title: titolo, message: testo }),
        }).catch(() => {});
 
        avvisati++;
      }
    }
 
    return NextResponse.json({ ok: true, giorno, programmi: programmi.length, avvisati });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore controllo scadenze' }, { status: 500 });
  }
}
