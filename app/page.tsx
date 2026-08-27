'use client';
 
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
// Funzione di utilità per formattare la data da aaaa-mm-gg a gg\mm\aaaa
const formatDateToIT = (dateString: string) => {
  if (!dateString) return 'N/D';
  // Gestisce sia il formato 'yyyy-mm-dd' che 'yyyy-mm-ddTHH:mm:ss...'
  const cleanDate = dateString.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}\\${month}\\${year}`;
  }
  return dateString;
};
 
const STRENGTH_EXERCISES = [
  'Back Squat', 'Deadlift', 'Front Squat', 'OHS', 'Press', 'Push Press', 
  'Push Jerk', 'Split Jerk', 'Power Snatch', 'Squat Snatch', 'Hang Power Snatch', 
  'Hang Squat Snatch', 'Power Clean', 'Squat Clean', 'Hang Power Clean', 
  'Hang Squat Clean', 'Clean & Jerk', 'Panca Piana'
];
 
const REP_SCHEMES = [1, 3, 5, 10];
 
const MOTIVATIONAL_QUOTES = [
  'Non devi essere il migliore. Devi solo essere meglio di ieri.',
  'La costanza batte l\'intensità. Sempre.',
  'Il corpo raggiunge ciò che la mente crede possibile.',
  'Ogni allenamento fatto è un mattone. La forza è la casa.',
  'Presentarsi è già metà del lavoro.',
  'I progressi non si vedono ogni giorno, ma si vedono ogni anno.',
  'Non contare i giorni: fai in modo che i giorni contino.',
  'La disciplina è ricordarsi cosa vuoi davvero.',
  'Allenati per come vuoi sentirti, non solo per come vuoi apparire.',
  'Il riposo fa parte del programma, non è una pausa dal programma.',
  'Piccoli passi ogni giorno battono grandi salti ogni tanto.',
  'La fatica di oggi è la facilità di domani.',
  'Sii paziente con i risultati e ostinato con le abitudini.',
  'Nessuno si è mai pentito di un allenamento fatto.',
  'La forza non arriva da ciò che sai fare, ma da ciò che superi.',
  'Concentrati sul processo: i risultati vengono da soli.',
  'Un buon allenamento oggi vale più di uno perfetto domani.',
  'Il tuo unico avversario è la versione di te di ieri.',
  'Ascolta il tuo corpo: sa quando spingere e quando fermarsi.',
  'La motivazione ti fa iniziare, l\'abitudine ti fa continuare.',
  'Non serve essere perfetti, serve essere presenti.',
  'Il progresso è progresso, per quanto piccolo.',
  'Ogni ripetizione conta, anche quella che non senti.',
  'Trasforma "devo allenarmi" in "posso allenarmi".',
  'La tecnica prima del carico. Sempre.',
  'Fidati del processo, anche quando i numeri non si muovono.',
  'Il recupero è dove avviene la crescita.',
  'Meglio costante al 70% che perfetto una volta al mese.',
  'Fatti trovare pronto: allenati anche quando non ne hai voglia.',
  'La versione più forte di te si costruisce un giorno alla volta.',
  'I muscoli crescono nel riposo, il carattere sotto il bilanciere.',
  'Chi si allena con metodo arriva più lontano di chi si allena con rabbia.',
  'Non sei in ritardo. Sei esattamente al chilometro che hai percorso.',
  'La prima serie è la più difficile: dopo decide il corpo.',
  'Un chilo in più sul bilanciere vale meno di una ripetizione fatta bene.',
  'Allenarsi è un privilegio, non una punizione.',
  'Il piano funziona solo se lo segui anche nei giorni storti.',
  'Meglio finire stanchi che iniziare perfetti e mollare.',
  'La forza è un\'abitudine travestita da talento.',
  'Rispetta i giorni di scarico: servono a farti spingere meglio dopo.',
  'Non paragonarti a chi si allena da dieci anni al suo primo mese.',
  'Il bilanciere non mente: ti dice sempre a che punto sei.',
  'Fai la cosa noiosa, ripetutamente. Lì stanno i risultati.',
  'Non è debolezza fermarsi: è intelligenza.',
  'Il mese che stai per mollare è spesso quello prima del salto.',
  'Chi migliora la mobilità, migliora tutto il resto.',
  'La scheda migliore è quella che riesci a seguire davvero.',
  'Dormire bene è allenamento invisibile.',
  'Ogni grande massimale è stato prima un riscaldamento.',
  'Il talento apre la porta, l\'abitudine ci abita dentro.',
  'Se oggi hai dato il 60%, è comunque più di zero.',
  'Il progresso non è lineare: sono scalini, non una rampa.',
  'La testa cede molto prima delle gambe.',
  'Impara ad amare il lavoro, non solo il risultato.',
  'Mangi, dormi, ti alleni: tre gambe dello stesso sgabello.',
  'La pazienza è il carico più pesante da sollevare.',
  'Il tuo record di oggi era il tuo sogno di un anno fa.',
  'Non allenarti per stancarti: allenati per migliorare.',
  'Chi conta le scuse non conta le serie.',
  'La forma segue la funzione: allena bene e il resto arriva.',
  'Torna sempre alle basi quando ti senti perso.',
  'Il tuo corpo è l\'unico posto in cui devi vivere per sempre.',
  'Una settimana storta non cancella tre mesi di lavoro.',
  'L\'allenamento migliore è quello che hai fatto.',
  'Costruisci la base larga: la punta verrà da sola.',
  'Fatica condivisa, risultati moltiplicati.',
  'Se fa male in modo sbagliato, fermati e chiedi.',
  'Nessun massimale vale un infortunio.',
  'La respirazione è il primo attrezzo che hai.',
  'Le grandi trasformazioni sono fatte di giorni ordinari.',
  'Non serve motivazione tutti i giorni: serve un piano.',
  'Il riscaldamento non è tempo perso, è tempo investito.',
  'Migliora l\'1% oggi. Fallo per un anno.',
  'La versione svogliata di te che si allena batte quella motivata che rimanda.',
  'Il peso che sollevi cambia. La testa che ci metti resta.',
  'Non allenare l\'ego: allena il movimento.',
  'Il tuo corpo si adatta a ciò che gli chiedi con costanza.',
  'Le scorciatoie portano dove non volevi andare.',
  'Vinci la giornata, poi pensa alla settimana.',
  'Chi impara ad ascoltarsi non si ferma mai troppo a lungo.',
  'Anche il recupero attivo è allenamento.',
  'Ogni serie è una conversazione tra te e il tuo limite.',
  'Non devi sentirti pronto: devi solo cominciare.',
  'Il progresso silenzioso è quello che dura.',
  'Meglio due allenamenti fatti bene che quattro fatti a metà.',
  'La forza gentile è comunque forza.',
  'Non c\'è una versione finale di te: solo la prossima.',
  'Alza il livello dell\'abitudine, non solo del carico.',
  'La differenza la fanno i giorni in cui non avevi voglia.',
  'Allenati oggi per potertelo permettere anche a 70 anni.',
];
 
function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const seed = dayOfYear + now.getFullYear() * 7;
  return MOTIVATIONAL_QUOTES[seed % MOTIVATIONAL_QUOTES.length];
}
 
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
 
const PRIVACY_VERSION = '1.0';
 
// ---- Calcolo carichi: percentuali, RPE, stima 1RM ----
 
const RPE_TABLE: { [rpe: string]: number[] } = {
  // indice 0 = 1 rep, indice 9 = 10 reps — percentuali del massimale (1RM)
  '10':  [100, 95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9],
  '9.5': [97.8, 93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3],
  '9':   [95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7],
  '8.5': [93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4],
  '8':   [92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0],
  '7.5': [90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 66.7],
  '7':   [89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 65.3],
  '6.5': [87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 66.7, 64.0],
  '6':   [86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 65.3, 62.6],
};
 
function parseWeightValue(s: any): number | null {
  if (s === null || s === undefined) return null;
  const m = String(s).replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return isNaN(v) ? null : v;
}
 
// Stima il massimale su 1 ripetizione partendo dai massimali inseriti (formula di Epley)
function estimate1RM(exMaxes: any): number | null {
  if (!exMaxes) return null;
  const direct = parseWeightValue(exMaxes[1]);
  if (direct) return direct;
  const candidates: number[] = [];
  [3, 5, 10].forEach((r) => {
    const w = parseWeightValue(exMaxes[r]);
    if (w) candidates.push(w * (1 + r / 30));
  });
  if (candidates.length === 0) return null;
  return candidates.reduce((a, b) => a + b, 0) / candidates.length;
}
 
function roundLoad(kg: number): number {
  return Math.round(kg / 2.5) * 2.5;
}
 
// Legge il campo "carico" e calcola il peso consigliato in kg
function computeLoadHint(loadText: any, repsText: any, exMaxes: any): string | null {
  if (!loadText) return null;
  const txt = String(loadText).trim();
  const reps = parseWeightValue(repsText) || 1;
  const oneRM = estimate1RM(exMaxes);
  const hasDirect1RM = exMaxes && parseWeightValue(exMaxes[1]);
 
  // Caso 1: percentuale, es. "80% 1RM", "80%5RM", "80%"
  const pctMatch = txt.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:di\s*)?(\d+)?\s*RM/i) || txt.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1].replace(',', '.'));
    const baseReps = pctMatch[2] ? parseInt(pctMatch[2]) : 1;
    let base: number | null = null;
    if (baseReps === 1) {
      base = oneRM;
    } else {
      base = parseWeightValue(exMaxes?.[baseReps]);
      if (!base && oneRM) {
        // se manca quel massimale, lo ricavo dal 1RM stimato
        base = oneRM / (1 + baseReps / 30);
      }
    }
    if (!base) return null;
    const kg = roundLoad((base * pct) / 100);
    const note = hasDirect1RM || baseReps !== 1 ? '' : ' (stimato)';
    return `≈ ${kg} kg${note}`;
  }
 
  // Caso 2: RPE, es. "RPE 8", "@8", "rpe8.5"
  const rpeMatch = txt.match(/(?:RPE|@)\s*(\d{1,2}(?:[.,]5)?)/i);
  if (rpeMatch && oneRM) {
    const rpeRaw = rpeMatch[1].replace(',', '.');
    const rpeVal = Math.min(10, Math.max(6, parseFloat(rpeRaw)));
    const key = (Math.round(rpeVal * 2) / 2).toString();
    const row = RPE_TABLE[key];
    if (!row) return null;
    const idx = Math.min(10, Math.max(1, Math.round(reps))) - 1;
    const pct = row[idx];
    const kg = roundLoad((oneRM * pct) / 100);
    return `≈ ${kg} kg indicativi (RPE ${rpeVal} × ${Math.round(reps)} rip.)`;
  }
 
  return null;
}
 
 
function AmtLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 802 538" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AMT" style={style}>
      <path fill="currentColor" fillRule="evenodd" d="M468.0,523.5L467.5,521.0L469.5,517.0L471.5,506.0L479.5,480.0L495.5,417.0L503.5,391.0L505.5,380.0L508.5,372.0L508.0,370.5L378.0,370.5L383.5,347.0L369.0,346.5L367.5,348.0L367.5,351.0L357.5,362.0L291.5,430.0L290.5,477.0L289.5,478.0L289.5,514.0L288.0,516.5L166.5,344.0L166.0,338.5L151.0,369.5L12.5,369.0L158.5,84.0L107.5,20.0L104.5,16.0L105.0,14.5L302.0,14.5L303.0,16.5L438.0,16.5L439.5,22.0L442.5,77.0L444.0,79.5L482.0,16.5L549.0,16.5L551.0,12.5L789.5,13.0L725.5,258.0L723.5,257.0L720.5,245.0L715.5,232.0L715.5,229.0L711.5,219.0L711.5,216.0L706.5,203.0L706.5,200.0L702.5,190.0L702.5,187.0L698.5,177.0L698.5,174.0L695.5,165.0L694.5,165.0L645.5,348.0L468.0,523.5Z M542.5,396.0L611.5,328.0L613.5,317.0L618.5,302.0L620.5,291.0L622.5,287.0L624.5,276.0L629.5,261.0L631.5,250.0L633.5,246.0L635.5,235.0L640.5,220.0L642.5,209.0L644.5,205.0L646.5,194.0L651.5,179.0L653.5,168.0L655.5,164.0L657.5,153.0L659.5,149.0L674.5,91.0L712.0,90.5L720.5,118.0L722.0,119.5L737.5,58.0L739.5,54.0L739.0,50.5L579.5,51.0L571.5,82.0L569.5,86.0L568.5,93.0L566.5,97.0L565.5,104.0L563.5,108.0L562.5,115.0L560.5,119.0L561.0,122.5L596.0,90.5L623.0,90.5L623.5,93.0L621.5,97.0L609.5,145.0L604.5,160.0L603.5,168.0L601.5,172.0L598.5,187.0L596.5,191.0L574.5,277.0L566.5,303.0L564.5,314.0L561.5,320.0L554.5,349.0L546.5,375.0L544.5,386.0L541.5,394.0L541.5,396.0L542.5,396.0Z M253.5,399.0L253.5,394.0L254.5,393.0L254.5,357.0L255.5,356.0L255.5,321.0L256.5,320.0L256.5,284.0L257.5,283.0L257.5,247.0L258.5,246.0L258.5,211.0L259.5,210.0L259.5,174.0L260.5,173.0L260.5,138.0L261.5,137.0L261.5,101.0L262.5,100.0L263.5,54.0L185.0,53.5L184.5,55.0L200.5,74.0L203.5,78.0L203.5,80.0L74.5,331.0L127.0,331.5L143.5,298.0L143.5,296.0L155.0,274.5L208.0,274.5L205.5,332.0L250.5,397.0L253.5,399.0Z M264.5,403.0L332.5,332.0L367.0,204.5L368.5,209.0L368.5,219.0L369.5,220.0L369.5,229.0L370.5,230.0L376.5,305.0L378.0,308.5L397.0,308.5L398.5,307.0L457.5,212.0L459.5,211.0L457.5,222.0L455.5,226.0L453.5,237.0L451.5,241.0L449.5,252.0L447.5,256.0L445.5,267.0L443.5,271.0L441.5,282.0L439.5,286.0L427.5,332.0L476.5,332.0L489.5,282.0L491.5,278.0L493.5,267.0L495.5,263.0L496.5,256.0L498.5,252.0L499.5,245.0L501.5,241.0L503.5,230.0L505.5,226.0L506.5,219.0L508.5,215.0L510.5,204.0L512.5,200.0L514.5,189.0L519.5,174.0L521.5,163.0L523.5,159.0L525.5,148.0L530.5,133.0L532.5,122.0L537.5,107.0L543.5,81.0L548.5,66.0L550.5,58.0L550.0,54.5L503.5,55.0L414.0,203.5L413.5,195.0L412.5,194.0L412.5,181.0L411.5,180.0L411.5,167.0L410.5,166.0L410.5,153.0L409.5,152.0L409.5,139.0L408.5,138.0L408.5,125.0L407.5,124.0L407.5,111.0L406.5,110.0L406.5,97.0L405.5,96.0L405.5,83.0L404.5,82.0L404.5,69.0L403.5,68.0L403.5,56.0L402.0,54.5L321.5,55.0L348.5,88.0L348.5,90.0L343.5,105.0L341.5,116.0L339.5,120.0L323.5,183.0L321.5,187.0L302.5,261.0L297.5,276.0L291.5,302.0L289.5,306.0L270.5,380.0L265.5,395.0L263.5,403.0L264.5,403.0Z M210.0,234.5L173.5,234.0L214.0,151.5L211.5,225.0L210.5,226.0L210.0,234.5Z" />
    </svg>
  );
}
 
function PrivacyPolicyContent() {
  const hStyle: React.CSSProperties = { color: '#10b981', fontSize: '14px', margin: '14px 0 4px 0' };
  const pStyle: React.CSSProperties = { margin: '0 0 8px 0', fontSize: '13px', lineHeight: 1.5, color: '#334155' };
  return (
    <div>
      <p style={{ ...pStyle, fontSize: '12px', color: '#64748b' }}>Versione {PRIVACY_VERSION} — Informativa ai sensi degli artt. 13 e 14 del Regolamento UE 2016/679 (GDPR)</p>
 
      <h4 style={hStyle}>1. Titolare del trattamento</h4>
      <p style={pStyle}>AM Training. Per qualsiasi richiesta relativa ai tuoi dati puoi scrivere all&apos;indirizzo email del titolare, che trovi nei contatti dell&apos;attività.</p>
 
      <h4 style={hStyle}>2. Quali dati raccogliamo</h4>
      <p style={pStyle}><strong>Dati identificativi e di contatto:</strong> nome e cognome, indirizzo email, data di nascita. La password è gestita e cifrata dal fornitore di autenticazione e non è mai visibile né al coach né a chi gestisce l&apos;app.</p>
      <p style={pStyle}><strong>Dati relativi alla salute:</strong> peso, altezza e il contenuto del campo &quot;problematiche fisiche o sistemiche&quot; dell&apos;anamnesi, in cui puoi indicare patologie, infortuni, limitazioni funzionali o terapie in corso.</p>
      <p style={pStyle}><strong>Dati di allenamento:</strong> obiettivi, numero e durata degli allenamenti settimanali, attrezzatura disponibile, programmi assegnati, punteggi e note inserite da te o dal coach, massimali di forza.</p>
      <p style={pStyle}><strong>Dati tecnici:</strong> se attivi le notifiche push, un identificativo tecnico del dispositivo; log di accesso generati automaticamente dai fornitori dell&apos;infrastruttura (indirizzo IP, data e ora).</p>
 
      <h4 style={hStyle}>3. Dati sanitari: trattamento specifico</h4>
      <p style={pStyle}>Peso, altezza e le problematiche fisiche o sistemiche che dichiari sono <strong>dati relativi alla salute</strong> e rientrano nelle categorie particolari di dati previste dall&apos;art. 9 del GDPR. Ricevono una tutela rafforzata.</p>
      <p style={pStyle}><strong>Base giuridica:</strong> il tuo consenso esplicito, ai sensi dell&apos;art. 9, par. 2, lett. a) del GDPR. Senza questo consenso non possiamo trattarli.</p>
      <p style={pStyle}><strong>Finalità:</strong> esclusivamente permettere al coach di valutare la tua condizione fisica e programmare allenamenti adeguati e sicuri, adattandoli a eventuali limitazioni. Non vengono usati per altri scopi.</p>
      <p style={pStyle}><strong>Chi vi accede:</strong> soltanto tu e il coach. Nessun altro atleta può vederli. Non vengono comunicati a terzi, né usati per profilazione commerciale o assicurativa.</p>
      <p style={pStyle}><strong>Facoltatività:</strong> l&apos;inserimento delle problematiche fisiche è una tua libera scelta. Puoi lasciare il campo vuoto: il servizio resta utilizzabile, ma il coach non potrà tenere conto di condizioni che non conosce. Per questo motivo ti invitiamo a segnalare quanto rilevante per la tua sicurezza.</p>
      <p style={pStyle}><strong>Nota importante:</strong> l&apos;app non è uno strumento medico e il coach non svolge attività sanitaria. I programmi proposti non sostituiscono in alcun modo il parere di un medico. Se hai patologie in corso, consulta il tuo medico prima di iniziare o modificare un programma di allenamento.</p>
 
      <h4 style={hStyle}>4. Basi giuridiche degli altri trattamenti</h4>
      <p style={pStyle}>I dati identificativi e di allenamento sono trattati per l&apos;esecuzione del rapporto tra te e il coach (art. 6, par. 1, lett. b). Le notifiche push si basano sul consenso che presti attivandole dal dispositivo.</p>
 
      <h4 style={hStyle}>5. Dove sono conservati i dati</h4>
      <p style={pStyle}>I dati sono conservati su infrastruttura Supabase (database e autenticazione) e Vercel (hosting), che agiscono come responsabili del trattamento e garantiscono misure di sicurezza adeguate. Qualora i dati transitino al di fuori dello Spazio Economico Europeo, il trasferimento avviene sulla base delle clausole contrattuali standard approvate dalla Commissione Europea.</p>
 
      <h4 style={hStyle}>6. Per quanto tempo</h4>
      <p style={pStyle}>I dati sono conservati per tutta la durata del rapporto e per il tempo successivamente necessario ad adempiere a obblighi di legge. Puoi richiedere la cancellazione in qualsiasi momento, anche direttamente dall&apos;app.</p>
 
      <h4 style={hStyle}>7. I tuoi diritti</h4>
      <p style={pStyle}>Puoi in qualsiasi momento: accedere ai tuoi dati e ottenerne copia; chiederne la rettifica o la cancellazione; limitarne od opporti al trattamento; ottenerne la portabilità in formato leggibile; revocare il consenso prestato.</p>
      <p style={pStyle}>Dalla sezione &quot;Privacy&quot; del tuo profilo puoi scaricare tutti i tuoi dati e richiedere l&apos;eliminazione dell&apos;account. Per le altre richieste scrivi al titolare, che risponderà entro 30 giorni.</p>
      <p style={pStyle}>Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).</p>
 
      <h4 style={hStyle}>8. Revoca del consenso</h4>
      <p style={pStyle}>La revoca del consenso ai dati sanitari non pregiudica la liceità del trattamento effettuato prima della revoca. Comporta però la cancellazione dei dati di salute già inseriti e l&apos;impossibilità, per il coach, di continuare a tenerne conto nella programmazione.</p>
 
      <h4 style={hStyle}>9. Minori</h4>
      <p style={pStyle}>Se hai meno di 18 anni, la registrazione e il consenso al trattamento dei dati di salute devono essere autorizzati da chi esercita la responsabilità genitoriale. In tal caso contatta direttamente il coach prima di proseguire.</p>
 
      <h4 style={hStyle}>10. Processo decisionale automatizzato</h4>
      <p style={pStyle}>Non viene effettuato alcun processo decisionale automatizzato né profilazione: i programmi di allenamento sono elaborati dal coach.</p>
    </div>
  );
}
 
 
export default function TrainingApp() {
 
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrato:', registration.scope);
        })
        .catch(error => {
          console.error('Errore registrazione Service Worker:', error);
        });
    }
  }, []);
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<'coach' | 'athlete'>('athlete');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupBirthDate, setSignupBirthDate] = useState('');
  const [signupWeight, setSignupWeight] = useState('');
  const [signupHeight, setSignupHeight] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const emptyPersonalData = { full_name: '', birth_date: '', weight: '', height: '' };
  const [personalData, setPersonalData] = useState<any>(emptyPersonalData);
  const [coachAllPersonalData, setCoachAllPersonalData] = useState<{ [athleteId: string]: any }>({});
  const [personalDataSaving, setPersonalDataSaving] = useState(false);
  const [privacyConsentAt, setPrivacyConsentAt] = useState<string | null>(null);
  const [showConsentGate, setShowConsentGate] = useState(false);
  const [consentGateChecked, setConsentGateChecked] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState(false);
  const [needsAnamnesis, setNeedsAnamnesis] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [dailyQuote, setDailyQuote] = useState('');
  const [prBadge, setPrBadge] = useState<{ exercise: string; reps: number; weight: number; previous: number | null } | null>(null);
  const [maxHistory, setMaxHistory] = useState<any[]>([]);
  const [historyExercise, setHistoryExercise] = useState('');
 
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(t);
  }, []);
 
  useEffect(() => {
    if (showSplash || !session) return;
    try {
      const seen = localStorage.getItem('amt_quote_shown');
      if (seen !== todayKey()) {
        setDailyQuote(getDailyQuote());
        localStorage.setItem('amt_quote_shown', todayKey());
      }
    } catch (e) {
      // Se il salvataggio locale non è disponibile, mostro comunque la frase
      setDailyQuote(getDailyQuote());
    }
  }, [showSplash, session]);
  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
 
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [programTitle, setProgramTitle] = useState('');
  const [programStartDate, setProgramStartDate] = useState('');
  const [programEndDate, setProgramEndDate] = useState('');
 
  const [collapsedBlocks, setCollapsedBlocks] = useState<{ [key: string]: boolean }>({});
  const [collapsedProgramDays, setCollapsedProgramDays] = useState<{ [key: string]: boolean }>({});
 
  const [selectedWeeksByProgram, setSelectedWeeksByProgram] = useState<{ [programId: string]: string }>({});
  const [selectedDaysByProgram, setSelectedDaysByProgram] = useState<{ [programId: string]: string }>({});
  
  const [coachSelectedWeek, setCoachSelectedWeek] = useState<{ [programId: string]: string }>({});
  const [coachSelectedDay, setCoachSelectedDay] = useState<{ [programId: string]: string }>({});
 
  const [bannerData, setBannerData] = useState<{ image_url: string; link_url: string }>({ image_url: '', link_url: '' });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);
 
  const [programWeeks, setProgramWeeks] = useState<any[]>([
    {
      weekNumber: 1,
      weekName: 'Settimana 1',
      days: [
        { dayNumber: 1, dayName: 'Giorno 1', blocks: [] }
      ]
    }
  ]);
 
  const [programLibrary, setProgramLibrary] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
 
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'exercises' | 'profile' | 'banner'>('create');
  const [coachSubView, setCoachSubView] = useState<'programs' | 'athletes' | 'personal' | 'banner'>('programs');
  const [personalSelectedAthleteId, setPersonalSelectedAthleteId] = useState('');
  const [personalExpandedProgramId, setPersonalExpandedProgramId] = useState<string | null>(null);
  const [coachAthleteDetailTab, setCoachAthleteDetailTab] = useState<'anagrafici' | 'maxes' | 'anamnesi'>('anagrafici');
  const [customMaxExercises, setCustomMaxExercises] = useState<{ id: string; name: string; dismissed: boolean }[]>([]);
  const [newMaxExerciseName, setNewMaxExerciseName] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState('');
  const [showExerciseManager, setShowExerciseManager] = useState(false);
  const [selectedCoachAthlete, setSelectedCoachAthlete] = useState<any | null>(null);
 
  const [selectedWeekView, setSelectedWeekView] = useState('Settimana 1');
  const [selectedDayView, setSelectedDayView] = useState('Giorno 1');
  
  const [libraryFilterAthlete, setLibraryFilterAthlete] = useState('');
 
  const [newExName, setNewExName] = useState('');
  const [newExVideo, setNewExVideo] = useState('');
 
  const [athleteResults, setAthleteResults] = useState<{ [key: string]: any }>({});
  const [coachAllResults, setCoachAllResults] = useState<{ [key: string]: any }>({});
 
  const [athleteMaxes, setAthleteMaxes] = useState<{ [exercise: string]: { [reps: number]: string } }>({});
  const [coachAthleteMaxes, setCoachAthleteMaxes] = useState<{ [athleteId: string]: any }>({});
  const [coachAllAnamnesis, setCoachAllAnamnesis] = useState<{ [athleteId: string]: any }>({});
  const emptyAnamnesis = { goal: '', weekly_sessions: '', session_duration: '', equipment: '', physical_issues: '' };
  const [anamnesis, setAnamnesis] = useState<any>(emptyAnamnesis);
  const [anamnesisSaving, setAnamnesisSaving] = useState(false);
  const [athleteProfileTab, setAthleteProfileTab] = useState<'anagrafici' | 'maxes' | 'anamnesi' | 'privacy'>('anagrafici');
 
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
 
  const [saveMessage, setSaveMessage] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
const [notificationError, setNotificationError] = useState('');
  const [showDeletedPrograms, setShowDeletedPrograms] = useState(false);
  const [showDeletedExercises, setShowDeletedExercises] = useState(false);
 
  const normalizeProgramWeeks = (prog: any) => {
    if (prog.weeks && prog.weeks.length > 0) return prog.weeks;
    if (prog.days && prog.days.length > 0) {
      return [{ weekNumber: 1, weekName: 'Settimana 1', days: prog.days }];
    }
    return [{ weekNumber: 1, weekName: 'Settimana 1', days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] }];
  };
 
  const getCalendarDaysDifference = (dateString: string) => {
    if (!dateString) return null;
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    if (!year || !month || !day) return null;
 
    const target = Date.UTC(year, month - 1, day);
    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
 
    return Math.round((target - todayUTC) / 86400000);
  };
 
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
 
    const { data, error } = await supabase
      .from('notifications')
      .select('id,user_id,title,message,notification_type,is_read,created_at')
      .eq('user_id', session.user.id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50);
 
    if (error) {
      console.error('Errore caricamento notifiche:', error);
      setNotificationError(error.message);
      return;
    }
 
    setNotificationError('');
 
    setNotifications(data || []);
  };
 
  const createNotificationIfMissing = async (
  title: string,
  message: string,
  notificationType: string,
  programId?: string
) => {
    if (!session?.user?.id) return;
 
    const { data: existing, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('notification_type', notificationType)
      .limit(1);
 
    if (checkError) {
      console.error('Errore controllo notifica:', checkError);
      setNotificationError(checkError.message);
      return;
    }
 
    if (existing && existing.length > 0) return;
 
    const { error } = await supabase.from('notifications').insert([{
  user_id: session.user.id,
  title,
  message,
  notification_type: notificationType,
  is_read: false,
  program_id: programId || null
}]);
 
    if (error) {
      console.error('Errore creazione notifica:', error);
      setNotificationError(error.message);
      return;
    }
 
    await fetchNotifications();
 
    fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id,
        title,
        message,
      }),
    }).catch(pushErr => console.error('Errore invio push:', pushErr));
  };
 
  const syncProgramNotifications = async () => {
    if (!session?.user?.id || !programLibrary.length) return;
 
    if (role === 'athlete') {
      const assignedPrograms = programLibrary.filter(
        (prog) => prog.assignedAthleteIds?.includes(session.user.id)
      );
 
      for (const prog of assignedPrograms) {
        await createNotificationIfMissing(
  'Nuovo programma assegnato',
  `Ti è stato assegnato il programma "${prog.title}"${prog.startDate ? `, dal ${formatDateToIT(prog.startDate)}` : ''}.`,
  `program_assigned_${prog.id}`,
  prog.id
);
      }
      return;
    }
 
    if (role === 'coach') {
      for (const prog of programLibrary) {
        if (!prog.endDate || !prog.assignedAthleteIds?.length) continue;
 
        const daysRemaining = getCalendarDaysDifference(prog.endDate);
        if (![10, 7, 2, 0].includes(daysRemaining as number)) continue;
 
        const dayText =
          daysRemaining === 0
            ? 'scade oggi'
            : `scade tra ${daysRemaining} giorni`;
 
        await createNotificationIfMissing(
          'Scadenza programma',
          `Il programma "${prog.title}" ${dayText} (data fine: ${formatDateToIT(prog.endDate)}).`,
          `program_deadline_${prog.id}_${daysRemaining}`
        );
      }
    }
  };
 
  const deleteNotification = async (notificationId: string) => {
  if (!session?.user?.id) return;
 
  const { error } = await supabase
    .from('notifications')
    .update({ dismissed: true })
    .eq('id', notificationId)
    .eq('user_id', session.user.id);
 
  if (error) {
    console.error('Errore eliminazione notifica:', error);
    setNotificationError(error.message);
    return;
  }
 
  setNotifications(prev =>
    prev.filter(n => n.id !== notificationId)
  );
 
  setNotificationError('');
};
 
  // ---- PUSH NOTIFICATIONS ----
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
 
  const subscribeToPush = async () => {
    if (!session?.user?.id) return;
 
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationError('Le notifiche push non sono supportate su questo dispositivo/browser.');
      return;
    }
 
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setNotificationError('Permesso notifiche negato.');
      return;
    }
 
    const registration = await navigator.serviceWorker.ready;
 
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      }));
 
    const subJson = subscription.toJSON();
 
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: session.user.id,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
      { onConflict: 'endpoint' }
    );
 
    if (error) {
      console.error('Errore salvataggio sottoscrizione push:', error);
      setNotificationError(error.message);
      return;
    }
 
    setNotificationError('');
  };
 
  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', session?.user?.id);
 
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };
 
  const markAllNotificationsAsRead = async () => {
    if (!session?.user?.id) return;
 
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
 
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };
 
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      setLoading(false);
    });
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });
 
    return () => subscription.unsubscribe();
  }, []);
 
  useEffect(() => {
    if (session) {
      fetchProgramLibrary();
      fetchExerciseLibrary();
      fetchBanner();
      fetchNotifications();
      fetchCustomMaxExercises();
      checkPrivacyConsent(session.user.id);
      if (role === 'coach') {
        fetchAthletes();
        fetchAllAthleteResultsForCoach();
        fetchAllAthleteMaxesForCoach();
        fetchAllAnamnesisForCoach();
        fetchAllPersonalDataForCoach();
      } else {
        fetchAthleteResults();
        fetchAthleteMaxes(session.user.id);
        fetchOwnAnamnesis(session.user.id);
        fetchPersonalData(session.user.id);
      }
 
      const channel = supabase
        .channel('realtime-programs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'programs' }, () => {
          fetchProgramLibrary();
        })
        .subscribe();
 
      const bannerChannel = supabase
        .channel('realtime-banner')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          fetchBanner();
        })
        .subscribe();
 
      const exChannel = supabase
        .channel('realtime-exercises')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'exercises_library' }, () => {
          fetchExerciseLibrary();
        })
        .subscribe();
 
      const resultsChannel = supabase
        .channel('realtime-results')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'program_results' }, () => {
          if (role === 'coach') fetchAllAthleteResultsForCoach();
        })
        .subscribe();
 
      const maxesChannel = supabase
        .channel('realtime-maxes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'athlete_maxes' }, () => {
          if (role === 'coach') fetchAllAthleteMaxesForCoach();
        })
        .subscribe();
 
      const notificationsChannel = supabase
        .channel('realtime-notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();
 
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(bannerChannel);
        supabase.removeChannel(exChannel);
        supabase.removeChannel(resultsChannel);
        supabase.removeChannel(maxesChannel);
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [session, role]);
 
  useEffect(() => {
    if (session && programLibrary.length > 0) {
      syncProgramNotifications();
    }
  }, [session, role, programLibrary]);
 
  useEffect(() => {
    if (programLibrary.length > 0) {
      const initialWeeks: { [id: string]: string } = {};
      const initialDays: { [id: string]: string } = {};
      
      programLibrary.forEach(prog => {
        const weeks = normalizeProgramWeeks(prog);
        if (weeks.length > 0 && !selectedWeeksByProgram[prog.id]) {
          initialWeeks[prog.id] = weeks[0].weekName;
          if (weeks[0].days && weeks[0].days.length > 0) {
            initialDays[prog.id] = weeks[0].days[0].dayName;
          }
        }
      });
      if (Object.keys(initialWeeks).length > 0) {
        setSelectedWeeksByProgram(prev => ({ ...initialWeeks, ...prev }));
        setSelectedDaysByProgram(prev => ({ ...initialDays, ...prev }));
      }
    }
  }, [programLibrary]);
 
  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  };
 
  const fetchAthletes = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'athlete');
    if (data) setAthletes(data);
  };
 
  const fetchBanner = async () => {
    const { data } = await supabase.from('settings').select('*').eq('key', 'app_banner').single();
    if (data && data.value) {
      setBannerData(data.value);
    }
  };
 
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSaving(true);
 
    let imageUrl = bannerData.image_url;
 
    try {
      if (bannerImageFile) {
        const fileExt = bannerImageFile.name.split('.').pop();
        const fileName = `banner_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
 
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(filePath, bannerImageFile);
 
        if (uploadError) throw uploadError;
 
        const { data: publicURLData } = supabase.storage
          .from('banners')
          .getPublicUrl(filePath);
 
        imageUrl = publicURLData.publicUrl;
      }
 
      const newBannerValue = { image_url: imageUrl, link_url: bannerData.link_url };
 
      const { error } = await supabase.from('settings').upsert({
        key: 'app_banner',
        value: newBannerValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
 
      if (error) throw error;
 
      setBannerData(newBannerValue);
      setBannerImageFile(null);
      alert('Banner aggiornato con successo!');
    } catch (err: any) {
      alert('Errore durante il salvataggio del banner: ' + err.message);
    } finally {
      setBannerSaving(false);
    }
  };
 
  const fetchProgramLibrary = async () => {
    const { data } = await supabase.from('programs').select('*');
    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        assignedAthleteIds: item.assigned_athlete_ids || (item.assigned_athlete_id ? [item.assigned_athlete_id] : []),
        isDeleted: item.is_deleted === true,
        weeks: normalizeProgramWeeks(item)
      }));
      setProgramLibrary(formatted);
    }
  };
 
  const fetchExerciseLibrary = async () => {
    const { data } = await supabase.from('exercises_library').select('*').order('name', { ascending: true });
    if (data) setExerciseLibrary(data);
  };
 
  const fetchAthleteResults = async () => {
    const { data } = await supabase.from('program_results').select('*').eq('athlete_id', session.user.id);
    if (data) {
      const resultsMap: { [key: string]: any } = {};
      data.forEach((item: any) => {
        resultsMap[item.program_id] = item.results || {};
      });
      setAthleteResults(resultsMap);
    }
  };
 
  const fetchAllAthleteResultsForCoach = async () => {
    const { data } = await supabase.from('program_results').select('*');
    if (data) {
      const map: { [key: string]: any } = {};
      data.forEach((item: any) => {
        if (!map[item.program_id]) map[item.program_id] = {};
        map[item.program_id][item.athlete_id] = item.results;
      });
      setCoachAllResults(map);
    }
  };
 
  const fetchAthleteMaxes = async (athleteId: string) => {
    const { data } = await supabase.from('athlete_maxes').select('*').eq('athlete_id', athleteId).single();
    if (data && data.maxes) {
      setAthleteMaxes(data.maxes);
    } else {
      setAthleteMaxes({});
    }
  };
 
  const fetchCustomMaxExercises = async () => {
    const { data } = await supabase.from('custom_max_exercises').select('id,name,dismissed').order('created_at', { ascending: true });
    if (data) {
      setCustomMaxExercises(data.map((item: any) => ({ id: item.id, name: item.name, dismissed: !!item.dismissed })));
    }
  };
 
  const addCustomMaxExercise = async () => {
    const name = newMaxExerciseName.trim();
    if (!name) return;
 
    if (STRENGTH_EXERCISES.includes(name)) {
      setNewMaxExerciseName('');
      return;
    }
 
    const existing = customMaxExercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (existing.dismissed) {
        await toggleDismissCustomMaxExercise(existing.id, false);
      }
      setNewMaxExerciseName('');
      return;
    }
 
    const { data, error } = await supabase.from('custom_max_exercises').insert([{ name }]).select('id,name,dismissed').single();
    if (!error && data) {
      setCustomMaxExercises([...customMaxExercises, { id: data.id, name: data.name, dismissed: false }]);
      setNewMaxExerciseName('');
    }
  };
 
  const renameCustomMaxExercise = async (id: string, newName: string) => {
    const name = newName.trim();
    if (!name) return;
 
    const { error } = await supabase.from('custom_max_exercises').update({ name }).eq('id', id);
    if (!error) {
      setCustomMaxExercises(customMaxExercises.map((e) => (e.id === id ? { ...e, name } : e)));
      setEditingExerciseId(null);
      setEditingExerciseName('');
    }
  };
 
  const toggleDismissCustomMaxExercise = async (id: string, dismissed: boolean) => {
    const { error } = await supabase.from('custom_max_exercises').update({ dismissed }).eq('id', id);
    if (!error) {
      setCustomMaxExercises(customMaxExercises.map((e) => (e.id === id ? { ...e, dismissed } : e)));
    }
  };
 
  const permanentlyDeleteMaxExercise = async (id: string) => {
    if (!confirm('Eliminare DEFINITIVAMENTE questo esercizio? Non sarà più possibile recuperarlo.')) return;
    const { error } = await supabase.from('custom_max_exercises').delete().eq('id', id);
    if (!error) {
      setCustomMaxExercises(customMaxExercises.filter((e) => e.id !== id));
    } else {
      alert('Errore durante l\'eliminazione definitiva: ' + error.message);
    }
  };
 
  const fetchAllAthleteMaxesForCoach = async () => {
    const { data } = await supabase.from('athlete_maxes').select('*');
    if (data) {
      const map: { [key: string]: any } = {};
      data.forEach((item: any) => {
        map[item.athlete_id] = item.maxes || {};
      });
      setCoachAthleteMaxes(map);
    }
  };
 
  const checkPrivacyConsent = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('privacy_consent_at').eq('id', userId).maybeSingle();
    const consent = data?.privacy_consent_at || session?.user?.user_metadata?.privacy_consent_at || null;
    setPrivacyConsentAt(consent);
 
    if (!consent) {
      setShowConsentGate(true);
    } else if (!data?.privacy_consent_at) {
      await supabase.from('profiles').update({ privacy_consent_at: consent }).eq('id', userId);
    }
  };
 
  const acceptPrivacyConsent = async () => {
    if (!consentGateChecked || !session?.user?.id) return;
    setConsentSaving(true);
    const now = new Date().toISOString();
    const { error } = await supabase.from('profiles').update({ privacy_consent_at: now }).eq('id', session.user.id);
    setConsentSaving(false);
    if (error) {
      alert('Errore durante il salvataggio del consenso: ' + error.message);
      return;
    }
    setPrivacyConsentAt(now);
    setShowConsentGate(false);
    setConsentGateChecked(false);
  };
 
  const downloadMyData = async () => {
    if (!session?.user?.id) return;
    setAccountActionLoading(true);
    try {
      const uid = session.user.id;
      const [prof, anam, maxes, results, subs, notifs] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
        supabase.from('athlete_anamnesis').select('*').eq('athlete_id', uid).maybeSingle(),
        supabase.from('athlete_maxes').select('*').eq('athlete_id', uid).maybeSingle(),
        supabase.from('program_results').select('*').eq('athlete_id', uid),
        supabase.from('push_subscriptions').select('endpoint,created_at').eq('user_id', uid),
        supabase.from('notifications').select('title,message,created_at').eq('user_id', uid),
      ]);
 
      const assigned = programLibrary
        .filter((p: any) => p.assignedAthleteIds?.includes(uid))
        .map((p: any) => ({ titolo: p.title, dataInizio: p.startDate, dataFine: p.endDate, settimane: p.weeks }));
 
      const payload = {
        esportato_il: new Date().toISOString(),
        account: { email: session.user.email, id: uid },
        dati_anagrafici: prof.data || null,
        anamnesi: anam.data || null,
        massimali: maxes.data || null,
        risultati_allenamenti: results.data || [],
        programmi_assegnati: assigned,
        dispositivi_notifiche: subs.data || [],
        notifiche_ricevute: notifs.data || [],
      };
 
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AMTraining_miei_dati_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Errore durante l\'esportazione: ' + (err.message || err));
    }
    setAccountActionLoading(false);
  };
 
  const deleteMyAccount = async () => {
    if (!session?.user?.id) return;
    if (!confirm('Vuoi eliminare definitivamente il tuo account e tutti i dati associati? L\'operazione non è reversibile.')) return;
    if (!confirm('Conferma finale: verranno cancellati anagrafica, anamnesi, massimali e risultati. Procedere?')) return;
 
    setAccountActionLoading(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || 'Errore sconosciuto');
      alert('Account eliminato. Verrai disconnesso.');
      await supabase.auth.signOut();
      setSession(null);
    } catch (err: any) {
      alert('Errore durante l\'eliminazione: ' + (err.message || err));
    }
    setAccountActionLoading(false);
  };
 
  const fetchPersonalData = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('full_name,birth_date,weight,height').eq('id', userId).maybeSingle();
 
    const meta = session?.user?.user_metadata || {};
    const merged = {
      full_name: data?.full_name || meta.full_name || '',
      birth_date: data?.birth_date || meta.birth_date || '',
      weight: data?.weight ?? meta.weight ?? '',
      height: data?.height ?? meta.height ?? ''
    };
    setPersonalData(merged);
 
    const needsSync =
      (!data?.birth_date && meta.birth_date) ||
      (data?.weight === null && meta.weight) ||
      (data?.height === null && meta.height) ||
      (!data?.full_name && meta.full_name);
 
    if (needsSync) {
      await supabase.from('profiles').update({
        full_name: merged.full_name,
        birth_date: merged.birth_date || null,
        weight: merged.weight ? parseFloat(merged.weight) : null,
        height: merged.height ? parseFloat(merged.height) : null
      }).eq('id', userId);
    }
  };
 
  const fetchAllPersonalDataForCoach = async () => {
    const { data } = await supabase.from('profiles').select('id,full_name,birth_date,weight,height').eq('role', 'athlete');
    if (data) {
      const map: { [key: string]: any } = {};
      data.forEach((item: any) => {
        map[item.id] = {
          full_name: item.full_name || '',
          birth_date: item.birth_date || '',
          weight: item.weight ?? '',
          height: item.height ?? ''
        };
      });
      setCoachAllPersonalData(map);
    }
  };
 
  const savePersonalData = async (userId: string, data: any, isCoachEditing: boolean) => {
    setPersonalDataSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: data.full_name,
      birth_date: data.birth_date || null,
      weight: data.weight ? parseFloat(data.weight) : null,
      height: data.height ? parseFloat(data.height) : null
    }).eq('id', userId);
    setPersonalDataSaving(false);
 
    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
      return;
    }
    if (isCoachEditing) {
      setCoachAllPersonalData({ ...coachAllPersonalData, [userId]: data });
      fetchAthletes();
    }
    alert('Dati anagrafici salvati con successo!');
  };
 
  const fetchAllAnamnesisForCoach = async () => {    const { data } = await supabase.from('athlete_anamnesis').select('*');
    if (data) {
      const map: { [key: string]: any } = {};
      data.forEach((item: any) => {
        map[item.athlete_id] = {
          goal: item.goal || '',
          weekly_sessions: item.weekly_sessions || '',
          session_duration: item.session_duration || '',
          equipment: item.equipment || '',
          physical_issues: item.physical_issues || ''
        };
      });
      setCoachAllAnamnesis(map);
    }
  };
 
  const fetchOwnAnamnesis = async (athleteId: string) => {
    const { data } = await supabase.from('athlete_anamnesis').select('*').eq('athlete_id', athleteId).maybeSingle();
    if (data) {
      setAnamnesis({
        goal: data.goal || '',
        weekly_sessions: data.weekly_sessions || '',
        session_duration: data.session_duration || '',
        equipment: data.equipment || '',
        physical_issues: data.physical_issues || ''
      });
    } else {
      setAnamnesis(emptyAnamnesis);
      // Prima volta: porta subito l'atleta a compilare l'anamnesi
      setNeedsAnamnesis(true);
      setActiveTab('profile');
      setAthleteProfileTab('anamnesi');
    }
  };
 
  const saveAnamnesis = async (athleteId: string, data: any, isCoachEditing: boolean) => {
    setAnamnesisSaving(true);
    const { error } = await supabase.from('athlete_anamnesis').upsert(
      {
        athlete_id: athleteId,
        goal: data.goal,
        weekly_sessions: data.weekly_sessions ? parseInt(data.weekly_sessions) : null,
        session_duration: data.session_duration,
        equipment: data.equipment,
        physical_issues: data.physical_issues,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'athlete_id' }
    );
    setAnamnesisSaving(false);
    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
      return;
    }
    if (isCoachEditing) {
      setCoachAllAnamnesis({ ...coachAllAnamnesis, [athleteId]: data });
    }
    if (!isCoachEditing) {
      setNeedsAnamnesis(false);
      fetch('/api/notify-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'anamnesi',
          title: 'Anamnesi aggiornata',
          message: `${personalData.full_name || session.user.email} ha compilato/aggiornato la sua anamnesi.`
        }),
      }).catch(err => console.error('Errore notifica anamnesi:', err));
    }
    alert('Anamnesi salvata con successo!');
  };
 
  const handleMaxChange = async (exercise: string, reps: number, value: string) => {
    const updatedEx = { ...(athleteMaxes[exercise] || {}), [reps]: value };
    const updatedAll = { ...athleteMaxes, [exercise]: updatedEx };
    setAthleteMaxes(updatedAll);
 
    await supabase.from('athlete_maxes').upsert(
      {
        athlete_id: session.user.id,
        maxes: updatedAll,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'athlete_id' }
    );
 
    const w = parseWeightValue(value);
    if (w) {
      await supabase.from('athlete_max_history').insert([{
        athlete_id: session.user.id,
        exercise,
        reps,
        value: w,
        source: 'manuale'
      }]);
      if (historyExercise === exercise) fetchMaxHistory(session.user.id, exercise);
    }
  };
 
  const fetchMaxHistory = async (athleteId: string, exercise: string) => {
    const { data } = await supabase
      .from('athlete_max_history')
      .select('reps,value,recorded_at')
      .eq('athlete_id', athleteId)
      .eq('exercise', exercise)
      .order('recorded_at', { ascending: true });
    setMaxHistory(data || []);
  };
 
  // Aggiorna il massimale se il peso inserito nella scheda supera quello registrato
  const maybeUpdateMaxFromScore = async (athleteId: string, exerciseName: string, repsText: any, scoreText: string, isCoachEditing: boolean) => {
    const weight = parseWeightValue(scoreText);
    const reps = parseWeightValue(repsText);
    if (!weight || !reps) return;
 
    const repsInt = Math.round(reps);
    if (!REP_SCHEMES.includes(repsInt)) return;
 
    const allNames = [...STRENGTH_EXERCISES, ...customMaxExercises.filter((e) => !e.dismissed).map((e) => e.name)];
    const match = allNames.find((n) => n.toLowerCase() === String(exerciseName || '').trim().toLowerCase());
    if (!match) return;
 
    const currentAll = isCoachEditing ? (coachAthleteMaxes[athleteId] || {}) : athleteMaxes;
    const currentEx = currentAll[match] || {};
    const previous = parseWeightValue(currentEx[repsInt]);
 
    if (previous !== null && weight <= previous) return;
 
    const updatedEx = { ...currentEx, [repsInt]: String(weight) };
    const updatedAll = { ...currentAll, [match]: updatedEx };
 
    const { error } = await supabase.from('athlete_maxes').upsert(
      { athlete_id: athleteId, maxes: updatedAll, updated_at: new Date().toISOString() },
      { onConflict: 'athlete_id' }
    );
    if (error) return;
 
    await supabase.from('athlete_max_history').insert([{
      athlete_id: athleteId,
      exercise: match,
      reps: repsInt,
      value: weight,
      source: 'scheda'
    }]);
 
    if (isCoachEditing) {
      setCoachAthleteMaxes({ ...coachAthleteMaxes, [athleteId]: updatedAll });
    } else {
      setAthleteMaxes(updatedAll);
    }
 
    setPrBadge({ exercise: match, reps: repsInt, weight, previous });
  };
 
  const handleResultChange = async (programId: string, blockKey: string, field: string, value: string, athleteIdOverride?: string, blockInfo?: { name?: string; reps?: any; type?: string }) => {
    if (athleteIdOverride) {
      // Il coach sta inserendo un risultato per conto di un atleto (es. durante il personal)
      const currentProgResults = coachAllResults[programId] || {};
      const currentAthleteResults = currentProgResults[athleteIdOverride] || {};
      const currentBlockResults = currentAthleteResults[blockKey] || { score: '', notes: '' };
 
      const updatedBlockResults = { ...currentBlockResults, [field]: value };
      const updatedAthleteResults = { ...currentAthleteResults, [blockKey]: updatedBlockResults };
      const updatedProgResults = { ...currentProgResults, [athleteIdOverride]: updatedAthleteResults };
 
      setCoachAllResults({ ...coachAllResults, [programId]: updatedProgResults });
 
      await supabase.from('program_results').upsert(
        {
          program_id: programId,
          athlete_id: athleteIdOverride,
          results: updatedAthleteResults,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'program_id, athlete_id' }
      );
 
      if (field === 'score' && blockInfo?.type === 'forza') {
        maybeUpdateMaxFromScore(athleteIdOverride, blockInfo.name || '', blockInfo.reps, value, true);
      }
      return;
    }
 
    const currentProgResults = athleteResults[programId] || {};
    const currentBlockResults = currentProgResults[blockKey] || { score: '', notes: '' };
 
    const updatedBlockResults = { ...currentBlockResults, [field]: value };
    const updatedProgResults = { ...currentProgResults, [blockKey]: updatedBlockResults };
 
    setAthleteResults({ ...athleteResults, [programId]: updatedProgResults });
 
    await supabase.from('program_results').upsert(
      {
        program_id: programId,
        athlete_id: session.user.id,
        results: updatedProgResults,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'program_id, athlete_id' }
    );
 
    if (field === 'score' && blockInfo?.type === 'forza') {
      maybeUpdateMaxFromScore(session.user.id, blockInfo.name || '', blockInfo.reps, value, false);
    }
  };
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };
 
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
 
    if (!privacyConsent) {
      setAuthError('Devi accettare l\'informativa sul trattamento dei dati personali per registrarti.');
      return;
    }
 
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          birth_date: signupBirthDate || null,
          weight: signupWeight || null,
          height: signupHeight || null,
          privacy_consent_at: new Date().toISOString()
        }
      }
    });
    if (error) {
      setAuthError(error.message);
    } else {
      try {
        await fetch('/api/notify-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_user',
            title: 'Nuovo utente registrato',
            message: `${fullName || email} si è appena registrato all'app.`
          }),
        });
      } catch (err) {
        console.error('Errore notifica nuovo utente:', err);
      }
 
      alert('Registrazione effettuata con successo!');
      setIsRegistering(false);
      setSignupBirthDate('');
      setSignupWeight('');
      setSignupHeight('');
      setPrivacyConsent(false);
    }
  };
 
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setResetMessage('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setResetMessage('Controlla la tua email per il link di recupero.');
    }
  };
 
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };
 
  const toggleBlockCollapse = (blockKey: string) => {
    setCollapsedBlocks(prev => {
      const currentValue = prev[blockKey] === undefined ? true : prev[blockKey];
      return { ...prev, [blockKey]: !currentValue };
    });
  };
 
  const toggleProgramDayCollapse = (key: string) => {
    setCollapsedProgramDays(prev => {
      const currentValue = prev[key] === undefined ? true : prev[key];
      return { ...prev, [key]: !currentValue };
    });
  };
 
  const toggleAthleteSelection = (athleteId: string, currentList: string[], setListFn: (list: string[]) => void) => {
    if (currentList.includes(athleteId)) {
      setListFn(currentList.filter(id => id !== athleteId));
    } else {
      setListFn([...currentList, athleteId]);
    }
  };
 
  const addWeek = () => {
    const nextNumber = programWeeks.length + 1;
    const newName = `Settimana ${nextNumber}`;
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated.push({ weekNumber: nextNumber, weekName: newName, days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] });
    setProgramWeeks(updated);
    setSelectedWeekView(newName);
    setSelectedDayView('Giorno 1');
  };
 
  const cloneWeek = (weekToClone: any) => {
    const nextNumber = programWeeks.length + 1;
    const clonedName = `${weekToClone.weekName} (Copia)`;
    const clonedDays = JSON.parse(JSON.stringify(weekToClone.days || []));
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated.push({ weekNumber: nextNumber, weekName: clonedName, days: clonedDays });
    setProgramWeeks(updated);
    setSelectedWeekView(clonedName);
    if (clonedDays.length > 0) setSelectedDayView(clonedDays[0].dayName);
  };
 
  const moveWeekOrder = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= programWeeks.length) return;
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setProgramWeeks(updated);
  };
 
  const addDay = (wIdx: number) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const targetWeek = updated[wIdx];
    const nextNumber = targetWeek.days.length + 1;
    const newName = `Giorno ${nextNumber}`;
    targetWeek.days.push({ dayNumber: nextNumber, dayName: newName, blocks: [] });
    setProgramWeeks(updated);
    setSelectedDayView(newName);
  };
 
  const cloneDay = (wIdx: number, dayToClone: any) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const targetWeek = updated[wIdx];
    const nextNumber = targetWeek.days.length + 1;
    const clonedName = `${dayToClone.dayName} (Copia)`;
    const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
    targetWeek.days.push({ dayNumber: nextNumber, dayName: clonedName, blocks: clonedBlocks });
    setProgramWeeks(updated);
    setSelectedDayView(clonedName);
  };
 
  const moveDayOrder = (wIdx: number, dayIdx: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? dayIdx - 1 : dayIdx + 1;
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const days = updated[wIdx].days;
    if (newIndex < 0 || newIndex >= days.length) return;
    const temp = days[dayIdx];
    days[dayIdx] = days[newIndex];
    days[newIndex] = temp;
    setProgramWeeks(updated);
  };
 
  const cloneEditingWeek = (weekToClone: any) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    if (!updated.weeks) updated.weeks = [];
    const clonedName = `${weekToClone.weekName} (Copia)`;
    const clonedDays = JSON.parse(JSON.stringify(weekToClone.days || []));
    updated.weeks.push({ weekNumber: updated.weeks.length + 1, weekName: clonedName, days: clonedDays });
    setEditingProgram(updated);
    setSelectedWeekView(clonedName);
    if (clonedDays.length > 0) setSelectedDayView(clonedDays[0].dayName);
  };
 
  const moveEditingWeekOrder = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = JSON.parse(JSON.stringify(editingProgram));
    if (newIndex < 0 || newIndex >= updated.weeks.length) return;
    const temp = updated.weeks[index];
    updated.weeks[index] = updated.weeks[newIndex];
    updated.weeks[newIndex] = temp;
    setEditingProgram(updated);
  };
 
  const addEditingDay = (wIdx: number) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const targetWeek = updated.weeks[wIdx];
    if (!targetWeek.days) targetWeek.days = [];
    const nextNumber = targetWeek.days.length + 1;
    const newName = `Giorno ${nextNumber}`;
    targetWeek.days.push({ dayNumber: nextNumber, dayName: newName, blocks: [] });
    setEditingProgram(updated);
    setSelectedDayView(newName);
  };
 
  const cloneEditingDay = (wIdx: number, dayToClone: any) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const targetWeek = updated.weeks[wIdx];
    const clonedName = `${dayToClone.dayName} (Copia)`;
    const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
    targetWeek.days.push({ dayNumber: targetWeek.days.length + 1, dayName: clonedName, blocks: clonedBlocks });
    setEditingProgram(updated);
    setSelectedDayView(clonedName);
  };
 
  const moveEditingDayOrder = (wIdx: number, dayIdx: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? dayIdx - 1 : dayIdx + 1;
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const days = updated.weeks[wIdx].days;
    if (newIndex < 0 || newIndex >= days.length) return;
    const temp = days[dayIdx];
    days[dayIdx] = days[newIndex];
    days[newIndex] = temp;
    setEditingProgram(updated);
  };
 
  const removeBlockFromFreeDay = (wIdx: number, dayIndex: number, blockIndex: number) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated[wIdx].days[dayIndex].blocks.splice(blockIndex, 1);
    setProgramWeeks(updated);
  };
 
  const moveFreeBlock = (wIdx: number, dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const blocks = [...updated[wIdx].days[dayIndex].blocks];
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const temp = blocks[blockIndex];
    blocks[blockIndex] = blocks[newIndex];
    blocks[newIndex] = temp;
    updated[wIdx].days[dayIndex].blocks = blocks;
    setProgramWeeks(updated);
  };
 
  const moveEditingBlock = (wIdx: number, dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const blocks = [...updated.weeks[wIdx].days[dayIndex].blocks];
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const temp = blocks[blockIndex];
    blocks[blockIndex] = blocks[newIndex];
    blocks[newIndex] = temp;
    updated.weeks[wIdx].days[dayIndex].blocks = blocks;
    setEditingProgram(updated);
  };
 
  const addGlobalExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName) return;
    const { error } = await supabase.from('exercises_library').insert([{ name: newExName, video_url: newExVideo }]);
    if (error) {
      alert('Errore: ' + error.message);
    } else {
      setNewExName('');
      setNewExVideo('');
      fetchExerciseLibrary();
    }
  };
 
  const deleteGlobalExercise = async (id: string) => {
    if (confirm('Vuoi spostare questo esercizio nel cestino?')) {
      await supabase.from('exercises_library').update({ dismissed: true }).eq('id', id);
      fetchExerciseLibrary();
    }
  };
 
  const restoreGlobalExercise = async (id: string) => {
    await supabase.from('exercises_library').update({ dismissed: false }).eq('id', id);
    fetchExerciseLibrary();
  };
 
  const permanentlyDeleteGlobalExercise = async (id: string) => {
    if (!confirm('Eliminare DEFINITIVAMENTE questo esercizio (incluso il video)? Non sarà più possibile recuperarlo.')) return;
    await supabase.from('exercises_library').delete().eq('id', id);
    fetchExerciseLibrary();
  };
 
  const addBlockToFreeDay = (wIdx: number, dayIndex: number) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated[wIdx].days[dayIndex].blocks.push({
      id: Date.now(), name: '', type: 'forza', sets: 4, reps: '10', load: '70%', rest: '90 sec', notes: '', wodNotes: '', videoUrl: ''
    });
    setProgramWeeks(updated);
  };
 
  const updateFreeBlock = (wIdx: number, dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated[wIdx].days[dayIndex].blocks[blockIndex][field] = value;
    setProgramWeeks(updated);
  };
 
  const saveProgramToLibrary = async () => {
    if (!programTitle) {
      alert('Inserisci un titolo per il programma');
      return;
    }
 
    const newProgram = {
      title: programTitle,
      start_date: programStartDate || null,
      end_date: programEndDate || null,
      assigned_athlete_ids: selectedAthleteIds,
      weeks: programWeeks,
      days: programWeeks[0]?.days || []
    };
 
    const { error } = await supabase.from('programs').insert([newProgram]);
 
    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
    } else {
      setSaveMessage('Programma salvato con successo!');
      setTimeout(() => setSaveMessage(''), 3000);
      setProgramTitle('');
      setProgramStartDate('');
      setProgramEndDate('');
      setSelectedAthleteIds([]);
      setProgramWeeks([{
        weekNumber: 1,
        weekName: 'Settimana 1',
        days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }]
      }]);
      fetchProgramLibrary();
    }
  };
 
  const duplicateProgram = async (prog: any) => {
    const duplicatedProgram = {
      title: `${prog.title} (Copia)`,
      start_date: prog.startDate || null,
      end_date: prog.endDate || null,
      assigned_athlete_ids: prog.assignedAthleteIds || [],
      weeks: prog.weeks || normalizeProgramWeeks(prog)
    };
 
    const { error } = await supabase.from('programs').insert([duplicatedProgram]);
 
    if (error) {
      alert('Errore: ' + error.message);
    } else {
      alert('Programma duplicato con successo!');
      fetchProgramLibrary();
    }
  };
 
  const updateEditingBlock = (wIdx: number, dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    updated.weeks[wIdx].days[dayIndex].blocks[blockIndex][field] = value;
    setEditingProgram(updated);
  };
 
  const addBlockToEditingDay = (wIdx: number, dayIndex: number) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    if (!updated.weeks[wIdx].days[dayIndex].blocks) updated.weeks[wIdx].days[dayIndex].blocks = [];
    updated.weeks[wIdx].days[dayIndex].blocks.push({
      id: Date.now(), name: '', type: 'forza', sets: 4, reps: '10', load: '70%', rest: '90 sec', notes: '', wodNotes: '', videoUrl: ''
    });
    setEditingProgram(updated);
  };
 
  const saveEditedProgram = async () => {
    if (!editingProgram.title) {
      alert('Il titolo non può essere vuoto');
      return;
    }
 
    const { error } = await supabase
      .from('programs')
      .update({
        title: editingProgram.title,
        start_date: editingProgram.startDate || null,
        end_date: editingProgram.endDate || null,
        assigned_athlete_ids: editingProgram.assignedAthleteIds || [],
        weeks: editingProgram.weeks,
        days: editingProgram.weeks[0]?.days || []
      })
      .eq('id', editingProgram.id);
 
    if (error) {
      alert('Errore: ' + error.message);
    } else {
      alert('Programma aggiornato con successo!');
      setEditingProgram(null);
      fetchProgramLibrary();
    }
  };
 
  const deleteProgram = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo programma?')) return;
    const { error } = await supabase.from('programs').update({ is_deleted: true }).eq('id', id);
    if (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
      return;
    }
    await fetchProgramLibrary();
  };
 
  const restoreProgram = async (id: string) => {
    if (!confirm('Vuoi ripristinare questo programma?')) return;
    const { error } = await supabase.from('programs').update({ is_deleted: false }).eq('id', id);
    if (error) {
      alert('Errore durante il ripristino: ' + error.message);
      return;
    }
    await fetchProgramLibrary();
  };
 
  const permanentlyDeleteProgram = async (id: string) => {
    if (!confirm('Eliminare DEFINITIVAMENTE questo programma? Non sarà più possibile recuperarlo.')) return;
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) {
      alert('Errore durante l\'eliminazione definitiva: ' + error.message);
      return;
    }
    await fetchProgramLibrary();
  };
 
  if (showSplash || loading) {
    return (
      <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '18px', fontFamily: 'sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&display=swap');
          @keyframes logoHeartbeat {
            0%   { transform: scale(1); }
            8%   { transform: scale(1.16); }
            16%  { transform: scale(1); }
            26%  { transform: scale(1.11); }
            36%  { transform: scale(1); }
            100% { transform: scale(1); }
          }
          @keyframes splashFade {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}</style>
        <AmtLogo style={{ width: '170px', height: 'auto', color: '#ffffff', display: 'block', transformOrigin: 'center center', animation: 'logoHeartbeat 1.3s ease-in-out infinite' }} />
        <div style={{ textAlign: 'center', animation: 'splashFade 1s ease-out 0.4s both' }}>
          <div style={{ color: '#10b981', fontSize: '34px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '3px', lineHeight: 1 }}>AMTraining</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', fontFamily: "'Permanent Marker', cursive", marginTop: '4px' }}>Improve Your Fitness</div>
        </div>
      </div>
    );
  }
 
  if (!session) {
    return (
      <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&display=swap');
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(14px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes logoHeartbeat {
            0%   { opacity: 1; transform: scale(1); }
            8%   { opacity: 1; transform: scale(1.16); }
            16%  { opacity: 1; transform: scale(1); }
            26%  { opacity: 1; transform: scale(1.11); }
            36%  { opacity: 1; transform: scale(1); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <AmtLogo style={{ width: '140px', height: 'auto', color: '#ffffff', display: 'block', transformOrigin: 'center center', marginBottom: '12px', animation: 'logoHeartbeat 1.3s ease-in-out infinite' }} />
          <h1 style={{ color: '#10b981', margin: 0, fontSize: '38px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '3px', animation: 'fadeInUp 0.6s ease-out 0.35s both' }}>AMTraining</h1>
          <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: "'Permanent Marker', cursive", marginTop: '4px', animation: 'fadeInUp 0.6s ease-out 0.5s both' }}>Improve Your Fitness</div>
        </div>
      
        <form onSubmit={isResettingPassword ? handlePasswordReset : (isRegistering ? handleSignUp : handleLogin)} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '12px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
          {!isResettingPassword && (
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
          )}
          {isRegistering && !isResettingPassword && (
            <>
              <input type="text" placeholder="Nome e Cognome" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                <input type="date" value={signupBirthDate} onChange={(e) => setSignupBirthDate(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={signupWeight} onChange={(e) => setSignupWeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={signupHeight} onChange={(e) => setSignupHeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                <input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  Ho letto e accetto l'
                  <button type="button" onClick={() => setShowPrivacyPolicy(true)} style={{ background: 'none', border: 'none', color: '#10b981', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px' }}>informativa privacy</button>
                  {' '}e acconsento al trattamento dei miei dati, inclusi quelli relativi allo stato di salute, per la programmazione degli allenamenti.
                </span>
              </label>
            </>
          )}
          {authError && <p style={{ color: '#ef4444', fontSize: '14px' }}>{authError}</p>}
          {resetMessage && <p style={{ color: '#10b981', fontSize: '14px' }}>{resetMessage}</p>}
          <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            {isResettingPassword ? 'Invia Richiesta' : (isRegistering ? 'Registrati' : 'Accedi')}
          </button>
        </form>
 
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
          {!isResettingPassword && (
            <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
              {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </button>
          )}
          <button onClick={() => { setIsResettingPassword(!isResettingPassword); setAuthError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
            {isResettingPassword ? 'Torna al Login' : 'Password dimenticata?'}
          </button>
        </div>
 
        {showPrivacyPolicy && (
          <div onClick={() => setShowPrivacyPolicy(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: '#ffffff', color: '#000', borderRadius: '12px', padding: '20px', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflowY: 'auto', fontSize: '13px', lineHeight: 1.5 }}>
              <h3 style={{ marginTop: 0, color: '#10b981' }}>Informativa sul trattamento dei dati personali</h3>
              <PrivacyPolicyContent />
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ marginTop: '10px', padding: '10px 16px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Chiudi</button>
            </div>
          </div>
        )}
      </div>
    );
  }
 
  const athletePrograms = programLibrary.filter(
    (prog) => !prog.isDeleted && (!prog.assignedAthleteIds || prog.assignedAthleteIds.length === 0 || prog.assignedAthleteIds.includes(session?.user?.id))
  );
 
  const filteredLibraryPrograms = programLibrary.filter((prog) => {
    if (showDeletedPrograms) {
      if (!prog.isDeleted) return false;
    } else if (prog.isDeleted) {
      return false;
    }
    if (!libraryFilterAthlete) return true;
    return prog.assignedAthleteIds?.includes(libraryFilterAthlete);
  });
 
  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&display=swap');`}</style>
 
      {prBadge && (
        <div onClick={() => setPrBadge(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1800 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg, #f59e0b 0%, #d97706 100%)', color: '#fff', borderRadius: '16px', padding: '28px 22px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.9, marginBottom: '10px', fontWeight: 'bold' }}>Nuovo record personale</div>
            <p style={{ fontSize: '19px', lineHeight: 1.4, margin: '0 0 6px 0', fontWeight: 'bold' }}>
              {prBadge.exercise} — {prBadge.weight} kg × {prBadge.reps}
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 20px 0', opacity: 0.95 }}>
              {prBadge.previous !== null
                ? `Hai superato il tuo ${prBadge.reps}RM precedente di ${Math.round((prBadge.weight - prBadge.previous) * 10) / 10} kg!`
                : `Primo ${prBadge.reps}RM registrato su questo esercizio!`}
            </p>
            <button onClick={() => setPrBadge(null)} style={{ padding: '12px 28px', borderRadius: '10px', background: '#ffffff', color: '#d97706', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              Grande! 💪
            </button>
          </div>
        </div>
      )}
 
      {dailyQuote && !showConsentGate && (
        <div onClick={() => setDailyQuote('')} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1500 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg, #10b981 0%, #059669 100%)', color: '#fff', borderRadius: '16px', padding: '28px 22px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>💪</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.85, marginBottom: '12px', fontWeight: 'bold' }}>Frase del giorno</div>
            <p style={{ fontSize: '18px', lineHeight: 1.45, margin: '0 0 22px 0', fontWeight: 'bold' }}>{dailyQuote}</p>
            <button onClick={() => setDailyQuote('')} style={{ padding: '12px 28px', borderRadius: '10px', background: '#ffffff', color: '#059669', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              Iniziamo
            </button>
          </div>
        </div>
      )}
 
      {showConsentGate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 2000 }}>
          <div style={{ background: '#ffffff', color: '#000', borderRadius: '12px', padding: '20px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#10b981' }}>Aggiornamento privacy</h3>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
              Abbiamo aggiornato l&apos;informativa sul trattamento dei dati personali. Poiché l&apos;app raccoglie anche dati relativi alla tua salute (peso, altezza, problematiche fisiche), la legge richiede un tuo consenso esplicito. Leggi l&apos;informativa e conferma per continuare a usare l&apos;app.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', maxHeight: '35vh', overflowY: 'auto', marginBottom: '14px' }}>
              <PrivacyPolicyContent />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155', lineHeight: 1.4, marginBottom: '14px' }}>
              <input type="checkbox" checked={consentGateChecked} onChange={(e) => setConsentGateChecked(e.target.checked)} style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>Ho letto l&apos;informativa e acconsento al trattamento dei miei dati personali, inclusi i dati relativi allo stato di salute, per la programmazione degli allenamenti.</span>
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={acceptPrivacyConsent}
                disabled={!consentGateChecked || consentSaving}
                style={{ flex: 1, minWidth: '140px', padding: '12px', borderRadius: '8px', background: consentGateChecked ? '#10b981' : '#cbd5e1', color: '#fff', fontWeight: 'bold', border: 'none', cursor: consentGateChecked ? 'pointer' : 'not-allowed', fontSize: '14px' }}
              >
                {consentSaving ? 'Salvataggio...' : 'Accetto e continuo'}
              </button>
              <button onClick={handleLogout} style={{ flex: 1, minWidth: '140px', padding: '12px', borderRadius: '8px', background: '#f1f5f9', color: '#000', fontWeight: 'bold', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '14px' }}>
                Esci
              </button>
            </div>
          </div>
        </div>
      )}
 
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AmtLogo style={{ width: '58px', height: 'auto', color: '#ffffff', flexShrink: 0 }} />
          <div>
            <h2 style={{ fontSize: '26px', color: '#10b981', margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '2px' }}>AMTraining</h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: "'Permanent Marker', cursive" }}>Improve Your Fitness</div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>{session.user.email} ({role})</span>
          </div>
        </div>
 
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              title="Notifiche"
              style={{
                position: 'relative',
                background: '#1e293b',
                border: '1px solid #334151',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              🔔
              {notifications.some(n => !n.is_read) && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '999px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0b0f19'
                }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
 
            {showNotifications && (
              <div style={{
                position: 'fixed',
                top: '72px',
                right: '12px',
                width: 'min(360px, calc(100vw - 24px))',
                maxHeight: 'min(70vh, 480px)',
                overflowY: 'auto',
                background: '#ffffff',
                color: '#000',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 16px 40px rgba(0,0,0,0.30)',
                zIndex: 9999,
                boxSizing: 'border-box'
              }}>
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{ fontSize: '14px' }}>Notifiche</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={subscribeToPush}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Ricevi notifiche anche ad app chiusa"
                    >
                      Attiva notifiche push
                    </button>
                    {notifications.some(n => !n.is_read) && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#10b981',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Segna tutte come lette
                      </button>
                    )}
                  </div>
                </div>
 
                {notificationError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', borderBottom: '1px solid #fecaca', lineHeight: 1.4 }}>
                    Errore notifiche: {notificationError}
                  </div>
                )}
 
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 14px', color: '#64748b', textAlign: 'center', fontSize: '13px' }}>
                    Nessuna notifica.
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
  key={notification.id}
  onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
  style={{
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    background: notification.is_read ? '#ffffff' : '#ecfdf5',
    cursor: notification.is_read ? 'default' : 'pointer',
    position: 'relative',
    paddingRight: '42px'
  }}
>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '13px',
                        color: notification.is_read ? '#334155' : '#047857',
                        marginBottom: '4px'
                      }}>
                        {notification.title}
                      </div>
                      <button
  onClick={(e) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  }}
  title="Elimina notifica"
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    padding: '2px',
    color: '#94a3b8'
  }}
>
  🗑️
</button>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        {notification.message}
                      </div>
                      {notification.created_at && (
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px' }}>
                          {new Date(notification.created_at).toLocaleString('it-IT')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
 
          <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334151', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Esci</button>
        </div>
      </header>
 
      {role === 'coach' ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => { setCoachSubView('programs'); setEditingProgram(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'programs' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Gestione Programmi</button>
            <button onClick={() => { setCoachSubView('athletes'); setSelectedCoachAthlete(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'athletes' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Profilo Utenti 👤</button>
            <button onClick={() => setCoachSubView('personal')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'personal' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Personal 📝</button>
            <button onClick={() => setCoachSubView('banner')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'banner' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Gestione Banner 📢</button>
          </div>
 
          {coachSubView === 'banner' ? (
            <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', color: '#10b981', marginBottom: '16px' }}>Gestione Banner Pubblicitario</h3>
              <form onSubmit={saveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Carica Nuova Immagine Banner:</label>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setBannerImageFile(e.target.files[0]); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#000' }} />
                </div>
                {bannerData.image_url && !bannerImageFile && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Immagine attuale:</span>
                    <img src={bannerData.image_url} alt="Current Banner" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #cbd5e1', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Link di destinazione:</label>
                  <input type="url" placeholder="https://tuosito.com" value={bannerData.link_url} onChange={(e) => setBannerData({ ...bannerData, link_url: e.target.value })} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#000', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={bannerSaving} style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
                  {bannerSaving ? 'Salvataggio in corso...' : 'Salva Banner'}
                </button>
              </form>
            </div>
          ) : coachSubView === 'athletes' ? (
            <div>
              {selectedCoachAthlete ? (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>{selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
                    <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
                  </div>
 
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setCoachAthleteDetailTab('anagrafici')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anagrafici' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anagrafici' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Dati Anagrafici</button>
                    <button onClick={() => setCoachAthleteDetailTab('maxes')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'maxes' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Massimali</button>
                    <button onClick={() => setCoachAthleteDetailTab('anamnesi')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Anamnesi 📋</button>
                  </div>
 
                  {coachAthleteDetailTab === 'anagrafici' && (() => {
                    const athData = coachAllPersonalData[selectedCoachAthlete.id] || emptyPersonalData;
                    const updateField = (field: string, value: string) => {
                      setCoachAllPersonalData({
                        ...coachAllPersonalData,
                        [selectedCoachAthlete.id]: { ...athData, [field]: value }
                      });
                    };
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Nome e Cognome</label>
                          <input type="text" value={athData.full_name} onChange={(e) => updateField('full_name', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Email</label>
                          <input type="text" value={selectedCoachAthlete.email || ''} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                          <input type="date" value={athData.birth_date} onChange={(e) => updateField('birth_date', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Peso (kg)</label>
                            <input type="number" step="0.1" min="0" value={athData.weight} onChange={(e) => updateField('weight', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Altezza (cm)</label>
                            <input type="number" step="0.1" min="0" value={athData.height} onChange={(e) => updateField('height', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <button
                          disabled={personalDataSaving}
                          onClick={() => savePersonalData(selectedCoachAthlete.id, athData, true)}
                          style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: personalDataSaving ? 0.6 : 1 }}
                        >
                          {personalDataSaving ? 'Salvataggio...' : 'Salva Dati Anagrafici'}
                        </button>
                      </div>
                    );
                  })()}
 
                  {coachAthleteDetailTab === 'maxes' && (
                  <div>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>🏋️ Elenco Esercizi Massimali (valido per tutti gli atleti)</span>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Nuovo esercizio (es. Bench Press)"
                          value={newMaxExerciseName}
                          onChange={(e) => setNewMaxExerciseName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') addCustomMaxExercise(); }}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}
                        />
                        <button onClick={addCustomMaxExercise} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
                      </div>
 
                      {customMaxExercises.length > 0 && (
                        <div>
                          <button onClick={() => setShowExerciseManager(!showExerciseManager)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                            {showExerciseManager ? '▲ Nascondi gestione esercizi aggiunti' : '▼ Gestisci esercizi aggiunti'}
                          </button>
 
                          {showExerciseManager && (
                            <div style={{ marginTop: '10px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {customMaxExercises.map((ex) => (
                                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: ex.dismissed ? 0.5 : 1 }}>
                                  {editingExerciseId === ex.id ? (
                                    <>
                                      <input
                                        type="text"
                                        value={editingExerciseName}
                                        onChange={(e) => setEditingExerciseName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') renameCustomMaxExercise(ex.id, editingExerciseName); }}
                                        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#000', fontSize: '12px' }}
                                        autoFocus
                                      />
                                      <button onClick={() => renameCustomMaxExercise(ex.id, editingExerciseName)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Salva</button>
                                      <button onClick={() => { setEditingExerciseId(null); setEditingExerciseName(''); }} style={{ background: '#e2e8f0', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Annulla</button>
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ flex: 1, fontSize: '13px', color: '#000', textDecoration: ex.dismissed ? 'line-through' : 'none' }}>{ex.name}{ex.dismissed ? ' (eliminato)' : ''}</span>
                                      {!ex.dismissed ? (
                                        <>
                                          <button onClick={() => { setEditingExerciseId(ex.id); setEditingExerciseName(ex.name); }} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️ Rinomina</button>
                                          <button onClick={() => toggleDismissCustomMaxExercise(ex.id, true)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️ Elimina</button>
                                        </>
                                      ) : (
                                        <>
                                          <button onClick={() => toggleDismissCustomMaxExercise(ex.id, false)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                                          <button onClick={() => permanentlyDeleteMaxExercise(ex.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Definitivo</button>
                                        </>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[...STRENGTH_EXERCISES, ...customMaxExercises.filter((e) => !e.dismissed).map((e) => e.name)].map((exName) => {
                      const exMaxes = coachAthleteMaxes[selectedCoachAthlete.id]?.[exName] || {};
                      return (
                        <div key={exName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px', marginBottom: '8px' }}>{exName}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {REP_SCHEMES.map((reps) => (
                              <div key={reps} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{reps} RM</span>
                                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>{exMaxes[reps] || '-'} kg</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                  )}
 
                  {coachAthleteDetailTab === 'anamnesi' && (() => {
                    const athAnamnesi = coachAllAnamnesis[selectedCoachAthlete.id] || emptyAnamnesis;
                    const updateField = (field: string, value: string) => {
                      setCoachAllAnamnesis({
                        ...coachAllAnamnesis,
                        [selectedCoachAthlete.id]: { ...athAnamnesi, [field]: value }
                      });
                    };
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
                          <textarea value={athAnamnesi.goal} onChange={(e) => updateField('goal', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
                          <select value={athAnamnesi.weekly_sessions} onChange={(e) => updateField('weekly_sessions', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                            <option value="">Seleziona...</option>
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
                          <select value={athAnamnesi.session_duration} onChange={(e) => updateField('session_duration', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                            <option value="">Seleziona...</option>
                            <option value="30'">30'</option>
                            <option value="1 ora">1 ora</option>
                            <option value="1 ora e 30'">1 ora e 30'</option>
                            <option value="2 ore">2 ore</option>
                            <option value="più di 2 ore">più di 2 ore</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
                          <textarea value={athAnamnesi.equipment} onChange={(e) => updateField('equipment', e.target.value)} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
                          <textarea value={athAnamnesi.physical_issues} onChange={(e) => updateField('physical_issues', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <button
                          disabled={anamnesisSaving}
                          onClick={() => saveAnamnesis(selectedCoachAthlete.id, athAnamnesi, true)}
                          style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
                        >
                          {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta</h3>
                  {athletes.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Nessun atleta registrato.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {athletes.map((a) => (
                        <div key={a.id} onClick={() => setSelectedCoachAthlete(a)} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{a.full_name || a.email}</span>
                          <span style={{ fontSize: '12px', color: '#10b981' }}>Visualizza Profilo →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : coachSubView === 'personal' ? (
            <div>
              {personalSelectedAthleteId ? (() => {
                const selAthlete = athletes.find((a: any) => a.id === personalSelectedAthleteId);
                const athletePersonalPrograms = programLibrary.filter(
                  (p: any) => !p.isDeleted && p.assignedAthleteIds?.includes(personalSelectedAthleteId)
                );
 
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Personal di: {selAthlete?.full_name || selAthlete?.email}</h3>
                      <button onClick={() => setPersonalSelectedAthleteId('')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cambia atleta</button>
                    </div>
 
                    {athletePersonalPrograms.length === 0 ? (
                      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ color: '#64748b' }}>Nessuna scheda assegnata a questo atleta.</p>
                      </div>
                    ) : (
                      athletePersonalPrograms.map((prog: any) => {
                        const weeks = normalizeProgramWeeks(prog);
                        const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                        const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
                        const activeDayName = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
                        const realWeekIndex = weeks.findIndex((w: any) => w.weekName === activeWeekName);
                        const activeDayObj = activeWeekObj?.days?.find((d: any) => d.dayName === activeDayName);
                        const realDayIndex = activeWeekObj?.days?.findIndex((d: any) => d.dayName === activeDayName);
 
                        return (
                          <div key={prog.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                            <div
                              onClick={() => setPersonalExpandedProgramId(personalExpandedProgramId === prog.id ? null : prog.id)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: personalExpandedProgramId === prog.id ? '12px' : '0' }}
                            >
                              <h4 style={{ margin: 0, color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                              <span style={{ fontSize: '18px', color: '#10b981', fontWeight: 'bold' }}>{personalExpandedProgramId === prog.id ? '▲' : '▼'}</span>
                            </div>
 
                            {personalExpandedProgramId === prog.id && (
                            <>
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                              {weeks.map((w: any) => (
                                <button
                                  key={w.weekName}
                                  onClick={() => {
                                    setCoachSelectedWeek(prev => ({ ...prev, [prog.id]: w.weekName }));
                                    if (w.days && w.days.length > 0) setCoachSelectedDay(prev => ({ ...prev, [prog.id]: w.days[0].dayName }));
                                  }}
                                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeWeekName === w.weekName ? '#0284c7' : '#e2e8f0', color: activeWeekName === w.weekName ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {w.weekName}
                                </button>
                              ))}
                            </div>
 
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', paddingBottom: '4px' }}>
                              {activeWeekObj?.days?.map((day: any) => (
                                <button
                                  key={day.dayName}
                                  onClick={() => setCoachSelectedDay(prev => ({ ...prev, [prog.id]: day.dayName }))}
                                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: activeDayName === day.dayName ? '#10b981' : '#f1f5f9', color: activeDayName === day.dayName ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {day.dayName}
                                </button>
                              ))}
                            </div>
 
                            {(!activeDayObj || !activeDayObj.blocks || activeDayObj.blocks.length === 0) ? (
                              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Nessun esercizio in questo giorno.</p>
                            ) : (
                              activeDayObj.blocks.map((blk: any, bIdx: number) => {
                                const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
                                const currentScore = coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.score || '';
                                const currentNotes = coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.notes || '';
 
                                return (
                                  <div key={bIdx} style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>{blk.name || `Esercizio ${bIdx + 1}`}</div>
 
                                    {blk.type === 'forza' ? (
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>SET</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.sets}</span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>REP</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.reps}</span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>CARICO</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.load}</span>
                                          {(() => {
                                            const hint = computeLoadHint(blk.load, blk.reps, coachAthleteMaxes[personalSelectedAthleteId]?.[blk.name]);
                                            return hint ? <span style={{ display: 'block', fontSize: '10px', color: '#0284c7', fontWeight: 'bold', marginTop: '2px' }}>{hint}</span> : null;
                                          })()}
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>REC.</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.rest}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</span>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
                                      </div>
                                    )}
 
                                    {blk.type === 'forza' && blk.notes && (
                                      <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '6px', border: '1px solid #fde68a', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '10px', color: '#92400e', fontWeight: 'bold', display: 'block' }}>NOTE ESERCIZIO (dal programma)</span>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155' }}>{blk.notes}</p>
                                      </div>
                                    )}
 
                                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 INSERISCI SCORE / NOTE (Personal):</span>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                        <div>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Score / Carico</label>
                                          <input type="text" placeholder="es. 100kg" value={currentScore} onChange={(e) => handleResultChange(prog.id, resultKey, 'score', e.target.value, personalSelectedAthleteId, { name: blk.name, reps: blk.reps, type: blk.type })} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Note del coach</label>
                                          <input type="text" placeholder="Sensazioni, tecnica..." value={currentNotes} onChange={(e) => handleResultChange(prog.id, resultKey, 'notes', e.target.value, personalSelectedAthleteId)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })() : (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta per il Personal</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {athletes.map((a: any) => (
                      <div
                        key={a.id}
                        onClick={() => setPersonalSelectedAthleteId(a.id)}
                        style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{a.full_name || a.email}</span>
                        <span style={{ fontSize: '12px', color: '#10b981' }}>Vai al Personal →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : editingProgram ? (
            <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Modifica Programma</h3>
                <button onClick={() => setEditingProgram(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Annulla</button>
              </div>
 
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Titolo Programma:</label>
              <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                  <input type="date" value={editingProgram.startDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                  <input type="date" value={editingProgram.endDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                </div>
              </div>
 
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}>
                  {athletes.map((a) => {
                    const currentAssigned = editingProgram.assignedAthleteIds || [];
                    return (
                      <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#000', marginBottom: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentAssigned.includes(a.id)}
                          onChange={() => {
                            const updatedList = currentAssigned.includes(a.id)
                              ? currentAssigned.filter((id: string) => id !== a.id)
                              : [...currentAssigned, a.id];
                            setEditingProgram({ ...editingProgram, assignedAthleteIds: updatedList });
                          }}
                        />
                        {a.full_name || a.email}
                      </label>
                    );
                  })}
                </div>
              </div>
 
              <div style={{ marginBottom: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {editingProgram.weeks?.map((week: any, wIdx: number) => {
                    const isSelected = selectedWeekView === week.weekName;
                    return (
                      <div key={wIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#ffffff', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {week.weekName}
                        </button>
                        <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                          <button onClick={() => moveEditingWeekOrder(wIdx, 'left')} disabled={wIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                          <button onClick={() => cloneEditingWeek(week)} title="Clona settimana" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                          <button onClick={() => moveEditingWeekOrder(wIdx, 'right')} disabled={wIdx === editingProgram.weeks.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === editingProgram.weeks.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === editingProgram.weeks.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              {editingProgram.weeks?.filter((w: any) => w.weekName === selectedWeekView).map((week: any) => {
                const actualWIdx = editingProgram.weeks.findIndex((w: any) => w.weekName === selectedWeekView);
 
                return (
                  <div key={actualWIdx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#e2e8f0', padding: '10px', borderRadius: '8px' }}>
                      <input
                        type="text"
                        value={week.weekName}
                        onChange={(e) => {
                          const updated = JSON.parse(JSON.stringify(editingProgram));
                          updated.weeks[actualWIdx].weekName = e.target.value;
                          setSelectedWeekView(e.target.value);
                          setEditingProgram(updated);
                        }}
                        style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', width: '200px' }}
                      />
                      {editingProgram.weeks.length > 1 && (
                        <button onClick={() => {
                          const updated = JSON.parse(JSON.stringify(editingProgram));
                          updated.weeks.splice(actualWIdx, 1);
                          setEditingProgram(updated);
                          if (updated.weeks.length > 0) {
                            setSelectedWeekView(updated.weeks[0].weekName);
                            if (updated.weeks[0].days?.length > 0) setSelectedDayView(updated.weeks[0].days[0].dayName);
                          }
                        }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Settimana</button>
                      )}
                    </div>
 
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                      {week.days?.map((day: any, dIdx: number) => {
                        const isSelected = selectedDayView === day.dayName;
                        return (
                          <div key={dIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#f1f5f9', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                              {day.dayName}
                            </button>
                            <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                              <button onClick={() => moveEditingDayOrder(actualWIdx, dIdx, 'left')} disabled={dIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                              <button onClick={() => cloneEditingDay(actualWIdx, day)} title="Clona giorno" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                              <button onClick={() => moveEditingDayOrder(actualWIdx, dIdx, 'right')} disabled={dIdx === week.days.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === week.days.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === week.days.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={() => addEditingDay(actualWIdx)} style={{ padding: '6px 12px', background: '#ffffff', border: '1px dashed #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Giorno</button>
                    </div>
 
                    {week.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
                      const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
                      return (
                        <div key={actualDIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                              <input
                                type="text"
                                value={day.dayName}
                                onChange={(e) => {
                                  const updated = JSON.parse(JSON.stringify(editingProgram));
                                  updated.weeks[actualWIdx].days[actualDIdx].dayName = e.target.value;
                                  setSelectedDayView(e.target.value);
                                  setEditingProgram(updated);
                                }}
                                style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', flex: 1 }}
                              />
                            </div>
                            {week.days.length > 1 && (
                              <button onClick={() => {
                                const updated = JSON.parse(JSON.stringify(editingProgram));
                                updated.weeks[actualWIdx].days.splice(actualDIdx, 1);
                                setEditingProgram(updated);
                                if (updated.weeks[actualWIdx].days.length > 0) setSelectedDayView(updated.weeks[actualWIdx].days[0].dayName);
                              }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Giorno</button>
                            )}
                          </div>
 
                          {day.blocks?.map((block: any, bIdx: number) => {
                            const blockKey = `edit_${actualWIdx}_${actualDIdx}_${bIdx}`;
                            const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                            return (
                              <div key={block.id || bIdx} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                    <button type="button" onClick={() => {
                                      const updated = JSON.parse(JSON.stringify(editingProgram));
                                      updated.weeks[actualWIdx].days[actualDIdx].blocks.splice(bIdx, 1);
                                      setEditingProgram(updated);
                                    }} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                  </div>
                                </div>
 
                                <div style={{ marginBottom: '10px' }}>
                                  {block.type === 'forza' ? (
                                    <div>
                                      <input
                                        type="text"
                                        list={`ex_list_edit_${actualWIdx}_${actualDIdx}_${bIdx}`}
                                        value={block.name || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updated = JSON.parse(JSON.stringify(editingProgram));
                                          updated.weeks[actualWIdx].days[actualDIdx].blocks[bIdx].name = val;
                                          const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                          if (foundEx && foundEx.video_url) {
                                            updated.weeks[actualWIdx].days[actualDIdx].blocks[bIdx].videoUrl = foundEx.video_url;
                                          }
                                          setEditingProgram(updated);
                                        }}
                                        placeholder="Inserisci o seleziona esercizio..."
                                        style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }}
                                      />
                                      <datalist id={`ex_list_edit_${actualWIdx}_${actualDIdx}_${bIdx}`}>
                                        {exerciseLibrary.filter((ex) => !ex.dismissed).map((ex) => (
                                          <option key={ex.id} value={ex.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  ) : (
                                    <input type="text" value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                  )}
                                </div>
 
                                {!isClosed && (
                                  <div>
                                    <div style={{ marginBottom: '10px' }}>
                                      <input type="url" value={block.videoUrl || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }} />
                                    </div>
                                    {block.type === 'forza' ? (
                                      <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                            <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                            <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                            <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                            <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                          <input type="text" value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                        <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <button onClick={() => addBlockToEditingDay(actualWIdx, actualDIdx)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
 
              <button onClick={saveEditedProgram} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>Salva Modifiche</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Crea Programma</button>
                <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Programmi</button>
                <button onClick={() => setActiveTab('exercises')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'exercises' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Esercizi 🏋️‍♂️</button>
              </div>
 
              {activeTab === 'exercises' ? (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>{showDeletedExercises ? 'Cestino Esercizi' : 'Gestione Libreria Esercizi'}</h3>
                    <button onClick={() => setShowDeletedExercises(!showDeletedExercises)} style={{ padding: '8px 10px', borderRadius: '8px', border: 'none', background: showDeletedExercises ? '#10b981' : '#64748b', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      {showDeletedExercises ? 'Torna agli esercizi' : '🗑️ Cestino'}
                    </button>
                  </div>
 
                  {!showDeletedExercises && (
                    <form onSubmit={addGlobalExercise} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #e2e8f0' }}>
                      <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                      <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                      <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
                    </form>
                  )}
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exerciseLibrary.filter((ex) => showDeletedExercises ? ex.dismissed : !ex.dismissed).length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{showDeletedExercises ? 'Cestino vuoto.' : 'Nessun esercizio in libreria.'}</p>
                    ) : (
                      exerciseLibrary.filter((ex) => showDeletedExercises ? ex.dismissed : !ex.dismissed).map((ex) => (
                        <div key={ex.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{ex.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{ex.video_url || 'Nessun video'}</div>
                          </div>
                          {showDeletedExercises ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => restoreGlobalExercise(ex.id)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                              <button onClick={() => permanentlyDeleteGlobalExercise(ex.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Definitivo</button>
                            </div>
                          ) : (
                            <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : activeTab === 'create' ? (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
                
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
                
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                      <input type="date" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                      <input type="date" value={programEndDate} onChange={(e) => setProgramEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                  </div>
 
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}>
                      {athletes.length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Nessun atleta disponibile.</span>
                      ) : (
                        athletes.map((a) => (
                          <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#000', marginBottom: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={selectedAthleteIds.includes(a.id)}
                              onChange={() => toggleAthleteSelection(a.id, selectedAthleteIds, setSelectedAthleteIds)}
                            />
                            {a.full_name || a.email}
                          </label>
                        ))
                      )}
                    </div>
                  </div>
 
                  <div style={{ marginBottom: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {programWeeks.map((week, wIdx) => {
                        const isSelected = selectedWeekView === week.weekName;
                        return (
                          <div key={wIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#ffffff', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                              {week.weekName}
                            </button>
                            <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                              <button onClick={() => moveWeekOrder(wIdx, 'left')} disabled={wIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                              <button onClick={() => cloneWeek(week)} title="Clona settimana" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                              <button onClick={() => moveWeekOrder(wIdx, 'right')} disabled={wIdx === programWeeks.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === programWeeks.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === programWeeks.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={addWeek} style={{ padding: '6px 12px', background: '#10b981', border: 'none', color: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Settimana</button>
                    </div>
                  </div>
 
                  {programWeeks.filter((w) => w.weekName === selectedWeekView).map((week) => {
                    const actualWIdx = programWeeks.findIndex((w) => w.weekName === selectedWeekView);
 
                    return (
                      <div key={actualWIdx} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#e2e8f0', padding: '10px', borderRadius: '8px' }}>
                          <input
                            type="text"
                            value={week.weekName}
                            onChange={(e) => {
                              const upd = JSON.parse(JSON.stringify(programWeeks));
                              upd[actualWIdx].weekName = e.target.value;
                              setSelectedWeekView(e.target.value);
                              setProgramWeeks(upd);
                            }}
                            style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', width: '200px' }}
                          />
                          {programWeeks.length > 1 && (
                            <button onClick={() => {
                              const upd = JSON.parse(JSON.stringify(programWeeks));
                              upd.splice(actualWIdx, 1);
                              setProgramWeeks(upd);
                              if (upd.length > 0) {
                                setSelectedWeekView(upd[0].weekName);
                                if (upd[0].days?.length > 0) setSelectedDayView(upd[0].days[0].dayName);
                              }
                            }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Settimana</button>
                          )}
                        </div>
 
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                          {week.days.map((day: any, dIdx: number) => {
                            const isSelected = selectedDayView === day.dayName;
                            return (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#f1f5f9', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                                <button onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  {day.dayName}
                                </button>
                                <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                                  <button onClick={() => moveDayOrder(actualWIdx, dIdx, 'left')} disabled={dIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                                  <button onClick={() => cloneDay(actualWIdx, day)} title="Clona giorno" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                                  <button onClick={() => moveDayOrder(actualWIdx, dIdx, 'right')} disabled={dIdx === week.days.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === week.days.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === week.days.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                                </div>
                              </div>
                            );
                          })}
                          <button onClick={() => addDay(actualWIdx)} style={{ padding: '6px 12px', background: '#ffffff', border: '1px dashed #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Giorno</button>
                        </div>
 
                        {week.days.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
                          const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
                          return (
                            <div key={actualDIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                                  <input
                                    type="text"
                                    value={day.dayName}
                                    onChange={(e) => {
                                      const upd = JSON.parse(JSON.stringify(programWeeks));
                                      upd[actualWIdx].days[actualDIdx].dayName = e.target.value;
                                      setSelectedDayView(e.target.value);
                                      setProgramWeeks(upd);
                                    }}
                                    style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', flex: 1 }}
                                  />
                                </div>
                                {week.days.length > 1 && (
                                  <button onClick={() => {
                                    const upd = JSON.parse(JSON.stringify(programWeeks));
                                    upd[actualWIdx].days.splice(actualDIdx, 1);
                                    setProgramWeeks(upd);
                                    if (upd[actualWIdx].days.length > 0) setSelectedDayView(upd[actualWIdx].days[0].dayName);
                                  }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Giorno</button>
                                )}
                              </div>
 
                              {day.blocks.map((block: any, bIdx: number) => {
                                const blockKey = `prog_${actualWIdx}_${actualDIdx}_${bIdx}`;
                                const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                                return (
                                  <div key={block.id} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                      <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                        <button type="button" onClick={() => removeBlockFromFreeDay(actualWIdx, actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                      </div>
                                    </div>
 
                                    <div style={{ marginBottom: '10px' }}>
                                      {block.type === 'forza' ? (
                                        <div>
                                          <input
                                            type="text"
                                            list={`ex_list_create_${actualWIdx}_${actualDIdx}_${bIdx}`}
                                            value={block.name || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', val);
                                              const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                              if (foundEx && foundEx.video_url) {
                                                updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', foundEx.video_url);
                                              }
                                            }}
                                            placeholder="Inserisci o seleziona esercizio..."
                                            style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }}
                                          />
                                          <datalist id={`ex_list_create_${actualWIdx}_${actualDIdx}_${bIdx}`}>
                                            {exerciseLibrary.filter((ex) => !ex.dismissed).map((ex) => (
                                              <option key={ex.id} value={ex.name} />
                                            ))}
                                          </datalist>
                                        </div>
                                      ) : (
                                        <input type="text" value={block.name} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                      )}
                                    </div>
 
                                    {!isClosed && (
                                      <div>
                                        <div style={{ marginBottom: '10px' }}>
                                          <input type="url" value={block.videoUrl || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }} />
                                        </div>
                                        {block.type === 'forza' ? (
                                          <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                                <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                                <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                                <input type="text" value={block.load} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                                <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                              <input type="text" value={block.notes} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                            <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <button onClick={() => addBlockToFreeDay(actualWIdx, actualDIdx)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
 
                  {saveMessage && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
                  <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0 }}>{showDeletedPrograms ? 'Cestino Programmi' : 'Libreria Programmi'}</h3>
  <button onClick={() => setShowDeletedPrograms(!showDeletedPrograms)} style={{ padding: '8px 10px', borderRadius: '8px', border: 'none', background: showDeletedPrograms ? '#10b981' : '#64748b', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
    {showDeletedPrograms ? 'Torna ai programmi' : '🗑️ Cestino'}
  </button>
                    <select value={libraryFilterAthlete} onChange={(e) => setLibraryFilterAthlete(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Filtra per utente (Tutti)</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                      ))}
                    </select>
                  </div>
 
                  {filteredLibraryPrograms.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>Nessun programma trovato.</p>
                  ) : (
                    filteredLibraryPrograms.map((prog) => {
                      const assignedList = athletes.filter((a) => prog.assignedAthleteIds?.includes(a.id));
                      const progResultsByAthlete = coachAllResults[prog.id] || {};
                      
                      const weeks = normalizeProgramWeeks(prog);
                      const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                      const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
                      const activeDay = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
 
                      return (
                        <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', color: assignedList.length > 0 ? '#0284c7' : '#000000', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                  Assegnato: {assignedList.length > 0 ? assignedList.map(a => a.full_name || a.email).join(', ') : 'Tutti (Generale)'}
                                </span>
                                {(prog.startDate || prog.endDate) && (
                                  <span style={{ fontSize: '11px', color: '#047857', background: '#d1fae5', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>
                                    📅 {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {showDeletedPrograms ? (
                                <>
                                  <button onClick={() => restoreProgram(prog.id)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                                  <button onClick={() => permanentlyDeleteProgram(prog.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ Elimina definitivamente</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => duplicateProgram(prog)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
                                  <button onClick={() => {
                                    const progToEdit = JSON.parse(JSON.stringify(prog));
                                    progToEdit.weeks = normalizeProgramWeeks(progToEdit);
                                    setEditingProgram(progToEdit);
                                    if (progToEdit.weeks.length > 0) {
                                      setSelectedWeekView(progToEdit.weeks[0].weekName);
                                      if (progToEdit.weeks[0].days?.length > 0) setSelectedDayView(progToEdit.weeks[0].days[0].dayName);
                                    }
                                  }} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
                                  <button onClick={() => deleteProgram(prog.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
                                </>
                              )}
                            </div>
                          </div>
 
                          <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📊 RISULTATI INSERITI DAGLI ATLETI:</span>
                            
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '4px' }}>
                              {weeks.map((w: any) => (
                                <button
                                  key={w.weekName}
                                  onClick={() => {
                                    setCoachSelectedWeek(prev => ({ ...prev, [prog.id]: w.weekName }));
                                    if (w.days && w.days.length > 0) setCoachSelectedDay(prev => ({ ...prev, [prog.id]: w.days[0].dayName }));
                                  }}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: activeWeekName === w.weekName ? '#0284c7' : '#cbd5e1', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {w.weekName}
                                </button>
                              ))}
                            </div>
 
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                              {activeWeekObj?.days?.map((day: any) => (
                                <button
                                  key={day.dayName}
                                  onClick={() => setCoachSelectedDay(prev => ({ ...prev, [prog.id]: day.dayName }))}
                                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeDay === day.dayName ? '#10b981' : '#e2e8f0', color: activeDay === day.dayName ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {day.dayName}
                                </button>
                              ))}
                            </div>
 
                            <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              {Object.keys(progResultsByAthlete).length === 0 ? (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>Nessun risultato registrato.</span>
                              ) : (
                                (() => {
                                  const wIndex = weeks.findIndex((w: any) => w.weekName === activeWeekName);
                                  const dayIndex = activeWeekObj?.days?.findIndex((d: any) => d.dayName === activeDay);
                                  if (wIndex === -1 || dayIndex === -1) return <span style={{ fontSize: '11px', color: '#64748b' }}>Seleziona un giorno valido.</span>;
                                  
                                  const blocksOfActiveDay = activeWeekObj.days[dayIndex].blocks || [];
                                  
                                  return athletes.map((ath) => {
                                    const resObj = progResultsByAthlete[ath.id];
                                    if (!resObj) return null;
 
                                    const hasResultsForThisDay = blocksOfActiveDay.some((_: any, bIdx: number) => {
                                      const blockKey = `${wIndex}_${dayIndex}_${bIdx}`;
                                      return resObj[blockKey]?.score || resObj[blockKey]?.notes;
                                    });
 
                                    if (!hasResultsForThisDay) return null;
                                    const athName = ath.full_name || ath.email;
 
                                    return (
                                      <div key={ath.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{athName}:</span>
                                        <div style={{ fontSize: '11px', color: '#334155', paddingLeft: '6px' }}>
                                          {blocksOfActiveDay.map((blk: any, bIdx: number) => {
                                            const blockKey = `${wIndex}_${dayIndex}_${bIdx}`;
                                            const blockData = resObj[blockKey];
                                            if (!blockData || (!blockData.score && !blockData.notes)) return null;
 
                                            return (
                                              <div key={bIdx} style={{ marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>• <strong style={{ color: '#000' }}>{blk.name || `Esercizio ${bIdx + 1}`}</strong>:</span>
                                                <span>
                                                  <strong style={{ color: '#10b981' }}>Score:</strong> {blockData.score || '-'} 
                                                  {blockData.notes && <span style={{ color: '#64748b', marginLeft: '6px' }}>(Note: {blockData.notes})</span>}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
 
          {bannerData.image_url && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              {bannerData.link_url ? (
                <a href={bannerData.link_url} target="_blank" rel="noopener noreferrer">
                  <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #1e293b', cursor: 'pointer' }} />
                </a>
              ) : (
                <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #1e293b' }} />
              )}
            </div>
          )}
 
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>I tuoi Allenamenti</button>
            <button onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'profile' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Il mio Profilo 👤</button>
          </div>
 
          {activeTab === 'profile' ? (
            <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setAthleteProfileTab('anagrafici')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'anagrafici' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'anagrafici' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Dati Anagrafici</button>
                <button onClick={() => setAthleteProfileTab('maxes')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'maxes' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Massimali</button>
                <button onClick={() => setAthleteProfileTab('anamnesi')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Anamnesi 📋</button>
                <button onClick={() => setAthleteProfileTab('privacy')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'privacy' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'privacy' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Privacy 🔒</button>
              </div>
 
              {athleteProfileTab === 'anagrafici' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>Dati Anagrafici</h3>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Nome e Cognome</label>
                    <input type="text" value={personalData.full_name} onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Email</label>
                    <input type="text" value={session.user.email || ''} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                    <input type="date" value={personalData.birth_date} onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Peso (kg)</label>
                      <input type="number" step="0.1" min="0" value={personalData.weight} onChange={(e) => setPersonalData({ ...personalData, weight: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Altezza (cm)</label>
                      <input type="number" step="0.1" min="0" value={personalData.height} onChange={(e) => setPersonalData({ ...personalData, height: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <button
                    disabled={personalDataSaving}
                    onClick={() => savePersonalData(session.user.id, personalData, false)}
                    style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: personalDataSaving ? 0.6 : 1 }}
                  >
                    {personalDataSaving ? 'Salvataggio...' : 'Salva Dati Anagrafici'}
                  </button>
                </div>
              )}
 
              {athleteProfileTab === 'maxes' && (
              <>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#10b981' }}>I tuoi Massimali di Forza</h3>
 
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>📈 Storico progressione</span>
                <select
                  value={historyExercise}
                  onChange={(e) => {
                    setHistoryExercise(e.target.value);
                    if (e.target.value) fetchMaxHistory(session.user.id, e.target.value);
                    else setMaxHistory([]);
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '10px' }}
                >
                  <option value="">Scegli un esercizio...</option>
                  {[...STRENGTH_EXERCISES, ...customMaxExercises.filter((e) => !e.dismissed).map((e) => e.name)].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
 
                {historyExercise && (maxHistory.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Nessuno storico ancora per questo esercizio. Verrà registrato ogni volta che aggiorni un massimale o batti un record dalla scheda.</p>
                ) : (
                  <div>
                    {REP_SCHEMES.map((r) => {
                      const pts = maxHistory.filter((h: any) => h.reps === r);
                      if (pts.length < 1) return null;
                      const vals = pts.map((p: any) => p.value);
                      const minV = Math.min(...vals);
                      const maxV = Math.max(...vals);
                      const range = maxV - minV || 1;
                      const W = 300, H = 70;
                      const step = pts.length > 1 ? W / (pts.length - 1) : 0;
                      const coords = pts.map((p: any, i: number) => {
                        const x = pts.length > 1 ? i * step : W / 2;
                        const y = H - ((p.value - minV) / range) * (H - 12) - 6;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      });
                      const first = pts[0].value;
                      const last = pts[pts.length - 1].value;
                      const delta = Math.round((last - first) * 10) / 10;
                      return (
                        <div key={r} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}>{r} RM</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: delta > 0 ? '#10b981' : '#64748b' }}>
                              {last} kg {delta > 0 ? `(+${delta})` : ''}
                            </span>
                          </div>
                          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '70px', display: 'block' }}>
                            <polyline points={coords.join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                            {pts.map((p: any, i: number) => {
                              const x = pts.length > 1 ? i * step : W / 2;
                              const y = H - ((p.value - minV) / range) * (H - 12) - 6;
                              return <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />;
                            })}
                          </svg>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                            <span>{new Date(pts[0].recorded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                            <span>{new Date(pts[pts.length - 1].recorded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...STRENGTH_EXERCISES, ...customMaxExercises.filter((e) => !e.dismissed).map((e) => e.name)].map((exName) => (
                  <div key={exName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px', marginBottom: '10px' }}>{exName}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {REP_SCHEMES.map((reps) => (
                        <div key={reps} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{reps} RM (kg)</label>
                          <input type="text" placeholder="kg" value={athleteMaxes[exName]?.[reps] || ''} onChange={(e) => handleMaxChange(exName, reps, e.target.value)} style={{ width: '100%', padding: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}
 
              {athleteProfileTab === 'anamnesi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {needsAnamnesis && (
                    <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', padding: '14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e40af', display: 'block', marginBottom: '4px' }}>👋 Benvenuto in AM Training!</span>
                      <span style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: 1.4 }}>
                        Prima di iniziare, compila la tua anamnesi: serve al coach per costruire un programma adatto a te e sicuro. Ci vuole un minuto.
                      </span>
                    </div>
                  )}
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>Anamnesi</h3>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
                    <textarea value={anamnesis.goal} onChange={(e) => setAnamnesis({ ...anamnesis, goal: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
                    <select value={anamnesis.weekly_sessions} onChange={(e) => setAnamnesis({ ...anamnesis, weekly_sessions: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Seleziona...</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
                    <select value={anamnesis.session_duration} onChange={(e) => setAnamnesis({ ...anamnesis, session_duration: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Seleziona...</option>
                      <option value="30'">30'</option>
                      <option value="1 ora">1 ora</option>
                      <option value="1 ora e 30'">1 ora e 30'</option>
                      <option value="2 ore">2 ore</option>
                      <option value="più di 2 ore">più di 2 ore</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
                    <textarea value={anamnesis.equipment} onChange={(e) => setAnamnesis({ ...anamnesis, equipment: e.target.value })} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
                    <textarea value={anamnesis.physical_issues} onChange={(e) => setAnamnesis({ ...anamnesis, physical_issues: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <button
                    disabled={anamnesisSaving}
                    onClick={() => saveAnamnesis(session.user.id, anamnesis, false)}
                    style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
                  >
                    {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
                  </button>
                </div>
              )}
 
              {athleteProfileTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>Privacy e dati personali</h3>
 
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '4px' }}>Stato del consenso</span>
                    <span style={{ fontSize: '13px', color: '#334155' }}>
                      {privacyConsentAt
                        ? `Consenso prestato il ${new Date(privacyConsentAt).toLocaleDateString('it-IT')} (informativa v${PRIVACY_VERSION})`
                        : 'Consenso non ancora registrato.'}
                    </span>
                  </div>
 
                  <div>
                    <button onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                      {showPrivacyPolicy ? '▲ Nascondi informativa' : '▼ Leggi l\'informativa completa'}
                    </button>
                    {showPrivacyPolicy && (
                      <div style={{ marginTop: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', maxHeight: '400px', overflowY: 'auto' }}>
                        <PrivacyPolicyContent />
                      </div>
                    )}
                  </div>
 
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>📥 Scarica i tuoi dati</span>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>Ottieni una copia completa di tutti i dati che ti riguardano (anagrafica, anamnesi, massimali, risultati, programmi assegnati) in un file leggibile.</p>
                    <button onClick={downloadMyData} disabled={accountActionLoading} style={{ padding: '10px 16px', borderRadius: '8px', background: '#0284c7', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: accountActionLoading ? 0.6 : 1 }}>
                      {accountActionLoading ? 'Attendere...' : 'Scarica i miei dati'}
                    </button>
                  </div>
 
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#991b1b', display: 'block', marginBottom: '6px' }}>🗑️ Elimina il tuo account</span>
                    <p style={{ fontSize: '12px', color: '#7f1d1d', margin: '0 0 10px 0', lineHeight: 1.4 }}>Cancella definitivamente l&apos;account e tutti i dati associati: anagrafica, anamnesi, massimali e risultati. L&apos;operazione non è reversibile.</p>
                    <button onClick={deleteMyAccount} disabled={accountActionLoading} style={{ padding: '10px 16px', borderRadius: '8px', background: '#dc2626', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: accountActionLoading ? 0.6 : 1 }}>
                      {accountActionLoading ? 'Attendere...' : 'Elimina account'}
                    </button>
                  </div>
 
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                    Per rettificare i dati, limitare o opporti al trattamento, revocare il consenso o per qualsiasi altra richiesta, contatta il coach. Hai diritto di proporre reclamo al Garante per la protezione dei dati personali.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>I tuoi allenamenti</h3>
              {athletePrograms.length === 0 ? (
                <div style={{ background: '#ffffff', color: '#000', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', margin: 0 }}>Nessun allenamento assegnato al momento.</p>
                </div>
              ) : (
                athletePrograms.map((prog) => {
                  const weeks = normalizeProgramWeeks(prog);
                  const currentProgramActiveWeek = selectedWeeksByProgram[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                  const currentWeekObj = weeks.find((w: any) => w.weekName === currentProgramActiveWeek) || weeks[0];
                  const currentProgramActiveDay = selectedDaysByProgram[prog.id] || (currentWeekObj?.days && currentWeekObj.days.length > 0 ? currentWeekObj.days[0].dayName : '');
 
                  return (
                    <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h4 style={{ color: '#10b981', margin: 0, fontSize: '18px' }}>{prog.title}</h4>
                        {(prog.startDate || prog.endDate) && (
                          <span style={{ fontSize: '12px', color: '#047857', background: '#d1fae5', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                            📅 Dal {formatDateToIT(prog.startDate)} al {formatDateToIT(prog.endDate)}
                          </span>
                        )}
                      </div>
                    
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                        {weeks.map((week: any) => (
                          <button
                            key={week.weekName}
                            onClick={() => {
                              setSelectedWeeksByProgram(prev => ({ ...prev, [prog.id]: week.weekName }));
                              if (week.days && week.days.length > 0) {
                                setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: week.days[0].dayName }));
                              }
                            }}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: currentProgramActiveWeek === week.weekName ? '#0284c7' : '#e2e8f0', color: currentProgramActiveWeek === week.weekName ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {week.weekName}
                          </button>
                        ))}
                      </div>
 
                      {currentWeekObj?.days ? (
                        <div>
                          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                            {currentWeekObj.days.map((day: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: day.dayName }))}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: currentProgramActiveDay === day.dayName ? '#10b981' : '#f1f5f9', color: currentProgramActiveDay === day.dayName ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                {day.dayName}
                              </button>
                            ))}
                          </div>
 
                          {currentWeekObj.days.filter((d: any) => d.dayName === currentProgramActiveDay).map((day: any) => {
                            const realWeekIndex = weeks.findIndex((w: any) => w.weekName === currentProgramActiveWeek);
                            const realDayIndex = currentWeekObj.days.findIndex((d: any) => d.dayName === day.dayName);
                            const dayCollapseKey = `${prog.id}_w_${realWeekIndex}_d_${realDayIndex}`;
                            const isDayClosed = collapsedProgramDays[dayCollapseKey] === undefined ? true : collapsedProgramDays[dayCollapseKey];
 
                            return (
                              <div key={realDayIndex} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDayClosed ? '0' : '12px' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{currentWeekObj.weekName} - {day.dayName}</span>
                                  <button type="button" onClick={() => toggleProgramDayCollapse(dayCollapseKey)} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                    {isDayClosed ? 'Apri Blocco Programma ▼' : 'Chiudi Blocco Programma ▲'}
                                  </button>
                                </div>
 
                                {!isDayClosed && (
                                  <div>
                                    {day.blocks?.length === 0 ? (
                                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nessun esercizio inserito.</p>
                                    ) : (
                                      day.blocks?.map((blk: any, bIdx: number) => {
                                        const blockKey = `ath_${prog.id}_${realWeekIndex}_${realDayIndex}_${bIdx}`;
                                        const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
                                        const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                                        return (
                                          <div key={bIdx} style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{blk.name}</div>
                                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                {blk.videoUrl && (
                                                  <a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    🎥 Video
                                                  </a>
                                                )}
                                                <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#000', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                              </div>
                                            </div>
 
                                            {!isClosed && (
                                              <div>
                                                {blk.type === 'forza' ? (
                                                  <div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.sets}</span>
                                                      </div>
                                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.reps}</span>
                                                      </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.load}</span>
                                                        {(() => {
                                                          const hint = computeLoadHint(blk.load, blk.reps, athleteMaxes[blk.name]);
                                                          return hint ? <span style={{ display: 'block', fontSize: '11px', color: '#0284c7', fontWeight: 'bold', marginTop: '3px' }}>{hint}</span> : null;
                                                        })()}
                                                      </div>
                                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.rest}</span>
                                                      </div>
                                                    </div>
                                                    {blk.notes && (
                                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</span>
                                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155' }}>{blk.notes}</p>
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</span>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
                                                  </div>
                                                )}
 
                                                <div style={{ marginTop: '10px', background: '#f1f5f9', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 I TUOI RISULTATI / NOTE:</span>
                                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                                    <div>
                                                      <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Score / Carico</label>
                                                      <input type="text" placeholder="es. 100kg" value={athleteResults[prog.id]?.[resultKey]?.score || ''} onChange={(e) => handleResultChange(prog.id, resultKey, 'score', e.target.value, undefined, { name: blk.name, reps: blk.reps, type: blk.type })} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                                    </div>
                                                    <div>
                                                      <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Note personali</label>
                                                      <input type="text" placeholder="Sensazioni..." value={athleteResults[prog.id]?.[resultKey]?.notes || ''} onChange={(e) => handleResultChange(prog.id, resultKey, 'notes', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 
 