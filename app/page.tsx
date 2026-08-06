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
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Dumbbell className="text-blue-500" /> AMTRAINING Dashboard
        </h1>
        {session ? (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <p className="mb-4">Benvenuto! Accesso effettuato con successo.</p>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <LogOut size={18} /> Esci
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Accedi' : 'Registrati'}</h2>
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 bg-slate-800 rounded border border-slate-700 text-white"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2 bg-slate-800 rounded border border-slate-700 text-white"
            />
            <button 
              onClick={async () => {
                if (isLogin) {
                  await supabase.auth.signInWithPassword({ email, password });
                } else {
                  await supabase.auth.signUp({ email, password });
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
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