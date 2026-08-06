'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Dumbbell, Calendar as CalendarIcon, Users, User, LogOut, 
  Plus, Check, ChevronRight, Clock, Award, Shield, Activity, TrendingUp, Settings, BookOpen, FolderPlus
} from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCoachTab, setActiveCoachTab] = useState<'builder' | 'library' | 'classes'>('builder');

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
  
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<'amrap' | 'emom' | 'rnd' | 'intervals'>('amrap');
  const [duration, setDuration] = useState('12');
  const [rndRounds, setRndRounds] = useState('5');
  const [workTime, setWorkTime] = useState('40');
  const [restTime, setRestTime] = useState('20');
  const [intervalRounds, setIntervalRounds] = useState('5');
  
  // Library & Weekly Programs State
  const [workoutLibrary, setWorkoutLibrary] = useState<any[]>([]);
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

            {/* TAB 1: CREA / ASSEGNA */}
            {activeCoachTab === 'builder' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-400" /> Nuovo Allenamento o Programma
                </h2>

                {/* Scegli se assegnare a Singolo Atleta o a una Classe */}
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

                {/* Tipo di programmazione (Singolo giorno vs Settimanale) */}
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

                    {/* Selettore Tipologia */}
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

                    {/* Parametri Circuito */}
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

                    <button onClick={saveToLibrary} className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2.5 rounded-lg text-xs border border-slate-700 transition-colors">
                      Salva nella Libreria
                    </button>
                  </>
                ) : (
                  /* SCHEDA SETTIMANALE */
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
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIBRERIA ALLENAMENTI */}
            {activeCoachTab === 'library' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" /> Libreria Circuiti Creati
                </h2>
                {workoutLibrary.length === 0 ? (
                  <p className="text-xs text-slate-500">Nessun allenamento salvato nella libreria.</p>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">Benvenuto, Atleta!</h2>
            <p className="text-slate-400 text-sm">Qui troverai i circuiti e la programmazione assegnata dal tuo coach o dalla tua classe.</p>
          </div>
        )}
      </div>
    </main>
  );
}