// app/api/notify-coach/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
 
export async function POST(req: NextRequest) {
  try {
    const { type, title, message } = await req.json();
 
    if (!title || !message) {
      return NextResponse.json({ error: 'title e message sono obbligatori' }, { status: 400 });
    }
 
    const { data: coaches, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'coach');
 
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!coaches || coaches.length === 0) {
      return NextResponse.json({ notified: 0 });
    }
 
    const notificationType = `${type || 'generic'}_${Date.now()}`;
 
    const rows = coaches.map((c) => ({
      user_id: c.id,
      title,
      message,
      notification_type: notificationType,
      is_read: false,
      dismissed: false,
    }));
 
    await supabaseAdmin.from('notifications').insert(rows);
 
    const origin = req.nextUrl.origin;
    await Promise.allSettled(
      coaches.map((c) =>
        fetch(`${origin}/api/send-push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: c.id, title, message }),
        })
      )
    );
 
    return NextResponse.json({ notified: coaches.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore notifica coach' }, { status: 500 });
  }
}
 