'use client';
 
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
// Funzione di utilità per formattare la data da aaaa-mm-gg a gg\mm\aaaa
const formatDateToIT = (dateString: string) => {
  if (!dateString) return 'N/D';
  // Gestisce sia il formato 'yyyy-mm-dd' che 'yyyy-mm-ddTHH:mm:ss...'
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
 
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrato:', registration.scope);
        })
        .catch(error => {
          console.error('Errore registrazione Service Worker:', error);
        });
    }
  }, []);
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
  const [coachSubView, setCoachSubView] = useState<'programs' | 'athletes' | 'personal' | 'banner'>('programs');
  const [personalSelectedAthleteId, setPersonalSelectedAthleteId] = useState('');
  const [personalExpandedProgramId, setPersonalExpandedProgramId] = useState<string | null>(null);
  const [coachAthleteDetailTab, setCoachAthleteDetailTab] = useState<'maxes' | 'anamnesi'>('maxes');
  const [customMaxExercises, setCustomMaxExercises] = useState<{ id: string; name: string; dismissed: boolean }[]>([]);
  const [newMaxExerciseName, setNewMaxExerciseName] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState('');
  const [showExerciseManager, setShowExerciseManager] = useState(false);
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
  const [coachAllAnamnesis, setCoachAllAnamnesis] = useState<{ [athleteId: string]: any }>({});
  const emptyAnamnesis = { goal: '', weekly_sessions: '', session_duration: '', equipment: '', physical_issues: '' };
  const [anamnesis, setAnamnesis] = useState<any>(emptyAnamnesis);
  const [anamnesisSaving, setAnamnesisSaving] = useState(false);
  const [athleteProfileTab, setAthleteProfileTab] = useState<'maxes' | 'anamnesi'>('maxes');
 
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
 
  const [saveMessage, setSaveMessage] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
