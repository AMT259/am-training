// app/api/notify-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
 
export async function POST(req: NextRequest) {
  try {
    const { user_id, type, title, message } = await req.json();
 
    if (!user_id || !title || !message) {
      return NextResponse.json({ error: 'user_id, title e message sono obbligatori' }, { status: 400 });
    }
 
    await supabaseAdmin.from('notifications').insert([{
      user_id,
      title,
      message,
      notification_type: `${type || 'generic'}_${Date.now()}`,
      is_read: false,
      dismissed: false,
    }]);
 
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
 