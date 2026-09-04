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
    return `${day}/${month}/${year}`;
  }
  return dateString;
};
 
const METABOLIC_EXERCISES = [
  '500mt Row', '1000mt Row', '2000mt Row',
  '500mt Run', '1000mt Run', '2000mt Run',
  '500mt Ski', '1000mt Ski', '2000mt Ski',
  '1000mt Bike Erg', '2000mt Bike Erg',
  '10 cal Assault Bike', '20 cal Assault Bike', '50 cal Assault Bike',
];
 
const GYMNASTICS_EXERCISES = [
  'Pull Up', 'C2B', 'BMU', 'RMU', 'HSPU', 'Wall Facing HSPU',
  'Strict Pull Up', 'Strict RMU', 'Strict HSPU',
];
 
// Converte "1:45" o "1.45" o "105" in secondi
function timeToSeconds(txt: any): number | null {
  if (!txt) return null;
  const s = String(txt).trim().replace(',', ':').replace('.', ':');
  if (s.includes(':')) {
    const parts = s.split(':').map((p) => parseFloat(p));
    if (parts.some((p) => isNaN(p))) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }
  const v = parseFloat(s);
  return isNaN(v) ? null : v;
}
 
function secondsToTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
 
// Elenco storico di riferimento: gli esercizi dei massimali ora arrivano dalla Libreria Esercizi
const STRENGTH_EXERCISES = [
  'Back Squat', 'Deadlift', 'Front Squat', 'OHS', 'Press', 'Push Press', 
  'Push Jerk', 'Split Jerk', 'Power Snatch', 'Squat Snatch', 'Hang Power Snatch', 
  'Hang Squat Snatch', 'Power Clean', 'Squat Clean', 'Hang Power Clean', 
  'Hang Squat Clean', 'Clean & Jerk', 'Panca Piana'
];
 
const REP_SCHEMES = [1, 3, 5, 10];
 
