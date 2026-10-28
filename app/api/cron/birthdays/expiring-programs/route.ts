// app/api/cron/expiring-programs/route.ts
 
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
 
const formatoIT = (chiave: string) => {
 
  const [a, m, g] = String(chiave || '').slice(0, 10).split('-');
 
  return a && m && g ? `${g}/${m}/${a}` : '';
 
};
 
 
export const dynamic = 'force-dynamic';
 
 
// Giorni prima della scadenza in cui avvisare (0 = il giorno stesso)
 
const TAPPE_ATLETA = [7, 0];
 
const TAPPE_COACH = [10, 7, 3, 1, 0];
 
const TAPPE = Array.from(new Set([...TAPPE_ATLETA, ...TAPPE_COACH]));
 
 
const quando = (n: number) => (n === 0 ? 'scade oggi' : n === 1 ? 'scade domani' : `scade fra ${n} giorni`);
 
 
// Crea la notifica (una sola volta per chiave) e manda la push
 
async function avvisa(origin: string, userId: string, titolo: string, testo: string, chiave: string, giaFatte?: Set<string>) {
 
  if (giaFatte && giaFatte.has(`${userId}|${chiave}`)) return false;
 
  const { data: gia } = await supabaseAdmin
 
    .from('notifications')
 
    .select('id')
 
    .eq('user_id', userId)
 
    .eq('notification_type', chiave)
 
    .limit(1);
 
  if (gia && gia.length > 0) return false;
 
 
  const { error } = await supabaseAdmin.from('notifications').insert([{
 
    user_id: userId,
 
    title: titolo,
 
    message: testo,
 
    notification_type: chiave,
 
    is_read: false,
 
    dismissed: false,
 
  }]);
 
  if (error) return false; // doppione bloccato dal database o altro errore: niente push
 
 
  await fetch(`${origin}/api/send-push`, {
 
    method: 'POST',
 
    headers: { 'Content-Type': 'application/json' },
 
    body: JSON.stringify({ user_id: userId, title: titolo, message: testo }),
 
  }).catch(() => {});
 
  if (giaFatte) giaFatte.add(`${userId}|${chiave}`);
 
  return true;
 
}
 
 
// ---- 1) PROGRAMMI IN SCADENZA ----
 
async function controllaScadenze(oggiKey: string, origin: string, atleti: any[], coaches: any[]) {
 
  const bersagli: { [giorno: string]: number } = {};
 
  TAPPE.forEach((n) => {
 
    bersagli[sommaGiorni(oggiKey, n)] = n;
 
  });
 
 
  const { data: programmi } = await supabaseAdmin
 
    .from('programs')
 
    .select('id,title,end_date,visibility,assigned_athlete_ids,trial_style,is_deleted')
 
    .in('end_date', Object.keys(bersagli));
 
 
  if (!programmi || programmi.length === 0) return { avvisati: 0, nota: 'nessun programma in scadenza' };
 
 
  const attivi = atleti.filter((a: any) => (a.subscription_status || 'prova') === 'attivo');
 
  let avvisati = 0;
 
 
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
 
      if (await avvisa(origin, athleteId, titolo, testo, `prog_expiring_${prog.id}_${mancano}_${oggiKey}`)) avvisati++;
 
    }
 
 
    // Al coach: 10, 7, 3, 1 giorni prima e il giorno stesso, uno per programma con i nomi degli atleti
 
    if (destinatari.length > 0 && TAPPE_COACH.includes(mancano)) {
 
      const nomi = destinatari
 
        .map((id: string) => atleti.find((a: any) => a.id === id)?.full_name || 'un atleta')
 
        .join(', ');
 
      const titoloCoach = mancano === 0 ? 'Programma in scadenza oggi' : 'Programma in scadenza';
 
      const testoCoach = prog.visibility === 'all'
 
        ? `"${prog.title || 'Programma'}" ${quando(mancano)} per tutti gli atleti attivi (${destinatari.length}). Valuta il rinnovo.`
 
        : `"${prog.title || 'Programma'}" di ${nomi} ${quando(mancano)}. Valuta il rinnovo.`;
 
      for (const coach of coaches) {
 
        if (await avvisa(origin, coach.id, titoloCoach, testoCoach, `prog_expiring_${prog.id}_${mancano}_${oggiKey}_coach`)) avvisati++;
 
      }
 
    }
 
  }
 
  return { avvisati };
 
}
 
 
// ---- 2) PROMEMORIA ANAMNESI (ogni 4 mesi, o se non l'ha mai compilata) ----
 
