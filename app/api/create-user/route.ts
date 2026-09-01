// app/api/create-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
 
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requester_id, email, password, full_name, birth_date, gender, weight, height, subscription_status } = body;
 
    if (!requester_id) {
      return NextResponse.json({ error: 'Richiesta non autorizzata' }, { status: 401 });
    }
 
    // Solo il coach può creare utenti
    const { data: richiedente } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', requester_id)
      .maybeSingle();
 
    if (richiedente?.role !== 'coach') {
      return NextResponse.json({ error: 'Solo il coach può aggiungere utenti' }, { status: 403 });
    }
 
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password sono obbligatorie' }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: 'La password deve avere almeno 6 caratteri' }, { status: 400 });
    }
 
    const { data: creato, error: errCreate } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,   // niente email di conferma: lo aggiunge il coach
      user_metadata: {
        full_name: full_name || '',
        birth_date: birth_date || null,
        gender: gender || null,
        weight: weight || null,
        height: height || null,
      },
    });
 
    if (errCreate) {
      const msg = String(errCreate.message || '');
      if (msg.toLowerCase().includes('already')) {
        return NextResponse.json({ error: 'Esiste già un account con questa email' }, { status: 409 });
      }
      return NextResponse.json({ error: msg }, { status: 400 });
    }
 
    const nuovoId = creato?.user?.id;
    if (!nuovoId) {
      return NextResponse.json({ error: 'Account creato ma id non disponibile' }, { status: 500 });
    }
 
    // Completo il profilo: il consenso privacy lo darà l'atleta al primo accesso
    await supabaseAdmin.from('profiles').upsert(
      {
        id: nuovoId,
        email,
        role: 'athlete',
        full_name: full_name || '',
        birth_date: birth_date || null,
        gender: gender || null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        subscription_status: subscription_status || 'attivo',
      },
      { onConflict: 'id' }
    );
 
    return NextResponse.json({ ok: true, id: nuovoId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore creazione utente' }, { status: 500 });
  }
}
 
2d. vercel.json (nuovo file, nella cartella principale)
Crealo nella root del progetto (stesso livello di package.json). Dice a Vercel di controllare i compleanni ogni mattina alle 7:00 UTC. Nota: i cron di Vercel richiedono un piano a pagamento; sul piano gratuito le altre notifiche funzionano comunque, mentre quelle di compleanno partiranno solo se apri manualmente l'indirizzo /api/cron/birthdays o se usi un servizio esterno gratuito (es. cron-job.org) che lo chiami una volta al giorno.
{
  "crons": [
    {
      "path": "/api/cron/birthdays",
      "schedule": "0 7 * * *"
    }
  ]
}
 