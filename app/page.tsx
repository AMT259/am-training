'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Dumbbell, Calendar as CalendarIcon, Users, User, LogOut, 
  Plus, Check, ChevronRight, Clock, Award, Shield, Activity, TrendingUp, Settings, BookOpen, FolderPlus, Play, Square, RotateCcw, Target
} from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCoachTab, setActiveCoachTab] = useState<'builder' | 'library' | 'classes'>('builder');

  // Sub-tab per il Coach: 'wod' o 'exercise'
  const [builderSubTab, setBuilderSubTab] = useState<'wod' | 'exercise'>('wod');

  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Coach State & Workout Builder State
  const [athletes, setAthletes] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<string[]>(['Classe Mattina', 'Classe Sera', 'Team Advanced']);
  const [selectedTargetType, setSelectedTargetType] = useState<'athlete' | 'class'>('athlete');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  
  // WOD Builder State
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<'amrap' | 'emom' | 'rnd' | 'intervals'>('amrap');
  const [duration, setDuration] = useState('12');
  const [rndRounds, setRndRounds] = useState('5');
  const [workTime, setWorkTime] = useState('40');
  const [restTime, setRestTime] = useState('20');
  const [intervalRounds, setIntervalRounds] = useState('5');
  
  // Exercise Builder State (Nuovo!)
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState<'forza' | 'ginnastica' | 'cardio' | 'sollevamento'>('forza');
  const [exerciseEquipment, setExerciseEquipment] = useState('Bilanciere');
  const [exerciseNotes, setExerciseNotes] = useState('');

  // Library & Weekly Programs State
  const [workoutLibrary, setWorkoutLibrary] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
  const [isWeeklyProgram, setIsWeeklyProgram] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState({
    Lunedì: '',
    Martedì: '',
    Mercoledì: '',
    Giovedì: '',
    Venerdì: '',
    Sabato: '',
    Domenica: ''
  });

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

  const saveToLibrary = () => {
    if (!workoutTitle) {
      alert("Inserisci un titolo per salvare l'allenamento nella libreria.");
      return;
    }
    const newWorkoutItem = {
      id: Date.now(),
      title: workoutTitle,
      type: workoutType,
      duration,
      rndRounds,
      workTime,
      restTime,
      intervalRounds,
      details: workoutType === 'intervals' 
        ? `${intervalRounds}RND - Lavoro: ${workTime}s / Rec: ${restTime}s` 
        : workoutType === 'rnd' 
        ? `Rounds: ${rndRounds}` 
        : `Durata: ${duration} min`,
      isWeekly: isWeeklyProgram
    };

    setWorkoutLibrary([...workoutLibrary, newWorkoutItem]);
    alert("Allenamento salvato con successo nella libreria!");
  };

  // Funzione per salvare un esercizio singolo
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
    alert("Esercizio singolo creato e salvato con successo nella libreria!");
  };

  const startWorkoutSession = (workout: any) => {
    setActiveWorkoutSession(workout);
    setCurrentIntervalRound(1);
    setIsResting(false);
    if (workout.type === 'intervals') {
      setTimerSeconds(parseInt(workout.workTime || '40'));
    } else if (workout.type === 'amrap' || workout.type === 'emom') {
      setTimerSeconds(parseInt(workout.duration || '12') * 60);
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
            {/* Navigazione Principale Pannello Coach */}
            <div className="flex gap-2 mb-6 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCoachTab('builder')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'builder' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" /> Crea / Assegna
              </button>
              <button
                onClick={() => setActiveCoachTab('library')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'library' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Libreria & Programmi
              </button>
              <button
                onClick={() => setActiveCoachTab('classes')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'classes' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> Gestione Classi
              </button>
            </div>

            {/* TAB 1: CREA / ASSEGNA (Con selettore WOD o Esercizio Singolo) */}
            {activeCoachTab === 'builder' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                
                {/* Switch tra WOD e Esercizio Singolo */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
                  <button
                    onClick={() => setBuilderSubTab('wod')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                      builderSubTab === 'wod' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Crea Circuito / WOD
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
                  <>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-emerald-400" /> Nuovo Allenamento o Programma
                    </h2>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTargetType('athlete')}
                        className={`py-2 text-xs font-bold rounded-lg border ${
                          selectedTargetType === 'athlete' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        Assegna a Singolo Atleta
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTargetType('class')}
                        className={`py-2 text-xs font-bold rounded-lg border ${
                          selectedTargetType === 'class' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        Assegna a Classe (Gruppo)
                      </button>
                    </div>

                    {selectedTargetType === 'athlete' ? (
                      <div>
                        <label className="text-xs text-slate-400 font-medium">Seleziona Atleta</label>
                        <select
                          value={selectedAthlete}
                          onChange={(e) => setSelectedAthlete(e.target.value)}
                          className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">-- Scegli atleta --</option>
                          {athletes.map((athlete) => (
                            <option key={athlete.id} value={athlete.id}>
                              {athlete.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs text-slate-400 font-medium">Seleziona Classe</label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">-- Scegli classe --</option>
                          {classesList.map((cls, idx) => (
                            <option key={idx} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="weeklyCheck"
                        checked={isWeeklyProgram}
                        onChange={(e) => setIsWeeklyProgram(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <label htmlFor="weeklyCheck" className="text-xs text-slate-300 font-medium">
                        Crea Programma Settimanale (Multi-giorno)
                      </label>
                    </div>

                    {!isWeeklyProgram ? (
                      <>
                        <div>
                          <label className="text-xs text-slate-400 font-medium">Titolo Allenamento</label>
                          <input
                            type="text"
                            value={workoutTitle}
                            onChange={(e) => setWorkoutTitle(e.target.value)}
                            placeholder="Es. WOD Metcon"
                            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-slate-400 font-medium block mb-2">Tipologia Circuito</label>
                          <div className="grid grid-cols-4 gap-2">
                            {['amrap', 'emom', 'rnd', 'intervals'].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setWorkoutType(t as any)}
                                className={`py-2 text-xs font-bold uppercase rounded-lg transition-colors ${
                                  workoutType === t ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                          {workoutType === 'amrap' && (
                            <div>
                              <label className="text-xs text-slate-400 font-medium">Durata AMRAP (Minuti)</label>
                              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                            </div>
                          )}
                          {workoutType === 'emom' && (
                            <div>
                              <label className="text-xs text-slate-400 font-medium">Durata EMOM (Minuti)</label>
                              <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                            </div>
                          )}
                          {workoutType === 'rnd' && (
                            <div>
                              <label className="text-xs text-slate-400 font-medium">Numero di Round (RND)</label>
                              <input type="number" value={rndRounds} onChange={(e) => setRndRounds(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                            </div>
                          )}
                          {workoutType === 'intervals' && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-slate-400 font-medium">Numero Round</label>
                                <input type="number" value={intervalRounds} onChange={(e) => setIntervalRounds(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-slate-400 font-medium">Lavoro (sec)</label>
                                  <input type="number" value={workTime} onChange={(e) => setWorkTime(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                                </div>
                                <div>
                                  <label className="text-xs text-slate-400 font-medium">Recupero (sec)</label>
                                  <input type="number" value={restTime} onChange={(e) => setRestTime(e.target.value)} className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <button onClick={saveToLibrary} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-sm transition-colors shadow-lg">
                          Salva e Assegna Allenamento
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                        <h3 className="text-sm font-bold text-emerald-400 mb-2">Programmazione Settimanale</h3>
                        {Object.keys(weeklyDays).map((day) => (
                          <div key={day} className="flex items-center gap-3">
                            <span className="w-24 text-xs font-semibold text-slate-400">{day}</span>
                            <input
                              type="text"
                              placeholder="Es. WOD AMRAP 15' o Riposo"
                              value={(weeklyDays as any)[day]}
                              onChange={(e) => setWeeklyDays({...weeklyDays, [day]: e.target.value})}
                              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            />
                          </div>
                        ))}
                        <button onClick={() => alert("Programma settimanale salvato e assegnato con successo!")} className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs transition-colors">
                          Salva Programma Settimanale
                        </button>
                      </div>
                    )}
                  </>
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

            {/* TAB 2: LIBRERIA ALLENAMENTI ED ESERCIZI */}
            {activeCoachTab === 'library' && (
              <div className="space-y-6">
                {/* Libreria WOD */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" /> Libreria Circuiti / WOD
                  </h2>
                  {workoutLibrary.length === 0 ? (
                    <p className="text-xs text-slate-500">Nessun WOD salvato nella libreria.</p>
                  ) : (
                    <div className="space-y-3">
                      {workoutLibrary.map((item) => (
                        <div key={item.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-white">{item.title}</h4>
                            <p className="text-xs text-emerald-400 uppercase tracking-wide">{item.type} • {item.details}</p>
                          </div>
                          <button onClick={() => alert("Assegnato con successo!")} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                            Assegna
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Libreria Esercizi Singoli */}
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

            {/* TAB 3: GESTIONE CLASSI */}
            {activeCoachTab === 'classes' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Gestione Classi / Gruppi
                </h2>
                <div className="space-y-3">
                  {classesList.map((cls, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{cls}</span>
                      <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md">Gruppo Attivo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AREA ATLETA CON TIMER INTERATTIVO */
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Benvenuto, {profile?.full_name}!</h2>
              <p className="text-slate-400 text-sm mb-4">Ecco i tuoi allenamenti assegnati. Avvia il timer per iniziare la sessione interattiva.</p>

              {workoutLibrary.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center">
                  <p className="text-xs text-slate-500">Nessun allenamento disponibile al momento. Il tuo coach pubblicherà presto i WOD.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workoutLibrary.map((w) => (
                    <div key={w.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{w.title}</h4>
                        <p className="text-xs text-emerald-400 uppercase tracking-wide">{w.type} • {w.details}</p>
                      </div>
                      <button
                        onClick={() => startWorkoutSession(w)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Avvia WOD
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SEZIONE TIMER ATTIVO PER L'ATLETA */}
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
                      : 'Cronometro WOD in esecuzione'}
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