// Stesse chiavi e stessi testi dell'app: se l'atleta apre l'app dopo, vede il popup ma non riceve un secondo avviso.
 
const mesiDa = (baseKey: string, oggiKey: string) => {
 
  const [a1, m1, g1] = baseKey.split('-').map(Number);
 
  const [a2, m2, g2] = oggiKey.split('-').map(Number);
 
  let mesi = (a2 - a1) * 12 + (m2 - m1);
 
  if (g2 < g1) mesi -= 1;
 
  return Math.max(0, mesi);
 
};
 
async function controllaAnamnesi(oggiKey: string, origin: string, atleti: any[]) {
 
  const { data: anamnesi } = await supabaseAdmin.from('athlete_anamnesis').select('athlete_id,updated_at,created_at');
 
  const perAtleta: { [id: string]: any } = {};
 
  (anamnesi || []).forEach((r: any) => { perAtleta[r.athlete_id] = r; });
 
  let avvisati = 0;
 
  for (const a of atleti) {
 
    const r = perAtleta[a.id];
 
    const mancante = !r;
 
    const baseIso: string = r ? (r.updated_at || r.created_at || '') : (a.created_at || '');
 
    if (!baseIso) continue;
 
    const baseKey = ROMA(new Date(baseIso)).chiave;
 
    const mesi = Math.floor(mesiDa(baseKey, oggiKey) / 4) * 4;
 
    if (mesi < 4) continue;
 
    const chiave = mancante ? `anamnesi_reminder_missing_${mesi}` : `anamnesi_reminder_${mesi}_${String(baseIso).slice(0, 10)}`;
 
    const titolo = mancante ? 'Compila la tua anamnesi' : 'Rinnova la tua anamnesi';
 
    const testo = mancante
 
      ? 'Non hai ancora compilato la tua anamnesi. Ci vuole un minuto e aiuta il coach a costruire programmi adatti a te: vai su Profilo > Anamnesi.'
 
      : `Sono passati ${mesi} mesi dall'ultimo aggiornamento della tua anamnesi. Se è cambiato qualcosa, aggiornala da Profilo > Anamnesi.`;
 
    if (await avvisa(origin, a.id, titolo, testo, chiave)) avvisati++;
 
  }
 
  return { avvisati };
 
}
 
 
// ---- 3) "NUOVO PROGRAMMA ASSEGNATO" DI RISERVA ----
 
// Se l'avviso non è partito al momento dell'assegnazione (es. l'atleta è diventato attivo dopo,
 
// o il programma era una bozza), lo manda qui, anche ad app chiusa. Una volta sola per programma.
 
async function controllaAssegnati(oggiKey: string, origin: string, atleti: any[]) {
 
  const attivi = atleti.filter((a: any) => (a.subscription_status || 'prova') === 'attivo');
 
  if (attivi.length === 0) return { avvisati: 0 };
 
  const { data: programmi } = await supabaseAdmin.from('programs').select('*');
 
  // Avvisi già mandati: anche quelli vecchi con l'ora in fondo (program_assigned_81_1729...)
 
  const { data: gia } = await supabaseAdmin
 
    .from('notifications')
 
    .select('user_id,notification_type')
 
    .like('notification_type', 'program_assigned%');
 
  const giaMandati = (gia || []).map((n: any) => `${n.user_id}|${n.notification_type}`);
 
  const mandato = (uid: string, tipo: string) =>
 
    giaMandati.some((k) => k === `${uid}|${tipo}` || k.startsWith(`${uid}|${tipo}_`));
 
 
  let avvisati = 0;
 
  for (const prog of programmi || []) {
 
    if (prog.is_deleted || prog.trial_style || prog.visibility === 'none') continue;
 
    const fine = String(prog.end_date || '').slice(0, 10);
 
    if (fine && fine < oggiKey) continue; // già finito: niente avviso
 
    const destinatari: string[] =
 
      prog.visibility === 'all'
 
        ? attivi.map((a: any) => a.id)
 
        : (prog.assigned_athlete_ids || []).filter((id: string) => attivi.some((a: any) => a.id === id));
 
    const tipo = `program_assigned_${prog.id}`;
 
    const inizio = String(prog.start_date || '').slice(0, 10);
 
    const testo = `Ti è stato assegnato il programma "${prog.title || 'Programma'}"${inizio ? `, dal ${formatoIT(inizio)}` : ''}.`;
 
    for (const uid of destinatari) {
 
      if (mandato(uid, tipo)) continue;
 
      if (await avvisa(origin, uid, 'Nuovo programma assegnato', testo, tipo)) avvisati++;
 
    }
 
  }
 
  return { avvisati };
 
}
 
 
// ---- 4) PROMEMORIA FINE PROVA ----
 
