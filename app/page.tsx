'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Dumbbell, Calendar as CalendarIcon, Users, User, Plus, Check, ChevronRight, Clock, Award, Trash2, Edit2, X, Save, LogOut, BookOpen, Shield, Activity, TrendingUp, Settings 
} from 'lucide-react';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Coach State & Workout Builder State
  const [athletes, setAthletes] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<string[]>(['Classe Mattina', 'Classe Serale']);
  const [selectedTargetType, setSelectedTargetType] = useState<'athlete' | 'class'>('athlete');
  const [selectedAthlete, setSelectedAthlete] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');

  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutType, setWorkoutType] = useState<'amrap' | 'emom' | 'rnd' | 'interval'>('amrap');
  const [duration, setDuration] = useState('12');
  const [rndRounds, setRndRounds] = useState('5');
  const [workTime, setWorkTime] = useState('40');
  const [restTime, setRestTime] = useState('20');
  const [intervalRounds, setIntervalRounds] = useState('5');

  useEffect(() => {
    supabase.auth.getSession().then((response: any) => {
      setSession(response.data?.session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Caricamento in corso...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="text-blue-500" /> AMTRAINING Dashboard
          </h1>
          {session && (
            <button 
              onClick={() => supabase.auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
            >
              <LogOut size={16} /> Esci
            </button>
          )}
        </div>

        {session ? (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="text-green-500" /> Generatore Allenamenti & Coach
              </h2>
              <p className="text-slate-400 text-sm mb-4">Benvenuto nell'area di gestione di AMTRAINING. Configura i tuoi WOD e assegnali agli atleti o alle classi.</p>
              
              {/* Esempio sezione builder */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Titolo Allenamento</label>
                  <input 
                    type="text" 
                    placeholder="Es. Fran / WOD Principale"
                    value={workoutTitle}
                    onChange={(e) => setWorkoutTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-white"
                  />
                </div>
                <button 
                  onClick={() => alert('Allenamento pronto!')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Crea e Assegna WOD
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Accedi' : 'Registrati'}</h2>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-white"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2.5 bg-slate-800 rounded-lg border border-slate-700 text-white"
            />
            <button 
              onClick={async () => {
                if (isLogin) {
                  await supabase.auth.signInWithPassword({ email, password });
                } else {
                  await supabase.auth.signUp({ email, password });
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold"
            >
              {isLogin ? 'Login' : 'Registrati'}
            </button>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full mt-3 text-sm text-slate-400 hover:underline text-center"
            >
              {isLogin ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}