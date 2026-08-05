'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Plus, Trash2, LogOut, Calendar, User, Save, CheckCircle, 
  MessageSquare, Trophy, Layers, Repeat, History, Copy, Dumbbell 
} from 'lucide-react';

type Role = 'coach' | 'athlete';
type BlockType = 'single' | 'superset' | 'circuit';
type CircuitWorkType = 'rounds' | 'time';
type TargetMode = 'reps' | 'time' | 'calories' | 'meters';
type ScoreType = 'kg' | 'time' | 'rounds_reps' | 'reps' | 'none';

interface Profile {
  id: string;
  full_name: string;
  role: Role;
}

interface Exercise {
  id: string;
  name: string;
  targetMode: TargetMode;
  targetValue: string;
  scoreType: ScoreType;
  scoreKg?: string;
  scoreMin?: string;
  scoreSec?: string;
  scoreRounds?: string;
  scoreReps?: string;
}

interface WorkoutBlock {
  id: string;
  type: BlockType;
  title?: string;
  sets: string;
  rest: string;
  circuitWorkType?: CircuitWorkType;
  circuitTimeValue?: string;
  circuitScoreType?: ScoreType;
  circuitScoreKg?: string;
  circuitScoreMin?: string;
  circuitScoreSec?: string;
  circuitScoreRounds?: string;
  circuitScoreReps?: string;
  exercises: Exercise[];
}