// La prova dura 7 giorni dall'iscrizione (più gli eventuali giorni di proroga).
 
// All'atleta: 1 giorno prima della fine, 2 e 7 giorni dopo. Al coach: il giorno dopo la fine, con quanti allenamenti ha fatto.
 
// I testi sono quelli del Banner ("Promemoria fine prova"); un testo vuoto = quel promemoria non parte.
 
// Si fermano da soli appena l'atleta non è più "in prova".
 
const DURATA_PROVA_GIORNI = 7;
 
const TESTI_PROVA_PREDEFINITI = {
 
  prima: 'Domani finisce la tua settimana di prova. Vuoi continuare ad allenarti con il coach? Apri l\'app per scoprire come.',
 
  dopo2: 'La tua settimana di prova è finita: com\'è andata? Continua il tuo percorso da dove l\'hai lasciato.',
 
  dopo7: 'Ultimo promemoria: il coach è pronto a ripartire con te. Apri l\'app per continuare il percorso.',
 
  coach: 'La prova di {nome} è finita ieri: ha completato {fatti} allenamenti su {totali}. Contattalo.',
 
};
 
const giorniTra = (da: string, a: string) => {
 
  const [y1, m1, g1] = da.split('-').map(Number);
 
  const [y2, m2, g2] = a.split('-').map(Number);
 
  return Math.round((Date.UTC(y2, m2 - 1, g2) - Date.UTC(y1, m1 - 1, g1)) / 86400000);
 
};
 
const giornoFatto = (ris: any, wi: number, di: number, n: number) => {
 
  if (!n) return false;
 
  for (let bi = 0; bi < n; bi++) {
 
    const r = ris?.[`${wi}_${di}_${bi}`];
 
    if (!(r && (String(r.score || '').trim() || String(r.notes || '').trim() || r.done))) return false;
 
  }
 
  return true;
 
};
 
