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
  const [programEndDate, setProgramEndDate, setProgramEndDateState] = useState('');

  const [collapsedBlocks, setCollapsedBlocks] = useState<{ [key: string]: boolean }>({});
  const [collapsedProgramDays, setCollapsedProgramDays] = useState<{ [key: string]: boolean }>({});

  const [selectedWeeksByProgram, setSelectedWeeksByProgram] = useState<{ [programId: string]: string }>({});
  const [selectedDaysByProgram, setSelectedDaysByProgram] = useState<{ [programId: string]: string }>({});
  
  const [coachSelectedWeek, setCoachSelectedWeek] = useState<{ [programId: string]: string }>({});
  const [coachSelectedDay, setCoachSelectedDay] = useState<{ [programId: string]: string }>({});

  const [bannerData, setBannerData] = useState<{ image_url: string; link_url: string }>({ image_url: '', link_url: '' });
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);

  // Stati Notifiche
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

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
      fetchProgramLibrary();
      fetchExerciseLibrary();
      fetchBanner();
      fetchNotifications();

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

      const notifChannel = supabase
        .channel('realtime-notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
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
        supabase.removeChannel(notifChannel);
        supabase.removeChannel(bannerChannel);
        supabase.removeChannel(exChannel);
        supabase.removeChannel(resultsChannel);
        supabase.removeChannel(maxesChannel);
      };
    }
  }, [session, role]);

  useEffect(() => {
    if (role === 'coach' && programLibrary.length > 0 && session) {
      checkProgramExpirationsForCoach();
    }
  }, [role, programLibrary, session]);

  const checkProgramExpirationsForCoach = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const prog of programLibrary) {
      if (!prog.endDate) continue;
      const endDate = new Date(prog.endDate);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if ([10, 7, 2, 0].includes(diffDays)) {
        let message = '';
        if (diffDays === 0) {
          message = `Il programma "${prog.title}" scade OGGI!`;
        } else {
          message = `Il programma "${prog.title}" scadrà tra ${diffDays} giorni (${formatDateToIT(prog.endDate)}).`;
        }

        const { data: existing } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('message', message);

        if (!existing || existing.length === 0) {
          await supabase.from('notifications').insert([{
            user_id: session.user.id,
            message: message,
            read: false,
            created_at: new Date().toISOString()
          }]);
        }
      }
    }
    fetchNotifications();
  };

  const fetchNotifications = async () => {
    if (!session) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (data) setNotifications(data);
  };

  const markNotificationAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
      if (selectedAthleteIds.length > 0) {
        const notificationsData = selectedAthleteIds.map(athleteId => ({
          user_id: athleteId,
          message: `Il coach ti ha assegnato un nuovo programma: "${programTitle}"`,
          read: false,
          created_at: new Date().toISOString()
        }));
        await supabase.from('notifications').insert(notificationsData);
      }

      setSaveMessage('Programma salvato con successo!');
      setTimeout(() => setSaveMessage(''), 3000);
      setProgramTitle('');
      setProgramStartDate('');
      setProgramEndDateState('');
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotificationsModal(!showNotificationsModal)} 
              style={{ background: '#1e293b', border: '1px solid #334151', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', position: 'relative' }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '50%', fontWeight: 'bold' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationsModal && (
              <div style={{ position: 'absolute', right: 0, top: '45px', width: '300px', background: '#1e293b', border: '1px solid #334151', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000, padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #334151', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>Notifiche</span>
                  <button onClick={() => setShowNotificationsModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notifications.length === 0 ? (
                    <span style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>Nessuna notifica</span>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} style={{ background: n.read ? '#0f172a' : '#334155', padding: '10px', borderRadius: '8px', borderLeft: n.read ? '3px solid #64748b' : '3px solid #10b981' }}>
                        <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#fff' }}>{n.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                          {!n.read && (
                            <button onClick={() => markNotificationAsRead(n.id)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}>Segna come letta</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={{ background: '#1e293b', border: '1px solid #334151', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Esci</button>
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

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
                <div style={{ maxHeight: '120px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}>
                  {athletes.map((a) => {
                    const currentAssigned = editingProgram.assignedAthleteIds || [];
                    return (
                      <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#000', marginBottom: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentAssigned.includes(a.id)}
                          onChange={() => {
                            const updatedList = currentAssigned.includes(a.id)
                              ? currentAssigned.filter((id: string) => id !== a.id)
                              : [...currentAssigned, a.id];
                            setEditingProgram({ ...editingProgram, assignedAthleteIds: updatedList });
                          }}
                        />
                        {a.full_name || a.email}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '15px', color: '#10b981', marginBottom: '12px' }}>Settimane e Giorni del Programma</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {editingProgram.weeks?.map((week: any, wIdx: number) => (
                    <button
                      key={wIdx}
                      onClick={() => {
                        setSelectedWeekView(week.weekName);
                        if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: selectedWeekView === week.weekName ? '#10b981' : '#f1f5f9',
                        color: selectedWeekView === week.weekName ? '#fff' : '#000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {week.weekName}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const updated = { ...editingProgram };
                      if (!updated.weeks) updated.weeks = [];
                      const nextNum = updated.weeks.length + 1;
                      const newName = `Settimana ${nextNum}`;
                      updated.weeks.push({ weekNumber: nextNum, weekName: newName, days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] });
                      setEditingProgram(updated);
                      setSelectedWeekView(newName);
                      setSelectedDayView('Giorno 1');
                    }}
                    style={{ padding: '8px 12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}
                  >
                    + Aggiungi Settimana
                  </button>
                </div>

                {editingProgram.weeks?.map((week: any, wIdx: number) => {
                  if (week.weekName !== selectedWeekView) return null;
                  return (
                    <div key={wIdx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={week.weekName}
                          onChange={(e) => {
                            const updated = { ...editingProgram };
                            updated.weeks[wIdx].weekName = e.target.value;
                            setEditingProgram(updated);
                            setSelectedWeekView(e.target.value);
                          }}
                          style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', fontSize: '13px', background: '#fff', color: '#000' }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => cloneEditingWeek(week)} style={{ padding: '6px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Clona</button>
                          <button onClick={() => moveEditingWeekOrder(wIdx, 'left')} style={{ padding: '6px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>←</button>
                          <button onClick={() => moveEditingWeekOrder(wIdx, 'right')} style={{ padding: '6px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>→</button>
                          {editingProgram.weeks.length > 1 && (
                            <button onClick={() => {
                              const updated = { ...editingProgram };
                              updated.weeks.splice(wIdx, 1);
                              setEditingProgram(updated);
                              if (updated.weeks.length > 0) {
                                setSelectedWeekView(updated.weeks[0].weekName);
                                if (updated.weeks[0].days?.length > 0) setSelectedDayView(updated.weeks[0].days[0].dayName);
                              }
                            }} style={{ padding: '6px 8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Elimina</button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {week.days?.map((day: any, dIdx: number) => (
                          <button
                            key={dIdx}
                            onClick={() => setSelectedDayView(day.dayName)}
                            style={{
                              padding: '6px 10px',
                              background: selectedDayView === day.dayName ? '#334155' : '#ffffff',
                              color: selectedDayView === day.dayName ? '#fff' : '#000',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            {day.dayName}
                          </button>
                        ))}
                        <button onClick={() => addEditingDay(wIdx)} style={{ padding: '6px 10px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', color: '#64748b' }}>+ Giorno</button>
                      </div>

                      {week.days?.map((day: any, dIdx: number) => {
                        if (day.dayName !== selectedDayView) return null;
                        return (
                          <div key={dIdx} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <input
                                type="text"
                                value={day.dayName}
                                onChange={(e) => {
                                  const updated = { ...editingProgram };
                                  updated.weeks[wIdx].days[dIdx].dayName = e.target.value;
                                  setEditingProgram(updated);
                                  setSelectedDayView(e.target.value);
                                }}
                                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#f8fafc', color: '#000' }}
                              />
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => cloneEditingDay(wIdx, day)} style={{ padding: '4px 6px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Clona</button>
                                <button onClick={() => moveEditingDayOrder(wIdx, dIdx, 'left')} style={{ padding: '4px 6px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>←</button>
                                <button onClick={() => moveEditingDayOrder(wIdx, dIdx, 'right')} style={{ padding: '4px 6px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>→</button>
                                {week.days.length > 1 && (
                                  <button onClick={() => {
                                    const updated = { ...editingProgram };
                                    updated.weeks[wIdx].days.splice(dIdx, 1);
                                    setEditingProgram(updated);
                                    if (updated.weeks[wIdx].days.length > 0) setSelectedDayView(updated.weeks[wIdx].days[0].dayName);
                                  }} style={{ padding: '4px 6px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Elimina</button>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {day.blocks?.map((block: any, bIdx: number) => (
                                <div key={block.id || bIdx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <select
                                      value={block.type}
                                      onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'type', e.target.value)}
                                      style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }}
                                    >
                                      <option value="forza">Forza / Esercizio</option>
                                      <option value="wod">WOD / Metcon</option>
                                      <option value="note">Nota / Warm-up</option>
                                    </select>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button onClick={() => moveEditingBlock(wIdx, dIdx, bIdx, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>⬆️</button>
                                      <button onClick={() => moveEditingBlock(wIdx, dIdx, bIdx, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>⬇️</button>
                                      <button onClick={() => {
                                        const updated = { ...editingProgram };
                                        updated.weeks[wIdx].days[dIdx].blocks.splice(bIdx, 1);
                                        setEditingProgram(updated);
                                      }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                                    </div>
                                  </div>

                                  {block.type === 'forza' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '6px' }}>
                                      <select
                                        value={block.name}
                                        onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'name', e.target.value)}
                                        style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }}
                                      >
                                        <option value="">Seleziona Esercizio</option>
                                        {exerciseLibrary.map((ex) => (
                                          <option key={ex.id} value={ex.name}>{ex.name}</option>
                                        ))}
                                      </select>
                                      <input type="number" placeholder="Set" value={block.sets} onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'sets', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }} />
                                      <input type="text" placeholder="Reps" value={block.reps} onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'reps', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }} />
                                      <input type="text" placeholder="Carico" value={block.load} onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'load', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }} />
                                    </div>
                                  )}

                                  {block.type === 'wod' && (
                                    <textarea
                                      placeholder="Descrizione WOD..."
                                      value={block.wodNotes || ''}
                                      onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'wodNotes', e.target.value)}
                                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000', boxSizing: 'border-box' }}
                                    />
                                  )}

                                  {block.type === 'note' && (
                                    <input
                                      type="text"
                                      placeholder="Testo nota o warm-up..."
                                      value={block.notes || ''}
                                      onChange={(e) => updateEditingBlock(wIdx, dIdx, bIdx, 'notes', e.target.value)}
                                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000', boxSizing: 'border-box' }}
                                    />
                                  )}
                                </div>
                              ))}
                              <button onClick={() => addBlockToEditingDay(wIdx, dIdx)} style={{ padding: '8px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>+ Aggiungi Blocco</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <button onClick={saveEditedProgram} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>Salva Modifiche Programma</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('create')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'create' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Crea Programma</button>
                <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Programmi</button>
                <button onClick={() => setActiveTab('exercises')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'exercises' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Esercizi 🏋️‍♂️</button>
              </div>

              {activeTab === 'exercises' && (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Libreria Esercizi Globali</h3>
                  <form onSubmit={addGlobalExercise} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#000' }} />
                    <input type="url" placeholder="Link Video dimostrativo (opzionale)" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#000' }} />
                    <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Aggiungi Esercizio</button>
                  </form>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exerciseLibrary.map((ex) => (
                      <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#000', display: 'block' }}>{ex.name}</span>
                          {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#10b981' }}>Guarda Video →</a>}
                        </div>
                        <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Elimina</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'library' && (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>Libreria Programmi</h3>
                    <select
                      value={libraryFilterAthlete}
                      onChange={(e) => setLibraryFilterAthlete(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#000', fontSize: '12px' }}
                    >
                      <option value="">Tutti gli Atleti</option>
                      {athletes.map((a) => (
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
                      ))}
                    </select>
                  </div>

                  {filteredLibraryPrograms.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Nessun programma trovato.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {filteredLibraryPrograms.map((prog) => {
                        const weeks = normalizeProgramWeeks(prog);
                        const currentWeekName = selectedWeeksByProgram[prog.id] || weeks[0]?.weekName;
                        const activeWeekObj = weeks.find((w: any) => w.weekName === currentWeekName) || weeks[0];
                        const days = activeWeekObj?.days || [];
                        const currentDayName = selectedDaysByProgram[prog.id] || days[0]?.dayName;
                        const activeDayObj = days.find((d: any) => d.dayName === currentDayName) || days[0];

                        return (
                          <div key={prog.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <h4 style={{ margin: 0, fontSize: '16px', color: '#000' }}>{prog.title}</h4>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => setEditingProgram(prog)} style={{ padding: '6px 10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Modifica</button>
                                <button onClick={() => duplicateProgram(prog)} style={{ padding: '6px 10px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Clona</button>
                                <button onClick={() => deleteProgram(prog.id)} style={{ padding: '6px 10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>Elimina</button>
                              </div>
                            </div>
                            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Scadenza: {formatDateToIT(prog.endDate)}</p>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                              {weeks.map((week: any, wIdx: number) => (
                                <button
                                  key={wIdx}
                                  onClick={() => {
                                    setSelectedWeeksByProgram({ ...selectedWeeksByProgram, [prog.id]: week.weekName });
                                    if (week.days && week.days.length > 0) {
                                      setSelectedDaysByProgram({ ...selectedDaysByProgram, [prog.id]: week.days[0].dayName });
                                    }
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    background: currentWeekName === week.weekName ? '#10b981' : '#ffffff',
                                    color: currentWeekName === week.weekName ? '#fff' : '#000',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {week.weekName}
                                </button>
                              ))}
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                              {days.map((day: any, dIdx: number) => (
                                <button
                                  key={dIdx}
                                  onClick={() => setSelectedDaysByProgram({ ...selectedDaysByProgram, [prog.id]: day.dayName })}
                                  style={{
                                    padding: '4px 8px',
                                    background: currentDayName === day.dayName ? '#334155' : '#ffffff',
                                    color: currentDayName === day.dayName ? '#fff' : '#000',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px'
                                  }}
                                >
                                  {day.dayName}
                                </button>
                              ))}
                            </div>

                            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              {activeDayObj?.blocks?.length === 0 ? (
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Nessun blocco in questo giorno.</span>
                              ) : (
                                activeDayObj?.blocks?.map((block: any, bIdx: number) => (
                                  <div key={bIdx} style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>{block.type.toUpperCase()}: </span>
                                    {block.name && <span>{block.name} - </span>}
                                    {block.sets && <span>{block.sets} set x {block.reps} rep @ {block.load}</span>}
                                    {block.wodNotes && <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{block.wodNotes}</p>}
                                    {block.notes && <p style={{ margin: '4px 0 0 0', color: '#334155' }}>{block.notes}</p>}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'create' && (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Nuovo Allenamento</h3>
                
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
                
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                      <input type="date" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                      <input type="date" value={programEndDate} onChange={(e) => setProgramEndDateState(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}>
                      {athletes.length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Nessun atleta disponibile.</span>
                      ) : (
                        athletes.map((a) => (
                          <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#000', marginBottom: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={selectedAthleteIds.includes(a.id)}
                              onChange={() => toggleAthleteSelection(a.id, selectedAthleteIds, setSelectedAthleteIds)}
                            />
                            {a.full_name || a.email}
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '15px', color: '#10b981', marginBottom: '12px' }}>Composizione Settimane e Giorni</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {programWeeks.map((week, wIdx) => (
                        <button
                          key={wIdx}
                          onClick={() => {
                            setSelectedWeekView(week.weekName);
                            if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName);
                          }}
                          style={{
                            padding: '8px 12px',
                            background: selectedWeekView === week.weekName ? '#10b981' : '#f1f5f9',
                            color: selectedWeekView === week.weekName ? '#fff' : '#000',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {week.weekName}
                        </button>
                      ))}
                      <button onClick={addWeek} style={{ padding: '8px 12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>+ Aggiungi Settimana</button>
                    </div>

                    {programWeeks.map((week, wIdx) => {
                      if (week.weekName !== selectedWeekView) return null;
                      return (
                        <div key={wIdx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <input
                              type="text"
                              value={week.weekName}
                              onChange={(e) => {
                                const updated = [...programWeeks];
                                updated[wIdx].weekName = e.target.value;
                                setProgramWeeks(updated);
                                setSelectedWeekView(e.target.value);
                              }}
                              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', fontSize: '13px', background: '#fff', color: '#000' }}
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => cloneWeek(week)} style={{ padding: '6px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Clona</button>
                              <button onClick={() => moveWeekOrder(wIdx, 'left')} style={{ padding: '6px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>←</button>
                              <button onClick={() => moveWeekOrder(wIdx, 'right')} style={{ padding: '6px 8px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>→</button>
                              {programWeeks.length > 1 && (
                                <button onClick={() => {
                                  const updated = programWeeks.filter((_, i) => i !== wIdx);
                                  setProgramWeeks(updated);
                                  if (updated.length > 0) {
                                    setSelectedWeekView(updated[0].weekName);
                                    if (updated[0].days?.length > 0) setSelectedDayView(updated[0].days[0].dayName);
                                  }
                                }} style={{ padding: '6px 8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Elimina</button>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {week.days.map((day: any, dIdx: number) => (
                              <button
                                key={dIdx}
                                onClick={() => setSelectedDayView(day.dayName)}
                                style={{
                                  padding: '6px 10px',
                                  background: selectedDayView === day.dayName ? '#334155' : '#ffffff',
                                  color: selectedDayView === day.dayName ? '#fff' : '#000',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '11px'
                                }}
                              >
                                {day.dayName}
                              </button>
                            ))}
                            <button onClick={() => addDay(wIdx)} style={{ padding: '6px 10px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', color: '#64748b' }}>+ Giorno</button>
                          </div>

                          {week.days.map((day: any, dIdx: number) => {
                            if (day.dayName !== selectedDayView) return null;
                            return (
                              <div key={dIdx} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <input
                                    type="text"
                                    value={day.dayName}
                                    onChange={(e) => {
                                      const updated = [...programWeeks];
                                      updated[wIdx].days[dIdx].dayName = e.target.value;
                                      setProgramWeeks(updated);
                                      setSelectedDayView(e.target.value);
                                    }}
                                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', background: '#f8fafc', color: '#000' }}
                                  />
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <button onClick={() => cloneDay(wIdx, day)} style={{ padding: '4px 6px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Clona</button>
                                    <button onClick={() => moveDayOrder(wIdx, dIdx, 'left')} style={{ padding: '4px 6px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>←</button>
                                    <button onClick={() => moveDayOrder(wIdx, dIdx, 'right')} style={{ padding: '4px 6px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>→</button>
                                    {week.days.length > 1 && (
                                      <button onClick={() => {
                                        const updated = [...programWeeks];
                                        updated[wIdx].days.splice(dIdx, 1);
                                        setProgramWeeks(updated);
                                        if (updated[wIdx].days.length > 0) setSelectedDayView(updated[wIdx].days[0].dayName);
                                      }} style={{ padding: '4px 6px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>Elimina</button>
                                    )}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {day.blocks.map((block: any, bIdx: number) => (
                                    <div key={block.id || bIdx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <select
                                          value={block.type}
                                          onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'type', e.target.value)}
                                          style={{ padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }}
                                        >
                                          <option value="forza">Forza / Esercizio</option>
                                          <option value="wod">WOD / Metcon</option>
                                          <option value="note">Nota / Warm-up</option>
                                        </select>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                          <button onClick={() => moveFreeBlock(wIdx, dIdx, bIdx, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>⬆️</button>
                                          <button onClick={() => moveFreeBlock(wIdx, dIdx, bIdx, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>⬇️</button>
                                          <button onClick={() => removeBlockFromFreeDay(wIdx, dIdx, bIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                                        </div>
                                      </div>

                                      {block.type === 'forza' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '6px' }}>
                                          <select
                                            value={block.name}
                                            onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'name', e.target.value)}
                                            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }}
                                          >
                                            <option value="">Seleziona Esercizio</option>
                                            {exerciseLibrary.map((ex) => (
                                              <option key={ex.id} value={ex.name}>{ex.name}</option>
                                            ))}
                                          </select>
                                          <input type="number" placeholder="Set" value={block.sets} onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'sets', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }} />
                                          <input type="text" placeholder="Reps" value={block.reps} onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'reps', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }} />
                                          <input type="text" placeholder="Carico" value={block.load} onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'load', e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000' }} />
                                        </div>
                                      )}

                                      {block.type === 'wod' && (
                                        <textarea
                                          placeholder="Descrizione WOD..."
                                          value={block.wodNotes || ''}
                                          onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'wodNotes', e.target.value)}
                                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000', boxSizing: 'border-box' }}
                                        />
                                      )}

                                      {block.type === 'note' && (
                                        <input
                                          type="text"
                                          placeholder="Testo nota o warm-up..."
                                          value={block.notes || ''}
                                          onChange={(e) => updateFreeBlock(wIdx, dIdx, bIdx, 'notes', e.target.value)}
                                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', background: '#fff', color: '#000', boxSizing: 'border-box' }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                  <button onClick={() => addBlockToFreeDay(wIdx, dIdx)} style={{ padding: '8px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>+ Aggiungi Blocco</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '16px' }}>
                    Salva e Assegna Programma
                  </button>
                  {saveMessage && <p style={{ color: '#10b981', textAlign: 'center', marginTop: '10px', fontSize: '13px', fontWeight: 'bold' }}>{saveMessage}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('library')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'library' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>I miei Programmi</button>
            <button onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'profile' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>I miei Massimali 🏋️‍♂️</button>
            <button onClick={() => setActiveTab('exercises')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'exercises' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Libreria Esercizi</button>
          </div>

          {activeTab === 'profile' && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334151' }}>
              <h3 style={{ fontSize: '18px', color: '#10b981', marginBottom: '16px' }}>Gestione Massimali Personali</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {STRENGTH_EXERCISES.map((exName) => {
                  const exMaxes = athleteMaxes[exName] || {};
                  return (
                    <div key={exName} style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334151' }}>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', marginBottom: '8px' }}>{exName}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {REP_SCHEMES.map((reps) => (
                          <div key={reps} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#94a3b8' }}>{reps} RM (kg)</span>
                            <input
                              type="number"
                              value={exMaxes[reps] || ''}
                              onChange={(e) => handleMaxChange(exName, reps, e.target.value)}
                              placeholder="0"
                              style={{ padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334151', color: '#fff', fontSize: '13px', textAlign: 'center' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'exercises' && (
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334151' }}>
              <h3 style={{ fontSize: '18px', color: '#10b981', marginBottom: '16px' }}>Libreria Esercizi</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exerciseLibrary.map((ex) => (
                  <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334151' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{ex.name}</span>
                    {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#10b981' }}>Guarda Video →</a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div>
              {bannerData.image_url && (
                <div style={{ marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334151' }}>
                  <a href={bannerData.link_url || '#'} target="_blank" rel="noreferrer">
                    <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }} />
                  </a>
                </div>
              )}

              <h3 style={{ fontSize: '18px', color: '#10b981', marginBottom: '16px' }}>I tuoi Programmi Attivi</h3>
              {athletePrograms.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>Nessun programma assegnato al momento.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {athletePrograms.map((prog) => {
                    const weeks = normalizeProgramWeeks(prog);
                    const currentWeekName = selectedWeeksByProgram[prog.id] || weeks[0]?.weekName;
                    const activeWeekObj = weeks.find((w: any) => w.weekName === currentWeekName) || weeks[0];
                    const days = activeWeekObj?.days || [];
                    const currentDayName = selectedDaysByProgram[prog.id] || days[0]?.dayName;
                    const activeDayObj = days.find((d: any) => d.dayName === currentDayName) || days[0];

                    return (
                      <div key={prog.id} style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #334151' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#fff' }}>{prog.title}</h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8' }}>Scadenza: {formatDateToIT(prog.endDate)}</p>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {weeks.map((week: any, wIdx: number) => (
                            <button
                              key={wIdx}
                              onClick={() => {
                                setSelectedWeeksByProgram({ ...selectedWeeksByProgram, [prog.id]: week.weekName });
                                if (week.days && week.days.length > 0) {
                                  setSelectedDaysByProgram({ ...selectedDaysByProgram, [prog.id]: week.days[0].dayName });
                                }
                              }}
                              style={{
                                padding: '6px 10px',
                                background: currentWeekName === week.weekName ? '#10b981' : '#0f172a',
                                color: '#fff',
                                border: '1px solid #334151',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 'bold'
                              }}
                            >
                              {week.weekName}
                            </button>
                          ))}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {days.map((day: any, dIdx: number) => (
                            <button
                              key={dIdx}
                              onClick={() => setSelectedDaysByProgram({ ...selectedDaysByProgram, [prog.id]: day.dayName })}
                              style={{
                                padding: '4px 8px',
                                background: currentDayName === day.dayName ? '#334155' : '#0f172a',
                                color: '#fff',
                                border: '1px solid #334151',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              {day.dayName}
                            </button>
                          ))}
                        </div>

                        <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334151' }}>
                          {activeDayObj?.blocks?.length === 0 ? (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Nessun blocco in questo giorno.</span>
                          ) : (
                            activeDayObj?.blocks?.map((block: any, bIdx: number) => {
                              const blockKey = `${prog.id}_${currentWeekName}_${currentDayName}_${bIdx}`;
                              const blockResult = (athleteResults[prog.id] && athleteResults[prog.id][blockKey]) || { score: '', notes: '' };

                              return (
                                <div key={bIdx} style={{ padding: '10px 0', borderBottom: '1px solid #1e293b', fontSize: '13px' }}>
                                  <span style={{ fontWeight: 'bold', color: '#10b981' }}>{block.type.toUpperCase()}: </span>
                                  {block.name && <span style={{ color: '#fff' }}>{block.name} - </span>}
                                  {block.sets && <span style={{ color: '#cbd5e1' }}>{block.sets} set x {block.reps} rep @ {block.load}</span>}
                                  {block.wodNotes && <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>{block.wodNotes}</p>}
                                  {block.notes && <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>{block.notes}</p>}

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                                    <input
                                      type="text"
                                      placeholder="Risultato / Carico"
                                      value={blockResult.score}
                                      onChange={(e) => handleResultChange(prog.id, blockKey, 'score', e.target.value)}
                                      style={{ padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid #334151', color: '#fff', fontSize: '11px' }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Note personali"
                                      value={blockResult.notes}
                                      onChange={(e) => handleResultChange(prog.id, blockKey, 'notes', e.target.value)}
                                      style={{ padding: '6px', borderRadius: '4px', background: '#1e293b', border: '1px solid #334151', color: '#fff', fontSize: '11px' }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
