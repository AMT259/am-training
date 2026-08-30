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
function getProgramDateStatus(startDate: any, endDate: any) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
 
  const end = endDate ? new Date(String(endDate).split('T')[0]) : null;
  const start = startDate ? new Date(String(startDate).split('T')[0]) : null;
 
  if (end && !isNaN(end.getTime())) {
    const diff = Math.round((end.getTime() - today.getTime()) / 86400000);
    if (diff < 0) return { color: '#b91c1c', bg: '#fee2e2', icon: '⛔', label: 'Scaduto' };
    if (diff === 0) return { color: '#b91c1c', bg: '#fee2e2', icon: '⚠️', label: 'Scade oggi' };
    if (diff <= 7) return { color: '#b45309', bg: '#fef3c7', icon: '⏳', label: `Scade tra ${diff} ${diff === 1 ? 'giorno' : 'giorni'}` };
  }
 
  if (start && !isNaN(start.getTime()) && start.getTime() > today.getTime()) {
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
  const [policyScrolledToEnd, setPolicyScrolledToEnd] = useState(false);
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
    const { data } = await supabase.from('profiles').select('privacy_consent_at').eq('id', userId).maybeSingle();
 
    // Rileggo i dati aggiornati dell'account: è la fonte più affidabile
    const { data: userData } = await supabase.auth.getUser();
    const metaConsent = userData?.user?.user_metadata?.privacy_consent_at || null;
 
    const consent = data?.privacy_consent_at || metaConsent || null;
    setPrivacyConsentAt(consent);
 
    if (!consent) {
      setShowConsentGate(true);
      return;
    }
 
    // Allineo le due copie, senza bloccare nulla se l'aggiornamento non è permesso
    if (!data?.privacy_consent_at) {
      await supabase.from('profiles').update({ privacy_consent_at: consent }).eq('id', userId);
    }
    if (!metaConsent) {
      await supabase.auth.updateUser({ data: { privacy_consent_at: consent } });
    }
  };
 
  const acceptPrivacyConsent = async () => {
    if (!consentGateChecked || !session?.user?.id) return;
    setConsentSaving(true);
    const now = new Date().toISOString();
 
    // Salvo il consenso nei dati dell'account: non dipende dai permessi della tabella
    // profiles, quindi resta memorizzato anche se quell'aggiornamento non va a buon fine.
    const { error: metaError } = await supabase.auth.updateUser({ data: { privacy_consent_at: now } });
 
    // Salvo anche sul profilo, verificando che la riga sia stata davvero aggiornata
    const { data: updated, error: profError } = await supabase
      .from('profiles')
      .update({ privacy_consent_at: now })
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
    const { data } = await supabase.from('profiles').select('subscription_status,trial_choice,created_at').eq('id', userId).maybeSingle();
    setSubscriptionStatus(data?.subscription_status || 'prova');
    setTrialChoice(data?.trial_choice || null);
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
 
    // Se un esercizio con lo stesso nome esiste già, lo aggiorno invece di duplicarlo
    const existing = exerciseLibrary.find((ex: any) => sameName(ex.name, newExName));
    if (existing) {
      if (!confirm(`"${existing.name}" è già in libreria${existing.dismissed ? ' (nel cestino)' : ''}. Vuoi aggiornarlo invece di crearne uno nuovo?`)) return;
      const payload: any = { dismissed: false };
      if (newExVideo) payload.video_url = newExVideo;
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
      start_date: programTrialStyle ? null : (programStartDate || null),
      end_date: programTrialStyle ? null : (programEndDate || null),
      assigned_athlete_ids: selectedAthleteIds,
      visibility: programTrialStyle ? 'none' : programVisibility,
      trial_style: programTrialStyle || null,
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
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff' }} />
          {!isResettingPassword && (
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff' }} />
          )}
          {isRegistering && !isResettingPassword && (
            <>
              <input type="text" placeholder="Nome e Cognome" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff' }} />
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
                <input type="date" value={signupBirthDate} onChange={(e) => setSignupBirthDate(e.target.value)} required style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={signupWeight} onChange={(e) => setSignupWeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
                <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={signupHeight} onChange={(e) => setSignupHeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#26262a', border: '1px solid #3a3a40', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPolicyScrolledToEnd(false);
                      setShowPrivacyPolicy(true);
                    } else {
                      setPrivacyConsent(false);
                    }
                  }}
                  style={{ marginTop: '2px', flexShrink: 0 }}
                />
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 }}>
            <div style={{ background: '#ffffff', color: '#000', borderRadius: '12px', maxWidth: '560px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px 10px 20px', borderBottom: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, color: '#10b981', fontSize: '17px' }}>Informativa sul trattamento dei dati personali</h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>Scorri fino in fondo per poter proseguire.</p>
              </div>
 
              <div
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setPolicyScrolledToEnd(true);
                }}
                style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: '13px', lineHeight: 1.5 }}
              >
                <PrivacyPolicyContent />
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
                  {policyScrolledToEnd ? 'Ho letto e accetto — Chiudi' : 'Scorri fino in fondo per continuare'}
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
      return provaAttiva && trialChoice === prog.trialStyle;
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
 
    // Le prove non si assegnano, quindi restano visibili anche filtrando per atleta
    if (prog.trialStyle) return true;
 
    if (!libraryFilterAthlete) return true;
    return prog.assignedAthleteIds?.includes(libraryFilterAthlete);
  });
 
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>{selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
                    <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
                  </div>
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    <button onClick={() => setCoachAthleteDetailTab('anagrafici')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anagrafici' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anagrafici' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Dati Anagrafici</button>
                    <button onClick={() => setCoachAthleteDetailTab('maxes')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'maxes' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Massimali</button>
                    <button onClick={() => setCoachAthleteDetailTab('abbonamento')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'abbonamento' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'abbonamento' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Abbonamento</button>
                    <button onClick={() => setCoachAthleteDetailTab('anamnesi')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Anamnesi</button>
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
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {REP_SCHEMES.map((reps) => (
                              <div key={reps} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{reps} RM</span>
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
 
                                    {blk.type === 'test' ? (
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
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{a.full_name || a.email}</span>
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
                            {ex.pr_kind && (
                              <span style={{ display: 'inline-block', marginTop: '5px', background: ex.pr_kind === 'metcon' ? '#dbeafe' : '#fce7f3', color: ex.pr_kind === 'metcon' ? '#1e40af' : '#9d174d', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
                                {ex.pr_kind === 'metcon' ? 'Metcon PR' : 'Gymnastics PR'}
                              </span>
                            )}
                            {!showDeletedExercises && !ex.pr_kind && (
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '5px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!ex.track_max} onChange={(e) => toggleTrackMax(ex.id, e.target.checked)} />
                                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 'bold' }}>Traccia massimali</span>
                              </label>
                            )}
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
                    <select value={libraryFilterAthlete} onChange={(e) => setLibraryFilterAthlete(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', background: '#fff', marginBottom: '12px' }}>
                      <option value="">Filtra per utente (Tutti)</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                      ))}
                    </select>
                  )}
 
                  {filteredLibraryPrograms.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '30px', fontSize: '13px', lineHeight: 1.5 }}>
                      {libraryView === 'cestino' ? 'Il cestino è vuoto.' : 'Nessun programma trovato.'}
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
                        <div key={prog.id} style={{ background: prog.trialStyle ? '#eff6ff' : prog.visibility === 'none' ? '#fff8e6' : '#fafafa', color: '#000000', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '16px', borderRadius: '14px', border: prog.trialStyle ? '2px solid #93c5fd' : prog.visibility === 'none' ? '1px solid #f0c674' : '1px solid #d8dde3', marginBottom: '16px' }}>
                          <div style={{ marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ margin: '0 0 6px 0', color: '#10b981', fontSize: '17px', lineHeight: 1.25 }}>{prog.title}</h4>
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
                <button onClick={() => setAthleteProfileTab('maxes')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'maxes' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Massimali</button>
                <button onClick={() => setAthleteProfileTab('anamnesi')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Anamnesi</button>
                <button onClick={() => setAthleteProfileTab('privacy')} style={{ flex: '1 1 auto', minWidth: 'fit-content', padding: '8px 10px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'privacy' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'privacy' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>Privacy</button>
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
                    <input type="date" value={personalData.birth_date} onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {REP_SCHEMES.map((reps) => (
                        <div key={reps} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{reps} RM (kg)</label>
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
                        <h4 style={{ color: '#10b981', margin: 0, fontSize: '18px' }}>{prog.title}</h4>
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
                                                {blk.type === 'test' ? (
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
 
 