const settimaneDi = (p: any) => (p.weeks && p.weeks.length ? p.weeks : p.days && p.days.length ? [{ days: p.days }] : []);
 
 
async function controllaProve(oggiKey: string, origin: string, atleti: any[], coaches: any[]) {
 
  const inProva = atleti.filter((a: any) => (a.subscription_status || 'prova') === 'prova' && a.created_at);
 
  if (inProva.length === 0) return { avvisati: 0, nota: 'nessun atleta in prova' };
 
 
  const { data: impostazione } = await supabaseAdmin.from('settings').select('value').eq('key', 'trial_reminders').maybeSingle();
 
  const testi = { ...TESTI_PROVA_PREDEFINITI, ...((impostazione?.value as any) || {}) };
 
 
  let avvisati = 0;
 
  const manda = async (userId: string, titolo: string, testo: string, chiave: string) => {
 
    if (!String(testo || '').trim()) return; // testo vuoto nel Banner: quel promemoria non parte
 
    if (await avvisa(origin, userId, titolo, testo, chiave)) avvisati++;
 
  };
 
 
  for (const a of inProva) {
 
    const extra = parseInt(String(a.trial_extra_days ?? 0), 10) || 0;
 
    const fineKey = ROMA(new Date(new Date(a.created_at).getTime() + (DURATA_PROVA_GIORNI + extra) * 86400000)).chiave;
 
    const diff = giorniTra(fineKey, oggiKey); // -1 = domani finisce, 2 = finita da due giorni
 
    if (diff === -1) await manda(a.id, 'La tua prova sta per finire', testi.prima, `trial_rem_${a.id}_prima_${fineKey}`);
 
    if (diff === 2) await manda(a.id, 'Com\'è andata la prova?', testi.dopo2, `trial_rem_${a.id}_dopo2_${fineKey}`);
 
    if (diff === 7) await manda(a.id, 'Continua il tuo percorso', testi.dopo7, `trial_rem_${a.id}_dopo7_${fineKey}`);
 
    if (diff === 1 && coaches.length > 0) {
 
      // Quanti allenamenti della prova ha completato
 
      let fatti = 0;
 
      let totali = 0;
 
      if (a.trial_choice) {
 
        const { data: progs } = await supabaseAdmin
 
          .from('programs')
 
          .select('*')
 
          .eq('trial_style', a.trial_choice);
 
        const scelti = (progs || []).filter((p: any) => !p.is_deleted && (!p.trial_gender || p.trial_gender === (a.gender || 'm')));
 
        for (const p of scelti) {
 
          const { data: righe } = await supabaseAdmin
 
            .from('program_results')
 
            .select('results')
 
            .eq('program_id', p.id)
 
            .eq('athlete_id', a.id)
 
            .limit(1);
 
          const ris = righe?.[0]?.results || {};
 
          settimaneDi(p).forEach((w: any, wi: number) => {
 
            if (!w || w.hidden) return;
 
            (w.days || []).forEach((d: any, di: number) => {
 
              if (!d || d.hidden || !(d.blocks || []).length) return;
 
              totali++;
 
              if (giornoFatto(ris, wi, di, d.blocks.length)) fatti++;
 
            });
 
          });
 
        }
 
      }
 
      const nome = a.full_name || a.email || 'Un atleta';
 
      const testoCoach = String(testi.coach || '')
 
        .replace(/\{nome\}/g, nome)
 
        .replace(/\{fatti\}/g, String(fatti))
 
        .replace(/\{totali\}/g, String(totali));
 
      for (const c of coaches) {
 
        await manda(c.id, 'Prova terminata', testoCoach, `trial_rem_${a.id}_coach_${fineKey}`);
 
      }
 
    }
 
  }
 
  return { avvisati };
 
}
 
 
// ---- 5) ABBONAMENTI A PACCHETTO IN SCADENZA (es. 12 mesi) ----
 
// All'atleta (se attivo) e al coach: 30 giorni prima, 7 giorni prima e il giorno stesso.
 
const TAPPE_ABB = [30, 7, 0];
 
async function controllaAbbonamenti(oggiKey: string, origin: string, atleti: any[], coaches: any[]) {
 
  let avvisati = 0;
 
  for (const a of atleti) {
 
    if (a.abbonamento_tipo !== 'pacchetto' || !a.abbonamento_fine) continue;
 
    const fine = String(a.abbonamento_fine).slice(0, 10);
 
    const n = TAPPE_ABB.find((t) => sommaGiorni(oggiKey, t) === fine);
 
    if (n === undefined) continue;
 
    const quandoAbb = n === 0 ? 'scade oggi' : `scade fra ${n} giorni, il ${formatoIT(fine)}`;
 
    if ((a.subscription_status || 'prova') === 'attivo') {
 
      const titolo = n === 0 ? 'Il tuo abbonamento scade oggi' : 'Il tuo abbonamento sta per scadere';
 
      const testo = `Il tuo abbonamento ${quandoAbb}. Contatta il coach per rinnovarlo e continuare il tuo percorso.`;
 
      if (await avvisa(origin, a.id, titolo, testo, `abb_scad_${a.id}_${n}_${fine}`)) avvisati++;
 
    }
 
    const titoloCoach = n === 0 ? 'Abbonamento in scadenza oggi' : 'Abbonamento in scadenza';
 
    const testoCoach = `Il pacchetto di ${a.full_name || 'un atleta'} ${quandoAbb}. Valuta il rinnovo.`;
 
    for (const c of coaches) {
 
      if (await avvisa(origin, c.id, titoloCoach, testoCoach, `abb_scad_${a.id}_${n}_${fine}_coach`)) avvisati++;
 
    }
 
  }
 
  return { avvisati };
 
}
 
 
// ---- 6) AMT TEST ----
 
// All'atleta: 2 giorni prima della scadenza della sessione aperta, e quando sono passati 4 mesi dall'ultimo test.
 
// Al coach: quando sono passati 4 mesi dall'ultimo test di un atleta attivo.
 
