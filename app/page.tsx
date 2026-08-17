import React, { useState } from 'react';
import { 
  Dumbbell, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Award, 
  User, 
  Play, 
  Check, 
  Plus, 
  Trash2, 
  ChevronRight, 
  LogOut,
  Flame,
  Target
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  
  // Dati di esempio
  const [workouts, setWorkouts] = useState([
    {
      id: 1,
      title: 'Petto & Tricipiti Power',
      duration: '45 min',
      level: 'Intermedio',
      exercises: [
        { name: 'Panca Piana', sets: 4, reps: '8-10', weight: '70kg' },
        { name: 'Spinte Manubri Inclinata', sets: 3, reps: '10-12', weight: '22kg' },
        { name: 'Dip alle Parallele', sets: 3, reps: 'A sfinimento', weight: 'Body' },
        { name: 'Pushdown Cavo Alto', sets: 4, reps: '12', weight: '25kg' }
      ]
    },
    {
      id: 2,
      title: 'Dorso & Bicipiti Hyper',
      duration: '50 min',
      level: 'Avanzato',
      exercises: [
        { name: 'Trazioni alla Sbarra', sets: 4, reps: '8', weight: 'Body' },
        { name: 'Rematore con Bilanciere', sets: 4, reps: '8-10', weight: '60kg' },
        { name: 'Pulley Basso', sets: 3, reps: '12', weight: '45kg' },
        { name: 'Curl Bilanciere EZ', sets: 4, reps: '10', weight: '30kg' }
      ]
    }
  ]);

  const [stats, setStats] = useState({
    workoutsCompleted: 12,
    streakDays: 4,
    totalMinutes: 580,
    caloriesBurned: 4200
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Import dei font Google stile Graffiti/Streetwear */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Permanent+Marker&display=swap');
      `}</style>

      {!isLoggedIn ? (
        // SCHERMATA LOGIN
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '40px',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '50%',
              marginBottom: '16px'
            }}>
              <Dumbbell size={48} color="#10b981" />
            </div>
            
            {/* TITOLO GRAFFITI LOGIN */}
            <h1 style={{ 
              color: '#10b981', 
              margin: 0, 
              fontSize: '32px', 
              fontFamily: "'Bungee', cursive",
              letterSpacing: '1px',
              textShadow: '2px 2px 0px #000'
            }}>
              AMTraining
            </h1>
            
            {/* SOTTOTITOLO GRAFFITI LOGIN */}
            <div style={{ 
              color: '#94a3b8', 
              fontSize: '18px', 
              fontFamily: "'Permanent Marker', cursive",
              marginTop: '4px',
              marginBottom: '32px',
              transform: 'rotate(-2deg)'
            }}>
              Improve Your Fitness
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#94a3b8' }}>Email</label>
                <input 
                  type="email" 
                  defaultValue="user@amtraining.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    boxSizing: 'border-box'
                  }} 
                />
              </div>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#94a3b8' }}>Password</label>
                <input 
                  type="password" 
                  defaultValue="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    boxSizing: 'border-box'
                  }} 
                />
              </div>
              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Accedi
              </button>
            </form>
          </div>
        </div>
      ) : (
        // DASHBOARD PRINCIPALE
        <div>
          {/* HEADER */}
          <header style={{
            backgroundColor: '#1e293b',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Dumbbell size={32} color="#10b981" />
              <div>
                {/* TITOLO GRAFFITI HEADER */}
                <h2 style={{ 
                  color: '#10b981', 
                  margin: 0, 
                  fontSize: '24px', 
                  fontFamily: "'Bungee', cursive",
                  letterSpacing: '1px',
                  lineHeight: '1'
                }}>
                  AMTraining
                </h2>
                
                {/* SOTTOTITOLO GRAFFITI HEADER */}
                <div style={{ 
                  color: '#94a3b8', 
                  fontSize: '13px', 
                  fontFamily: "'Permanent Marker', cursive",
                  marginTop: '2px',
                  transform: 'rotate(-1deg)'
                }}>
                  Improve Your Fitness
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsLoggedIn(false)}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '8px 12px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} /> Esci
            </button>
          </header>

          {/* CONTENUTO PRINCIPALE */}
          <main style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* STATS RAPIDE */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', marginBottom: '8px' }}>
                  <Award size={20} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Allenamenti</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.workoutsCompleted}</div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
                  <Flame size={20} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Streak</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.streakDays} Giorni</div>
              </div>

              <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '8px' }}>
                  <Clock size={20} />
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Tempo Totale</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalMinutes}m</div>
              </div>
            </div>

            {/* NAVIGAZIONE TABS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <button 
                onClick={() => setActiveTab('workout')}
                style={{
                  backgroundColor: activeTab === 'workout' ? '#10b981' : 'transparent',
                  color: activeTab === 'workout' ? '#fff' : '#94a3b8',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Dumbbell size={18} /> Schede
              </button>
              <button 
                onClick={() => setActiveTab('progress')}
                style={{
                  backgroundColor: activeTab === 'progress' ? '#10b981' : 'transparent',
                  color: activeTab === 'progress' ? '#fff' : '#94a3b8',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <TrendingUp size={18} /> Progressi
              </button>
            </div>

            {/* TAB WORKOUT */}
            {activeTab === 'workout' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>Le tue Schede</h3>
                  <button style={{
                    backgroundColor: '#334155',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}>
                    <Plus size={16} /> Nuova Scheda
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {workouts.map((w) => (
                    <div key={w.id} style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #334155'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{w.title}</h4>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>⏱ {w.duration} • 📊 {w.level}</span>
                        </div>
                        <button style={{
                          backgroundColor: '#10b981',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}>
                          <Play size={16} /> Avvia
                        </button>
                      </div>

                      <div style={{ borderTop: '1px solid #334155', paddingTop: '12px' }}>
                        {w.exercises.map((ex, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            fontSize: '14px',
                            color: '#cbd5e1'
                          }}>
                            <span>{ex.name}</span>
                            <span style={{ color: '#94a3b8' }}>{ex.sets} x {ex.reps} @ {ex.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB PROGRESSI */}
            {activeTab === 'progress' && (
              <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ marginTop: 0 }}>Riepilogo Attività</h3>
                <p style={{ color: '#94a3b8' }}>I tuoi dati di allenamento settimanali sono aggiornati in tempo reale.</p>
                <div style={{
                  height: '150px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b'
                }}>
                  [Grafico dei Progressi]
                </div>
              </div>
            )}

          </main>
        </div>
      )}
    </div>
  );
}