const MOTIVATIONAL_QUOTES = [
  'Abbiamo un gran potere… Poter scegliere!!!\nAd ognuno la propria scelta!!',
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
 
function MaxHistoryChart({ points, onDelete }: { points: any[]; onDelete?: (id: string) => void }) {
  if (!points) {
    return <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0 0' }}>Caricamento...</p>;
  }
  if (points.length === 0) {
    return <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0 0' }}>Nessuno storico per questo esercizio. Si registra automaticamente quando il massimale viene aggiornato o superato in scheda.</p>;
  }
 
  const blocks = REP_SCHEMES.map((r) => {
    const pts = points.filter((h: any) => h.reps === r);
    if (pts.length < 1) return null;
    const vals = pts.map((p: any) => Number(p.value));
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const range = maxV - minV || 1;
    const W = 300, H = 70;
    const step = pts.length > 1 ? W / (pts.length - 1) : 0;
    const xy = (p: any, i: number) => {
      const x = pts.length > 1 ? i * step : W / 2;
      const y = H - ((Number(p.value) - minV) / range) * (H - 14) - 7;
      return { x, y };
    };
    const coords = pts.map((p: any, i: number) => {
      const { x, y } = xy(p, i);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const first = Number(pts[0].value);
    const last = Number(pts[pts.length - 1].value);
    const delta = Math.round((last - first) * 10) / 10;
 
    return (
      <div key={r} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}>{r} RM</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: delta > 0 ? '#10b981' : '#64748b' }}>
            {last} kg{delta > 0 ? ` (+${delta})` : ''}
          </span>
        </div>
        {pts.length > 1 ? (
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '70px', display: 'block' }}>
            <polyline points={coords.join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p: any, i: number) => {
              const { x, y } = xy(p, i);
              return <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />;
            })}
          </svg>
        ) : (
          <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0' }}>Un solo valore registrato: il grafico comparirà dal secondo aggiornamento.</p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
          {pts.map((p: any, i: number) => (
            <span key={p.id || i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2px 6px 2px 8px', fontSize: '10px', color: '#475569' }}>
              {new Date(p.recorded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}: <strong>{p.value}</strong>
              {onDelete && p.id && (
                <button onClick={() => onDelete(p.id)} title="Elimina questo valore" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '0 2px' }}>×</button>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }).filter(Boolean);
 
  if (blocks.length === 0) {
    return <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0 0' }}>Nessuno storico per questo esercizio.</p>;
  }
  return <div style={{ marginTop: '10px' }}>{blocks}</div>;
}
 
function SimpleHistoryChart({ points, lowerIsBetter, unit, onDelete }: { points: any[]; lowerIsBetter?: boolean; unit: string; onDelete?: (id: string) => void }) {
  if (!points) return <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0 0' }}>Caricamento...</p>;
  if (points.length === 0) return <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 0 0' }}>Nessuno storico ancora.</p>;
 
  const fmt = (v: number) => (unit === 'tempo' ? secondsToTime(v) : unit === 'round' ? `${numberToRounds(v)} round` : `${v} rep`);
  const vals = points.map((p: any) => Number(p.value));
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 300, H = 70;
  const step = points.length > 1 ? W / (points.length - 1) : 0;
  const xy = (p: any, i: number) => {
    const x = points.length > 1 ? i * step : W / 2;
    const raw = (Number(p.value) - minV) / range;
    const norm = lowerIsBetter ? 1 - raw : raw;
    return { x, y: H - norm * (H - 14) - 7 };
  };
  const first = Number(points[0].value);
  const last = Number(points[points.length - 1].value);
  const diff = Math.round((last - first) * 10) / 10;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
 
  return (
    <div style={{ marginTop: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000' }}>Record attuale</span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: improved ? '#10b981' : '#64748b' }}>
          {fmt(lowerIsBetter ? minV : maxV)}
        </span>
      </div>
      {points.length > 1 ? (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '70px', display: 'block' }}>
          <polyline points={points.map((p: any, i: number) => { const { x, y } = xy(p, i); return `${x.toFixed(1)},${y.toFixed(1)}`; }).join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p: any, i: number) => { const { x, y } = xy(p, i); return <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />; })}
        </svg>
      ) : (
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0' }}>Il grafico comparirà dal secondo valore registrato.</p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
        {points.map((p: any, i: number) => (
          <span key={p.id || i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '2px 6px 2px 8px', fontSize: '10px', color: '#475569' }}>
            {new Date(p.recorded_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}: <strong>{fmt(Number(p.value))}</strong>
            {onDelete && p.id && (
              <button onClick={() => onDelete(p.id)} title="Elimina questo valore" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '0 2px' }}>×</button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
 
const METCON_ORDER = ['run', 'row', 'ski', 'bike erg', 'assault bike'];
 
function sortMetconNames(names: string[]): string[] {
  const rank = (n: string): [number, number] => {
    const low = n.toLowerCase();
    let group = METCON_ORDER.findIndex((k) => low.includes(k));
    if (group === -1) group = METCON_ORDER.length;
    const m = low.match(/(\d+(?:[.,]\d+)?)/);
    const num = m ? parseFloat(m[1].replace(',', '.')) : 0;
    return [group, num];
  };
  return [...names].sort((a, b) => {
    const [ga, na] = rank(a);
    const [gb, nb] = rank(b);
    if (ga !== gb) return ga - gb;
    if (na !== nb) return na - nb;
    return a.localeCompare(b);
  });
}
 
// Stato temporale di un programma, per colorare le date
// Legge una data come mezzanotte locale, non UTC: altrimenti in Italia
// un programma che inizia oggi risulterebbe "non ancora iniziato"
function parseLocalDate(s: any): Date | null {
  if (!s) return null;
  const parti = String(s).split('T')[0].split('-').map(Number);
  if (parti.length !== 3 || parti.some((n) => !n || isNaN(n))) return null;
  return new Date(parti[0], parti[1] - 1, parti[2]);
}
 
function getProgramDateStatus(startDate: any, endDate: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
 
  const end = parseLocalDate(endDate);
  const start = parseLocalDate(startDate);
 
  if (end) {
    const diff = Math.round((end.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { color: '#b91c1c', bg: '#fee2e2', icon: '⛔', label: 'Scaduto' };
    if (diff === 0) return { color: '#b91c1c', bg: '#fee2e2', icon: '⚠️', label: 'Scade oggi' };
    if (diff <= 7) return { color: '#b45309', bg: '#fef3c7', icon: '⏳', label: `Scade tra ${diff} ${diff === 1 ? 'giorno' : 'giorni'}` };
  }
 
  if (start && start.getTime() > today.getTime()) {
    return { color: '#1d4ed8', bg: '#dbeafe', icon: '🕒', label: 'Non ancora iniziato' };
  }
 
  return { color: '#047857', bg: '#d1fae5', icon: '📅', label: '' };
}
 
// Mostra il testo di un WOD trasformando in link i nomi degli esercizi
// che hanno un video in libreria. Il coach scrive normalmente: i link compaiono da soli.
function WodText({ text, library, style }: { text: any; library: any[]; style?: React.CSSProperties }) {
  const raw = String(text || '');
  const items = (library || []).filter((e: any) => e && e.name && e.video_url && !e.dismissed);
 
  if (!raw || items.length === 0) {
    return <p style={style}>{raw}</p>;
  }
 
  // I nomi più lunghi hanno la precedenza: "Hang Power Clean" prima di "Power Clean"
  const sorted = [...items].sort((a: any, b: any) => b.name.length - a.name.length);
  const lower = raw.toLowerCase();
  const isWordChar = (ch: string) => /[a-zA-Z0-9]/.test(ch || '');
 
  const parts: any[] = [];
  let i = 0;
 
  while (i < raw.length) {
    let match: any = null;
 
    for (const ex of sorted) {
      const n = String(ex.name).toLowerCase();
      if (!n || !lower.startsWith(n, i)) continue;
 
      const before = i === 0 ? ' ' : raw[i - 1];
      if (isWordChar(before)) continue;
 
      let len = n.length;
      let after = raw[i + len] || ' ';
      if (after === 's' || after === 'S') {          // accetta anche il plurale
        const next = raw[i + len + 1] || ' ';
        if (!isWordChar(next)) { len += 1; after = next; }
      }
      if (isWordChar(after)) continue;
 
      match = { ex, len };
      break;
    }
 
    if (match) {
      parts.push({ kind: 'link', text: raw.substr(i, match.len), url: match.ex.video_url });
      i += match.len;
    } else {
      const last = parts[parts.length - 1];
      if (last && last.kind === 'text') last.text += raw[i];
      else parts.push({ kind: 'text', text: raw[i] });
      i += 1;
    }
  }
 
  return (
    <p style={style}>
      {parts.map((p, idx) =>
        p.kind === 'link' ? (
          <a
            key={idx}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {p.text}
          </a>
        ) : (
          <span key={idx}>{p.text}</span>
        )
      )}
    </p>
  );
}
 
// I benchmark hanno sempre gli stessi movimenti: cambiano solo i carichi
// (dove previsti) e il tempo obiettivo. {w} e {w2} vengono sostituiti dal livello scelto.
const BENCHMARK_WODS = [
  // ---- THE GIRLS — a tempo ----
  { name: 'Fran', type: 'time', cat: 'Girls',
    desc: '21-15-9\nThruster {w}\nPull Up',
    rx: { w: '43/30 kg', t: '3-6 min' }, int: { w: '35/25 kg', t: '5-8 min' }, beg: { w: '20/15 kg', t: '6-10 min' } },
 
  { name: 'Grace', type: 'time', cat: 'Girls',
    desc: '30 Clean & Jerk {w}',
    rx: { w: '61/43 kg', t: '2-5 min' }, int: { w: '43/30 kg', t: '3-6 min' }, beg: { w: '30/20 kg', t: '4-8 min' } },
 
  { name: 'Isabel', type: 'time', cat: 'Girls',
    desc: '30 Snatch {w}',
    rx: { w: '61/43 kg', t: '2-5 min' }, int: { w: '43/30 kg', t: '3-7 min' }, beg: { w: '30/20 kg', t: '4-8 min' } },
 
  { name: 'Elizabeth', type: 'time', cat: 'Girls',
    desc: '21-15-9\nClean {w}\nRing Dip',
    rx: { w: '61/43 kg', t: '5-9 min' }, int: { w: '43/30 kg', t: '7-12 min' }, beg: { w: '30/20 kg', t: '8-14 min' } },
 
  { name: 'Diane', type: 'time', cat: 'Girls',
    desc: '21-15-9\nDeadlift {w}\nHSPU',
    rx: { w: '102/70 kg', t: '3-8 min' }, int: { w: '80/55 kg', t: '6-12 min' }, beg: { w: '60/40 kg', t: '8-14 min' } },
 
  { name: 'Karen', type: 'time', cat: 'Girls',
    desc: '150 Wall Ball {w}',
    rx: { w: '9/6 kg', t: '6-12 min' }, int: { w: '6/4 kg', t: '7-13 min' }, beg: { w: '4/3 kg', t: '8-15 min' } },
 
  { name: 'Annie', type: 'time', cat: 'Girls',
    desc: '50-40-30-20-10\nDouble Under\nSit Up',
    rx: { t: '5-10 min' }, int: { t: '8-14 min' }, beg: { t: '12-20 min' } },
 
  { name: 'Helen', type: 'time', cat: 'Girls',
    desc: '3 round:\n400 m Run\n21 KB Swing {w}\n12 Pull Up',
    rx: { w: '24/16 kg', t: '8-12 min' }, int: { w: '16/12 kg', t: '10-14 min' }, beg: { w: '12/8 kg', t: '12-17 min' } },
 
  { name: 'Jackie', type: 'time', cat: 'Girls',
    desc: '1000 m Row\n50 Thruster {w}\n30 Pull Up',
    rx: { w: '20 kg', t: '6-11 min' }, int: { w: '15 kg', t: '8-13 min' }, beg: { w: '10 kg', t: '10-16 min' } },
 
  { name: 'Angie', type: 'time', cat: 'Girls',
    desc: '100 Pull Up\n100 Push Up\n100 Sit Up\n100 Air Squat',
    rx: { t: '12-20 min' }, int: { t: '18-27 min' }, beg: { t: '25-35 min' } },
 
  { name: 'Nancy', type: 'time', cat: 'Girls',
    desc: '5 round:\n400 m Run\n15 OHS {w}',
    rx: { w: '43/30 kg', t: '12-18 min' }, int: { w: '30/20 kg', t: '14-20 min' }, beg: { w: '20/15 kg', t: '16-24 min' } },
 
  { name: 'Kelly', type: 'time', cat: 'Girls',
    desc: '5 round:\n400 m Run\n30 Box Jump {w}\n30 Wall Ball {w2}',
    rx: { w: '24/20"', w2: '9/6 kg', t: '25-35 min' }, int: { w: '20/16"', w2: '6/4 kg', t: '28-38 min' }, beg: { w: '20/16"', w2: '4/3 kg', t: '32-45 min' } },
 
  { name: 'Amanda', type: 'time', cat: 'Girls',
    desc: '9-7-5\nRing Muscle Up\nSquat Snatch {w}',
    rx: { w: '61/43 kg', t: '5-12 min' }, int: { w: '43/30 kg', t: '8-15 min' }, beg: { w: '30/20 kg', t: '10-18 min' } },
 
  { name: 'Barbara', type: 'time', cat: 'Girls',
    desc: '5 round (3 min rest tra i round):\n20 Pull Up\n30 Push Up\n40 Sit Up\n50 Air Squat',
    rx: { t: '25-35 min' }, int: { t: '32-42 min' }, beg: { t: '40-50 min' } },
 
  // ---- THE GIRLS — a round ----
  { name: 'Cindy', type: 'rounds', cat: 'Girls',
    desc: 'AMRAP 20 min:\n5 Pull Up\n10 Push Up\n15 Air Squat',
    rx: { t: '15-22 round' }, int: { t: '11-16 round' }, beg: { t: '7-12 round' } },
 
  { name: 'Mary', type: 'rounds', cat: 'Girls',
    desc: 'AMRAP 20 min:\n5 HSPU\n10 Pistol\n15 Pull Up',
    rx: { t: '8-14 round' }, int: { t: '5-9 round' }, beg: { t: '3-6 round' } },
 
  { name: 'Nicole', type: 'reps', cat: 'Girls',
    desc: 'AMRAP 20 min:\n400 m Run\nMax Pull Up unbroken\n(risultato = totale pull up)',
    rx: { t: '40-70 rep' }, int: { t: '25-45 rep' }, beg: { t: '15-30 rep' } },
 
  // ---- HERO WOD — a tempo ----
  { name: 'Murph', type: 'time', cat: 'Hero',
    desc: '1 miglio Run\n100 Pull Up\n200 Push Up\n300 Air Squat\n1 miglio Run\n{w}',
    rx: { w: 'Con giubbotto 9/6 kg', t: '40-60 min' }, int: { w: 'Senza zavorra', t: '38-55 min' }, beg: { w: 'Senza zavorra, partizionato 20x 5-10-15', t: '45-65 min' } },
 
  { name: 'DT', type: 'time', cat: 'Hero',
    desc: '5 round:\n12 Deadlift\n9 Hang Power Clean\n6 Push Jerk\n{w}',
    rx: { w: '70/47,5 kg', t: '8-14 min' }, int: { w: '50/35 kg', t: '9-15 min' }, beg: { w: '35/25 kg', t: '10-17 min' } },
 
  { name: 'JT', type: 'time', cat: 'Hero',
    desc: '21-15-9\nHSPU\nRing Dip\nPush Up',
    rx: { t: '8-16 min' }, int: { t: '14-22 min' }, beg: { t: '20-30 min' } },
 
  { name: 'Michael', type: 'time', cat: 'Hero',
    desc: '3 round:\n800 m Run\n50 Back Extension\n50 Sit Up',
    rx: { t: '25-35 min' }, int: { t: '30-40 min' }, beg: { t: '35-48 min' } },
 
  { name: 'Randy', type: 'time', cat: 'Hero',
    desc: '75 Power Snatch {w}',
    rx: { w: '34/25 kg', t: '4-9 min' }, int: { w: '25/15 kg', t: '5-10 min' }, beg: { w: '15/10 kg', t: '6-12 min' } },
 
  { name: 'Jerry', type: 'time', cat: 'Hero',
    desc: '1 miglio Run\n2000 m Row\n1 miglio Run',
    rx: { t: '22-32 min' }, int: { t: '28-38 min' }, beg: { t: '35-45 min' } },
 
  { name: 'Daniel', type: 'time', cat: 'Hero',
    desc: '50 Pull Up\n400 m Run\n21 Thruster {w}\n800 m Run\n21 Thruster {w}\n400 m Run\n50 Pull Up',
    rx: { w: '43 kg', t: '15-25 min' }, int: { w: '30 kg', t: '19-29 min' }, beg: { w: '20 kg', t: '24-35 min' } },
 
  // ---- HERO WOD — a round ----
  { name: 'Nate', type: 'rounds', cat: 'Hero',
    desc: 'AMRAP 20 min:\n2 Muscle Up\n4 HSPU\n8 KB Swing {w}',
    rx: { w: '32/24 kg', t: '12-20 round' }, int: { w: '24/16 kg', t: '9-15 round' }, beg: { w: '16/12 kg', t: '6-11 round' } },
];
 
// Compone la descrizione sostituendo i carichi del livello scelto
function benchDesc(b: any, lvl: string) {
  const spec = lvl === 'int' ? b.int : lvl === 'beg' ? b.beg : b.rx;
  let d = String(b.desc || '');
  d = d.split('{w2}').join(spec.w2 || '');
  d = d.split('{w}').join(spec.w || '');
  return d;
}
 
function benchTarget(b: any, lvl: string) {
  const spec = lvl === 'int' ? b.int : lvl === 'beg' ? b.beg : b.rx;
  return spec.t;
}
 
const BENCHMARK_NAMES = BENCHMARK_WODS.map((b) => b.name);
 
// I risultati "a round" si scrivono 18+5 e si confrontano come numero unico
function roundsToNumber(txt: any): number | null {
  if (txt === null || txt === undefined) return null;
  const s = String(txt).replace(/\s/g, '');
  if (!s) return null;
  const parts = s.split('+');
  const r = parseFloat(parts[0]);
  if (isNaN(r)) return null;
  const rep = parts.length > 1 ? parseFloat(parts[1]) || 0 : 0;
  return r * 1000 + rep;
}
 
function numberToRounds(n: number): string {
  const r = Math.floor(n / 1000);
  const rep = Math.round(n % 1000);
  return rep > 0 ? `${r}+${rep}` : `${r}`;
}
 
// Campo per inserire un risultato, con il formato adatto al tipo di prova.
// Mentre si scrive le caselle restano libere (niente zeri messi d'ufficio):
// il valore viene sistemato solo all'uscita dal gruppo.
function ScoreInput({ mode, value, onChange, onCommit }: any) {
  const box: React.CSSProperties = { width: '58px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' };
  const sep: React.CSSProperties = { fontWeight: 'bold', color: '#64748b' };
  const enter = (e: any) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); };
 
  const groupBlur = (e: any) => {
    // se il fuoco resta dentro lo stesso gruppo (es. da minuti a secondi) non salvo
    if (e.currentTarget.contains(e.relatedTarget)) return;
 
    const grezzo = String(value || '');
 
    if (mode === 'time') {
      const [m, s] = grezzo.split(':');
      if (!m && !s) { onChange(''); onCommit(''); return; }
      const finale = `${parseInt(m || '0', 10)}:${String(parseInt(s || '0', 10)).padStart(2, '0')}`;
      onChange(finale);
      onCommit(finale);
      return;
    }
 
    if (mode === 'rounds') {
      const [r, rep] = grezzo.split('+');
      if (!r && !rep) { onChange(''); onCommit(''); return; }
      const finale = `${parseInt(r || '0', 10)}+${parseInt(rep || '0', 10)}`;
      onChange(finale);
      onCommit(finale);
      return;
    }
 
    onCommit(grezzo);
  };
 
  if (mode === 'time') {
    const p = String(value || '').split(':');
    const m = p[0] || '';
    const s = p.length > 1 ? p[1] : '';
    return (
      <div onBlur={groupBlur} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input type="number" min="0" placeholder="min" value={m} onChange={(e) => onChange(`${e.target.value}:${s}`)} onKeyDown={enter} style={box} />
        <span style={sep}>:</span>
        <input type="number" min="0" max="59" placeholder="sec" value={s} onChange={(e) => onChange(`${m}:${e.target.value}`)} onKeyDown={enter} style={box} />
      </div>
    );
  }
 
  if (mode === 'rounds') {
    const p = String(value || '').split('+');
    const r = p[0] || '';
    const rep = p.length > 1 ? p[1] : '';
    return (
      <div onBlur={groupBlur} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input type="number" min="0" placeholder="round" value={r} onChange={(e) => onChange(`${e.target.value}+${rep}`)} onKeyDown={enter} style={box} />
        <span style={sep}>+</span>
        <input type="number" min="0" placeholder="rep" value={rep} onChange={(e) => onChange(`${r}+${e.target.value}`)} onKeyDown={enter} style={box} />
      </div>
    );
  }
 
  if (mode === 'reps') {
    return (
      <div onBlur={groupBlur}>
        <input type="number" min="0" placeholder="rep" value={value || ''} onChange={(e) => onChange(e.target.value)} onKeyDown={enter} style={{ ...box, width: '80px' }} />
      </div>
    );
  }
 
  return (
    <div onBlur={groupBlur} style={{ width: '100%' }}>
      <input type="text" placeholder="es. 100kg" value={value || ''} onChange={(e) => onChange(e.target.value)} onKeyDown={enter} style={{ ...box, width: '100%', boxSizing: 'border-box' }} />
    </div>
  );
}
 
// Ordina la libreria per categoria: Forza, Metcon, Ginnastica, poi i generici
function sortExerciseLibrary(list: any[]) {
  const gruppo = (ex: any) => {
    if (ex.track_max) return 0;                    // forza
    if (ex.pr_kind === 'metcon') return 1;         // metabolici
    if (ex.pr_kind === 'gym') return 2;            // ginnastica
    return 3;                                      // generici
  };
  return [...list].sort((a, b) => {
    const ga = gruppo(a), gb = gruppo(b);
    if (ga !== gb) return ga - gb;
    if (ga === 1) {
      // i metcon seguono l'ordine per attrezzo e distanza
      const ordinati = sortMetconNames([a.name, b.name]);
      if (ordinati[0] !== a.name) return 1;
      if (ordinati[0] !== b.name) return -1;
    }
    return String(a.name).localeCompare(String(b.name), 'it');
  });
}
 
// L'esercizio "Mobility" si comporta in modo speciale: niente serie, ripetizioni
// o recupero, solo il testo scritto dal coach, il video, una spunta "fatto"
// e le note dell'atleta. Viene riconosciuto dal nome, come i benchmark.
const MOBILITY_NAMES = ['mobility', 'mobilità', 'mobilita'];
function isMobility(nome: any) {
  const pulito = String(nome || '').toLowerCase().replace(/[^a-z0-9à]/g, '');
  return MOBILITY_NAMES.some((m) => pulito === m.replace(/[^a-z0-9à]/g, ''));
}
 
// Età compiuta alla data odierna, calcolata dalla data di nascita
function calcolaEta(dataNascita: any): number | null {
  const d = parseLocalDate(dataNascita);
  if (!d) return null;
  const oggi = new Date();
  let eta = oggi.getFullYear() - d.getFullYear();
  const m = oggi.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && oggi.getDate() < d.getDate())) eta--;
  return eta;
}
 
function isMinorenne(dataNascita: any): boolean {
  const eta = calcolaEta(dataNascita);
  return eta !== null && eta < 18;
}
 
const PRIVACY_VERSION = '3.0';
 
// ---- Calcolo carichi: percentuali, RPE, stima 1RM ----
 
const RPE_TABLE: { [rpe: string]: number[] } = {
  // indice 0 = 1 rep, indice 11 = 12 reps — percentuali del massimale (1RM)
  '10':  [100, 95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 71.7, 69.4],
  '9.5': [97.8, 93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 70.2, 67.9],
  '9':   [95.5, 92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.6, 66.4],
  '8.5': [93.9, 90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 67.4, 65.2],
  '8':   [92.2, 89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 66.1, 64.0],
  '7.5': [90.7, 87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 66.7, 64.8, 62.8],
  '7':   [89.2, 86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 65.3, 63.5, 61.5],
  '6.5': [87.8, 85.0, 82.4, 79.9, 77.4, 75.1, 72.3, 69.4, 66.7, 64.0, 62.2, 60.3],
  '6':   [86.3, 83.7, 81.1, 78.6, 76.2, 73.9, 70.7, 68.0, 65.3, 62.6, 60.9, 59.0],
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
 
// Trova i massimali di un esercizio anche se il nome è scritto in modo
// leggermente diverso ("Back Squat" / "back squat" / "Back-Squat")
function trovaMaxes(tuttiMaxes: any, nomeEsercizio: any): any {
  if (!tuttiMaxes || !nomeEsercizio) return null;
  if (tuttiMaxes[nomeEsercizio]) return tuttiMaxes[nomeEsercizio];
  const pulito = String(nomeEsercizio).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!pulito) return null;
  const chiave = Object.keys(tuttiMaxes).find(
    (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '') === pulito
  );
  return chiave ? tuttiMaxes[chiave] : null;
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
    return `≈ ${kg} kg`;
  }
 
  // Caso 2: RPE scritto in qualsiasi modo — "RPE 8", "8 RPE", "@8",
  // e anche gli intervalli "7/8 rpe" o "RPE 7-8" (in tal caso vale la media)
  const rpeMatch =
    txt.match(/(?:RPE|@)\s*(\d{1,2}(?:[.,]5)?)\s*[/\-\u2013]\s*(\d{1,2}(?:[.,]5)?)/i) ||
    txt.match(/(\d{1,2}(?:[.,]5)?)\s*[/\-\u2013]\s*(\d{1,2}(?:[.,]5)?)\s*RPE/i) ||
    txt.match(/(?:RPE|@)\s*(\d{1,2}(?:[.,]5)?)/i) ||
    txt.match(/(\d{1,2}(?:[.,]5)?)\s*RPE/i);
 
  if (rpeMatch && oneRM) {
    const primo = parseFloat(rpeMatch[1].replace(',', '.'));
    const secondo = rpeMatch[2] ? parseFloat(rpeMatch[2].replace(',', '.')) : null;
    // Su un intervallo prendo la via di mezzo: "7/8" diventa 7,5
    const scelto = secondo !== null ? (primo + secondo) / 2 : primo;
    const rpeVal = Math.min(10, Math.max(6, scelto));
    const key = (Math.round(rpeVal * 2) / 2).toString();
    const row = RPE_TABLE[key];
    if (!row) return null;
    const idx = Math.min(12, Math.max(1, Math.round(reps))) - 1;
    const pct = row[idx];
    const kg = roundLoad((oneRM * pct) / 100);
    return `≈ ${kg} kg`;
  }
 
  return null;
}
 
 
// Stima il massimale per un numero qualsiasi di ripetizioni.
// Parte dal massimale inserito più vicino: più è vicino, più la stima è attendibile.
function stimaRM(exMaxes: any, reps: number): { kg: number; reale: boolean } | null {
  if (!exMaxes || reps < 1) return null;
 
  const diretto = parseWeightValue(exMaxes[reps]);
  if (diretto) return { kg: diretto, reale: true };
 
  // Cerco il massimale inserito con il numero di ripetizioni più vicino
  const noti = [1, 3, 5, 10]
    .map((r) => ({ r, w: parseWeightValue(exMaxes[r]) }))
    .filter((x) => x.w) as { r: number; w: number }[];
  if (noti.length === 0) return null;
 
  noti.sort((a, b) => Math.abs(a.r - reps) - Math.abs(b.r - reps));
  const base = noti[0];
 
  // Epley: porto il massimale noto a 1RM, poi lo riporto alle ripetizioni volute
  const oneRM = base.w * (1 + base.r / 30);
  const kg = oneRM / (1 + reps / 30);
  return { kg: roundLoad(kg), reale: false };
}
 
function AmtLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 802 538" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AMT" style={style}>
      <path fill="currentColor" fillRule="evenodd" d="M468.0,523.5L467.5,521.0L469.5,517.0L471.5,506.0L479.5,480.0L495.5,417.0L503.5,391.0L505.5,380.0L508.5,372.0L508.0,370.5L378.0,370.5L383.5,347.0L369.0,346.5L367.5,348.0L367.5,351.0L357.5,362.0L291.5,430.0L290.5,477.0L289.5,478.0L289.5,514.0L288.0,516.5L166.5,344.0L166.0,338.5L151.0,369.5L12.5,369.0L158.5,84.0L107.5,20.0L104.5,16.0L105.0,14.5L302.0,14.5L303.0,16.5L438.0,16.5L439.5,22.0L442.5,77.0L444.0,79.5L482.0,16.5L549.0,16.5L551.0,12.5L789.5,13.0L725.5,258.0L723.5,257.0L720.5,245.0L715.5,232.0L715.5,229.0L711.5,219.0L711.5,216.0L706.5,203.0L706.5,200.0L702.5,190.0L702.5,187.0L698.5,177.0L698.5,174.0L695.5,165.0L694.5,165.0L645.5,348.0L468.0,523.5Z M542.5,396.0L611.5,328.0L613.5,317.0L618.5,302.0L620.5,291.0L622.5,287.0L624.5,276.0L629.5,261.0L631.5,250.0L633.5,246.0L635.5,235.0L640.5,220.0L642.5,209.0L644.5,205.0L646.5,194.0L651.5,179.0L653.5,168.0L655.5,164.0L657.5,153.0L659.5,149.0L674.5,91.0L712.0,90.5L720.5,118.0L722.0,119.5L737.5,58.0L739.5,54.0L739.0,50.5L579.5,51.0L571.5,82.0L569.5,86.0L568.5,93.0L566.5,97.0L565.5,104.0L563.5,108.0L562.5,115.0L560.5,119.0L561.0,122.5L596.0,90.5L623.0,90.5L623.5,93.0L621.5,97.0L609.5,145.0L604.5,160.0L603.5,168.0L601.5,172.0L598.5,187.0L596.5,191.0L574.5,277.0L566.5,303.0L564.5,314.0L561.5,320.0L554.5,349.0L546.5,375.0L544.5,386.0L541.5,394.0L541.5,396.0L542.5,396.0Z M253.5,399.0L253.5,394.0L254.5,393.0L254.5,357.0L255.5,356.0L255.5,321.0L256.5,320.0L256.5,284.0L257.5,283.0L257.5,247.0L258.5,246.0L258.5,211.0L259.5,210.0L259.5,174.0L260.5,173.0L260.5,138.0L261.5,137.0L261.5,101.0L262.5,100.0L263.5,54.0L185.0,53.5L184.5,55.0L200.5,74.0L203.5,78.0L203.5,80.0L74.5,331.0L127.0,331.5L143.5,298.0L143.5,296.0L155.0,274.5L208.0,274.5L205.5,332.0L250.5,397.0L253.5,399.0Z M264.5,403.0L332.5,332.0L367.0,204.5L368.5,209.0L368.5,219.0L369.5,220.0L369.5,229.0L370.5,230.0L376.5,305.0L378.0,308.5L397.0,308.5L398.5,307.0L457.5,212.0L459.5,211.0L457.5,222.0L455.5,226.0L453.5,237.0L451.5,241.0L449.5,252.0L447.5,256.0L445.5,267.0L443.5,271.0L441.5,282.0L439.5,286.0L427.5,332.0L476.5,332.0L489.5,282.0L491.5,278.0L493.5,267.0L495.5,263.0L496.5,256.0L498.5,252.0L499.5,245.0L501.5,241.0L503.5,230.0L505.5,226.0L506.5,219.0L508.5,215.0L510.5,204.0L512.5,200.0L514.5,189.0L519.5,174.0L521.5,163.0L523.5,159.0L525.5,148.0L530.5,133.0L532.5,122.0L537.5,107.0L543.5,81.0L548.5,66.0L550.5,58.0L550.0,54.5L503.5,55.0L414.0,203.5L413.5,195.0L412.5,194.0L412.5,181.0L411.5,180.0L411.5,167.0L410.5,166.0L410.5,153.0L409.5,152.0L409.5,139.0L408.5,138.0L408.5,125.0L407.5,124.0L407.5,111.0L406.5,110.0L406.5,97.0L405.5,96.0L405.5,83.0L404.5,82.0L404.5,69.0L403.5,68.0L403.5,56.0L402.0,54.5L321.5,55.0L348.5,88.0L348.5,90.0L343.5,105.0L341.5,116.0L339.5,120.0L323.5,183.0L321.5,187.0L302.5,261.0L297.5,276.0L291.5,302.0L289.5,306.0L270.5,380.0L265.5,395.0L263.5,403.0L264.5,403.0Z M210.0,234.5L173.5,234.0L214.0,151.5L211.5,225.0L210.5,226.0L210.0,234.5Z" />
    </svg>
  );
}
 
function PrivacyPolicyContent({ minor }: { minor?: boolean }) {
  const hStyle: React.CSSProperties = { color: '#10b981', fontSize: '14px', margin: '18px 0 6px 0' };
  const sStyle: React.CSSProperties = { color: '#334155', fontSize: '13px', fontWeight: 'bold', margin: '12px 0 4px 0' };
  const pStyle: React.CSSProperties = { margin: '0 0 8px 0', fontSize: '13px', lineHeight: 1.55, color: '#334155' };
  const bStyle: React.CSSProperties = { margin: '10px 0', fontSize: '13px', lineHeight: 1.55, color: '#7f1d1d', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' };
 
  if (minor) {
    return (
      <div>
        <p style={{ ...pStyle, fontSize: '12px', color: '#64748b' }}>Versione {PRIVACY_VERSION} &mdash; Informativa per utenti minorenni, rivolta a chi esercita la responsabilit&agrave; genitoriale (art. 13 Reg. UE 2016/679)</p>
        <p style={pStyle}>Il Sig. Marco Angeloni, P.IVA 02115500437, con sede in Via 4 Novembre n. 1, 62010 Montefano (MC), e-mail marcoangelon@gmail.com, in qualità di Titolare del trattamento (in seguito, “Titolare”), nonché soggetto che riveste il ruolo di coach, La informa, ai sensi dell’art. 13 del D.lgs. 30 giugno 2003 n. 196 (“Codice Privacy”) e dell’art. 13 del Regolamento UE n. 2016/679 (“GDPR”), che i dati personali del minore nei cui confronti esercita la responsabilità genitoriale saranno trattati con le modalità e per le finalità seguenti.</p>
        <h4 style={hStyle}>1. Oggetto del trattamento</h4>
        <p style={pStyle}>Il Titolare tratta i dati personali del minore da Lei comunicati in occasione della registrazione, dell’utilizzo dell’applicazione AM Training e della gestione del rapporto con lo stesso. In particolare, potranno essere trattate le seguenti categorie di dati:</p>
        <p style={sStyle}>A) Dati identificativi e di contatto</p>
        <p style={pStyle}>Per consentire la registrazione dell’utente minorenne, la gestione del profilo e l’erogazione dei servizi offerti tramite l’applicazione, potranno essere raccolti alcuni dati identificativi e di contatto, quali il nome e il cognome, l’indirizzo e-mail, la data di nascita e il sesso, nonché il nome e il cognome di chi esercita la responsabilità genitoriale.</p>
        <p style={sStyle}>B) Dati relativi all’allenamento e all’attività sportiva</p>
        <p style={pStyle}>Nell’ambito dell’utilizzo dell’applicazione potranno essere raccolte e trattate informazioni relative al percorso di allenamento e all’attività sportiva svolta dall’utente minorenne. Tali dati possono riguardare, in particolare, gli obiettivi di allenamento indicati dall’utente minorenne, il numero e la durata degli allenamenti effettuati su base settimanale, nonché i programmi di allenamento assegnati.</p>
        <p style={pStyle}>Potranno inoltre essere registrati i punteggi ottenuti, i risultati conseguiti e i progressi rilevati nel corso del percorso di allenamento. Rientrano altresì in tale categoria le eventuali note inserite dall’utente minorenne e/o dal Titolare e, più in generale, ogni ulteriore informazione pertinente all’attività sportiva svolta e alle prestazioni fisiche dell’utente minorenne, nella misura necessaria alla gestione e al monitoraggio del percorso di allenamento.</p>
        <p style={sStyle}>C) Dati relativi alla salute</p>
        <p style={pStyle}>Nel corso dell’anamnesi, l’utente minorenne potrà fornire informazioni che, in considerazione della loro natura e delle finalità per le quali vengono trattate, possono qualificarsi come dati relativi alla salute ai sensi dell’art. 4, n. 15, del GDPR e rientrare, pertanto, tra le categorie particolari di dati personali disciplinate dall’art. 9 del GDPR.</p>
        <p style={pStyle}>A titolo esemplificativo, potranno essere raccolte informazioni riguardanti eventuali patologie o condizioni di salute, infortuni, limitazioni funzionali, problematiche di natura fisica o sistemica ed eventuali terapie in corso. Potranno inoltre essere trattati dati quali il peso e l’altezza qualora, in relazione al contesto e alle specifiche finalità del trattamento, tali informazioni siano utilizzate per valutare o ricavare indicazioni relative alla condizione fisica o allo stato di salute dell’utente minorenne.</p>
        <p style={sStyle}>D) Dati tecnici</p>
        <p style={pStyle}>Per garantire il corretto funzionamento dell’applicazione, nonché per finalità connesse alla sicurezza, alla gestione e alla manutenzione dell’infrastruttura tecnologica, potranno essere trattati anche alcuni dati di natura tecnica.</p>
        <p style={pStyle}>Tali dati possono comprendere gli identificativi tecnici del dispositivo, ove necessari per consentire l’invio di notifiche push, l’indirizzo IP utilizzato dall’utente minorenne, la data e l’ora degli accessi all’applicazione e gli eventuali log tecnici generati automaticamente dai fornitori dell’infrastruttura tecnologica. Tali informazioni sono trattate nella misura necessaria a garantire la disponibilità, la sicurezza e il corretto funzionamento dell’applicazione e dei relativi servizi.</p>
        <h4 style={hStyle}>2. Finalità del trattamento</h4>
        <p style={pStyle}>I dati personali del minore nei cui confronti esercita la responsabilità genitoriale sono trattati per le seguenti finalità.</p>
        <p style={sStyle}>A) Finalità necessarie alla fornitura del servizio</p>
        <p style={pStyle}>I dati identificativi, di contatto e quelli relativi all’allenamento sono trattati, senza che sia necessario acquisire uno specifico consenso, ai sensi dell’art. 6, par. 1, lett. b), del GDPR, nella misura in cui il loro trattamento sia necessario per l’esecuzione del rapporto con il Titolare e per consentire all’utente minorenne di usufruire delle funzionalità messe a disposizione attraverso l’applicazione.</p>
        <p style={pStyle}>In tale ambito, i dati sono utilizzati per consentire la registrazione dell’utente minorenne e la gestione del relativo account, nonché per permettere l’accesso e l’utilizzo dell’applicazione. Il trattamento è inoltre finalizzato a consentire al Titolare, nella propria qualità di coach, di predisporre, assegnare e gestire i programmi di allenamento, nonché di registrare e monitorare i risultati e i progressi dell’utente minorenne nel corso dell’attività sportiva.</p>
        <p style={pStyle}>I dati potranno altresì essere utilizzati per gestire le comunicazioni inerenti al servizio e per garantire il corretto funzionamento, la sicurezza e la manutenzione dell’applicazione. Il trattamento potrà inoltre essere effettuato per adempiere agli obblighi derivanti da leggi, regolamenti o dalla normativa europea applicabile, nonché, ove necessario, per l’accertamento, l’esercizio o la difesa di un diritto del Titolare.</p>
        <p style={sStyle}>B) Trattamento dei dati relativi alla salute</p>
        <p style={pStyle}>Le informazioni relative alla salute e le eventuali altre categorie particolari di dati personali fornite dall’utente minorenne nell’ambito dell’anamnesi saranno trattate esclusivamente previo consenso esplicito dell’interessato, ai sensi dell’art. 9, par. 2, lett. a), del GDPR.</p>
        <p style={pStyle}>Tali informazioni saranno utilizzate esclusivamente nella misura necessaria a consentire al Titolare, in qualità di coach, di conoscere eventuali condizioni fisiche rilevanti comunicate dall’utente minorenne e di tenerne conto nell’ambito della programmazione dell’attività sportiva. In particolare, le informazioni fornite potranno essere considerate al fine di tenere conto di eventuali patologie, infortuni, limitazioni funzionali o altre problematiche dichiarate dall’utente minorenne e, ove opportuno, di adattare i programmi di allenamento alle condizioni comunicate, così da favorire una programmazione dell’attività fisica maggiormente adeguata alle caratteristiche e alle condizioni dichiarate dall’utente minorenne.</p>
        <p style={pStyle}>Il conferimento delle informazioni relative alla salute è in ogni caso facoltativo. L’utente minorenne che scelga di non fornire tali informazioni, ovvero qualora non vi sia il consenso al loro trattamento, potrà continuare a utilizzare tutte le funzionalità dell’applicazione che non richiedano il trattamento di tali dati. In tale eventualità, tuttavia, il Titolare non potrà tenere conto, nella predisposizione o nella gestione dei programmi di allenamento, di eventuali condizioni fisiche o sanitarie che non siano state comunicate dall’utente minorenne.</p>
        <p style={pStyle}>I dati relativi alla salute non saranno utilizzati per finalità di marketing, pubblicità, profilazione commerciale o assicurativa.</p>
        <p style={bStyle}>L’applicazione non costituisce uno strumento medico e il Titolare non svolge, attraverso l’applicazione, attività di natura sanitaria. I programmi di allenamento predisposti nell’ambito del servizio hanno esclusivamente finalità sportive e non costituiscono diagnosi, terapia o prescrizione medica, né intendono sostituire il parere o le indicazioni di un medico o di altro professionista sanitario. In presenza di patologie, infortuni o altre condizioni di salute rilevanti, l’utente minorenne è pertanto invitato a consultare il proprio medico prima di iniziare o modificare un programma di allenamento.</p>
        <p style={sStyle}>C) Notifiche push</p>
        <p style={pStyle}>Qualora l’utente minorenne scelga di abilitare le notifiche push, potranno essere trattati gli identificativi tecnici necessari per consentire l’invio delle notifiche al dispositivo utilizzato. L’attivazione delle notifiche push è facoltativa e la relativa preferenza può essere modificata in qualsiasi momento attraverso le impostazioni del dispositivo e/o dell’applicazione, secondo le funzionalità disponibili.</p>
        <p style={sStyle}>D) Obblighi di legge e tutela dei diritti</p>
        <p style={pStyle}>I dati personali potranno inoltre essere trattati, senza che sia necessario acquisire un ulteriore consenso di chi esercita la responsabilità genitoriale, qualora ciò sia necessario per adempiere a obblighi imposti dalla legge, da regolamenti o dalla normativa europea applicabile, nonché per dare esecuzione a eventuali provvedimenti adottati dalle Autorità competenti. Il trattamento potrà altresì essere effettuato qualora risulti necessario per l’accertamento, l’esercizio o la difesa di un diritto del Titolare, anche in sede giudiziaria o stragiudiziale.</p>
        <h4 style={hStyle}>3. Modalità di trattamento</h4>
        <p style={pStyle}>Il trattamento dei dati personali è realizzato mediante le operazioni previste dall’art. 4, n. 2), GDPR e precisamente: raccolta, registrazione, organizzazione, conservazione, consultazione, elaborazione, modificazione, selezione, estrazione, raffronto, utilizzo, comunicazione ove necessaria, cancellazione e distruzione dei dati.</p>
        <p style={pStyle}>I dati personali sono sottoposti a trattamento mediante strumenti elettronici e/o automatizzati. Il Titolare adotta misure tecniche e organizzative adeguate a garantire la sicurezza, la riservatezza, l’integrità e la disponibilità dei dati personali, tenendo conto della natura dei dati trattati e dei rischi connessi al trattamento.</p>
        <h4 style={hStyle}>4. Accesso ai dati</h4>
        <p style={pStyle}>I dati personali potranno essere resi accessibili al Titolare, in qualità di Titolare del trattamento e di coach, nella misura necessaria alla gestione del servizio e alla predisposizione e personalizzazione dei programmi di allenamento.</p>
        <p style={pStyle}>I dati potranno inoltre essere trattati da soggetti terzi che forniscono al Titolare servizi tecnologici e infrastrutturali necessari al funzionamento dell’applicazione, ove nominati Responsabili del trattamento ai sensi dell’art. 28 GDPR.</p>
        <p style={pStyle}>Tra i fornitori tecnologici utilizzati dal Titolare rientrano, in particolare, Supabase, per i servizi di database e autenticazione, Vercel, per i servizi di hosting, e Brevo, per l’invio delle comunicazioni di servizio via e-mail, secondo le funzioni e le configurazioni effettivamente utilizzate.</p>
        <p style={pStyle}>Il Titolare limiterà l’accesso ai dati personali, e in particolare ai dati relativi alla salute, a quanto effettivamente necessario per le finalità indicate nella presente informativa. Gli altri utenti dell’applicazione non avranno accesso ai dati personali dell’interessato né ai dati relativi alla sua salute. L’elenco aggiornato degli eventuali responsabili del trattamento potrà essere richiesto al Titolare.</p>
        <h4 style={hStyle}>5. Comunicazione dei dati</h4>
        <p style={pStyle}>Senza la necessità di uno specifico consenso, il Titolare potrà comunicare i dati personali nei casi in cui la comunicazione sia necessaria per adempiere a un obbligo di legge, a un provvedimento dell’Autorità oppure per l’accertamento, l’esercizio o la difesa di un diritto.</p>
        <p style={pStyle}>I dati potranno essere comunicati, a titolo esemplificativo, ad Autorità giudiziarie, amministrative e di controllo e ad altri soggetti pubblici o privati ai quali la comunicazione sia obbligatoria per legge. I soggetti destinatari dei dati tratteranno gli stessi, a seconda dei casi, in qualità di autonomi titolari del trattamento oppure di responsabili del trattamento. I dati personali non saranno diffusi.</p>
        <h4 style={hStyle}>6. Trasferimento dei dati verso Paesi terzi</h4>
        <p style={pStyle}>I dati personali sono trattati e conservati mediante l’infrastruttura tecnologica utilizzata dal Titolare, compresi i servizi di Supabase, Vercel e Brevo, secondo le rispettive configurazioni.</p>
        <p style={pStyle}>Qualora, nell’ambito della fornitura dei servizi tecnologici utilizzati, i dati personali siano trasferiti verso Paesi situati al di fuori dello Spazio Economico Europeo, il Titolare assicurerà che il trasferimento avvenga nel rispetto degli artt. 44 e seguenti GDPR e sulla base di un valido meccanismo previsto dalla normativa applicabile, quale, ove pertinente, una decisione di adeguatezza della Commissione Europea o le Clausole Contrattuali Standard adottate dalla Commissione Europea, eventualmente integrate dalle ulteriori misure richieste dalla normativa applicabile.</p>
        <p style={pStyle}>Le informazioni aggiornate relative ai fornitori, ai Paesi di trattamento e ai relativi meccanismi di trasferimento potranno essere richieste al Titolare.</p>
        <h4 style={hStyle}>7. Periodo di conservazione</h4>
        <p style={pStyle}>Il Titolare tratterà i dati personali per il tempo necessario a conseguire le finalità per le quali sono stati raccolti e, in particolare:</p>
        <p style={pStyle}>• i dati relativi all’account e alla gestione del servizio saranno conservati per tutta la durata del rapporto con il Titolare e fino alla cancellazione dell’account, salvo gli ulteriori periodi di conservazione previsti dalla legge;</p>
        <p style={pStyle}>• i dati relativi all’allenamento saranno conservati per tutta la durata del rapporto e per il periodo successivamente necessario alla gestione degli obblighi di legge o alla tutela dei diritti del Titolare;</p>
        <p style={pStyle}>• i dati relativi alla salute saranno conservati per tutta la durata del rapporto, salvo revoca del consenso da parte dell’interessato o richiesta di cancellazione, fatti salvi i casi in cui la conservazione sia necessaria per adempiere a obblighi di legge o per l’accertamento, l’esercizio o la difesa di un diritto;</p>
        <p style={pStyle}>• i dati tecnici e i log saranno conservati per il periodo necessario a garantire il funzionamento, la sicurezza e la manutenzione dei sistemi e secondo i periodi di conservazione applicabili ai singoli servizi tecnologici.</p>
        <p style={pStyle}>Al termine dei relativi periodi di conservazione, i dati saranno cancellati o resi anonimi, salvo che la loro ulteriore conservazione sia necessaria per adempiere a obblighi di legge o per l’accertamento, l’esercizio o la difesa di diritti. La cancellazione dell’account può essere richiesta dall’utente minorenne, o da chi esercita nei suoi confronti la responsabilità genitoriale, anche attraverso l’applicazione, secondo le funzionalità disponibili.</p>
        <h4 style={hStyle}>8. Natura del conferimento dei dati e conseguenze del rifiuto</h4>
        <p style={pStyle}>Il conferimento dei dati identificativi e dei dati necessari alla gestione dell’account e all’utilizzo delle funzionalità essenziali dell’applicazione è necessario per poter usufruire dei relativi servizi. Il mancato conferimento di tali dati può impedire la registrazione, l’accesso o l’utilizzo delle funzionalità per le quali i dati risultano necessari.</p>
        <p style={pStyle}>Il conferimento dei dati relativi alla salute è invece facoltativo. Il mancato conferimento di tali dati, così come il mancato rilascio del consenso esplicito al loro trattamento, non impedisce l’utilizzo delle funzionalità dell’applicazione che non richiedono tali informazioni. Tuttavia, il Titolare non potrà tenere conto delle condizioni fisiche o sanitarie non comunicate nella programmazione degli allenamenti.</p>
        <p style={pStyle}>L’abilitazione delle notifiche push è facoltativa e il relativo mancato consenso non pregiudica l’utilizzo delle altre funzionalità dell’applicazione.</p>
        <h4 style={hStyle}>9. Utenti minorenni</h4>
        <p style={pStyle}>L’applicazione può essere utilizzata anche da soggetti di età inferiore ai 18 anni. Il Titolare presta particolare attenzione alla tutela dei dati personali dei minori e, in particolare, al trattamento dei dati relativi alla salute.</p>
        <p style={pStyle}>Per gli utenti minorenni, il Titolare adotterà le procedure necessarie per verificare, nei casi previsti dalla normativa applicabile, il consenso o l’autorizzazione di chi esercita la responsabilità genitoriale. Quando il trattamento dei dati personali si basa sul consenso e l’offerta dei servizi della società dell’informazione è rivolta direttamente a un minorenne, si applicano le disposizioni dell’art. 8 GDPR e della normativa italiana applicabile in materia di consenso dei minori.</p>
        <p style={pStyle}>Per quanto riguarda i dati relativi alla salute, trattandosi di categorie particolari di dati personali, il trattamento sarà effettuato nel rispetto dell’art. 9 GDPR e sulla base di un consenso esplicito validamente prestato dal soggetto legittimato secondo la normativa applicabile. Il Titolare potrà richiedere le informazioni necessarie a verificare l’età dell’utente e, ove necessario, l’identità e la titolarità della responsabilità genitoriale.</p>
        <p style={pStyle}>Qualora non sia possibile acquisire validamente il consenso richiesto dalla normativa applicabile, il Titolare non procederà al trattamento dei dati relativi alla salute e potrà limitare l’accesso alle funzionalità dell’applicazione che richiedano tali dati.</p>
        <h4 style={hStyle}>10. Revoca del consenso</h4>
        <p style={pStyle}>Il consenso al trattamento dei dati relativi alla salute può essere revocato in qualsiasi momento, senza pregiudicare la liceità del trattamento effettuato prima della revoca. La revoca può essere effettuata attraverso le funzionalità messe a disposizione dall’applicazione oppure contattando il Titolare.</p>
        <p style={pStyle}>A seguito della revoca, il Titolare cesserà il trattamento dei dati relativi alla salute basato sul consenso e, ove richiesto, procederà alla loro cancellazione, fatti salvi i casi in cui la conservazione o il trattamento siano necessari per adempiere a un obbligo di legge oppure per l’accertamento, l’esercizio o la difesa di un diritto. La revoca del consenso comporterà l’impossibilità, per il Titolare, di continuare a utilizzare tali informazioni per personalizzare la programmazione degli allenamenti.</p>
        <h4 style={hStyle}>11. Diritti dell’interessato</h4>
        <p style={pStyle}>L’interessato, o chi esercita la responsabilità genitoriale nei suoi confronti, può esercitare nei confronti del Titolare del trattamento i diritti previsti dagli artt. 15-22 GDPR e, in particolare:</p>
        <p style={pStyle}>• ottenere la conferma che sia o meno in corso un trattamento di dati personali che lo riguardano e, in tal caso, ottenere l’accesso ai dati personali e alle informazioni previste dall’art. 15 GDPR;</p>
        <p style={pStyle}>• ottenere la rettifica dei dati personali inesatti e l’integrazione dei dati incompleti;</p>
        <p style={pStyle}>• ottenere la cancellazione dei dati personali nei casi previsti dall’art. 17 GDPR;</p>
        <p style={pStyle}>• ottenere la limitazione del trattamento nei casi previsti dall’art. 18 GDPR;</p>
        <p style={pStyle}>• ottenere la portabilità dei dati nei casi previsti dall’art. 20 GDPR;</p>
        <p style={pStyle}>• opporsi al trattamento nei casi previsti dall’art. 21 GDPR;</p>
        <p style={pStyle}>• non essere sottoposto a una decisione basata unicamente sul trattamento automatizzato, compresa la profilazione, nei casi previsti dall’art. 22 GDPR;</p>
        <p style={pStyle}>• revocare in qualsiasi momento il consenso precedentemente prestato, senza pregiudicare la liceità del trattamento effettuato prima della revoca.</p>
        <p style={pStyle}>Dalla sezione “Privacy” del proprio profilo, ove disponibile, l’utente minorenne, o chi esercita la responsabilità genitoriale nei suoi confronti, può scaricare i propri dati e richiedere la cancellazione dell’account. L’esercizio dei diritti può essere soggetto alle limitazioni previste dalla normativa applicabile.</p>
        <h4 style={hStyle}>12. Modalità di esercizio dei diritti</h4>
        <p style={pStyle}>Potrà in qualsiasi momento esercitare i diritti sopra indicati inviando una richiesta tramite raccomandata a/r o tramite e-mail a: Marco Angeloni — P.IVA 02115500437 — Via 4 Novembre n. 1, 62010 Montefano (MC) — marcoangelon@gmail.com</p>
        <p style={pStyle}>Il Titolare fornirà riscontro alla richiesta senza ingiustificato ritardo e, in ogni caso, entro un mese dal suo ricevimento. Tale termine può essere prorogato di ulteriori due mesi nei casi previsti dall’art. 12 GDPR, tenuto conto della complessità e del numero delle richieste. In tal caso, il Titolare informerà l’interessato della proroga e dei motivi del ritardo.</p>
        <h4 style={hStyle}>13. Reclamo all’Autorità di controllo</h4>
        <p style={pStyle}>Ai sensi dell’art. 77 GDPR, l’interessato che ritenga che il trattamento dei propri dati personali violi il GDPR ha il diritto di proporre reclamo all’Autorità di controllo competente, in particolare nello Stato membro in cui risiede abitualmente, lavora oppure nel luogo in cui si è verificata la presunta violazione. Per l’Italia, l’Autorità di controllo competente è il Garante per la protezione dei dati personali.</p>
        <h4 style={hStyle}>14. Processo decisionale automatizzato e profilazione</h4>
        <p style={pStyle}>Il Titolare non effettua processi decisionali basati unicamente sul trattamento automatizzato dei dati personali ai sensi dell’art. 22 GDPR. I programmi e le indicazioni di allenamento sono elaborati direttamente dal Titolare nella sua qualità di coach e non sono il risultato di una decisione presa esclusivamente mediante un processo automatizzato. I dati personali, compresi i dati relativi alla salute, non sono utilizzati per attività di profilazione commerciale, pubblicitaria o assicurativa.</p>
        <h4 style={hStyle}>15. Titolare del trattamento</h4>
        <p style={pStyle}>Marco Angeloni — P.IVA 02115500437 — Via 4 Novembre n. 1, 62010 Montefano (MC) — marcoangelon@gmail.com</p>
        <p style={pStyle}>L’elenco aggiornato degli eventuali responsabili del trattamento può essere richiesto al Titolare utilizzando i recapiti sopra indicati.</p>
      </div>
    );
  }
 
  return (
    <div>
      <p style={{ ...pStyle, fontSize: '12px', color: '#64748b' }}>Versione {PRIVACY_VERSION} &mdash; Informativa ai sensi dell&apos;art. 13 del Reg. UE 2016/679 (GDPR) e del D.lgs. 196/2003</p>
      <p style={pStyle}>Il Sig. Marco Angeloni, P.IVA 02115500437, con sede in Via 4 Novembre n. 1, 62010 Montefano (MC), e-mail marcoangelon@gmail.com, in qualità di Titolare del trattamento (in seguito, “Titolare”), nonché soggetto che riveste il ruolo di coach, La informa, ai sensi dell’art. 13 del D.lgs. 30 giugno 2003 n. 196 (“Codice Privacy”) e dell’art. 13 del Regolamento UE n. 2016/679 (“GDPR”), che i Suoi dati personali saranno trattati con le modalità e per le finalità seguenti.</p>
      <h4 style={hStyle}>1. Oggetto del trattamento</h4>
      <p style={pStyle}>Il Titolare tratta i dati personali da Lei comunicati in occasione della registrazione, dell’utilizzo dell’applicazione AM Training e della gestione del rapporto con lo stesso. In particolare, potranno essere trattate le seguenti categorie di dati:</p>
      <p style={sStyle}>A) Dati identificativi e di contatto</p>
      <p style={pStyle}>Per consentire la registrazione dell’utente, la gestione del profilo e l’erogazione dei servizi offerti tramite l’applicazione, potranno essere raccolti alcuni dati identificativi e di contatto, quali il nome e il cognome, l’indirizzo e-mail, la data di nascita e il sesso.</p>
      <p style={sStyle}>B) Dati relativi all’allenamento e all’attività sportiva</p>
      <p style={pStyle}>Nell’ambito dell’utilizzo dell’applicazione potranno essere raccolte e trattate informazioni relative al percorso di allenamento e all’attività sportiva svolta dall’utente. Tali dati possono riguardare, in particolare, gli obiettivi di allenamento indicati dall’utente, il numero e la durata degli allenamenti effettuati su base settimanale, nonché i programmi di allenamento assegnati.</p>
      <p style={pStyle}>Potranno inoltre essere registrati i punteggi ottenuti, i risultati conseguiti e i progressi rilevati nel corso del percorso di allenamento. Rientrano altresì in tale categoria le eventuali note inserite dall’utente e/o dal Titolare e, più in generale, ogni ulteriore informazione pertinente all’attività sportiva svolta e alle prestazioni fisiche dell’utente, nella misura necessaria alla gestione e al monitoraggio del percorso di allenamento.</p>
      <p style={sStyle}>C) Dati relativi alla salute</p>
      <p style={pStyle}>Nel corso dell’anamnesi, l’utente potrà fornire informazioni che, in considerazione della loro natura e delle finalità per le quali vengono trattate, possono qualificarsi come dati relativi alla salute ai sensi dell’art. 4, n. 15, del GDPR e rientrare, pertanto, tra le categorie particolari di dati personali disciplinate dall’art. 9 del GDPR.</p>
      <p style={pStyle}>A titolo esemplificativo, potranno essere raccolte informazioni riguardanti eventuali patologie o condizioni di salute, infortuni, limitazioni funzionali, problematiche di natura fisica o sistemica ed eventuali terapie in corso. Potranno inoltre essere trattati dati quali il peso e l’altezza qualora, in relazione al contesto e alle specifiche finalità del trattamento, tali informazioni siano utilizzate per valutare o ricavare indicazioni relative alla condizione fisica o allo stato di salute dell’utente.</p>
      <p style={sStyle}>D) Dati tecnici</p>
      <p style={pStyle}>Per garantire il corretto funzionamento dell’applicazione, nonché per finalità connesse alla sicurezza, alla gestione e alla manutenzione dell’infrastruttura tecnologica, potranno essere trattati anche alcuni dati di natura tecnica.</p>
      <p style={pStyle}>Tali dati possono comprendere gli identificativi tecnici del dispositivo, ove necessari per consentire l’invio di notifiche push, l’indirizzo IP utilizzato dall’utente, la data e l’ora degli accessi all’applicazione e gli eventuali log tecnici generati automaticamente dai fornitori dell’infrastruttura tecnologica. Tali informazioni sono trattate nella misura necessaria a garantire la disponibilità, la sicurezza e il corretto funzionamento dell’applicazione e dei relativi servizi.</p>
      <h4 style={hStyle}>2. Finalità del trattamento</h4>
      <p style={pStyle}>I Suoi dati personali sono trattati per le seguenti finalità.</p>
      <p style={sStyle}>A) Finalità necessarie alla fornitura del servizio</p>
      <p style={pStyle}>I dati identificativi, di contatto e quelli relativi all’allenamento sono trattati, senza che sia necessario acquisire uno specifico consenso, ai sensi dell’art. 6, par. 1, lett. b), del GDPR, nella misura in cui il loro trattamento sia necessario per l’esecuzione del rapporto con il Titolare e per consentire all’utente di usufruire delle funzionalità messe a disposizione attraverso l’applicazione.</p>
      <p style={pStyle}>In tale ambito, i dati sono utilizzati per consentire la registrazione dell’utente e la gestione del relativo account, nonché per permettere l’accesso e l’utilizzo dell’applicazione. Il trattamento è inoltre finalizzato a consentire al Titolare, nella propria qualità di coach, di predisporre, assegnare e gestire i programmi di allenamento, nonché di registrare e monitorare i risultati e i progressi dell’utente nel corso dell’attività sportiva.</p>
      <p style={pStyle}>I dati potranno altresì essere utilizzati per gestire le comunicazioni inerenti al servizio e per garantire il corretto funzionamento, la sicurezza e la manutenzione dell’applicazione. Il trattamento potrà inoltre essere effettuato per adempiere agli obblighi derivanti da leggi, regolamenti o dalla normativa europea applicabile, nonché, ove necessario, per l’accertamento, l’esercizio o la difesa di un diritto del Titolare.</p>
      <p style={sStyle}>B) Trattamento dei dati relativi alla salute</p>
      <p style={pStyle}>Le informazioni relative alla salute e le eventuali altre categorie particolari di dati personali fornite dall’utente nell’ambito dell’anamnesi saranno trattate esclusivamente previo consenso esplicito dell’interessato, ai sensi dell’art. 9, par. 2, lett. a), del GDPR.</p>
      <p style={pStyle}>Tali informazioni saranno utilizzate esclusivamente nella misura necessaria a consentire al Titolare, in qualità di coach, di conoscere eventuali condizioni fisiche rilevanti comunicate dall’utente e di tenerne conto nell’ambito della programmazione dell’attività sportiva. In particolare, le informazioni fornite potranno essere considerate al fine di tenere conto di eventuali patologie, infortuni, limitazioni funzionali o altre problematiche dichiarate dall’utente e, ove opportuno, di adattare i programmi di allenamento alle condizioni comunicate, così da favorire una programmazione dell’attività fisica maggiormente adeguata alle caratteristiche e alle condizioni dichiarate dall’utente.</p>
      <p style={pStyle}>Il conferimento delle informazioni relative alla salute è in ogni caso facoltativo. L’utente che scelga di non fornire tali informazioni, ovvero che non presti il proprio consenso al loro trattamento, potrà continuare a utilizzare tutte le funzionalità dell’applicazione che non richiedano il trattamento di tali dati. In tale eventualità, tuttavia, il Titolare non potrà tenere conto, nella predisposizione o nella gestione dei programmi di allenamento, di eventuali condizioni fisiche o sanitarie che non siano state comunicate dall’utente.</p>
      <p style={pStyle}>I dati relativi alla salute non saranno utilizzati per finalità di marketing, pubblicità, profilazione commerciale o assicurativa.</p>
      <p style={bStyle}>L’applicazione non costituisce uno strumento medico e il Titolare non svolge, attraverso l’applicazione, attività di natura sanitaria. I programmi di allenamento predisposti nell’ambito del servizio hanno esclusivamente finalità sportive e non costituiscono diagnosi, terapia o prescrizione medica, né intendono sostituire il parere o le indicazioni di un medico o di altro professionista sanitario. In presenza di patologie, infortuni o altre condizioni di salute rilevanti, l’utente è pertanto invitato a consultare il proprio medico prima di iniziare o modificare un programma di allenamento.</p>
      <p style={sStyle}>C) Notifiche push</p>
      <p style={pStyle}>Qualora l’utente scelga di abilitare le notifiche push, potranno essere trattati gli identificativi tecnici necessari per consentire l’invio delle notifiche al dispositivo utilizzato. L’attivazione delle notifiche push è facoltativa e la relativa preferenza può essere modificata in qualsiasi momento attraverso le impostazioni del dispositivo e/o dell’applicazione, secondo le funzionalità disponibili.</p>
      <p style={sStyle}>D) Obblighi di legge e tutela dei diritti</p>
      <p style={pStyle}>I dati personali potranno inoltre essere trattati, senza che sia necessario acquisire un ulteriore consenso dell’interessato, qualora ciò sia necessario per adempiere a obblighi imposti dalla legge, da regolamenti o dalla normativa europea applicabile, nonché per dare esecuzione a eventuali provvedimenti adottati dalle Autorità competenti. Il trattamento potrà altresì essere effettuato qualora risulti necessario per l’accertamento, l’esercizio o la difesa di un diritto del Titolare, anche in sede giudiziaria o stragiudiziale.</p>
      <h4 style={hStyle}>3. Modalità di trattamento</h4>
      <p style={pStyle}>Il trattamento dei dati personali è realizzato mediante le operazioni previste dall’art. 4, n. 2), GDPR e precisamente: raccolta, registrazione, organizzazione, conservazione, consultazione, elaborazione, modificazione, selezione, estrazione, raffronto, utilizzo, comunicazione ove necessaria, cancellazione e distruzione dei dati.</p>
      <p style={pStyle}>I dati personali sono sottoposti a trattamento mediante strumenti elettronici e/o automatizzati. Il Titolare adotta misure tecniche e organizzative adeguate a garantire la sicurezza, la riservatezza, l’integrità e la disponibilità dei dati personali, tenendo conto della natura dei dati trattati e dei rischi connessi al trattamento.</p>
      <h4 style={hStyle}>4. Accesso ai dati</h4>
      <p style={pStyle}>I dati personali potranno essere resi accessibili al Titolare, in qualità di Titolare del trattamento e di coach, nella misura necessaria alla gestione del servizio e alla predisposizione e personalizzazione dei programmi di allenamento.</p>
      <p style={pStyle}>I dati potranno inoltre essere trattati da soggetti terzi che forniscono al Titolare servizi tecnologici e infrastrutturali necessari al funzionamento dell’applicazione, ove nominati Responsabili del trattamento ai sensi dell’art. 28 GDPR.</p>
      <p style={pStyle}>Tra i fornitori tecnologici utilizzati dal Titolare rientrano, in particolare, Supabase, per i servizi di database e autenticazione, Vercel, per i servizi di hosting, e Brevo, per l’invio delle comunicazioni di servizio via e-mail, secondo le funzioni e le configurazioni effettivamente utilizzate.</p>
      <p style={pStyle}>Il Titolare limiterà l’accesso ai dati personali, e in particolare ai dati relativi alla salute, a quanto effettivamente necessario per le finalità indicate nella presente informativa. Gli altri utenti dell’applicazione non avranno accesso ai dati personali dell’interessato né ai dati relativi alla sua salute. L’elenco aggiornato degli eventuali responsabili del trattamento potrà essere richiesto al Titolare.</p>
      <h4 style={hStyle}>5. Comunicazione dei dati</h4>
      <p style={pStyle}>Senza la necessità di uno specifico consenso, il Titolare potrà comunicare i dati personali nei casi in cui la comunicazione sia necessaria per adempiere a un obbligo di legge, a un provvedimento dell’Autorità oppure per l’accertamento, l’esercizio o la difesa di un diritto.</p>
      <p style={pStyle}>I dati potranno essere comunicati, a titolo esemplificativo, ad Autorità giudiziarie, amministrative e di controllo e ad altri soggetti pubblici o privati ai quali la comunicazione sia obbligatoria per legge. I soggetti destinatari dei dati tratteranno gli stessi, a seconda dei casi, in qualità di autonomi titolari del trattamento oppure di responsabili del trattamento. I dati personali non saranno diffusi.</p>
      <h4 style={hStyle}>6. Trasferimento dei dati verso Paesi terzi</h4>
      <p style={pStyle}>I dati personali sono trattati e conservati mediante l’infrastruttura tecnologica utilizzata dal Titolare, compresi i servizi di Supabase, Vercel e Brevo, secondo le rispettive configurazioni.</p>
      <p style={pStyle}>Qualora, nell’ambito della fornitura dei servizi tecnologici utilizzati, i dati personali siano trasferiti verso Paesi situati al di fuori dello Spazio Economico Europeo, il Titolare assicurerà che il trasferimento avvenga nel rispetto degli artt. 44 e seguenti GDPR e sulla base di un valido meccanismo previsto dalla normativa applicabile, quale, ove pertinente, una decisione di adeguatezza della Commissione Europea o le Clausole Contrattuali Standard adottate dalla Commissione Europea, eventualmente integrate dalle ulteriori misure richieste dalla normativa applicabile.</p>
      <p style={pStyle}>Le informazioni aggiornate relative ai fornitori, ai Paesi di trattamento e ai relativi meccanismi di trasferimento potranno essere richieste al Titolare.</p>
      <h4 style={hStyle}>7. Periodo di conservazione</h4>
      <p style={pStyle}>Il Titolare tratterà i dati personali per il tempo necessario a conseguire le finalità per le quali sono stati raccolti e, in particolare:</p>
      <p style={pStyle}>• i dati relativi all’account e alla gestione del servizio saranno conservati per tutta la durata del rapporto con il Titolare e fino alla cancellazione dell’account, salvo gli ulteriori periodi di conservazione previsti dalla legge;</p>
      <p style={pStyle}>• i dati relativi all’allenamento saranno conservati per tutta la durata del rapporto e per il periodo successivamente necessario alla gestione degli obblighi di legge o alla tutela dei diritti del Titolare;</p>
      <p style={pStyle}>• i dati relativi alla salute saranno conservati per tutta la durata del rapporto, salvo revoca del consenso da parte dell’interessato o richiesta di cancellazione, fatti salvi i casi in cui la conservazione sia necessaria per adempiere a obblighi di legge o per l’accertamento, l’esercizio o la difesa di un diritto;</p>
      <p style={pStyle}>• i dati tecnici e i log saranno conservati per il periodo necessario a garantire il funzionamento, la sicurezza e la manutenzione dei sistemi e secondo i periodi di conservazione applicabili ai singoli servizi tecnologici.</p>
      <p style={pStyle}>Al termine dei relativi periodi di conservazione, i dati saranno cancellati o resi anonimi, salvo che la loro ulteriore conservazione sia necessaria per adempiere a obblighi di legge o per l’accertamento, l’esercizio o la difesa di diritti. La cancellazione dell’account può essere richiesta dall’utente anche attraverso l’applicazione, secondo le funzionalità disponibili.</p>
      <h4 style={hStyle}>8. Natura del conferimento dei dati e conseguenze del rifiuto</h4>
      <p style={pStyle}>Il conferimento dei dati identificativi e dei dati necessari alla gestione dell’account e all’utilizzo delle funzionalità essenziali dell’applicazione è necessario per poter usufruire dei relativi servizi. Il mancato conferimento di tali dati può impedire la registrazione, l’accesso o l’utilizzo delle funzionalità per le quali i dati risultano necessari.</p>
      <p style={pStyle}>Il conferimento dei dati relativi alla salute è invece facoltativo. Il mancato conferimento di tali dati, così come il mancato rilascio del consenso esplicito al loro trattamento, non impedisce l’utilizzo delle funzionalità dell’applicazione che non richiedono tali informazioni. Tuttavia, il Titolare non potrà tenere conto delle condizioni fisiche o sanitarie non comunicate nella programmazione degli allenamenti.</p>
      <p style={pStyle}>L’abilitazione delle notifiche push è facoltativa e il relativo mancato consenso non pregiudica l’utilizzo delle altre funzionalità dell’applicazione.</p>
      <h4 style={hStyle}>9. Revoca del consenso</h4>
      <p style={pStyle}>Il consenso al trattamento dei dati relativi alla salute può essere revocato in qualsiasi momento, senza pregiudicare la liceità del trattamento effettuato prima della revoca. La revoca può essere effettuata attraverso le funzionalità messe a disposizione dall’applicazione oppure contattando il Titolare.</p>
      <p style={pStyle}>A seguito della revoca, il Titolare cesserà il trattamento dei dati relativi alla salute basato sul consenso e, ove richiesto, procederà alla loro cancellazione, fatti salvi i casi in cui la conservazione o il trattamento siano necessari per adempiere a un obbligo di legge oppure per l’accertamento, l’esercizio o la difesa di un diritto. La revoca del consenso comporterà l’impossibilità, per il Titolare, di continuare a utilizzare tali informazioni per personalizzare la programmazione degli allenamenti.</p>
      <h4 style={hStyle}>10. Diritti dell’interessato</h4>
      <p style={pStyle}>Nella Sua qualità di interessato, può esercitare nei confronti del Titolare del trattamento i diritti previsti dagli artt. 15-22 GDPR e, in particolare:</p>
      <p style={pStyle}>• ottenere la conferma che sia o meno in corso un trattamento di dati personali che La riguardano e, in tal caso, ottenere l’accesso ai dati personali e alle informazioni previste dall’art. 15 GDPR;</p>
      <p style={pStyle}>• ottenere la rettifica dei dati personali inesatti e l’integrazione dei dati incompleti;</p>
      <p style={pStyle}>• ottenere la cancellazione dei dati personali nei casi previsti dall’art. 17 GDPR;</p>
      <p style={pStyle}>• ottenere la limitazione del trattamento nei casi previsti dall’art. 18 GDPR;</p>
      <p style={pStyle}>• ottenere la portabilità dei dati nei casi previsti dall’art. 20 GDPR;</p>
      <p style={pStyle}>• opporsi al trattamento nei casi previsti dall’art. 21 GDPR;</p>
      <p style={pStyle}>• non essere sottoposto a una decisione basata unicamente sul trattamento automatizzato, compresa la profilazione, nei casi previsti dall’art. 22 GDPR;</p>
      <p style={pStyle}>• revocare in qualsiasi momento il consenso precedentemente prestato, senza pregiudicare la liceità del trattamento effettuato prima della revoca.</p>
      <p style={pStyle}>Dalla sezione “Privacy” del proprio profilo, ove disponibile, l’utente può scaricare i propri dati e richiedere la cancellazione dell’account. L’esercizio dei diritti può essere soggetto alle limitazioni previste dalla normativa applicabile.</p>
      <h4 style={hStyle}>11. Modalità di esercizio dei diritti</h4>
      <p style={pStyle}>Potrà in qualsiasi momento esercitare i diritti sopra indicati inviando una richiesta tramite raccomandata a/r o tramite e-mail a: Marco Angeloni — P.IVA 02115500437 — Via 4 Novembre n. 1, 62010 Montefano (MC) — marcoangelon@gmail.com</p>
      <p style={pStyle}>Il Titolare fornirà riscontro alla richiesta senza ingiustificato ritardo e, in ogni caso, entro un mese dal suo ricevimento. Tale termine può essere prorogato di ulteriori due mesi nei casi previsti dall’art. 12 GDPR, tenuto conto della complessità e del numero delle richieste. In tal caso, il Titolare informerà l’interessato della proroga e dei motivi del ritardo.</p>
      <h4 style={hStyle}>12. Reclamo all’Autorità di controllo</h4>
      <p style={pStyle}>Ai sensi dell’art. 77 GDPR, l’interessato che ritenga che il trattamento dei propri dati personali violi il GDPR ha il diritto di proporre reclamo all’Autorità di controllo competente, in particolare nello Stato membro in cui risiede abitualmente, lavora oppure nel luogo in cui si è verificata la presunta violazione. Per l’Italia, l’Autorità di controllo competente è il Garante per la protezione dei dati personali.</p>
      <h4 style={hStyle}>13. Processo decisionale automatizzato e profilazione</h4>
      <p style={pStyle}>Il Titolare non effettua processi decisionali basati unicamente sul trattamento automatizzato dei dati personali ai sensi dell’art. 22 GDPR. I programmi e le indicazioni di allenamento sono elaborati direttamente dal Titolare nella sua qualità di coach e non sono il risultato di una decisione presa esclusivamente mediante un processo automatizzato. I dati personali, compresi i dati relativi alla salute, non sono utilizzati per attività di profilazione commerciale, pubblicitaria o assicurativa.</p>
      <h4 style={hStyle}>14. Titolare del trattamento</h4>
      <p style={pStyle}>Marco Angeloni — P.IVA 02115500437 — Via 4 Novembre n. 1, 62010 Montefano (MC) — marcoangelon@gmail.com</p>
      <p style={pStyle}>L’elenco aggiornato degli eventuali responsabili del trattamento può essere richiesto al Titolare utilizzando i recapiti sopra indicati.</p>
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupBirthDate, setSignupBirthDate] = useState('');
  const [signupGender, setSignupGender] = useState('');
  const [signupGuardian, setSignupGuardian] = useState('');
  const [consensoAzzerato, setConsensoAzzerato] = useState(false);
  const [savedBirthDate, setSavedBirthDate] = useState('');
  const [dupBlock, setDupBlock] = useState<any>(null);
  const [dupTargets, setDupTargets] = useState<string[]>([]);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [signupDoneEmail, setSignupDoneEmail] = useState('');
  const emptyNewAthlete = { email: '', password: '', first_name: '', last_name: '', birth_date: '', gender: '', weight: '', height: '', subscription_status: 'attivo' };
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [newAthlete, setNewAthlete] = useState<any>(emptyNewAthlete);
  const [addingAthlete, setAddingAthlete] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [signupWeight, setSignupWeight] = useState('');
  const [signupHeight, setSignupHeight] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [policyScrolledToEnd, setPolicyScrolledToEnd] = useState(false);
  const emptyPersonalData = { full_name: '', birth_date: '', weight: '', height: '', gender: '', guardian_name: '' };
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
  const [prBadge, setPrBadge] = useState<{ exercise: string; headline: string; subtitle: string } | null>(null);
  const [openHistoryKey, setOpenHistoryKey] = useState<string | null>(null);
  const [historyCache, setHistoryCache] = useState<{ [key: string]: any[] }>({});
 
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
  const [programVisibility, setProgramVisibility] = useState<'none' | 'all' | 'selected'>('selected');
  const [programTrialStyle, setProgramTrialStyle] = useState('');
  const [programTrialGender, setProgramTrialGender] = useState('');
  const [programTrainingTips, setProgramTrainingTips] = useState('');
  const [programNutritionTips, setProgramNutritionTips] = useState('');
  const [openTipsProgram, setOpenTipsProgram] = useState<string | null>(null);
  const [tipsTab, setTipsTab] = useState<'training' | 'nutrition'>('training');
  const [tipsReadAt, setTipsReadAt] = useState<{ [programId: string]: string }>({});
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
  // Gli esercizi dei massimali sono gli stessi della libreria video, marcati con "track_max"
  const metconPRNames = sortMetconNames(
    exerciseLibrary
      .filter((e: any) => !e.dismissed && e.pr_kind === 'metcon')
      .map((e: any) => e.name)
  );
  const gymPRNames = exerciseLibrary
    .filter((e: any) => !e.dismissed && e.pr_kind === 'gym')
    .map((e: any) => e.name);
  const maxExerciseNames = exerciseLibrary
    .filter((e: any) => !e.dismissed && e.track_max)
    .map((e: any) => e.name);
 
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'exercises' | 'profile' | 'banner'>('create');
  const [coachSubView, setCoachSubView] = useState<'programs' | 'athletes' | 'personal' | 'banner'>('programs');
  const [personalSelectedAthleteId, setPersonalSelectedAthleteId] = useState('');
  const [personalExpandedProgramId, setPersonalExpandedProgramId] = useState<string | null>(null);
  const [coachAthleteDetailTab, setCoachAthleteDetailTab] = useState<'anagrafici' | 'maxes' | 'anamnesi' | 'abbonamento'>('anagrafici');
  const [coachMaxSubTab, setCoachMaxSubTab] = useState<'strength' | 'metcon' | 'gym' | 'bench'>('strength');
  const [newMaxExerciseName, setNewMaxExerciseName] = useState('');
  const [newPrName, setNewPrName] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('prova');
  const [trialChoice, setTrialChoice] = useState<string | null>(null);
  const [athleteGender, setAthleteGender] = useState<string | null>(null);
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);
  const [coachSubs, setCoachSubs] = useState<{ [athleteId: string]: string }>({});
  const [trialCta, setTrialCta] = useState<{ text: string; link_url: string }>({ text: '', link_url: '' });
  const [benchLevel, setBenchLevel] = useState<{ [name: string]: 'rx' | 'int' | 'beg' }>({});
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState('');
  const [showExerciseManager, setShowExerciseManager] = useState(false);
  const [selectedCoachAthlete, setSelectedCoachAthlete] = useState<any | null>(null);
 
  const [selectedWeekView, setSelectedWeekView] = useState('Settimana 1');
  const [selectedDayView, setSelectedDayView] = useState('Giorno 1');
 
  const [libraryFilterAthlete, setLibraryFilterAthlete] = useState('');
 
  const [newExName, setNewExName] = useState('');
  const [newExVideo, setNewExVideo] = useState('');
  const [newExType, setNewExType] = useState('');
 
  const [athleteResults, setAthleteResults] = useState<{ [key: string]: any }>({});
  const [coachAllResults, setCoachAllResults] = useState<{ [key: string]: any }>({});
 
  const [athleteMaxes, setAthleteMaxes] = useState<{ [exercise: string]: any }>({});
  // Copia dei valori già salvati: serve a capire se un nuovo dato è davvero un record
  const [savedMaxes, setSavedMaxes] = useState<{ [exercise: string]: any }>({});
  const [savedCoachMaxes, setSavedCoachMaxes] = useState<{ [athleteId: string]: any }>({});
  const [coachAthleteMaxes, setCoachAthleteMaxes] = useState<{ [athleteId: string]: any }>({});
  const [coachAllAnamnesis, setCoachAllAnamnesis] = useState<{ [athleteId: string]: any }>({});
  const emptyAnamnesis = { goal: '', weekly_sessions: '', session_duration: '', equipment: '', physical_issues: '' };
  const [anamnesis, setAnamnesis] = useState<any>(emptyAnamnesis);
  const [anamnesisSaving, setAnamnesisSaving] = useState(false);
  const [athleteProfileTab, setAthleteProfileTab] = useState<'anagrafici' | 'maxes' | 'anamnesi' | 'privacy'>('anagrafici');
  const [athleteMaxSubTab, setAthleteMaxSubTab] = useState<'strength' | 'metcon' | 'gym' | 'bench'>('strength');
 
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
 
  const [saveMessage, setSaveMessage] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
