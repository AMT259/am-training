// app/api/cron/birthdays/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
 
export const dynamic = 'force-dynamic';
 
export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const todayKey = `${today.getFullYear()}-${String(todayMonth).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`;
 
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, birth_date, role');
 
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
 
    const birthdayPeople = (profiles || []).filter((p: any) => {
      if (!p.birth_date) return false;
      const d = new Date(p.birth_date);
      return d.getMonth() + 1 === todayMonth && d.getDate() === todayDay;
    });
 
    if (birthdayPeople.length === 0) {
      return NextResponse.json({ birthdays: 0 });
    }
 
    const coaches = (profiles || []).filter((p: any) => p.role === 'coach');
    const origin = req.nextUrl.origin;
    const rows: any[] = [];
    const pushes: { user_id: string; title: string; message: string }[] = [];
 
    for (const person of birthdayPeople) {
      const name = person.full_name || 'Un atleta';
 
      // Auguri all'interessato
      const selfType = `birthday_self_${person.id}_${todayKey}`;
      rows.push({
        user_id: person.id,
        title: 'Buon compleanno! 🎉',
        message: 'Tanti auguri da tutto il team AM Training!',
        notification_type: selfType,
        is_read: false,
        dismissed: false,
      });
      pushes.push({
        user_id: person.id,
        title: 'Buon compleanno! 🎉',
        message: 'Tanti auguri da tutto il team AM Training!',
      });
 
      // Avviso ai coach
      for (const coach of coaches) {
        if (coach.id === person.id) continue;
        const coachType = `birthday_coach_${person.id}_${todayKey}`;
        rows.push({
          user_id: coach.id,
          title: 'Compleanno di oggi 🎂',
          message: `Oggi è il compleanno di ${name}.`,
          notification_type: coachType,
          is_read: false,
          dismissed: false,
        });
        pushes.push({
          user_id: coach.id,
          title: 'Compleanno di oggi 🎂',
          message: `Oggi è il compleanno di ${name}.`,
        });
      }
    }
 
    // Evita duplicati se il cron gira più volte nello stesso giorno
    const types = rows.map((r) => r.notification_type);
    const { data: existing } = await supabaseAdmin
      .from('notifications')
      .select('user_id, notification_type')
      .in('notification_type', types);
 
    const already = new Set((existing || []).map((e: any) => `${e.user_id}|${e.notification_type}`));
    const newRows = rows.filter((r) => !already.has(`${r.user_id}|${r.notification_type}`));
 
    if (newRows.length === 0) {
      return NextResponse.json({ birthdays: birthdayPeople.length, sent: 0, note: 'già inviate oggi' });
    }
 
    await supabaseAdmin.from('notifications').insert(newRows);
 
    const newKeys = new Set(newRows.map((r) => r.user_id + '|' + r.title));
    await Promise.allSettled(
      pushes
        .filter((p) => newKeys.has(p.user_id + '|' + p.title))
        .map((p) =>
          fetch(`${origin}/api/send-push`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          })
        )
    );
 
    return NextResponse.json({ birthdays: birthdayPeople.length, sent: newRows.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore cron compleanni' }, { status: 500 });
  }
}
 