const piuMesi = (chiave: string, n: number) => {
 
  const [a, m, g] = chiave.split('-').map(Number);
 
  return new Date(Date.UTC(a, m - 1 + n, g)).toISOString().split('T')[0];
 
};
 
async function controllaAmt(oggiKey: string, origin: string, atleti: any[], coaches: any[]) {
 
  const { data: sessioni, error } = await supabaseAdmin.from('amt_test_sessions').select('*');
 
  if (error) return { nota: 'tabella amt_test_sessions non trovata' };
 
  let avvisati = 0;
 
  const traDue = sommaGiorni(oggiKey, 2);
 
  for (const s of sessioni || []) {
 
    if (s.status === 'aperta' && String(s.deadline || '').slice(0, 10) === traDue) {
 
      const nome = s.prodotto === 'longevity' ? 'AMT Longevity' : s.prodotto === 'completo' ? 'AMT Performance Test + Longevity' : 'AMT Performance Test';
 
      if (await avvisa(origin, s.athlete_id, `${nome}: mancano 2 giorni`, `Hai tempo fino al ${formatoIT(traDue)} per completare il tuo ${nome}. Le prove non fatte non verranno conteggiate.`, `amt_scade_${s.id}`)) avvisati++;
 
    }
 
  }
 
  for (const a of atleti) {
 
    if ((a.subscription_status || 'prova') !== 'attivo') continue;
 
    const sue = (sessioni || []).filter((s: any) => s.athlete_id === a.id);
 
    if (sue.some((s: any) => s.status === 'aperta')) continue;
 
    const fatte = sue.filter((s: any) => s.status === 'completata' && s.completed_at).sort((x: any, y: any) => String(x.completed_at).localeCompare(String(y.completed_at)));
 
    if (fatte.length === 0) continue;
 
    const ultima = ROMA(new Date(fatte[fatte.length - 1].completed_at)).chiave;
 
    if (piuMesi(ultima, 4) !== oggiKey) continue;
 
    if (await avvisa(origin, a.id, 'È il momento di un nuovo test AMT', 'Sono passati 4 mesi dal tuo ultimo test AMT: rifallo per vedere quanto sei migliorato. Chiedi al coach di sbloccarlo.', `amt_4mesi_${a.id}_${ultima}`)) avvisati++;
 
    for (const c of coaches) {
 
      if (await avvisa(origin, c.id, 'AMT da rifare', `Sono passati 4 mesi dall’ultimo test AMT di ${a.full_name || 'un atleta'}: proponigli di rifarlo.`, `amt_4mesi_${a.id}_${ultima}_coach`)) avvisati++;
 
    }
 
  }
 
  return { avvisati };
 
}
 
 
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
 
    const origin = req.nextUrl.origin;
 
 
    const { data: atleti } = await supabaseAdmin
 
      .from('profiles')
 
      .select('*')
 
      .eq('role', 'athlete');
 
    const { data: coaches } = await supabaseAdmin
 
      .from('profiles')
 
      .select('id')
 
      .eq('role', 'coach');
 
 
    // Ognuno dei controlli va avanti anche se un altro dà errore
 
    const esegui = async (fn: () => Promise<any>) => {
 
      try { return await fn(); } catch (e: any) { return { errore: e?.message || String(e) }; }
 
    };
 
    const scadenze = await esegui(() => controllaScadenze(oggiKey, origin, atleti || [], coaches || []));
 
    const anamnesi = await esegui(() => controllaAnamnesi(oggiKey, origin, atleti || []));
 
    const assegnati = await esegui(() => controllaAssegnati(oggiKey, origin, atleti || []));
 
    const prove = await esegui(() => controllaProve(oggiKey, origin, atleti || [], coaches || []));
 
    const abbonamenti = await esegui(() => controllaAbbonamenti(oggiKey, origin, atleti || [], coaches || []));
 
    const amt = await esegui(() => controllaAmt(oggiKey, origin, atleti || [], coaches || []));
 
 
    return NextResponse.json({ ok: true, giorno: oggiKey, scadenze, anamnesi, assegnati, prove, abbonamenti, amt });
 
  } catch (err: any) {
 
    return NextResponse.json({ error: err.message || 'Errore controllo di mezzanotte' }, { status: 500 });
 
  }
 
}
 
 