const [notificationError, setNotificationError] = useState('');
  const [libraryView, setLibraryView] = useState<'programmi' | 'cestino'>('programmi');
  const [libraryFilter, setLibraryFilter] = useState<'tutti' | 'assegnati' | 'bozze' | 'prove'>('tutti');
  const showDeletedPrograms = libraryView === 'cestino';
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
 
    // Se l'indirizzo contiene il rimando dal link di recupero, apro subito il cambio password
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setRecoveryMode(true);
    }
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
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
      checkPrivacyConsent(session.user.id);
      if (role === 'coach') {
        fetchAthletes();
        fetchAllAthleteResultsForCoach();
        fetchAllAthleteMaxesForCoach();
        fetchAllAnamnesisForCoach();
        fetchAllPersonalDataForCoach();
        fetchAllSubscriptionsForCoach();
        fetchTrialCta();
      } else {
        fetchAthleteResults();
        fetchAthleteMaxes(session.user.id);
        fetchOwnAnamnesis(session.user.id);
        fetchPersonalData(session.user.id);
        fetchSubscription(session.user.id);
        fetchTrialCta();
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
        visibility: item.visibility || 'all',
        trialStyle: item.trial_style || null,
        trialGender: item.trial_gender || null,
        trainingTips: item.training_tips || '',
        tipsUpdatedAt: item.tips_updated_at || null,
        nutritionTips: item.nutrition_tips || '',
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
      const lettureMap: { [key: string]: string } = {};
      data.forEach((item: any) => {
        resultsMap[item.program_id] = item.results || {};
        if (item.tips_read_at) lettureMap[item.program_id] = item.tips_read_at;
      });
      setAthleteResults(resultsMap);
      setTipsReadAt(lettureMap);
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
      setSavedMaxes(data.maxes);
    } else {
      setAthleteMaxes({});
      setSavedMaxes({});
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
      setSavedCoachMaxes(map);
    }
  };
 
  const checkPrivacyConsent = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('privacy_consent_at,privacy_version').eq('id', userId).maybeSingle();
 
    // Rileggo i dati aggiornati dell'account: è la fonte più affidabile
    const { data: userData } = await supabase.auth.getUser();
    const meta = userData?.user?.user_metadata || {};
    const metaConsent = meta.privacy_consent_at || null;
    const metaVersion = meta.privacy_version || null;
 
    const consent = data?.privacy_consent_at || metaConsent || null;
    const versione = data?.privacy_version || metaVersion || null;
    setPrivacyConsentAt(consent);
 
    // Serve il consenso se non è mai stato dato, oppure se l'informativa è cambiata
    if (!consent || versione !== PRIVACY_VERSION) {
      setShowConsentGate(true);
      return;
    }
 
    // Allineo le due copie, senza bloccare nulla se l'aggiornamento non è permesso
    if (!data?.privacy_consent_at) {
      await supabase.from('profiles').update({ privacy_consent_at: consent, privacy_version: versione }).eq('id', userId);
    }
    if (!metaConsent) {
      await supabase.auth.updateUser({ data: { privacy_consent_at: consent, privacy_version: versione } });
    }
  };
 
  const acceptPrivacyConsent = async () => {
    if (!consentGateChecked || !session?.user?.id) return;
    setConsentSaving(true);
    const now = new Date().toISOString();
 
    // Salvo il consenso nei dati dell'account: non dipende dai permessi della tabella
    // profiles, quindi resta memorizzato anche se quell'aggiornamento non va a buon fine.
    const { error: metaError } = await supabase.auth.updateUser({ data: { privacy_consent_at: now, privacy_version: PRIVACY_VERSION } });
 
    // Salvo anche sul profilo, verificando che la riga sia stata davvero aggiornata
    const { data: updated, error: profError } = await supabase
      .from('profiles')
      .update({ privacy_consent_at: now, privacy_version: PRIVACY_VERSION })
      .eq('id', session.user.id)
      .select('privacy_consent_at');
 
    setConsentSaving(false);
 
    if (metaError && (profError || !updated || updated.length === 0)) {
      alert('Non è stato possibile salvare il consenso. Riprova; se il problema persiste avvisa il coach.');
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
 
  // Quando l'app torna in primo piano ricontrollo lo stato abbonamento:
  // se il coach l'ha cambiato nel frattempo, la schermata si aggiorna da sola
  useEffect(() => {
    if (!session?.user?.id || role === 'coach') return;
 
    const ricontrolla = () => {
      if (document.visibilityState !== 'visible') return;
      fetchSubscription(session.user.id);
      fetchProgramLibrary();
    };
 
    document.addEventListener('visibilitychange', ricontrolla);
    window.addEventListener('focus', ricontrolla);
    return () => {
      document.removeEventListener('visibilitychange', ricontrolla);
      window.removeEventListener('focus', ricontrolla);
    };
  }, [session, role]);
 
  const fetchSubscription = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('subscription_status,trial_choice,created_at,gender').eq('id', userId).maybeSingle();
    setSubscriptionStatus(data?.subscription_status || 'prova');
    setTrialChoice(data?.trial_choice || null);
    setAthleteGender(data?.gender || null);
    // La settimana di prova parte dall'iscrizione, non dal momento della scelta
    setTrialStartedAt(data?.created_at || null);
  };
 
  const fetchAllSubscriptionsForCoach = async () => {
    const { data } = await supabase.from('profiles').select('id,subscription_status').eq('role', 'athlete');
    if (data) {
      const map: { [k: string]: string } = {};
      data.forEach((p: any) => { map[p.id] = p.subscription_status || 'prova'; });
      setCoachSubs(map);
    }
  };
 
  const creaAtletaManuale = async () => {
    if (!newAthlete.first_name.trim() || !newAthlete.last_name.trim()) {
      alert('Nome e cognome sono obbligatori.');
      return;
    }
    if (!newAthlete.email.trim() || !newAthlete.password) {
      alert('Email e password sono obbligatorie.');
      return;
    }
    if (newAthlete.password.length < 6) {
      alert('La password deve avere almeno 6 caratteri.');
      return;
    }
 
    setAddingAthlete(true);
    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requester_id: session.user.id, ...newAthlete, full_name: `${newAthlete.first_name.trim()} ${newAthlete.last_name.trim()}`, email: newAthlete.email.trim() }),
      });
      const esito = await res.json();
 
      if (!res.ok) {
        alert('Errore: ' + (esito.error || 'creazione non riuscita'));
        return;
      }
 
      alert(`Atleta creato! Comunicagli email e password: al primo accesso gli verrà chiesto di accettare l'informativa privacy.`);
      setNewAthlete(emptyNewAthlete);
      setShowAddAthlete(false);
      fetchAthletes();
      fetchAllSubscriptionsForCoach();
      fetchAllPersonalDataForCoach();
    } catch (err: any) {
      alert('Errore: ' + err.message);
    } finally {
      setAddingAthlete(false);
    }
  };
 
  const setAthleteSubscription = async (athleteId: string, stato: string) => {
    const precedente = coachSubs[athleteId] || 'prova';
    if (precedente === stato) return;
 
    setCoachSubs({ ...coachSubs, [athleteId]: stato });
    const { error } = await supabase.from('profiles').update({ subscription_status: stato }).eq('id', athleteId);
    if (error) {
      alert('Errore: ' + error.message);
      setCoachSubs({ ...coachSubs, [athleteId]: precedente });
      return;
    }
 
    const avvisi: { [k: string]: { title: string; message: string } } = {
      attivo: { title: 'Abbonamento attivo! 🎉', message: 'Il tuo abbonamento è attivo: trovi le tue schede nella sezione Allenamenti.' },
      scaduto: { title: 'Abbonamento scaduto', message: 'Il tuo abbonamento è terminato. Apri l\'app per scoprire come rinnovarlo.' },
      prova: { title: 'Settimana di prova attivata', message: 'Puoi scegliere lo stile di allenamento con cui iniziare la tua settimana di prova.' },
    };
    const avviso = avvisi[stato];
    if (!avviso) return;
 
    fetch('/api/notify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: athleteId, type: `sub_${stato}`, ...avviso }),
    }).catch((err) => console.error('Errore notifica abbonamento:', err));
  };
 
  // Solo il coach può cambiare lo stile: la scadenza resta legata all'iscrizione
  const setAthleteTrialStyle = async (athleteId: string, stile: string) => {
    const nuovo = stile || null;
 
    // Aggiorno subito la scheda aperta, altrimenti il menu resterebbe sul valore vecchio
    if (selectedCoachAthlete?.id === athleteId) {
      setSelectedCoachAthlete({ ...selectedCoachAthlete, trial_choice: nuovo });
    }
    setAthletes((prev: any[]) => prev.map((a) => (a.id === athleteId ? { ...a, trial_choice: nuovo } : a)));
 
    const { error } = await supabase.from('profiles').update({ trial_choice: nuovo }).eq('id', athleteId);
    if (error) {
      alert('Errore: ' + error.message);
      fetchAthletes();
    }
  };
 
  // Apre i consigli e li segna come letti, così il pallino "nuovo" sparisce
  const apriConsigli = async (programId: string, giaAperto: boolean) => {
    if (giaAperto) { setOpenTipsProgram(null); return; }
 
    setOpenTipsProgram(programId);
    setTipsTab('training');
 
    const ora = new Date().toISOString();
    setTipsReadAt((prev) => ({ ...prev, [programId]: ora }));
 
    await supabase.from('program_results').upsert(
      { program_id: programId, athlete_id: session.user.id, tips_read_at: ora, updated_at: ora },
      { onConflict: 'program_id, athlete_id' }
    );
  };
 
  const consigliDaLeggere = (prog: any) => {
    if (!prog?.tipsUpdatedAt) return false;
    const letto = tipsReadAt[prog.id];
    return !letto || new Date(letto).getTime() < new Date(prog.tipsUpdatedAt).getTime();
  };
 
  const chooseTrial = async (stile: string) => {
    const { error } = await supabase.from('profiles').update({ trial_choice: stile }).eq('id', session.user.id);
    if (error) { alert('Errore: ' + error.message); return; }
    setTrialChoice(stile);
  };
 
  const fetchTrialCta = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'trial_cta').maybeSingle();
    if (data?.value) setTrialCta(data.value);
  };
 
  const saveTrialCta = async () => {
    const { error } = await supabase.from('settings').upsert(
      { key: 'trial_cta', value: trialCta, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    alert(error ? 'Errore: ' + error.message : 'Link salvato!');
  };
 
  const fetchPersonalData = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('full_name,birth_date,weight,height,gender,guardian_name').eq('id', userId).maybeSingle();
 
    const meta = session?.user?.user_metadata || {};
    const merged = {
      full_name: data?.full_name || meta.full_name || '',
      birth_date: data?.birth_date || meta.birth_date || '',
      weight: data?.weight ?? meta.weight ?? '',
      height: data?.height ?? meta.height ?? '',
      gender: data?.gender || meta.gender || '',
      guardian_name: data?.guardian_name || meta.guardian_name || ''
    };
    setSavedBirthDate(merged.birth_date || '');
    setPersonalData(merged);
 
    const needsSync =
      (!data?.birth_date && meta.birth_date) ||
      (data?.weight === null && meta.weight) ||
      (data?.height === null && meta.height) ||
      (!data?.gender && meta.gender) ||
      (!data?.guardian_name && meta.guardian_name) ||
      (!data?.full_name && meta.full_name);
 
    if (needsSync) {
      await supabase.from('profiles').update({
        full_name: merged.full_name,
        birth_date: merged.birth_date || null,
        weight: merged.weight ? parseFloat(merged.weight) : null,
        height: merged.height ? parseFloat(merged.height) : null,
        gender: merged.gender || null,
        guardian_name: merged.guardian_name || null
      }).eq('id', userId);
 
      // Rileggo lo stato: il sesso serve a scegliere la scheda di prova giusta
      if (!data?.gender && merged.gender) fetchSubscription(userId);
    }
  };
 
  const fetchAllPersonalDataForCoach = async () => {
    const { data } = await supabase.from('profiles').select('id,full_name,birth_date,weight,height,gender,guardian_name').eq('role', 'athlete');
    if (data) {
      const map: { [key: string]: any } = {};
      data.forEach((item: any) => {
        map[item.id] = {
          full_name: item.full_name || '',
          birth_date: item.birth_date || '',
          weight: item.weight ?? '',
          height: item.height ?? '',
          gender: item.gender || '',
          guardian_name: item.guardian_name || ''
        };
      });
      setCoachAllPersonalData(map);
    }
  };
 
  const savePersonalData = async (userId: string, data: any, isCoachEditing: boolean) => {
    // Se la data di nascita fa cambiare categoria (maggiorenne/minorenne), l'informativa
    // da accettare è un'altra: il consenso va ripreso da capo.
    const dataPrecedente = isCoachEditing
      ? coachAllPersonalData[userId]?.birth_date
      : savedBirthDate;
    const cambiaCategoria = isMinorenne(dataPrecedente) !== isMinorenne(data.birth_date);
 
    if (isMinorenne(data.birth_date) && !String(data.guardian_name || '').trim()) {
      alert('Per gli utenti minorenni è necessario indicare nome e cognome di chi esercita la responsabilità genitoriale.');
      return;
    }
 
    setPersonalDataSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: data.full_name,
      birth_date: data.birth_date || null,
      weight: data.weight ? parseFloat(data.weight) : null,
      height: data.height ? parseFloat(data.height) : null,
      gender: data.gender || null,
      guardian_name: data.guardian_name || null
    }).eq('id', userId);
    setPersonalDataSaving(false);
 
    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
      return;
    }
    if (isCoachEditing) {
      setCoachAllPersonalData({ ...coachAllPersonalData, [userId]: data });
      fetchAthletes();
    } else {
      setSavedBirthDate(data.birth_date || '');
    }
 
    if (cambiaCategoria) {
      // Azzero il consenso: al prossimo caricamento comparirà l'informativa corretta
      await supabase.from('profiles')
        .update({ privacy_consent_at: null, privacy_version: null })
        .eq('id', userId);
 
      if (!isCoachEditing) {
        await supabase.auth.updateUser({ data: { privacy_consent_at: null, privacy_version: null } });
        setPrivacyConsentAt(null);
        setPolicyScrolledToEnd(false);
        setShowConsentGate(true);
        alert('Dati salvati. La data di nascita inserita richiede un\'informativa privacy diversa: ti chiediamo di rileggerla e accettarla.');
        return;
      }
 
      alert('Dati salvati. La nuova data di nascita richiede un\'informativa privacy diversa: al prossimo accesso all\'atleta verrà chiesto di rileggerla e accettarla.');
      return;
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
 
  // Aggiorna solo a schermo mentre si digita (nessun salvataggio, nessun record)
  // Legge/scrive i massimali dell'atleta giusto: se stesso oppure quello aperto dal coach
  const getMaxesOf = (athleteId: string) =>
    athleteId === session?.user?.id ? athleteMaxes : (coachAthleteMaxes[athleteId] || {});
 
  const setMaxesOf = (athleteId: string, updated: any) => {
    if (athleteId === session?.user?.id) setAthleteMaxes(updated);
    else setCoachAthleteMaxes({ ...coachAthleteMaxes, [athleteId]: updated });
  };
 
  const getSavedOf = (athleteId: string) =>
    athleteId === session?.user?.id ? savedMaxes : (savedCoachMaxes[athleteId] || {});
 
  const setSavedOf = (athleteId: string, updated: any) => {
    if (athleteId === session?.user?.id) setSavedMaxes(updated);
    else setSavedCoachMaxes({ ...savedCoachMaxes, [athleteId]: updated });
  };
 
  // Confronto "morbido": ignora maiuscole, spazi e punteggiatura,
  // così "10 cal Assault Bike" e "10cal assault-bike" sono lo stesso esercizio
  const sameName = (a: string, b: string) =>
    String(a).toLowerCase().replace(/[^a-z0-9]/g, '') === String(b).toLowerCase().replace(/[^a-z0-9]/g, '');
 
  const addPrExercise = async (kind: 'metcon' | 'gym') => {
    const name = newPrName.trim();
    if (!name) return;
    const existing = exerciseLibrary.find((e: any) => sameName(e.name, name));
    if (existing) {
      await supabase.from('exercises_library').update({ pr_kind: kind, dismissed: false }).eq('id', existing.id);
    } else {
      await supabase.from('exercises_library').insert([{ name, video_url: '', pr_kind: kind }]);
    }
    setNewPrName('');
    fetchExerciseLibrary();
  };
 
  const removePrExercise = async (name: string) => {
    if (!confirm(`Togliere "${name}" dall'elenco dei PR? I dati già registrati restano nello storico.`)) return;
    const ex = exerciseLibrary.find((e: any) => e.name === name);
    if (!ex) return;
    await supabase.from('exercises_library').update({ pr_kind: null }).eq('id', ex.id);
    fetchExerciseLibrary();
  };
 
  const addMaxTrackedExercise = async () => {
    const name = newMaxExerciseName.trim();
    if (!name) return;
    const existing = exerciseLibrary.find((e: any) => sameName(e.name, name));
    if (existing) {
      await supabase.from('exercises_library').update({ track_max: true, dismissed: false }).eq('id', existing.id);
    } else {
      await supabase.from('exercises_library').insert([{ name, video_url: '', track_max: true }]);
    }
    setNewMaxExerciseName('');
    fetchExerciseLibrary();
  };
 
  const toggleTrackMax = async (id: string, value: boolean) => {
    await supabase.from('exercises_library').update({ track_max: value }).eq('id', id);
    fetchExerciseLibrary();
  };
 
  // Rinomina l'esercizio ovunque: libreria, massimali degli atleti e storico
  const renameExerciseEverywhere = async (id: string, oldName: string, newNameRaw: string) => {
    const newName = newNameRaw.trim();
    if (!newName || newName === oldName) {
      setEditingExerciseId(null);
      setEditingExerciseName('');
      return;
    }
 
    await supabase.from('exercises_library').update({ name: newName }).eq('id', id);
    await supabase.from('athlete_max_history').update({ exercise: newName }).eq('exercise', oldName);
 
    const { data: allMaxes } = await supabase.from('athlete_maxes').select('athlete_id,maxes');
    if (allMaxes) {
      for (const row of allMaxes) {
        const m = row.maxes || {};
        if (m[oldName] === undefined) continue;
        const updated: any = {};
        Object.keys(m).forEach((k) => {
          updated[k === oldName ? newName : k] = m[k];
        });
        await supabase.from('athlete_maxes')
          .upsert({ athlete_id: row.athlete_id, maxes: updated, updated_at: new Date().toISOString() }, { onConflict: 'athlete_id' });
      }
    }
 
    setEditingExerciseId(null);
    setEditingExerciseName('');
    setHistoryCache({});
    fetchExerciseLibrary();
    if (role === 'coach') fetchAllAthleteMaxesForCoach();
    else fetchAthleteMaxes(session.user.id);
  };
 
  const deleteHistoryPoint = async (pointId: string, cacheKey: string) => {
    if (!confirm('Eliminare questo valore dallo storico? Utile se era stato inserito per errore.')) return;
    const { error } = await supabase.from('athlete_max_history').delete().eq('id', pointId);
    if (error) {
      alert('Errore: ' + error.message);
      return;
    }
    setHistoryCache((prev) => ({
      ...prev,
      [cacheKey]: (prev[cacheKey] || []).filter((p: any) => p.id !== pointId),
    }));
  };
 
  // Registra un valore nello storico. Se esiste già un valore per lo stesso
  // esercizio/ripetizioni nello stesso giorno, lo sostituisce: così le correzioni
  // di un dato sbagliato non lasciano tracce nel grafico.
  const recordMaxHistory = async (athleteId: string, exercise: string, reps: number, value: number, source: string) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
 
    const { data: existing } = await supabase
      .from('athlete_max_history')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('exercise', exercise)
      .eq('reps', reps)
      .gte('recorded_at', startOfDay.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1);
 
    if (existing && existing.length > 0) {
      await supabase.from('athlete_max_history')
        .update({ value, source, recorded_at: new Date().toISOString() })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('athlete_max_history').insert([{ athlete_id: athleteId, exercise, reps, value, source }]);
    }
 
    setHistoryCache((prev) => {
      const copy = { ...prev };
      delete copy[`${athleteId}|${exercise}`];
      return copy;
    });
  };
 
  // ---- FORZA ----
  const handleMaxTyping = (exercise: string, reps: number, value: string, athleteId?: string) => {
    const aid = athleteId || session.user.id;
    const cur = getMaxesOf(aid);
    setMaxesOf(aid, { ...cur, [exercise]: { ...(cur[exercise] || {}), [reps]: value } });
  };
 
  const handleMaxChange = async (exercise: string, reps: number, value: string, athleteId?: string) => {
    const aid = athleteId || session.user.id;
    const cur = getMaxesOf(aid);
    const updatedAll = { ...cur, [exercise]: { ...(cur[exercise] || {}), [reps]: value } };
    setMaxesOf(aid, updatedAll);
 
    await supabase.from('athlete_maxes').upsert(
      { athlete_id: aid, maxes: updatedAll, updated_at: new Date().toISOString() },
      { onConflict: 'athlete_id' }
    );
 
    const w = parseWeightValue(value);
    if (w) {
      const prima = parseWeightValue(getSavedOf(aid)[exercise]?.[reps]);
      await recordMaxHistory(aid, exercise, reps, w, 'manuale');
      setSavedOf(aid, updatedAll);
      if (prima === null || w > prima) {
        setPrBadge({
          exercise,
          headline: `${w} kg × ${reps}`,
          subtitle: prima !== null
            ? `Superato il ${reps}RM precedente di ${Math.round((w - prima) * 10) / 10} kg!`
            : `Primo ${reps}RM registrato su questo esercizio!`,
        });
      }
    }
  };
 
  // ---- METCON E GINNASTICA ----
  const handleSpecialMaxTyping = (exercise: string, kind: 'tempo' | 'rep', raw: string, athleteId?: string) => {
    const aid = athleteId || session.user.id;
    const key = kind === 'tempo' ? 'time' : 'reps';
    const cur = getMaxesOf(aid);
    setMaxesOf(aid, { ...cur, [exercise]: { ...(cur[exercise] || {}), [key]: raw } });
  };
 
  const handleSpecialMaxChange = async (exercise: string, kind: 'tempo' | 'rep', raw: string, athleteId?: string) => {
    const aid = athleteId || session.user.id;
    const key = kind === 'tempo' ? 'time' : 'reps';
    const cur = getMaxesOf(aid);
    const updatedAll = { ...cur, [exercise]: { ...(cur[exercise] || {}), [key]: raw } };
    setMaxesOf(aid, updatedAll);
 
    await supabase.from('athlete_maxes').upsert(
      { athlete_id: aid, maxes: updatedAll, updated_at: new Date().toISOString() },
      { onConflict: 'athlete_id' }
    );
 
    const numeric = kind === 'tempo' ? timeToSeconds(raw) : parseWeightValue(raw);
    if (numeric && numeric > 0) {
      const prevRaw = kind === 'tempo' ? getSavedOf(aid)[exercise]?.time : getSavedOf(aid)[exercise]?.reps;
      const prima = kind === 'tempo' ? timeToSeconds(prevRaw) : parseWeightValue(prevRaw);
      await recordMaxHistory(aid, exercise, kind === 'tempo' ? -1 : -2, numeric, kind === 'tempo' ? 'metabolico' : 'ginnastica');
      setSavedOf(aid, updatedAll);
 
      const migliore = kind === 'tempo' ? (prima === null || numeric < prima) : (prima === null || numeric > prima);
      if (migliore) {
        setPrBadge({
          exercise,
          headline: kind === 'tempo' ? secondsToTime(numeric) : `${numeric} ripetizioni`,
          subtitle: prima === null
            ? 'Primo risultato registrato!'
            : kind === 'tempo'
              ? `Tempo migliorato di ${secondsToTime(prima - numeric)}!`
              : `Record superato di ${Math.round((numeric - prima) * 10) / 10} rip.!`,
        });
      }
    }
  };
 
  // ---- BENCHMARK ----
  const handleBenchTyping = (name: string, raw: string, level: string, athleteId?: string) => {
    const aid = athleteId || session.user.id;
    const cur = getMaxesOf(aid);
    setMaxesOf(aid, { ...cur, [name]: { ...(cur[name] || {}), result: raw, level } });
  };
 
  const handleBenchSave = async (name: string, raw: string, level: string, type: string, athleteId?: string) => {
    const aid = athleteId || session.user.id;
    const cur = getMaxesOf(aid);
    const updatedAll = { ...cur, [name]: { ...(cur[name] || {}), result: raw, level } };
    setMaxesOf(aid, updatedAll);
 
    await supabase.from('athlete_maxes').upsert(
      { athlete_id: aid, maxes: updatedAll, updated_at: new Date().toISOString() },
      { onConflict: 'athlete_id' }
    );
 
    const numeric = type === 'time' ? timeToSeconds(raw) : type === 'rounds' ? roundsToNumber(raw) : parseWeightValue(raw);
    if (numeric && numeric > 0) {
      const prevRaw = getSavedOf(aid)[name]?.result;
      const prima = type === 'time' ? timeToSeconds(prevRaw) : type === 'rounds' ? roundsToNumber(prevRaw) : parseWeightValue(prevRaw);
      await recordMaxHistory(aid, name, -3, numeric, 'benchmark');
      setSavedOf(aid, updatedAll);
 
      const migliore = type === 'time' ? (prima === null || numeric < prima) : (prima === null || numeric > prima);
      if (migliore) {
        setPrBadge({
          exercise: name,
          headline: type === 'time' ? secondsToTime(numeric) : type === 'rounds' ? `${numberToRounds(numeric)} round` : `${numeric} ripetizioni`,
          subtitle: prima === null
            ? 'Primo risultato registrato su questo benchmark!'
            : type === 'time'
              ? `Tempo migliorato di ${secondsToTime(prima - numeric)}!`
              : 'Record precedente superato!',
        });
      }
    }
  };
 
  const toggleMaxHistory = async (athleteId: string, exercise: string) => {
    const key = `${athleteId}|${exercise}`;
    if (openHistoryKey === key) {
      setOpenHistoryKey(null);
      return;
    }
    setOpenHistoryKey(key);
    if (historyCache[key]) return;
 
    const { data } = await supabase
      .from('athlete_max_history')
      .select('id,reps,value,recorded_at')
      .eq('athlete_id', athleteId)
      .eq('exercise', exercise)
      .order('recorded_at', { ascending: true });
 
    setHistoryCache((prev) => ({ ...prev, [key]: data || [] }));
  };
 
  // Aggiorna il massimale se il peso inserito nella scheda supera quello registrato
  const maybeUpdateMaxFromScore = async (athleteId: string, exerciseName: string, repsText: any, scoreText: string, isCoachEditing: boolean, blockType?: string, benchLevelOverride?: string) => {
    const nameTrim = String(exerciseName || '').trim();
    if (!nameTrim) return;
 
    const currentAll = isCoachEditing ? (coachAthleteMaxes[athleteId] || {}) : athleteMaxes;
 
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
 
    const saveMax = async (updatedAll: any) => {
      const { error } = await supabase.from('athlete_maxes').upsert(
        { athlete_id: athleteId, maxes: updatedAll, updated_at: new Date().toISOString() },
        { onConflict: 'athlete_id' }
      );
      if (error) return false;
      if (isCoachEditing) {
        setCoachAthleteMaxes({ ...coachAthleteMaxes, [athleteId]: updatedAll });
      } else {
        setAthleteMaxes(updatedAll);
        setSavedMaxes(updatedAll);
      }
      return true;
    };
 
    const wasRecordedToday = async (exercise: string, repsKey: number, source: string) => {
      const { data } = await supabase
        .from('athlete_max_history')
        .select('id')
        .eq('athlete_id', athleteId)
        .eq('exercise', exercise)
        .eq('reps', repsKey)
        .eq('source', source)
        .gte('recorded_at', startOfDay.toISOString())
        .limit(1);
      return !!(data && data.length > 0);
    };
 
    // --- 0. Benchmark WOD ---
    const bench = BENCHMARK_WODS.find((b: any) => b.name.toLowerCase() === nameTrim.toLowerCase());
    if (bench) {
      const val = bench.type === 'time'
        ? timeToSeconds(scoreText)
        : bench.type === 'rounds'
          ? roundsToNumber(scoreText)
          : parseWeightValue(scoreText);
      if (!val || val <= 0) return;
 
      const prevRaw = currentAll[bench.name]?.result;
      const prev = bench.type === 'time'
        ? timeToSeconds(prevRaw)
        : bench.type === 'rounds'
          ? roundsToNumber(prevRaw)
          : parseWeightValue(prevRaw);
 
      const isCorrection = await wasRecordedToday(bench.name, -3, 'scheda');
      const migliore = bench.type === 'time' ? (prev === null || val < prev) : (prev === null || val > prev);
 
      if (!isCorrection && !migliore) return;
      if (isCorrection && prev !== null && val === prev) return;
 
      const testo = bench.type === 'time' ? secondsToTime(val) : bench.type === 'rounds' ? numberToRounds(val) : String(val);
      const updatedAll = { ...currentAll, [bench.name]: { ...(currentAll[bench.name] || {}), result: testo, level: benchLevelOverride || currentAll[bench.name]?.level || 'rx' } };
      if (!(await saveMax(updatedAll))) return;
      await recordMaxHistory(athleteId, bench.name, -3, val, 'scheda');
 
      if (!isCorrection) {
        setPrBadge({
          exercise: bench.name,
          headline: testo,
          subtitle: prev !== null
            ? (bench.type === 'time' ? `Hai migliorato il tuo tempo di ${secondsToTime(prev - val)}!` : 'Hai superato il tuo record precedente!')
            : 'Primo risultato registrato su questo benchmark!',
        });
      }
      return;
    }
 
    // --- 1. Esercizio metabolico: il risultato è un tempo, più basso è meglio ---
    const met = metconPRNames.find((n) => n.toLowerCase() === nameTrim.toLowerCase());
    if (met) {
      const seconds = timeToSeconds(scoreText);
      if (!seconds || seconds <= 0) return;
      const prevSec = timeToSeconds(currentAll[met]?.time);
      const isCorrection = await wasRecordedToday(met, -1, 'scheda');
 
      if (!isCorrection && prevSec !== null && seconds >= prevSec) return;
      if (isCorrection && prevSec !== null && seconds === prevSec) return;
 
      const updatedAll = { ...currentAll, [met]: { ...(currentAll[met] || {}), time: secondsToTime(seconds) } };
      if (!(await saveMax(updatedAll))) return;
      await recordMaxHistory(athleteId, met, -1, seconds, 'scheda');
 
      if (!isCorrection) {
        setPrBadge({
          exercise: met,
          headline: `${secondsToTime(seconds)}`,
          subtitle: prevSec !== null
            ? `Hai migliorato il tuo tempo di ${secondsToTime(prevSec - seconds)}!`
            : 'Primo tempo registrato su questo test!',
        });
      }
      return;
    }
 
    // --- 2. Esercizio di ginnastica: il risultato sono le ripetizioni ---
    const gym = gymPRNames.find((n) => n.toLowerCase() === nameTrim.toLowerCase());
    if (gym) {
      const reps = parseWeightValue(scoreText);
      if (!reps || reps <= 0) return;
      const prevReps = parseWeightValue(currentAll[gym]?.reps);
      const isCorrection = await wasRecordedToday(gym, -2, 'scheda');
 
      if (!isCorrection && prevReps !== null && reps <= prevReps) return;
      if (isCorrection && prevReps !== null && reps === prevReps) return;
 
      const updatedAll = { ...currentAll, [gym]: { ...(currentAll[gym] || {}), reps: String(reps) } };
      if (!(await saveMax(updatedAll))) return;
      await recordMaxHistory(athleteId, gym, -2, reps, 'scheda');
 
      if (!isCorrection) {
        setPrBadge({
          exercise: gym,
          headline: `${reps} ripetizioni`,
          subtitle: prevReps !== null
            ? `Hai superato il tuo record di ${Math.round((reps - prevReps) * 10) / 10} rip.!`
            : 'Primo record registrato su questo esercizio!',
        });
      }
      return;
    }
 
    // --- 3. Esercizio di forza: il risultato è un peso ---
    if (blockType && blockType !== 'forza') return;
 
    const weight = parseWeightValue(scoreText);
    const repsNum = parseWeightValue(repsText);
    if (!weight || !repsNum) return;
 
    const repsInt = Math.round(repsNum);
    if (!REP_SCHEMES.includes(repsInt)) return;
 
    const match = maxExerciseNames.find((n) => n.toLowerCase() === nameTrim.toLowerCase());
    if (!match) return;
 
    const currentEx = currentAll[match] || {};
    const previous = parseWeightValue(currentEx[repsInt]);
    const isCorrection = await wasRecordedToday(match, repsInt, 'scheda');
 
    if (!isCorrection && previous !== null && weight <= previous) return;
    if (isCorrection && previous !== null && weight === previous) return;
 
    const updatedAll = { ...currentAll, [match]: { ...currentEx, [repsInt]: String(weight) } };
    if (!(await saveMax(updatedAll))) return;
    await recordMaxHistory(athleteId, match, repsInt, weight, 'scheda');
 
    if (!isCorrection) {
      setPrBadge({
        exercise: match,
        headline: `${weight} kg × ${repsInt}`,
        subtitle: previous !== null
          ? `Hai superato il tuo ${repsInt}RM precedente di ${Math.round((weight - previous) * 10) / 10} kg!`
          : `Primo ${repsInt}RM registrato su questo esercizio!`,
      });
    }
  };
 
  const handleResultChange = async (programId: string, blockKey: string, field: string, value: string, athleteIdOverride?: string) => {
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
 
  };
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthError('');
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) setAuthError(error.message);
  };
 
  // Se cambiando la data di nascita si passa da maggiorenne a minorenne (o viceversa),
  // l'informativa da leggere è un'altra: il consenso già dato va ripreso da capo.
  const cambiaDataNascita = (nuovaData: string) => {
    const eraMinorenne = isMinorenne(signupBirthDate);
    const oraMinorenne = isMinorenne(nuovaData);
 
    setSignupBirthDate(nuovaData);
 
    if (privacyConsent && eraMinorenne !== oraMinorenne) {
      setPrivacyConsent(false);
      setPolicyScrolledToEnd(false);
      setConsensoAzzerato(true);
    }
 
    if (!oraMinorenne) setSignupGuardian('');
  };
 
  // Duplica un esercizio: nella stessa seduta oppure in altre a scelta
  const apriDuplicaBlocco = (contesto: 'edit' | 'free', wIdx: number, dIdx: number, bIdx: number, blocco: any) => {
    setDupBlock({ contesto, wIdx, dIdx, bIdx, nome: blocco?.name || 'esercizio' });
    setDupTargets([]);
  };
 
  // Elenco di tutte le sedute del programma in lavorazione
  const seduteDelProgramma = (contesto: 'edit' | 'free') => {
    const prog = contesto === 'edit' ? editingProgram : { weeks: programWeeks };
    const settimane = normalizeProgramWeeks(prog);
    const elenco: any[] = [];
    settimane.forEach((w: any, wi: number) => {
      (w.days || []).forEach((d: any, di: number) => {
        elenco.push({
          chiave: `${wi}_${di}`,
          wIdx: wi,
          dIdx: di,
          etichetta: `${w.weekName || `Settimana ${wi + 1}`} — ${d.dayName || `Giorno ${di + 1}`}`,
          quanti: (d.blocks || []).length,
        });
      });
    });
    return elenco;
  };
 
  const confermaDuplica = () => {
    if (!dupBlock) return;
    const { contesto, wIdx, dIdx, bIdx } = dupBlock;
 
    const prog = contesto === 'edit'
      ? JSON.parse(JSON.stringify(editingProgram))
      : { weeks: JSON.parse(JSON.stringify(programWeeks)) };
 
    const settimane = normalizeProgramWeeks(prog);
    const originale = settimane[wIdx]?.days?.[dIdx]?.blocks?.[bIdx];
    if (!originale) { setDupBlock(null); return; }
 
    // Nessuna seduta scelta: duplico subito sotto l'originale, nella stessa seduta
    const destinazioni = dupTargets.length > 0
      ? dupTargets
      : [`${wIdx}_${dIdx}`];
 
    destinazioni.forEach((chiave) => {
      const [wi, di] = chiave.split('_').map(Number);
      const giorno = settimane[wi]?.days?.[di];
      if (!giorno) return;
      const copia = { ...JSON.parse(JSON.stringify(originale)), id: Date.now() + Math.floor(Math.random() * 100000) };
      if (!Array.isArray(giorno.blocks)) giorno.blocks = [];
      if (wi === wIdx && di === dIdx) giorno.blocks.splice(bIdx + 1, 0, copia);
      else giorno.blocks.push(copia);
    });
 
    if (contesto === 'edit') setEditingProgram({ ...prog, weeks: settimane });
    else setProgramWeeks(settimane);
 
    const quante = destinazioni.length;
    setDupBlock(null);
    setDupTargets([]);
    alert(quante === 1 ? 'Esercizio duplicato.' : `Esercizio duplicato in ${quante} sedute.`);
  };
 
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;   // evita doppi invii se si tocca più volte
    setAuthError('');
 
    if (!signupGender) {
      setAuthError('Indica il sesso: serve per assegnarti la scheda corretta.');
      return;
    }
 
    if (!signupBirthDate) {
      setAuthError('Inserisci la data di nascita: serve per stabilire quale informativa privacy ti spetta.');
      return;
    }
 
    if (!firstName.trim() || !lastName.trim()) {
      setAuthError('Inserisci nome e cognome: servono entrambi per completare la registrazione.');
      return;
    }
 
    if (isMinorenne(signupBirthDate) && !signupGuardian.trim()) {
      setAuthError('Per gli utenti minorenni è necessario indicare nome e cognome di chi esercita la responsabilità genitoriale.');
      return;
    }
 
    if (!privacyConsent) {
      setAuthError('Devi accettare l\'informativa sul trattamento dei dati personali per registrarti.');
      return;
    }
 
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          birth_date: signupBirthDate || null,
          gender: signupGender || null,
          guardian_name: signupGuardian.trim() || null,
          weight: signupWeight || null,
          height: signupHeight || null,
          privacy_consent_at: new Date().toISOString(),
          privacy_version: PRIVACY_VERSION
        }
      }
    });
    setAuthLoading(false);
 
    if (error) {
      setAuthError(error.message);
    } else {
      // Mostro subito la conferma: la notifica al coach parte dopo, in sottofondo,
      // così l'utente non resta ad aspettare un'operazione che non lo riguarda.
      setSignupDoneEmail(email);
      setIsRegistering(false);
 
      fetch('/api/notify-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_user',
          title: 'Nuovo utente registrato',
          message: `${[firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || email} si è appena registrato all'app.`
        }),
        keepalive: true,
      }).catch((err) => console.error('Errore notifica nuovo utente:', err));
      setSignupBirthDate('');
      setSignupGender('');
      setSignupGuardian('');
      setConsensoAzzerato(false);
      setFirstName('');
      setLastName('');
      setSignupWeight('');
      setSignupHeight('');
      setPrivacyConsent(false);
    }
  };
 
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthError('');
    setResetMessage('');
    setAuthLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setResetMessage('Controlla la tua email per il link di recupero.');
    }
  };
 
  const cambiaPassword = async () => {
    if (newPassword.length < 6) {
      alert('La password deve avere almeno 6 caratteri.');
      return;
    }
    if (newPassword !== newPassword2) {
      alert('Le due password non coincidono.');
      return;
    }
 
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
 
    if (error) {
      alert('Errore: ' + error.message);
      return;
    }
 
    setNewPassword('');
    setNewPassword2('');
    setRecoveryMode(false);
    setShowChangePassword(false);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    alert('Password aggiornata! Da ora accedi con quella nuova.');
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
 
  // Salva in libreria un esercizio scritto al volo mentre si costruisce una scheda
  const salvaInLibreriaDaScheda = async (nome: string, video: string) => {
    const pulito = String(nome || '').trim();
    if (!pulito) return;
 
    const esistente = exerciseLibrary.find((e: any) => sameName(e.name, pulito));
    if (esistente) {
      if (video && !esistente.video_url) {
        await supabase.from('exercises_library').update({ video_url: video, dismissed: false }).eq('id', esistente.id);
        fetchExerciseLibrary();
        alert(`"${esistente.name}" era già in libreria: ho aggiunto il video.`);
      } else {
        alert(`"${esistente.name}" è già in libreria.`);
      }
      return;
    }
 
    const { error } = await supabase.from('exercises_library').insert([{ name: pulito, video_url: video || '' }]);
    if (error) { alert('Errore: ' + error.message); return; }
    fetchExerciseLibrary();
    alert(`"${pulito}" aggiunto alla libreria.`);
  };
 
  const addGlobalExercise = async (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!newExName) return;
 
    // Se un esercizio con lo stesso nome esiste già, lo aggiorno invece di duplicarlo
    const existing = exerciseLibrary.find((ex: any) => sameName(ex.name, newExName));
    if (existing) {
      if (!confirm(`"${existing.name}" è già in libreria${existing.dismissed ? ' (nel cestino)' : ''}. Vuoi aggiornarlo invece di crearne uno nuovo?`)) return;
      const payload: any = { dismissed: false };
      if (newExVideo) payload.video_url = newExVideo;
      if (newExType) {
        payload.track_max = newExType === 'forza';
        payload.pr_kind = newExType === 'metcon' || newExType === 'gym' ? newExType : null;
      }
      const { error } = await supabase.from('exercises_library').update(payload).eq('id', existing.id);
      if (error) {
        alert('Errore: ' + error.message);
        return;
      }
      setNewExName('');
      setNewExVideo('');
      fetchExerciseLibrary();
      return;
    }
 
    const { error } = await supabase.from('exercises_library').insert([{
      name: newExName,
      video_url: newExVideo,
      track_max: newExType === 'forza',
      pr_kind: newExType === 'metcon' || newExType === 'gym' ? newExType : null,
    }]);
    if (error) {
      alert('Errore: ' + error.message);
    } else {
      setNewExName('');
      setNewExVideo('');
      setNewExType('');
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
      start_date: programTrialStyle ? null : (programStartDate || null),
      end_date: programTrialStyle ? null : (programEndDate || null),
      assigned_athlete_ids: selectedAthleteIds,
      visibility: programTrialStyle ? 'none' : programVisibility,
      trial_style: programTrialStyle || null,
      trial_gender: programTrialStyle === 'pesi' ? (programTrialGender || null) : null,
      training_tips: programTrainingTips || null,
      nutrition_tips: programNutritionTips || null,
      tips_updated_at: (programTrainingTips || programNutritionTips) ? new Date().toISOString() : null,
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
      setProgramVisibility('selected');
      setProgramTrialStyle('');
      setProgramTrialGender('');
      setProgramTrainingTips('');
      setProgramNutritionTips('');
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
    // Il pallino "nuovo" compare all'atleta solo se i consigli sono stati davvero modificati
    const originale = programLibrary.find((p: any) => p.id === editingProgram?.id);
    const consigliCambiati =
      (originale?.trainingTips || '') !== (editingProgram?.trainingTips || '') ||
      (originale?.nutritionTips || '') !== (editingProgram?.nutritionTips || '');
 
    if (!editingProgram.title) {
      alert('Il titolo non può essere vuoto');
      return;
    }
 
    const { error } = await supabase
      .from('programs')
      .update({
        title: editingProgram.title,
        start_date: editingProgram.trialStyle ? null : (editingProgram.startDate || null),
        end_date: editingProgram.trialStyle ? null : (editingProgram.endDate || null),
        assigned_athlete_ids: editingProgram.assignedAthleteIds || [],
        visibility: editingProgram.trialStyle ? 'none' : (editingProgram.visibility || 'selected'),
        trial_style: editingProgram.trialStyle || null,
        trial_gender: editingProgram.trialStyle === 'pesi' ? (editingProgram.trialGender || null) : null,
        training_tips: editingProgram.trainingTips || null,
        nutrition_tips: editingProgram.nutritionTips || null,
        tips_updated_at: consigliCambiati ? new Date().toISOString() : (editingProgram.tipsUpdatedAt || null),
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
 
  const toggleProgramVisibility = async (prog: any) => {
    const next = prog.visibility === 'none'
      ? (prog.assignedAthleteIds?.length > 0 ? 'selected' : 'all')
      : 'none';
    const { error } = await supabase.from('programs').update({ visibility: next }).eq('id', prog.id);
    if (error) {
      alert('Errore: ' + error.message);
      return;
    }
    fetchProgramLibrary();
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
 
  // Rientro dal link di recupero: prima di tutto si imposta la nuova password
  if (recoveryMode) {
    return (
      <div style={{ background: '#18181b', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
 
        <AmtLogo style={{ width: '110px', height: 'auto', color: '#ffffff', display: 'block', marginBottom: '18px' }} />
        <h1 style={{ color: '#10b981', margin: '0 0 6px 0', fontSize: '28px', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '2px' }}>Nuova password</h1>
        <p style={{ color: '#a1a1aa', fontSize: '13px', textAlign: 'center', margin: '0 0 22px 0', maxWidth: '300px', lineHeight: 1.5 }}>
          Scegli la password che userai d&apos;ora in avanti per accedere.
        </p>
 
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
          <input
            type="password"
            placeholder="Nuova password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Ripeti la nuova password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') cambiaPassword(); }}
            style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', boxSizing: 'border-box' }}
          />
          <span style={{ fontSize: '11px', color: '#71717a' }}>Almeno 6 caratteri.</span>
 
          <button
            onClick={cambiaPassword}
            disabled={passwordSaving}
            style={{ padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: passwordSaving ? 0.6 : 1 }}
          >
            {passwordSaving ? 'Salvataggio...' : 'Salva e accedi'}
          </button>
        </div>
      </div>
    );
  }
 
  if (showSplash || loading) {
    return (
      <div style={{ background: '#18181b', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '18px', fontFamily: 'sans-serif' }}>
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
      <div style={{ background: '#18181b', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
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
 
        {signupDoneEmail ? (
          <div style={{ background: '#0f2e22', border: '1px solid #10b981', borderRadius: '14px', padding: '22px 20px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <div style={{ fontSize: '34px', marginBottom: '10px' }}>📬</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontSize: '18px' }}>Ci siamo quasi!</h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#d4d4d8', lineHeight: 1.55 }}>
              Ti abbiamo inviato un&apos;email a <strong style={{ color: '#fff', overflowWrap: 'anywhere' }}>{signupDoneEmail}</strong>.
              Aprila e tocca il link di conferma per attivare il tuo account: solo dopo potrai accedere.
            </p>
            <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: '#a1a1aa', lineHeight: 1.5, background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 12px' }}>
              Non la trovi? Controlla nella posta indesiderata o nello spam: capita spesso che finisca lì.
            </p>
            <button
              onClick={() => { setSignupDoneEmail(''); setPassword(''); }}
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
            >
              Ho confermato, vai all&apos;accesso
            </button>
            <p style={{ margin: '14px 0 0 0', fontSize: '11px', color: '#71717a', lineHeight: 1.5 }}>
              Problemi con la registrazione? Scrivi a{' '}
              <a href="mailto:marcoangelon@gmail.com" style={{ color: '#71717a', textDecoration: 'underline' }}>marcoangelon@gmail.com</a>
            </p>
          </div>
        ) : (
        <>
 
        <form onSubmit={isResettingPassword ? handlePasswordReset : (isRegistering ? handleSignUp : handleLogin)} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '12px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff' }} />
          {!isResettingPassword && (
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff' }} />
          )}
          {isRegistering && !isResettingPassword && (
            <>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="text" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', boxSizing: 'border-box' }} />
                <input type="text" placeholder="Cognome" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                <input type="date" value={signupBirthDate} onChange={(e) => cambiaDataNascita(e.target.value)} required style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', boxSizing: 'border-box' }} />
              </div>
 
              {isMinorenne(signupBirthDate) && (
                <div style={{ background: '#26262a', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#fbbf24', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                    ⚠️ Utente minorenne — dati del genitore
                  </label>
                  <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                    Hai {calcolaEta(signupBirthDate)} anni: per registrarti serve il consenso di chi esercita la responsabilità genitoriale. Indica il suo nome e cognome — l&apos;informativa che leggerai è quella rivolta a lui.
                  </p>
                  <input
                    type="text"
                    placeholder="Nome e cognome del genitore o tutore"
                    value={signupGuardian}
                    onChange={(e) => setSignupGuardian(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', background: '#1c1c20', border: '1px solid #3a3a40', color: '#fff' }}
                  />
                </div>
              )}
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Sesso</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSignupGender(k)}
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', border: signupGender === k ? '2px solid #10b981' : '1px solid #3a3a40', background: signupGender === k ? '#10b981' : '#26262a', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '5px' }}>Serve per assegnarti la scheda di prova corretta.</span>
              </div>
 
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={signupWeight} onChange={(e) => setSignupWeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={signupHeight} onChange={(e) => setSignupHeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
              </div>
 
              {consensoAzzerato && (
                <div style={{ background: '#422006', border: '1px solid #f59e0b', borderRadius: '8px', padding: '11px 13px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '17px', flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.5 }}>
                    Con la data di nascita che hai inserito ti spetta un&apos;informativa diversa da quella che avevi accettato. Rileggila e conferma di nuovo il consenso.
                  </span>
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPolicyScrolledToEnd(false);
                      setShowPrivacyPolicy(true);
                      setConsensoAzzerato(false);
                    } else {
                      setPrivacyConsent(false);
                    }
                  }}
                  style={{ marginTop: '2px', flexShrink: 0 }}
                />
                <span>
                  {isMinorenne(signupBirthDate) ? 'In qualità di esercente la responsabilità genitoriale, ho letto e accetto l’' : 'Ho letto e accetto l’'}
                  <button type="button" onClick={() => setShowPrivacyPolicy(true)} style={{ background: 'none', border: 'none', color: '#10b981', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px' }}>informativa privacy</button>
                  {' '}{isMinorenne(signupBirthDate) ? 'e presto il consenso al trattamento dei dati del minore, inclusi quelli relativi allo stato di salute, per la programmazione degli allenamenti.' : 'e acconsento al trattamento dei miei dati, inclusi quelli relativi allo stato di salute, per la programmazione degli allenamenti.'}
                </span>
              </label>
            </>
          )}
          {authError && <p style={{ color: '#ef4444', fontSize: '14px' }}>{authError}</p>}
          {resetMessage && <p style={{ color: '#10b981', fontSize: '14px' }}>{resetMessage}</p>}
          <button
            type="submit"
            disabled={authLoading}
            style={{ padding: '12px', borderRadius: '8px', background: authLoading ? '#0e8f65' : '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: authLoading ? 'wait' : 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {authLoading && (
              <span style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            )}
            {authLoading
              ? (isResettingPassword ? 'Invio in corso...' : (isRegistering ? 'Registrazione in corso...' : 'Accesso in corso...'))
              : (isResettingPassword ? 'Invia Richiesta' : (isRegistering ? 'Registrati' : 'Accedi'))}
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
        </>
        )}
 
        {showPrivacyPolicy && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 }}>
            <div style={{ background: '#ffffff', color: '#000', borderRadius: '12px', maxWidth: '560px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px 10px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#10b981', fontSize: '17px' }}>
                  {isMinorenne(signupBirthDate) ? 'Informativa per utenti minorenni' : 'Informativa sul trattamento dei dati personali'}
                </h3>
                {isMinorenne(signupBirthDate) && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#92400e', fontWeight: 'bold' }}>
                    Rivolta a chi esercita la responsabilità genitoriale
                  </p>
                )}
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>Scorri fino in fondo per poter proseguire.</p>
              </div>
 
              <div
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setPolicyScrolledToEnd(true);
                }}
                style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: '13px', lineHeight: 1.5 }}
              >
                <PrivacyPolicyContent minor={isMinorenne(signupBirthDate)} />
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '2px solid #10b981' }}>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, fontWeight: 'bold' }}>Hai raggiunto la fine dell&apos;informativa. Puoi chiudere e proseguire con la registrazione.</p>
                </div>
              </div>
 
              <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <button
                  disabled={!policyScrolledToEnd}
                  onClick={() => { setPrivacyConsent(true); setShowPrivacyPolicy(false); }}
                  style={{ width: '100%', padding: '13px', borderRadius: '8px', background: policyScrolledToEnd ? '#10b981' : '#cbd5e1', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: policyScrolledToEnd ? 'pointer' : 'not-allowed' }}
                >
                  {policyScrolledToEnd ? 'Accetta e chiudi' : 'Scorri fino in fondo e accetta'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
 
  // La settimana di prova dura sette giorni dalla scelta, poi scade da sola
  const DURATA_PROVA_GIORNI = 7;
  const trialEndDate = trialStartedAt
    ? new Date(new Date(trialStartedAt).getTime() + DURATA_PROVA_GIORNI * 86400000)
    : null;
  const giorniProvaRimasti = trialEndDate
    ? Math.ceil((trialEndDate.getTime() - Date.now()) / 86400000)
    : 0;
  const provaAttiva = subscriptionStatus === 'prova' && !!trialEndDate && Date.now() < trialEndDate.getTime();
  const provaScaduta = subscriptionStatus === 'prova' && !!trialChoice && !provaAttiva;
 
  const athletePrograms = programLibrary.filter((prog) => {
    if (prog.isDeleted) return false;
 
    // I programmi della settimana di prova: solo a chi ce l'ha attiva e ha scelto quello stile
    if (prog.trialStyle) {
      if (!provaAttiva || trialChoice !== prog.trialStyle) return false;
 
      // Sulla Sala Pesi la scheda cambia in base al sesso: se la scheda ne indica uno,
      // deve corrispondere. Senza sesso nel profilo si ripiega su quella maschile,
      // per non mostrarne due o nessuna.
      if (prog.trialGender) {
        return prog.trialGender === (athleteGender || 'm');
      }
      return true;
    }
 
    // Abbonamento scaduto: nessuna scheda
    if (subscriptionStatus === 'scaduto') return false;
 
    // In prova: solo le schede espressamente assegnate dal coach
    if (subscriptionStatus === 'prova') {
      return prog.visibility !== 'none' && prog.assignedAthleteIds?.includes(session?.user?.id);
    }
 
    if (prog.visibility === 'none') return false;            // bozza: solo il coach
    if (prog.visibility === 'all') return true;              // visibile a tutti
    return prog.assignedAthleteIds?.includes(session?.user?.id); // solo gli assegnati
  }).map((prog) => {
    if (!prog.trialStyle || !trialStartedAt || !trialEndDate) return prog;
    return {
      ...prog,
      startDate: new Date(trialStartedAt).toISOString().split('T')[0],
      endDate: trialEndDate.toISOString().split('T')[0],
    };
  });
 
  const filteredLibraryPrograms = programLibrary.filter((prog) => {
    if (libraryView === 'cestino') return prog.isDeleted;
    if (prog.isDeleted) return false;
 
    // Primo: la categoria
    if (libraryFilter === 'prove') return !!prog.trialStyle;
    if (libraryFilter === 'bozze') return !prog.trialStyle && prog.visibility === 'none';
    if (libraryFilter === 'assegnati' && (prog.trialStyle || prog.visibility === 'none')) return false;
 
    // Poi: il filtro per atleta, valido sia su "Tutti" sia su "Assegnati"
    if (!libraryFilterAthlete) return true;
    if (prog.trialStyle) return false;   // le prove non sono assegnate a nessuno
    return prog.assignedAthleteIds?.includes(libraryFilterAthlete);
  });
 
  const attivi = programLibrary.filter((p: any) => !p.isDeleted);
  const contaAssegnati = attivi.filter((p: any) => !p.trialStyle && p.visibility !== 'none').length;
  const contaBozze = attivi.filter((p: any) => !p.trialStyle && p.visibility === 'none').length;
  const contaProve = attivi.filter((p: any) => !!p.trialStyle).length;
 
  const contaCestino = programLibrary.filter((p: any) => p.isDeleted).length;
 
  return (
    <div style={{ background: '#18181b', backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.035) 0%, transparent 55%), radial-gradient(circle at 80% 100%, rgba(255,255,255,0.025) 0%, transparent 55%)', color: '#fff', minHeight: '100vh', padding: '24px 24px 88px 24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&display=swap');
        button { transition: background-color .16s ease, color .16s ease, border-color .16s ease, transform .1s ease; }
        button:active { transform: scale(0.97); }
        input, select, textarea { transition: border-color .16s ease, box-shadow .16s ease; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #10b981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.18); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
 
      {dupBlock && (() => {
        const sedute = seduteDelProgramma(dupBlock.contesto);
        const corrente = `${dupBlock.wIdx}_${dupBlock.dIdx}`;
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 3000 }}>
            <div style={{ background: '#ffffff', color: '#000', borderRadius: '12px', maxWidth: '480px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '18px 20px 12px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#10b981', fontSize: '17px' }}>Duplica esercizio</h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.45 }}>
                  <strong style={{ color: '#334155' }}>{dupBlock.nome || 'Esercizio senza nome'}</strong><br />
                  Senza selezionare nulla viene duplicato qui sotto, nella seduta corrente. Oppure scegli in quali altre sedute copiarlo.
                </p>
              </div>
 
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
                {sedute.map((s: any) => {
                  const scelta = dupTargets.includes(s.chiave);
                  const isCorrente = s.chiave === corrente;
                  return (
                    <button
                      key={s.chiave}
                      type="button"
                      onClick={() => setDupTargets(scelta ? dupTargets.filter((k) => k !== s.chiave) : [...dupTargets, s.chiave])}
                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', padding: '11px 12px', marginBottom: '7px', borderRadius: '8px', cursor: 'pointer', background: scelta ? '#ecfdf5' : '#f8fafc', border: scelta ? '2px solid #10b981' : '1px solid #e2e8f0' }}
                    >
                      <span style={{ width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#fff', background: scelta ? '#10b981' : '#e2e8f0' }}>
                        {scelta ? '\u2713' : ''}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', overflowWrap: 'anywhere' }}>
                          {s.etichetta}{isCorrente ? ' (seduta corrente)' : ''}
                        </span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                          {s.quanti === 0 ? 'nessun esercizio' : s.quanti === 1 ? '1 esercizio' : `${s.quanti} esercizi`}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
 
              <div style={{ padding: '12px 20px 18px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
                <button type="button" onClick={confermaDuplica} style={{ flex: 1, padding: '13px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                  {dupTargets.length === 0 ? 'Duplica qui' : `Duplica in ${dupTargets.length} sedute`}
                </button>
                <button type="button" onClick={() => { setDupBlock(null); setDupTargets([]); }} style={{ padding: '13px 18px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#334155', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                  Annulla
                </button>
              </div>
            </div>
          </div>
        );
      })()}
 
      {prBadge && (
        <div onClick={() => setPrBadge(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1800 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg, #f59e0b 0%, #d97706 100%)', color: '#fff', borderRadius: '16px', padding: '28px 22px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.9, marginBottom: '10px', fontWeight: 'bold' }}>Nuovo record personale</div>
            <p style={{ fontSize: '19px', lineHeight: 1.4, margin: '0 0 6px 0', fontWeight: 'bold' }}>
              {prBadge.exercise} — {prBadge.headline}
            </p>
            <p style={{ fontSize: '14px', margin: '0 0 20px 0', opacity: 0.95 }}>{prBadge.subtitle}</p>
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
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.85, marginBottom: '12px', fontWeight: 'bold' }}>AM Training</div>
            <p style={{ fontSize: '18px', lineHeight: 1.5, margin: '0 0 22px 0', fontWeight: 'bold', whiteSpace: 'pre-line' }}>{dailyQuote}</p>
            <button onClick={() => setDailyQuote('')} style={{ padding: '12px 28px', borderRadius: '10px', background: '#ffffff', color: '#059669', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
              Ready to start
            </button>
          </div>
        </div>
      )}
 
      {showConsentGate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 2000 }}>
          <div style={{ background: '#ffffff', color: '#000', borderRadius: '12px', padding: '20px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#10b981' }}>
              {privacyConsentAt ? 'Informativa privacy aggiornata' : 'Trattamento dei dati personali'}
            </h3>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
              {privacyConsentAt
                ? 'L\u2019informativa sul trattamento dei dati personali è stata aggiornata: è cambiato anche uno dei fornitori che trattano i tuoi dati. Rileggila e conferma il consenso per continuare a usare l\u2019app.'
                : 'L\u2019app raccoglie anche dati relativi alla tua salute (peso, altezza, problematiche fisiche): la legge richiede per questi un tuo consenso esplicito. Leggi l\u2019informativa e conferma per proseguire.'}
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', maxHeight: '35vh', overflowY: 'auto', marginBottom: '14px' }}>
              <PrivacyPolicyContent minor={isMinorenne(personalData.birth_date)} />
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
 
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #2e2e33', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <AmtLogo style={{ width: '46px', height: 'auto', color: '#ffffff', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '22px', color: '#10b981', margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '2px', lineHeight: 1.1 }}>AMTraining</h2>
            <span style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {(personalData.full_name || session.user.email || '').trim()}{role === 'coach' ? ' · coach' : ''}
            </span>
          </div>
        </div>
 
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              title="Notifiche"
              style={{
                position: 'relative',
                background: '#2e2e33',
                border: '1px solid #3f3f46',
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
                  border: '2px solid #18181b'
                }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
 
            {showNotifications && (
              <div
                onClick={() => setShowNotifications(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
              />
            )}
 
            {showNotifications && (
              <div onClick={(e) => e.stopPropagation()} style={{
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
 
          <button onClick={handleLogout} style={{ background: '#2e2e33', border: '1px solid #3f3f46', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Esci</button>
        </div>
      </header>
 
      {role === 'coach' ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
 
          {coachSubView === 'banner' ? (
            <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', color: '#10b981', marginBottom: '16px' }}>Gestione Banner Pubblicitario</h3>
              <form onSubmit={saveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Carica Nuova Immagine Banner:</label>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setBannerImageFile(e.target.files[0]); }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#000' }} />
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
 
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '2px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', color: '#10b981' }}>🔗 Invito ad abbonarsi</h4>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                  Compare solo agli atleti con abbonamento scaduto, al posto delle schede. Chi è attivo non lo vede mai.
                </p>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Messaggio</label>
                  <textarea
                    rows={5}
                    placeholder={'Scrivi qui il messaggio.\nVai a capo dove vuoi: le righe verranno rispettate.'}
                    value={trialCta.text}
                    onChange={(e) => setTrialCta({ ...trialCta, text: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Link al tuo sito</label>
                  <input
                    type="url"
                    placeholder="https://tuosito.com/programmazioni"
                    value={trialCta.link_url}
                    onChange={(e) => setTrialCta({ ...trialCta, link_url: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <button type="button" onClick={saveTrialCta} style={{ width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  Salva invito
                </button>
              </div>
            </div>
          ) : coachSubView === 'athletes' ? (
            <div>
              {selectedCoachAthlete ? (
                <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0, flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' }}>{selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
                    <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
                  </div>
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    <button onClick={() => setCoachAthleteDetailTab('anagrafici')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anagrafici' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anagrafici' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Dati Anagrafici</button>
                    <button onClick={() => setCoachAthleteDetailTab('anamnesi')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Anamnesi</button>
                    <button onClick={() => setCoachAthleteDetailTab('abbonamento')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'abbonamento' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'abbonamento' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Abbonamento</button>
                  </div>
 
                  <div style={{ display: 'flex', marginBottom: '16px' }}>
                    <button onClick={() => setCoachAthleteDetailTab('maxes')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '13px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'maxes' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Massimali</button>
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
                          <input type="date" value={athData.birth_date} onChange={(e) => updateField('birth_date', e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        {isMinorenne(athData.birth_date) && (
                          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
                            <input type="text" placeholder="Nome e cognome" value={athData.guardian_name || ''} onChange={(e) => updateField('guardian_name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                          </div>
                        )}
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Sesso</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
                              <button key={k} type="button" onClick={() => updateField('gender', k)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: athData.gender === k ? '#10b981' : '#e2e8f0', color: athData.gender === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
                            ))}
                          </div>
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
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                    <button onClick={() => setCoachMaxSubTab('strength')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: coachMaxSubTab === 'strength' ? '#0284c7' : '#f1f5f9', color: coachMaxSubTab === 'strength' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Strength PR</button>
                    <button onClick={() => setCoachMaxSubTab('metcon')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: coachMaxSubTab === 'metcon' ? '#0284c7' : '#f1f5f9', color: coachMaxSubTab === 'metcon' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Metcon PR</button>
                    <button onClick={() => setCoachMaxSubTab('gym')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: coachMaxSubTab === 'gym' ? '#0284c7' : '#f1f5f9', color: coachMaxSubTab === 'gym' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Gymnastics PR</button>
                  <button onClick={() => setCoachMaxSubTab('bench')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: coachMaxSubTab === 'bench' ? '#0284c7' : '#f1f5f9', color: coachMaxSubTab === 'bench' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Benchmark</button>
                  </div>
 
                  {coachMaxSubTab === 'strength' && (
                  <div>
                    <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🏋️ Esercizi tracciati nei massimali</span>
                      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                        Sono gli stessi esercizi della Libreria Esercizi: stesso nome ovunque, così i record dalle schede si agganciano da soli. Vale per tutti gli atleti.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          placeholder="Nuovo esercizio (es. Bench Press)"
                          value={newMaxExerciseName}
                          onChange={(e) => setNewMaxExerciseName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') addMaxTrackedExercise(); }}
                          list="max_ex_suggestions"
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}
                        />
                        <datalist id="max_ex_suggestions">
                          {exerciseLibrary.filter((e: any) => !e.dismissed && !e.track_max).map((e: any) => (
                            <option key={e.id} value={e.name} />
                          ))}
                        </datalist>
                        <button onClick={addMaxTrackedExercise} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
                      </div>
 
                      <button onClick={() => setShowExerciseManager(!showExerciseManager)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                        {showExerciseManager ? '\u25b2 Nascondi gestione esercizi' : '\u25bc Gestisci esercizi'}
                      </button>
 
                      {showExerciseManager && (
                        <div style={{ marginTop: '10px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {exerciseLibrary.filter((e: any) => !e.dismissed).length === 0 ? (
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Nessun esercizio in libreria.</p>
                          ) : exerciseLibrary.filter((e: any) => !e.dismissed).map((ex: any) => (
                            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {editingExerciseId === ex.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingExerciseName}
                                    onChange={(e) => setEditingExerciseName(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') renameExerciseEverywhere(ex.id, ex.name, editingExerciseName); }}
                                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#000', fontSize: '12px' }}
                                    autoFocus
                                  />
                                  <button onClick={() => renameExerciseEverywhere(ex.id, ex.name, editingExerciseName)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Salva</button>
                                  <button onClick={() => { setEditingExerciseId(null); setEditingExerciseName(''); }} style={{ background: '#e2e8f0', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Annulla</button>
                                </>
                              ) : (
                                <>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, cursor: 'pointer' }}>
                                    <input type="checkbox" checked={!!ex.track_max} onChange={(e) => toggleTrackMax(ex.id, e.target.checked)} />
                                    <span style={{ fontSize: '13px', color: '#000' }}>{ex.name}</span>
                                  </label>
                                  <button onClick={() => { setEditingExerciseId(ex.id); setEditingExerciseName(ex.name); }} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>\u270f\ufe0f Rinomina</button>
                                </>
                              )}
                            </div>
                          ))}
                          <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                            La spunta indica se l&apos;esercizio compare tra i massimali. Rinominandolo, il nome cambia anche nella Libreria Esercizi, nei massimali di tutti gli atleti e nello storico.
                          </p>
                        </div>
                      )}
                    </div>
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {maxExerciseNames.map((exName) => {
                      const exMaxes = coachAthleteMaxes[selectedCoachAthlete.id]?.[exName] || {};
                      return (
                        <div key={exName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px', marginBottom: '8px' }}>{exName}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', alignItems: 'stretch' }}>
                            {REP_SCHEMES.map((reps) => (
                              <div key={reps} style={{ background: '#ffffff', padding: '8px 6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>{reps} RM</span>
                                <input
                                  type="text"
                                  placeholder="kg"
                                  value={exMaxes[reps] || ''}
                                  onChange={(e) => handleMaxTyping(exName, reps, e.target.value, selectedCoachAthlete.id)}
                                  onBlur={(e) => handleMaxChange(exName, reps, e.target.value, selectedCoachAthlete.id)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                  style={{ width: '100%', padding: '5px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', boxSizing: 'border-box' }}
                                />
                              </div>
                            ))}
                          </div>
 
                          <button
                            onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)}
                            style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 0 0 0' }}
                          >
                            {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                          </button>
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
                            <MaxHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
                          )}
 
                        </div>
                      );
                    })}
                  </div>
 
                  </div>
                  )}
 
                  {coachMaxSubTab === 'metcon' && (
                  <div>
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: '#10b981' }}>⏱️ Metcon PR</h4>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Gestisci l&apos;elenco dei Metcon PR</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="Nuovo test (es. 400mt Run)" value={newPrName} onChange={(e) => setNewPrName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addPrExercise('metcon'); }} list="pr_suggestions" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                      <datalist id="pr_suggestions">
                        {exerciseLibrary.filter((e: any) => !e.dismissed && !e.pr_kind).map((e: any) => (
                          <option key={e.id} value={e.name} />
                        ))}
                      </datalist>
                      <button onClick={() => addPrExercise('metcon')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
                    </div>
                  </div>
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {metconPRNames.map((exName) => (
                      <div key={exName} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ flex: 1, fontWeight: 'bold', color: '#000', fontSize: '13px' }}>{exName}</span>
                          <ScoreInput
                            mode="time"
                            value={coachAthleteMaxes[selectedCoachAthlete.id]?.[exName]?.time || ''}
                            onChange={(v: string) => handleSpecialMaxTyping(exName, 'tempo', v, selectedCoachAthlete.id)}
                            onCommit={(v: string) => handleSpecialMaxChange(exName, 'tempo', v, selectedCoachAthlete.id)}
                          />
                          <button onClick={() => removePrExercise(exName)} title="Togli dall'elenco PR" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '15px', padding: '0 2px' }}>×</button>
                        </div>
                        <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                        </button>
                        {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
                          <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} lowerIsBetter unit="tempo" onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
                        )}
 
                      </div>
                    ))}
                  </div>
 
                  </div>
                  )}
 
                  {coachMaxSubTab === 'gym' && (
                  <div>
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: '#10b981' }}>🤸 Gymnastics PR</h4>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Gestisci l&apos;elenco dei Gymnastics PR</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder="Nuovo test (es. 400mt Run)" value={newPrName} onChange={(e) => setNewPrName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addPrExercise('gym'); }} list="pr_suggestions_gym" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                      <datalist id="pr_suggestions_gym">
                        {exerciseLibrary.filter((e: any) => !e.dismissed && !e.pr_kind).map((e: any) => (
                          <option key={e.id} value={e.name} />
                        ))}
                      </datalist>
                      <button onClick={() => addPrExercise('gym')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
                    </div>
                  </div>
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {gymPRNames.map((exName) => (
                      <div key={exName} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ flex: 1, fontWeight: 'bold', color: '#000', fontSize: '13px' }}>{exName}</span>
                          <ScoreInput
                            mode="reps"
                            value={coachAthleteMaxes[selectedCoachAthlete.id]?.[exName]?.reps || ''}
                            onChange={(v: string) => handleSpecialMaxTyping(exName, 'rep', v, selectedCoachAthlete.id)}
                            onCommit={(v: string) => handleSpecialMaxChange(exName, 'rep', v, selectedCoachAthlete.id)}
                          />
                          <button onClick={() => removePrExercise(exName)} title="Togli dall'elenco PR" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '15px', padding: '0 2px' }}>×</button>
                        </div>
                        <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                        </button>
                        {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
                          <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} unit="rep" onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
                        )}
 
                      </div>
                    ))}
                  </div>
                  </div>
                  )}
 
                  {coachMaxSubTab === 'bench' && (
                  <div>
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: '#10b981' }}>🏅 Benchmark WOD</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BENCHMARK_WODS.map((b) => {
                      const dato = coachAthleteMaxes[selectedCoachAthlete.id]?.[b.name];
                      const lvl = benchLevel[b.name] || dato?.level || 'rx';
                      return (
                        <div key={b.name} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 'bold', color: '#000', fontSize: '15px' }}>{b.name}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {[['rx', 'RX'], ['int', 'INT'], ['beg', 'BEG']].map(([k, label]) => (
                                <button key={k} onClick={() => setBenchLevel({ ...benchLevel, [b.name]: k as any })} style={{ padding: '4px 9px', borderRadius: '6px', border: 'none', background: lvl === k ? '#10b981' : '#e2e8f0', color: lvl === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{label}</button>
                              ))}
                            </div>
                          </div>
                          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(b, lvl)}</p>
                          <div style={{ fontSize: '10px', color: '#b45309', marginBottom: '8px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(b, lvl)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', flex: 1 }}>Risultato</span>
                            <ScoreInput
                              mode={b.type}
                              value={dato?.result || ''}
                              onChange={(v: string) => handleBenchTyping(b.name, v, lvl, selectedCoachAthlete.id)}
                              onCommit={(v: string) => handleBenchSave(b.name, v, lvl, b.type, selectedCoachAthlete.id)}
                            />
                          </div>
                          <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, b.name)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
                            {openHistoryKey === `${selectedCoachAthlete.id}|${b.name}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                          </button>
                          {openHistoryKey === `${selectedCoachAthlete.id}|${b.name}` && (
                            <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${b.name}`]} lowerIsBetter={b.type === 'time'} unit={b.type === 'time' ? 'tempo' : b.type === 'rounds' ? 'round' : 'rep'} onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${b.name}`)} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  </div>
                  )}
 
                  </div>
                  )}
 
                  {coachAthleteDetailTab === 'abbonamento' && (() => {
                    const stato = coachSubs[selectedCoachAthlete.id] || 'prova';
                    const opzioni = [
                      { k: 'attivo',  t: 'Attivo',  d: 'Vede le sue schede e il banner promozionale', bg: '#dcfce7', bd: '#4ade80', fg: '#166534' },
                      { k: 'prova',   t: 'In prova', d: 'Vede solo la settimana di prova che ha scelto', bg: '#fef9c3', bd: '#facc15', fg: '#854d0e' },
                      { k: 'scaduto', t: 'Scaduto',  d: 'Nessuna scheda: vede l\u2019invito ad abbonarsi', bg: '#fee2e2', bd: '#f87171', fg: '#991b1b' },
                    ];
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '15px', margin: 0, color: '#10b981' }}>Stato abbonamento</h4>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                          Chi si registra parte automaticamente &quot;In prova&quot;. Cambia lo stato quando acquista o quando l&apos;abbonamento finisce.
                        </p>
 
                        {opzioni.map((o) => (
                          <button
                            key={o.k}
                            onClick={() => setAthleteSubscription(selectedCoachAthlete.id, o.k)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
                              padding: '14px', borderRadius: '10px', cursor: 'pointer',
                              background: stato === o.k ? o.bg : '#ffffff',
                              border: stato === o.k ? `2px solid ${o.bd}` : '1px solid #e2e8f0',
                            }}
                          >
                            <span style={{
                              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                              border: `2px solid ${stato === o.k ? o.bd : '#cbd5e1'}`,
                              background: stato === o.k ? o.bd : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontSize: '12px', fontWeight: 'bold',
                            }}>{stato === o.k ? '\u2713' : ''}</span>
                            <span style={{ flex: 1 }}>
                              <span style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', color: stato === o.k ? o.fg : '#334155' }}>{o.t}</span>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{o.d}</span>
                            </span>
                          </button>
                        ))}
 
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>Settimana di prova</span>
                          <select
                            value={selectedCoachAthlete.trial_choice || ''}
                            onChange={(e) => setAthleteTrialStyle(selectedCoachAthlete.id, e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', background: '#fff', marginBottom: '6px' }}
                          >
                            <option value="">Non ancora scelta</option>
                            <option value="pesi">🏋️ Sala Pesi</option>
                            <option value="hybrid">🏃 Hybrid</option>
                            <option value="cross">🤸 Cross Training</option>
                          </select>
                          <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, display: 'block' }}>
                            Solo tu puoi cambiare lo stile: l'atleta lo sceglie una volta sola. La scadenza resta di sette giorni dall'iscrizione e non riparte.
                          </span>
                        </div>
                      </div>
                    );
                  })()}
 
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
                          <select value={athAnamnesi.weekly_sessions} onChange={(e) => updateField('weekly_sessions', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                            <option value="">Seleziona...</option>
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
                          <select value={athAnamnesi.session_duration} onChange={(e) => updateField('session_duration', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
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
                <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta</h3>
 
                  {!showAddAthlete ? (
                    <button
                      onClick={() => setShowAddAthlete(true)}
                      style={{ width: '100%', boxSizing: 'border-box', marginBottom: '14px', padding: '12px', borderRadius: '10px', border: '1px dashed #10b981', background: '#ecfdf5', color: '#047857', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                    >
                      ➕ Aggiungi atleta manualmente
                    </button>
                  ) : (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#10b981' }}>Nuovo atleta</h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
                        L&apos;account viene creato già attivo, senza email di conferma. Comunica tu email e password all&apos;atleta: al primo accesso gli verrà chiesto di accettare l&apos;informativa privacy e potrà cambiare la password dal suo profilo.
                      </p>
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                        <div style={{ display: 'flex', gap: '9px' }}>
                          <input type="text" placeholder="Nome" value={newAthlete.first_name} onChange={(e) => setNewAthlete({ ...newAthlete, first_name: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                          <input type="text" placeholder="Cognome" value={newAthlete.last_name} onChange={(e) => setNewAthlete({ ...newAthlete, last_name: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                        </div>
                        <input type="email" placeholder="Email" value={newAthlete.email} onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                        <input type="text" placeholder="Password provvisoria (min. 6 caratteri)" value={newAthlete.password} onChange={(e) => setNewAthlete({ ...newAthlete, password: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
 
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                          <input type="date" value={newAthlete.birth_date} onChange={(e) => setNewAthlete({ ...newAthlete, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                        </div>
 
                        {isMinorenne(personalData.birth_date) && (
                          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
                            <input type="text" placeholder="Nome e cognome" value={personalData.guardian_name || ''} onChange={(e) => setPersonalData({ ...personalData, guardian_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                          </div>
                        )}
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Sesso</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
                              <button key={k} type="button" onClick={() => setNewAthlete({ ...newAthlete, gender: k })} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: newAthlete.gender === k ? '#10b981' : '#e2e8f0', color: newAthlete.gender === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
                            ))}
                          </div>
                        </div>
 
                        <div style={{ display: 'flex', gap: '9px' }}>
                          <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={newAthlete.weight} onChange={(e) => setNewAthlete({ ...newAthlete, weight: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                          <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={newAthlete.height} onChange={(e) => setNewAthlete({ ...newAthlete, height: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                        </div>
 
                        <div>
                          <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Abbonamento</label>
                          <select value={newAthlete.subscription_status} onChange={(e) => setNewAthlete({ ...newAthlete, subscription_status: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', background: '#fff' }}>
                            <option value="attivo">✅ Attivo</option>
                            <option value="prova">🎁 In prova</option>
                            <option value="scaduto">⛔ Scaduto</option>
                          </select>
                        </div>
 
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <button onClick={creaAtletaManuale} disabled={addingAthlete} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', opacity: addingAthlete ? 0.6 : 1 }}>
                            {addingAthlete ? 'Creazione...' : 'Crea atleta'}
                          </button>
                          <button onClick={() => { setShowAddAthlete(false); setNewAthlete(emptyNewAthlete); }} style={{ padding: '12px 16px', borderRadius: '8px', border: 'none', background: '#e2e8f0', color: '#334155', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
                            Annulla
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {athletes.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Nessun atleta registrato.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {athletes.map((a) => (
                        <div key={a.id} onClick={() => setSelectedCoachAthlete(a)} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            {(() => {
                              const st = coachSubs[a.id] || 'prova';
                              const col = st === 'attivo' ? '#22c55e' : st === 'scaduto' ? '#ef4444' : '#eab308';
                              const lab = st === 'attivo' ? 'Attivo' : st === 'scaduto' ? 'Scaduto' : 'In prova';
                              return <span title={lab} style={{ width: '10px', height: '10px', borderRadius: '50%', background: col, flexShrink: 0 }} />;
                            })()}
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name || a.email}</span>
                          </span>
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
                          <div key={prog.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #d8dde3', marginBottom: '16px' }}>
                            <div
                              onClick={() => setPersonalExpandedProgramId(personalExpandedProgramId === prog.id ? null : prog.id)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: personalExpandedProgramId === prog.id ? '12px' : '0' }}
                            >
                              <h4 style={{ overflowWrap: 'anywhere', margin: 0, color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
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
 
                                    {isMobility(blk.name) ? (
                                      <div>
                                        {blk.wodNotes && (
                                          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{blk.wodNotes}</p>
                                          </div>
                                        )}
                                        <button
                                          onClick={() => handleResultChange(prog.id, resultKey, 'done', coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? '' : 'si', personalSelectedAthleteId)}
                                          style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', border: coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? '2px solid #10b981' : '1px solid #cbd5e1', background: coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? '#ecfdf5' : '#ffffff' }}
                                        >
                                          <span style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#fff', background: coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? '#10b981' : '#e2e8f0' }}>
                                            {coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? '\u2713' : ''}
                                          </span>
                                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? '#047857' : '#334155' }}>
                                            {coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.done ? 'Completata' : 'Segna come fatta'}
                                          </span>
                                        </button>
                                      </div>
                                    ) : blk.type === 'test' ? (
                                      <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '8px', textAlign: 'center' }}>
                                        <span style={{ fontSize: '16px', color: '#1e3a8a', display: 'block', fontWeight: 'bold' }}>{blk.name || 'TEST'}</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e40af', letterSpacing: '0.5px' }}>
                                            {gymPRNames.includes(blk.name) ? 'MAX REP UBK' : metconPRNames.includes(blk.name) ? 'MAX EFFORT' : 'TEST'}
                                        </span>
                                        {blk.target && <span style={{ display: 'block', fontSize: '12px', color: '#1e40af', marginTop: '4px', fontWeight: 'normal' }}>{blk.target}</span>}
                                        {(() => {
                                          const bench = BENCHMARK_WODS.find((b) => b.name === blk.name);
                                          if (!bench) return null;
                                          const lvl = coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.level || blk.benchLevel || 'rx';
                                          return (
                                            <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px', marginTop: '8px', textAlign: 'left' }}>
                                              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                                {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
                                                  <button key={k} type="button" onClick={(e) => { e.stopPropagation(); handleResultChange(prog.id, resultKey, 'level', k, personalSelectedAthleteId); }} style={{ padding: '3px 10px', borderRadius: '6px', border: 'none', background: lvl === k ? '#10b981' : '#e2e8f0', color: lvl === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
                                                ))}
                                              </div>
                                              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
                                              <div style={{ fontSize: '10px', color: '#b45309', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    ) : blk.type === 'forza' ? (
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
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>REC.</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.rest}</span>
                                        </div>
                                      </div>
 
                                      {(() => {
                                        const hint = computeLoadHint(blk.load, blk.reps, trovaMaxes(coachAthleteMaxes[personalSelectedAthleteId], blk.name));
                                        if (!hint) return null;
                                        return (
                                          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '7px 9px', marginTop: '7px' }}>
                                            <span style={{ display: 'block', fontSize: '9px', color: '#1e40af' }}>PESO CONSIGLIATO IN BASE AI SUOI RM</span>
                                            <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1d4ed8' }}>{hint}</span>
                                          </div>
                                        );
                                      })()}
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
                                      <div style={{ display: 'grid', gridTemplateColumns: isMobility(blk.name) ? '1fr' : '1fr 2fr', gap: '8px' }}>
                                        {!isMobility(blk.name) && (
                                        <div>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Score / Carico</label>
                                          {(() => {
                                            const bench = BENCHMARK_WODS.find((b: any) => b.name === blk.name);
                                            const mode = bench ? bench.type
                                              : metconPRNames.includes(blk.name) ? 'time'
                                              : gymPRNames.includes(blk.name) ? 'reps'
                                              : 'text';
                                            const lvl = coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.level || blk.benchLevel || 'rx';
                                            return (
                                              <ScoreInput
                                                mode={mode}
                                                value={currentScore}
                                                onChange={(v: string) => handleResultChange(prog.id, resultKey, 'score', v, personalSelectedAthleteId)}
                                                onCommit={(v: string) => maybeUpdateMaxFromScore(personalSelectedAthleteId, blk.name || '', blk.reps, v, true, blk.type, lvl)}
                                              />
                                            );
                                          })()}
                                        </div>
                                        )}
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
                <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta per il Personal</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {athletes.map((a: any) => (
                      <div
                        key={a.id}
                        onClick={() => setPersonalSelectedAthleteId(a.id)}
                        style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{a.full_name || a.email}</span>
                        <span style={{ fontSize: '12px', color: '#10b981' }}>Vai al Personal →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : editingProgram ? (
            <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Modifica Programma</h3>
                <button onClick={() => setEditingProgram(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Annulla</button>
              </div>
 
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Titolo Programma:</label>
              <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
 
              {editingProgram.trialStyle ? (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>📅 Durata automatica</span>
                  <span style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: 1.4 }}>Le settimane di prova durano sette giorni dal momento in cui l&apos;atleta le sceglie, quindi le date non servono.</span>
                </div>
              ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                  <input type="date" value={editingProgram.startDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                  <input type="date" value={editingProgram.endDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                </div>
              </div>
              )}
 
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Settimana di prova:</label>
                <select value={editingProgram.trialStyle || ''} onChange={(e) => setEditingProgram({ ...editingProgram, trialStyle: e.target.value || null })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '12px', background: '#fff' }}>
                  <option value="">Non è un programma di prova</option>
                  <option value="pesi">🏋️ Prova — Sala Pesi</option>
                  <option value="hybrid">🏃 Prova — Hybrid</option>
                  <option value="cross">🤸 Prova — Cross Training</option>
                </select>
                {editingProgram.trialStyle === 'pesi' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Per quale sesso è questa scheda:</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
                        <button key={k} type="button" onClick={() => setEditingProgram({ ...editingProgram, trialGender: k })} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: (editingProgram.trialGender || '') === k ? '#10b981' : '#e2e8f0', color: (editingProgram.trialGender || '') === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
                      ))}
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '5px' }}>Serve solo per la Sala Pesi: ogni atleta riceve la scheda del proprio sesso.</span>
                  </div>
                )}
 
 
                {!editingProgram.trialStyle && (<>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Chi vede questo programma:</label>
                <select value={editingProgram.visibility || 'selected'} onChange={(e) => {
                  const v = e.target.value;
                  const prev = editingProgram.visibility || 'selected';
                  const ids = v === 'all'
                    ? athletes.map((a: any) => a.id)
                    : v === 'none' || (v === 'selected' && prev === 'all')
                      ? []
                      : (editingProgram.assignedAthleteIds || []);
                  setEditingProgram({ ...editingProgram, visibility: v, assignedAthleteIds: ids });
                }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '12px', background: '#fff' }}>
                  <option value="none">🔒 Nessuno — bozza, la vedi solo tu</option>
                  <option value="all">🌍 Tutti gli atleti</option>
                  <option value="selected">👥 Solo gli atleti selezionati qui sotto</option>
                </select>
                </>)}
                {!editingProgram.trialStyle && (editingProgram.visibility || 'selected') !== 'none' && (<>
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
                </>)}
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
                        style={{ fontWeight: 'bold', color: '#141416', fontSize: '15px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', width: '200px' }}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '6px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', gap: '6px', flex: '1 1 180px', minWidth: 0 }}>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'test')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'test' ? '#10b981' : '#f1f5f9', color: block.type === 'test' ? '#fff' : '#000', cursor: 'pointer' }}>TEST</button>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                    <button type="button" onClick={() => apriDuplicaBlocco('edit', actualWIdx, actualDIdx, bIdx, block)} title="Duplica esercizio" style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', fontSize: '13px' }}>⧉</button>
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
                                  {block.type === 'test' ? (
                                    <select value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '8px' }}>
                                      <option value="">Scegli un test...</option>
                                      <optgroup label="Metcon">
                                        {metconPRNames.map((n: string) => <option key={n} value={n}>{`Max Effort ${n}`}</option>)}
                                      </optgroup>
                                      <optgroup label="Gymnastics">
                                        {gymPRNames.map((n: string) => <option key={n} value={n}>{`Max Rep ${n}`}</option>)}
                                      </optgroup>
                                      <optgroup label="Benchmark WOD">
                                        {BENCHMARK_NAMES.map((n: string) => <option key={n} value={n}>{n}</option>)}
                                      </optgroup>
                                    </select>
                                  ) : block.type === 'forza' ? (
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
                                      <input type="url" value={block.videoUrl || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }} />
                                      {block.name && block.name.trim() && !exerciseLibrary.some((ex: any) => sameName(ex.name, block.name)) && (
                                        <button
                                          type="button"
                                          onClick={() => salvaInLibreriaDaScheda(block.name, block.videoUrl || '')}
                                          style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px', padding: '8px', borderRadius: '6px', border: '1px dashed #10b981', background: '#ecfdf5', color: '#047857', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                                        >
                                          ➕ Salva &quot;{block.name}&quot; in Libreria Esercizi
                                        </button>
                                      )}
                                    </div>
                                    {block.type === 'test' ? (
                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                                        {(() => {
                                          const bench = BENCHMARK_WODS.find((b) => b.name === block.name);
                                          if (!bench) return null;
                                          const lvl = block.benchLevel || 'rx';
                                          return (
                                            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981' }}>{bench.name}</span>
                                                <div style={{ display: 'flex', gap: '3px' }}>
                                                  {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
                                                    <button key={k} type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'benchLevel', k)} style={{ padding: '3px 8px', borderRadius: '5px', border: 'none', background: lvl === k ? '#10b981' : '#e2e8f0', color: lvl === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
                                                  ))}
                                                </div>
                                              </div>
                                              <p style={{ margin: 0, fontSize: '12px', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
                                              <div style={{ fontSize: '10px', color: '#b45309', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
                                            </div>
                                          );
                                        })()}
                                        <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE DEL COACH</label>
                                        <input type="text" placeholder="Indicazioni per l'atleta (facoltativo)" value={block.target || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'target', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                        <p style={{ fontSize: '10px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.3 }}>Blocco di test: niente serie, ripetizioni, carico o recupero.</p>
                                      </div>
                                    ) : isMobility(block.name) ? (
                                      <div>
                                        <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Testo della mobility (lo vedrà l&apos;atleta)</label>
                                        <textarea
                                          rows={6}
                                          placeholder={'Scrivi qui la sequenza.\nVai a capo dove vuoi: le righe vengono rispettate.'}
                                          value={block.wodNotes || ''}
                                          onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)}
                                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '8px' }}
                                        />
                                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', lineHeight: 1.45 }}>
                                          L&apos;atleta non inserisce punteggi: vede il testo e il video, può spuntare &quot;fatto&quot; e lasciare una nota.
                                        </span>
                                      </div>
                                    ) : block.type === 'forza' ? (
                                      <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                            <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                            <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                            <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                            <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                          <input type="text" value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                        <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', boxSizing: 'border-box', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
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
 
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981', display: 'block', marginBottom: '10px' }}>💡 Consigli per l&apos;atleta</span>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Consigli per l&apos;allenamento</label>
                <textarea rows={4} placeholder={'Indicazioni su tecnica, riscaldamento, recuperi, gestione dei carichi...'} value={editingProgram.trainingTips || ''} onChange={(e) => setEditingProgram({ ...editingProgram, trainingTips: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '12px' }} />
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Consigli nutrizionali</label>
                <textarea rows={4} placeholder={'Indicazioni generali su alimentazione e idratazione...'} value={editingProgram.nutritionTips || ''} onChange={(e) => setEditingProgram({ ...editingProgram, nutritionTips: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
              </div>
 
              <button onClick={saveEditedProgram} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>Salva Modifiche</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#2e2e33', color: activeTab === 'create' ? '#fff' : '#d4d4d8', border: activeTab === 'create' ? '2px solid #10b981' : '2px solid #52525b', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Crea Programma</button>
                <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#2e2e33', color: activeTab === 'library' ? '#fff' : '#d4d4d8', border: activeTab === 'library' ? '2px solid #10b981' : '2px solid #52525b', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Programmi</button>
                <button onClick={() => setActiveTab('exercises')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'exercises' ? '#10b981' : '#2e2e33', color: activeTab === 'exercises' ? '#fff' : '#d4d4d8', border: activeTab === 'exercises' ? '2px solid #10b981' : '2px solid #52525b', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Esercizi 🏋️‍♂️</button>
              </div>
 
              {activeTab === 'exercises' ? (
                <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>{showDeletedExercises ? 'Cestino Esercizi' : 'Gestione Libreria Esercizi'}</h3>
                    <button onClick={() => setShowDeletedExercises(!showDeletedExercises)} style={{ padding: '8px 10px', borderRadius: '8px', border: 'none', background: showDeletedExercises ? '#10b981' : '#64748b', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      {showDeletedExercises ? 'Torna agli esercizi' : '🗑️ Cestino'}
                    </button>
                  </div>
 
                  {!showDeletedExercises && (
                    <form onSubmit={addGlobalExercise} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #e2e8f0' }}>
                      <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                      <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                      <select value={newExType} onChange={(e) => setNewExType(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', background: '#fff', marginBottom: '10px' }}>
                        <option value="">Esercizio generico (nessun massimale)</option>
                        <option value="forza">🏋️ Forza — con massimali 1/3/5/10 RM</option>
                        <option value="metcon">⏱️ Metcon — risultato a tempo</option>
                        <option value="gym">🤸 Ginnastica — massimo di ripetizioni</option>
                      </select>
                      <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
                    </form>
                  )}
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exerciseLibrary.filter((ex) => showDeletedExercises ? ex.dismissed : !ex.dismissed).length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{showDeletedExercises ? 'Cestino vuoto.' : 'Nessun esercizio in libreria.'}</p>
                    ) : (
                      sortExerciseLibrary(exerciseLibrary.filter((ex) => showDeletedExercises ? ex.dismissed : !ex.dismissed)).map((ex) => (
                        <div key={ex.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{ex.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.video_url || 'Nessun video'}</div>
                            {ex.pr_kind ? (
                              <span style={{ display: 'inline-block', marginTop: '5px', background: ex.pr_kind === 'metcon' ? '#dbeafe' : '#fce7f3', color: ex.pr_kind === 'metcon' ? '#1e40af' : '#9d174d', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
                                {ex.pr_kind === 'metcon' ? '⏱️ Metcon PR' : '🤸 Gymnastics PR'}
                              </span>
                            ) : ex.track_max ? (
                              <span style={{ display: 'inline-block', marginTop: '5px', background: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
                                🏋️ Forza — massimali
                              </span>
                            ) : null}
                            {!showDeletedExercises && !ex.pr_kind && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '5px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!ex.track_max} onChange={(e) => toggleTrackMax(ex.id, e.target.checked)} />
                                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold' }}>Traccia massimali</span>
                              </label>
                            )}
                          </div>
                          {showDeletedExercises ? (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
 
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
 
                  {programTrialStyle ? (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>📅 Durata automatica</span>
                      <span style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: 1.4 }}>Le settimane di prova durano sette giorni dal momento in cui l&apos;atleta le sceglie, quindi le date non servono.</span>
                    </div>
                  ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                      <input type="date" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                      <input type="date" value={programEndDate} onChange={(e) => setProgramEndDate(e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  )}
 
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Settimana di prova:</label>
                    <select value={programTrialStyle} onChange={(e) => setProgramTrialStyle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '12px', background: '#fff' }}>
                      <option value="">Non è un programma di prova</option>
                      <option value="pesi">🏋️ Prova — Sala Pesi</option>
                      <option value="hybrid">🏃 Prova — Hybrid</option>
                      <option value="cross">🤸 Prova — Cross Training</option>
                    </select>
                    {programTrialStyle === 'pesi' && (
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Per quale sesso è questa scheda:</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
                            <button key={k} type="button" onClick={() => setProgramTrialGender(k)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: programTrialGender === k ? '#10b981' : '#e2e8f0', color: programTrialGender === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '5px' }}>Serve solo per la Sala Pesi: ogni atleta riceve la scheda del proprio sesso.</span>
                      </div>
                    )}
 
 
                    {!programTrialStyle && (<>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Chi vede questo programma:</label>
                    <select value={programVisibility} onChange={(e) => {
                      const v = e.target.value as any;
                      const prev = programVisibility;
                      setProgramVisibility(v);
                      if (v === 'all') setSelectedAthleteIds(athletes.map((a: any) => a.id));
                      if (v === 'none') setSelectedAthleteIds([]);
                      // arrivando da "tutti", riparto senza nessuna spunta
                      if (v === 'selected' && prev === 'all') setSelectedAthleteIds([]);
                    }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '12px', background: '#fff' }}>
                      <option value="none">🔒 Nessuno — bozza, la vedi solo tu</option>
                      <option value="all">🌍 Tutti gli atleti</option>
                      <option value="selected">👥 Solo gli atleti selezionati qui sotto</option>
                    </select>
                    </>)}
                    {!programTrialStyle && programVisibility !== 'none' && (<>
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
                    </>)}
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
                            style={{ fontWeight: 'bold', color: '#141416', fontSize: '15px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', width: '200px' }}
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '6px', flexWrap: 'wrap' }}>
                                      <div style={{ display: 'flex', gap: '6px', flex: '1 1 180px', minWidth: 0 }}>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'test')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'test' ? '#10b981' : '#f1f5f9', color: block.type === 'test' ? '#fff' : '#000', cursor: 'pointer' }}>TEST</button>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                        <button type="button" onClick={() => apriDuplicaBlocco('free', actualWIdx, actualDIdx, bIdx, block)} title="Duplica esercizio" style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '4px 7px', cursor: 'pointer', fontSize: '13px' }}>⧉</button>
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                        <button type="button" onClick={() => removeBlockFromFreeDay(actualWIdx, actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                      </div>
                                    </div>
 
                                    <div style={{ marginBottom: '10px' }}>
                                      {block.type === 'test' ? (
                                        <select value={block.name || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', marginBottom: '8px' }}>
                                          <option value="">Scegli un test...</option>
                                          <optgroup label="Metcon">
                                            {metconPRNames.map((n: string) => <option key={n} value={n}>{`Max Effort ${n}`}</option>)}
                                          </optgroup>
                                          <optgroup label="Gymnastics">
                                            {gymPRNames.map((n: string) => <option key={n} value={n}>{`Max Rep ${n}`}</option>)}
                                          </optgroup>
                                          <optgroup label="Benchmark WOD">
                                            {BENCHMARK_NAMES.map((n: string) => <option key={n} value={n}>{n}</option>)}
                                          </optgroup>
                                        </select>
                                      ) : block.type === 'forza' ? (
                                        <div>
                                          <input
                                            type="text"
                                            list={`ex_list_create_${actualWIdx}_${actualDIdx}_${bIdx}`}
                                            value={block.name || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              const upd = JSON.parse(JSON.stringify(programWeeks));
                                              const target = upd[actualWIdx].days[actualDIdx].blocks[bIdx];
                                              target.name = val;
                                              const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                              if (foundEx && foundEx.video_url) {
                                                target.videoUrl = foundEx.video_url;
                                              }
                                              setProgramWeeks(upd);
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
                                          <input type="url" value={block.videoUrl || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }} />
                                          {block.name && block.name.trim() && !exerciseLibrary.some((ex: any) => sameName(ex.name, block.name)) && (
                                            <button
                                              type="button"
                                              onClick={() => salvaInLibreriaDaScheda(block.name, block.videoUrl || '')}
                                              style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px', padding: '8px', borderRadius: '6px', border: '1px dashed #10b981', background: '#ecfdf5', color: '#047857', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                                            >
                                              ➕ Salva &quot;{block.name}&quot; in Libreria Esercizi
                                            </button>
                                          )}
                                        </div>
                                        {block.type === 'test' ? (
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                                            {(() => {
                                              const bench = BENCHMARK_WODS.find((b) => b.name === block.name);
                                              if (!bench) return null;
                                              const lvl = block.benchLevel || 'rx';
                                              return (
                                                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#10b981' }}>{bench.name}</span>
                                                    <div style={{ display: 'flex', gap: '3px' }}>
                                                      {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
                                                        <button key={k} type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'benchLevel', k)} style={{ padding: '3px 8px', borderRadius: '5px', border: 'none', background: lvl === k ? '#10b981' : '#e2e8f0', color: lvl === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
                                                      ))}
                                                    </div>
                                                  </div>
                                                  <p style={{ margin: 0, fontSize: '12px', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
                                                  <div style={{ fontSize: '10px', color: '#b45309', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
                                                </div>
                                              );
                                            })()}
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE DEL COACH</label>
                                            <input type="text" placeholder="Indicazioni per l'atleta (facoltativo)" value={block.target || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'target', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                            <p style={{ fontSize: '10px', color: '#64748b', margin: '6px 0 0 0', lineHeight: 1.3 }}>Blocco di test: niente serie, ripetizioni, carico o recupero.</p>
                                          </div>
                                        ) : isMobility(block.name) ? (
                                          <div>
                                            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Testo della mobility (lo vedrà l&apos;atleta)</label>
                                            <textarea
                                              rows={6}
                                              placeholder={'Scrivi qui la sequenza.\nVai a capo dove vuoi: le righe vengono rispettate.'}
                                              value={block.wodNotes || ''}
                                              onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)}
                                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '8px' }}
                                            />
                                            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', lineHeight: 1.45 }}>
                                              L&apos;atleta non inserisce punteggi: vede il testo e il video, può spuntare &quot;fatto&quot; e lasciare una nota.
                                            </span>
                                          </div>
                                        ) : block.type === 'forza' ? (
                                          <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                                <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                                <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                                <input type="text" value={block.load} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                                <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                              <input type="text" value={block.notes} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                            <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', boxSizing: 'border-box', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
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
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981', display: 'block', marginBottom: '10px' }}>💡 Consigli per l&apos;atleta</span>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Consigli per l&apos;allenamento</label>
                    <textarea rows={4} placeholder={'Indicazioni su tecnica, riscaldamento, recuperi, gestione dei carichi...'} value={programTrainingTips} onChange={(e) => setProgramTrainingTips(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '12px' }} />
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Consigli nutrizionali</label>
                    <textarea rows={4} placeholder={'Indicazioni generali su alimentazione e idratazione...'} value={programNutritionTips} onChange={(e) => setProgramNutritionTips(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
                  </div>
 
                  <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>
                    {libraryView === 'cestino' ? 'Cestino Programmi' : 'Libreria Programmi'}
                  </h3>
 
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    {[
                      { k: 'programmi', t: '📋 Programmi', n: 0 },
                      { k: 'cestino', t: '🗑️ Cestino', n: contaCestino },
                    ].map((v) => (
                      <button
                        key={v.k}
                        onClick={() => setLibraryView(v.k as any)}
                        style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '9px 10px', borderRadius: '8px', border: 'none', background: libraryView === v.k ? '#10b981' : '#e2e8f0', color: libraryView === v.k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        {v.t}{v.n > 0 ? ` (${v.n})` : ''}
                      </button>
                    ))}
                  </div>
 
                  {libraryView === 'programmi' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {[
                        { k: 'tutti', t: 'Tutti', n: attivi.length, col: '#475569' },
                        { k: 'assegnati', t: '✅ Assegnati', n: contaAssegnati, col: '#16a34a' },
                        { k: 'bozze', t: '🔒 Bozze', n: contaBozze, col: '#d97706' },
                        { k: 'prove', t: '🎁 Prove', n: contaProve, col: '#2563eb' },
                      ].map((f) => (
                        <button
                          key={f.k}
                          onClick={() => setLibraryFilter(f.k as any)}
                          style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 11px', borderRadius: '8px', border: 'none', background: libraryFilter === f.k ? f.col : '#e2e8f0', color: libraryFilter === f.k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
                        >
                          {f.t} ({f.n})
                        </button>
                      ))}
                    </div>
                  )}
 
 
                  {libraryView === 'programmi' && (libraryFilter === 'tutti' || libraryFilter === 'assegnati') && (
                    <select value={libraryFilterAthlete} onChange={(e) => setLibraryFilterAthlete(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', background: '#fff', marginBottom: '12px' }}>
                      <option value="">Filtra per utente (Tutti)</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                      ))}
                    </select>
                  )}
 
                  {filteredLibraryPrograms.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '30px', fontSize: '13px', lineHeight: 1.5 }}>
                      {libraryView === 'cestino'
                        ? 'Il cestino è vuoto.'
                        : libraryFilter === 'prove'
                          ? 'Nessuna settimana di prova. Creane una da "Crea Programma" indicando lo stile nel campo "Settimana di prova".'
                          : libraryFilter === 'bozze'
                            ? 'Nessuna bozza: tutti i programmi sono visibili a qualcuno.'
                            : libraryFilter === 'assegnati'
                              ? 'Nessun programma assegnato.'
                              : 'Nessun programma trovato.'}
                    </p>
                  ) : (
                    filteredLibraryPrograms.map((prog) => {
                      const assignedList = athletes.filter((a) => prog.assignedAthleteIds?.includes(a.id));
                      const progResultsByAthlete = coachAllResults[prog.id] || {};
 
                      const weeks = normalizeProgramWeeks(prog);
                      const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                      const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
                      const activeDay = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
 
                      return (
                        <div key={prog.id} style={{ background: prog.trialStyle ? '#d6e9fb' : prog.visibility === 'none' ? '#fdf3d3' : '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '16px', borderRadius: '14px', border: prog.trialStyle ? '2px solid #3b82f6' : prog.visibility === 'none' ? '2px solid #e0a80c' : '1px solid #d8dde3', marginBottom: '16px' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ overflowWrap: 'anywhere', margin: '0 0 6px 0', color: '#10b981', fontSize: '17px', lineHeight: 1.25 }}>{prog.title}</h4>
                              <div style={{ marginBottom: '8px' }}>
                                {prog.trialStyle ? (
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', background: '#dbeafe', color: '#1e40af' }}>
                                    🎁 Settimana di prova — {prog.trialStyle === 'pesi' ? 'Sala Pesi' : prog.trialStyle === 'hybrid' ? 'Hybrid' : 'Cross Training'}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', background: prog.visibility === 'none' ? '#fef3c7' : prog.visibility === 'all' ? '#e0f2fe' : '#dcfce7', color: prog.visibility === 'none' ? '#92400e' : prog.visibility === 'all' ? '#075985' : '#166534' }}>
                                    {prog.visibility === 'none' ? '🔒 Bozza — non visibile' : prog.visibility === 'all' ? '🌍 Visibile a tutti' : '👥 Visibile agli assegnati'}
                                  </span>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                                {!prog.trialStyle && <span style={{ fontSize: '11px', color: assignedList.length > 0 ? '#0284c7' : '#000000', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                  Assegnato: {assignedList.length > 0 ? assignedList.map(a => (a.full_name || a.email || '').trim()).join(', ') : 'Tutti (Generale)'}
                                </span>}
                                {!prog.trialStyle && (prog.startDate || prog.endDate) && (() => {
                                  const st = getProgramDateStatus(prog.startDate, prog.endDate);
                                  return (
                                  <span style={{ fontSize: '11px', color: st.color, background: st.bg, padding: '3px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>
                                    {st.icon} {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}{st.label ? ` · ${st.label}` : ''}
                                  </span>
                                  ); })()}
 
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {showDeletedPrograms ? (
                                <>
                                  <button onClick={() => restoreProgram(prog.id)} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                                  <button onClick={() => permanentlyDeleteProgram(prog.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ Elimina definitivamente</button>
                                </>
                              ) : (
                                <>
                                  {!prog.trialStyle && <button onClick={() => toggleProgramVisibility(prog)} title={prog.visibility === 'none' ? 'Rendi visibile agli atleti' : 'Nascondi agli atleti'} style={{ background: prog.visibility === 'none' ? '#fef3c7' : '#f4f4f5', border: prog.visibility === 'none' ? '1px solid #fcd34d' : '1px solid #d4d4d8', color: prog.visibility === 'none' ? '#92400e' : '#3f3f46', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{prog.visibility === 'none' ? '👁 Mostra' : '🙈 Nascondi'}</button>}
                                  <button onClick={() => duplicateProgram(prog)} style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
                                  <button onClick={() => {
                                    const progToEdit = JSON.parse(JSON.stringify(prog));
                                    progToEdit.weeks = normalizeProgramWeeks(progToEdit);
                                    setEditingProgram(progToEdit);
                                    if (progToEdit.weeks.length > 0) {
                                      setSelectedWeekView(progToEdit.weeks[0].weekName);
                                      if (progToEdit.weeks[0].days?.length > 0) setSelectedDayView(progToEdit.weeks[0].days[0].dayName);
                                    }
                                  }} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
                                  <button onClick={() => deleteProgram(prog.id)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '5px 10px', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
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
                                      <div key={ath.id} style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                                          <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#0284c7', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {String(athName).trim().charAt(0).toUpperCase()}
                                          </span>
                                          <span style={{ fontSize: '13px', color: '#0284c7', fontWeight: 'bold', overflowWrap: 'anywhere' }}>{athName}</span>
                                        </div>
 
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {blocksOfActiveDay.map((blk: any, bIdx: number) => {
                                            const blockKey = `${wIndex}_${dayIndex}_${bIdx}`;
                                            const blockData = resObj[blockKey];
                                            if (!blockData || (!blockData.score && !blockData.notes)) return null;
 
                                            return (
                                              <div key={bIdx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderLeft: '3px solid #10b981', borderRadius: '8px', padding: '9px 11px' }}>
                                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                                                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000', flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' }}>
                                                    {blk.name || `Esercizio ${bIdx + 1}`}
                                                  </span>
                                                  {blockData.score && (
                                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#047857', background: '#ecfdf5', borderRadius: '6px', padding: '2px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                      {blockData.score}
                                                    </span>
                                                  )}
                                                </div>
                                                {blockData.notes && (
                                                  <p style={{ margin: '6px 0 0 0', fontSize: '11.5px', color: '#64748b', lineHeight: 1.5, fontStyle: 'italic', overflowWrap: 'anywhere' }}>
                                                    &ldquo;{blockData.notes}&rdquo;
                                                  </p>
                                                )}
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
 
          {subscriptionStatus === 'attivo' && bannerData.image_url && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              {bannerData.link_url ? (
                <a href={bannerData.link_url} target="_blank" rel="noopener noreferrer">
                  <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #26262a', cursor: 'pointer' }} />
                </a>
              ) : (
                <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #26262a' }} />
              )}
            </div>
          )}
 
          {provaAttiva && trialChoice && (
            <div style={{ background: '#fef9c3', border: '1px solid #facc15', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              <span style={{ fontSize: '13px', color: '#854d0e', fontWeight: 'bold' }}>
                Settimana di prova — {giorniProvaRimasti === 1 ? 'ultimo giorno' : `ancora ${giorniProvaRimasti} giorni`}
              </span>
            </div>
          )}
 
          {subscriptionStatus === 'prova' && !trialChoice && (
            <div style={{ background: '#fafafa', color: '#000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', borderRadius: '14px', border: '1px solid #d8dde3', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 6px 0', color: '#10b981', fontSize: '19px' }}>🎁 La tua settimana di prova</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Scegli lo stile di allenamento che preferisci: riceverai subito cinque giorni di allenamento da provare.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { k: 'pesi', icon: '🏋️', t: 'Sala Pesi', d: 'Forza e ipertrofia, schede classiche da palestra' },
                  { k: 'hybrid', icon: '🏃', t: 'Hybrid', d: 'Resistenza e forza insieme, lavoro continuo' },
                  { k: 'cross', icon: '🤸', t: 'Cross Training', d: 'Sollevamenti, ginnastica e circuiti misti' },
                ].map((s) => (
                  <button
                    key={s.k}
                    onClick={() => chooseTrial(s.k)}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
                  >
                    <span style={{ fontSize: '26px' }}>{s.icon}</span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '15px', color: '#000' }}>{s.t}</span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>{s.d}</span>
                    </span>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
 
          {(subscriptionStatus === 'scaduto' || provaScaduta) && (
            <div style={{ background: 'linear-gradient(160deg, #10b981 0%, #059669 100%)', color: '#fff', borderRadius: '14px', padding: '24px 20px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 3px 14px rgba(0,0,0,0.32)' }}>
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>💪</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '19px' }}>{provaScaduta ? 'La tua settimana di prova è finita' : 'Vuoi continuare ad allenarti con noi?'}</h3>
              <p style={{ margin: '0 0 18px 0', fontSize: '14px', lineHeight: 1.6, opacity: 0.95, whiteSpace: 'pre-line' }}>
                {trialCta.text || 'Scopri le programmazioni personalizzate e riprendi da dove hai lasciato.'}
              </p>
              <p style={{ margin: '0 0 18px 0', fontSize: '13px', lineHeight: 1.55, opacity: 0.95, background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 14px' }}>
                Quella che hai provato è una scheda standard, uguale per tutti. Il percorso vero è un altro: viene costruito su di te, sui tuoi obiettivi, sul tempo che hai e su eventuali problematiche fisiche — e viene aggiornato man mano che progredisci.
              </p>
              {trialCta.link_url && (
                <a
                  href={trialCta.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', padding: '13px 26px', borderRadius: '10px', background: '#ffffff', color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}
                >
                  Scopri le programmazioni
                </a>
              )}
            </div>
          )}
 
 
 
          {activeTab === 'profile' ? (
            <div style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                <button onClick={() => setAthleteProfileTab('anagrafici')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'anagrafici' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'anagrafici' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Dati Anagrafici</button>
                <button onClick={() => setAthleteProfileTab('anamnesi')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Anamnesi</button>
                <button onClick={() => setAthleteProfileTab('privacy')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'privacy' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'privacy' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Privacy</button>
              </div>
 
              <div style={{ display: 'flex', marginBottom: '16px' }}>
                <button onClick={() => setAthleteProfileTab('maxes')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '13px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'maxes' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Massimali</button>
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
                    <input type="text" value={session.user.email || ''} disabled style={{ overflowWrap: 'anywhere', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#64748b', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                    <input type="date" value={personalData.birth_date} onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  {isMinorenne(personalData.birth_date) && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
                      <input type="text" placeholder="Nome e cognome" value={personalData.guardian_name || ''} onChange={(e) => setPersonalData({ ...personalData, guardian_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Sesso</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
                        <button key={k} type="button" onClick={() => setPersonalData({ ...personalData, gender: k })} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: personalData.gender === k ? '#10b981' : '#e2e8f0', color: personalData.gender === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
                      ))}
                    </div>
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
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                <button onClick={() => setAthleteMaxSubTab('strength')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: athleteMaxSubTab === 'strength' ? '#0284c7' : '#f1f5f9', color: athleteMaxSubTab === 'strength' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Strength PR</button>
                <button onClick={() => setAthleteMaxSubTab('metcon')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: athleteMaxSubTab === 'metcon' ? '#0284c7' : '#f1f5f9', color: athleteMaxSubTab === 'metcon' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Metcon PR</button>
                <button onClick={() => setAthleteMaxSubTab('gym')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: athleteMaxSubTab === 'gym' ? '#0284c7' : '#f1f5f9', color: athleteMaxSubTab === 'gym' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Gymnastics PR</button>
                  <button onClick={() => setAthleteMaxSubTab('bench')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', background: athleteMaxSubTab === 'bench' ? '#0284c7' : '#f1f5f9', color: athleteMaxSubTab === 'bench' ? '#fff' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Benchmark</button>
              </div>
 
              {athleteMaxSubTab === 'strength' && (
              <>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#10b981' }}>Strength PR</h3>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {maxExerciseNames.map((exName) => (
                  <div key={exName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px', marginBottom: '10px' }}>{exName}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', alignItems: 'stretch' }}>
                      {REP_SCHEMES.map((reps) => (
                        <div key={reps} style={{ background: '#ffffff', padding: '8px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>{reps} RM</label>
                          <input type="text" placeholder="kg" value={athleteMaxes[exName]?.[reps] || ''} onChange={(e) => handleMaxTyping(exName, reps, e.target.value)} onBlur={(e) => handleMaxChange(exName, reps, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }} />
                        </div>
                      ))}
                    </div>
 
                    <button
                      onClick={() => toggleMaxHistory(session.user.id, exName)}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 0 0 0' }}
                    >
                      {openHistoryKey === `${session.user.id}|${exName}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                    </button>
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
                      <MaxHistoryChart points={historyCache[`${session.user.id}|${exName}`]} onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
                    )}
 
                  </div>
                ))}
              </div>
 
              </>
              )}
 
              {athleteMaxSubTab === 'metcon' && (
              <>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#10b981' }}>⏱️ Metcon PR</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>Inserisci il tempo nel formato minuti:secondi (es. 1:45). Più basso è, meglio è.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {metconPRNames.map((exName) => (
                  <div key={exName} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ flex: 1, fontWeight: 'bold', color: '#000', fontSize: '13px' }}>{exName}</span>
                      <input
                        type="text"
                        placeholder="mm:ss"
                        value={athleteMaxes[exName]?.time || ''}
                        onChange={(e) => handleSpecialMaxTyping(exName, 'tempo', e.target.value)} onBlur={(e) => handleSpecialMaxChange(exName, 'tempo', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        style={{ width: '90px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
                      />
                    </div>
                    <button onClick={() => toggleMaxHistory(session.user.id, exName)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
                      {openHistoryKey === `${session.user.id}|${exName}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                    </button>
                    {openHistoryKey === `${session.user.id}|${exName}` && (
                      <SimpleHistoryChart points={historyCache[`${session.user.id}|${exName}`]} lowerIsBetter unit="tempo" onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
                    )}
 
                  </div>
                ))}
              </div>
 
              </>
              )}
 
              {athleteMaxSubTab === 'gym' && (
              <>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#10b981' }}>🤸 Gymnastics PR</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>Massimo numero di ripetizioni consecutive (unbroken).</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {gymPRNames.map((exName) => (
                  <div key={exName} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ flex: 1, fontWeight: 'bold', color: '#000', fontSize: '13px' }}>{exName}</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="rep"
                        value={athleteMaxes[exName]?.reps || ''}
                        onChange={(e) => handleSpecialMaxTyping(exName, 'rep', e.target.value)} onBlur={(e) => handleSpecialMaxChange(exName, 'rep', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                        style={{ width: '90px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
                      />
                    </div>
                    <button onClick={() => toggleMaxHistory(session.user.id, exName)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
                      {openHistoryKey === `${session.user.id}|${exName}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                    </button>
                    {openHistoryKey === `${session.user.id}|${exName}` && (
                      <SimpleHistoryChart points={historyCache[`${session.user.id}|${exName}`]} unit="rep" onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
                    )}
 
                  </div>
                ))}
              </div>
              </>
              )}
 
              {athleteMaxSubTab === 'bench' && (
              <>
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#10b981' }}>🏅 Benchmark WOD</h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>Scegli il livello con cui l&apos;hai affrontato e registra il risultato.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {BENCHMARK_WODS.map((b) => {
                  const lvl = benchLevel[b.name] || (athleteMaxes[b.name]?.level as any) || 'rx';
                  const saved = athleteMaxes[b.name]?.result || '';
                  const unita = b.type === 'time' ? 'tempo (mm:ss)' : b.type === 'rounds' ? 'round + rep' : 'ripetizioni';
                  return (
                    <div key={b.name} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'bold', color: '#000', fontSize: '16px' }}>{b.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[['rx', 'RX'], ['int', 'INT'], ['beg', 'BEG']].map(([k, label]) => (
                            <button key={k} onClick={() => setBenchLevel({ ...benchLevel, [b.name]: k as any })} style={{ padding: '4px 9px', borderRadius: '6px', border: 'none', background: lvl === k ? '#10b981' : '#e2e8f0', color: lvl === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{label}</button>
                          ))}
                        </div>
                      </div>
 
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(b, lvl)}</p>
                      <div style={{ fontSize: '11px', color: '#b45309', background: '#fef3c7', display: 'inline-block', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '10px' }}>🎯 Target: {benchTarget(b, lvl)}</div>
 
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', flex: 1 }}>Il tuo risultato — {unita}</span>
                        <ScoreInput
                          mode={b.type}
                          value={saved}
                          onChange={(v: string) => handleBenchTyping(b.name, v, lvl)}
                          onCommit={(v: string) => handleBenchSave(b.name, v, lvl, b.type)}
                        />
                      </div>
 
                      <button onClick={() => toggleMaxHistory(session.user.id, b.name)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
                        {openHistoryKey === `${session.user.id}|${b.name}` ? '▲ Chiudi storico' : '📈 Apri storico'}
                      </button>
                      {openHistoryKey === `${session.user.id}|${b.name}` && (
                        <SimpleHistoryChart points={historyCache[`${session.user.id}|${b.name}`]} lowerIsBetter={b.type === 'time'} unit={b.type === 'time' ? 'tempo' : b.type === 'rounds' ? 'round' : 'rep'} onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${b.name}`)} />
                      )}
                    </div>
                  );
                })}
              </div>
              </>
              )}
 
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
                    <select value={anamnesis.weekly_sessions} onChange={(e) => setAnamnesis({ ...anamnesis, weekly_sessions: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Seleziona...</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
                    <select value={anamnesis.session_duration} onChange={(e) => setAnamnesis({ ...anamnesis, session_duration: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
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
                        <PrivacyPolicyContent minor={isMinorenne(personalData.birth_date)} />
                      </div>
                    )}
                  </div>
 
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>🔑 Cambia password</span>
                    {!showChangePassword ? (
                      <button onClick={() => setShowChangePassword(true)} style={{ padding: '10px 16px', borderRadius: '8px', background: '#475569', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        Imposta una nuova password
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input type="password" placeholder="Nuova password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                        <input type="password" placeholder="Ripeti la nuova password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={cambiaPassword} disabled={passwordSaving} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: passwordSaving ? 0.6 : 1 }}>
                            {passwordSaving ? 'Salvataggio...' : 'Salva'}
                          </button>
                          <button onClick={() => { setShowChangePassword(false); setNewPassword(''); setNewPassword2(''); }} style={{ padding: '10px 16px', borderRadius: '8px', background: '#e2e8f0', color: '#334155', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                            Annulla
                          </button>
                        </div>
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
                <div style={{ background: '#fafafa', color: '#000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '36px 24px', borderRadius: '14px', border: '1px solid #d8dde3', textAlign: 'center' }}>
                  <svg viewBox="0 0 120 90" style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto 18px auto' }} aria-hidden="true">
                    {/* bilanciere appoggiato: nessun allenamento in corso */}
                    <rect x="16" y="43" width="88" height="4" rx="2" fill="#cbd5e1" />
                    <rect x="24" y="34" width="9" height="22" rx="3" fill="#94a3b8" />
                    <rect x="12" y="38" width="8" height="14" rx="3" fill="#cbd5e1" />
                    <rect x="87" y="34" width="9" height="22" rx="3" fill="#94a3b8" />
                    <rect x="100" y="38" width="8" height="14" rx="3" fill="#cbd5e1" />
                    <ellipse cx="60" cy="72" rx="34" ry="4" fill="#e2e8f0" />
                    <circle cx="60" cy="20" r="9" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3 3" />
                    <path d="M60 15v6l4 2" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
 
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#334155' }}>
                    {subscriptionStatus === 'prova' && !trialChoice
                      ? 'Scegli come iniziare'
                      : 'Nessun allenamento assegnato'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.55, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
                    {subscriptionStatus === 'prova' && !trialChoice
                      ? 'Seleziona qui sopra lo stile di allenamento che preferisci per attivare la tua settimana di prova.'
                      : 'Il coach sta preparando il tuo programma. Appena sarà pronto lo troverai qui e riceverai una notifica.'}
                  </p>
                </div>
              ) : (
                athletePrograms.map((prog) => {
                  const weeks = normalizeProgramWeeks(prog);
                  const currentProgramActiveWeek = selectedWeeksByProgram[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                  const currentWeekObj = weeks.find((w: any) => w.weekName === currentProgramActiveWeek) || weeks[0];
                  const currentProgramActiveDay = selectedDaysByProgram[prog.id] || (currentWeekObj?.days && currentWeekObj.days.length > 0 ? currentWeekObj.days[0].dayName : '');
 
                  return (
                    <div key={prog.id} style={{ background: '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '14px', border: '1px solid #d8dde3', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h4 style={{ overflowWrap: 'anywhere', color: '#10b981', margin: 0, fontSize: '18px' }}>{prog.title}</h4>
                        {(prog.startDate || prog.endDate) && (() => {
                          const st = getProgramDateStatus(prog.startDate, prog.endDate);
                          return (
                          <span style={{ fontSize: '12px', color: st.color, background: st.bg, padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                            {st.icon} Dal {formatDateToIT(prog.startDate)} al {formatDateToIT(prog.endDate)}{st.label ? ` · ${st.label}` : ''}
                          </span>
                          ); })()}
                      </div>
 
                      {(prog.trainingTips || prog.nutritionTips) && (() => {
                        const aperto = openTipsProgram === prog.id;
                        const daLeggere = consigliDaLeggere(prog);
                        return (
                        <div style={{ marginBottom: '14px' }}>
                          <button
                            onClick={() => apriConsigli(prog.id, aperto)}
                            style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fde68a', background: '#fffbeb', cursor: 'pointer' }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>💡</span>
                              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#92400e' }}>Consigli del coach</span>
                              {daLeggere && !aperto && (
                                <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>NUOVO</span>
                              )}
                            </span>
                            <span style={{ color: '#b45309', fontWeight: 'bold', fontSize: '14px' }}>{aperto ? '▲' : '▼'}</span>
                          </button>
 
                          {aperto && (
                            <div style={{ marginTop: '8px' }}>
                              {prog.trainingTips && prog.nutritionTips && (
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                                  <button onClick={() => setTipsTab('training')} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: tipsTab === 'training' ? '#10b981' : '#f1f5f9', color: tipsTab === 'training' ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🏋️ Allenamento</button>
                                  <button onClick={() => setTipsTab('nutrition')} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: tipsTab === 'nutrition' ? '#0284c7' : '#f1f5f9', color: tipsTab === 'nutrition' ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🥗 Nutrizione</button>
                                </div>
                              )}
 
                              {prog.trainingTips && (!prog.nutritionTips || tipsTab === 'training') && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px' }}>
                                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#166534', marginBottom: '6px' }}>🏋️ Consigli di allenamento</span>
                                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{prog.trainingTips}</p>
                                </div>
                              )}
 
                              {prog.nutritionTips && (!prog.trainingTips || tipsTab === 'nutrition') && (
                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px' }}>
                                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#1e40af', marginBottom: '6px' }}>🥗 Consigli nutrizionali</span>
                                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{prog.nutritionTips}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        ); })()}
 
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
                                <div
                                  onClick={() => toggleProgramDayCollapse(dayCollapseKey)}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: isDayClosed ? '0' : '12px', cursor: 'pointer' }}
                                >
                                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#141416' }}>{currentWeekObj.weekName} - {day.dayName}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); toggleProgramDayCollapse(dayCollapseKey); }}
                                    title={isDayClosed ? 'Apri' : 'Chiudi'}
                                    style={{ background: 'transparent', border: 'none', color: '#10b981', padding: '4px 6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', lineHeight: 1, flexShrink: 0 }}
                                  >
                                    {isDayClosed ? '▼' : '▲'}
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
                                            <div
                                              onClick={() => toggleBlockCollapse(blockKey)}
                                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}
                                            >
                                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{blk.name}</div>
                                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                {blk.videoUrl && (
                                                  <a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                                    🎥 Video
                                                  </a>
                                                )}
                                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleBlockCollapse(blockKey); }} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#000', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                              </div>
                                            </div>
 
                                            {!isClosed && (
                                              <div>
                                                {isMobility(blk.name) ? (
                                                  <div>
                                                    {blk.wodNotes && (
                                                      <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                                                        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{blk.wodNotes}</p>
                                                      </div>
                                                    )}
                                                    <button
                                                      onClick={() => handleResultChange(prog.id, blockKey, 'done', athleteResults[prog.id]?.[blockKey]?.done ? '' : 'si')}
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', border: athleteResults[prog.id]?.[blockKey]?.done ? '2px solid #10b981' : '1px solid #cbd5e1', background: athleteResults[prog.id]?.[blockKey]?.done ? '#ecfdf5' : '#ffffff' }}
                                                    >
                                                      <span style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: '#fff', background: athleteResults[prog.id]?.[blockKey]?.done ? '#10b981' : '#e2e8f0' }}>
                                                        {athleteResults[prog.id]?.[blockKey]?.done ? '\u2713' : ''}
                                                      </span>
                                                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: athleteResults[prog.id]?.[blockKey]?.done ? '#047857' : '#334155' }}>
                                                        {athleteResults[prog.id]?.[blockKey]?.done ? 'Completata' : 'Segna come fatta'}
                                                      </span>
                                                    </button>
                                                  </div>
                                                ) : blk.type === 'test' ? (
                                                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '8px', textAlign: 'center' }}>
                                                    <span style={{ fontSize: '16px', color: '#1e3a8a', display: 'block', fontWeight: 'bold' }}>{blk.name || 'TEST'}</span>
                                                    <span style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e40af', letterSpacing: '0.5px' }}>
                                                        {gymPRNames.includes(blk.name) ? 'MAX REP UBK' : metconPRNames.includes(blk.name) ? 'MAX EFFORT' : 'TEST'}
                                                    </span>
                                                    {blk.target && <span style={{ display: 'block', fontSize: '12px', color: '#1e40af', marginTop: '4px', fontWeight: 'normal' }}>{blk.target}</span>}
                                                    {(() => {
                                                      const bench = BENCHMARK_WODS.find((b) => b.name === blk.name);
                                                      if (!bench) return null;
                                                      const lvl = athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
                                                      return (
                                                        <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px', marginTop: '8px', textAlign: 'left' }}>
                                                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                                            {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
                                                              <button key={k} type="button" onClick={(e) => { e.stopPropagation(); handleResultChange(prog.id, resultKey, 'level', k); }} style={{ padding: '3px 10px', borderRadius: '6px', border: 'none', background: lvl === k ? '#10b981' : '#e2e8f0', color: lvl === k ? '#fff' : '#334155', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
                                                            ))}
                                                          </div>
                                                          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
                                                          <div style={{ fontSize: '10px', color: '#b45309', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
                                                        </div>
                                                      );
                                                    })()}
                                                  </div>
                                                ) : blk.type === 'forza' ? (
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
                                                      </div>
                                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</span>
                                                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.rest}</span>
                                                      </div>
                                                    </div>
 
                                                    {(() => {
                                                      const hint = computeLoadHint(blk.load, blk.reps, trovaMaxes(athleteMaxes, blk.name));
                                                      if (!hint) return null;
                                                      return (
                                                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '9px 11px', marginTop: '8px' }}>
                                                          <span style={{ display: 'block', fontSize: '10px', color: '#1e40af', marginBottom: '2px' }}>PESO CONSIGLIATO IN BASE AI TUOI RM</span>
                                                          <span style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: '#1d4ed8' }}>{hint}</span>
                                                        </div>
                                                      );
                                                    })()}
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
                                                  <div style={{ display: 'grid', gridTemplateColumns: isMobility(blk.name) ? '1fr' : '1fr 2fr', gap: '8px' }}>
                                                    {!isMobility(blk.name) && (
                                                    <div>
                                                      <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Score / Carico</label>
                                                      {(() => {
                                                        const bench = BENCHMARK_WODS.find((b: any) => b.name === blk.name);
                                                        const mode = bench ? bench.type
                                                          : metconPRNames.includes(blk.name) ? 'time'
                                                          : gymPRNames.includes(blk.name) ? 'reps'
                                                          : 'text';
                                                        const lvl = athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
                                                        return (
                                                          <ScoreInput
                                                            mode={mode}
                                                            value={athleteResults[prog.id]?.[resultKey]?.score || ''}
                                                            onChange={(v: string) => handleResultChange(prog.id, resultKey, 'score', v)}
                                                            onCommit={(v: string) => maybeUpdateMaxFromScore(session.user.id, blk.name || '', blk.reps, v, false, blk.type, lvl)}
                                                          />
                                                        );
                                                      })()}
                                                    </div>
                                                    )}
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
 
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        background: '#1a1a1d',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
        borderTop: '1px solid #2a2a2e',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 500
      }}>
        {(role === 'coach'
          ? [
              { key: 'programs', icon: '📋', label: 'Programmi' },
              { key: 'athletes', icon: '👤', label: 'Profili' },
              { key: 'personal', icon: '📝', label: 'Personal' },
              { key: 'banner', icon: '📢', label: 'Banner' },
            ]
          : [
              { key: 'create', icon: '🏋️', label: 'Allenamenti' },
              { key: 'profile', icon: '👤', label: 'Profilo' },
            ]
        ).map((item) => {
          const active = role === 'coach' ? coachSubView === item.key : activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                if (role === 'coach') {
                  setCoachSubView(item.key as any);
                  if (item.key === 'programs') setEditingProgram(null);
                  if (item.key === 'athletes') setSelectedCoachAthlete(null);
                } else {
                  setActiveTab(item.key as any);
                }
              }}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '10px 2px 20px 2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                color: active ? '#10b981' : '#94a3b8',
                borderTop: active ? '2px solid #10b981' : '2px solid transparent'
              }}
            >
              <span style={{ fontSize: '19px', lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
 