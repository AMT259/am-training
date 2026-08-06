'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Dumbbell, Calendar as CalendarIcon, Users, User, LogOut, 
  Plus, Check, ChevronRight, Clock, Award, Shield, Activity, TrendingUp, Settings, BookOpen, FolderPlus, Play, Square, RotateCcw, Target, Trash2
} from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCoachTab, setActiveCoachTab] = useState<'builder' | 'library'>('builder');

  // Sub-tab per il Coach: 'wod' o 'exercise'
  const [builderSubTab, setBuilderSubTab] = useState<'wod' | 'exercise'>('wod');

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Coach State & Workout Builder State
  const [athletes, setAthletes] = useState<any[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  
  // WOD Builder State (Multi-Blocco)
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutBlocks, setWorkoutBlocks] = useState<any[]>([
    { id: 1, type: 'amrap', title: 'Blocco 1', duration: '12', rndRounds: '5', workTime: '40', restTime: '20', intervalRounds: '5' }
  ]);
  
  // Exercise Builder State
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState<'forza' | 'ginnastica' | 'cardio' | 'sollevamento'>('forza');
  const [exerciseEquipment, setExerciseEquipment] = useState('Bilanciere');
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Library State
  const [workoutLibrary, setWorkoutLibrary] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
  const [isWeeklyProgram, setIsWeeklyProgram] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState({
    Lunedì: [],
    Martedì: [],
    Mercoledì: [],
    Giovedì: [],
    Venerdì: [],
    Sabato: [],
    Domenica: []
  });
  const [selectedDayToEdit, setSelectedDayToEdit] = useState<string>('Lunedì');

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

  // Gestione Blocchi Multipli
  const addWorkoutBlock = () => {
    setWorkoutBlocks([
      ...workoutBlocks,
      { id: Date.now(), type: 'amrap', title: `Blocco ${workoutBlocks.length + 1}`, duration: '12', rndRounds: '5', workTime: '40', restTime: '20', intervalRounds: '5' }
    ]);
  };

  const updateBlock = (index: number, field: string, value: string) => {
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

  const saveToLibrary = () => {
    if (!workoutTitle) {
      alert("Inserisci un titolo per l'allenamento.");
      return;
    }
    const newWorkoutItem = {
      id: Date.now(),
      title: workoutTitle,
      blocks: workoutBlocks,
      isWeekly: isWeeklyProgram
    };

    setWorkoutLibrary([...workoutLibrary, newWorkoutItem]);
    alert("Allenamento salvato con successo nella libreria!");
  };

  const saveExerciseToLibrary = () => {
    if (!exerciseName) {
      alert("Inserisci il nome dell'esercizio.");
      return;
    }
    const newExerciseItem = {
      id: Date.now(),
      name: exerciseName,
      category: exerciseCategory,
      equipment: exerciseEquipment,
      notes: exerciseNotes
    };

    setExerciseLibrary([...exerciseLibrary, newExerciseItem]);
    setExerciseName('');
    setExerciseNotes('');
    alert("Esercizio singolo creato e salvato con successo!");
  };

  const startWorkoutSession = (workout: any) => {
    const firstBlock = workout.blocks ? workout.blocks[0] : workout;
    setActiveWorkoutSession(firstBlock);
    setCurrentIntervalRound(1);
    setIsResting(false);
    if (firstBlock.type === 'intervals') {
      setTimerSeconds(parseInt(firstBlock.workTime || '40'));
    } else if (firstBlock.type === 'amrap' || firstBlock.type === 'emom') {
      setTimerSeconds(parseInt(firstBlock.duration || '12') * 60);
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
                <BookOpen className="w-4 h-4" /> Libreria & Esercizi
              </button>
            </div>

            {/* TAB 1: CREA & ASSEGNA (WOD Multi-Blocco / Esercizio Singolo) */}
            {activeCoachTab === 'builder' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                
                {/* Switch WOD vs Esercizio Singolo */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
                  <button
                    onClick={() => setBuilderSubTab('wod')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      builderSubTab === 'wod' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Crea WOD / Allenamento
                  </button>
                  <button
                    onClick={() => setBuilderSubTab('exercise')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      builderSubTab === 'exercise' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Crea Esercizio Singolo
                  </button>
                </div>

                {builderSubTab === 'wod' ? (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-400" /> Nuovo Allenamento (Multi-Blocco)
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

                    {/* BLOCCHI MULTIPLI */}
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Blocchi di Allenamento ({workoutBlocks.length})</h3>
                        <button
                          type="button"
                          onClick={addWorkoutBlock}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Aggiungi Blocco
                        </button>
                      </div>

                      {workoutBlocks.map((block, idx) => (
                        <div key={block.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 relative">
                          <div className="flex justify-between items-center">
                            <input
                              type="text"
                              value={block.title}
                              onChange={(e) => updateBlock(idx, 'title', e.target.value)}
                              className="bg-transparent font-bold text-sm text-white border-b border-slate-800 pb-1 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeBlock(idx)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {['amrap', 'emom', 'rnd', 'intervals'].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => updateBlock(idx, 'type', t)}
                                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${
                                  block.type === t ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>

                          {block.type === 'amrap' && (
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium">Durata AMRAP (Min)</label>
                              <input type="number" value={block.duration} onChange={(e) => updateBlock(idx, 'duration', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                            </div>
                          )}
                          {block.type === 'emom' && (
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium">Durata EMOM (Min)</label>
                              <input type="number" value={block.duration} onChange={(e) => updateBlock(idx, 'duration', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                            </div>
                          )}
                          {block.type === 'rnd' && (
                            <div>
                              <label className="text-[10px] text-slate-400 font-medium">Numero Round (RND)</label>
                              <input type="number" value={block.rndRounds} onChange={(e) => updateBlock(idx, 'rndRounds', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                            </div>
                          )}
                          {block.type === 'intervals' && (
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">Round</label>
                                <input type="number" value={block.intervalRounds} onChange={(e) => updateBlock(idx, 'intervalRounds', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">Lavoro (s)</label>
                                <input type="number" value={block.workTime} onChange={(e) => updateBlock(idx, 'workTime', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium">Recupero (s)</label>
                                <input type="number" value={block.restTime} onChange={(e) => updateBlock(idx, 'restTime', e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button onClick={saveToLibrary} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-sm transition-colors shadow-lg">
                      Salva e Assegna Allenamento Multi-Blocco
                    </button>
                  </div>
                ) : (
                  /* CREAZIONE ESERCIZIO SINGOLO */
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-400" /> Nuovo Esercizio Singolo
                    </h2>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">Nome Esercizio</label>
                      <input
                        type="text"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="Es. Back Squat, Pull-ups, Clean & Jerk"
                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-2">Categoria</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: 'forza', label: 'Forza' },
                          { id: 'ginnastica', label: 'Ginnastica' },
                          { id: 'cardio', label: 'Cardio' },
                          { id: 'sollevamento', label: 'Sollevamento' }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setExerciseCategory(cat.id as any)}
                            className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                              exerciseCategory === cat.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">Attrezzatura</label>
                      <input
                        type="text"
                        value={exerciseEquipment}
                        onChange={(e) => setExerciseEquipment(e.target.value)}
                        placeholder="Es. Bilanciere, Sbarra, Vogatore"
                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">Note / Esecuzione</label>
                      <textarea
                        value={exerciseNotes}
                        onChange={(e) => setExerciseNotes(e.target.value)}
                        placeholder="Dettagli tecnici o istruzioni per l'atleta..."
                        rows={3}
                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white resize-none"
                      />
                    </div>

                    <button 
                      onClick={saveExerciseToLibrary} 
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-sm transition-colors shadow-lg"
                    >
                      Salva Esercizio nella Libreria
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIBRERIA WOD ED ESERCIZI */}
            {activeCoachTab === 'library' && (
              <div className="space-y-6">
                {/* WOD Library */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" /> Libreria WOD Multi-Blocco
                  </h2>
                  {workoutLibrary.length === 0 ? (
                    <p className="text-xs text-slate-500">Nessun allenamento salvato.</p>
                  ) : (
                    <div className="space-y-3">
                      {workoutLibrary.map((item) => (
                        <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                          <h4 className="font-bold text-sm text-white">{item.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            {item.blocks.map((b: any, i: number) => (
                              <span key={i} className="text-[10px] uppercase font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                                {b.title} ({b.type})
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exercise Library */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" /> Libreria Esercizi Singoli
                  </h2>
                  {exerciseLibrary.length === 0 ? (
                    <p className="text-xs text-slate-500">Nessun esercizio singolo salvato.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exerciseLibrary.map((ex) => (
                        <div key={ex.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-md">
                              {ex.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">Attrezzatura: <span className="text-slate-200">{ex.equipment}</span></p>
                          {ex.notes && <p className="text-xs text-slate-500 italic bg-slate-900 p-2 rounded">{ex.notes}</p>}
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
              <p className="text-slate-400 text-sm mb-4">Ecco i tuoi allenamenti assegnati con i relativi blocchi.</p>

              {workoutLibrary.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-xs text-slate-500">Nessun allenamento disponibile al momento.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workoutLibrary.map((w) => (
                    <div key={w.id} className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                      <h4 className="font-bold text-base text-white">{w.title}</h4>
                      <div className="space-y-2">
                        {w.blocks.map((block: any, idx: number) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="font-bold text-xs text-white">{block.title}</span>
                              <p className="text-[10px] text-emerald-400 uppercase tracking-wide">
                                {block.type} {block.type === 'intervals' ? `• ${block.intervalRounds}RND (${block.workTime}s/${block.restTime}s)` : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => startWorkoutSession(block)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-md"
                            >
                              <Play className="w-3 h-3 fill-current" /> Avvia Blocco
                            </button>
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
                  <p className="text-xs text-slate-500 mt-2">
                    {activeWorkoutSession.type === 'intervals' 
                      ? (isResting ? 'Tempo di recupero rimanente' : 'Tempo di lavoro rimanente') 
                      : 'Cronometro Blocco in esecuzione'}
                  </p>
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
                    title="Resetta Timer"
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