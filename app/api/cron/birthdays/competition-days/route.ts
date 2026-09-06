// app/api/cron/competition-days/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
 
// Momenti in cui avvisare: sono quelli in cui un programma va ripensato
const TAPPE = [60, 30, 14, 7, 0];
 
export async function GET(req: NextRequest) {
  try {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
 
    // Calcolo le date che oggi ricadono su una delle tappe
    const bersagli: { [giorno: string]: number } = {};
    TAPPE.forEach((n) => {
      const d = new Date(oggi);
      d.setDate(d.getDate() + n);
      bersagli[d.toISOString().split('T')[0]] = n;
    });
 
    const { data: gare } = await supabaseAdmin
      .from('competition_days')
      .select('id,athlete_id,name,event_date')
      .in('event_date', Object.keys(bersagli));
 
    if (!gare || gare.length === 0) {
      return NextResponse.json({ ok: true, avvisati: 0, nota: 'nessuna gara in avvicinamento' });
    }
 
    // Nome degli atleti e id del coach, per avvisare anche lui
    const { data: profili } = await supabaseAdmin
      .from('profiles')
      .select('id,full_name,role');
 
    const nomeDi = (id: string) =>
      (profili || []).find((p: any) => p.id === id)?.full_name || 'Un atleta';
    const coach = (profili || []).find((p: any) => p.role === 'coach');
 
    const origin = req.nextUrl.origin;
    let avvisati = 0;
 
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
 
    for (const gara of gare) {
      const mancano = bersagli[String(gara.event_date)];
      const quando =
        mancano === 0 ? 'è oggi' :
        mancano === 7 ? 'è fra una settimana' :
        `è fra ${mancano} giorni`;
 
      const chiave = `comp_${gara.id}_${mancano}`;
 
      // All'atleta
      await avvisa(
        gara.athlete_id,
        mancano === 0 ? `🎯 Oggi è il tuo Competition Day!` : `🎯 ${gara.name} ${quando}`,
        mancano === 0
          ? `${gara.name}: è il giorno. Tutto il lavoro fatto è già in cassaforte, oggi si raccoglie. In bocca al lupo!`
          : `${gara.name} ${quando}. È il momento di verificare con il coach che la preparazione sia sulla strada giusta.`,
        chiave
      );
 
      // Al coach, così pianifica senza doverci pensare
      if (coach && coach.id !== gara.athlete_id) {
        await avvisa(
          coach.id,
          `🎯 ${nomeDi(gara.athlete_id)}: ${gara.name} ${quando}`,
          mancano === 0
            ? `${nomeDi(gara.athlete_id)} gareggia oggi in "${gara.name}".`
            : `La gara "${gara.name}" di ${nomeDi(gara.athlete_id)} ${quando}: valuta se il programma va adattato.`,
          `${chiave}_coach`
        );
      }
    }
 
    return NextResponse.json({ ok: true, gare: gare.length, avvisati });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore controllo gare' }, { status: 500 });
  }
}