'use client';
 
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
const STRENGTH_EXERCISES = [
 'Back Squat',
 'Deadlift',
 'Front Squat',
 'OHS',
 'Press',
 'Push Press',
 'Push Jerk',
 'Split Jerk',
 'Power Snatch',
 'Squat Snatch',
 'Hang Power Snatch',
 'Hang Squat Snatch',
 'Power Clean',
 'Squat Clean',
 'Hang Power Clean',
 'Hang Squat Clean',
 'Clean & Jerk',
 'Panca Piana'
];
 
const REP_SCHEMES = [1, 3, 5, 10];
 
export default function TrainingApp() {
 const [session, setSession] = useState<any>(null);
 const [role, setRole] = useState<'coach' | 'athlete'>('athlete');
 const [loading, setLoading] = useState(true);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [fullName, setFullName] = useState('');
 const [authError, setAuthError] = useState('');
 const [isRegistering, setIsRegistering] = useState(false);
 
 const [athletes, setAthletes] = useState<any[]>([]);
 const [selectedAthlete, setSelectedAthlete] = useState('');
 const [programTitle, setProgramTitle] = useState('');
 
 const [useCalendar, setUseCalendar] = useState<boolean>(false);
 const [useRealCalendar, setUseRealCalendar] = useState<boolean>(false);
 
 // Stato per gestire l'apertura/chiusura (Accordion) dei blocchi esercizio
 const [collapsedBlocks, setCollapsedBlocks] = useState<{ [key: string]: boolean }>({});
 
 const [programDays, setProgramDays] = useState<any[]>([
   {
     dayNumber: 1,
     dayName: 'Giorno 1',
     date: new Date().toISOString().split('T')[0],
     blocks: []
   }
 ]);
 
 const [weekDays, setWeekDays] = useState<any[]>([
   { dayName: 'Lunedì', date: '', blocks: [] },
   { dayName: 'Martedì', date: '', blocks: [] },
   { dayName: 'Mercoledì', date: '', blocks: [] },
   { dayName: 'Giovedì', date: '', blocks: [] },
   { dayName: 'Venerdì', date: '', blocks: [] },
   { dayName: 'Sabato', date: '', blocks: [] },
   { dayName: 'Domenica', date: '', blocks: [] },
 ]);
 
 const [programLibrary, setProgramLibrary] = useState<any[]>([]);
 const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
 
 const [activeTab, setActiveTab] = useState<'create' | 'library' | 'exercises' | 'profile'>('create');
 const [coachSubView, setCoachSubView] = useState<'programs' | 'athletes'>('programs');
 const [selectedCoachAthlete, setSelectedCoachAthlete] = useState<any | null>(null);
 
 const [selectedDayView, setSelectedDayView] = useState('Lunedì');
 const [libraryFilterAthlete, setLibraryFilterAthlete] = useState('');
 
 const [newExName, setNewExName] = useState('');
 const [newExVideo, setNewExVideo] = useState('');
 
 const [athleteResults, setAthleteResults] = useState<{ [key: string]: any }>({});
 const [coachAllResults, setCoachAllResults] = useState<{ [key: string]: any }>({});
 
 const [athleteMaxes, setAthleteMaxes] = useState<{ [exercise: string]: { [reps: number]: string } }>({});
 const [coachAthleteMaxes, setCoachAthleteMaxes] = useState<{ [athleteId: string]: any }>({});
 
 const [editingProgram, setEditingProgram] = useState<any | null>(null);
 const [saveMessage, setSaveMessage] = useState('');
 
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
     fetchExerciseLibrary();
     if (role === 'coach') {
       fetchAthletes();
       fetchAllAthleteResultsForCoach();
       fetchAllAthleteMaxesForCoach();
     } else {
       fetchAthleteResults();
       fetchAthleteMaxes(session.user.id);
     }
 
     const channel = supabase
       .channel('realtime-programs')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'programs' }, () => {
         fetchProgramLibrary();
       })
       .subscribe();
 
     const exChannel = supabase
       .channel('realtime-exercises')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'exercises_library' }, () => {
         fetchExerciseLibrary();
       })
       .subscribe();
 
     const resultsChannel = supabase
       .channel('realtime-results')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'program_results' }, () => {
         if (role === 'coach') fetchAllAthleteResultsForCoach();
       })
       .subscribe();
 
     const maxesChannel = supabase
       .channel('realtime-maxes')
       .on('postgres_changes', { event: '*', schema: 'public', table: 'athlete_maxes' }, () => {
         if (role === 'coach') fetchAllAthleteMaxesForCoach();
       })
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
       supabase.removeChannel(exChannel);
       supabase.removeChannel(resultsChannel);
       supabase.removeChannel(maxesChannel);
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
       useRealCalendar: item.use_real_calendar || false,
       days: item.days || []
     }));
     setProgramLibrary(formatted);
   }
 };
 
 const fetchExerciseLibrary = async () => {
   const { data } = await supabase.from('exercises_library').select('*').order('name', { ascending: true });
   if (data) setExerciseLibrary(data);
 };
 
 const fetchAthleteResults = async () => {
   const { data } = await supabase.from('program_results').select('*').eq('athlete_id', session.user.id);
   if (data) {
     const resultsMap: { [key: string]: any } = {};
     data.forEach((item: any) => {
       resultsMap[item.program_id] = item.results || {};
     });
     setAthleteResults(resultsMap);
   }
 };
 
 const fetchAllAthleteResultsForCoach = async () => {
   const { data } = await supabase.from('program_results').select('*');
   if (data) {
     const map: { [key: string]: any } = {};
     data.forEach((item: any) => {
       if (!map[item.program_id]) map[item.program_id] = {};
       map[item.program_id][item.athlete_id] = item.results;
     });
     setCoachAllResults(map);
   }
 };
 
 const fetchAthleteMaxes = async (athleteId: string) => {
   const { data } = await supabase.from('athlete_maxes').select('*').eq('athlete_id', athleteId).single();
   if (data && data.maxes) {
     setAthleteMaxes(data.maxes);
   } else {
     setAthleteMaxes({});
   }
 };
 
 const fetchAllAthleteMaxesForCoach = async () => {
   const { data } = await supabase.from('athlete_maxes').select('*');
   if (data) {
     const map: { [key: string]: any } = {};
     data.forEach((item: any) => {
       map[item.athlete_id] = item.maxes || {};
     });
     setCoachAthleteMaxes(map);
   }
 };
 
 const handleMaxChange = async (exercise: string, reps: number, value: string) => {
   const updatedEx = { ...(athleteMaxes[exercise] || {}), [reps]: value };
   const updatedAll = { ...athleteMaxes, [exercise]: updatedEx };
   setAthleteMaxes(updatedAll);
 
   await supabase.from('athlete_maxes').upsert(
     {
       athlete_id: session.user.id,
       maxes: updatedAll,
       updated_at: new Date().toISOString()
     },
     { onConflict: 'athlete_id' }
   );
 };
 
 const handleResultChange = async (programId: string, blockKey: string, field: string, value: string) => {
   const currentProgResults = athleteResults[programId] || {};
   const currentBlockResults = currentProgResults[blockKey] || { score: '', notes: '' };
   
   const updatedBlockResults = { ...currentBlockResults, [field]: value };
   const updatedProgResults = { ...currentProgResults, [blockKey]: updatedBlockResults };
 
   setAthleteResults({ ...athleteResults, [programId]: updatedProgResults });
 
   await supabase.from('program_results').upsert(
     {
       program_id: programId,
       athlete_id: session.user.id,
       results: updatedProgResults,
       updated_at: new Date().toISOString()
     },
     { onConflict: 'program_id, athlete_id' }
   );
 };
 
 const handleLogin = async (e: React.FormEvent) => {
   e.preventDefault();
   setAuthError('');
   const { error } = await supabase.auth.signInWithPassword({ email, password });
   if (error) setAuthError(error.message);
 };

 const handleSignUp = async (e: React.FormEvent) => {
   e.preventDefault();
   setAuthError('');
   const { error } = await supabase.auth.signUp({
     email,
     password,
     options: {
       data: { full_name: fullName }
     }
   });
   if (error) {
     setAuthError(error.message);
   } else {
     alert('Registrazione effettuata con successo! Controlla la tua email se è richiesta la conferma.');
     setIsRegistering(false);
   }
 };
 
 const handleLogout = async () => {
   await supabase.auth.signOut();
   setSession(null);
 };
 
 const toggleBlockCollapse = (blockKey: string) => {
   setCollapsedBlocks(prev => ({
     ...prev,
     [blockKey]: !prev[blockKey]
   }));
 };
 
 const addDay = () => {
   setProgramDays([
     ...programDays,
     { 
       dayNumber: programDays.length + 1, 
       dayName: `Giorno ${programDays.length + 1}`, 
       date: new Date().toISOString().split('T')[0],
       blocks: [] 
     }
   ]);
 };
 
 const removeBlockFromFreeDay = (dayIndex: number, blockIndex: number) => {
   const updated = [...programDays];
   updated[dayIndex].blocks.splice(blockIndex, 1);
   setProgramDays(updated);
 };
 
 const removeBlockFromWeekDay = (dayIndex: number, blockIndex: number) => {
   const updated = [...weekDays];
   updated[dayIndex].blocks.splice(blockIndex, 1);
   setWeekDays(updated);
 };
 
 const moveFreeBlock = (dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
   const updated = [...programDays];
   const blocks = [...updated[dayIndex].blocks];
   const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
   if (newIndex < 0 || newIndex >= blocks.length) return;
   const temp = blocks[blockIndex];
   blocks[blockIndex] = blocks[newIndex];
   blocks[newIndex] = temp;
   updated[dayIndex].blocks = blocks;
   setProgramDays(updated);
 };
 
 const moveWeekBlock = (dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
   const updated = [...weekDays];
   const blocks = [...updated[dayIndex].blocks];
   const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
   if (newIndex < 0 || newIndex >= blocks.length) return;
   const temp = blocks[blockIndex];
   blocks[blockIndex] = blocks[newIndex];
   blocks[newIndex] = temp;
   updated[dayIndex].blocks = blocks;
   setWeekDays(updated);
 };
 
 const moveEditingBlock = (dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
   const updated = { ...editingProgram };
   const blocks = [...updated.days[dayIndex].blocks];
   const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
   if (newIndex < 0 || newIndex >= blocks.length) return;
   const temp = blocks[blockIndex];
   blocks[blockIndex] = blocks[newIndex];
   blocks[newIndex] = temp;
   updated.days[dayIndex].blocks = blocks;
   setEditingProgram(updated);
 };
 
 const handleSelectExerciseFromLibrary = async (exName: string, updateBlockFunc: (field: string, val: any) => void, setVideoFunc: (val: string) => void) => {
   updateBlockFunc('name', exName);
   const found = exerciseLibrary.find(ex => ex.name === exName);
   if (found && found.video_url) {
     setVideoFunc(found.video_url);
     updateBlockFunc('videoUrl', found.video_url);
   }
 };
 
 const addGlobalExercise = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!newExName) return;
   const { error } = await supabase.from('exercises_library').insert([{ name: newExName, video_url: newExVideo }]);
   if (error) {
     alert('Errore: ' + error.message);
   } else {
     setNewExName('');
     setNewExVideo('');
     fetchExerciseLibrary();
   }
 };
 
 const deleteGlobalExercise = async (id: string) => {
   if (confirm('Vuoi eliminare questo esercizio dalla libreria?')) {
     await supabase.from('exercises_library').delete().eq('id', id);
     fetchExerciseLibrary();
   }
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
     wodNotes: '',
     videoUrl: ''
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
     wodNotes: '',
     videoUrl: ''
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
 
   const currentDays = useCalendar ? weekDays : programDays;
 
   const newProgram = {
     title: programTitle,
     assigned_athlete_id: selectedAthlete || null,
     use_calendar: useCalendar,
     use_real_calendar: useRealCalendar,
     days: currentDays
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
 
 const duplicateProgram = async (prog: any) => {
   const duplicatedProgram = {
     title: `${prog.title} (Copia)`,
     assigned_athlete_id: prog.assignedAthleteId || null,
     use_calendar: prog.useCalendar || false,
     use_real_calendar: prog.useRealCalendar || false,
     days: prog.days || []
   };
 
   const { error } = await supabase.from('programs').insert([duplicatedProgram]);
 
   if (error) {
     alert('Errore durante la duplicazione: ' + error.message);
   } else {
     alert('Programma duplicato con successo nella libreria!');
     fetchProgramLibrary();
   }
 };
 
 const updateEditingBlock = (dayIndex: number, blockIndex: number, field: string, value: any) => {
   const updated = { ...editingProgram };
   updated.days[dayIndex].blocks[blockIndex][field] = value;
   setEditingProgram(updated);
 };
 
 const addBlockToEditingDay = (dayIndex: number) => {
   const updated = { ...editingProgram };
   if (!updated.days[dayIndex].blocks) updated.days[dayIndex].blocks = [];
   updated.days[dayIndex].blocks.push({
     id: Date.now(),
     name: '',
     type: 'forza',
     sets: 4,
     reps: '10',
     load: '70%',
     rest: '90 sec',
     notes: '',
     wodNotes: '',
     videoUrl: ''
   });
   setEditingProgram(updated);
 };
 
 const saveEditedProgram = async () => {
   if (!editingProgram.title) {
     alert('Il titolo non può essere vuoto');
     return;
   }
 
   const { error } = await supabase
     .from('programs')
     .update({
       title: editingProgram.title,
       assigned_athlete_id: editingProgram.assignedAthleteId || null,
       days: editingProgram.days
     })
     .eq('id', editingProgram.id);
 
   if (error) {
     alert('Errore durante il salvataggio: ' + error.message);
   } else {
     alert('Programma aggiornato con successo!');
     setEditingProgram(null);
     fetchProgramLibrary();
   }
 };
 
 const deleteProgram = async (id: string) => {
   if (confirm('Sei sicuro di voler eliminare questo programma?')) {
     const { error } = await supabase.from('programs').delete().eq('id', id);
     if (error) alert('Errore: ' + error.message);
   }
 };
 
 if (loading) {
   return <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Caricamento...</div>;
 }
 
 if (!session) {
   return (
     <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
       <h1 style={{ color: '#10b981', marginBottom: '20px' }}>{isRegistering ? 'REGISTRAZIONE' : 'AM TRAINING'}</h1>
       
       <form onSubmit={isRegistering ? handleSignUp : handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '12px' }}>
         <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
         
         {isRegistering && (
           <input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
         )}

         {authError && <p style={{ color: '#ef4444', fontSize: '14px' }}>{authError}</p>}
         
         <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
           {isRegistering ? 'Registrati' : 'Accedi'}
         </button>
       </form>

       <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
         {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
       </button>
     </div>
   );
 }
 
 const athletePrograms = programLibrary.filter(
   (prog) => !prog.assignedAthleteId || prog.assignedAthleteId === '' || prog.assignedAthleteId === session?.user?.id
 );
 
 const filteredLibraryPrograms = programLibrary.filter((prog) => {
   if (!libraryFilterAthlete) return true;
   return prog.assignedAthleteId === libraryFilterAthlete;
 });
 
 return (
   <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
     <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
       <div>
         <h2 style={{ fontSize: '20px', color: '#10b981', margin: 0 }}>AM TRAINING</h2>
         <span style={{ fontSize: '13px', color: '#94a3b8' }}>{session.user.email} ({role})</span>
       </div>
       <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334151', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Esci</button>
     </header>
 
     {role === 'coach' ? (
       <div style={{ maxWidth: '900px', margin: '0 auto' }}>
         <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
           <button onClick={() => { setCoachSubView('programs'); setEditingProgram(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'programs' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Gestione Programmi</button>
           <button onClick={() => { setCoachSubView('athletes'); setSelectedCoachAthlete(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'athletes' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Profili Atleti & Massimali 🏋️‍♂️</button>
         </div>
 
         {coachSubView === 'athletes' ? (
           <div>
             {selectedCoachAthlete ? (
               <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                   <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Massimali di: {selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
                   <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: '#374151', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
                 </div>
 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                   {STRENGTH_EXERCISES.map((exName) => {
                     const exMaxes = coachAthleteMaxes[selectedCoachAthlete.id]?.[exName] || {};
                     return (
                       <div key={exName} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
                         <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', marginBottom: '8px' }}>{exName}</div>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                           {REP_SCHEMES.map((reps) => (
                             <div key={reps} style={{ background: '#111827', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                               <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{reps} RM</span>
                               <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>{exMaxes[reps] || '-'} kg</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ) : (
               <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                 <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta per visualizzarne i Massimali</h3>
                 {athletes.length === 0 ? (
                   <p style={{ color: '#94a3b8' }}>Nessun atleta registrato.</p>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {athletes.map((a) => (
                       <div key={a.id} onClick={() => setSelectedCoachAthlete(a)} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{a.full_name || a.email}</span>
                         <span style={{ fontSize: '12px', color: '#10b981' }}>Visualizza Massimali →</span>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}
           </div>
         ) : editingProgram ? (
           <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Modifica Programma</h3>
               <button onClick={() => setEditingProgram(null)} style={{ background: '#374151', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Annulla</button>
             </div>
 
             <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Titolo Programma:</label>
             <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }} />
 
             <div style={{ marginBottom: '20px' }}>
               <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Assegna ad Atleta:</label>
               <select value={editingProgram.assignedAthleteId} onChange={(e) => setEditingProgram({ ...editingProgram, assignedAthleteId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', boxSizing: 'border-box' }}>
                 <option value="">Tutti gli atleti (Generale)</option>
                 {athletes.map((a) => (
                   <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                 ))}
               </select>
             </div>
 
             {/* Navigazione giorni in Modifica */}
             <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
               {editingProgram.days?.map((day: any, idx: number) => (
                 <button key={idx} onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: selectedDayView === day.dayName ? '#10b981' : '#1f2937', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                   {day.dayName} {day.date ? `(${day.date})` : ''}
                 </button>
               ))}
             </div>

             {editingProgram.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
               const actualDIdx = editingProgram.days.findIndex((d: any) => d.dayName === selectedDayView);
               return (
                 <div key={actualDIdx} style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #374151' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                     <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>📅 {day.dayName}</div>
                     {editingProgram.useRealCalendar && (
                       <input 
                         type="date" 
                         value={day.date || ''} 
                         onChange={(e) => {
                           const upd = { ...editingProgram };
                           upd.days[actualDIdx].date = e.target.value;
                           setEditingProgram(upd);
                         }}
                         style={{ padding: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                       />
                     )}
                   </div>
 
                   {day.blocks?.map((block: any, bIdx: number) => {
                     const blockKey = `edit_${actualDIdx}_${bIdx}`;
                     const isClosed = collapsedBlocks[blockKey] || false;

                     return (
                       <div key={block.id || bIdx} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #374151' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                           <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                             <button type="button" onClick={() => updateEditingBlock(actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>FORZA</button>
                             <button type="button" onClick={() => updateEditingBlock(actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>WOD</button>
                           </div>
                           <div style={{ display: 'flex', gap: '4px' }}>
                             <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                             <button type="button" onClick={() => moveEditingBlock(actualDIdx, bIdx, 'up')} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                             <button type="button" onClick={() => moveEditingBlock(actualDIdx, bIdx, 'down')} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                             <button type="button" onClick={() => {
                               const updated = { ...editingProgram };
                               updated.days[actualDIdx].blocks.splice(bIdx, 1);
                               setEditingProgram(updated);
                             }} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                           </div>
                         </div>
 
                         <div style={{ marginBottom: '10px' }}>
                           {block.type === 'forza' ? (
                             <div>
                               <select
                                 value={block.name || ''}
                                 onChange={(e) => handleSelectExerciseFromLibrary(
                                   e.target.value,
                                   (f, val) => updateEditingBlock(actualDIdx, bIdx, f, val),
                                   (vUrl) => updateEditingBlock(actualDIdx, bIdx, 'videoUrl', vUrl)
                                 )}
                                 style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', marginBottom: '6px' }}
                               >
                                 <option value="">-- Scegli Esercizio --</option>
                                 {exerciseLibrary.map((ex) => (
                                   <option key={ex.id} value={ex.name}>{ex.name}</option>
                                 ))}
                               </select>
                               <input
                                 type="text"
                                 value={block.name || ''}
                                 onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'name', e.target.value)}
                                 placeholder="Nome esercizio personalizzato"
                                 style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                               />
                             </div>
                           ) : (
                             <input type="text" value={block.name || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }} />
                           )}
                         </div>

                         {!isClosed && (
                           <div>
                             <div style={{ marginBottom: '10px' }}>
                               <input
                                 type="url"
                                 value={block.videoUrl || ''}
                                 onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'videoUrl', e.target.value)}
                                 placeholder="Link video esercizio"
                                 style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                               />
                             </div>
                             {block.type === 'forza' ? (
                               <div>
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                   <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                     <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>SET</label>
                                     <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                   </div>
                                   <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                     <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>REP</label>
                                     <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                   </div>
                                 </div>
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                   <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                     <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>CARICO / RPE</label>
                                     <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                   </div>
                                   <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                     <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RECUPERO</label>
                                     <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                   </div>
                                 </div>
                                 <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                   <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>NOTE</label>
                                   <input type="text" value={block.notes || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                                 </div>
                               </div>
                             ) : (
                               <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                 <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>WOD / CIRCUITO</label>
                                 <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     );
                   })}
                   <button onClick={() => addBlockToEditingDay(actualDIdx)} style={{ width: '100%', padding: '8px', background: '#374151', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                 </div>
               );
             })}
 
             <button onClick={saveEditedProgram} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>Salva Modifiche</button>
           </div>
         ) : (
           <div>
             <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
               <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Crea Programma</button>
               <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Programmi</button>
               <button onClick={() => setActiveTab('exercises')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'exercises' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Esercizi 🏋️‍♂️</button>
             </div>
 
             {activeTab === 'exercises' ? (
               <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                 <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Gestione Libreria Esercizi</h3>
                 <form onSubmit={addGlobalExercise} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <input type="text" placeholder="Nome Esercizio (es. Squat)" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: '#111827', border: '1px solid #334151', color: '#fff', borderRadius: '6px', fontSize: '13px' }} />
                   <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: '#111827', border: '1px solid #334151', color: '#fff', borderRadius: '6px', fontSize: '13px' }} />
                   <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
                 </form>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {exerciseLibrary.map((ex) => (
                     <div key={ex.id} style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #374151' }}>
                       <div>
                         <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{ex.name}</div>
                         <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ex.video_url || 'Nessun video'}</div>
                       </div>
                       <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina</button>
                     </div>
                   ))}
                 </div>
               </div>
             ) : activeTab === 'create' ? (
               <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                 <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
                 
                 <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #334151', color: '#fff', marginBottom: '16px', boxSizing: 'border-box' }} />
                 
                 <div style={{ marginBottom: '16px' }}>
                   <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Assegna ad Atleta:</label>
                   <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #334151', color: '#fff', boxSizing: 'border-box' }}>
                     <option value="">Tutti gli atleti (Generale)</option>
                     {athletes.map((a) => (
                       <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                     ))}
                   </select>
                 </div>
 
                 {/* Opzioni Calendario / Date Reali */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                   <div style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #334151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>Usa Calendario Settimanale</span>
                       <span style={{ fontSize: '12px', color: '#94a3b8' }}>Struttura Lunedì - Domenica</span>
                     </div>
                     <input type="checkbox" checked={useCalendar} onChange={(e) => { setUseCalendar(e.target.checked); if(e.target.checked) setUseRealCalendar(false); }} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }} />
                   </div>

                   <div style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #334151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <span style={{ fontSize: '14px', fontWeight: 'bold', display: 'block' }}>📅 Usa Date Reali del Calendario</span>
                       <span style={{ fontSize: '12px', color: '#94a3b8' }}>Associa le giornate a date specifiche (es. 2026-08-14)</span>
                     </div>
                     <input type="checkbox" checked={useRealCalendar} onChange={(e) => { setUseRealCalendar(e.target.checked); if(e.target.checked) setUseCalendar(true); }} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }} />
                   </div>
                 </div>
 
                 {useCalendar ? (
                   <div>
                     <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                       {weekDays.map((day, idx) => (
                         <button key={idx} onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: selectedDayView === day.dayName ? '#10b981' : '#1f2937', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                           {day.dayName}
                         </button>
                       ))}
                     </div>

                     {weekDays.filter((d) => d.dayName === selectedDayView).map((day) => {
                       const actualDIdx = weekDays.findIndex((d) => d.dayName === selectedDayView);
                       return (
                         <div key={actualDIdx} style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #374151' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                             <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>📅 {day.dayName}</div>
                             {useRealCalendar && (
                               <input 
                                 type="date" 
                                 value={day.date || ''} 
                                 onChange={(e) => {
                                   const upd = [...weekDays];
                                   upd[actualDIdx].date = e.target.value;
                                   setWeekDays(upd);
                                 }}
                                 style={{ padding: '6px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                               />
                             )}
                           </div>
 
                           {day.blocks.map((block: any, bIdx: number) => {
                             const blockKey = `week_${actualDIdx}_${bIdx}`;
                             const isClosed = collapsedBlocks[blockKey] || false;

                             return (
                               <div key={block.id} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #374151' }}>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                   <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                     <button type="button" onClick={() => updateWeekBlock(actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>FORZA</button>
                                     <button type="button" onClick={() => updateWeekBlock(actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>WOD</button>
                                   </div>
                                   <div style={{ display: 'flex', gap: '4px' }}>
                                     <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                     <button type="button" onClick={() => moveWeekBlock(actualDIdx, bIdx, 'up')} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                     <button type="button" onClick={() => moveWeekBlock(actualDIdx, bIdx, 'down')} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                     <button type="button" onClick={() => removeBlockFromWeekDay(actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                   </div>
                                 </div>
 
                                 <div style={{ marginBottom: '10px' }}>
                                   {block.type === 'forza' ? (
                                     <div>
                                       <select
                                         value={block.name}
                                         onChange={(e) => handleSelectExerciseFromLibrary(
                                           e.target.value,
                                           (f, val) => updateWeekBlock(actualDIdx, bIdx, f, val),
                                           (vUrl) => updateWeekBlock(actualDIdx, bIdx, 'videoUrl', vUrl)
                                         )}
                                         style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', marginBottom: '6px' }}
                                       >
                                         <option value="">-- Scegli Esercizio --</option>
                                         {exerciseLibrary.map((ex) => (
                                           <option key={ex.id} value={ex.name}>{ex.name}</option>
                                         ))}
                                       </select>
                                       <input
                                         type="text"
                                         value={block.name}
                                         onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'name', e.target.value)}
                                         placeholder="O digita nome personalizzato"
                                         style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                                       />
                                     </div>
                                   ) : (
                                     <input type="text" value={block.name} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }} />
                                   )}
                                 </div>

                                 {!isClosed && (
                                   <div>
                                     <div style={{ marginBottom: '10px' }}>
                                       <input
                                         type="url"
                                         value={block.videoUrl || ''}
                                         onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'videoUrl', e.target.value)}
                                         placeholder="Link video esercizio"
                                         style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                                       />
                                     </div>
                                     {block.type === 'forza' ? (
                                       <div>
                                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                           <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                             <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>SET</label>
                                             <input type="number" value={block.sets} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                           </div>
                                           <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                             <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>REP</label>
                                             <input type="text" value={block.reps} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                           </div>
                                         </div>
                                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                           <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                             <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>CARICO / RPE</label>
                                             <input type="text" value={block.load} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                           </div>
                                           <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                             <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>RECUPERO</label>
                                             <input type="text" value={block.rest} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                           </div>
                                         </div>
                                         <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                           <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>NOTE</label>
                                           <input type="text" value={block.notes} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                                         </div>
                                       </div>
                                     ) : (
                                       <div style={{ background: '#1f2937', padding: '8px', borderRadius: '6px' }}>
                                         <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>WOD / CIRCUITO</label>
                                         <textarea value={block.wodNotes || ''} onChange={(e) => updateWeekBlock(actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#111827', border: 'none', color: '#fff', borderRadius: '4px', fontSize: '12px' }} />
                                       </div>
                                     )}
                                   </div>
                                 )}
                               </div>
                             );
                           })}
                           <button onClick={() => addBlockToWeekDay(actualDIdx)} style={{ width: '100%', padding: '8px', background: '#374151', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi a {day.dayName}</button>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div>
                     {programDays.map((day, dIdx) => (
                       <div key={dIdx} style={{ background: '#1f2937', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                         <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                           <input type="text" value={day.dayName} onChange={(e) => {
                             const upd = [...programDays];
                             upd[dIdx].dayName = e.target.value;
                             setProgramDays(upd);
                           }} placeholder="Nome Giornata" style={{ flex: 2, padding: '10px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
                           
                           {useRealCalendar && (
                             <input type="date" value={day.date || ''} onChange={(e) => {
                               const upd = [...programDays];
                               upd[dIdx].date = e.target.value;
                               setProgramDays(upd);
                             }} style={{ flex: 1, padding: '10px', background: '#111827', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }} />
                           )}
                         </div>
 
                         {day.blocks.map((block: any, bIdx: number) => {
                           const blockKey = `free_${dIdx}_${bIdx}`;
                           const isClosed = collapsedBlocks[blockKey] || false;

                           return (
                             <div key={block.id} style={{ background: '#111827', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #374151' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                 <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                   <button type="button" onClick={() => updateFreeBlock(dIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>FORZA</button>
                                   <button type="button" onClick={() => updateFreeBlock(dIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#1f2937', color: '#fff', cursor: 'pointer' }}>WOD</button>
                                 </div>
                                 <div style={{ display: 'flex', gap: '4px' }}>
                                   <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                   <button type="button" onClick={() => moveFreeBlock(dIdx, bIdx, 'up')} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                   <button type="button" onClick={() => moveFreeBlock(dIdx, bIdx, 'down')} style={{ background: '#374151', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                   <button type="button" onClick={() => removeBlockFromFreeDay(dIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                 </div>
                               </div>
 
                               <div style={{ marginBottom: '10px' }}>
                                 {block.type === 'forza' ? (
                                   <div>
                                     <select
                                       value={block.name}
                                       onChange={(e) => handleSelectExerciseFromLibrary(
                                         e.target.value,
                                         (f, val) => updateFreeBlock(dIdx, bIdx, f, val),
                                         (vUrl) => updateFreeBlock(dIdx, bIdx, 'videoUrl', vUrl)
                                       )}
                                       style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', marginBottom: '6px' }}
                                     >
                                       <option value="">-- Scegli Esercizio --</option>
                                       {exerciseLibrary.map((ex) => (
                                         <option key={ex.id} value={ex.name}>{ex.name}</option>
                                       ))}
                                     </select>
                                     <input
                                       type="text"
                                       value={block.name}
                                       onChange={(e) => updateFreeBlock(dIdx, bIdx, 'name', e.target.value)}
                                       placeholder="O digita nome personalizzato"
                                       style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                                     />
                                   </div>
                                 ) : (
                                   <input type="text" value={block.name} onChange={(e) => updateFreeBlock(dIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }} />
                                 )}
                               </div>

                               {!isClosed && (
                                 <div>
                                   <div style={{ marginBottom: '10px' }}>
                                     <input
                                       type="url"
                                       value={block.videoUrl || ''}
                                       onChange={(e) => updateFreeBlock(dIdx, bIdx, 'videoUrl', e.target.value)}
                                       placeholder="Link video esercizio"
                                       style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                                     />
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
                               )}
                             </div>
                           );
                         })}
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
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                   <h3 style={{ fontSize: '18px', margin: 0 }}>Libreria Programmi</h3>
                   <select
                     value={libraryFilterAthlete}
                     onChange={(e) => setLibraryFilterAthlete(e.target.value)}
                     style={{ padding: '8px 12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', fontSize: '13px' }}
                   >
                     <option value="">Filtra per utente (Tutti)</option>
                     {athletes.map((a) => (
                       <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                     ))}
                   </select>
                 </div>
 
                 {filteredLibraryPrograms.length === 0 ? (
                   <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Nessun programma trovato.</p>
                 ) : (
                   filteredLibraryPrograms.map((prog) => {
                     const currentAssigned = athletes.find((a) => a.id === prog.assignedAthleteId);
                     const progResultsByAthlete = coachAllResults[prog.id] || {};
                     
                     return (
                       <div key={prog.id} style={{ background: '#111827', padding: '16px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '16px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                           <div>
                             <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                             <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                               {prog.useCalendar ? (prog.useRealCalendar ? '📅 Calendario con Date Reali' : '📅 Calendario Settimanale') : '📋 Programma Giornaliero Libero'}
                             </span>
                             <span style={{ fontSize: '11px', color: currentAssigned ? '#38bdf8' : '#cbd5e1', background: '#1e293b', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                               Assegnato a: {currentAssigned ? (currentAssigned.full_name || currentAssigned.email) : 'Tutti (Generale)'}
                             </span>
                           </div>
                           <div style={{ display: 'flex', gap: '6px' }}>
                             <button onClick={() => duplicateProgram(prog)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
                             <button onClick={() => setEditingProgram(JSON.parse(JSON.stringify(prog)))} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
                             <button onClick={() => deleteProgram(prog.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
                           </div>
                         </div>
 
                         <div style={{ marginTop: '12px', background: '#1f2937', padding: '10px', borderRadius: '8px', border: '1px solid #374151' }}>
                           <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📊 RISULTATI INSERITI DAGLI ATLETI:</span>
                           {Object.keys(progResultsByAthlete).length === 0 ? (
                             <span style={{ fontSize: '11px', color: '#94a3b8' }}>Nessun risultato registrato.</span>
                           ) : (
                             Object.keys(progResultsByAthlete).map((athId) => {
                               const athObj = athletes.find(a => a.id === athId);
                               const athName = athObj ? (athObj.full_name || athObj.email) : 'Atleta';
                               const resObj = progResultsByAthlete[athId];
 
                               return (
                                 <div key={athId} style={{ marginBottom: '8px', background: '#111827', padding: '8px', borderRadius: '6px' }}>
                                   <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{athName}:</span>
                                   <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                                     {Object.keys(resObj).map((blockKey) => {
                                       const blockData = resObj[blockKey];
                                       if (!blockData.score && !blockData.notes) return null;
                                       return (
                                         <div key={blockKey} style={{ marginLeft: '8px', marginBottom: '2px' }}>
                                           • Blocco [{blockKey}]: <strong style={{ color: '#fff' }}>Score:</strong> {blockData.score || '-'} | <strong style={{ color: '#fff' }}>Note:</strong> {blockData.notes || '-'}
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>
                               );
                             })
                           )}
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>
             )}
           </div>
         )}
       </div>
     ) : (
       <div style={{ maxWidth: '900px', margin: '0 auto' }}>
         <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
           <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>I tuoi Allenamenti</button>
           <button onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'profile' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Il tuo Profilo & Massimali 🏋️‍♂️</button>
         </div>
 
         {activeTab === 'profile' ? (
           <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
             <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#10b981' }}>I tuoi Massimali di Forza</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {STRENGTH_EXERCISES.map((exName) => (
                 <div key={exName} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
                   <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', marginBottom: '10px' }}>{exName}</div>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                     {REP_SCHEMES.map((reps) => (
                       <div key={reps} style={{ background: '#111827', padding: '8px', borderRadius: '6px' }}>
                         <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{reps} RM (kg)</label>
                         <input
                           type="text"
                           placeholder="kg"
                           value={athleteMaxes[exName]?.[reps] || ''}
                           onChange={(e) => handleMaxChange(exName, reps, e.target.value)}
                           style={{ width: '100%', padding: '6px', background: '#1f2937', border: '1px solid #334151', color: '#fff', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
                         />
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         ) : (
           <div>
             <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>I tuoi allenamenti</h3>
             {athletePrograms.length === 0 ? (
               <div style={{ background: '#111827', padding: '30px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'center' }}>
                 <p style={{ color: '#94a3b8', margin: 0 }}>Nessun allenamento assegnato al momento.</p>
               </div>
             ) : (
               athletePrograms.map((prog) => (
                 <div key={prog.id} style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '20px' }}>
                   <h4 style={{ color: '#10b981', marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>{prog.title}</h4>
                   
                   {prog.useCalendar || prog.days ? (
                     <div>
                       <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                         {prog.days?.map((day: any, idx: number) => (
                           <button key={idx} onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: selectedDayView === day.dayName ? '#10b981' : '#1f2937', color: '#fff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                             {day.dayName} {day.date ? `(${day.date})` : ''}
                           </button>
                         ))}
                       </div>
 
                       {prog.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
                         const realDayIndex = prog.days.findIndex((d: any) => d.dayName === selectedDayView);
                         return (
                           <div key={realDayIndex}>
                             {day.blocks?.length === 0 ? (
                               <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Riposo o nessun allenamento inserito per {day.dayName}.</p>
                             ) : (
                               day.blocks?.map((blk: any, bIdx: number) => {
                                 const blockKey = `ath_${prog.id}_${realDayIndex}_${bIdx}`;
                                 const isClosed = collapsedBlocks[blockKey] || false;

                                 return (
                                   <div key={bIdx} style={{ background: '#1f2937', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #374151' }}>
                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                       <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{blk.name}</div>
                                       <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                         {blk.videoUrl && (
                                           <a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                             🎥 Video
                                           </a>
                                         )}
                                         <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#374151', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                       </div>
                                     </div>
 
                                     {!isClosed && (
                                       <div>
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
                                     )}
 
                                     <div style={{ marginTop: '12px', background: '#111827', padding: '10px', borderRadius: '6px', border: '1px dashed #374151' }}>
                                       <span style={{ fontSize: '10px', color: '#10b981', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>✍️ I TUOI RISULTATI / NOTE</span>
                                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                         <input
                                           type="text"
                                           placeholder="Score (es. 100kg / 8:30)"
                                           value={athleteResults[prog.id]?.[`${realDayIndex}_${bIdx}`]?.score || ''}
                                           onChange={(e) => handleResultChange(prog.id, `${realDayIndex}_${bIdx}`, 'score', e.target.value)}
                                           style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                                         />
                                         <input
                                           type="text"
                                           placeholder="Note personali..."
                                           value={athleteResults[prog.id]?.[`${realDayIndex}_${bIdx}`]?.notes || ''}
                                           onChange={(e) => handleResultChange(prog.id, `${realDayIndex}_${bIdx}`, 'notes', e.target.value)}
                                           style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '4px', fontSize: '12px' }}
                                         />
                                       </div>
                                     </div>
                                   </div>
                                 );
                               })
                             )}
                           </div>
                         );
                       })}
                     </div>
                   ) : null}
                 </div>
               ))
             )}
           </div>
         )}
       </div>
     )}
   </div>
 );
}