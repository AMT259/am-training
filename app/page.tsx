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
      dayName: 'Upper Body',
      blocks: [
        {
          id: 1,
          name: 'Blocco 1: Forza',
          type: 'forza',
          sets: 5,
          reps: '5',
          load: '80%',
          rpe: '/',
          exercises: [{ name: 'Back Squat', reps: '5 reps' }],
          notes: ''
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
    const { data, error } = await supabase.from('programs').select('*');
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
      name: `Blocco ${updatedDays[dayIndex].blocks.length + 1}`,
      type: 'forza',
      sets: 4,
      reps: '10',
      load: '70%',
      rpe: '/',
      exercises: [{ name: '', reps: '' }],
      notes: ''
    });
    setProgramDays(updatedDays);
  };

  const updateBlock = (dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updatedDays = [...programDays];
    updatedDays[dayIndex].blocks[blockIndex][field] = value;
    setProgramDays(updatedDays);
  };

  const addExercise = (dayIndex: number, blockIndex: number) => {
    const updatedDays = [...programDays];
    updatedDays[dayIndex].blocks[blockIndex].exercises.push({ name: '', reps: '' });
    setProgramDays(updatedDays);
  };

  const updateExercise = (dayIndex: number, blockIndex: number, exIndex: number, field: string, value: string) => {
    const updatedDays = [...programDays];
    updatedDays[dayIndex].blocks[blockIndex].exercises[exIndex][field] = value;
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
              <input type="text" placeholder="Titolo Programma (es. Forza Base)" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' }} />
              
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
                  }} placeholder="Nome Giornata (es. Upper Body)" style={{ width: '100%', padding: '8px', marginBottom: '10px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />

                  {day.blocks.map((block: any, bIdx: number) => (
                    <div key={block.id} style={{ background: '#111827', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #374151' }}>
                      <input type="text" value={block.name} onChange={(e) => updateBlock(dIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', padding: '6px', marginBottom: '8px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px', boxSizing: 'border-box' }} />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                        <input type="number" placeholder="Set" value={block.sets} onChange={(e) => updateBlock(dIdx, bIdx, 'sets', e.target.value)} style={{ padding: '6px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px' }} />
                        <input type="text" placeholder="Reps" value={block.reps} onChange={(e) => updateBlock(dIdx, bIdx, 'reps', e.target.value)} style={{ padding: '6px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px' }} />
                        <input type="text" placeholder="Carico %" value={block.load} onChange={(e) => updateBlock(dIdx, bIdx, 'load', e.target.value)} style={{ padding: '6px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px' }} />
                      </div>

                      <div style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Esercizi:</span>
                        {block.exercises.map((ex: any, eIdx: number) => (
                          <div key={eIdx} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            <input type="text" placeholder="Nome Esercizio" value={ex.name} onChange={(e) => updateExercise(dIdx, bIdx, eIdx, 'name', e.target.value)} style={{ flex: 2, padding: '4px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px' }} />
                            <input type="text" placeholder="Note/Reps" value={ex.reps} onChange={(e) => updateExercise(dIdx, bIdx, eIdx, 'reps', e.target.value)} style={{ flex: 1, padding: '4px', background: '#1f2937', border: 'none', color: '#fff', borderRadius: '4px' }} />
                          </div>
                        ))}
                        <button onClick={() => addExercise(dIdx, bIdx)} style={{ background: 'transparent', border: 'none', color: '#10b981', fontSize: '11px', cursor: 'pointer', marginTop: '4px' }}>+ Aggiungi Esercizio</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => addBlockToDay(dIdx)} style={{ width: '100%', padding: '6px', background: '#374151', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>+ Aggiungi Blocco</button>
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
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Giorno {day.dayNumber}: {day.dayName}</span>
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