const [notificationError, setNotificationError] = useState('');
  const [showDeletedPrograms, setShowDeletedPrograms] = useState(false);
  const [showDeletedExercises, setShowDeletedExercises] = useState(false);
 
  const normalizeProgramWeeks = (prog: any) => {
    if (prog.weeks && prog.weeks.length > 0) return prog.weeks;
    if (prog.days && prog.days.length > 0) {
      return [{ weekNumber: 1, weekName: 'Settimana 1', days: prog.days }];
    }
    return [{ weekNumber: 1, weekName: 'Settimana 1', days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] }];
  };
 
  const getCalendarDaysDifference = (dateString: string) => {
    if (!dateString) return null;
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    if (!year || !month || !day) return null;
 
    const target = Date.UTC(year, month - 1, day);
    const today = new Date();
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
 
    return Math.round((target - todayUTC) / 86400000);
  };
 
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
 
    const { data, error } = await supabase
      .from('notifications')
      .select('id,user_id,title,message,notification_type,is_read,created_at')
      .eq('user_id', session.user.id)
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(50);
 
    if (error) {
      console.error('Errore caricamento notifiche:', error);
      setNotificationError(error.message);
      return;
    }
 
    setNotificationError('');
 
    setNotifications(data || []);
  };
 
  const createNotificationIfMissing = async (
  title: string,
  message: string,
  notificationType: string,
  programId?: string
) => {
    if (!session?.user?.id) return;
 
    const { data: existing, error: checkError } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('notification_type', notificationType)
      .limit(1);
 
    if (checkError) {
      console.error('Errore controllo notifica:', checkError);
      setNotificationError(checkError.message);
      return;
    }
 
    if (existing && existing.length > 0) return;
 
    const { error } = await supabase.from('notifications').insert([{
  user_id: session.user.id,
  title,
  message,
  notification_type: notificationType,
  is_read: false,
  program_id: programId || null
}]);
 
    if (error) {
      console.error('Errore creazione notifica:', error);
      setNotificationError(error.message);
      return;
    }
 
    await fetchNotifications();
 
    fetch('/api/send-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: session.user.id,
        title,
        message,
      }),
    }).catch(pushErr => console.error('Errore invio push:', pushErr));
  };
 
  const syncProgramNotifications = async () => {
    if (!session?.user?.id || !programLibrary.length) return;
 
    if (role === 'athlete') {
      const assignedPrograms = programLibrary.filter(
        (prog) => prog.assignedAthleteIds?.includes(session.user.id)
      );
 
      for (const prog of assignedPrograms) {
        await createNotificationIfMissing(
  'Nuovo programma assegnato',
  `Ti è stato assegnato il programma "${prog.title}"${prog.startDate ? `, dal ${formatDateToIT(prog.startDate)}` : ''}.`,
  `program_assigned_${prog.id}`,
  prog.id
);
      }
      return;
    }
 
    if (role === 'coach') {
      for (const prog of programLibrary) {
        if (!prog.endDate || !prog.assignedAthleteIds?.length) continue;
 
        const daysRemaining = getCalendarDaysDifference(prog.endDate);
        if (![10, 7, 2, 0].includes(daysRemaining as number)) continue;
 
        const dayText =
          daysRemaining === 0
            ? 'scade oggi'
            : `scade tra ${daysRemaining} giorni`;
 
        await createNotificationIfMissing(
          'Scadenza programma',
          `Il programma "${prog.title}" ${dayText} (data fine: ${formatDateToIT(prog.endDate)}).`,
          `program_deadline_${prog.id}_${daysRemaining}`
        );
      }
    }
  };
 
  const deleteNotification = async (notificationId: string) => {
  if (!session?.user?.id) return;
 
  const { error } = await supabase
    .from('notifications')
    .update({ dismissed: true })
    .eq('id', notificationId)
    .eq('user_id', session.user.id);
 
  if (error) {
    console.error('Errore eliminazione notifica:', error);
    setNotificationError(error.message);
    return;
  }
 
  setNotifications(prev =>
    prev.filter(n => n.id !== notificationId)
  );
 
  setNotificationError('');
};
 
  // ---- PUSH NOTIFICATIONS ----
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
 
  const subscribeToPush = async () => {
    if (!session?.user?.id) return;
 
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setNotificationError('Le notifiche push non sono supportate su questo dispositivo/browser.');
      return;
    }
 
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setNotificationError('Permesso notifiche negato.');
      return;
    }
 
    const registration = await navigator.serviceWorker.ready;
 
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      }));
 
    const subJson = subscription.toJSON();
 
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: session.user.id,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
      { onConflict: 'endpoint' }
    );
 
    if (error) {
      console.error('Errore salvataggio sottoscrizione push:', error);
      setNotificationError(error.message);
      return;
    }
 
    setNotificationError('');
  };
 
  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', session?.user?.id);
 
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };
 
  const markAllNotificationsAsRead = async () => {
    if (!session?.user?.id) return;
 
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
 
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
      fetchCustomMaxExercises();
      if (role === 'coach') {
        fetchAthletes();
        fetchAllAthleteResultsForCoach();
        fetchAllAthleteMaxesForCoach();
        fetchAllAnamnesisForCoach();
      } else {
        fetchAthleteResults();
        fetchAthleteMaxes(session.user.id);
        fetchOwnAnamnesis(session.user.id);
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
 
      const notificationsChannel = supabase
        .channel('realtime-notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();
 
      return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(bannerChannel);
        supabase.removeChannel(exChannel);
        supabase.removeChannel(resultsChannel);
        supabase.removeChannel(maxesChannel);
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [session, role]);
 
  useEffect(() => {
    if (session && programLibrary.length > 0) {
      syncProgramNotifications();
    }
  }, [session, role, programLibrary]);
 
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
        isDeleted: item.is_deleted === true,
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
 
  const fetchCustomMaxExercises = async () => {
    const { data } = await supabase.from('custom_max_exercises').select('id,name,dismissed').order('created_at', { ascending: true });
    if (data) {
      setCustomMaxExercises(data.map((item: any) => ({ id: item.id, name: item.name, dismissed: !!item.dismissed })));
    }
  };
 
  const addCustomMaxExercise = async () => {
    const name = newMaxExerciseName.trim();
    if (!name) return;
 
    if (STRENGTH_EXERCISES.includes(name)) {
      setNewMaxExerciseName('');
      return;
    }
 
    const existing = customMaxExercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (existing.dismissed) {
        await toggleDismissCustomMaxExercise(existing.id, false);
      }
      setNewMaxExerciseName('');
      return;
    }
 
    const { data, error } = await supabase.from('custom_max_exercises').insert([{ name }]).select('id,name,dismissed').single();
    if (!error && data) {
      setCustomMaxExercises([...customMaxExercises, { id: data.id, name: data.name, dismissed: false }]);
      setNewMaxExerciseName('');
    }
  };
 
  const renameCustomMaxExercise = async (id: string, newName: string) => {
    const name = newName.trim();
    if (!name) return;
 
    const { error } = await supabase.from('custom_max_exercises').update({ name }).eq('id', id);
    if (!error) {
      setCustomMaxExercises(customMaxExercises.map((e) => (e.id === id ? { ...e, name } : e)));
      setEditingExerciseId(null);
      setEditingExerciseName('');
    }
  };
 
  const toggleDismissCustomMaxExercise = async (id: string, dismissed: boolean) => {
    const { error } = await supabase.from('custom_max_exercises').update({ dismissed }).eq('id', id);
    if (!error) {
      setCustomMaxExercises(customMaxExercises.map((e) => (e.id === id ? { ...e, dismissed } : e)));
    }
  };
 
  const permanentlyDeleteMaxExercise = async (id: string) => {
    if (!confirm('Eliminare DEFINITIVAMENTE questo esercizio? Non sarà più possibile recuperarlo.')) return;
    const { error } = await supabase.from('custom_max_exercises').delete().eq('id', id);
    if (!error) {
      setCustomMaxExercises(customMaxExercises.filter((e) => e.id !== id));
    } else {
      alert('Errore durante l\'eliminazione definitiva: ' + error.message);
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
 
  const fetchAllAnamnesisForCoach = async () => {
    const { data } = await supabase.from('athlete_anamnesis').select('*');
    if (data) {
      const map: { [key: string]: any } = {};
      data.forEach((item: any) => {
        map[item.athlete_id] = {
          goal: item.goal || '',
          weekly_sessions: item.weekly_sessions || '',
          session_duration: item.session_duration || '',
          equipment: item.equipment || '',
          physical_issues: item.physical_issues || ''
        };
      });
      setCoachAllAnamnesis(map);
    }
  };
 
  const fetchOwnAnamnesis = async (athleteId: string) => {
    const { data } = await supabase.from('athlete_anamnesis').select('*').eq('athlete_id', athleteId).maybeSingle();
    if (data) {
      setAnamnesis({
        goal: data.goal || '',
        weekly_sessions: data.weekly_sessions || '',
        session_duration: data.session_duration || '',
        equipment: data.equipment || '',
        physical_issues: data.physical_issues || ''
      });
    } else {
      setAnamnesis(emptyAnamnesis);
    }
  };
 
  const saveAnamnesis = async (athleteId: string, data: any, isCoachEditing: boolean) => {
    setAnamnesisSaving(true);
    const { error } = await supabase.from('athlete_anamnesis').upsert(
      {
        athlete_id: athleteId,
        goal: data.goal,
        weekly_sessions: data.weekly_sessions ? parseInt(data.weekly_sessions) : null,
        session_duration: data.session_duration,
        equipment: data.equipment,
        physical_issues: data.physical_issues,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'athlete_id' }
    );
    setAnamnesisSaving(false);
    if (error) {
      alert('Errore durante il salvataggio: ' + error.message);
      return;
    }
    if (isCoachEditing) {
      setCoachAllAnamnesis({ ...coachAllAnamnesis, [athleteId]: data });
    }
    alert('Anamnesi salvata con successo!');
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
 
  const handleResultChange = async (programId: string, blockKey: string, field: string, value: string, athleteIdOverride?: string) => {
    if (athleteIdOverride) {
      // Il coach sta inserendo un risultato per conto di un atleto (es. durante il personal)
      const currentProgResults = coachAllResults[programId] || {};
      const currentAthleteResults = currentProgResults[athleteIdOverride] || {};
      const currentBlockResults = currentAthleteResults[blockKey] || { score: '', notes: '' };
 
      const updatedBlockResults = { ...currentBlockResults, [field]: value };
      const updatedAthleteResults = { ...currentAthleteResults, [blockKey]: updatedBlockResults };
      const updatedProgResults = { ...currentProgResults, [athleteIdOverride]: updatedAthleteResults };
 
      setCoachAllResults({ ...coachAllResults, [programId]: updatedProgResults });
 
      await supabase.from('program_results').upsert(
        {
          program_id: programId,
          athlete_id: athleteIdOverride,
          results: updatedAthleteResults,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'program_id, athlete_id' }
      );
      return;
    }
 
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
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated.push({ weekNumber: nextNumber, weekName: newName, days: [{ dayNumber: 1, dayName: 'Giorno 1', blocks: [] }] });
    setProgramWeeks(updated);
    setSelectedWeekView(newName);
    setSelectedDayView('Giorno 1');
  };
 
  const cloneWeek = (weekToClone: any) => {
    const nextNumber = programWeeks.length + 1;
    const clonedName = `${weekToClone.weekName} (Copia)`;
    const clonedDays = JSON.parse(JSON.stringify(weekToClone.days || []));
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated.push({ weekNumber: nextNumber, weekName: clonedName, days: clonedDays });
    setProgramWeeks(updated);
    setSelectedWeekView(clonedName);
    if (clonedDays.length > 0) setSelectedDayView(clonedDays[0].dayName);
  };
 
  const moveWeekOrder = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= programWeeks.length) return;
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setProgramWeeks(updated);
  };
 
  const addDay = (wIdx: number) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const targetWeek = updated[wIdx];
    const nextNumber = targetWeek.days.length + 1;
    const newName = `Giorno ${nextNumber}`;
    targetWeek.days.push({ dayNumber: nextNumber, dayName: newName, blocks: [] });
    setProgramWeeks(updated);
    setSelectedDayView(newName);
  };
 
  const cloneDay = (wIdx: number, dayToClone: any) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
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
    const updated = JSON.parse(JSON.stringify(programWeeks));
    const days = updated[wIdx].days;
    if (newIndex < 0 || newIndex >= days.length) return;
    const temp = days[dayIdx];
    days[dayIdx] = days[newIndex];
    days[newIndex] = temp;
    setProgramWeeks(updated);
  };
 
  const cloneEditingWeek = (weekToClone: any) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
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
    const updated = JSON.parse(JSON.stringify(editingProgram));
    if (newIndex < 0 || newIndex >= updated.weeks.length) return;
    const temp = updated.weeks[index];
    updated.weeks[index] = updated.weeks[newIndex];
    updated.weeks[newIndex] = temp;
    setEditingProgram(updated);
  };
 
  const addEditingDay = (wIdx: number) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const targetWeek = updated.weeks[wIdx];
    if (!targetWeek.days) targetWeek.days = [];
    const nextNumber = targetWeek.days.length + 1;
    const newName = `Giorno ${nextNumber}`;
    targetWeek.days.push({ dayNumber: nextNumber, dayName: newName, blocks: [] });
    setEditingProgram(updated);
    setSelectedDayView(newName);
  };
 
  const cloneEditingDay = (wIdx: number, dayToClone: any) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const targetWeek = updated.weeks[wIdx];
    const clonedName = `${dayToClone.dayName} (Copia)`;
    const clonedBlocks = JSON.parse(JSON.stringify(dayToClone.blocks || []));
    targetWeek.days.push({ dayNumber: targetWeek.days.length + 1, dayName: clonedName, blocks: clonedBlocks });
    setEditingProgram(updated);
    setSelectedDayView(clonedName);
  };
 
  const moveEditingDayOrder = (wIdx: number, dayIdx: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? dayIdx - 1 : dayIdx + 1;
    const updated = JSON.parse(JSON.stringify(editingProgram));
    const days = updated.weeks[wIdx].days;
    if (newIndex < 0 || newIndex >= days.length) return;
    const temp = days[dayIdx];
    days[dayIdx] = days[newIndex];
    days[newIndex] = temp;
    setEditingProgram(updated);
  };
 
  const removeBlockFromFreeDay = (wIdx: number, dayIndex: number, blockIndex: number) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated[wIdx].days[dayIndex].blocks.splice(blockIndex, 1);
    setProgramWeeks(updated);
  };
 
  const moveFreeBlock = (wIdx: number, dayIndex: number, blockIndex: number, direction: 'up' | 'down') => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
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
    const updated = JSON.parse(JSON.stringify(editingProgram));
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
    if (confirm('Vuoi spostare questo esercizio nel cestino?')) {
      await supabase.from('exercises_library').update({ dismissed: true }).eq('id', id);
      fetchExerciseLibrary();
    }
  };
 
  const restoreGlobalExercise = async (id: string) => {
    await supabase.from('exercises_library').update({ dismissed: false }).eq('id', id);
    fetchExerciseLibrary();
  };
 
  const permanentlyDeleteGlobalExercise = async (id: string) => {
    if (!confirm('Eliminare DEFINITIVAMENTE questo esercizio (incluso il video)? Non sarà più possibile recuperarlo.')) return;
    await supabase.from('exercises_library').delete().eq('id', id);
    fetchExerciseLibrary();
  };
 
  const addBlockToFreeDay = (wIdx: number, dayIndex: number) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
    updated[wIdx].days[dayIndex].blocks.push({
      id: Date.now(), name: '', type: 'forza', sets: 4, reps: '10', load: '70%', rest: '90 sec', notes: '', wodNotes: '', videoUrl: ''
    });
    setProgramWeeks(updated);
  };
 
  const updateFreeBlock = (wIdx: number, dayIndex: number, blockIndex: number, field: string, value: any) => {
    const updated = JSON.parse(JSON.stringify(programWeeks));
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
    const updated = JSON.parse(JSON.stringify(editingProgram));
    updated.weeks[wIdx].days[dayIndex].blocks[blockIndex][field] = value;
    setEditingProgram(updated);
  };
 
  const addBlockToEditingDay = (wIdx: number, dayIndex: number) => {
    const updated = JSON.parse(JSON.stringify(editingProgram));
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
    if (!confirm('Sei sicuro di voler eliminare questo programma?')) return;
    const { error } = await supabase.from('programs').update({ is_deleted: true }).eq('id', id);
    if (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
      return;
    }
    await fetchProgramLibrary();
  };
 
  const restoreProgram = async (id: string) => {
    if (!confirm('Vuoi ripristinare questo programma?')) return;
    const { error } = await supabase.from('programs').update({ is_deleted: false }).eq('id', id);
    if (error) {
      alert('Errore durante il ripristino: ' + error.message);
      return;
    }
    await fetchProgramLibrary();
  };
 
  const permanentlyDeleteProgram = async (id: string) => {
    if (!confirm('Eliminare DEFINITIVAMENTE questo programma? Non sarà più possibile recuperarlo.')) return;
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) {
      alert('Errore durante l\'eliminazione definitiva: ' + error.message);
      return;
    }
    await fetchProgramLibrary();
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
    (prog) => !prog.isDeleted && (!prog.assignedAthleteIds || prog.assignedAthleteIds.length === 0 || prog.assignedAthleteIds.includes(session?.user?.id))
  );
 
  const filteredLibraryPrograms = programLibrary.filter((prog) => {
    if (showDeletedPrograms) {
      if (!prog.isDeleted) return false;
    } else if (prog.isDeleted) {
      return false;
    }
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
 
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              title="Notifiche"
              style={{
                position: 'relative',
                background: '#1e293b',
                border: '1px solid #334151',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              🔔
              {notifications.some(n => !n.is_read) && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 4px',
                  borderRadius: '999px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0b0f19'
                }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>
 
            {showNotifications && (
              <div style={{
                position: 'fixed',
                top: '72px',
                right: '12px',
                width: 'min(360px, calc(100vw - 24px))',
                maxHeight: 'min(70vh, 480px)',
                overflowY: 'auto',
                background: '#ffffff',
                color: '#000',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 16px 40px rgba(0,0,0,0.30)',
                zIndex: 9999,
                boxSizing: 'border-box'
              }}>
                <div style={{
                  padding: '12px 14px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <strong style={{ fontSize: '14px' }}>Notifiche</strong>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      onClick={subscribeToPush}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Ricevi notifiche anche ad app chiusa"
                    >
                      Attiva notifiche push
                    </button>
                    {notifications.some(n => !n.is_read) && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#10b981',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Segna tutte come lette
                      </button>
                    )}
                  </div>
                </div>
 
                {notificationError && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', fontSize: '11px', borderBottom: '1px solid #fecaca', lineHeight: 1.4 }}>
                    Errore notifiche: {notificationError}
                  </div>
                )}
 
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 14px', color: '#64748b', textAlign: 'center', fontSize: '13px' }}>
                    Nessuna notifica.
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
  key={notification.id}
  onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
  style={{
    padding: '12px 14px',
    borderBottom: '1px solid #f1f5f9',
    background: notification.is_read ? '#ffffff' : '#ecfdf5',
    cursor: notification.is_read ? 'default' : 'pointer',
    position: 'relative',
    paddingRight: '42px'
  }}
>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '13px',
                        color: notification.is_read ? '#334155' : '#047857',
                        marginBottom: '4px'
                      }}>
                        {notification.title}
                      </div>
                      <button
  onClick={(e) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  }}
  title="Elimina notifica"
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '15px',
    padding: '2px',
    color: '#94a3b8'
  }}
>
  🗑️
</button>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        {notification.message}
                      </div>
                      {notification.created_at && (
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '5px' }}>
                          {new Date(notification.created_at).toLocaleString('it-IT')}
                        </div>
                      )}
                    </div>
                  ))
                )}
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
            <button onClick={() => { setCoachSubView('athletes'); setSelectedCoachAthlete(null); }} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'athletes' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Profilo Utenti 👤</button>
            <button onClick={() => setCoachSubView('personal')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: coachSubView === 'personal' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Personal 📝</button>
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
              <div style={{ background: '#ffffff', color: '#000000', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>🏋️ Elenco Esercizi Massimali (valido per tutti gli atleti)</span>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    placeholder="Nuovo esercizio (es. Bench Press)"
                    value={newMaxExerciseName}
                    onChange={(e) => setNewMaxExerciseName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addCustomMaxExercise(); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}
                  />
                  <button onClick={addCustomMaxExercise} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
                </div>
 
                {customMaxExercises.length > 0 && (
                  <div>
                    <button onClick={() => setShowExerciseManager(!showExerciseManager)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                      {showExerciseManager ? '▲ Nascondi gestione esercizi aggiunti' : '▼ Gestisci esercizi aggiunti'}
                    </button>
 
                    {showExerciseManager && (
                      <div style={{ marginTop: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {customMaxExercises.map((ex) => (
                          <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: ex.dismissed ? 0.5 : 1 }}>
                            {editingExerciseId === ex.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editingExerciseName}
                                  onChange={(e) => setEditingExerciseName(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') renameCustomMaxExercise(ex.id, editingExerciseName); }}
                                  style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#000', fontSize: '12px' }}
                                  autoFocus
                                />
                                <button onClick={() => renameCustomMaxExercise(ex.id, editingExerciseName)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Salva</button>
                                <button onClick={() => { setEditingExerciseId(null); setEditingExerciseName(''); }} style={{ background: '#e2e8f0', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Annulla</button>
                              </>
                            ) : (
                              <>
                                <span style={{ flex: 1, fontSize: '13px', color: '#000', textDecoration: ex.dismissed ? 'line-through' : 'none' }}>{ex.name}{ex.dismissed ? ' (eliminato)' : ''}</span>
                                {!ex.dismissed ? (
                                  <>
                                    <button onClick={() => { setEditingExerciseId(ex.id); setEditingExerciseName(ex.name); }} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>✏️ Rinomina</button>
                                    <button onClick={() => toggleDismissCustomMaxExercise(ex.id, true)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️ Elimina</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => toggleDismissCustomMaxExercise(ex.id, false)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                                    <button onClick={() => permanentlyDeleteMaxExercise(ex.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Definitivo</button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
 
              {selectedCoachAthlete ? (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>{selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
                    <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
                  </div>
 
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setCoachAthleteDetailTab('maxes')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'maxes' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Massimali</button>
                    <button onClick={() => setCoachAthleteDetailTab('anamnesi')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: coachAthleteDetailTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: coachAthleteDetailTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Anamnesi 📋</button>
                  </div>
 
                  {coachAthleteDetailTab === 'maxes' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[...STRENGTH_EXERCISES, ...customMaxExercises.filter((e) => !e.dismissed).map((e) => e.name)].map((exName) => {
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
                  )}
 
                  {coachAthleteDetailTab === 'anamnesi' && (() => {
                    const athAnamnesi = coachAllAnamnesis[selectedCoachAthlete.id] || emptyAnamnesis;
                    const updateField = (field: string, value: string) => {
                      setCoachAllAnamnesis({
                        ...coachAllAnamnesis,
                        [selectedCoachAthlete.id]: { ...athAnamnesi, [field]: value }
                      });
                    };
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
                          <textarea value={athAnamnesi.goal} onChange={(e) => updateField('goal', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
                          <select value={athAnamnesi.weekly_sessions} onChange={(e) => updateField('weekly_sessions', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                            <option value="">Seleziona...</option>
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
                          <select value={athAnamnesi.session_duration} onChange={(e) => updateField('session_duration', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                            <option value="">Seleziona...</option>
                            <option value="30'">30'</option>
                            <option value="1 ora">1 ora</option>
                            <option value="1 ora e 30'">1 ora e 30'</option>
                            <option value="2 ore">2 ore</option>
                            <option value="più di 2 ore">più di 2 ore</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
                          <textarea value={athAnamnesi.equipment} onChange={(e) => updateField('equipment', e.target.value)} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
                          <textarea value={athAnamnesi.physical_issues} onChange={(e) => updateField('physical_issues', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                        </div>
                        <button
                          disabled={anamnesisSaving}
                          onClick={() => saveAnamnesis(selectedCoachAthlete.id, athAnamnesi, true)}
                          style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
                        >
                          {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
                        </button>
                      </div>
                    );
                  })()}
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
                          <span style={{ fontSize: '12px', color: '#10b981' }}>Visualizza Profilo →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : coachSubView === 'personal' ? (
            <div>
              {personalSelectedAthleteId ? (() => {
                const selAthlete = athletes.find((a: any) => a.id === personalSelectedAthleteId);
                const athletePersonalPrograms = programLibrary.filter(
                  (p: any) => !p.isDeleted && p.assignedAthleteIds?.includes(personalSelectedAthleteId)
                );
 
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', color: '#10b981', margin: 0 }}>Personal di: {selAthlete?.full_name || selAthlete?.email}</h3>
                      <button onClick={() => setPersonalSelectedAthleteId('')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Cambia atleta</button>
                    </div>
 
                    {athletePersonalPrograms.length === 0 ? (
                      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ color: '#64748b' }}>Nessuna scheda assegnata a questo atleta.</p>
                      </div>
                    ) : (
                      athletePersonalPrograms.map((prog: any) => {
                        const weeks = normalizeProgramWeeks(prog);
                        const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                        const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
                        const activeDayName = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
                        const realWeekIndex = weeks.findIndex((w: any) => w.weekName === activeWeekName);
                        const activeDayObj = activeWeekObj?.days?.find((d: any) => d.dayName === activeDayName);
                        const realDayIndex = activeWeekObj?.days?.findIndex((d: any) => d.dayName === activeDayName);
 
                        return (
                          <div key={prog.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                            <div
                              onClick={() => setPersonalExpandedProgramId(personalExpandedProgramId === prog.id ? null : prog.id)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: personalExpandedProgramId === prog.id ? '12px' : '0' }}
                            >
                              <h4 style={{ margin: 0, color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                              <span style={{ fontSize: '18px', color: '#10b981', fontWeight: 'bold' }}>{personalExpandedProgramId === prog.id ? '▲' : '▼'}</span>
                            </div>
 
                            {personalExpandedProgramId === prog.id && (
                            <>
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                              {weeks.map((w: any) => (
                                <button
                                  key={w.weekName}
                                  onClick={() => {
                                    setCoachSelectedWeek(prev => ({ ...prev, [prog.id]: w.weekName }));
                                    if (w.days && w.days.length > 0) setCoachSelectedDay(prev => ({ ...prev, [prog.id]: w.days[0].dayName }));
                                  }}
                                  style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: activeWeekName === w.weekName ? '#0284c7' : '#e2e8f0', color: activeWeekName === w.weekName ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {w.weekName}
                                </button>
                              ))}
                            </div>
 
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', paddingBottom: '4px' }}>
                              {activeWeekObj?.days?.map((day: any) => (
                                <button
                                  key={day.dayName}
                                  onClick={() => setCoachSelectedDay(prev => ({ ...prev, [prog.id]: day.dayName }))}
                                  style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: activeDayName === day.dayName ? '#10b981' : '#f1f5f9', color: activeDayName === day.dayName ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {day.dayName}
                                </button>
                              ))}
                            </div>
 
                            {(!activeDayObj || !activeDayObj.blocks || activeDayObj.blocks.length === 0) ? (
                              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Nessun esercizio in questo giorno.</p>
                            ) : (
                              activeDayObj.blocks.map((blk: any, bIdx: number) => {
                                const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
                                const currentScore = coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.score || '';
                                const currentNotes = coachAllResults[prog.id]?.[personalSelectedAthleteId]?.[resultKey]?.notes || '';
 
                                return (
                                  <div key={bIdx} style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>{blk.name || `Esercizio ${bIdx + 1}`}</div>
 
                                    {blk.type === 'forza' ? (
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>SET</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.sets}</span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>REP</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.reps}</span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>CARICO</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.load}</span>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                          <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>REC.</span>
                                          <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#000' }}>{blk.rest}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</span>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
                                      </div>
                                    )}
 
                                    {blk.type === 'forza' && blk.notes && (
                                      <div style={{ background: '#fffbeb', padding: '8px', borderRadius: '6px', border: '1px solid #fde68a', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '10px', color: '#92400e', fontWeight: 'bold', display: 'block' }}>NOTE ESERCIZIO (dal programma)</span>
                                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155' }}>{blk.notes}</p>
                                      </div>
                                    )}
 
                                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 INSERISCI SCORE / NOTE (Personal):</span>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                        <div>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Score / Carico</label>
                                          <input type="text" placeholder="es. 100kg" value={currentScore} onChange={(e) => handleResultChange(prog.id, resultKey, 'score', e.target.value, personalSelectedAthleteId)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Note del coach</label>
                                          <input type="text" placeholder="Sensazioni, tecnica..." value={currentNotes} onChange={(e) => handleResultChange(prog.id, resultKey, 'notes', e.target.value, personalSelectedAthleteId)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            </>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })() : (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#10b981' }}>Seleziona un Atleta per il Personal</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {athletes.map((a: any) => (
                      <div
                        key={a.id}
                        onClick={() => setPersonalSelectedAthleteId(a.id)}
                        style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{a.full_name || a.email}</span>
                        <span style={{ fontSize: '12px', color: '#10b981' }}>Vai al Personal →</span>
                      </div>
                    ))}
                  </div>
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
 
              <div style={{ marginBottom: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {editingProgram.weeks?.map((week: any, wIdx: number) => {
                    const isSelected = selectedWeekView === week.weekName;
                    return (
                      <div key={wIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#ffffff', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                        <button onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                          {week.weekName}
                        </button>
                        <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                          <button onClick={() => moveEditingWeekOrder(wIdx, 'left')} disabled={wIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                          <button onClick={() => cloneEditingWeek(week)} title="Clona settimana" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                          <button onClick={() => moveEditingWeekOrder(wIdx, 'right')} disabled={wIdx === editingProgram.weeks.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === editingProgram.weeks.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === editingProgram.weeks.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              {editingProgram.weeks?.filter((w: any) => w.weekName === selectedWeekView).map((week: any) => {
                const actualWIdx = editingProgram.weeks.findIndex((w: any) => w.weekName === selectedWeekView);
 
                return (
                  <div key={actualWIdx} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#e2e8f0', padding: '10px', borderRadius: '8px' }}>
                      <input
                        type="text"
                        value={week.weekName}
                        onChange={(e) => {
                          const updated = JSON.parse(JSON.stringify(editingProgram));
                          updated.weeks[actualWIdx].weekName = e.target.value;
                          setSelectedWeekView(e.target.value);
                          setEditingProgram(updated);
                        }}
                        style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', width: '200px' }}
                      />
                      {editingProgram.weeks.length > 1 && (
                        <button onClick={() => {
                          const updated = JSON.parse(JSON.stringify(editingProgram));
                          updated.weeks.splice(actualWIdx, 1);
                          setEditingProgram(updated);
                          if (updated.weeks.length > 0) {
                            setSelectedWeekView(updated.weeks[0].weekName);
                            if (updated.weeks[0].days?.length > 0) setSelectedDayView(updated.weeks[0].days[0].dayName);
                          }
                        }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Settimana</button>
                      )}
                    </div>
 
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                      {week.days?.map((day: any, dIdx: number) => {
                        const isSelected = selectedDayView === day.dayName;
                        return (
                          <div key={dIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#f1f5f9', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                              {day.dayName}
                            </button>
                            <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                              <button onClick={() => moveEditingDayOrder(actualWIdx, dIdx, 'left')} disabled={dIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                              <button onClick={() => cloneEditingDay(actualWIdx, day)} title="Clona giorno" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                              <button onClick={() => moveEditingDayOrder(actualWIdx, dIdx, 'right')} disabled={dIdx === week.days.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === week.days.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === week.days.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={() => addEditingDay(actualWIdx)} style={{ padding: '6px 12px', background: '#ffffff', border: '1px dashed #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Giorno</button>
                    </div>
 
                    {week.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
                      const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
                      return (
                        <div key={actualDIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                              <input
                                type="text"
                                value={day.dayName}
                                onChange={(e) => {
                                  const updated = JSON.parse(JSON.stringify(editingProgram));
                                  updated.weeks[actualWIdx].days[actualDIdx].dayName = e.target.value;
                                  setSelectedDayView(e.target.value);
                                  setEditingProgram(updated);
                                }}
                                style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', flex: 1 }}
                              />
                            </div>
                            {week.days.length > 1 && (
                              <button onClick={() => {
                                const updated = JSON.parse(JSON.stringify(editingProgram));
                                updated.weeks[actualWIdx].days.splice(actualDIdx, 1);
                                setEditingProgram(updated);
                                if (updated.weeks[actualWIdx].days.length > 0) setSelectedDayView(updated.weeks[actualWIdx].days[0].dayName);
                              }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Giorno</button>
                            )}
                          </div>
 
                          {day.blocks?.map((block: any, bIdx: number) => {
                            const blockKey = `edit_${actualWIdx}_${actualDIdx}_${bIdx}`;
                            const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                            return (
                              <div key={block.id || bIdx} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                    <button type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                                  </div>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                    <button type="button" onClick={() => {
                                      const updated = JSON.parse(JSON.stringify(editingProgram));
                                      updated.weeks[actualWIdx].days[actualDIdx].blocks.splice(bIdx, 1);
                                      setEditingProgram(updated);
                                    }} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                  </div>
                                </div>
 
                                <div style={{ marginBottom: '10px' }}>
                                  {block.type === 'forza' ? (
                                    <div>
                                      <input
                                        type="text"
                                        list={`ex_list_edit_${actualWIdx}_${actualDIdx}_${bIdx}`}
                                        value={block.name || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          const updated = JSON.parse(JSON.stringify(editingProgram));
                                          updated.weeks[actualWIdx].days[actualDIdx].blocks[bIdx].name = val;
                                          const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                          if (foundEx && foundEx.video_url) {
                                            updated.weeks[actualWIdx].days[actualDIdx].blocks[bIdx].videoUrl = foundEx.video_url;
                                          }
                                          setEditingProgram(updated);
                                        }}
                                        placeholder="Inserisci o seleziona esercizio..."
                                        style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }}
                                      />
                                      <datalist id={`ex_list_edit_${actualWIdx}_${actualDIdx}_${bIdx}`}>
                                        {exerciseLibrary.filter((ex) => !ex.dismissed).map((ex) => (
                                          <option key={ex.id} value={ex.name} />
                                        ))}
                                      </datalist>
                                    </div>
                                  ) : (
                                    <input type="text" value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                  )}
                                </div>
 
                                {!isClosed && (
                                  <div>
                                    <div style={{ marginBottom: '10px' }}>
                                      <input type="url" value={block.videoUrl || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }} />
                                    </div>
                                    {block.type === 'forza' ? (
                                      <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                            <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                            <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                            <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                            <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                          </div>
                                        </div>
                                        <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                          <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                          <input type="text" value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                        <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                        <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          <button onClick={() => addBlockToEditingDay(actualWIdx, actualDIdx)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                        </div>
                      );
                    })}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>{showDeletedExercises ? 'Cestino Esercizi' : 'Gestione Libreria Esercizi'}</h3>
                    <button onClick={() => setShowDeletedExercises(!showDeletedExercises)} style={{ padding: '8px 10px', borderRadius: '8px', border: 'none', background: showDeletedExercises ? '#10b981' : '#64748b', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      {showDeletedExercises ? 'Torna agli esercizi' : '🗑️ Cestino'}
                    </button>
                  </div>
 
                  {!showDeletedExercises && (
                    <form onSubmit={addGlobalExercise} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #e2e8f0' }}>
                      <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                      <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px' }} />
                      <button type="submit" style={{ padding: '10px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
                    </form>
                  )}
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {exerciseLibrary.filter((ex) => showDeletedExercises ? ex.dismissed : !ex.dismissed).length === 0 ? (
                      <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>{showDeletedExercises ? 'Cestino vuoto.' : 'Nessun esercizio in libreria.'}</p>
                    ) : (
                      exerciseLibrary.filter((ex) => showDeletedExercises ? ex.dismissed : !ex.dismissed).map((ex) => (
                        <div key={ex.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#000' }}>{ex.name}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{ex.video_url || 'Nessun video'}</div>
                          </div>
                          {showDeletedExercises ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => restoreGlobalExercise(ex.id)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                              <button onClick={() => permanentlyDeleteGlobalExercise(ex.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Definitivo</button>
                            </div>
                          ) : (
                            <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : activeTab === 'create' ? (
                <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
                
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', marginBottom: '12px', boxSizing: 'border-box' }} />
                
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
                      <input type="date" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
                      <input type="date" value={programEndDate} onChange={(e) => setProgramEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', boxSizing: 'border-box' }} />
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
 
                  <div style={{ marginBottom: '16px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                      {programWeeks.map((week, wIdx) => {
                        const isSelected = selectedWeekView === week.weekName;
                        return (
                          <div key={wIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#ffffff', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                              {week.weekName}
                            </button>
                            <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                              <button onClick={() => moveWeekOrder(wIdx, 'left')} disabled={wIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                              <button onClick={() => cloneWeek(week)} title="Clona settimana" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                              <button onClick={() => moveWeekOrder(wIdx, 'right')} disabled={wIdx === programWeeks.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: wIdx === programWeeks.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: wIdx === programWeeks.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={addWeek} style={{ padding: '6px 12px', background: '#10b981', border: 'none', color: '#ffffff', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Settimana</button>
                    </div>
                  </div>
 
                  {programWeeks.filter((w) => w.weekName === selectedWeekView).map((week) => {
                    const actualWIdx = programWeeks.findIndex((w) => w.weekName === selectedWeekView);
 
                    return (
                      <div key={actualWIdx} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#e2e8f0', padding: '10px', borderRadius: '8px' }}>
                          <input
                            type="text"
                            value={week.weekName}
                            onChange={(e) => {
                              const upd = JSON.parse(JSON.stringify(programWeeks));
                              upd[actualWIdx].weekName = e.target.value;
                              setSelectedWeekView(e.target.value);
                              setProgramWeeks(upd);
                            }}
                            style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', width: '200px' }}
                          />
                          {programWeeks.length > 1 && (
                            <button onClick={() => {
                              const upd = JSON.parse(JSON.stringify(programWeeks));
                              upd.splice(actualWIdx, 1);
                              setProgramWeeks(upd);
                              if (upd.length > 0) {
                                setSelectedWeekView(upd[0].weekName);
                                if (upd[0].days?.length > 0) setSelectedDayView(upd[0].days[0].dayName);
                              }
                            }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Settimana</button>
                          )}
                        </div>
 
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                          {week.days.map((day: any, dIdx: number) => {
                            const isSelected = selectedDayView === day.dayName;
                            return (
                              <div key={dIdx} style={{ display: 'flex', alignItems: 'center', background: isSelected ? '#10b981' : '#f1f5f9', borderRadius: '8px', padding: '4px 6px', border: '1px solid #cbd5e1', gap: '4px', whiteSpace: 'nowrap' }}>
                                <button onClick={() => setSelectedDayView(day.dayName)} style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: isSelected ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  {day.dayName}
                                </button>
                                <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid ' + (isSelected ? 'rgba(255,255,255,0.4)' : '#cbd5e1'), paddingLeft: '4px' }}>
                                  <button onClick={() => moveDayOrder(actualWIdx, dIdx, 'left')} disabled={dIdx === 0} title="Sposta a sinistra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === 0 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === 0 ? 'default' : 'pointer', fontSize: '10px' }}>⬅️</button>
                                  <button onClick={() => cloneDay(actualWIdx, day)} title="Clona giorno" style={{ background: 'transparent', border: 'none', padding: '2px', color: isSelected ? '#fff' : '#334155', fontSize: '11px', cursor: 'pointer' }}>📋</button>
                                  <button onClick={() => moveDayOrder(actualWIdx, dIdx, 'right')} disabled={dIdx === week.days.length - 1} title="Sposta a destra" style={{ background: 'transparent', border: 'none', padding: '2px', color: dIdx === week.days.length - 1 ? '#cbd5e1' : (isSelected ? '#fff' : '#334155'), cursor: dIdx === week.days.length - 1 ? 'default' : 'pointer', fontSize: '10px' }}>➡️</button>
                                </div>
                              </div>
                            );
                          })}
                          <button onClick={() => addDay(actualWIdx)} style={{ padding: '6px 12px', background: '#ffffff', border: '1px dashed #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>+ Giorno</button>
                        </div>
 
                        {week.days.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
                          const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
                          return (
                            <div key={actualDIdx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                                  <input
                                    type="text"
                                    value={day.dayName}
                                    onChange={(e) => {
                                      const upd = JSON.parse(JSON.stringify(programWeeks));
                                      upd[actualWIdx].days[actualDIdx].dayName = e.target.value;
                                      setSelectedDayView(e.target.value);
                                      setProgramWeeks(upd);
                                    }}
                                    style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', background: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', flex: 1 }}
                                  />
                                </div>
                                {week.days.length > 1 && (
                                  <button onClick={() => {
                                    const upd = JSON.parse(JSON.stringify(programWeeks));
                                    upd[actualWIdx].days.splice(actualDIdx, 1);
                                    setProgramWeeks(upd);
                                    if (upd[actualWIdx].days.length > 0) setSelectedDayView(upd[actualWIdx].days[0].dayName);
                                  }} style={{ background: '#fee2e2', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Elimina Giorno</button>
                                )}
                              </div>
 
                              {day.blocks.map((block: any, bIdx: number) => {
                                const blockKey = `prog_${actualWIdx}_${actualDIdx}_${bIdx}`;
                                const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                                return (
                                  <div key={block.id} style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                      <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '10px' }}>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'forza')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'forza' ? '#10b981' : '#f1f5f9', color: block.type === 'forza' ? '#fff' : '#000', cursor: 'pointer' }}>FORZA</button>
                                        <button type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'type', 'wod')} style={{ flex: 1, padding: '6px', borderRadius: '4px', border: 'none', fontWeight: 'bold', fontSize: '11px', background: block.type === 'wod' ? '#10b981' : '#f1f5f9', color: block.type === 'wod' ? '#fff' : '#000', cursor: 'pointer' }}>WOD</button>
                                      </div>
                                      <div style={{ display: 'flex', gap: '4px' }}>
                                        <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬆️</button>
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: '#f1f5f9', border: 'none', color: '#000', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>⬇️</button>
                                        <button type="button" onClick={() => removeBlockFromFreeDay(actualWIdx, actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️</button>
                                      </div>
                                    </div>
 
                                    <div style={{ marginBottom: '10px' }}>
                                      {block.type === 'forza' ? (
                                        <div>
                                          <input
                                            type="text"
                                            list={`ex_list_create_${actualWIdx}_${actualDIdx}_${bIdx}`}
                                            value={block.name || ''}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', val);
                                              const foundEx = exerciseLibrary.find(ex => ex.name === val);
                                              if (foundEx && foundEx.video_url) {
                                                updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', foundEx.video_url);
                                              }
                                            }}
                                            placeholder="Inserisci o seleziona esercizio..."
                                            style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#10b981', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }}
                                          />
                                          <datalist id={`ex_list_create_${actualWIdx}_${actualDIdx}_${bIdx}`}>
                                            {exerciseLibrary.filter((ex) => !ex.dismissed).map((ex) => (
                                              <option key={ex.id} value={ex.name} />
                                            ))}
                                          </datalist>
                                        </div>
                                      ) : (
                                        <input type="text" value={block.name} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                      )}
                                    </div>
 
                                    {!isClosed && (
                                      <div>
                                        <div style={{ marginBottom: '10px' }}>
                                          <input type="url" value={block.videoUrl || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#000', borderRadius: '6px', fontSize: '12px' }} />
                                        </div>
                                        {block.type === 'forza' ? (
                                          <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>SET</label>
                                                <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>REP</label>
                                                <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CARICO / RPE</label>
                                                <input type="text" value={block.load} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>RECUPERO</label>
                                                <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
                                              </div>
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                              <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>NOTE</label>
                                              <input type="text" value={block.notes} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                            </div>
                                          </div>
                                        ) : (
                                          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                            <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</label>
                                            <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', height: '70px', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px' }} />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              <button onClick={() => addBlockToFreeDay(actualWIdx, actualDIdx)} style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: 'none', color: '#000', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>+ Aggiungi Esercizio</button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
 
                  {saveMessage && <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
                  <button onClick={saveProgramToLibrary} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0 }}>{showDeletedPrograms ? 'Cestino Programmi' : 'Libreria Programmi'}</h3>
  <button onClick={() => setShowDeletedPrograms(!showDeletedPrograms)} style={{ padding: '8px 10px', borderRadius: '8px', border: 'none', background: showDeletedPrograms ? '#10b981' : '#64748b', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
    {showDeletedPrograms ? 'Torna ai programmi' : '🗑️ Cestino'}
  </button>
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
                    filteredLibraryPrograms.map((prog) => {
                      const assignedList = athletes.filter((a) => prog.assignedAthleteIds?.includes(a.id));
                      const progResultsByAthlete = coachAllResults[prog.id] || {};
                      
                      const weeks = normalizeProgramWeeks(prog);
                      const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                      const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
                      const activeDay = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
 
                      return (
                        <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '16px' }}>{prog.title}</h4>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                                <span style={{ fontSize: '11px', color: assignedList.length > 0 ? '#0284c7' : '#000000', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                  Assegnato: {assignedList.length > 0 ? assignedList.map(a => a.full_name || a.email).join(', ') : 'Tutti (Generale)'}
                                </span>
                                {(prog.startDate || prog.endDate) && (
                                  <span style={{ fontSize: '11px', color: '#047857', background: '#d1fae5', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>
                                    📅 {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {showDeletedPrograms ? (
                                <>
                                  <button onClick={() => restoreProgram(prog.id)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>♻️ Ripristina</button>
                                  <button onClick={() => permanentlyDeleteProgram(prog.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ Elimina definitivamente</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => duplicateProgram(prog)} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
                                  <button onClick={() => {
                                    const progToEdit = JSON.parse(JSON.stringify(prog));
                                    progToEdit.weeks = normalizeProgramWeeks(progToEdit);
                                    setEditingProgram(progToEdit);
                                    if (progToEdit.weeks.length > 0) {
                                      setSelectedWeekView(progToEdit.weeks[0].weekName);
                                      if (progToEdit.weeks[0].days?.length > 0) setSelectedDayView(progToEdit.weeks[0].days[0].dayName);
                                    }
                                  }} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
                                  <button onClick={() => deleteProgram(prog.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
                                </>
                              )}
                            </div>
                          </div>
 
                          <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📊 RISULTATI INSERITI DAGLI ATLETI:</span>
                            
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '8px', paddingBottom: '4px' }}>
                              {weeks.map((w: any) => (
                                <button
                                  key={w.weekName}
                                  onClick={() => {
                                    setCoachSelectedWeek(prev => ({ ...prev, [prog.id]: w.weekName }));
                                    if (w.days && w.days.length > 0) setCoachSelectedDay(prev => ({ ...prev, [prog.id]: w.days[0].dayName }));
                                  }}
                                  style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: activeWeekName === w.weekName ? '#0284c7' : '#cbd5e1', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  {w.weekName}
                                </button>
                              ))}
                            </div>
 
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                              {activeWeekObj?.days?.map((day: any) => (
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
                                  const wIndex = weeks.findIndex((w: any) => w.weekName === activeWeekName);
                                  const dayIndex = activeWeekObj?.days?.findIndex((d: any) => d.dayName === activeDay);
                                  if (wIndex === -1 || dayIndex === -1) return <span style={{ fontSize: '11px', color: '#64748b' }}>Seleziona un giorno valido.</span>;
                                  
                                  const blocksOfActiveDay = activeWeekObj.days[dayIndex].blocks || [];
                                  
                                  return athletes.map((ath) => {
                                    const resObj = progResultsByAthlete[ath.id];
                                    if (!resObj) return null;
 
                                    const hasResultsForThisDay = blocksOfActiveDay.some((_: any, bIdx: number) => {
                                      const blockKey = `${wIndex}_${dayIndex}_${bIdx}`;
                                      return resObj[blockKey]?.score || resObj[blockKey]?.notes;
                                    });
 
                                    if (!hasResultsForThisDay) return null;
                                    const athName = ath.full_name || ath.email;
 
                                    return (
                                      <div key={ath.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '12px', color: '#0284c7', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{athName}:</span>
                                        <div style={{ fontSize: '11px', color: '#334155', paddingLeft: '6px' }}>
                                          {blocksOfActiveDay.map((blk: any, bIdx: number) => {
                                            const blockKey = `${wIndex}_${dayIndex}_${bIdx}`;
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
            <button onClick={() => setActiveTab('profile')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: activeTab === 'profile' ? '#10b981' : '#1e293b', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Il mio Profilo 👤</button>
          </div>
 
          {activeTab === 'profile' ? (
            <div style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => setAthleteProfileTab('maxes')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'maxes' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'maxes' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Massimali</button>
                <button onClick={() => setAthleteProfileTab('anamnesi')} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: athleteProfileTab === 'anamnesi' ? '#10b981' : '#e2e8f0', color: athleteProfileTab === 'anamnesi' ? '#fff' : '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Anamnesi 📋</button>
              </div>
 
              {athleteProfileTab === 'maxes' && (
              <>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#10b981' }}>I tuoi Massimali di Forza</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...STRENGTH_EXERCISES, ...customMaxExercises.filter((e) => !e.dismissed).map((e) => e.name)].map((exName) => (
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
              </>
              )}
 
              {athleteProfileTab === 'anamnesi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#10b981' }}>Anamnesi</h3>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
                    <textarea value={anamnesis.goal} onChange={(e) => setAnamnesis({ ...anamnesis, goal: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
                    <select value={anamnesis.weekly_sessions} onChange={(e) => setAnamnesis({ ...anamnesis, weekly_sessions: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Seleziona...</option>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
                    <select value={anamnesis.session_duration} onChange={(e) => setAnamnesis({ ...anamnesis, session_duration: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px' }}>
                      <option value="">Seleziona...</option>
                      <option value="30'">30'</option>
                      <option value="1 ora">1 ora</option>
                      <option value="1 ora e 30'">1 ora e 30'</option>
                      <option value="2 ore">2 ore</option>
                      <option value="più di 2 ore">più di 2 ore</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
                    <textarea value={anamnesis.equipment} onChange={(e) => setAnamnesis({ ...anamnesis, equipment: e.target.value })} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
                    <textarea value={anamnesis.physical_issues} onChange={(e) => setAnamnesis({ ...anamnesis, physical_issues: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#000', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>
                  <button
                    disabled={anamnesisSaving}
                    onClick={() => saveAnamnesis(session.user.id, anamnesis, false)}
                    style={{ padding: '12px', borderRadius: '8px', background: '#10b981', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
                  >
                    {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
                  </button>
                </div>
              )}
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
                  const weeks = normalizeProgramWeeks(prog);
                  const currentProgramActiveWeek = selectedWeeksByProgram[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
                  const currentWeekObj = weeks.find((w: any) => w.weekName === currentProgramActiveWeek) || weeks[0];
                  const currentProgramActiveDay = selectedDaysByProgram[prog.id] || (currentWeekObj?.days && currentWeekObj.days.length > 0 ? currentWeekObj.days[0].dayName : '');
 
                  return (
                    <div key={prog.id} style={{ background: '#ffffff', color: '#000000', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <h4 style={{ color: '#10b981', margin: 0, fontSize: '18px' }}>{prog.title}</h4>
                        {(prog.startDate || prog.endDate) && (
                          <span style={{ fontSize: '12px', color: '#047857', background: '#d1fae5', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                            📅 Dal {formatDateToIT(prog.startDate)} al {formatDateToIT(prog.endDate)}
                          </span>
                        )}
                      </div>
                    
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                        {weeks.map((week: any) => (
                          <button
                            key={week.weekName}
                            onClick={() => {
                              setSelectedWeeksByProgram(prev => ({ ...prev, [prog.id]: week.weekName }));
                              if (week.days && week.days.length > 0) {
                                setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: week.days[0].dayName }));
                              }
                            }}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: currentProgramActiveWeek === week.weekName ? '#0284c7' : '#e2e8f0', color: currentProgramActiveWeek === week.weekName ? '#fff' : '#000', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {week.weekName}
                          </button>
                        ))}
                      </div>
 
                      {currentWeekObj?.days ? (
                        <div>
                          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
                            {currentWeekObj.days.map((day: any, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: day.dayName }))}
                                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: currentProgramActiveDay === day.dayName ? '#10b981' : '#f1f5f9', color: currentProgramActiveDay === day.dayName ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                {day.dayName}
                              </button>
                            ))}
                          </div>
 
                          {currentWeekObj.days.filter((d: any) => d.dayName === currentProgramActiveDay).map((day: any) => {
                            const realWeekIndex = weeks.findIndex((w: any) => w.weekName === currentProgramActiveWeek);
                            const realDayIndex = currentWeekObj.days.findIndex((d: any) => d.dayName === day.dayName);
                            const dayCollapseKey = `${prog.id}_w_${realWeekIndex}_d_${realDayIndex}`;
                            const isDayClosed = collapsedProgramDays[dayCollapseKey] === undefined ? true : collapsedProgramDays[dayCollapseKey];
 
                            return (
                              <div key={realDayIndex} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDayClosed ? '0' : '12px' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{currentWeekObj.weekName} - {day.dayName}</span>
                                  <button type="button" onClick={() => toggleProgramDayCollapse(dayCollapseKey)} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                    {isDayClosed ? 'Apri Blocco Programma ▼' : 'Chiudi Blocco Programma ▲'}
                                  </button>
                                </div>
 
                                {!isDayClosed && (
                                  <div>
                                    {day.blocks?.length === 0 ? (
                                      <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nessun esercizio inserito.</p>
                                    ) : (
                                      day.blocks?.map((blk: any, bIdx: number) => {
                                        const blockKey = `ath_${prog.id}_${realWeekIndex}_${realDayIndex}_${bIdx}`;
                                        const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
                                        const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
                                        return (
                                          <div key={bIdx} style={{ background: '#ffffff', padding: '14px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>{blk.name}</div>
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
                                                  <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>WOD / CIRCUITO</span>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
                                                  </div>
                                                )}
 
                                                <div style={{ marginTop: '10px', background: '#f1f5f9', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                                                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 I TUOI RISULTATI / NOTE:</span>
                                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                                    <div>
                                                      <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Score / Carico</label>
                                                      <input type="text" placeholder="es. 100kg" value={athleteResults[prog.id]?.[resultKey]?.score || ''} onChange={(e) => handleResultChange(prog.id, resultKey, 'score', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                                    </div>
                                                    <div>
                                                      <label style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Note personali</label>
                                                      <input type="text" placeholder="Sensazioni..." value={athleteResults[prog.id]?.[resultKey]?.notes || ''} onChange={(e) => handleResultChange(prog.id, resultKey, 'notes', e.target.value)} style={{ width: '100%', padding: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
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
 
 