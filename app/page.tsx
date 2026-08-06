'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function TrainingApp() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<'coach' | 'athlete'>('athlete');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dati Coach / Programmi
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [programTitle, setProgramTitle] = useState('');
  const [programDays, setProgramDays] = useState<any[]>([
    {
      dayNumber: 1,
      dayName: 'Giorno 1',
      blocks: [
        {
          id: 1,
          name: 'Back Squat',
          type: 'forza',
          sets: 4,
          reps: '5',
          load: '80%',
          rpe: '8',
          rest: '2 min',
          notes: 'Mantenere il petto alto in spinta',
          exercises: [{ name: 'Back Squat', reps: '5 reps' }]
        }
      ]
    }
  ]);
  const [programLibrary, setProgramLibrary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [saveMessage, setSaveMessage] = useState('');

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
      if (role === 'coach') {
        fetchAthletes();
      }
    }
  }, [session, role]);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setRole(data.role);
  };

  const fetchAthletes = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'athlete');
    if (data) setAthletes(data);
  };

  const fetchProgramLibrary = async () => {
    const { data } = await supabase.from('programs').select('*');
    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        assignedAthleteId: item.assigned_athlete_id,
        days: item.days || []
      }));
      setProgramLibrary(formatted);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const addBlockToDay = (dayIndex: number) => {
    const updatedDays = [...programDays];
    updatedDays[dayIndex].blocks.push({
      id: Date.now(),
      name: '',
      type: 'forza',
      sets: 4,
      reps: '10',
      load: '70%',
      rpe: '8',
      rest: '90 sec',
      notes: '',
      wodNotes: ''
    });
    setProgramDays(updatedDays);
  };

  const updateBlock = (dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updatedDays = [...programDays];
    updatedDays[dayIndex].blocks[blockIndex][field] = value;
    setProgramDays(updatedDays);
  };

  const saveProgramToLibrary = async () => {
    if (!programTitle) {
      alert('Inserisci un titolo per il programma');
      return;
    }

    const newProgram = {
      title: programTitle,
      assigned_athlete_id: selectedAthlete || null,
      days: programDays
    };

    const { error } = await supabase.from('programs').insert([newProgram]);

    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
    } else {
      setSaveMessage('Programma salvato e assegnato con successo!');
      setTimeout(() => setSaveMessage(''), 3000);
      setProgramTitle('');
      fetchProgramLibrary();
    }
  };

  if (loading) {
    return <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Caricamento...</div>;
  }

  if (!session) {
    return (
      <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#10b981', marginBottom: '20px' }}>AM TRAINING</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '12px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
          {authError && <p style={{ color: '#ef4444', fontSize: '14px' }}>{authError}</p>}
          <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Accedi</button>
        </form>
      </div>
    );
  }

  const athletePrograms = programLibrary.filter(
    (prog) => !prog.assignedAthleteId || prog.assignedAthleteId === '' || prog.assignedAthleteId === session?.user?.id
  );

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '16px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>AM TRAINING</h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{session.user.email} ({role})</span>
        </div>
        <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>Esci</button>
      </header>

      {role === 'coach' ? (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Crea Programma</button>
            <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Libreria Programmi</button>
          </div>

          {activeTab === 'create' ? (
            <div style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Nuovo Programma</h3>
              <input type="text" placeholder="Titolo Programma (es. Forza & Conditioning)" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} />
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Assegna ad Atleta:</label>
                <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', boxSizing: 'border-box' }}>
                  <option value="">Tutti gli atleti</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                  ))}
                </select>
              </div>

              {programDays.map((day, dIdx) => (
                <div key={dIdx} style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                  <input type="text" value={day.dayName} onChange={(e) => {
                    const upd = [...programDays];
                    upd[dIdx].dayName = e.target.value;
                    setProgramDays(upd);
                  }} placeholder="Nome Giornata (es. Giorno 1)" style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />

                  {day.blocks.map((block: any, bIdx: number) => (
                    <div key={block.id} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #374151' }}>
                      
                      {/* Selezione Tipo */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <button type="button" onClick={() => updateBlock(dIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>🏋️ ESERCIZIO FORZA</button>
                        <button type="button" onClick={() => updateBlock(dIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>🔄 CIRCUITO / WOD</button>
                      </div>

                      {/* Nome in rilievo */}
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>NOME ESERCIZIO / CIRCUITO</label>
                        <input type="text" value={block.name} onChange={(e) => updateBlock(dIdx, bIdx, 'name', e.target.value)} placeholder={block.type === 'forza' ? "es. Back Squat" : "es. WOD Metcon"} style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 'bold', fontSize: '14px' }} />
                      </div>

                      {block.type === 'forza' ? (
                        <div>
                          {/* Set e Reps (subito sotto) */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>Set</label>
                              <input type="number" value={block.sets} onChange={(e) => updateBlock(dIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>Ripetizioni (Reps)</label>
                              <input type="text" value={block.reps} onChange={(e) => updateBlock(dIdx, bIdx, 'reps', e.target.value)} placeholder="es. 5" style={{ width: '100%', padding: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                          </div>

                          {/* A fianco: Recupero ed RPE/Carico */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <div>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>Carico / % / RPE</label>
                              <input type="text" value={block.load} onChange={(e) => updateBlock(dIdx, bIdx, 'load', e.target.value)} placeholder="es. 80% o RPE 8" style={{ width: '100%', padding: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', color: '#94a3b8' }}>Recupero</label>
                              <input type="text" value={block.rest} onChange={(e) => updateBlock(dIdx, bIdx, 'rest', e.target.value)} placeholder="es. 2 min" style={{ width: '100%', padding: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                            </div>
                          </div>

                          {/* Sotto le note */}
                          <div>
                            <label style={{ fontSize: '10px', color: '#94a3b8' }}>Note</label>
                            <textarea value={block.notes} onChange={(e) => updateBlock(dIdx, bIdx, 'notes', e.target.value)} placeholder="Aggiungi note per l'esercizio..." style={{ width: '100%', height: '60px', padding: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', fontSize: '12px' }} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Note / Testo del Circuito:</label>
                          <textarea value={block.wodNotes || ''} onChange={(e) => updateBlock(dIdx, bIdx, 'wodNotes', e.target.value)} placeholder="es. AMRAP 12 minuti..." style={{ width: '100%', height: '90px', padding: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box', fontSize: '12px' }} />
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addBlockToDay(dIdx)} style={{ width: '100%', padding: '8px', background: '#374151', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio / Blocco</button>
                </div>
              ))}

              {saveMessage && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
              <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Salva e Assegna Programma</button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Libreria Programmi Assegnati</h3>
              {programLibrary.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>Nessun programma in libreria.</p>
              ) : (
                programLibrary.map((prog) => (
                  <div key={prog.id} style={{ background: '#111827', padding: '14px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#10b981' }}>{prog.title}</h4>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Giornate: {prog.days?.length || 0}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>I tuoi programmi di allenamento</h3>
          {athletePrograms.length === 0 ? (
            <div style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>Nessun programma assegnato al momento.</p>
            </div>
          ) : (
            athletePrograms.map((prog) => (
              <div key={prog.id} style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '16px' }}>
                <h4 style={{ color: '#10b981', marginTop: 0, marginBottom: '12px' }}>{prog.title}</h4>
                {prog.days?.map((day: any, idx: number) => (
                  <div key={idx} style={{ background: '#1f2937', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '8px' }}>{day.dayName}</span>
                    {day.blocks?.map((blk: any, bIdx: number) => (
                      <div key={bIdx} style={{ background: '#111827', padding: '10px', borderRadius: '6px', marginTop: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '6px' }}>{blk.name}</div>
                        {blk.type === 'forza' ? (
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', background: '#1f2937', padding: '6px', borderRadius: '4px' }}>
                              <span><b>Set:</b> {blk.sets}</span>
                              <span><b>Reps:</b> {blk.reps}</span>
                              <span><b>Carico/RPE:</b> {blk.load}</span>
                              <span><b>Rec:</b> {blk.rest}</span>
                            </div>
                            {blk.notes && <p style={{ margin: '4px 0 0 0', fontStyle: 'italic', color: '#cbd5e1' }}>Note: {blk.notes}</p>}
                          </div>
                        ) : (
                          <p style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'pre-wrap', margin: 0 }}>{blk.wodNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}