'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const formatDateToIT = (dateString: string) => {
  if (!dateString) return 'N/D';
  const cleanDate = dateString.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}\\${month}\\${year}`;
  }
  return dateString;
};

const STRENGTH_EXERCISES = [
  'Back Squat', 'Deadlift', 'Front Squat', 'OHS', 'Press', 'Push Press', 
  'Push Jerk', 'Split Jerk', 'Power Snatch', 'Squat Snatch', 'Hang Power Snatch', 
  'Hang Squat Snatch', 'Power Clean', 'Squat Clean', 'Hang Power Clean', 
  'Hang Squat Clean', 'Clean & Jerk', 'Panca Piana'
];

const REP_SCHEMES = [1, 3, 5, 10];

export default function TrainingApp() {
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
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
  const [selectedAthleteIds, setSelectedAthleteIds] = useState<string[]>([]);
  const [programTitle, setProgramTitle] = useState('');
  const [programStartDate, setProgramStartDate] = useState('');
  const [programEndDate, setProgramEndDate] = useState('');

  const [collapsedBlocks, setCollapsedBlocks] = useState<{ [key: string]: boolean }>({});
  const [collapsedProgramDays, setCollapsedProgramDays] = useState<{ [key: string]: boolean }>({});

  const [selectedWeeksByProgram, setSelectedWeeksByProgram] = useState<{ [programId: string]: string }>({});
  const [selectedDaysByProgram, setSelectedDaysByProgram] = useState<{ [programId: string]: string }>({});
  
  const [coachSelectedWeek, setCoachSelectedWeek] = useState<{ [programId: string]: string }>({});
  const [coachSelectedDay, setCoachSelectedDay] = useState<{ [programId: string]: string }>({});

  const [bannerData, setBannerData] = useState<{ image_url: string; link_url: string }>({ image_url: '', link_url: '' });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);

  const [programWeeks, setProgramWeeks] = useState<any[]>([
    {
      weekNumber: 1,
      weekName: 'Settimana 1',
      days: [
        { dayNumber: 1, dayName: 'Giorno 1', blocks: [] }
      ]
    }
  ]);

  const [programLibrary, setProgramLibrary] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'exercises' | 'profile' | 'banner'>('create');
  const [coachSubView, setCoachSubView] = useState<'programs' | 'athletes' | 'banner'>('programs');
  const [selectedCoachAthlete, setSelectedCoachAthlete] = useState<any | null>(null);

  const [selectedWeekView, setSelectedWeekView] = useState('Settimana 1');
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

  const normalizeProgramWeeks = (prog: any) => {
    if (prog.weeks && prog.weeks.length > 0) return prog.weeks;
    if (prog.days && prog.days.length > 0) {
      return [{ weekNumber: 1, weekName: 'Settimana 1', days: prog.days }];
    }
    return [{ weekNumber: 1, weekName: 'Settimana 1', days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] }];
  };

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
      fetchNotifications();
      fetchProgramLibrary();
      fetchExerciseLibrary();
      fetchBanner();

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

      const bannerChannel = supabase
        .channel('realtime-banner')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          fetchBanner();
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
        supabase.removeChannel(bannerChannel);
        supabase.removeChannel(exChannel);
        supabase.removeChannel(resultsChannel);
        supabase.removeChannel(maxesChannel);
      };
    }
  }, [session, role]);

  useEffect(() => {
    if (programLibrary.length > 0) {
      const initialWeeks: { [id: string]: string } = {};
      const initialDays: { [id: string]: string } = {};
      
      programLibrary.forEach(prog => {
        const weeks = normalizeProgramWeeks(prog);
        if (weeks.length > 0 && !selectedWeeksByProgram[prog.id]) {
          initialWeeks[prog.id] = weeks[0].weekName;
          if (weeks[0].days && weeks[0].days.length > 0) {
            initialDays[prog.id] = weeks[0].days[0].dayName;
          }
        }
      });
      if (Object.keys(initialWeeks).length > 0) {
        setSelectedWeeksByProgram(prev => ({ ...initialWeeks, ...prev }));
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

  const fetchBanner = async () => {
    const { data } = await supabase.from('settings').select('*').eq('key', 'app_banner').single();
    if (data && data.value) {
      setBannerData(data.value);
    }
  };

  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSaving(true);

    let imageUrl = bannerData.image_url;

    try {
      if (bannerImageFile) {
        const fileExt = bannerImageFile.name.split('.').pop();
        const fileName = `banner_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(filePath, bannerImageFile);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('banners')
          .getPublicUrl(filePath);

        imageUrl = publicURLData.publicUrl;
      }

      const newBannerValue = { image_url: imageUrl, link_url: bannerData.link_url };

      const { error } = await supabase.from('settings').upsert({
        key: 'app_banner',
        value: newBannerValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

      if (error) throw error;

      setBannerData(newBannerValue);
      setBannerImageFile(null);
      alert('Banner aggiornato con successo!');
    } catch (err: any) {
      alert('Errore durante il salvataggio del banner: ' + err.message);
    } finally {
      setBannerSaving(false);
    }
  };

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    fetchNotifications();
  };

  const fetchProgramLibrary = async () => {
    const { data } = await supabase.from('programs').select('*');
    if (data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        assignedAthleteIds: item.assigned_athlete_ids || (item.assigned_athlete_id ? [item.assigned_athlete_id] : []),
        weeks: normalizeProgramWeeks(item)
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
      options: { data: { full_name: fullName } }
    });
    if (error) {
      setAuthError(error.message);
    } else {
      alert('Registrazione effettuata con successo!');
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
      setResetMessage('Controlla la tua email per il link di recupero.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const toggleBlockCollapse = (blockKey: string) => {
    setCollapsedBlocks(prev => {
      const currentValue = prev[blockKey] === undefined ? true : prev[blockKey];
      return { ...prev, [blockKey]: !currentValue };
    });
  };

  const toggleProgramDayCollapse = (key: string) => {
    setCollapsedProgramDays(prev => {
      const currentValue = prev[key] === undefined ? true : prev[key];
      return { ...prev, [key]: !currentValue };
    });
  };

  const toggleAthleteSelection = (athleteId: string, currentList: string[], setListFn: (list: string[]) => void) => {
    if (currentList.includes(athleteId)) {
      setListFn(currentList.filter(id => id !== athleteId));
    } else {
      setListFn([...currentList, athleteId]);
    }
  };

  const addWeek = () => {
    const nextNumber = programWeeks.length + 1;
    const newName = `Settimana ${nextNumber}`;
    setProgramWeeks([
      ...programWeeks,
      { weekNumber: nextNumber, weekName: newName, days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] }
    ]);
    setSelectedWeekView(newName);
    setSelectedDayView('Giorno 1');
  };

  const cloneWeek = (weekToClone: any) => {
    const nextNumber = programWeeks.length + 1;
    const clonedName = `${weekToClone.weekName} (Copia)`;
    const clonedDays = JSON.parse(JSON.stringify(weekToClone.days || []));
    setProgramWeeks([...programWeeks, { weekNumber: nextNumber, weekName: clonedName, days: clonedDays }]);
    setSelectedWeekView(clonedName);
    if (clonedDays.length > 0) setSelectedDayView(clonedDays[0].dayName);
  };

  const moveWeekOrder = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= programWeeks.length) return;
    const updated = [...programWeeks];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setProgramWeeks(updated);
  };

  const addDay = (wIdx: number) => {
    const updated = [...programWeeks];
    const targetWeek = updated[wIdx];
    const nextNumber = targetWeek.days.length + 1;
    const newName = `Giorno ${nextNumber}`;
    targetWeek.days.push({ dayNumber: nextNumber, dayName: newName, blocks: [] });
    setProgramWeeks(updated);
    setSelectedDayView(newName);
  };

  const cloneDay = (wIdx: number, dayToClone: any) => {
    const updated = [...programWeeks];
    const targetWeek = updated[wIdx];
    const nextNumber = targetWeek.days.length + 1;
    const clonedName = `${dayToClone.dayName} (Copia)`;
    const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
    targetWeek.days.push({ dayNumber: nextNumber, dayName: clonedName, blocks: clonedBlocks });
    setProgramWeeks(updated);
    setSelectedDayView(clonedName);
  };

  const moveDayOrder = (wIdx: number, dayIdx: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? dayIdx - 1 : dayIdx + 1;
    const updated = [...programWeeks];
    const days = updated[wIdx].days;
    if (newIndex < 0 || newIndex >= days.length) return;
    const temp = days[dayIdx];
    days[dayIdx] = days[newIndex];
    days[newIndex] = temp;
    setProgramWeeks(updated);
  };

  const cloneEditingWeek = (weekToClone: any) => {
    const updated = { ...editingProgram };
    if (!updated.weeks) updated.weeks = [];
    const clonedName = `${weekToClone.weekName} (Copia)`;
    const clonedDays = JSON.parse(JSON.stringify(weekToClone.days || []));
    updated.weeks.push({ weekNumber: updated.weeks.length + 1, weekName: clonedName, days: clonedDays });
    setEditingProgram(updated);
    setSelectedWeekView(clonedName);
    if (clonedDays.length > 0) setSelectedDayView(clonedDays[0].dayName);
  };

  const moveEditingWeekOrder = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = { ...editingProgram };
    if (newIndex < 0 || newIndex >= updated.weeks.length) return;
    const temp = updated.weeks[index];
    updated.weeks[index] = updated.weeks[newIndex];
    updated.weeks[newIndex] = temp;
    setEditingProgram(updated);
  };

  const addEditingDay = (wIdx: number) => {
    const updated = { ...editingProgram };
    const targetWeek = updated.weeks[wIdx];
    if (!targetWeek.days) targetWeek.days = [];
    const nextNumber = targetWeek.days.length + 1;
    const newName = `Giorno ${nextNumber}`;
    targetWeek.days.push({ dayNumber: nextNumber, dayName: newName, blocks: [] });
    setEditingProgram(updated);
    setSelectedDayView(newName);
  };

  const cloneEditingDay = (wIdx: number, dayToClone: any) => {
    const updated = { ...editingProgram };
    const targetWeek = updated.weeks[wIdx];
    const clonedName = `${dayToClone.dayName} (Copia)`;
    const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
    targetWeek.days.push({ dayNumber: targetWeek.days.length + 1, dayName: clonedName, blocks: clonedBlocks });
    setEditingProgram(updated);
    setSelectedDayView(clonedName);
  };

  const moveEditingDayOrder = (wIdx: number, dayIdx: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? dayIdx - 1 : dayIdx + 1;
    const updated = { ...editingProgram };
    const days = updated.weeks[wIdx].days;
    if (newIndex < 0 || newIndex >= days.length) return;
    const temp = days[dayIdx];
    days[dayIdx] = days[newIndex];
    days[newIndex] = temp;
    setEditingProgram(updated);
  };

  const removeBlockFromFreeDay = (wIdx: number, dayIndex: number, blockIndex: number) => {
    const updated = [...programWeeks];
    updated[wIdx].days[dayIndex].blocks.splice(blockIndex, 1);
    setProgramWeeks(updated);
  };

  const moveFreeBlock = (wIdx: number, dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const updated = [...programWeeks];
    const blocks = [...updated[wIdx].days[dayIndex].blocks];
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const temp = blocks[blockIndex];
    blocks[blockIndex] = blocks[newIndex];
    blocks[newIndex] = temp;
    updated[wIdx].days[dayIndex].blocks = blocks;
    setProgramWeeks(updated);
  };

  const moveEditingBlock = (wIdx: number, dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const updated = { ...editingProgram };
    const blocks = [...updated.weeks[wIdx].days[dayIndex].blocks];
    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const temp = blocks[blockIndex];
    blocks[blockIndex] = blocks[newIndex];
    blocks[newIndex] = temp;
    updated.weeks[wIdx].days[dayIndex].blocks = blocks;
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
    if (confirm('Vuoi eliminare questo esercizio?')) {
      await supabase.from('exercises_library').delete().eq('id', id);
      fetchExerciseLibrary();
    }
  };

  const addBlockToFreeDay = (wIdx: number, dayIndex: number) => {
    const updated = [...programWeeks];
    updated[wIdx].days[dayIndex].blocks.push({
      id: Date.now(), name: '', type: 'forza', sets: 4, reps: '10', load: '70%', rest: '90 sec', notes: '', wodNotes: '', videoUrl: ''
    });
    setProgramWeeks(updated);
  };

  const updateFreeBlock = (wIdx: number, dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = [...programWeeks];
    updated[wIdx].days[dayIndex].blocks[blockIndex][field] = value;
    setProgramWeeks(updated);
  };

  const saveProgramToLibrary = async () => {
    if (!programTitle) {
      alert('Inserisci un titolo per il programma');
      return;
    }

    const newProgram = {
      title: programTitle,
      start_date: programStartDate || null,
      end_date: programEndDate || null,
      assigned_athlete_ids: selectedAthleteIds,
      weeks: programWeeks,
      days: programWeeks[0]?.days || []
    };

    const { error } = await supabase.from('programs').insert([newProgram]);

    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
    } else {
      setSaveMessage('Programma salvato con successo!');
      setTimeout(() => setSaveMessage(''), 3000);
      setProgramTitle('');
      setProgramStartDate('');
      setProgramEndDate('');
      setSelectedAthleteIds([]);
      setProgramWeeks([{
        weekNumber: 1,
        weekName: 'Settimana 1',
        days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }]
      }]);
      fetchProgramLibrary();
    }
  };

  const duplicateProgram = async (prog: any) => {
    const duplicatedProgram = {
      title: `${prog.title} (Copia)`,
      start_date: prog.startDate || null,
      end_date: prog.endDate || null,
      assigned_athlete_ids: prog.assignedAthleteIds || [],
      weeks: prog.weeks || normalizeProgramWeeks(prog)
    };

    const { error } = await supabase.from('programs').insert([duplicatedProgram]);

    if (error) {
      alert('Errore: ' + error.message);
    } else {
      alert('Programma duplicato con successo!');
      fetchProgramLibrary();
    }
  };

  const updateEditingBlock = (wIdx: number, dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = { ...editingProgram };
    updated.weeks[wIdx].days[dayIndex].blocks[blockIndex][field] = value;
    setEditingProgram(updated);
  };

  const addBlockToEditingDay = (wIdx: number, dayIndex: number) => {
    const updated = { ...editingProgram };
    if (!updated.weeks[wIdx].days[dayIndex].blocks) updated.weeks[wIdx].days[dayIndex].blocks = [];
    updated.weeks[wIdx].days[dayIndex].blocks.push({
      id: Date.now(), name: '', type: 'forza', sets: 4, reps: '10', load: '70%', rest: '90 sec', notes: '', wodNotes: '', videoUrl: ''
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
        start_date: editingProgram.startDate || null,
        end_date: editingProgram.endDate || null,
        assigned_athlete_ids: editingProgram.assignedAthleteIds || [],
        weeks: editingProgram.weeks,
        days: editingProgram.weeks[0]?.days || []
      })
      .eq('id', editingProgram.id);

    if (error) {
      alert('Errore: ' + error.message);
    } else {
      alert('Programma aggiornato con successo!');
      setEditingProgram(null);
      fetchProgramLibrary();
    }
  };

  const deleteProgram = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo programma?')) {
      await supabase.from('programs').delete().eq('id', id);
      fetchProgramLibrary();
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
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;1,800&family=Permanent+Marker&display=swap');`}</style>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
          <img src="/logo.png" alt="AMT Logo" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '12px' }} />
          <h1 style={{ color: '#10b981', margin: 0, fontSize: '28px', fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontStyle: 'italic', letterSpacing: '1px' }}>AMTraining</h1>
          <div style={{ color: '#94a3b8', fontSize: '14px', fontFamily: "'Permanent Marker', cursive", marginTop: '4px' }}>Improve Your Fitness</div>
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
    (prog) => !prog.assignedAthleteIds || prog.assignedAthleteIds.length === 0 || prog.assignedAthleteIds.includes(session?.user?.id)
  );

  const filteredLibraryPrograms = programLibrary.filter((prog) => {
    if (!libraryFilterAthlete) return true;
    return prog.assignedAthleteIds?.includes(libraryFilterAthlete);
  });

  return (
    <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;1,800&family=Permanent+Marker&display=swap');`}</style>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="AMT Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontSize: '20px', color: '#10b981', margin: 0, fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontStyle: 'italic', letterSpacing: '1px' }}>AMTraining</h2>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: "'Permanent Marker', cursive" }}>Improve Your Fitness</div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>{session.user.email} ({role})</span>
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: '#1e293b',
              border: '1px solid #334151',
              color: '#fff',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            🔔
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: '#fff',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '320px',
                maxHeight: '400px',
                overflowY: 'auto',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                zIndex: 9999,
                color: '#000'
              }}
            >
              <div style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', fontSize: '15px' }}>
                🔔 Notifiche
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '25px 15px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  Nessuna notifica
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markNotificationAsRead(notification.id)}
                    style={{
                      padding: '14px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: notification.is_read ? '#fff' : '#f0fdf4'
                    }}
                  >
                    <div style={{ fontWeight: notification.is_read ? 'normal' : 'bold', fontSize: '13px', marginBottom: '5px' }}>
                      {notification.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                      {notification.message}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                      {new Date(notification.created_at).toLocaleString('it-IT')}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            style={{
              background: '#1e293b',
              border: '1px solid #334151',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Esci
          </button>
        </div>
      </header>

      {role === 'coach' ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => { setCoachSubView('programs'); setEditingProgram(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'programs' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Gestione Programmi</button>
            <button onClick={() => { setCoachSubView('athletes'); setSelectedCoachAthlete(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'athletes' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Profili Atleti & Massimali 🏋️‍♂️</button>
            <button onClick={() => setCoachSubView('banner')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'banner' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Gestione Banner 📢</button>
          </div>

          {coachSubView === 'banner' ? (
            <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', color: '#10b981', marginBottom: '16px' }}>Gestione Banner Pubblicitario</h3>
              <form onSubmit={saveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Carica Nuova Immagine Banner:</label>
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setBannerImageFile(e.target.files[0]); }} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#000' }} />
                </div>
                {bannerData.image_url && !bannerImageFile && (
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Immagine attuale:</span>
                    <img src={bannerData.image_url} alt="Current Banner" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid #cbd5e1', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '6px' }}>Link di destinazione:</label>
                  <input type="url" placeholder="https://tuosito.com" value={bannerData.link_url} onChange={(e) => setBannerData({ ...bannerData, link_url: e.target.value })} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', color: '#000', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={bannerSaving} style={{ padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
                  {bannerSaving ? 'Salvataggio in corso...' : 'Salva Banner'}
                </button>
              </form>
            </div>
          ) : coachSubView === 'athletes' ? (
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
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta</h3>
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
              <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                  <input type="date" value={editingProgram.startDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                  <input type="date" value={editingProgram.endDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                </div>
              </div>

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
                    <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
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
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
                  {saveMessage && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
                  <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0 }}>Libreria Programmi</h3>
                    <select value={libraryFilterAthlete} onChange={(e) => setLibraryFilterAthlete(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Filtra per utente (Tutti)</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                      ))}
                    </select>
                  </div>

                  {filteredLibraryPrograms.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '30px' }}>Nessun programma trovato.</p>
                  ) : (
                    filteredLibraryPrograms.map((prog) => (
                      <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                        <button onClick={() => deleteProgram(prog.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', marginTop: '10px' }}>Elimina</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {bannerData.image_url && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              {bannerData.link_url ? (
                <a href={bannerData.link_url} target="_blank" rel="noopener noreferrer">
                  <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #1e293b', cursor: 'pointer' }} />
                </a>
              ) : (
                <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #1e293b' }} />
              )}
            </div>
          )}

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
                          <input type="text" placeholder="kg" value={athleteMaxes[exName]?.[reps] || ''} onChange={(e) => handleMaxChange(exName, reps, e.target.value)} style={{ width: '100%', padding: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }} />
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
                athletePrograms.map((prog) => (
                  <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h4 style={{ color: '#10b981', margin: 0, fontSize: '18px' }}>{prog.title}</h4>
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
