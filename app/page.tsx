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
const [isResettingPassword, setIsResettingPassword] = useState(false);
const [resetMessage, setResetMessage] = useState('');
 
const [athletes, setAthletes] = useState<any[]>([]);
const [selectedAthlete, setSelectedAthlete] = useState('');
const [programTitle, setProgramTitle] = useState('');
 
const [collapsedBlocks, setCollapsedBlocks] = useState<{ [key: string]: boolean }>({});
const [collapsedProgramDays, setCollapsedProgramDays] = useState<{ [key: string]: boolean }>({});
const [selectedDaysByProgram, setSelectedDaysByProgram] = useState<{ [programId: string]: string }>({});
const [coachSelectedDay, setCoachSelectedDay] = useState<{ [programId: string]: string }>({});
 
const [programDays, setProgramDays] = useState<any[]>([
 {
   dayNumber: 1,
   dayName: 'Giorno 1',
   blocks: []
 }
]);
 
const [programLibrary, setProgramLibrary] = useState<any[]>([]);
const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
 
const [activeTab, setActiveTab] = useState<'create' | 'library' | 'exercises' | 'profile'>('create');
const [coachSubView, setCoachSubView] = useState<'programs' | 'athletes'>('programs');
const [selectedCoachAthlete, setSelectedCoachAthlete] = useState<any | null>(null);
 
const [selectedDayView, setSelectedDayView] = useState('Giorno 1');
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
 
useEffect(() => {
 if (programLibrary.length > 0) {
   const initialDays: { [id: string]: string } = {};
   programLibrary.forEach(prog => {
     if (prog.days && prog.days.length > 0 && !selectedDaysByProgram[prog.id]) {
       initialDays[prog.id] = prog.days[0].dayName;
     }
   });
   if (Object.keys(initialDays).length > 0) {
     setSelectedDaysByProgram(prev => ({ ...initialDays, ...prev }));
   }
 }
}, [programLibrary]);
 
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

const handlePasswordReset = async (e: React.FormEvent) => {
 e.preventDefault();
 setAuthError('');
 setResetMessage('');
 
 const { error } = await supabase.auth.resetPasswordForEmail(email, {
   redirectTo: window.location.origin,
 });
 
 if (error) {
   setAuthError(error.message);
 } else {
   setResetMessage('Controlla la tua email per il link di recupero della password.');
 }
};
 
const handleLogout = async () => {
 await supabase.auth.signOut();
 setSession(null);
};
 
const toggleBlockCollapse = (blockKey: string) => {
 setCollapsedBlocks(prev => ({
   ...prev,
   [blockKey]: prev[blockKey] === undefined ? true : !prev[blockKey]
 }));
};
 
const toggleProgramDayCollapse = (key: string) => {
 setCollapsedProgramDays(prev => ({
   ...prev,
   [key]: prev[key] === undefined ? false : !prev[key]
 }));
};
 
const addDay = () => {
 const nextNumber = programDays.length + 1;
 const newName = `Giorno ${nextNumber}`;
 setProgramDays([
   ...programDays,
   {
     dayNumber: nextNumber,
     dayName: newName,
     blocks: []
   }
 ]);
 setSelectedDayView(newName);
};
 
const cloneDay = (dayToClone: any) => {
 const nextNumber = programDays.length + 1;
 const clonedName = `${dayToClone.dayName} (Copia)`;
 const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
 
 const newDays = [
   ...programDays,
   {
     dayNumber: nextNumber,
     dayName: clonedName,
     blocks: clonedBlocks
   }
 ];
 setProgramDays(newDays);
 setSelectedDayView(clonedName);
};
 
const cloneEditingDay = (dayToClone: any) => {
 const updated = { ...editingProgram };
 if (!updated.days) updated.days = [];
 const clonedName = `${dayToClone.dayName} (Copia)`;
 const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
 
 updated.days.push({
   dayNumber: updated.days.length + 1,
   dayName: clonedName,
   blocks: clonedBlocks
 });
 setEditingProgram(updated);
 setSelectedDayView(clonedName);
};
 
const moveDayOrder = (index: number, direction: 'left' | 'right') => {
 const newIndex = direction === 'left' ? index - 1 : index + 1;
 if (newIndex < 0 || newIndex >= programDays.length) return;
 const updated = [...programDays];
 const temp = updated[index];
 updated[index] = updated[newIndex];
 updated[newIndex] = temp;
 setProgramDays(updated);
};
 
