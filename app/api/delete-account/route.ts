// app/api/delete-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { autoRefreshToken: false, persistSession: false } }
);
 
export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();
 
    if (!user_id) {
      return NextResponse.json({ error: 'user_id obbligatorio' }, { status: 400 });
    }
 
    // Cancella tutti i dati collegati all'utente
    await supabaseAdmin.from('athlete_anamnesis').delete().eq('athlete_id', user_id);
    await supabaseAdmin.from('athlete_maxes').delete().eq('athlete_id', user_id);
    await supabaseAdmin.from('program_results').delete().eq('athlete_id', user_id);
    await supabaseAdmin.from('push_subscriptions').delete().eq('user_id', user_id);
    await supabaseAdmin.from('notifications').delete().eq('user_id', user_id);
    await supabaseAdmin.from('profiles').delete().eq('id', user_id);
 
    // Cancella infine l'utente dall'autenticazione
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
 
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore eliminazione account' }, { status: 500 });
  }
}
 