'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Dumbbell, User, LogOut, 
  Plus, BookOpen, Play, Square, RotateCcw, Trash2, Calendar
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
  
  // Program / Multi-day Builder State
  const [programTitle, setProgramTitle] = useState('');
  const [programDays, setProgramDays] = useState<any[]>([
    {
      dayName: 'Giorno 1: Upper Body',
      workoutBlocks: [
        { 
          id: 1, 
          categoryType: 'strength', 
          title: 'Blocco 1: Forza', 
          headerNote: '',
          sets: '5',
          reps: '5',
          percentage: '80%',
          rpe: '8',
          exerciseList: [{ name: 'Back Squat', details: '5 reps', note: '' }]
        }
      ]
    }
  ]);

  // Library State
  const [programLibrary, setProgramLibrary] = useState<any[]>([]);

  // Athlete Navigation State
  const [selectedDayIndices, setSelectedDayIndices] = useState<{ [key: number]: number }>({});

  // Timer State
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<any | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

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

  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            alert('Tempo scaduto!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

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

  // --- Gestione Giorni e Blocchi ---
  const addProgramDay = () => {
    setProgramDays([
      ...programDays,
      {
        dayName: `Giorno ${programDays.length + 1}`,
        workoutBlocks: [
          {
            id: Date.now(),
            categoryType: 'strength',
            title: `Blocco 1`,
            headerNote: '',
            sets: '4',
            reps: '8',
            percentage: '75%',
            rpe: '7.5',
            exerciseList: [{ name: '', details: '', note: '' }]
          }
        ]
      }
    ]);
  };

  const updateDayName = (dayIndex: number, name: string) => {
    const updated = [...programDays];
    updated[dayIndex].dayName = name;
    setProgramDays(updated);
  };

  const removeProgramDay = (dayIndex: number) => {
    if (programDays.length === 1) {
      alert("Il programma deve contenere almeno un giorno.");
      return;
    }
    setProgramDays(programDays.filter((_, i) => i !== dayIndex));
  };

  const addBlockToDay = (dayIndex: number) => {
    const updated = [...programDays];
    updated[dayIndex].workoutBlocks.push({
      id: Date.now(),
      categoryType: 'strength',
      title: `Blocco ${updated[dayIndex].workoutBlocks.length + 1}`,
      headerNote: '',
      sets: '4',
      reps: '8',
      percentage: '75%',
      rpe: '7.5',
      exerciseList: [{ name: '', details: '', note: '' }]
    });
    setProgramDays(updated);
  };

  const updateBlockInDay = (dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = [...programDays];
    updated[dayIndex].workoutBlocks[blockIndex][field] = value;
    setProgramDays(updated);
  };

  const removeBlockFromDay = (dayIndex: number, blockIndex: number) => {
    const updated = [...programDays];
    if (updated[dayIndex].workoutBlocks.length === 1) {
      alert("Ogni giorno deve contenere almeno un blocco di allenamento.");
      return;
    }
    updated[dayIndex].workoutBlocks = updated[dayIndex].workoutBlocks.filter((_: any, i: number) => i !== blockIndex);
    setProgramDays(updated);
  };

  const addExerciseToBlockInDay = (dayIndex: number, blockIndex: number) => {
    const updated = [...programDays];
    updated[dayIndex].workoutBlocks[blockIndex].exerciseList.push({ name: '', details: '', note: '' });
    setProgramDays(updated);
  };

  const updateExerciseInBlock = (dayIndex: number, blockIndex: number, exIndex: number, field: 'name' | 'details' | 'note', value: string) => {
    const updated = [...programDays];
    updated[dayIndex].workoutBlocks[blockIndex].exerciseList[exIndex][field] = value;
    setProgramDays(updated);
  };

  const removeExerciseFromBlockInDay = (dayIndex: number, blockIndex: number, exIndex: number) => {
    const updated = [...programDays];
    if (updated[dayIndex].workoutBlocks[blockIndex].exerciseList.length === 1) return;
    updated[dayIndex].workoutBlocks[blockIndex].exerciseList = updated[dayIndex].workoutBlocks[blockIndex].exerciseList.filter((_: any, i: number) => i !== exIndex);
    setProgramDays(updated);
  };

  const saveProgramToLibrary = () => {
    if (!programTitle) {
      alert("Inserisci un titolo per il programma.");
      return;
    }
    const newProgramItem = {
      id: Date.now(),
      title: programTitle,
      assignedAthleteId: selectedAthlete,
      assignedTo: selectedAthlete ? athletes.find(a => a.id === selectedAthlete)?.full_name : 'Tutti',
      days: programDays
    };

    setProgramLibrary([...programLibrary, newProgramItem]);
    alert("Programma salvato e assegnato con successo!");
  };

  const startWorkoutSession = (block: any) => {
    setActiveWorkoutSession(block);
    setTimerSeconds(600);
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

  // Mostra i programmi se sono assegnati specificamente all'atleta o se sono per "Tutti" (!prog.assignedAthleteId)
  const athletePrograms = programLibrary.filter(
    (prog) => !prog.assignedAthleteId || prog.assignedAthleteId === '' || prog.assignedAthleteId === session?.user?.id
  );

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
            <div className="flex gap-2 mb-6 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveCoachTab('builder')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'builder' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" /> Crea Programma
              </button>
              <button
                onClick={() => setActiveCoachTab('library')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeCoachTab === 'library' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Libreria Programmi
              </button>
            </div>

            {activeCoachTab === 'builder' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" /> Nuovo Programma Plurigiornaliero
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-medium">Assegna ad Atleta</label>
                      <select
                        value={selectedAthlete}
                        onChange={(e) => setSelectedAthlete(e.target.value)}
                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Seleziona Atleta (o Tutti) --</option>
                        {athletes.map((athlete) => (
                          <option key={athlete.id} value={athlete.id}>
                            {athlete.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium">Titolo del Programma</label>
                      <input
                        type="text"
                        value={programTitle}
                        onChange={(e) => setProgramTitle(e.target.value)}
                        placeholder="Es. Settimana 1 - Forza & Conditioning"
                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Gestione Giorni */}
                  <div className="space-y-6 pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                        Giornate del Programma ({programDays.length})
                      </h3>
                      <button
                        type="button"
                        onClick={addProgramDay}
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Aggiungi Giorno
                      </button>
                    </div>

                    {programDays.map((day, dayIdx) => (
                      <div key={dayIdx} className="bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl space-y-5 shadow-lg">
                        <div className="flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 flex-1 mr-4">
                            <span className="text-xs font-bold text-emerald-400">Giorno {dayIdx + 1}:</span>
                            <input
                              type="text"
                              value={day.dayName}
                              onChange={(e) => updateDayName(dayIdx, e.target.value)}
                              placeholder="Es. Lunedì - Gambe"
                              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white flex-1 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProgramDay(dayIdx)}
                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                            title="Elimina Giorno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Blocchi */}
                        <div className="space-y-4 pl-2 md:pl-4 border-l-2 border-emerald-500/20">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Blocchi ({day.workoutBlocks.length})
                            </h4>
                            <button
                              type="button"
                              onClick={() => addBlockToDay(dayIdx)}
                              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Aggiungi Blocco
                            </button>
                          </div>

                          {day.workoutBlocks.map((block: any, blockIdx: number) => (
                            <div key={block.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 relative">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <input
                                  type="text"
                                  value={block.title}
                                  onChange={(e) => updateBlockInDay(dayIdx, blockIdx, 'title', e.target.value)}
                                  placeholder="Titolo Blocco"
                                  className="bg-transparent font-bold text-xs text-white w-full focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeBlockFromDay(dayIdx, blockIdx)}
                                  className="text-slate-500 hover:text-red-400 transition-colors ml-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Selezione Tipo Blocco */}
                              <div>
                                <label className="text-[10px] text-slate-400 font-medium block mb-1">Tipologia Blocco</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateBlockInDay(dayIdx, blockIdx, 'categoryType', 'strength')}
                                    className={`py-2 text-xs font-bold uppercase rounded-lg transition-colors ${
                                      block.categoryType === 'strength' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300'
                                    }`}
                                  >
                                    🏋️‍♂️ Forza (Set / Reps / Carico)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateBlockInDay(dayIdx, blockIdx, 'categoryType', 'circuit')}
                                    className={`py-2 text-xs font-bold uppercase rounded-lg transition-colors ${
                                      block.categoryType === 'circuit' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300'
                                    }`}
                                  >
                                    🔄 Circuito / WOD (Casella Semplice)
                                  </button>
                                </div>
                              </div>

                              {/* Parametri dinamici in base al tipo */}
                              {block.categoryType === 'strength' ? (
                                <div className="space-y-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                                  <div className="grid grid-cols-4 gap-2">
                                    <div>
                                      <label className="text-[10px] text-slate-400 font-medium">Set</label>
                                      <input type="text" value={block.sets} onChange={(e) => updateBlockInDay(dayIdx, blockIdx, 'sets', e.target.value)} placeholder="4" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white text-center" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-400 font-medium">Reps</label>
                                      <input type="text" value={block.reps} onChange={(e) => updateBlockInDay(dayIdx, blockIdx, 'reps', e.target.value)} placeholder="8" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white text-center" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-400 font-medium">% Carico</label>
                                      <input type="text" value={block.percentage} onChange={(e) => updateBlockInDay(dayIdx, blockIdx, 'percentage', e.target.value)} placeholder="75%" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white text-center" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-slate-400 font-medium">RPE</label>
                                      <input type="text" value={block.rpe} onChange={(e) => updateBlockInDay(dayIdx, blockIdx, 'rpe', e.target.value)} placeholder="7.5" className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white text-center" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="text-[10px] text-slate-400 font-medium block mb-1">Casella di testa (Descrizione / Istruzioni Circuito)</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Inserisci qui i dettagli del circuito o WOD..."
                                    value={block.headerNote || ''}
                                    onChange={(e) => updateBlockInDay(dayIdx, blockIdx, 'headerNote', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                                  />
                                </div>
                              )}

                              {/* Esercizi (Mostrati SOLO se il blocco è Forza) */}
                              {block.categoryType === 'strength' && (
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Esercizi del Blocco</label>
                                    <button
                                      type="button"
                                      onClick={() => addExerciseToBlockInDay(dayIdx, blockIdx)}
                                      className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3" /> Aggiungi Esercizio
                                    </button>
                                  </div>

                                  {block.exerciseList?.map((ex: any, exIdx: number) => (
                                    <div key={exIdx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                                      <div className="flex gap-2 items-center">
                                        <input
                                          type="text"
                                          placeholder="Nome Esercizio"
                                          value={ex.name}
                                          onChange={(e) => updateExerciseInBlock(dayIdx, blockIdx, exIdx, 'name', e.target.value)}
                                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Dettagli"
                                          value={ex.details}
                                          onChange={(e) => updateExerciseInBlock(dayIdx, blockIdx, exIdx, 'details', e.target.value)}
                                          className="w-1/3 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                                        />
                                        {block.exerciseList.length > 1 && (
                                          <button
                                            type="button"
                                            onClick={() => removeExerciseFromBlockInDay(dayIdx, blockIdx, exIdx)}
                                            className="text-slate-500 hover:text-red-400"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        placeholder="Nota specifica esercizio..."
                                        value={ex.note || ''}
                                        onChange={(e) => updateExerciseInBlock(dayIdx, blockIdx, exIdx, 'note', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800/60 rounded-lg p-1.5 text-[11px] text-slate-300"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={saveProgramToLibrary} 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-colors shadow-xl flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Salva e Assegna Programma
                  </button>
                </div>
              </div>
            )}

            {activeCoachTab === 'library' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" /> Libreria Programmi Assegnati
                  </h2>
                  {programLibrary.length === 0 ? (
                    <p className="text-xs text-slate-500">Nessun programma salvato nella libreria.</p>
                  ) : (
                    <div className="space-y-4">
                      {programLibrary.map((prog) => (
                        <div key={prog.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                            <div>
                              <h4 className="font-bold text-base text-white">{prog.title}</h4>
                              <p className="text-xs text-emerald-400 font-medium">Assegnato a: {prog.assignedTo}</p>
                            </div>
                            <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800 font-bold">
                              {prog.days.length} Giornate
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {prog.days.map((d: any, dIdx: number) => (
                              <div key={dIdx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <h5 className="font-bold text-xs text-emerald-400 uppercase">{d.dayName}</h5>
                                <div className="space-y-1.5">
                                  {d.workoutBlocks.map((b: any, bIdx: number) => (
                                    <div key={bIdx} className="text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                                      <span className="font-bold text-white">• {b.title}</span>
                                      {b.categoryType === 'strength' ? (
                                        <div className="text-[11px] text-emerald-400">
                                          {b.sets} set x {b.reps} reps (% {b.percentage} - RPE {b.rpe})
                                        </div>
                                      ) : (
                                        b.headerNote && <p className="text-[11px] text-slate-400 italic">{b.headerNote}</p>
                                      )}
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
          // Vista Atleta
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-2">Benvenuto, {profile?.full_name}!</h2>
              <p className="text-slate-400 text-sm mb-6">Ecco i tuoi programmi di allenamento assegnati.</p>

              {athletePrograms.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center">
                  <p className="text-xs text-slate-500">Nessun programma assegnato al momento.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {athletePrograms.map((prog) => {
                    const currentDayIdx = selectedDayIndices[prog.id] || 0;
                    const activeDay = prog.days[currentDayIdx] || prog.days[0];

                    return (
                      <div key={prog.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="border-b border-slate-900 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-lg text-white">{prog.title}</h3>
                            <p className="text-xs text-emerald-400 font-medium">Programma completo settimanale</p>
                          </div>
                          <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 font-bold self-start">
                            {prog.days.length} Giornate totali
                          </span>
                        </div>

                        {/* Selettore Giorni */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Seleziona Giorno:</label>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {prog.days.map((day: any, dIdx: number) => (
                              <button
                                key={dIdx}
                                onClick={() => setSelectedDayIndices({ ...selectedDayIndices, [prog.id]: dIdx })}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                  currentDayIdx === dIdx 
                                    ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105' 
                                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                                }`}
                              >
                                {day.dayName}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Visualizzazione Giorno Attivo */}
                        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Calendar className="w-4 h-4 text-emerald-400" />
                            <h4 className="font-bold text-sm text-emerald-400 uppercase tracking-wide">{activeDay.dayName}</h4>
                          </div>

                          <div className="space-y-4">
                            {activeDay.workoutBlocks.map((block: any, blockIdx: number) => (
                              <div key={blockIdx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-white">{block.title}</span>
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full uppercase">
                                    {block.categoryType === 'strength' ? 'Forza' : 'Circuito'}
                                  </span>
                                </div>

                                {block.categoryType === 'strength' ? (
                                  <div className="flex gap-4 text-xs text-emerald-400 font-medium bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                                    {block.sets && <span>Set: {block.sets}</span>}
                                    {block.reps && <span>Reps: {block.reps}</span>}
                                    {block.percentage && <span>% Carico: {block.percentage}</span>}
                                    {block.rpe && <span>RPE: {block.rpe}</span>}
                                  </div>
                                ) : (
                                  block.headerNote && (
                                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
                                      {block.headerNote}
                                    </p>
                                  )
                                )}

                                {block.categoryType === 'strength' && (
                                  <div className="space-y-2 pt-1">
                                    {block.exerciseList?.map((ex: any, exIdx: number) => (
                                      <div key={exIdx} className="text-xs bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                                        <div className="flex justify-between text-slate-200">
                                          <span className="font-bold">• {ex.name}</span>
                                          <span className="text-slate-400 font-mono">{ex.details}</span>
                                        </div>
                                        {ex.note && (
                                          <div className="text-[11px] text-slate-400 italic mt-1 pl-3 border-l border-emerald-500/30">
                                            Nota: {ex.note}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button
                                  onClick={() => startWorkoutSession(block)}
                                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current text-emerald-400" /> Avvia Cronometro Blocco
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {activeWorkoutSession && (
              <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white text-left">{activeWorkoutSession.title}</h3>
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
                    onClick={() => { setTimerSeconds(600); setTimerActive(false); }}
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