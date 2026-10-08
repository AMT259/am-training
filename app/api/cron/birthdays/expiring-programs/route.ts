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
 
// Giorni prima della scadenza in cui avvisare (0 = il giorno stesso)
const TAPPE_ATLETA = [7, 0];
const TAPPE_COACH = [10, 7, 3, 1, 0];
const TAPPE = Array.from(new Set([...TAPPE_ATLETA, ...TAPPE_COACH]));
 
const quando = (n: number) => (n === 0 ? 'scade oggi' : n === 1 ? 'scade domani' : `scade fra ${n} giorni`);
 
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
 
    // Date di scadenza da cercare oggi: una per ogni tappa
    const bersagli: { [giorno: string]: number } = {};
    TAPPE.forEach((n) => {
      bersagli[sommaGiorni(oggiKey, n)] = n;
    });
 
    const { data: programmi } = await supabaseAdmin
      .from('programs')
      .select('id,title,end_date,visibility,assigned_athlete_ids,trial_style,is_deleted')
      .in('end_date', Object.keys(bersagli));
 
    if (!programmi || programmi.length === 0) {
      return NextResponse.json({ ok: true, giorno: oggiKey, avvisati: 0, nota: 'nessun programma in scadenza' });
    }
 
    // Atleti con abbonamento attivo: sono gli unici che vedono le schede
    const { data: atleti } = await supabaseAdmin
      .from('profiles')
      .select('id,full_name,subscription_status')
      .eq('role', 'athlete');
 
    // Coach: ricevono un avviso per ogni programma, con i nomi degli atleti
    const { data: coaches } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'coach');
 
    const attivi = (atleti || []).filter((a: any) => (a.subscription_status || 'prova') === 'attivo');
    const origin = req.nextUrl.origin;
    let avvisati = 0;
 
    // Crea la notifica (una sola volta per chiave) e manda la push
    const avvisa = async (userId: string, titolo: string, testo: string, chiave: string) => {
      const { data: gia } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', chiave)
        .limit(1);
      if (gia && gia.length > 0) return;
 
      await supabaseAdmin.from('notifications').insert([{
        user_id: userId,
        title: titolo,
        message: testo,
        notification_type: chiave,
        is_read: false,
        dismissed: false,
      }]);
 
      await fetch(`${origin}/api/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title: titolo, message: testo }),
      }).catch(() => {});
 
      avvisati++;
    };
 
    for (const prog of programmi) {
      if (prog.is_deleted || prog.trial_style) continue;      // cestino e settimane di prova: niente avviso
      if (prog.visibility === 'none') continue;               // bozze: l'atleta non le vede
 
      const mancano = bersagli[String(prog.end_date).slice(0, 10)];
      if (mancano === undefined) continue;
      const nomeProg = prog.title || 'Il tuo programma';
 
      const destinatari: string[] =
        prog.visibility === 'all'
          ? attivi.map((a: any) => a.id)
          : (prog.assigned_athlete_ids || []).filter((id: string) => attivi.some((a: any) => a.id === id));
 
      // All'atleta: solo 7 giorni prima e il giorno stesso
      for (const athleteId of TAPPE_ATLETA.includes(mancano) ? destinatari : []) {
        const titolo = mancano === 0 ? 'Il tuo programma scade oggi' : 'Il tuo programma sta per scadere';
        const testo = mancano === 0
          ? `"${nomeProg}" scade oggi. Contatta il coach per rinnovare il tuo percorso e non interrompere i progressi.`
          : `"${nomeProg}" ${quando(mancano)}. Contatta il coach per rinnovare il tuo percorso e non interrompere i progressi.`;
        // La chiave comprende programma, tappa e data: ogni tappa arriva una volta sola
        await avvisa(athleteId, titolo, testo, `prog_expiring_${prog.id}_${mancano}_${oggiKey}`);
      }
 
      // Al coach: 10, 7, 3, 1 giorni prima e il giorno stesso, uno per programma con i nomi degli atleti
      if (destinatari.length > 0 && TAPPE_COACH.includes(mancano)) {
        const nomi = destinatari
          .map((id: string) => (atleti || []).find((a: any) => a.id === id)?.full_name || 'un atleta')
          .join(', ');
        const titoloCoach = mancano === 0 ? 'Programma in scadenza oggi' : 'Programma in scadenza';
        const testoCoach = prog.visibility === 'all'
          ? `"${prog.title || 'Programma'}" ${quando(mancano)} per tutti gli atleti attivi (${destinatari.length}). Valuta il rinnovo.`
          : `"${prog.title || 'Programma'}" di ${nomi} ${quando(mancano)}. Valuta il rinnovo.`;
        for (const coach of coaches || []) {
          await avvisa(coach.id, titoloCoach, testoCoach, `prog_expiring_${prog.id}_${mancano}_${oggiKey}_coach`);
        }
      }
    }
 
    return NextResponse.json({ ok: true, giorno: oggiKey, programmi: programmi.length, avvisati });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore controllo scadenze' }, { status: 500 });
  }
}
