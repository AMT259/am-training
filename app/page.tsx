'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Dumbbell, User, LogOut, 
  Plus, BookOpen, Play, Square, RotateCcw, Target, Trash2
} from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCoachTab, setActiveCoachTab] = useState<'builder' | 'library'>('builder');

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Coach State & Workout Builder State
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  
  // WOD Builder State (Multi-Blocco avanzato)
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutBlocks, setWorkoutBlocks] = useState<any[]>([
    { 
      id: 1, 
      categoryType: 'strength', // 'strength' o 'circuit'
      type: 'strength', 
      title: 'Blocco 1: Forza', 
      duration: '', 
      rndRounds: '', 
      workTime: '', 
      restTime: '', 
      intervalRounds: '',
      sets: '5',
      reps: '5',
      percentage: '80%',
      rpe: '8',
      exerciseList: [{ name: 'Back Squat', details: '5 reps @ 80%' }]
    }
  ]);

  // Library State
  const [workoutLibrary, setWorkoutLibrary] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);

  // Athlete Active Workout Simulation State
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<any | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [currentIntervalRound, setCurrentIntervalRound] = useState(1);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Timer Effect per WOD interattivi
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            if (activeWorkoutSession?.type === 'intervals') {
              const targetWork = parseInt(activeWorkoutSession.workTime || '40');
              const targetRest = parseInt(activeWorkoutSession.restTime || '20');
              const maxRounds = parseInt(activeWorkoutSession.intervalRounds || '5');

              if (!isResting) {
                setIsResting(true);
                return targetRest;
              } else {
                if (currentIntervalRound >= maxRounds) {
                  setTimerActive(false);
                  alert('Allenamento completato con successo! Ottimo lavoro.');
                  return 0;
                } else {
                  setCurrentIntervalRound((r) => r + 1);
                  setIsResting(false);
                  return targetWork;
                }
              }
            } else {
              setTimerActive(false);
              alert('Tempo scaduto!');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isResting, currentIntervalRound, activeWorkoutSession]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
      if (data?.role === 'coach') {
        fetchAthletes();
      }
    } catch (error) {
      console.error('Errore recupero profilo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'athlete');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Errore recupero atleti:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: 'athlete' }
          }
        });
        if (error) throw error;

        if (data.user) {
          const newProfile = { id: data.user.id, full_name: fullName, role: 'athlete' };
          await supabase.from('profiles').upsert(newProfile);
        }
      }
    } catch (error: any) {
      alert('Errore autenticazione: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Gestione Blocchi Multipli (Default: Forza)
  const addWorkoutBlock = () => {
    setWorkoutBlocks([
      ...workoutBlocks,
      { 
        id: Date.now(), 
        categoryType: 'strength',
        type: 'strength', 
        title: `Blocco ${workoutBlocks.length + 1}: Forza`, 
        duration: '', 
        rndRounds: '', 
        workTime: '', 
        restTime: '', 
        intervalRounds: '',
        sets: '4',
        reps: '8',
        percentage: '75%',
        rpe: '7.5',
        exerciseList: [{ name: '', details: '' }]
      }
    ]);
  };

  const updateBlock = (index: number, field: string, value: any) => {
    const updated = [...workoutBlocks];
    updated[index][field] = value;
    setWorkoutBlocks(updated);
  };

  const removeBlock = (index: number) => {
    if (workoutBlocks.length === 1) {
      alert("Devi mantenere almeno un blocco.");
      return;
    }
    setWorkoutBlocks(workoutBlocks.filter((_, i) => i !== index));
  };

  // Gestione Lista Esercizi dentro un Blocco
  const addExerciseToBlock = (blockIndex: number) => {
    const updated = [...workoutBlocks];
    updated[blockIndex].exerciseList.push({ name: '', details: '' });
    setWorkoutBlocks(updated);
  };

  const updateBlockExercise = (blockIndex: number, exIndex: number, field: 'name' | 'details', value: string) => {
    const updated = [...workoutBlocks];
    updated[blockIndex].exerciseList[exIndex][field] = value;
    setWorkoutBlocks(updated);
  };

  const removeExerciseFromBlock = (blockIndex: number, exIndex: number) => {
    const updated = [...workoutBlocks];
    if (updated[blockIndex].exerciseList.length === 1) return;
    updated[blockIndex].exerciseList = updated[blockIndex].exerciseList.filter((_: any, i: number) => i !== exIndex);
    setWorkoutBlocks(updated);
  };

  const saveToLibrary = () => {
    if (!workoutTitle) {
      alert("Inserisci un titolo per l'allenamento.");
      return;
    }
    const newWorkoutItem = {
      id: Date.now(),
      title: workoutTitle,
      blocks: workoutBlocks
    };

    setWorkoutLibrary([...workoutLibrary, newWorkoutItem]);
    alert("Allenamento completo salvato con successo!");
  };

  const startWorkoutSession = (block: any) => {
    setActiveWorkoutSession(block);
    setCurrentIntervalRound(1);
    setIsResting(false);
    if (block.type === 'intervals') {
      setTimerSeconds(parseInt(block.workTime || '40'));
    } else if (block.type === 'amrap' || block.type === 'emom') {
      setTimerSeconds(parseInt(block.duration || '12') * 60);
    } else {
      setTimerSeconds(0);
    }
    setTimerActive(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400">
        <Dumbbell className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="mb-6 text-center flex flex-col items-center">
            <div className="p-3 bg-emerald-500/10 rounded-xl mb-3 text-emerald-400">
              <Dumbbell className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AM TRAINING</h1>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs text-slate-400 font-medium">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Mario Rossi"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-3 rounded-lg text-slate-950 transition-colors mt-2"
            >
              {isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-4 text-center text-xs text-slate-400 hover:text-white transition-colors"
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-4xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AM TRAINING</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3" /> {profile?.full_name} ({profile?.role})
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {profile?.role === 'coach' ? (
          <div>
            {/* Navigazione Pannello Coach */}
            <div className="flex gap-2 mb-6 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCoachTab('builder')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'builder' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" /> Crea & Assegna
              </button>
              <button
                onClick={() => setActiveCoachTab('library')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'library' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Libreria WOD
              </button>
            </div>

            {/* TAB 1: CREA & ASSEGNA */}
            {activeCoachTab === 'builder' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" /> Nuovo Allenamento
                  </h2>

                  <div>
                    <label className="text-xs text-slate-400 font-medium">Assegna ad Atleta</label>
                    <select
                      value={selectedAthlete}
                      onChange={(e) => setSelectedAthlete(e.target.value)}
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Seleziona Atleta --</option>
                      {athletes.map((athlete) => (
                        <option key={athlete.id} value={athlete.id}>
                          {athlete.full_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium">Titolo Giornata / WOD</label>
                    <input
                      type="text"
                      value={workoutTitle}
                      onChange={(e) => setWorkoutTitle(e.target.value)}
                      placeholder="Es. Forza + Metcon del Giorno"
                      className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
                    />
                  </div>

                  {/* BLOCCHI MULTIPLI AVANZATI */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Blocchi di Allenamento ({workoutBlocks.length})</h3>
                      <button
                        type="button"
                        onClick={addWorkoutBlock}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Aggiungi Blocco
                      </button>
                    </div>

                    {workoutBlocks.map((block, idx) => (
                      <div key={block.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4 relative">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                            className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* SCELTA TIPO BLOCCO: FORZA O CIRCUITO */}
                        <div>
                          <label className="text-[10px] text-slate-400 font-medium block mb-1">Tipologia Blocco</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                updateBlock(idx, 'categoryType', 'strength');
                                updateBlock(idx, 'type', 'strength');
                              }}
                              className={`py-2 text-xs font-bold uppercase rounded-lg transition-colors ${
                                block.categoryType === 'strength' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                              }`}
                            >
                              🏋️‍♂️ Forza
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateBlock(idx, 'categoryType', 'circuit');
                                updateBlock(idx, 'type', 'amrap');
                              }}
                              className={`py-2 text-xs font-bold uppercase rounded-lg transition-colors ${
                                block.categoryType === 'circuit' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                              }`}
                            >
                              🔄 Circuito / WOD
                            </button>
                          </div>
                        </div>

                        {/* SE CATEGORIA = FORZA */}
                        {block.categoryType === 'strength' ? (
                          <div className="space-y-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                            <div className="grid grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">Set</label>
                                <input type="text" value={block.sets} onChange={(e) => updateBlock(idx, 'sets', e.target.value)} placeholder="5" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">Reps</label>
                                <input type="text" value={block.reps} onChange={(e) => updateBlock(idx, 'reps', e.target.value)} placeholder="5" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">% Carico</label>
                                <input type="text" value={block.percentage} onChange={(e) => updateBlock(idx, 'percentage', e.target.value)} placeholder="80%" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">RPE</label>
                                <input type="text" value={block.rpe} onChange={(e) => updateBlock(idx, 'rpe', e.target.value)} placeholder="8" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* SE CATEGORIA = CIRCUITO (AMRAP, EMOM, RND, INTERVALS) */
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium block mb-1">Sotto-tipo Circuito</label>
                              <div className="grid grid-cols-4 gap-1.5">
                                {[
                                  { id: 'amrap', label: 'AMRAP' },
                                  { id: 'emom', label: 'EMOM' },
                                  { id: 'rnd', label: 'Rounds' },
                                  { id: 'intervals', label: 'Tabata' }
                                ].map((t) => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => updateBlock(idx, 'type', t.id)}
                                    className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${
                                      block.type === t.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {(block.type === 'amrap' || block.type === 'emom') && (
                                <div>
                                  <label className="text-[10px] text-slate-400 font-medium">Durata (Minuti)</label>
                                  <input type="number" value={block.duration} onChange={(e) => updateBlock(idx, 'duration', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                                </div>
                              )}
                              {block.type === 'rnd' && (
                                <div>
                                  <label className="text-[10px] text-slate-400 font-medium">Numero Round</label>
                                  <input type="number" value={block.rndRounds} onChange={(e) => updateBlock(idx, 'rndRounds', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                                </div>
                              )}
                              {block.type === 'intervals' && (
                                <>
                                  <div>
                                    <label className="text-[10px] text-slate-400 font-medium">Round</label>
                                    <input type="number" value={block.intervalRounds} onChange={(e) => updateBlock(idx, 'intervalRounds', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-slate-400 font-medium">Lavoro (s)</label>
                                    <input type="number" value={block.workTime} onChange={(e) => updateBlock(idx, 'workTime', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* LISTA MULTI-ESERCIZI DENTRO IL BLOCCO */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold uppercase text-slate-400">Esercizi del Blocco</label>
                            <button
                              type="button"
                              onClick={() => addExerciseToBlock(idx)}
                              className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Aggiungi Esercizio
                            </button>
                          </div>

                          {block.exerciseList?.map((ex: any, exIdx: number) => (
                            <div key={exIdx} className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="Nome Es. (es. Back Squat / Wall Ball)"
                                value={ex.name}
                                onChange={(e) => updateBlockExercise(idx, exIdx, 'name', e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                              />
                              <input
                                type="text"
                                placeholder="Dettagli (es. 20 reps)"
                                value={ex.details}
                                onChange={(e) => updateBlockExercise(idx, exIdx, 'details', e.target.value)}
                                className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                              />
                              {block.exerciseList.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeExerciseFromBlock(idx, exIdx)}
                                  className="text-slate-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button onClick={saveToLibrary} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-sm transition-colors shadow-lg">
                    Salva e Assegna Allenamento
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LIBRERIA */}
            {activeCoachTab === 'library' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" /> Libreria WOD Salvati
                  </h2>
                  {workoutLibrary.length === 0 ? (
                    <p className="text-xs text-slate-500">Nessun allenamento salvato.</p>
                  ) : (
                    <div className="space-y-3">
                      {workoutLibrary.map((item) => (
                        <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <div className="space-y-1">
                            {item.blocks.map((b: any, i: number) => (
                              <div key={i} className="text-xs bg-slate-900 p-2 rounded border border-slate-800/80">
                                <span className="font-bold text-emerald-400 uppercase">{b.title} ({b.categoryType === 'strength' ? 'Forza' : b.type})</span>
                                {b.categoryType === 'strength' && (
                                  <span className="text-slate-300 block">
                                    Set: {b.sets} | Reps: {b.reps} | %: {b.percentage} | RPE: {b.rpe}
                                  </span>
                                )}
                                <div className="mt-1 pl-2 border-l border-emerald-500/30">
                                  {b.exerciseList?.map((ex: any, exIdx: number) => (
                                    <div key={exIdx} className="text-[11px] text-slate-400">
                                      • {ex.name} {ex.details && <span className="text-slate-200">({ex.details})</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AREA ATLETA */
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Benvenuto, {profile?.full_name}!</h2>
              <p className="text-slate-400 text-sm mb-4">Ecco i tuoi allenamenti assegnati.</p>

              {workoutLibrary.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-xs text-slate-500">Nessun allenamento disponibile al momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workoutLibrary.map((w) => (
                    <div key={w.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                      <h4 className="font-bold text-base text-white">{w.title}</h4>
                      <div className="space-y-3">
                        {w.blocks.map((block: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-white">{block.title}</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase">
                                {block.categoryType === 'strength' ? 'Forza' : block.type}
                              </span>
                            </div>

                            {/* Dettagli Forza */}
                            {block.categoryType === 'strength' && (
                              <div className="flex gap-3 text-xs text-emerald-400 font-medium bg-slate-950/60 p-2 rounded-lg">
                                {block.sets && <span>Set: {block.sets}</span>}
                                {block.reps && <span>Reps: {block.reps}</span>}
                                {block.percentage && <span>Carico: {block.percentage}</span>}
                                {block.rpe && <span>RPE: {block.rpe}</span>}
                              </div>
                            )}

                            {/* Lista Esercizi del Blocco */}
                            <div className="space-y-1">
                              {block.exerciseList?.map((ex: any, exIdx: number) => (
                                <div key={exIdx} className="text-xs text-slate-300 flex justify-between">
                                  <span>• {ex.name}</span>
                                  <span className="text-slate-400 font-mono">{ex.details}</span>
                                </div>
                              ))}
                            </div>

                            {/* Pulsante Avvio Timer per Circuiti (escluso Forza) */}
                            {block.categoryType !== 'strength' && (
                              <button
                                onClick={() => startWorkoutSession(block)}
                                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" /> Avvia Cronometro Blocco
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* TIMER ATTIVO */}
            {activeWorkoutSession && (
              <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white text-left">{activeWorkoutSession.title}</h3>
                    <p className="text-xs text-emerald-400 uppercase tracking-wider text-left">
                      {activeWorkoutSession.type} {activeWorkoutSession.type === 'intervals' ? `• Round ${currentIntervalRound}/${activeWorkoutSession.intervalRounds}` : ''}
                    </p>
                  </div>
                  {activeWorkoutSession.type === 'intervals' && (
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${isResting ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                      {isResting ? 'Recupero 🛑' : 'Lavoro 🔥'}
                    </span>
                  )}
                </div>

                <div className="py-6">
                  <div className="text-6xl font-black font-mono tracking-wider text-white">
                    {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setTimerActive(!timerActive)}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 ${
                      timerActive ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                    }`}
                  >
                    {timerActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {timerActive ? 'Pausa' : 'Start'}
                  </button>
                  <button
                    onClick={() => startWorkoutSession(activeWorkoutSession)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}