const moveEditingDayOrder = (index: number, direction: 'left' | 'right') => {
 const newIndex = direction === 'left' ? index - 1 : index + 1;
 const updated = { ...editingProgram };
 if (newIndex < 0 || newIndex >= updated.days.length) return;
 const temp = updated.days[index];
 updated.days[index] = updated.days[newIndex];
 updated.days[newIndex] = temp;
 setEditingProgram(updated);
};
 
const removeBlockFromFreeDay = (dayIndex: number, blockIndex: number) => {
 const updated = [...programDays];
 updated[dayIndex].blocks.splice(blockIndex, 1);
 setProgramDays(updated);
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
 
const saveProgramToLibrary = async () => {
 if (!programTitle) {
   alert('Inserisci un titolo per il programma');
   return;
 }
 
 const newProgram = {
   title: programTitle,
   assigned_athlete_id: selectedAthlete || null,
   days: programDays
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
 return (
   <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
     <img src="/logo.png" alt="AMT Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
     <div style={{ color: '#10b981', fontWeight: 'bold' }}>Caricamento...</div>
   </div>
 );
}
 
if (!session) {
 return (
   <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
       <img src="/logo.png" alt="AMT Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
       <h1 style={{ color: '#10b981', margin: 0, fontSize: '24px' }}>AM TRAINING</h1>
     </div>
   
     <form onSubmit={isResettingPassword ? handlePasswordReset : (isRegistering ? handleSignUp : handleLogin)} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '320px', gap: '12px' }}>
       <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
       
       {!isResettingPassword && (
         <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
       )}
     
       {isRegistering && !isResettingPassword && (
         <input type="text" placeholder="Nome Completo" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: '#1e293b', border: '1px solid #334151', color: '#fff' }} />
       )}
 
       {authError && <p style={{ color: '#ef4444', fontSize: '14px' }}>{authError}</p>}
       {resetMessage && <p style={{ color: '#10b981', fontSize: '14px' }}>{resetMessage}</p>}
     
       <button type="submit" style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
         {isResettingPassword ? 'Invia Richiesta' : (isRegistering ? 'Registrati' : 'Accedi')}
       </button>
     </form>
 
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
       {!isResettingPassword && (
         <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
           {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
         </button>
       )}
       
       <button onClick={() => { setIsResettingPassword(!isResettingPassword); setAuthError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
         {isResettingPassword ? 'Torna al Login' : 'Password dimenticata?'}
       </button>
     </div>
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
     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
       <img src="/logo.png" alt="AMT Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
       <div>
         <h2 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>AM TRAINING</h2>
         <span style={{ fontSize: '12px', color: '#94a3b8' }}>{session.user.email} ({role})</span>
       </div>
     </div>
     <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334151', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Esci</button>
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
             <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                 <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Massimali di: {selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
                 <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
               </div>
 
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {STRENGTH_EXERCISES.map((exName) => {
                   const exMaxes = coachAthleteMaxes[selectedCoachAthlete.id]?.[exName] || {};
                   return (
                     <div key={exName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                       <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px', marginBottom: '8px' }}>{exName}</div>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                         {REP_SCHEMES.map((reps) => (
                           <div key={reps} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                             <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{reps} RM</span>
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
             <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta per visualizzarne i Massimali</h3>
               {athletes.length === 0 ? (
                 <p style={{ color: '#64748b' }}>Nessun atleta registrato.</p>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {athletes.map((a) => (
                     <div key={a.id} onClick={() => setSelectedCoachAthlete(a)} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{a.full_name || a.email}</span>
                       <span style={{ fontSize: '12px', color: '#10b981' }}>Visualizza Massimali →</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           )}
         </div>
       ) : editingProgram ? (
         <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Modifica Programma</h3>
             <button onClick={() => setEditingProgram(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Annulla</button>
           </div>
 
           <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Titolo Programma:</label>
           <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '16px', boxSizing: 'border-box' }} />
 
           <div style={{ marginBottom: '20px' }}>
             <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assegna ad Atleta:</label>
             <select value={editingProgram.assignedAthleteId} onChange={(e) => setEditingProgram({ ...editingProgram, assignedAthleteId: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }}>
               <option value="">Tutti gli atleti (Generale)</option>
               {athletes.map((a) => (
                 <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
               ))}
             </select>
           </div>
 
           <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
             {editingProgram.days?.map((day: any, idx: number) => {
               const isSelected = selectedDayView === day.dayName;
               return (
                 <div key={idx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#f1f5f9', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                   <button onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                     {day.dayName}
                   </button>
                   <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                     <button onClick={() => moveEditingDayOrder(idx, 'left')} disabled={idx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: idx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: idx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                     <button onClick={() => cloneEditingDay(day)} title="Clona giorno" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                     <button onClick={() => moveEditingDayOrder(idx, 'right')} disabled={idx === editingProgram.days.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: idx === editingProgram.days.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: idx === editingProgram.days.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                   </div>
                 </div>
               );
             })}
           </div>
 
           {editingProgram.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
             const actualDIdx = editingProgram.days.findIndex((d: any) => d.dayName === selectedDayView);
             return (
               <div key={actualDIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                     <input
                       type="text"
                       value={day.dayName}
                       onChange={(e) => {
                         const updated = { ...editingProgram };
                         updated.days[actualDIdx].dayName = e.target.value;
                         setSelectedDayView(e.target.value);
                         setEditingProgram(updated);
                       }}
                       style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', flex: 1 }}
                     />
                   </div>
                   {editingProgram.days.length > 1 && (
                     <button onClick={() => {
                       const updated = { ...editingProgram };
                       updated.days.splice(actualDIdx, 1);
                       setEditingProgram(updated);
                       if (updated.days.length > 0) setSelectedDayView(updated.days[0].dayName);
                     }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Giorno</button>
                   )}
                 </div>
 
                 {day.blocks?.map((block: any, bIdx: number) => {
                   const blockKey = `edit_${actualDIdx}_${bIdx}`;
                   const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                   return (
                     <div key={block.id || bIdx} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                         <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                           <button type="button" onClick={() => updateEditingBlock(actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                           <button type="button" onClick={() => updateEditingBlock(actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                         </div>
                         <div style={{ display: 'flex', gap: '4px' }}>
                           <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                           <button type="button" onClick={() => moveEditingBlock(actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                           <button type="button" onClick={() => moveEditingBlock(actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
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
                             <input
                               type="text"
                               list={`ex_list_edit_${actualDIdx}_${bIdx}`}
                               value={block.name || ''}
                               onChange={(e) => {
                                 const val = e.target.value;
                                 const updated = { ...editingProgram };
                                 updated.days[actualDIdx].blocks[bIdx].name = val;
                                 const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                 if (foundEx && foundEx.video_url) {
                                   updated.days[actualDIdx].blocks[bIdx].videoUrl = foundEx.video_url;
                                 }
                                 setEditingProgram(updated);
                               }}
                               placeholder="Inserisci o seleziona esercizio..."
                               style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }}
                             />
                             <datalist id={`ex_list_edit_${actualDIdx}_${bIdx}`}>
                               {exerciseLibrary.map((ex) => (
                                 <option key={ex.id} value={ex.name} />
                               ))}
                             </datalist>
                           </div>
                         ) : (
                           <input type="text" value={block.name || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
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
                               style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }}
                             />
                           </div>
                           {block.type === 'forza' ? (
                             <div>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                 <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                   <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                   <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                 </div>
                                 <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                   <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                   <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                 </div>
                               </div>
                               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                 <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                   <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                   <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                 </div>
                                 <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                   <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                   <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                 </div>
                               </div>
                               <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                 <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                 <input type="text" value={block.notes || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                               </div>
                             </div>
                           ) : (
                             <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                               <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                               <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   );
                 })}
                 <button onClick={() => addBlockToEditingDay(actualDIdx)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
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
             <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Gestione Libreria Esercizi</h3>
               <form onSubmit={addGlobalExercise} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #e2e8f0' }}>
                 <input type="text" placeholder="Nome Esercizio (es. Squat)" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                 <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                 <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
               </form>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {exerciseLibrary.map((ex) => (
                   <div key={ex.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                     <div>
                       <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{ex.name}</div>
                       <div style={{ fontSize: '11px', color: '#64748b' }}>{ex.video_url || 'Nessun video'}</div>
                     </div>
                     <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina</button>
                   </div>
                 ))}
               </div>
             </div>
           ) : activeTab === 'create' ? (
             <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
             
               <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '16px', boxSizing: 'border-box' }} />
             
               <div style={{ marginBottom: '16px' }}>
                 <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assegna ad Atleta:</label>
                 <select value={selectedAthlete} onChange={(e) => setSelectedAthlete(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }}>
                   <option value="">Tutti gli atleti (Generale)</option>
                   {athletes.map((a) => (
                     <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                   ))}
                 </select>
               </div>
 
               <div>
                 <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                   {programDays.map((day, idx) => {
                     const isSelected = selectedDayView === day.dayName;
                     return (
                       <div key={idx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#f1f5f9', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                         <button onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                           {day.dayName}
                         </button>
                         <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                           <button onClick={() => moveDayOrder(idx, 'left')} disabled={idx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: idx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: idx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                           <button onClick={() => cloneDay(day)} title="Clona giorno" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                           <button onClick={() => moveDayOrder(idx, 'right')} disabled={idx === programDays.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: idx === programDays.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: idx === programDays.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                         </div>
                       </div>
                     );
                   })}
                 </div>
 
                 {programDays.filter((d) => d.dayName === selectedDayView).map((day) => {
                   const actualDIdx = programDays.findIndex((d) => d.dayName === selectedDayView);
                   return (
                     <div key={actualDIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                           <input
                             type="text"
                             value={day.dayName}
                             onChange={(e) => {
                               const upd = [...programDays];
                               upd[actualDIdx].dayName = e.target.value;
                               setSelectedDayView(e.target.value);
                               setProgramDays(upd);
                             }}
                             style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', flex: 1 }}
                           />
                         </div>
                         {programDays.length > 1 && (
                           <button onClick={() => {
                             const upd = [...programDays];
                             upd.splice(actualDIdx, 1);
                             setProgramDays(upd);
                             if (upd.length > 0) setSelectedDayView(upd[0].dayName);
                           }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Giorno</button>
                         )}
                       </div>
 
                       {day.blocks.map((block: any, bIdx: number) => {
                         const blockKey = `prog_${actualDIdx}_${bIdx}`;
                         const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                         return (
                           <div key={block.id} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                               <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                 <button type="button" onClick={() => updateFreeBlock(actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                 <button type="button" onClick={() => updateFreeBlock(actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                               </div>
                               <div style={{ display: 'flex', gap: '4px' }}>
                                 <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                 <button type="button" onClick={() => moveFreeBlock(actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                 <button type="button" onClick={() => moveFreeBlock(actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                 <button type="button" onClick={() => removeBlockFromFreeDay(actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                               </div>
                             </div>
 
                             <div style={{ marginBottom: '10px' }}>
                               {block.type === 'forza' ? (
                                 <div>
                                   <input
                                     type="text"
                                     list={`ex_list_create_${actualDIdx}_${bIdx}`}
                                     value={block.name || ''}
                                     onChange={(e) => {
                                       const val = e.target.value;
                                       updateFreeBlock(actualDIdx, bIdx, 'name', val);
                                       const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                       if (foundEx && foundEx.video_url) {
                                         updateFreeBlock(actualDIdx, bIdx, 'videoUrl', foundEx.video_url);
                                       }
                                     }}
                                     placeholder="Inserisci o seleziona esercizio..."
                                     style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }}
                                   />
                                   <datalist id={`ex_list_create_${actualDIdx}_${bIdx}`}>
                                     {exerciseLibrary.map((ex) => (
                                       <option key={ex.id} value={ex.name} />
                                     ))}
                                   </datalist>
                                 </div>
                               ) : (
                                 <input type="text" value={block.name} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                               )}
                             </div>
 
                             {!isClosed && (
                               <div>
                                 <div style={{ marginBottom: '10px' }}>
                                   <input
                                     type="url"
                                     value={block.videoUrl || ''}
                                     onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'videoUrl', e.target.value)}
                                     placeholder="Link video esercizio"
                                     style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }}
                                   />
                                 </div>
                                 {block.type === 'forza' ? (
                                   <div>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                       <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                         <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                         <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                       </div>
                                       <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                         <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                         <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                       </div>
                                     </div>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                       <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                         <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                         <input type="text" value={block.load} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                       </div>
                                       <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                         <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                         <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                       </div>
                                     </div>
                                     <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                       <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                       <input type="text" value={block.notes} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                     </div>
                                   </div>
                                 ) : (
                                   <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                     <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                     <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                         );
                       })}
                       <button onClick={() => addBlockToFreeDay(actualDIdx)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                     </div>
                   );
                 })}
                 <button onClick={addDay} style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#000', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', marginBottom: '20px' }}>+ Aggiungi Nuovo Giorno</button>
               </div>
 
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
                   style={{ padding: '8px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}
                 >
                   <option value="">Filtra per utente (Tutti)</option>
                   {athletes.map((a) => (
                     <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                   ))}
                 </select>
               </div>
 
               {filteredLibraryPrograms.length === 0 ? (
                 <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>Nessun programma trovato.</p>
               ) : (
                 filteredLibraryPrograms.map((prog) => {
                   const currentAssigned = athletes.find((a) => a.id === prog.assignedAthleteId);
                   const progResultsByAthlete = coachAllResults[prog.id] || {};
                   const activeDay = coachSelectedDay[prog.id] || (prog.days && prog.days.length > 0 ? prog.days[0].dayName : '');
                 
                   return (
                     <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                         <div>
                           <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                           <span style={{ fontSize: '11px', color: currentAssigned ? '#0284c7' : '#000000', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                             Assegnato a: {currentAssigned ? (currentAssigned.full_name || currentAssigned.email) : 'Tutti (Generale)'}
                           </span>
                         </div>
                         <div style={{ display: 'flex', gap: '6px' }}>
                           <button onClick={() => duplicateProgram(prog)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
                           <button onClick={() => setEditingProgram(JSON.parse(JSON.stringify(prog)))} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
                           <button onClick={() => deleteProgram(prog.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
                         </div>
                       </div>
 
                       <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                         <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📊 RISULTATI INSERITI DAGLI ATLETI:</span>
                         
                         <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                           {prog.days?.map((day: any) => (
                             <button
                               key={day.dayName}
                               onClick={() => setCoachSelectedDay(prev => ({ ...prev, [prog.id]: day.dayName }))}
                               style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeDay === day.dayName ? '#10b981' : '#e2e8f0', color: activeDay === day.dayName ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                             >
                               {day.dayName}
                             </button>
                           ))}
                         </div>
 
                         <div style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                           {Object.keys(progResultsByAthlete).length === 0 ? (
                             <span style={{ fontSize: '11px', color: '#64748b' }}>Nessun risultato registrato.</span>
                           ) : (
                             (() => {
                               const dayIndex = prog.days.findIndex((d: any) => d.dayName === activeDay);
                               if (dayIndex === -1) return <span style={{ fontSize: '11px', color: '#64748b' }}>Seleziona un giorno valido.</span>;
                               
                               const blocksOfActiveDay = prog.days[dayIndex].blocks || [];
                               
                               return athletes.map((ath) => {
                                 const resObj = progResultsByAthlete[ath.id];
                                 if (!resObj) return null;
 
                                 const hasResultsForThisDay = blocksOfActiveDay.some((_: any, bIdx: number) => {
                                   const blockKey = `${dayIndex}_${bIdx}`;
                                   return resObj[blockKey]?.score || resObj[blockKey]?.notes;
                                 });
 
                                 if (!hasResultsForThisDay) return null;
 
                                 const athName = ath.full_name || ath.email;
 
                                 return (
                                   <div key={ath.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                     <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{athName}:</span>
                                     <div style={{ fontSize: '11px', color: '#334155', paddingLeft: '6px' }}>
                                       {blocksOfActiveDay.map((blk: any, bIdx: number) => {
                                         const blockKey = `${dayIndex}_${bIdx}`;
                                         const blockData = resObj[blockKey];
                                         if (!blockData || (!blockData.score && !blockData.notes)) return null;
 
                                         return (
                                           <div key={bIdx} style={{ marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                             <span>• <strong style={{ color: '#000' }}>{blk.name || `Esercizio ${bIdx + 1}`}</strong>:</span>
                                             <span>
                                               <strong style={{ color: '#10b981' }}>Score:</strong> {blockData.score || '-'} 
                                               {blockData.notes && <span style={{ color: '#64748b', marginLeft: '6px' }}>(Note: {blockData.notes})</span>}
                                             </span>
                                           </div>
                                         );
                                       })}
                                     </div>
                                   </div>
                                 );
                               });
                             })()
                           )}
                         </div>
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
         <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
           <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#10b981' }}>I tuoi Massimali di Forza</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {STRENGTH_EXERCISES.map((exName) => (
               <div key={exName} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                 <div style={{ fontWeight: 'bold', color: '#000000', fontSize: '14px', marginBottom: '10px' }}>{exName}</div>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                   {REP_SCHEMES.map((reps) => (
                     <div key={reps} style={{ background: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                       <label style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{reps} RM (kg)</label>
                       <input
                         type="text"
                         placeholder="kg"
                         value={athleteMaxes[exName]?.[reps] || ''}
                         onChange={(e) => handleMaxChange(exName, reps, e.target.value)}
                         style={{ width: '100%', padding: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
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
             <div style={{ background: '#ffffff', color: '#000', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
               <p style={{ color: '#64748b', margin: 0 }}>Nessun allenamento assegnato al momento.</p>
             </div>
           ) : (
             athletePrograms.map((prog) => {
               const currentProgramActiveDay = selectedDaysByProgram[prog.id] || (prog.days && prog.days.length > 0 ? prog.days[0].dayName : '');
 
               return (
                 <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                   <h4 style={{ color: '#10b981', marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>{prog.title}</h4>
                 
                   {prog.days ? (
                     <div>
                       <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                         {prog.days?.map((day: any, idx: number) => (
                           <button
                             key={idx}
                             onClick={() => setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: day.dayName }))}
                             style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: currentProgramActiveDay === day.dayName ? '#10b981' : '#f1f5f9', color: currentProgramActiveDay === day.dayName ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                           >
                             {day.dayName}
                           </button>
                         ))}
                       </div>
 
                       {prog.days?.filter((d: any) => d.dayName === currentProgramActiveDay).map((day: any) => {
                         const realDayIndex = prog.days.findIndex((d: any) => d.dayName === day.dayName);
                         const dayCollapseKey = `${prog.id}_day_${realDayIndex}`;
                         const isDayClosed = collapsedProgramDays[dayCollapseKey] === undefined ? true : collapsedProgramDays[dayCollapseKey];
 
                         return (
                           <div key={realDayIndex} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDayClosed ? '0' : '12px' }}>
                               <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{day.dayName}</span>
                               <button
                                 type="button"
                                 onClick={() => toggleProgramDayCollapse(dayCollapseKey)}
                                 style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                               >
                                 {isDayClosed ? 'Apri Blocco Programma ▼' : 'Chiudi Blocco Programma ▲'}
                               </button>
                             </div>
 
                             {!isDayClosed && (
                               <div>
                                 {day.blocks?.length === 0 ? (
                                   <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nessun esercizio inserito per {day.dayName}.</p>
                                 ) : (
                                   day.blocks?.map((blk: any, bIdx: number) => {
                                     const blockKey = `ath_${prog.id}_${realDayIndex}_${bIdx}`;
                                     const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                                     return (
                                       <div key={bIdx} style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, marginRight: '10px' }}>
                                             <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{blk.name}</div>
                                           </div>
                                           <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                             {blk.videoUrl && (
                                               <a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', background: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
                                                 🎥 Video
                                               </a>
                                             )}
                                             <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#000', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                           </div>
                                         </div>
 
                                         {!isClosed && (
                                           <div>
                                             {blk.type === 'forza' ? (
                                               <div>
                                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                   <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                     <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</span>
                                                     <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.sets}</span>
                                                   </div>
                                                   <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                     <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</span>
                                                     <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.reps}</span>
                                                   </div>
                                                 </div>
                                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                                   <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                     <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</span>
                                                     <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.load}</span>
                                                   </div>
                                                   <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                                     <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</span>
                                                     <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000' }}>{blk.rest}</span>
                                                   </div>
                                                 </div>
                                                 {blk.notes && (
                                                   <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                     <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</span>
                                                     <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155' }}>{blk.notes}</p>
                                                   </div>
                                                 )}
                                               </div>
                                             ) : (
                                               <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                 <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginBottom: '4px' }}>WOD / CIRCUITO</span>
                                                 <p style={{ fontSize: '12px', color: '#334151', whiteSpace: 'pre-wrap', margin: 0 }}>{blk.wodNotes}</p>
                                               </div>
                                             )}
                                           </div>
                                         )}
 
                                         <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                           <span style={{ fontSize: '10px', color: '#10b981', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>✍️ I TUOI RISULTATI / NOTE</span>
                                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                             <input
                                               type="text"
                                               placeholder="Score (es. 100kg / 8:30)"
                                               value={athleteResults[prog.id]?.[`${realDayIndex}_${bIdx}`]?.score || ''}
                                               onChange={(e) => handleResultChange(prog.id, `${realDayIndex}_${bIdx}`, 'score', e.target.value)}
                                               style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }}
                                             />
                                             <input
                                               type="text"
                                               placeholder="Note personali..."
                                               value={athleteResults[prog.id]?.[`${realDayIndex}_${bIdx}`]?.notes || ''}
                                               onChange={(e) => handleResultChange(prog.id, `${realDayIndex}_${bIdx}`, 'notes', e.target.value)}
                                               style={{ width: '100%', padding: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }}
                                             />
                                           </div>
                                         </div>
                                       </div>
                                     );
                                   })
                                 )}
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   ) : null}
                 </div>
               );
             })
           )}
         </div>
       )}
     </div>
   )}
 </div>
);
}