interface Workout {
  id?: string;
  title: string;
  date: string;
  athlete_id: string;
  coach_id?: string;
  blocks: WorkoutBlock[];
  athlete_notes?: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Coach State
  const [athletes, setAthletes] = useState<Profile[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState('');
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([
    {
      id: 'b-1',
      type: 'single',
      title: '',
      sets: '4',
      rest: '90s',
      circuitWorkType: 'rounds',
      circuitTimeValue: '15 min',
      circuitScoreType: 'rounds_reps',
      exercises: [{ id: 'ex-1', name: '', targetMode: 'reps', targetValue: '10', scoreType: 'kg' }]
    }
  ]);

  // Athlete & History State
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [athleteBlocks, setAthleteBlocks] = useState<WorkoutBlock[]>([]);
  const [athleteNotesInput, setAthleteNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [historyWorkouts, setHistoryWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && profile?.role === 'coach') {
      fetchAthletes();
      if (selectedAthlete) fetchHistory();
    } else if (user && profile?.role === 'athlete') {
      fetchAthleteWorkout(workoutDate);
      fetchHistory();
    }
  }, [user, profile, workoutDate, selectedAthlete]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadProfile(session.user);
    }
    setLoading(false);
  }

  async function loadProfile(authUser: any) {
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();

    if (data && data.role) {
      setProfile(data as Profile);
      return;
    }

    const fallbackProfile: Profile = {
      id: authUser.id,
      full_name: authUser.user_metadata?.full_name || authUser.email,
      role: authUser.user_metadata?.role || 'athlete'
    };

    await supabase.from('profiles').upsert(fallbackProfile);
    setProfile(fallbackProfile);
  }

  async function fetchAthletes() {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'athlete');
    if (data) setAthletes(data);
  }

  async function fetchAthleteWorkout(date: string) {
    if (!user) return;
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('athlete_id', user.id)
      .eq('date', date)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const workout = data[0];
      const loadedBlocks = workout.blocks || [];
      setCurrentWorkout({ ...workout, blocks: loadedBlocks });
      setAthleteBlocks(loadedBlocks);
      setAthleteNotesInput(workout.athlete_notes || '');
    } else {
      setCurrentWorkout(null);
      setAthleteBlocks([]);
      setAthleteNotesInput('');
    }
  }

  async function fetchHistory() {
    const targetUserId = profile?.role === 'coach' ? selectedAthlete : user?.id;
    if (!targetUserId) {
      setHistoryWorkouts([]);
      return;
    }

    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('athlete_id', targetUserId)
      .order('date', { ascending: false });

    if (data) setHistoryWorkouts(data);
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('Errore di accesso: ' + error.message);
      else if (data.user) {
        setUser(data.user);
        await loadProfile(data.user);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { full_name: fullName, role: 'athlete' } }
      });
      if (error) alert('Errore registrazione: ' + error.message);
      else if (data.user) {
       const newProfile = { id: data.user.id, full_name: fullName, role: 'athlete' };
        await supabase.from('profiles').upsert(newProfile);
        setUser(data.user);
        setProfile(newProfile);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // --- COACH ACTIONS ---
  const addBlock = (type: BlockType) => {
    const newBlock: WorkoutBlock = {
      id: `b-${Date.now()}`,
      type,
      title: type === 'superset' ? 'SuperSet' : type === 'circuit' ? 'Circuito' : '',
      sets: '3',
      rest: '90s',
      circuitWorkType: 'rounds',
      circuitTimeValue: '12 min',
      circuitScoreType: 'rounds_reps',
      exercises: [{ id: `ex-${Date.now()}-1`, name: '', targetMode: 'reps', targetValue: '10', scoreType: type === 'circuit' ? 'none' : 'kg' }]
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (blockIdx: number) => setBlocks(blocks.filter((_, i) => i !== blockIdx));
  
  const updateBlock = (blockIdx: number, field: keyof WorkoutBlock, value: any) => {
    const updated = [...blocks];
    updated[blockIdx] = { ...updated[blockIdx], [field]: value };
    setBlocks(updated);
  };

  const addExerciseToBlock = (blockIdx: number) => {
    const updated = [...blocks];
    updated[blockIdx].exercises.push({
      id: `ex-${Date.now()}`,
      name: '',
      targetMode: 'reps',
      targetValue: '10',
      scoreType: updated[blockIdx].type === 'circuit' ? 'none' : 'kg'
    });
    setBlocks(updated);
  };

  const removeExerciseFromBlock = (blockIdx: number, exIdx: number) => {
    const updated = [...blocks];
    updated[blockIdx].exercises = updated[blockIdx].exercises.filter((_, i) => i !== exIdx);
    setBlocks(updated);
  };

  const updateExerciseInBlock = (blockIdx: number, exIdx: number, field: keyof Exercise, value: any) => {
    const updated = [...blocks];
    updated[blockIdx].exercises[exIdx] = { ...updated[blockIdx].exercises[exIdx], [field]: value };
    setBlocks(updated);
  };

  const saveWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete) return alert('Seleziona un atleta!');
    if (!workoutTitle) return alert('Inserisci un titolo per la scheda!');

    const { error } = await supabase.from('workouts').insert({
      title: workoutTitle,
      date: workoutDate,
      athlete_id: selectedAthlete,
      coach_id: user.id,
      blocks: blocks
    });

    if (error) {
      alert('Errore nel salvataggio: ' + error.message);
    } else {
      alert('Scheda salvata con successo!');
      fetchHistory();
      setWorkoutTitle('');
      setBlocks([{
        id: 'b-1',
        type: 'single',
        title: '',
        sets: '4',
        rest: '90s',
        circuitWorkType: 'rounds',
        circuitTimeValue: '15 min',
        circuitScoreType: 'rounds_reps',
        exercises: [{ id: 'ex-1', name: '', targetMode: 'reps', targetValue: '10', scoreType: 'kg' }]
      }]);
    }
  };

  const duplicateWorkout = (workout: Workout) => {
    setWorkoutTitle(`${workout.title} (Copia)`);
    setBlocks(workout.blocks || []);
    setActiveTab('current');
    alert('Scheda duplicata nel form! Seleziona data e atleta prima di salvare.');
  };

  // --- ATHLETE ACTIONS ---
  const updateAthleteExerciseField = (blockIdx: number, exIdx: number, field: keyof Exercise, value: string) => {
    const updated = [...athleteBlocks];
    updated[blockIdx].exercises[exIdx] = { ...updated[blockIdx].exercises[exIdx], [field]: value };
    setAthleteBlocks(updated);
  };

  const updateAthleteBlockField = (blockIdx: number, field: keyof WorkoutBlock, value: string) => {
    const updated = [...athleteBlocks];
    updated[blockIdx] = { ...updated[blockIdx], [field]: value };
    setAthleteBlocks(updated);
  };

  const saveAthleteFeedback = async () => {
    if (!currentWorkout?.id) return;
    setSavingNotes(true);
    const { error } = await supabase
      .from('workouts')
      .update({ blocks: athleteBlocks, athlete_notes: athleteNotesInput })
      .eq('id', currentWorkout.id);

    setSavingNotes(false);
    if (error) alert('Errore durante il salvataggio: ' + error.message);
    else {
      alert('Risultati salvati con successo!');
      fetchHistory();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse">Caricamento in corso...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl flex flex-col items-center">
          <div className="mb-6 text-center flex flex-col items-center gap-2">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Dumbbell className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AM TRAINING</h1>
          </div>

          <form onSubmit={handleAuth} className="space-y-4 w-full">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs text-slate-400 font-medium">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                 
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-slate-400 font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="nome@email.com"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-3 rounded-lg transition text-slate-950 mt-2">
              {isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs text-slate-400 hover:text-white mt-4">
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AM TRAINING</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3" /> {profile?.full_name} ({profile?.role?.toUpperCase()})
            </p>
          </div>
        </div>

        <button onClick={handleLogout} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition" title="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* SELETTORE TAB: GESTIONE / STORICO */}
      <div className="max-w-4xl mx-auto mb-6 flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'current' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" /> {profile?.role === 'coach' ? 'Crea Scheda' : 'Scheda del Giorno'}
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            fetchHistory();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" /> Storico Schede
        </button>
      </div>

      <main className="max-w-4xl mx-auto">
        {activeTab === 'history' ? (
          /* VISTA STORICO */
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" /> Storico Allenamenti
            </h2>

            {profile?.role === 'coach' && (
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-4">
                <label className="text-xs text-slate-400 block mb-1">Filtra per Atleta</label>
                <select
                  value={selectedAthlete}
                  onChange={(e) => setSelectedAthlete(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white"
                >
                  <option value="">-- Seleziona Atleta --</option>
                  {athletes.map((ath) => (
                    <option key={ath.id} value={ath.id}>{ath.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            {historyWorkouts.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-400">
                Nessuna scheda trovata nello storico.
              </div>
            ) : (
              historyWorkouts.map((w) => (
                <div key={w.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-emerald-400 text-base">{w.title}</h3>
                      <p className="text-xs text-slate-400">{w.date}</p>
                    </div>

                    {profile?.role === 'coach' && (
                      <button
                        onClick={() => duplicateWorkout(w)}
                        className="bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Duplica Scheda
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {w.blocks?.map((b, bIdx) => (
                      <div key={bIdx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 space-y-2">
                        <div className="text-xs font-bold text-slate-300 uppercase">
                          {b.title || b.type} ({b.sets} {b.type === 'circuit' ? 'Rounds' : 'Serie'})
                        </div>

                        {b.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="text-xs flex justify-between items-center text-slate-300 pl-2">
                            <span>• {ex.name} ({ex.targetValue} {ex.targetMode})</span>
                            {b.type !== 'circuit' && (
                              <span className="font-bold text-amber-400">
                                {ex.scoreKg && `${ex.scoreKg} Kg`}
                                {ex.scoreMin && `${ex.scoreMin}m ${ex.scoreSec || 0}s`}
                                {ex.scoreReps && `${ex.scoreReps} reps`}
                              </span>
                            )}
                          </div>
                        ))}

                        {b.type === 'circuit' && (
                          <div className="text-xs font-bold text-amber-400 pt-1 border-t border-slate-800">
                            Score Circuito: {b.circuitScoreRounds && `${b.circuitScoreRounds} Rnd `}{b.circuitScoreReps && `+ ${b.circuitScoreReps} Reps `}{b.circuitScoreMin && `${b.circuitScoreMin}m ${b.circuitScoreSec || 0}s`}{b.circuitScoreKg && `${b.circuitScoreKg} Kg`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {w.athlete_notes && (
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400">Note Atleta:</span> {w.athlete_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : profile?.role === 'coach' ? (
          /* FORM COACH CREAZIONE SCHEDA */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Crea Nuova Scheda Allenamento
            </h2>

            <form onSubmit={saveWorkout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Titolo Scheda</label>
                  <input
                    type="text"
                    required
                    placeholder="Es. Leg Day + Cardio Circuito"
                    value={workoutTitle}
                    onChange={(e) => setWorkoutTitle(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Seleziona Atleta</label>
                  <select
                    required
                    value={selectedAthlete}
                    onChange={(e) => setSelectedAthlete(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  >
                    <option value="">-- Scegli Atleta --</option>
                    {athletes.map((ath) => (
                      <option key={ath.id} value={ath.id}>{ath.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Data Esecuzione</label>
                  <input
                    type="date"
                    required
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>

              {/* LISTA BLOCCHI */}
              <div className="space-y-6">
                <label className="text-sm font-semibold text-slate-300 block">Struttura Scheda</label>

                {blocks.map((block, bIdx) => (
                  <div
                    key={block.id || bIdx}
                    className={`p-5 rounded-2xl border ${
                      block.type === 'circuit'
                        ? 'bg-amber-950/20 border-amber-800/60'
                        : block.type === 'superset'
                        ? 'bg-indigo-950/20 border-indigo-800/60'
                        : 'bg-slate-800/40 border-slate-700/60'
                    } space-y-4`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700 flex items-center gap-1">
                          {block.type === 'circuit' && <Repeat className="w-3 h-3 text-amber-400" />}
                          {block.type === 'superset' && <Layers className="w-3 h-3 text-indigo-400" />}
                          {block.type === 'single' ? 'Esercizio Classico' : block.type === 'superset' ? 'SuperSet' : 'Circuito'}
                        </span>

                        {(block.type === 'superset' || block.type === 'circuit') && (
                          <input
                            type="text"
                            placeholder="Nome Blocco"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(bIdx, 'title', e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {block.type === 'circuit' ? (
                          <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-700">
                            <select
                              value={block.circuitWorkType || 'rounds'}
                              onChange={(e) => updateBlock(bIdx, 'circuitWorkType', e.target.value as CircuitWorkType)}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs font-bold text-amber-400"
                            >
                              <option value="rounds">🔄 A Rounds</option>
                              <option value="time">⏱️ A Tempo</option>
                            </select>

                            {block.circuitWorkType === 'time' ? (
                              <input
                                type="text"
                                placeholder="es. 15 min"
                                value={block.circuitTimeValue || ''}
                                onChange={(e) => updateBlock(bIdx, 'circuitTimeValue', e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded p-1 text-center font-bold text-white text-xs"
                              />
                            ) : (
                              <input
                                type="text"
                                value={block.sets}
                                onChange={(e) => updateBlock(bIdx, 'sets', e.target.value)}
                                className="w-12 bg-slate-950 border border-slate-700 rounded p-1 text-center font-bold text-white text-xs"
                              />
                            )}

                            <select
                              value={block.circuitScoreType || 'rounds_reps'}
                              onChange={(e) => updateBlock(bIdx, 'circuitScoreType', e.target.value as ScoreType)}
                              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white"
                            >
                              <option value="rounds_reps">🔄 Rounds + Reps</option>
                              <option value="time">⏱️ Tempo Finale</option>
                              <option value="reps">🔢 Solo Reps</option>
                              <option value="kg">🏋️ Carico (Kg)</option>
                              <option value="none">🚫 Nessuno</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-400">Serie:</span>
                            <input
                              type="text"
                              value={block.sets}
                              onChange={(e) => updateBlock(bIdx, 'sets', e.target.value)}
                              className="w-12 bg-slate-900 border border-slate-700 rounded p-1 text-center font-bold text-white"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-400">Rec:</span>
                          <input
                            type="text"
                            value={block.rest}
                            onChange={(e) => updateBlock(bIdx, 'rest', e.target.value)}
                            className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                          />
                        </div>

                        {blocks.length > 1 && (
                          <button type="button" onClick={() => removeBlock(bIdx)} className="p-1.5 text-rose-400 hover:text-rose-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {block.exercises.map((ex, eIdx) => (
                        <div key={ex.id || eIdx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-slate-500">{eIdx + 1}.</span>
                            <input
                              type="text"
                              placeholder="Nome Esercizio"
                              required
                              value={ex.name}
                              onChange={(e) => updateExerciseInBlock(bIdx, eIdx, 'name', e.target.value)}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-semibold text-white"
                            />
                            {block.exercises.length > 1 && (
                              <button type="button" onClick={() => removeExerciseFromBlock(bIdx, eIdx)} className="p-1.5 text-rose-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="text-[10px] text-slate-400">Target</label>
                              <select
                                value={ex.targetMode}
                                onChange={(e) => updateExerciseInBlock(bIdx, eIdx, 'targetMode', e.target.value as TargetMode)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                              >
                                <option value="reps">Reps</option>
                                <option value="time">Tempo</option>
                                <option value="calories">Calorie</option>
                                <option value="meters">Metri</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400">Valore</label>
                              <input
                                type="text"
                                placeholder={ex.targetMode === 'time' ? 'es. 40s' : ex.targetMode === 'calories' ? 'es. 20 kcal' : ex.targetMode === 'meters' ? 'es. 400m' : 'es. 10'}
                                value={ex.targetValue}
                                onChange={(e) => updateExerciseInBlock(bIdx, eIdx, 'targetValue', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-center text-white"
                              />
                            </div>
                            {block.type !== 'circuit' && (
                              <div className="md:col-span-2">
                                <label className="text-[10px] text-amber-400">Score richiesto</label>
                                <select
                                  value={ex.scoreType}
                                  onChange={(e) => updateExerciseInBlock(bIdx, eIdx, 'scoreType', e.target.value as ScoreType)}
                                  className="w-full bg-slate-800 border border-slate-700 text-amber-300 rounded-lg p-1.5 text-xs"
                                >
                                  <option value="kg">🏋️ Carico (Kg)</option>
                                  <option value="time">⏱️ Min + Sec</option>
                                  <option value="rounds_reps">🔄 Rounds + Reps</option>
                                  <option value="reps">🔢 Solo Reps</option>
                                  <option value="none">🚫 Nessuno</option>
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {(block.type === 'superset' || block.type === 'circuit') && (
                        <button
                          type="button"
                          onClick={() => addExerciseToBlock(bIdx)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold pt-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Aggiungi esercizio
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button type="button" onClick={() => addBlock('single')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" /> + Singolo
                  </button>
                  <button type="button" onClick={() => addBlock('superset')} className="bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" /> + SuperSet
                  </button>
                  <button type="button" onClick={() => addBlock('circuit')} className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-amber-400" /> + Circuito
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Salva Scheda Allenamento
              </button>
            </form>
          </div>
        ) : (
          /* VISTA SCHEDA GIORNO ATLETA */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white"
                />
              </div>
            </div>

            {currentWorkout ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-emerald-400 mb-1">{currentWorkout.title}</h2>
                  <p className="text-xs text-slate-400">Allenamento del {currentWorkout.date}</p>
                </div>

                <div className="space-y-6">
                  {athleteBlocks.map((block, bIdx) => (
                    <div
                      key={block.id || bIdx}
                      className={`p-5 rounded-2xl border ${
                        block.type === 'circuit' ? 'bg-amber-950/20 border-amber-800/60' : block.type === 'superset' ? 'bg-indigo-950/20 border-indigo-800/60' : 'bg-slate-800/40 border-slate-700/60'
                      } space-y-4`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                        <span className="px-2.5 py-1 text-xs font-bold rounded uppercase tracking-wider bg-slate-800 text-emerald-400 border border-slate-700">
                          {block.title || block.type}
                        </span>
                        <div className="text-xs text-slate-300 font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                          {block.type === 'circuit' && block.circuitWorkType === 'time' ? `⏱️ Tempo: ${block.circuitTimeValue}` : `${block.sets} ${block.type === 'circuit' ? 'Rounds' : 'Serie'}`}
                          {block.rest ? ` • Rec: ${block.rest}` : ''}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {block.exercises.map((ex, eIdx) => (
                          <div key={ex.id || eIdx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold text-white text-sm">{ex.name}</h4>
                              <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded">
                                {ex.targetValue} {ex.targetMode}
                              </span>
                            </div>

                            {block.type !== 'circuit' && ex.scoreType !== 'none' && (
                              <div className="pt-2 border-t border-slate-800 space-y-2">
                                <label className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                                  <Trophy className="w-3.5 h-3.5" /> Score per {ex.name}:
                                </label>
                                {ex.scoreType === 'kg' && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      placeholder="80"
                                      value={ex.scoreKg || ''}
                                      onChange={(e) => updateAthleteExerciseField(bIdx, eIdx, 'scoreKg', e.target.value)}
                                      className="w-28 bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-center text-white"
                                    />
                                    <span className="text-xs text-slate-400 font-bold">Kg</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {block.type === 'circuit' && block.circuitScoreType !== 'none' && (
                        <div className="bg-amber-950/30 border border-amber-700/60 p-4 rounded-xl space-y-2">
                          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                            <Trophy className="w-4 h-4 text-amber-400" /> Score Finale del Circuito:
                          </label>

                          {block.circuitScoreType === 'rounds_reps' && (
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                placeholder="0"
                                value={block.circuitScoreRounds || ''}
                                onChange={(e) => updateAthleteBlockField(bIdx, 'circuitScoreRounds', e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-center text-white font-bold"
                              />
                              <span className="text-xs text-slate-300 font-bold">Rnd +</span>
                              <input
                                type="number"
                                placeholder="0"
                                value={block.circuitScoreReps || ''}
                                onChange={(e) => updateAthleteBlockField(bIdx, 'circuitScoreReps', e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-center text-white font-bold"
                              />
                              <span className="text-xs text-slate-300 font-bold">Reps</span>
                            </div>
                          )}
                          {block.circuitScoreType === 'time' && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="0"
                                value={block.circuitScoreMin || ''}
                                onChange={(e) => updateAthleteBlockField(bIdx, 'circuitScoreMin', e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-center text-white font-bold"
                              />
                              <span className="text-xs text-slate-300 font-bold">Min :</span>
                              <input
                                type="number"
                                placeholder="0"
                                max={59}
                                value={block.circuitScoreSec || ''}
                                onChange={(e) => updateAthleteBlockField(bIdx, 'circuitScoreSec', e.target.value)}
                                className="w-20 bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-center text-white font-bold"
                              />
                              <span className="text-xs text-slate-300 font-bold">Sec</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" /> Note Generali Allenamento
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Scrivi qui com'è andata la sessione..."
                      value={athleteNotesInput}
                      onChange={(e) => setAthleteNotesInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={saveAthleteFeedback}
                    disabled={savingNotes}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {savingNotes ? 'Salvataggio...' : 'Salva Risultati Esercizi e Note'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                Nessuna scheda inserita per questa data.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}