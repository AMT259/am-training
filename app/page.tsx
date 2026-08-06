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

  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [programTitle, setProgramTitle] = useState('');
  
  const [useCalendar, setUseCalendar] = useState<boolean>(false);

  const [programDays, setProgramDays] = useState<any[]>([
    {
      dayNumber: 1,
      dayName: 'Giorno 1',
      blocks: []
    }
  ]);

  const [weekDays, setWeekDays] = useState<any[]>([
    { dayName: 'Lunedì', blocks: [] },
    { dayName: 'Martedì', blocks: [] },
    { dayName: 'Mercoledì', blocks: [] },
    { dayName: 'Giovedì', blocks: [] },
    { dayName: 'Venerdì', blocks: [] },
    { dayName: 'Sabato', blocks: [] },
    { dayName: 'Domenica', blocks: [] },
  ]);

  const [programLibrary, setProgramLibrary] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedDayView, setSelectedDayView] = useState('Lunedì');

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

      const channel = supabase
        .channel('realtime-programs')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'programs' },
          () => {
            fetchProgramLibrary();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
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
        assignedAthleteId: item.assigned_athlete_id || '',
        useCalendar: item.use_calendar || false,
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

  const addDay = () => {
    setProgramDays([
      ...programDays,
      { dayNumber: programDays.length + 1, dayName: `Giorno ${programDays.length + 1}`, blocks: [] }
    ]);
  };

  const addBlockToFreeDay = (dayIndex: number) => {
    const updated = [...programDays];
    updated[dayIndex].blocks.push({
      id: Date.now(),
      name: '',
      type: 'forza',
      sets: 4,
      reps: '10',
      load: '70%',
      rest: '90 sec',
      notes: '',
      wodNotes: ''
    });
    setProgramDays(updated);
  };

  const updateFreeBlock = (dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = [...programDays];
    updated[dayIndex].blocks[blockIndex][field] = value;
    setProgramDays(updated);
  };

  const addBlockToWeekDay = (dayIndex: number) => {
    const updated = [...weekDays];
    updated[dayIndex].blocks.push({
      id: Date.now(),
      name: '',
      type: 'forza',
      sets: 4,
      reps: '10',
      load: '70%',
      rest: '90 sec',
      notes: '',
      wodNotes: ''
    });
    setWeekDays(updated);
  };

  const updateWeekBlock = (dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = [...weekDays];
    updated[dayIndex].blocks[blockIndex][field] = value;
    setWeekDays(updated);
  };

  const saveProgramToLibrary = async () => {
    if (!programTitle) {
      alert('Inserisci un titolo per il programma');
      return;
    }

    const newProgram = {
      title: programTitle,
      assigned_athlete_id: selectedAthlete || null,
      use_calendar: useCalendar,
      days: useCalendar ? weekDays : programDays
    };

    const { error } = await supabase.from('programs').insert([newProgram]);

    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
    } else {
      setSaveMessage('Programma salvato con successo!');
      setTimeout(() => setSaveMessage(''), 3000);
      setProgramTitle('');
      fetchProgramLibrary();
    }
  };

  const updateProgramAssignment = async (programId: string, newAthleteId: string) => {
    const { error } = await supabase
      .from('programs')
      .update({ assigned_athlete_id: newAthleteId === '' ? null : newAthleteId })
      .eq('id', programId);

    if (error) {
      alert('Errore durante l\'aggiornamento dell\'assegnazione: ' + error.message);
    } else {
      alert('Programma riassegnato con successo!');
    }
  };

  const deleteProgram = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo programma?')) {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) {
        alert('Errore durante l\'eliminazione: ' + error.message);
      }
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
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', color: '#10b981', margin: 0 }}>AM TRAINING</h2>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>{session.user.email} ({role})</span>
        </div>
        <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Esci</button>
      </header>

      {role === 'coach' ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Crea Programma</button>
            <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Libreria</button>
          </div>

          {activeTab === 'create' ? (
            <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
              
              <input type="text" placeholder="Titolo Programma (es. Forza & Conditioning)" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }} />
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Assegna ad Atleta (opzionale):</label>
                <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', boxSizing: 'border-box' }}>
                  <option value="">Tutti gli atleti (Generale)</option>
                  {athletes.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>Usa Calendario Settimanale</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Struttura fissa Lunedì - Domenica</span>
                </div>
                <input type="checkbox" checked={useCalendar} onChange={(e) => setUseCalendar(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }} />
              </div>

              {useCalendar ? (
                <div>
                  {weekDays.map((day, dIdx) => (
                    <div key={dIdx} style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #374151' }}>
                      <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px', marginBottom: '12px' }}>📅 {day.dayName}</div>

                      {day.blocks.map((block: any, bIdx: number) => (
                        <div key={block.id} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #374151' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <button type="button" onClick={() => updateWeekBlock(dIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>FORZA</button>
                            <button type="button" onClick={() => updateWeekBlock(dIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>WOD</button>
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <input type="text" value={block.name} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'name', e.target.value)} placeholder={block.type === 'forza' ? "Nome Esercizio" : "Nome WOD"} style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 'bold', fontSize: '14px' }} />
                          </div>

                          {block.type === 'forza' ? (
                            <div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>SET</label>
                                  <input type="number" value={block.sets} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>REP</label>
                                  <input type="text" value={block.reps} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>CARICO / RPE</label>
                                  <input type="text" value={block.load} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RECUPERO</label>
                                  <input type="text" value={block.rest} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                              </div>
                              <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>NOTE</label>
                                <input type="text" value={block.notes} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                              <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>WOD / CIRCUITO</label>
                              <textarea value={block.wodNotes || ''} onChange={(e) => updateWeekBlock(dIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addBlockToWeekDay(dIdx)} style={{ width: '100%', padding: '8px', background: '#374151', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi a {day.dayName}</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {programDays.map((day, dIdx) => (
                    <div key={dIdx} style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                      <input type="text" value={day.dayName} onChange={(e) => {
                        const upd = [...programDays];
                        upd[dIdx].dayName = e.target.value;
                        setProgramDays(upd);
                      }} placeholder="Nome Giornata" style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />

                      {day.blocks.map((block: any, bIdx: number) => (
                        <div key={block.id} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #374151' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <button type="button" onClick={() => updateFreeBlock(dIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>FORZA</button>
                            <button type="button" onClick={() => updateFreeBlock(dIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>WOD</button>
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <input type="text" value={block.name} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'name', e.target.value)} placeholder="Nome Esercizio" style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box', fontWeight: 'bold', fontSize: '14px' }} />
                          </div>

                          {block.type === 'forza' ? (
                            <div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>SET</label>
                                  <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>REP</label>
                                  <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>CARICO / RPE</label>
                                  <input type="text" value={block.load} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RECUPERO</label>
                                  <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                </div>
                              </div>
                              <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>NOTE</label>
                                <input type="text" value={block.notes} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                              <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>WOD / CIRCUITO</label>
                              <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addBlockToFreeDay(dIdx)} style={{ width: '100%', padding: '8px', background: '#374151', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                    </div>
                  ))}
                  <button onClick={addDay} style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px dashed #475569', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginBottom: '20px' }}>+ Aggiungi Nuovo Giorno</button>
                </div>
              )}

              {saveMessage && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
              <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Libreria Programmi</h3>
              {programLibrary.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Nessun programma in libreria.</p>
              ) : (
                programLibrary.map((prog) => {
                  const currentAssigned = athletes.find((a) => a.id === prog.assignedAthleteId);
                  return (
                    <div key={prog.id} style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                            {prog.useCalendar ? '📅 Calendario Settimanale' : '📋 Programma Giornaliero Libero'}
                          </span>
                          <span style={{ fontSize: '11px', color: currentAssigned ? '#38bdf8' : '#cbd5e1', background: '#1e293b', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                            Assegnato a: {currentAssigned ? (currentAssigned.full_name || currentAssigned.email) : 'Tutti (Generale)'}
                          </span>
                        </div>
                        <button onClick={() => deleteProgram(prog.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#1f2937', padding: '10px', borderRadius: '8px' }}>
                        <select 
                          defaultValue={prog.assignedAthleteId} 
                          id={`select-${prog.id}`}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', fontSize: '12px' }}
                        >
                          <option value="">Tutti gli atleti (Generale)</option>
                          {athletes.map((a) => (
                            <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            const selectElement = document.getElementById(`select-${prog.id}`) as HTMLSelectElement;
                            updateProgramAssignment(prog.id, selectElement.value);
                          }}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Assegna
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>I tuoi allenamenti</h3>
          {athletePrograms.length === 0 ? (
            <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', margin: 0 }}>Nessun allenamento assegnato al momento.</p>
            </div>
          ) : (
            athletePrograms.map((prog) => (
              <div key={prog.id} style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '20px' }}>
                <h4 style={{ color: '#10b981', marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>{prog.title}</h4>
                
                {prog.useCalendar ? (
                  <div>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                      {prog.days?.map((day: any, idx: number) => (
                        <button key={idx} onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: selectedDayView === day.dayName ? '#10b981' : '#1f2937', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {day.dayName}
                        </button>
                      ))}
                    </div>

                    {prog.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any, dIdx: number) => (
                      <div key={dIdx}>
                        {day.blocks?.length === 0 ? (
                          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Riposo o nessun allenamento inserito per {day.dayName}.</p>
                        ) : (
                          day.blocks?.map((blk: any, bIdx: number) => (
                            <div key={bIdx} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #374151' }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>{blk.name}</div>
                              {blk.type === 'forza' ? (
                                <div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ background: '#111827', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>SET</span>
                                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.sets}</span>
                                    </div>
                                    <div style={{ background: '#111827', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>REP</span>
                                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.reps}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ background: '#111827', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>CARICO / RPE</span>
                                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.load}</span>
                                    </div>
                                    <div style={{ background: '#111827', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RECUPERO</span>
                                      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.rest}</span>
                                    </div>
                                  </div>
                                  {blk.notes && (
                                    <div style={{ background: '#111827', padding: '8px', borderRadius: '6px' }}>
                                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>NOTE</span>
                                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#cbd5e1' }}>{blk.notes}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ background: '#111827', padding: '10px', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WOD / CIRCUITO</span>
                                  <p style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'pre-wrap', margin: 0 }}>{blk.wodNotes}</p>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  prog.days?.map((day: any, idx: number) => (
                    <div key={idx} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '10px', color: '#10b981' }}>{day.dayName}</span>
                      {day.blocks?.map((blk: any, bIdx: number) => (
                        <div key={bIdx} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginTop: '8px', border: '1px solid #374151' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>{blk.name}</div>
                          {blk.type === 'forza' ? (
                            <div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>SET</span>
                                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.sets}</span>
                                </div>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>REP</span>
                                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.reps}</span>
                                </div>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>CARICO / RPE</span>
                                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.load}</span>
                                </div>
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RECUPERO</span>
                                  <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{blk.rest}</span>
                                </div>
                              </div>
                              {blk.notes && (
                                <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>NOTE</span>
                                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#cbd5e1' }}>{blk.notes}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ background: '#1f2937', padding: '10px', borderRadius: '6px' }}>
                              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>WOD / CIRCUITO</span>
                              <p style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'pre-wrap', margin: 0 }}>{blk.wodNotes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}