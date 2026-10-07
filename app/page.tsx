
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-26262a)', border: '1px solid var(--bd-3a3a40)', color: '#fff' }} />
 
          )}
 
          {isRegistering && !isResettingPassword && (
 
            <>
 
              <div style={{ display: 'flex', gap: '12px' }}>
 
                <input type="text" placeholder="Nome" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '8px', background: 'var(--bg-26262a)', border: '1px solid var(--bd-3a3a40)', color: '#fff', boxSizing: 'border-box' }} />
 
                <input type="text" placeholder="Cognome" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '8px', background: 'var(--bg-26262a)', border: '1px solid var(--bd-3a3a40)', color: '#fff', boxSizing: 'border-box' }} />
 
              </div>
 
              <div>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-94a3b8)', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
 
                <input type="date" value={signupBirthDate} onChange={(e) => cambiaDataNascita(e.target.value)} required style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '12px', borderRadius: '8px', background: 'var(--bg-26262a)', border: '1px solid var(--bd-3a3a40)', color: '#fff', boxSizing: 'border-box' }} />
 
              </div>
 
 
 
              {isMinorenne(signupBirthDate) && (
 
                <div style={{ background: 'var(--bg-26262a)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px' }}>
 
                  <label style={{ fontSize: '12px', color: '#fbbf24', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
 
                    ⚠️ Utente minorenne — dati del genitore
 
                  </label>
 
                  <p style={{ fontSize: '11px', color: 'var(--fg-a1a1aa)', margin: '0 0 8px 0', lineHeight: 1.45 }}>
 
                    Hai {calcolaEta(signupBirthDate)} anni: per registrarti serve il consenso di chi esercita la responsabilità genitoriale. Indica il suo nome e cognome — l&apos;informativa che leggerai è quella rivolta a lui.
 
                  </p>
 
                  <input
 
                    type="text"
 
                    placeholder="Nome e cognome del genitore o tutore"
 
                    value={signupGuardian}
 
                    onChange={(e) => setSignupGuardian(e.target.value)}
 
                    required
 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', background: 'var(--bg-1c1c20)', border: '1px solid var(--bd-3a3a40)', color: '#fff' }}
 
                  />
 
                </div>
 
              )}
 
              <div>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-94a3b8)', display: 'block', marginBottom: '6px' }}>Sesso</label>
 
                <div style={{ display: 'flex', gap: '10px' }}>
 
                  {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                    <button
 
                      key={k}
 
                      type="button"
 
                      onClick={() => setSignupGender(k)}
 
                      style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '999px', border: signupGender === k ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-3a3a40)', background: signupGender === k ? 'var(--bg-10b981)' : 'var(--bg-26262a)', color: signupGender === k ? 'var(--onacc)' : '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
 
                    >
 
                      {label}
 
                    </button>
 
                  ))}
 
                </div>
 
                <span style={{ fontSize: '11px', color: 'var(--fg-71717a)', display: 'block', marginTop: '5px' }}>Serve per assegnarti la scheda di prova corretta.</span>
 
              </div>
 
 
 
              <div style={{ display: 'flex', gap: '12px' }}>
 
                <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={signupWeight} onChange={(e) => setSignupWeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--bg-26262a)', border: '1px solid var(--bd-3a3a40)', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
 
                <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={signupHeight} onChange={(e) => setSignupHeight(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--bg-26262a)', border: '1px solid var(--bd-3a3a40)', color: '#fff', width: '100%', boxSizing: 'border-box' }} />
 
              </div>
 
 
 
              {consensoAzzerato && (
 
                <div style={{ background: '#422006', border: '1px solid #f59e0b', borderRadius: '8px', padding: '11px 13px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
 
                  <span style={{ fontSize: '17px', flexShrink: 0 }}>⚠️</span>
 
                  <span style={{ fontSize: '12px', color: '#fde68a', lineHeight: 1.5 }}>
 
                    Con la data di nascita che hai inserito ti spetta un&apos;informativa diversa da quella che avevi accettato. Rileggila e conferma di nuovo il consenso.
 
                  </span>
 
                </div>
 
              )}
 
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--fg-94a3b8)', lineHeight: 1.4 }}>
 
                <input
 
                  type="checkbox"
 
                  checked={privacyConsent}
 
                  onChange={(e) => {
 
                    if (e.target.checked) {
 
                      setPolicyScrolledToEnd(false);
 
                      setShowPrivacyPolicy(true);
 
                      setConsensoAzzerato(false);
 
                    } else {
 
                      setPrivacyConsent(false);
 
                    }
 
                  }}
 
                  style={{ marginTop: '2px', flexShrink: 0 }}
 
                />
 
                <span>
 
                  {isMinorenne(signupBirthDate) ? 'In qualità di esercente la responsabilità genitoriale, ho letto e accetto l’' : 'Ho letto e accetto l’'}
 
                  <button type="button" onClick={() => setShowPrivacyPolicy(true)} style={{ background: 'none', border: 'none', color: 'var(--fg-10b981)', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '12px' }}>informativa privacy</button>
 
                  {' '}{isMinorenne(signupBirthDate) ? 'e presto il consenso al trattamento dei dati del minore, inclusi quelli relativi allo stato di salute, per la programmazione degli allenamenti.' : 'e acconsento al trattamento dei miei dati, inclusi quelli relativi allo stato di salute, per la programmazione degli allenamenti.'}
 
                </span>
 
              </label>
 
            </>
 
          )}
 
          {authError && <p style={{ color: 'var(--fg-ef4444)', fontSize: '14px' }}>{authError}</p>}
 
          {resetMessage && <p style={{ color: 'var(--fg-10b981)', fontSize: '14px' }}>{resetMessage}</p>}
 
          <button
 
            type="submit"
 
            disabled={authLoading}
 
            style={{ padding: '12px', borderRadius: '999px', background: authLoading ? 'var(--bg-0e8f65)' : 'var(--bg-10b981)', color: authLoading ? 'var(--onacc)' : 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: authLoading ? 'wait' : 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
 
          >
 
            {authLoading && (
 
              <span style={{ width: '15px', height: '15px', border: '2px solid rgba(var(--onacc-rgb), 0.3)', borderTopColor: 'var(--onacc)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
 
            )}
 
            {authLoading
 
              ? (isResettingPassword ? 'Invio in corso...' : (isRegistering ? 'Registrazione in corso...' : 'Accesso in corso...'))
 
              : (isResettingPassword ? 'Invia Richiesta' : (isRegistering ? 'Registrati' : 'Accedi'))}
 
          </button>
 
        </form>
 
 
 
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
 
          {!isResettingPassword && (
 
            <button onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
 
              {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
 
            </button>
 
          )}
 
          <button onClick={() => { setIsResettingPassword(!isResettingPassword); setAuthError(''); setResetMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--fg-10b981)', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
 
            {isResettingPassword ? 'Torna al Login' : 'Password dimenticata?'}
 
          </button>
 
        </div>
 
        </>
 
        )}
 
 
 
        {showPrivacyPolicy && (
 
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 1000 }}>
 
            <div style={{ background: 'var(--bg-ffffff)', color: 'var(--fg-000000)', borderRadius: '12px', maxWidth: '560px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
 
              <div style={{ padding: '18px 20px 10px 20px', borderBottom: '1px solid var(--bd-e2e8f0)' }}>
 
                <h3 style={{ margin: 0, color: 'var(--fg-10b981)', fontSize: '17px' }}>
 
                  {isMinorenne(signupBirthDate) ? 'Informativa per utenti minorenni' : 'Informativa sul trattamento dei dati personali'}
 
                </h3>
 
                {isMinorenne(signupBirthDate) && (
 
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--fg-92400e)', fontWeight: 'bold' }}>
 
                    Rivolta a chi esercita la responsabilità genitoriale
 
                  </p>
 
                )}
 
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--fg-64748b)' }}>Scorri fino in fondo per poter proseguire.</p>
 
              </div>
 
 
 
              <div
 
                onScroll={(e) => {
 
                  const el = e.currentTarget;
 
                  if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) setPolicyScrolledToEnd(true);
 
                }}
 
                style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', fontSize: '13px', lineHeight: 1.5 }}
 
              >
 
                <PrivacyPolicyContent minor={isMinorenne(signupBirthDate)} />
 
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '2px solid var(--bd-10b981)' }}>
 
                  <p style={{ fontSize: '13px', color: 'var(--fg-334155)', margin: 0, fontWeight: 'bold' }}>Hai raggiunto la fine dell&apos;informativa. Puoi chiudere e proseguire con la registrazione.</p>
 
                </div>
 
              </div>
 
 
 
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--bd-e2e8f0)', background: 'var(--bg-f8fafc)' }}>
 
                <button
 
                  disabled={!policyScrolledToEnd}
 
                  onClick={() => { setPrivacyConsent(true); setShowPrivacyPolicy(false); }}
 
                  style={{ width: '100%', boxSizing: 'border-box', padding: '13px', borderRadius: '999px', background: policyScrolledToEnd ? 'var(--bg-10b981)' : 'var(--bg-cbd5e1)', color: policyScrolledToEnd ? 'var(--onacc)' : '#fff', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: policyScrolledToEnd ? 'pointer' : 'not-allowed' }}
 
                >
 
                  {policyScrolledToEnd ? 'Accetta e chiudi' : 'Scorri fino in fondo e accetta'}
 
                </button>
 
              </div>
 
            </div>
 
          </div>
 
        )}
 
      </div>
 
    );
 
  }
 
 
 
  // La settimana di prova dura sette giorni dalla scelta, poi scade da sola
 
  const DURATA_PROVA_GIORNI = 7;
 
  const trialEndDate = trialStartedAt
 
    ? new Date(new Date(trialStartedAt).getTime() + DURATA_PROVA_GIORNI * 86400000)
 
    : null;
 
  const giorniProvaRimasti = trialEndDate
 
    ? Math.ceil((trialEndDate.getTime() - Date.now()) / 86400000)
 
    : 0;
 
  const provaAttiva = subscriptionStatus === 'prova' && !!trialEndDate && Date.now() < trialEndDate.getTime();
 
  const provaScaduta = subscriptionStatus === 'prova' && !!trialChoice && !provaAttiva;
 
 
 
  const athletePrograms = programLibrary.filter((prog) => {
 
    if (prog.isDeleted) return false;
 
 
 
    // Una settimana dopo la scadenza il programma sparisce dagli allenamenti.
 
    // Se il coach sposta in avanti la data di fine, torna visibile da solo.
 
    if (programmaDaNascondere(prog.endDate)) return false;
 
 
 
    // I programmi della settimana di prova: solo a chi ce l'ha attiva e ha scelto quello stile
 
    if (prog.trialStyle) {
 
      if (!provaAttiva || trialChoice !== prog.trialStyle) return false;
 
 
 
      // Sulla Sala Pesi la scheda cambia in base al sesso: se la scheda ne indica uno,
 
      // deve corrispondere. Senza sesso nel profilo si ripiega su quella maschile,
 
      // per non mostrarne due o nessuna.
 
      if (prog.trialGender) {
 
        return prog.trialGender === (athleteGender || 'm');
 
      }
 
      return true;
 
    }
 
 
 
    // Abbonamento scaduto: nessuna scheda
 
    if (subscriptionStatus === 'scaduto') return false;
 
 
 
    // In prova: solo le schede espressamente assegnate dal coach
 
    if (subscriptionStatus === 'prova') {
 
      return prog.visibility !== 'none' && prog.assignedAthleteIds?.includes(session?.user?.id);
 
    }
 
 
 
    if (prog.visibility === 'none') return false;            // bozza: solo il coach
 
    if (prog.visibility === 'all') return true;              // visibile a tutti
 
    return prog.assignedAthleteIds?.includes(session?.user?.id); // solo gli assegnati
 
  }).map((prog) => {
 
    if (!prog.trialStyle || !trialStartedAt || !trialEndDate) return prog;
 
    return {
 
      ...prog,
 
      startDate: new Date(trialStartedAt).toISOString().split('T')[0],
 
      endDate: trialEndDate.toISOString().split('T')[0],
 
    };
 
  });
 
 
 
  const filteredLibraryPrograms = programLibrary.filter((prog) => {
 
    if (libraryView === 'cestino') {
 
      if (!prog.isDeleted) return false;
 
      return contiene(prog.title, cercaProgrammi);
 
    }
 
    if (prog.isDeleted) return false;
 
    if (!contiene(prog.title, cercaProgrammi)) return false;
 
 
 
    // Primo: la categoria
 
    if (libraryFilter === 'prove') return !!prog.trialStyle;
 
 
 
    if (libraryFilter === 'scaduti' || libraryFilter === 'inscadenza') {
 
      if (prog.trialStyle) return false;   // le prove non hanno scadenza a calendario
 
      const g = giorniDallaScadenza(prog.endDate);
 
      if (g === null) return false;
 
      return libraryFilter === 'scaduti' ? g > 0 : (g <= 0 && g >= -7);
 
    }
 
 
 
    if (libraryFilter === 'bozze') return !prog.trialStyle && prog.visibility === 'none';
 
    if (libraryFilter === 'assegnati' && (prog.trialStyle || prog.visibility === 'none')) return false;
 
 
 
    // Poi: il filtro per atleta, valido sia su "Tutti" sia su "Assegnati"
 
    if (!libraryFilterAthlete) return true;
 
    if (prog.trialStyle) return false;   // le prove non sono assegnate a nessuno
 
    return prog.assignedAthleteIds?.includes(libraryFilterAthlete);
 
  });
 
 
 
  const attivi = programLibrary.filter((p: any) => !p.isDeleted);
 
  const contaAssegnati = attivi.filter((p: any) => !p.trialStyle && p.visibility !== 'none').length;
 
  const contaBozze = attivi.filter((p: any) => !p.trialStyle && p.visibility === 'none').length;
 
  const contaProve = attivi.filter((p: any) => !!p.trialStyle).length;
 
  const contaScaduti = attivi.filter((p: any) => {
 
    if (p.trialStyle) return false;
 
    const g = giorniDallaScadenza(p.endDate);
 
    return g !== null && g > 0;
 
  }).length;
 
  const contaInScadenza = attivi.filter((p: any) => {
 
    if (p.trialStyle) return false;
 
    const g = giorniDallaScadenza(p.endDate);
 
    return g !== null && g <= 0 && g >= -7;
 
  }).length;
 
 
 
  const contaCestino = programLibrary.filter((p: any) => p.isDeleted).length;
 
 
 
  return (
 
    <div style={{ background: 'var(--bg-18181b)', colorScheme: 'var(--cs)', backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.035) 0%, transparent 55%), radial-gradient(circle at 80% 100%, rgba(255,255,255,0.025) 0%, transparent 55%)', color: '#fff', minHeight: '100vh', padding: '24px 24px 88px 24px', paddingTop: timerRidotto ? '86px' : '24px', fontFamily: 'sans-serif', width: '100%', boxSizing: 'border-box' }}>
 
      <style>{`
 
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&display=swap');
 
        button { transition: background-color .16s ease, color .16s ease, border-color .16s ease, transform .1s ease; }
 
        button:active { transform: scale(0.97); }
 
        input, select, textarea { transition: border-color .16s ease, box-shadow .16s ease; }
 
        input:focus, select:focus, textarea:focus { outline: none; border-color: var(--bd-10b981) !important; box-shadow: 0 0 0 3px rgba(var(--acc-rgb), 0.18); }
 
        ::-webkit-scrollbar { width: 8px; height: 8px; }
 
        ::-webkit-scrollbar-thumb { background: var(--bg-3f3f46); border-radius: 8px; }
 
        ::-webkit-scrollbar-track { background: transparent; }
 
      `}</style>
 
 
 
      {dupBlock && (() => {
 
        const sedute = seduteDelProgramma(dupBlock.contesto);
 
        const corrente = `${dupBlock.wIdx}_${dupBlock.dIdx}`;
 
        return (
 
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 3000 }}>
 
            <div style={{ background: 'var(--bg-ffffff)', color: 'var(--fg-000000)', borderRadius: '12px', maxWidth: '480px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
 
              <div style={{ padding: '18px 20px 12px 20px', borderBottom: '1px solid var(--bd-e2e8f0)' }}>
 
                <h3 style={{ margin: 0, color: 'var(--fg-10b981)', fontSize: '17px' }}>Duplica esercizio</h3>
 
                <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--fg-64748b)', lineHeight: 1.45 }}>
 
                  <strong style={{ color: 'var(--fg-334155)' }}>{dupBlock.nome || 'Esercizio senza nome'}</strong><br />
 
                  Senza selezionare nulla viene duplicato qui sotto, nella seduta corrente. Oppure scegli in quali altre sedute copiarlo.
 
                </p>
 
              </div>
 
 
 
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
 
                {sedute.map((s: any) => {
 
                  const scelta = dupTargets.includes(s.chiave);
 
                  const isCorrente = s.chiave === corrente;
 
                  return (
 
                    <button
 
                      key={s.chiave}
 
                      type="button"
 
                      onClick={() => setDupTargets(scelta ? dupTargets.filter((k) => k !== s.chiave) : [...dupTargets, s.chiave])}
 
                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', padding: '11px 12px', marginBottom: '7px', borderRadius: '999px', cursor: 'pointer', background: scelta ? 'var(--bg-ecfdf5)' : 'var(--bg-f8fafc)', border: scelta ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-e2e8f0)' }}
 
                    >
 
                      <span style={{ width: '20px', height: '20px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: scelta ? 'var(--onacc)' : '#fff', background: scelta ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)' }}>
 
                        {scelta ? '\u2713' : ''}
 
                      </span>
 
                      <span style={{ flex: 1, minWidth: 0 }}>
 
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-334155)', overflowWrap: 'anywhere' }}>
 
                          {s.etichetta}{isCorrente ? ' (seduta corrente)' : ''}
 
                        </span>
 
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--fg-64748b)' }}>
 
                          {s.quanti === 0 ? 'nessun esercizio' : s.quanti === 1 ? '1 esercizio' : `${s.quanti} esercizi`}
 
                        </span>
 
                      </span>
 
                    </button>
 
                  );
 
                })}
 
              </div>
 
 
 
              <div style={{ padding: '12px 20px 18px 20px', borderTop: '1px solid var(--bd-e2e8f0)', display: 'flex', gap: '8px' }}>
 
                <button type="button" onClick={confermaDuplica} style={{ flex: 1, minWidth: 0, padding: '13px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
 
                  {dupTargets.length === 0 ? 'Duplica qui' : `Duplica in ${dupTargets.length} sedute`}
 
                </button>
 
                <button type="button" onClick={() => { setDupBlock(null); setDupTargets([]); }} style={{ padding: '13px 18px', borderRadius: '999px', border: 'none', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
 
                  Annulla
 
                </button>
 
              </div>
 
            </div>
 
          </div>
 
        );
 
      })()}
 
 
 
      {messaggio && (
 
        <div
 
          style={{
 
            position: 'fixed', top: 'calc(14px + env(safe-area-inset-top, 0px))',
 
            left: '50%', transform: 'translateX(-50%)', zIndex: 6000,
 
            display: 'flex', alignItems: 'center', gap: '9px',
 
            background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)',
 
            color: 'var(--onacc)', padding: '12px 20px', borderRadius: '999px',
 
            fontSize: '13.5px', fontWeight: 'bold',
 
            boxShadow: '0 8px 22px rgba(0,0,0,0.45)',
 
            maxWidth: 'calc(100% - 28px)', boxSizing: 'border-box',
 
          }}
 
        >
 
          <Icona nome="spunta" size={16} /> {messaggio}
 
        </div>
 
      )}
 
 
 
      {scoreAperto && (
        scoreAperto.blk?.type === 'superserie' ? (
 
          <FinestraSuperserie
 
            blk={scoreAperto.blk}
 
            dato={scoreAperto.athleteId ? coachAllResults[scoreAperto.progId]?.[scoreAperto.athleteId]?.[scoreAperto.key] : athleteResults[scoreAperto.progId]?.[scoreAperto.key]}
 
            onClose={() => setScoreAperto(null)}
 
            onSalva={(riep: string, note: string, valori: string) => {
 
              const perAtleta = scoreAperto.athleteId;
 
              handleResultChange(scoreAperto.progId, scoreAperto.key, { score: riep, notes: note, items: valori }, undefined, perAtleta);
 
              setScoreAperto(null);
 
            }}
 
          />
 
        ) : (
 
 
        <FinestraScore
 
          blk={scoreAperto.blk}
 
          valore={(scoreAperto.athleteId ? coachAllResults[scoreAperto.progId]?.[scoreAperto.athleteId]?.[scoreAperto.key] : athleteResults[scoreAperto.progId]?.[scoreAperto.key])?.score}
 
          note={(scoreAperto.athleteId ? coachAllResults[scoreAperto.progId]?.[scoreAperto.athleteId]?.[scoreAperto.key] : athleteResults[scoreAperto.progId]?.[scoreAperto.key])?.notes}
 
          onClose={() => setScoreAperto(null)}
 
          onSalva={(carico: string, note: string) => {
 
            const perAtleta = scoreAperto.athleteId;
 
            handleResultChange(scoreAperto.progId, scoreAperto.key, { score: carico, notes: note }, undefined, perAtleta);
 
            maybeUpdateMaxFromScore(perAtleta || session.user.id, scoreAperto.blk?.name, scoreAperto.blk?.reps, carico, !!perAtleta, scoreAperto.blk?.type, scoreAperto.lvl);
 
            setScoreAperto(null);
 
          }}
 
        />
 
      ))}
 
 
 
      {finestraRisultati()}
 
 
 
      {progressiAperti && (
 
        <FinestraProgressi
 
          dati={progressiAperti.dati}
 
          titolo={progressiAperti.titolo}
 
          perAtleta={progressiAperti.perAtleta}
 
          onClose={() => setProgressiAperti(null)}
 
        />
 
      )}
 
 
 
      {timerConfig && (
 
        <WorkoutTimer
 
          config={timerConfig}
 
          onClose={() => { setTimerConfig(null); setTimerRidotto(false); }}
 
          onRidotto={setTimerRidotto}
 
          onSalvaTempi={timerConfig.progId ? (tempi: string) => {
 
            handleResultChange(timerConfig.progId, timerConfig.key, 'score', tempi);
 
            setTimerConfig(null);
 
            setTimerRidotto(false);
 
          } : undefined}
 
        />
 
      )}
 
 
 
      {prBadge && (
 
        <div onClick={() => setPrBadge(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1800 }}>
 
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg, #f59e0b 0%, #d97706 100%)', color: '#101214', borderRadius: '16px', padding: '28px 22px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
 
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🏆</div>
 
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.9, marginBottom: '10px', fontWeight: 'bold' }}>Nuovo record personale</div>
 
            <p style={{ fontSize: '19px', lineHeight: 1.4, margin: '0 0 6px 0', fontWeight: 'bold' }}>
 
              {prBadge.exercise} — {prBadge.headline}
 
            </p>
 
            <p style={{ fontSize: '14px', margin: '0 0 20px 0', opacity: 0.95 }}>{prBadge.subtitle}</p>
 
            <button onClick={() => setPrBadge(null)} style={{ padding: '12px 28px', borderRadius: '999px', background: 'var(--bg-ffffff)', color: '#d97706', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
 
              Grande! 💪
 
            </button>
 
          </div>
 
        </div>
 
      )}
 
 
 
      {dailyQuote && !showConsentGate && (
 
        <div onClick={() => setDailyQuote('')} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1500 }}>
 
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', borderRadius: '16px', padding: '28px 22px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
 
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>💪</div>
 
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.85, marginBottom: '12px', fontWeight: 'bold' }}>AM Training</div>
 
            <p style={{ fontSize: '18px', lineHeight: 1.5, margin: '0 0 22px 0', fontWeight: 'bold', whiteSpace: 'pre-line' }}>{dailyQuote}</p>
 
            <button onClick={() => setDailyQuote('')} style={{ padding: '12px 28px', borderRadius: '999px', background: 'var(--bg-ffffff)', color: 'var(--fg-059669)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>
 
              Ready to start
 
            </button>
 
          </div>
 
        </div>
 
      )}
 
 
 
      {anamnesiPopup && !dailyQuote && !showConsentGate && (
 
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 1600 }}>
 
          <div style={{ background: 'var(--bg-ffffff)', color: 'var(--fg-000000)', borderRadius: '16px', padding: '26px 22px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' }}>
 
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>📋</div>
 
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--fg-059669)' }}>{anamnesiPopup.mancante ? 'Compila la tua anamnesi' : 'Rinnova la tua anamnesi'}</h3>
 
            <p style={{ fontSize: '14px', lineHeight: 1.5, margin: '0 0 20px 0', color: 'var(--fg-334155)', overflowWrap: 'anywhere' }}>
 
              {anamnesiPopup.mancante ? 'Non hai ancora compilato la tua anamnesi. Ci vuole un minuto e permette al coach di costruire programmi adatti a te.' : `Sono passati ${anamnesiPopup.mesi} mesi dall'ultimo aggiornamento della tua anamnesi. Se è cambiato qualcosa, aggiornala: il coach potrà adattare meglio i tuoi programmi.`}
 
            </p>
 
            <button onClick={() => chiudiPopupAnamnesi(true)} style={{ width: '100%', padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginBottom: '8px' }}>
 
              {anamnesiPopup.mancante ? 'Compila anamnesi' : 'Aggiorna anamnesi'}
 
            </button>
 
            <button onClick={() => chiudiPopupAnamnesi(false)} style={{ width: '100%', padding: '11px', borderRadius: '999px', background: 'var(--bg-ffffff)', color: 'var(--fg-475569)', fontWeight: 'bold', border: '1px solid var(--bd-cbd5e1)', cursor: 'pointer', fontSize: '14px' }}>
 
              {anamnesiPopup.mancante ? 'Più tardi' : 'Non è cambiato nulla'}
 
            </button>
 
          </div>
 
        </div>
 
      )}
 
      {showConsentGate && (
 
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 2000 }}>
 
          <div style={{ background: 'var(--bg-ffffff)', color: 'var(--fg-000000)', borderRadius: '12px', padding: '20px', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
 
            <h3 style={{ marginTop: 0, color: 'var(--fg-10b981)' }}>
 
              {privacyConsentAt ? 'Informativa privacy aggiornata' : 'Trattamento dei dati personali'}
 
            </h3>
 
            <p style={{ fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.5 }}>
 
              {privacyConsentAt
 
                ? 'L\u2019informativa sul trattamento dei dati personali è stata aggiornata: è cambiato anche uno dei fornitori che trattano i tuoi dati. Rileggila e conferma il consenso per continuare a usare l\u2019app.'
 
                : 'L\u2019app raccoglie anche dati relativi alla tua salute (peso, altezza, problematiche fisiche): la legge richiede per questi un tuo consenso esplicito. Leggi l\u2019informativa e conferma per proseguire.'}
 
            </p>
 
            <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '12px', maxHeight: '35vh', overflowY: 'auto', marginBottom: '14px' }}>
 
              <PrivacyPolicyContent minor={isMinorenne(personalData.birth_date)} />
 
            </div>
 
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.4, marginBottom: '14px' }}>
 
              <input type="checkbox" checked={consentGateChecked} onChange={(e) => setConsentGateChecked(e.target.checked)} style={{ marginTop: '3px', flexShrink: 0 }} />
 
              <span>Ho letto l&apos;informativa e acconsento al trattamento dei miei dati personali, inclusi i dati relativi allo stato di salute, per la programmazione degli allenamenti.</span>
 
            </label>
 
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
 
              <button
 
                onClick={acceptPrivacyConsent}
 
                disabled={!consentGateChecked || consentSaving}
 
                style={{ flex: 1, minWidth: '140px', padding: '12px', borderRadius: '999px', background: consentGateChecked ? 'var(--bg-10b981)' : 'var(--bg-cbd5e1)', color: consentGateChecked ? 'var(--onacc)' : '#fff', fontWeight: 'bold', border: 'none', cursor: consentGateChecked ? 'pointer' : 'not-allowed', fontSize: '14px' }}
 
              >
 
                {consentSaving ? 'Salvataggio...' : 'Accetto e continuo'}
 
              </button>
 
              <button onClick={handleLogout} style={{ flex: 1, minWidth: '140px', padding: '12px', borderRadius: '999px', background: 'var(--bg-fef2f2)', color: 'var(--fg-b91c1c)', fontWeight: 'bold', border: '1px solid var(--bd-fca5a5)', cursor: 'pointer', fontSize: '14px' }}>
 
                Esci
 
              </button>
 
            </div>
 
          </div>
 
        </div>
 
      )}
 
 
 
      {mostraTemi && <FinestraTemi tema={tema} onScegli={scegliTema} onClose={() => setMostraTemi(false)} />}
 
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--bd-2e2e33)', paddingBottom: '12px' }}>
 
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: '1 1 0' }}>
 
          <a
 
            href={SITO_NEGOZIO}
 
            target="_blank"
 
            rel="noopener noreferrer"
 
            title="Vai alle programmazioni"
 
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0, cursor: 'pointer' }}
 
          >
 
            <AmtLogo style={{ width: '40px', height: 'auto', color: '#ffffff', flexShrink: 0 }} />
 
          </a>
 
          <div style={{ minWidth: 0 }}>
 
            <h2 style={{ fontSize: 'clamp(16px, 5.2vw, 22px)', color: 'var(--fg-10b981)', margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: '1.5px', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>AMTraining</h2>
 
            <span style={{ fontSize: '11px', color: 'var(--fg-71717a)', display: 'block', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
 
              {(personalData.full_name || session.user.email || '').trim()}{role === 'coach' ? ' · coach' : ''}
 
            </span>
 
          </div>
 
        </div>
 
 
 
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
 
          <button
 
            onClick={() => setMostraTemi(true)}
 
            title="Tema dell'app"
 
            style={{
 
              background: 'var(--bg-2e2e33)',
 
              border: '1px solid var(--bd-3f3f46)',
 
              color: '#fff',
 
              width: '38px',
 
              height: '38px',
 
              borderRadius: '999px',
 
              cursor: 'pointer',
 
              display: 'flex',
 
              alignItems: 'center',
 
              justifyContent: 'center',
 
              flexShrink: 0,
 
            }}
 
          >
 
            <Icona nome="tavolozza" size={18} />
 
          </button>
 
          <button
 
            onClick={() => { preparaAudio(); if (timerConfig) return; setTimerConfig({ tipo: 'scelta' }); }}
 
            title={timerConfig ? 'Timer in corso' : 'Timer'}
 
            style={{
 
              background: timerConfig ? 'var(--bg-064e3b)' : 'var(--bg-2e2e33)',
 
              border: `1px solid ${timerConfig ? 'var(--bd-10b981)' : 'var(--bd-3f3f46)'}`,
 
              color: timerConfig ? '#6ee7b7' : '#fff',
 
              width: '38px',
 
              height: '38px',
 
              borderRadius: '999px',
 
              cursor: timerConfig ? 'default' : 'pointer',
 
              display: 'flex',
 
              alignItems: 'center',
 
              justifyContent: 'center',
 
              flexShrink: 0,
 
            }}
 
          >
 
            <Icona nome="timer" size={19} />
 
          </button>
 
          <div style={{ position: 'relative' }}>
 
            <button
 
              onClick={() => setShowNotifications(prev => !prev)}
 
              title="Notifiche"
 
              style={{
 
                position: 'relative',
 
                background: 'var(--bg-2e2e33)',
 
                border: '1px solid var(--bd-3f3f46)',
 
                color: '#fff',
 
                width: '38px',
 
                height: '38px',
 
                borderRadius: '999px',
 
                cursor: 'pointer',
 
                display: 'flex',
 
                alignItems: 'center',
 
                justifyContent: 'center',
 
                flexShrink: 0,
 
              }}
 
            >
 
              <Icona nome="campana" size={19} />
 
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
 
                  border: '2px solid var(--bd-18181b)'
 
                }}>
 
                  {notifications.filter(n => !n.is_read).length}
 
                </span>
 
              )}
 
            </button>
 
 
 
            {showNotifications && (
 
              <div
 
                onClick={() => setShowNotifications(false)}
 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
 
              />
 
            )}
 
 
 
            {showNotifications && (
 
              <div onClick={(e) => e.stopPropagation()} style={{
 
                position: 'fixed',
 
                top: '72px',
 
                right: '12px',
 
                width: 'min(360px, calc(100vw - 24px))',
 
                maxHeight: 'min(70vh, 480px)',
 
                overflowY: 'auto',
 
                background: 'var(--bg-ffffff)',
 
                color: 'var(--fg-000000)',
 
                borderRadius: '14px',
 
                border: '1px solid var(--bd-cbd5e1)',
 
                boxShadow: '0 16px 40px rgba(0,0,0,0.30)',
 
                zIndex: 9999,
 
                boxSizing: 'border-box'
 
              }}>
 
                <div style={{
 
                  padding: '12px 14px',
 
                  borderBottom: '1px solid var(--bd-e2e8f0)',
 
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
 
                        color: 'var(--fg-2563eb)',
 
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
 
                          color: 'var(--fg-10b981)',
 
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
 
                  <div style={{ padding: '10px 14px', background: 'var(--bg-fef2f2)', color: 'var(--fg-b91c1c)', fontSize: '11px', borderBottom: '1px solid var(--bd-fecaca)', lineHeight: 1.4 }}>
 
                    Errore notifiche: {notificationError}
 
                  </div>
 
                )}
 
 
 
                {notifications.length === 0 ? (
 
                  <div style={{ padding: '24px 14px', color: 'var(--fg-64748b)', textAlign: 'center', fontSize: '13px' }}>
 
                    Nessuna notifica.
 
                  </div>
 
                ) : (
 
                  notifications.map(notification => (
 
                    <div
 
  key={notification.id}
 
  onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
 
  style={{
 
    padding: '12px 14px',
 
    borderBottom: '1px solid var(--bd-f1f5f9)',
 
    background: notification.is_read ? 'var(--bg-ffffff)' : 'var(--bg-ecfdf5)',
 
    cursor: notification.is_read ? 'default' : 'pointer',
 
    position: 'relative',
 
    paddingRight: '42px'
 
  }}
 
>
 
                      <div style={{
 
                        fontWeight: 'bold',
 
                        fontSize: '13px',
 
                        color: notification.is_read ? 'var(--fg-334155)' : 'var(--fg-047857)',
 
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
 
    color: 'var(--fg-94a3b8)'
 
  }}
 
>
 
  🗑️
 
</button>
 
                      <div style={{ fontSize: '12px', color: 'var(--fg-475569)', lineHeight: 1.4 }}>
 
                        {notification.message}
 
                      </div>
 
                      {notification.created_at && (
 
                        <div style={{ fontSize: '10px', color: 'var(--fg-94a3b8)', marginTop: '5px' }}>
 
                          {new Date(notification.created_at).toLocaleString('it-IT')}
 
                        </div>
 
                      )}
 
                    </div>
 
                  ))
 
                )}
 
              </div>
 
            )}
 
          </div>
 
 
 
          <button onClick={handleLogout} style={{ background: '#3a1f24', border: '1px solid var(--bd-7f1d1d)', color: '#fca5a5', padding: '8px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>Esci</button>
 
        </div>
 
      </header>
 
 
 
      {role === 'coach' ? (
 
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
 
 
 
          {coachSubView === 'banner' ? (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
              <h3 style={{ fontSize: '18px', color: 'var(--fg-10b981)', marginBottom: '16px' }}>Gestione Banner Pubblicitario</h3>
 
              <form onSubmit={saveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
                <div>
 
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-334155)', display: 'block', marginBottom: '6px' }}>Carica Nuova Immagine Banner:</label>
 
                  <input type="file" accept="image/*" onChange={(e) => { if (e.target.files && e.target.files[0]) setBannerImageFile(e.target.files[0]); }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '8px', fontSize: '13px', color: 'var(--fg-000000)' }} />
 
                </div>
 
                {bannerData.image_url && !bannerImageFile && (
 
                  <div>
 
                    <span style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Immagine attuale:</span>
 
                    <img src={bannerData.image_url} alt="Current Banner" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', objectFit: 'cover' }} />
 
                  </div>
 
                )}
 
                <div>
 
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-334155)', display: 'block', marginBottom: '6px' }}>Link di destinazione:</label>
 
                  <input type="url" placeholder="https://tuosito.com" value={bannerData.link_url} onChange={(e) => setBannerData({ ...bannerData, link_url: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '8px', fontSize: '13px', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
                </div>
 
                <button type="submit" disabled={bannerSaving} style={{ padding: '12px', background: 'var(--bg-10b981)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '10px' }}>
 
                  {bannerSaving ? 'Salvataggio in corso...' : 'Salva Banner'}
 
                </button>
 
              </form>
 
 
 
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '2px solid var(--bd-e2e8f0)' }}>
 
                <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>🔗 Invito ad abbonarsi</h4>
 
                <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
 
                  Compare solo agli atleti con abbonamento scaduto, al posto delle schede. Chi è attivo non lo vede mai.
 
                </p>
 
                <div style={{ marginBottom: '10px' }}>
 
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-334155)', display: 'block', marginBottom: '4px' }}>Messaggio</label>
 
                  <textarea
 
                    rows={5}
 
                    placeholder={'Scrivi qui il messaggio.\nVai a capo dove vuoi: le righe verranno rispettate.'}
 
                    value={trialCta.text}
 
                    onChange={(e) => setTrialCta({ ...trialCta, text: e.target.value })}
 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }}
 
                  />
 
                </div>
 
                <div style={{ marginBottom: '12px' }}>
 
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-334155)', display: 'block', marginBottom: '4px' }}>Link al tuo sito</label>
 
                  <input
 
                    type="url"
 
                    placeholder="https://tuosito.com/programmazioni"
 
                    value={trialCta.link_url}
 
                    onChange={(e) => setTrialCta({ ...trialCta, link_url: e.target.value })}
 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }}
 
                  />
 
                </div>
 
                <button type="button" onClick={saveTrialCta} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: 'var(--bg-10b981)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
 
                  Salva invito
 
                </button>
 
              </div>
 
            </div>
 
          ) : coachSubView === 'athletes' ? (
 
            <div>
 
              {selectedCoachAthlete ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 
                    <h3 style={{ fontSize: '18px', color: 'var(--fg-10b981)', margin: 0, flex: '1 1 auto', minWidth: 0, overflowWrap: 'anywhere' }}>{selectedCoachAthlete.full_name || selectedCoachAthlete.email}</h3>
 
                    <button onClick={() => setSelectedCoachAthlete(null)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>Indietro</button>
 
                  </div>
 
 
 
                  <CompetitionCountdown gare={coachCompetitions[selectedCoachAthlete.id] || []} perCoach />
 
 
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
 
                    <button onClick={() => setCoachAthleteDetailTab('anagrafici')} style={{ ...pillola(coachAthleteDetailTab === 'anagrafici', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto', minWidth: 0 }}>Dati anagrafici</button>
 
                    <button onClick={() => setCoachAthleteDetailTab('anamnesi')} style={{ ...pillola(coachAthleteDetailTab === 'anamnesi', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto', minWidth: 0 }}>Anamnesi</button>
 
                    <button onClick={() => setCoachAthleteDetailTab('abbonamento')} style={{ ...pillola(coachAthleteDetailTab === 'abbonamento', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto', minWidth: 0 }}>Abbonamento</button>
 
                  </div>
 
 
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
 
                    <button onClick={() => setCoachAthleteDetailTab('maxes')} style={{ ...pillola(coachAthleteDetailTab === 'maxes', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto', minWidth: 0 }}>🏋🏻 Massimali</button>
 
                    <button onClick={() => setCoachAthleteDetailTab('gare')} style={{ ...pillola(coachAthleteDetailTab === 'gare', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto', minWidth: 0 }}>🎯 Gare</button>
 
                    <button onClick={() => setCoachAthleteDetailTab('progressi')} style={{ ...pillola(coachAthleteDetailTab === 'progressi', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto', minWidth: 0 }}>🚀 Percorso</button>
 
                  </div>
 
 
 
                  <button
 
                    onClick={() => setCoachAthleteDetailTab('personal')}
 
                    style={{ ...pillola(coachAthleteDetailTab === 'personal', '#2563eb', 'grande'), width: '100%', boxSizing: 'border-box', marginBottom: '16px' }}
 
                  >
 
                    📝 Personal
 
                  </button>
 
 
 
                  {coachAthleteDetailTab === 'anagrafici' && (() => {
 
                    const athData = coachAllPersonalData[selectedCoachAthlete.id] || emptyPersonalData;
 
                    const updateField = (field: string, value: string) => {
 
                      setCoachAllPersonalData({
 
                        ...coachAllPersonalData,
 
                        [selectedCoachAthlete.id]: { ...athData, [field]: value }
 
                      });
 
                    };
 
                    return (
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Nome e Cognome</label>
 
                          <input type="text" value={athData.full_name} onChange={(e) => updateField('full_name', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Email</label>
 
                          <input type="text" value={selectedCoachAthlete.email || ''} disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)', background: 'var(--bg-f1f5f9)', color: 'var(--fg-64748b)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
 
                          <input type="date" value={athData.birth_date} onChange={(e) => updateField('birth_date', e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        {isMinorenne(athData.birth_date) && (
 
                          <div style={{ background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '8px', padding: '12px' }}>
 
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-92400e)', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
 
                            <input type="text" placeholder="Nome e cognome" value={athData.guardian_name || ''} onChange={(e) => updateField('guardian_name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          </div>
 
                        )}
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Sesso</label>
 
                          <div style={{ display: 'flex', gap: '8px' }}>
 
                            {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                              <button key={k} type="button" onClick={() => updateField('gender', k)} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: athData.gender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: athData.gender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                            ))}
 
                          </div>
 
                        </div>
 
                        <div style={{ display: 'flex', gap: '12px' }}>
 
                          <div style={{ flex: 1 }}>
 
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Peso (kg)</label>
 
                            <input type="number" step="0.1" min="0" value={athData.weight} onChange={(e) => updateField('weight', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                          </div>
 
                          <div style={{ flex: 1 }}>
 
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Altezza (cm)</label>
 
                            <input type="number" step="0.1" min="0" value={athData.height} onChange={(e) => updateField('height', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                          </div>
 
                        </div>
 
                        <button
 
                          disabled={personalDataSaving}
 
                          onClick={() => savePersonalData(selectedCoachAthlete.id, athData, true)}
 
                          style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: personalDataSaving ? 0.6 : 1 }}
 
                        >
 
                          {personalDataSaving ? 'Salvataggio...' : 'Salva Dati Anagrafici'}
 
                        </button>
 
                      </div>
 
                    );
 
                  })()}
 
 
 
                  {coachAthleteDetailTab === 'gare' && pannelloCompetizioni(selectedCoachAthlete.id, coachCompetitions[selectedCoachAthlete.id] || [], true)}
 
 
 
                  {coachAthleteDetailTab === 'progressi' && pannelloProgressi(storicoCarichiCoach[selectedCoachAthlete.id] || [], false, selectedCoachAthlete.id)}
 
 
 
                  {coachAthleteDetailTab === 'personal' && (() => {
 
                const selAthlete = athletes.find((a: any) => a.id === selectedCoachAthlete.id);
 
                const athletePersonalPrograms = programLibrary.filter(
 
                  (p: any) => !p.isDeleted && p.assignedAthleteIds?.includes(selectedCoachAthlete.id)
 
                );
 
 
 
                return (
 
                  <div>
 
 
 
                    {athletePersonalPrograms.length === 0 ? (
 
                      <div style={{ background: 'var(--bg-ffffff)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)', textAlign: 'center' }}>
 
                        <p style={{ color: 'var(--fg-64748b)' }}>Nessuna scheda assegnata a questo atleta.</p>
 
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
 
                          <div key={prog.id} style={{ background: 'var(--bg-ffffff)', color: 'var(--fg-000000)', boxShadow: '0 6px 22px rgba(0,0,0,0.45)', padding: '20px', borderRadius: '16px', border: '1px solid var(--bd-d8dde3)', marginBottom: '20px' }}>
 
                            <div
 
                              onClick={() => setPersonalExpandedProgramId(personalExpandedProgramId === prog.id ? null : prog.id)}
 
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: personalExpandedProgramId === prog.id ? '12px' : '0' }}
 
                            >
 
                              <h4 style={{ overflowWrap: 'anywhere', margin: 0, color: 'var(--fg-10b981)', fontSize: '18px' }}>{prog.title}</h4>
 
                              <span style={{ fontSize: '18px', color: 'var(--fg-10b981)', fontWeight: 'bold' }}>{personalExpandedProgramId === prog.id ? '▲' : '▼'}</span>
 
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
 
                                  style={{ padding: '6px 12px', borderRadius: '999px', border: 'none', background: activeWeekName === w.weekName ? '#0284c7' : 'var(--bg-e2e8f0)', color: activeWeekName === w.weekName ? '#fff' : 'var(--fg-000000)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
 
                                >
 
                                  {w.weekName}
 
                                </button>
 
                              ))}
 
                            </div>
 
 
 
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px', paddingBottom: '4px' }}>
 
                              {activeWeekObj?.days?.map((day: any, idx: number) => {
 
const wR = weeks.findIndex((w: any) => w.weekName === activeWeekName);
 
const tuttiBlocchi = day.blocks || [];
 
const fattiG = tuttiBlocchi.filter((_b: any, bi: number) => {
 
const r = coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[`${wR}_${idx}_${bi}`];
 
return r && (String(r.score || '').trim() || String(r.notes || '').trim() || r.done);
 
}).length;
 
const totaleG = tuttiBlocchi.length;
 
const completoG = totaleG > 0 && fattiG === totaleG;
 
const attivoG = activeDayName === day.dayName;
 
return (
 
                                <button
 
                                  key={day.dayName}
 
                                  onClick={() => setCoachSelectedDay(prev => ({ ...prev, [prog.id]: day.dayName }))}
 
                                  style={{ ...pillola(activeDayName === day.dayName, 'var(--fg-10b981)', 'piccolo') }}
 
                                >
 
                                  {day.dayName}
 
{totaleG > 0 && (
 
<span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '19px', height: '19px', borderRadius: '999px', padding: '0 5px', fontSize: '10px', fontWeight: 'bold', background: completoG ? (attivoG ? 'rgba(var(--onacc-rgb), 0.2)' : 'var(--bg-10b981)') : fattiG > 0 ? (attivoG ? 'rgba(var(--onacc-rgb), 0.2)' : '#fcd34d') : (attivoG ? 'rgba(var(--onacc-rgb), 0.2)' : 'var(--bg-cbd5e1)'), color: attivoG || completoG ? 'var(--onacc)' : fattiG > 0 ? '#101214' : 'var(--fg-334155)' }}>
 
{completoG ? <Icona nome="spunta" size={11} /> : `${fattiG}/${totaleG}`}
 
</span>
 
)}
 
                                </button>
 
);
 
})}
 
                            </div>
 
 
 
{(() => {
 
const chiaveGiorno = `g|${prog.id}|${activeWeekObj?.weekName}|${activeDayObj?.dayName}`;
 
const giornoAperto = coachAperti[chiaveGiorno] !== false;
 
return (
 
<div style={{ background: 'var(--bg-eef2f7)', padding: '14px', borderRadius: '12px', border: '1px solid var(--bd-dbe3ec)', boxShadow: 'inset 0 2px 5px rgba(15,23,42,0.07)', marginBottom: '14px' }}>
 
<div onClick={() => setCoachAperti(prev => ({ ...prev, [chiaveGiorno]: !giornoAperto }))} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: giornoAperto ? '12px' : '0', cursor: 'pointer' }}>
 
<span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-141416)' }}>{activeWeekObj?.weekName} - {activeDayObj?.dayName}</span>
 
<button type="button" onClick={(e) => { e.stopPropagation(); setCoachAperti(prev => ({ ...prev, [chiaveGiorno]: !giornoAperto })); }} title={giornoAperto ? 'Chiudi' : 'Apri'} style={{ background: 'transparent', border: 'none', color: 'var(--fg-10b981)', padding: '4px 6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', lineHeight: 1, flexShrink: 0 }}>{giornoAperto ? '\u25B2' : '\u25BC'}</button>
 
</div>
 
{giornoAperto && (
 
<div>
 
                            {(!activeDayObj || !activeDayObj.blocks || activeDayObj.blocks.length === 0) ? (
 
                              <p style={{ color: 'var(--fg-64748b)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>Nessun esercizio in questo giorno.</p>
 
                            ) : (
 
                              activeDayObj.blocks.map((blk: any, bIdx: number) => {
 
const chiaveRapida = `${prog.id}|${activeWeekObj?.weekName}|${activeDayObj?.dayName}|${bIdx}`;
 
const chiaveBlocco = `b|${chiaveRapida}`;
 
const bloccoAperto = !!coachAperti[chiaveBlocco];
 
                                const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
 
                                const currentScore = coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.score || '';
 
                                const currentNotes = coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.notes || '';
 
 
 
                                return (
 
                                  <div key={bIdx} style={{ background: 'var(--bg-ffffff)', padding: '14px', borderRadius: '10px', marginBottom: '10px', border: '1px solid var(--bd-e6ebf2)', boxShadow: '0 2px 6px rgba(15,23,42,0.09)' }}>
 
<div onClick={() => setCoachAperti(prev => ({ ...prev, [chiaveBlocco]: !bloccoAperto }))} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: bloccoAperto ? '8px' : '0', cursor: 'pointer' }}>
 
<div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--fg-10b981)', overflowWrap: 'anywhere', minWidth: 0 }}>{blk.name || (haElenco(blk.type) ? nomeElenco(blk.type) : `Esercizio ${bIdx + 1}`)}</div>
 
<div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
 
{(blk.type === 'wod' || blk.type === 'test') && (
 
<button
 
type="button"
 
onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'scelta' }); }}
 
style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', padding: '7px 13px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(var(--acc-rgb), 0.35)' }}
 
>
 
<Icona nome="timer" size={13} /> Timer
 
</button>
 
)}
 
{blk.videoUrl && (
 
<a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '7px 13px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
 
<Icona nome="video" size={13} /> Video
 
</a>
 
)}
 
<button type="button" onClick={(e) => { e.stopPropagation(); setCoachAperti(prev => ({ ...prev, [chiaveBlocco]: !bloccoAperto })); }} style={{ background: 'var(--bg-f1f5f9)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', padding: '4px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{bloccoAperto ? '\u25B2' : '\u25BC'}</button>
 
</div>
 
</div>
 
{bloccoAperto && (
 
<div>
 
 
 
 
                                    {haElenco(blk.type) ? (
 
                                      <div style={{ background: blk.type === 'superserie' ? 'var(--bg-ffffff)' : 'var(--bg-fffbeb)', border: blk.type === 'superserie' ? '1px solid var(--bd-e2e8f0)' : '1px solid var(--bd-fde68a)', borderRadius: '10px', padding: '12px' }}>
 
                                        {(parseInt(String(blk.rounds || ''), 10) || 1) > 1 && (
 
                                          <span style={{ display: 'inline-block', background: blk.type === 'superserie' ? '#c2410c' : '#f59e0b', color: blk.type === 'superserie' ? '#fff' : '#101214', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '999px', marginBottom: '9px' }}>
 
                                            {parseInt(String(blk.rounds), 10)} round
 
                                          </span>
 
                                        )}
 
                                        {(blk.items || []).length === 0 && (
 
                                          <span style={{ fontSize: '12px', color: blk.type === 'superserie' ? 'var(--fg-64748b)' : 'var(--fg-a16207)' }}>Nessun esercizio inserito.</span>
 
                                        )}
 
                                        {(blk.items || []).map((it: any, i: number) => (
 
                                          <React.Fragment key={i}>
 
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 26px 26px', alignItems: 'center', columnGap: '8px', padding: '7px 0', borderBottom: 'none' }}>
 
                                            <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: blk.type === 'superserie' ? 'var(--fg-334155)' : 'var(--fg-78350f)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                              {it.name}
 
                                              {String(it.load || '').trim() ? (() => {
 
                                                const suggerito = computeLoadHint(it.load, it.value, trovaMaxes(coachAthleteMaxes[selectedCoachAthlete.id], it.name));
 
                                                return (
 
                                                  <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 'normal', color: 'var(--fg-64748b)', marginTop: '2px' }}>
 
                                                    {it.load}
 
                                                    {suggerito ? <span style={{ color: 'var(--fg-1d4ed8)', fontWeight: 'bold' }}>{` \u00b7 ${suggerito}`}</span> : null}
 
                                                  </span>
 
                                                );
 
                                              })() : null}
 
                                            </span>
 
 
 
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: blk.type === 'superserie' ? 'var(--fg-475569)' : 'var(--fg-b45309)', overflowWrap: 'anywhere', maxWidth: '110px', textAlign: 'right' }}>
 
                                              {it.value}
 
                                            </span>
 
 
 
                                            <span style={{ display: 'flex', justifyContent: 'center' }}>
 
                                              {it.videoUrl && (
 
                                                <a
 
                                                  href={it.videoUrl}
 
                                                  target="_blank"
 
                                                  rel="noopener noreferrer"
 
                                                  onClick={(e) => e.stopPropagation()}
 
                                                  title="Guarda il video"
 
                                                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '999px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 2px 5px rgba(37,99,235,0.3)' }}
 
                                                >
 
                                                  <Icona nome="video" size={12} />
 
                                                </a>
 
                                              )}
 
                                            </span>
 
 
 
                                            <span style={{ display: 'flex', justifyContent: 'center' }}>
 
                                              {(() => {
 
                                                const sec = tempoDaValore(it.value);
 
                                                if (!sec) return null;
 
                                                return (
 
                                                  <button
 
                                                    onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: sec }); }}
 
                                                    title="Avvia il timer"
 
                                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '999px', border: 'none', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', cursor: 'pointer', boxShadow: '0 2px 5px rgba(var(--acc-rgb), 0.35)' }}
 
                                                  >
 
                                                    <Icona nome="timer" size={14} />
 
                                                  </button>
 
                                                );
 
                                              })()}
 
                                            </span>
 
                                          </div>
 
                                            {i < (blk.items.length - 1) && (() => {
 
                                              const linea = blk.type === 'superserie' ? 'var(--fg-e2e8f0)' : '#fde68a';
 
                                              const secRecEx = String(it.rest || '').trim() ? tempoDaValore(it.rest) : 0;
 
                                              return (
 
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                                                  <span style={{ flex: 1, height: '1px', background: linea }} />
 
                                                  {String(it.rest || '').trim() ? (secRecEx ? (
 
                                                    <button
 
                                                      onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: secRecEx }); }}
 
                                                      title="Avvia questo recupero"
 
                                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${linea}`, background: 'var(--bg-ffffff)', color: 'var(--fg-475569)', fontSize: '10.5px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                    >
 
                                                      <Icona nome="timer" size={11} /> {`rec. ${it.rest}`}
 
                                                    </button>
 
                                                  ) : (
 
                                                    <span style={{ flexShrink: 0, fontSize: '10.5px', color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>{`rec. ${it.rest}`}</span>
 
                                                  )) : null}
 
                                                  <span style={{ flex: 1, height: '1px', background: linea }} />
 
                                                </div>
 
                                              );
 
                                            })()}
 
                                          </React.Fragment>
 
                                        ))}
 
                                        {blk.type !== 'superserie' && (
 
                                        <button
 
                                          onClick={() => handleResultChange(prog.id, resultKey, 'done', coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? '' : 'si', selectedCoachAthlete.id)}
 
                                          style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '9px', padding: '10px', borderRadius: '999px', cursor: 'pointer', marginTop: '10px', border: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-fcd34d)', background: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'var(--bg-ecfdf5)' : 'var(--bg-ffffff)' }}
 
                                        >
 
                                          <span style={{ width: '20px', height: '20px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101214', background: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'var(--bg-10b981)' : '#fde68a' }}>
 
                                            {coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done && <Icona nome="spunta" size={13} />}
 
                                          </span>
 
                                          <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'var(--fg-047857)' : 'var(--fg-92400e)' }}>
 
                                            {coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'Completato' : 'Segna come fatto'}
 
                                          </span>
 
                                        </button>
 
                                        )}
 
 
 
                                        {(() => {
 
                                          const mm = parseInt(String(blk.warmRestMin ?? ''), 10) || 0;
 
                                          const ss = parseInt(String(blk.warmRestSec ?? ''), 10) || 0;
 
                                          const totale = mm * 60 + ss;
 
                                          const grezzo = mmss(totale);
 
                                          const senza = totale <= 0;
 
                                          if (senza) {
 
                                            return (
 
                                              <span style={{ display: 'block', fontSize: '11px', color: blk.type === 'superserie' ? 'var(--fg-64748b)' : 'var(--fg-a16207)', marginTop: '7px', textAlign: 'center' }}>
 
                                                Nessun recupero tra i round
 
                                              </span>
 
                                            );
 
                                          }
 
                                          return (
 
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '9px', marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-fef3c7)', border: '1px solid var(--bd-fcd34d)' }}>
 
                                              <span style={{ fontSize: '12px', color: 'var(--fg-92400e)' }}>
 
                                                Rest tra i round <strong style={{ fontSize: '14px' }}>{grezzo}</strong>
 
                                              </span>
 
                                              <button
 
                                                onClick={() => { preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: totale }); }}
 
                                                title="Avvia il recupero"
 
                                                aria-label="Avvia il recupero"
 
                                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', padding: 0, background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(var(--acc-rgb), 0.35)' }}
 
                                              >
 
                                                <Icona nome="timer" size={16} />
 
                                              </button>
 
                                            </div>
 
                                          );
 
                                        })()}
 
 
 
                                        {blk.notes && (
 
                                          <p style={{ overflowWrap: 'anywhere', margin: '9px 0 0 0', fontSize: '11.5px', color: blk.type === 'superserie' ? 'var(--fg-334155)' : 'var(--fg-78350f)', lineHeight: 1.5, fontStyle: 'italic', background: blk.type === 'superserie' ? 'var(--bg-f8fafc)' : 'var(--bg-fef3c7)', borderRadius: '6px', padding: '8px 10px', whiteSpace: 'pre-line' }}>
 
                                            {blk.notes}
 
                                          </p>
 
                                        )}
 
                                      </div>
 
                                    ) : isMobility(blk.name) ? (
 
                                      <div>
 
                                        {blk.wodNotes && (
 
                                          <div style={{ background: 'var(--bg-f5f3ff)', border: '1px solid var(--bd-ddd6fe)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
 
                                            <p style={{ overflowWrap: 'anywhere', margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{blk.wodNotes}</p>
 
                                          </div>
 
                                        )}
 
                                        <button
 
                                          onClick={() => handleResultChange(prog.id, resultKey, 'done', coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? '' : 'si', selectedCoachAthlete.id)}
 
                                          style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '999px', cursor: 'pointer', marginBottom: '8px', border: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-cbd5e1)', background: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'var(--bg-ecfdf5)' : 'var(--bg-ffffff)' }}
 
                                        >
 
                                          <span style={{ width: '22px', height: '22px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: 'var(--onacc)', background: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)' }}>
 
                                            {coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? '\u2713' : ''}
 
                                          </span>
 
                                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'var(--fg-047857)' : 'var(--fg-334155)' }}>
 
                                            {coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.done ? 'Completata' : 'Segna come fatta'}
 
                                          </span>
 
                                        </button>
 
                                      </div>
 
                                    ) : blk.type === 'test' ? (
 
                                      <div style={{ background: 'var(--bg-eff6ff)', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-bfdbfe)', marginBottom: '8px', textAlign: 'center' }}>
 
                                        <span style={{ fontSize: '16px', color: 'var(--fg-1e3a8a)', display: 'block', fontWeight: 'bold' }}>{blk.name || 'TEST'}</span>
 
                                        <span style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--fg-1e40af)', letterSpacing: '0.5px' }}>
 
                                            {gymPRNames.includes(blk.name) ? 'MAX REP UBK' : metconPRNames.includes(blk.name) ? 'MAX EFFORT' : 'TEST'}
 
                                        </span>
 
                                        {blk.target && <span style={{ overflowWrap: 'anywhere', display: 'block', fontSize: '12px', color: 'var(--fg-1e40af)', marginTop: '4px', fontWeight: 'normal' }}>{blk.target}</span>}
 
                                        {(() => {
 
                                          const bench = BENCHMARK_WODS.find((b) => b.name === blk.name);
 
                                          if (!bench) return null;
 
                                          const lvl = coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
 
                                          return (
 
                                            <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '6px', padding: '10px', marginTop: '8px', textAlign: 'left' }}>
 
                                              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
 
                                                {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                  <button key={k} type="button" onClick={(e) => { e.stopPropagation(); handleResultChange(prog.id, resultKey, 'level', k, selectedCoachAthlete.id); }} style={{ padding: '3px 10px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                ))}
 
                                              </div>
 
                                              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                              <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                            </div>
 
                                          );
 
                                        })()}
 
                                      </div>
 
                                    ) : blk.type === 'forza' ? (
 
                                      <>
 
{modificaRapidaKey === chiaveRapida ? (
 
<>
 
<GrigliaModificaRapida blk={blk} onSalva={(campo: string, v: string) => salvaBloccoRapido(prog.id, activeWeekObj?.weekName, activeDayObj?.dayName, bIdx, { [campo]: v })} />
 
{(prog.assignedAthleteIds || []).length > 1 && (<span style={{ display: 'block', fontSize: '11px', color: 'var(--fg-a16207)', marginBottom: '8px' }}>{`Questo programma è assegnato a ${(prog.assignedAthleteIds || []).length} atleti: la modifica vale per tutti.`}</span>)}
 
</>
 
) : (
 
<>
 
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.sets}</span>
 
                                                      </div>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.reps}</span>
 
                                                      </div>
 
                                                    </div>
 
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.load}</span>
 
                                                      </div>
 
                                                      {(() => {
 
                                                        const secRec = parseRestSeconds(blk.rest);
 
                                                        return (
 
                                                        <div
 
                                                          onClick={() => { preparaAudio(); setTimerConfig(secRec ? { tipo: 'recupero', secondi: secRec } : { tipo: 'recupero', secondi: 90, daImpostare: true }); }}
 
                                                          style={{ background: 'var(--bg-ecfdf5)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-6ee7b7)', cursor: 'pointer' }}
 
                                                        >
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.rest}</span>
 
                                                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--fg-047857)', fontWeight: 'bold', marginTop: '3px' }}>
 
                                                          {secRec ? '⏱️ AVVIA TIMER' : '⏱️ IMPOSTA TIMER'}
 
                                                        </span>
 
                                                        </div>
 
                                                        ); })()}
 
                                                    </div>
 
 
 
 
</>
 
)}
 
<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
 
<button onClick={() => setModificaRapidaKey(modificaRapidaKey === chiaveRapida ? null : chiaveRapida)} style={{ background: modificaRapidaKey === chiaveRapida ? 'var(--bg-10b981)' : 'var(--bg-f1f5f9)', color: modificaRapidaKey === chiaveRapida ? 'var(--onacc)' : 'var(--fg-334155)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{modificaRapidaKey === chiaveRapida ? 'Fatto' : 'Modifica rapida'}</button>
 
</div>
 
                                      {(() => {
 
                                        const hint = computeLoadHint(blk.load, blk.reps, trovaMaxes(coachAthleteMaxes[selectedCoachAthlete.id], blk.name));
 
                                        if (hint) {
 
                                          return (
 
                                            <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '7px 9px', marginTop: '7px' }}>
 
                                              <span style={{ display: 'block', fontSize: '9px', color: 'var(--fg-1e40af)' }}>PESO CONSIGLIATO IN BASE AI SUOI RM</span>
 
                                              <span style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-1d4ed8)' }}>{hint}</span>
 
                                            </div>
 
                                          );
 
                                        }
 
 
 
                                        const usati = ultimoCaricoUsatoPer(selectedCoachAthlete.id, blk.name, blk.reps);
 
                                        if (!usati || usati.length === 0) return null;
 
                                        return (
 
                                          <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '7px 9px', marginTop: '7px' }}>
 
                                            <span style={{ display: 'block', fontSize: '9px', color: 'var(--fg-64748b)', marginBottom: '2px' }}>
 
                                              {usati.length === 1 ? 'L\u2019ULTIMA VOLTA AVEVA USATO' : 'CARICHI GIÀ USATI'}
 
                                            </span>
 
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', flexWrap: 'wrap' }}>
 
                                              <span style={{ fontSize: '13px', fontWeight: 'bold', color: String(usati[0].reps ?? '') === String(blk.reps ?? '') ? 'var(--fg-047857)' : 'var(--fg-334155)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                {usati[0].reps ? `${usati[0].reps} rip. → ` : ''}{mostraCarico(usati[0])}
 
                                              </span>
 
                                              {usati.length > 1 && (
 
                                                <span style={{ fontSize: '10px', color: 'var(--fg-94a3b8)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                  {usati.slice(1).map((u: any) => `${u.reps ? u.reps + ' rip. ' : ''}${mostraCarico(u).replace(' kg', '')}`).join(' · ')}
 
                                                </span>
 
                                              )}
 
                                            </div>
 
                                          </div>
 
                                        );
 
                                      })()}
 
                                      </>
 
                                    ) : (
 
                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '10px' }}>
 
                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</span>
 
                                        <p style={{ overflowWrap: 'anywhere', margin: '2px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
 
                                      </div>
 
                                    )}
 
 
 
                                    {blk.type === 'wod' && (blk.items || []).some((it: any) => it.name && it.videoUrl) && (
 
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '9px', marginBottom: '2px' }}>
 
                                        {(blk.items || []).filter((it: any) => it.name && it.videoUrl).map((it: any, i: number) => (
 
                                          <a
 
                                            key={i}
 
                                            href={it.videoUrl}
 
                                            target="_blank"
 
                                            rel="noopener noreferrer"
 
                                            onClick={(e) => e.stopPropagation()}
 
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '6px 11px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 2px 5px rgba(37,99,235,0.3)' }}
 
                                          >
 
                                            <Icona nome="video" size={12} /> {it.name}
 
                                          </a>
 
                                        ))}
 
                                      </div>
 
                                    )}
 
 
 
                                    {blk.type === 'forza' && blk.notes && (
 
                                      <div style={{ background: 'var(--bg-fffbeb)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-fde68a)', marginBottom: '10px' }}>
 
                                        <span style={{ fontSize: '10px', color: 'var(--fg-92400e)', fontWeight: 'bold', display: 'block' }}>NOTE ESERCIZIO (dal programma)</span>
 
                                        <p style={{ overflowWrap: 'anywhere', margin: '2px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)' }}>{blk.notes}</p>
 
                                      </div>
 
                                    )}
 
 
 
                                    <div style={{ marginTop: '10px', background: 'var(--bg-f1f5f9)', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                      <span style={{ fontSize: '11px', color: 'var(--fg-10b981)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 INSERISCI SCORE / NOTE (Personal):</span>
 
                                      {(blk.type !== 'warmup' && !isMobility(blk.name)) ? (
 
                                        (() => {
 
                                          const dato = coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey];
 
                                          const lvl = dato?.level || blk.benchLevel;
 
                                          return (
 
                                            <>
 
                                              {blk.scoreUnit !== 'spunta' && (
 
                                              <>
 
                                              <button
 
                                                onClick={() => setScoreAperto({ progId: prog.id, key: resultKey, blk, athleteId: selectedCoachAthlete.id, lvl })}
 
                                                style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '9px', padding: '11px', borderRadius: '999px', border: 'none', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 7px rgba(var(--acc-rgb), 0.32)' }}
 
                                              >
 
                                                <Icona nome="modifica" size={14} /> {blk.type === 'forza' && (!blk.scoreUnit || blk.scoreUnit === 'kg') ? 'Inserisci i carichi' : 'Segna il risultato'}
 
                                              </button>
 
                                              <RiepilogoScore
 
                                                punteggio={String(dato?.score || '').trim()}
 
                                                note={String(dato?.notes || '').trim()}
 
                                              />
 
                                              </>
 
                                              )}
 
                                              {blk.scoreUnit === 'spunta' && (<><SpuntaFatta fatto={!!dato?.done} onChange={(v: string) => handleResultChange(prog.id, resultKey, 'done', v, selectedCoachAthlete.id)} /><CampoNote valore={dato?.notes} onSalva={(v: string) => handleResultChange(prog.id, resultKey, 'notes', v, selectedCoachAthlete.id)} /></>)}
 
                                            </>
 
                                          );
 
                                        })()
 
                                      ) : (
 
                                      <div style={{ display: 'grid', gridTemplateColumns: isMobility(blk.name) ? '1fr' : '1fr 2fr', gap: '8px' }}>
 
                                        {!isMobility(blk.name) && blk.type !== 'warmup' && (
 
                                        <div>
 
                                          <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>Score / Carico</label>
 
                                          {(() => {
 
                                            const bench = BENCHMARK_WODS.find((b: any) => b.name === blk.name);
 
                                            const mode = bench ? bench.type
 
                                              : metconPRNames.includes(blk.name) ? 'time'
 
                                              : gymPRNames.includes(blk.name) ? 'reps'
 
                                              : 'text';
 
                                            const lvl = coachAllResults[prog.id]?.[selectedCoachAthlete.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
 
                                            return (
 
                                              <ScoreInput
 
                                                mode={mode}
 
                                                value={currentScore}
 
                                                onChange={(v: string) => handleResultChange(prog.id, resultKey, 'score', v, selectedCoachAthlete.id)}
 
                                                onCommit={(v: string) => maybeUpdateMaxFromScore(selectedCoachAthlete.id, blk.name || '', blk.reps, v, true, blk.type, lvl)}
 
                                              />
 
                                            );
 
                                          })()}
 
                                        </div>
 
                                        )}
 
                                        <div>
 
                                          <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>Note del coach</label>
 
                                          <input type="text" placeholder="Sensazioni, tecnica..." value={currentNotes} onChange={(e) => handleResultChange(prog.id, resultKey, 'notes', e.target.value, selectedCoachAthlete.id)} style={{ width: '100%', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                        </div>
 
                                      </div>
 
                                      )}
 
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
 
})()}
 
                            </>
 
                            )}
 
                          </div>
 
                        );
 
                      })
 
                    )}
 
                  </div>
 
                );
 
                  })()}
 
 
 
 
 
                  {coachAthleteDetailTab === 'maxes' && (
 
                  <div>
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
 
                    <button onClick={() => setCoachMaxSubTab('strength')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: coachMaxSubTab === 'strength' ? '#0284c7' : 'var(--bg-f1f5f9)', color: coachMaxSubTab === 'strength' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Strength PR</button>
 
                    <button onClick={() => setCoachMaxSubTab('metcon')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: coachMaxSubTab === 'metcon' ? '#0284c7' : 'var(--bg-f1f5f9)', color: coachMaxSubTab === 'metcon' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Metcon PR</button>
 
                    <button onClick={() => setCoachMaxSubTab('gym')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: coachMaxSubTab === 'gym' ? '#0284c7' : 'var(--bg-f1f5f9)', color: coachMaxSubTab === 'gym' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Gymnastics PR</button>
 
                  <button onClick={() => setCoachMaxSubTab('bench')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: coachMaxSubTab === 'bench' ? '#0284c7' : 'var(--bg-f1f5f9)', color: coachMaxSubTab === 'bench' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Benchmark</button>
 
                  </div>
 
 
 
                  {coachMaxSubTab === 'strength' && (
 
                  <div>
 
                    <div style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '16px' }}>
 
                      <span style={{ fontSize: '13px', color: 'var(--fg-10b981)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🏋️ Esercizi tracciati nei massimali</span>
 
                      <p style={{ fontSize: '11px', color: 'var(--fg-64748b)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
 
                        Sono gli stessi esercizi della Libreria Esercizi: stesso nome ovunque, così i record dalle schede si agganciano da soli. Vale per tutti gli atleti.
 
                      </p>
 
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
 
                        <input
 
                          type="text"
 
                          placeholder="Nuovo esercizio (es. Bench Press)"
 
                          value={newMaxExerciseName}
 
                          onChange={(e) => setNewMaxExerciseName(e.target.value)}
 
                          onKeyDown={(e) => { if (e.key === 'Enter') addMaxTrackedExercise(); }}
 
                          list="max_ex_suggestions"
 
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}
 
                        />
 
                        <datalist id="max_ex_suggestions">
 
                          {exerciseLibrary.filter((e: any) => !e.dismissed && !e.track_max).map((e: any) => (
 
                            <option key={e.id} value={e.name} />
 
                          ))}
 
                        </datalist>
 
                        <button onClick={addMaxTrackedExercise} style={{ padding: '8px 14px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
 
                      </div>
 
 
 
                      <button onClick={() => setShowExerciseManager(!showExerciseManager)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
 
                        {showExerciseManager ? '\u25b2 Nascondi gestione esercizi' : '\u25bc Gestisci esercizi'}
 
                      </button>
 
 
 
                      {showExerciseManager && (
 
                        <div style={{ marginTop: '10px', background: 'var(--bg-ffffff)', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                          {exerciseLibrary.filter((e: any) => !e.dismissed).length === 0 ? (
 
                            <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: 0 }}>Nessun esercizio in libreria.</p>
 
                          ) : exerciseLibrary.filter((e: any) => !e.dismissed).map((ex: any) => (
 
                            <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 
                              {editingExerciseId === ex.id ? (
 
                                <>
 
                                  <input
 
                                    type="text"
 
                                    value={editingExerciseName}
 
                                    onChange={(e) => setEditingExerciseName(e.target.value)}
 
                                    onKeyDown={(e) => { if (e.key === 'Enter') renameExerciseEverywhere(ex.id, ex.name, editingExerciseName); }}
 
                                    style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '12px' }}
 
                                    autoFocus
 
                                  />
 
                                  <button onClick={() => renameExerciseEverywhere(ex.id, ex.name, editingExerciseName)} style={{ background: 'var(--bg-10b981)', border: 'none', color: 'var(--onacc)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Salva</button>
 
                                  <button onClick={() => { setEditingExerciseId(null); setEditingExerciseName(''); }} style={{ background: 'var(--bg-e2e8f0)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>Annulla</button>
 
                                </>
 
                              ) : (
 
                                <>
 
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, cursor: 'pointer' }}>
 
                                    <input type="checkbox" checked={!!ex.track_max} onChange={(e) => toggleTrackMax(ex.id, e.target.checked)} />
 
                                    <span style={{ fontSize: '13px', color: 'var(--fg-000000)' }}>{ex.name}</span>
 
                                  </label>
 
                                  <button onClick={() => { setEditingExerciseId(ex.id); setEditingExerciseName(ex.name); }} style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>\u270f\ufe0f Rinomina</button>
 
                                </>
 
                              )}
 
                            </div>
 
                          ))}
 
                          <p style={{ fontSize: '11px', color: 'var(--fg-64748b)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
 
                            La spunta indica se l&apos;esercizio compare tra i massimali. Rinominandolo, il nome cambia anche nella Libreria Esercizi, nei massimali di tutti gli atleti e nello storico.
 
                          </p>
 
                        </div>
 
                      )}
 
                    </div>
 
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 
                    {maxExerciseNames.map((exName) => {
 
                      const exMaxes = coachAthleteMaxes[selectedCoachAthlete.id]?.[exName] || {};
 
                      return (
 
                        <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '14px', marginBottom: '8px' }}>{exName}</div>
 
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', alignItems: 'stretch' }}>
 
                            {REP_SCHEMES.map((reps) => (
 
                              <div key={reps} style={{ background: 'var(--bg-ffffff)', padding: '8px 6px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', whiteSpace: 'nowrap' }}>{reps} RM</span>
 
                                <input
 
                                  type="text"
 
                                  placeholder="kg"
 
                                  value={exMaxes[reps] || ''}
 
                                  onChange={(e) => handleMaxTyping(exName, reps, e.target.value, selectedCoachAthlete.id)}
 
                                  onBlur={(e) => handleMaxChange(exName, reps, e.target.value, selectedCoachAthlete.id)}
 
                                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
 
                                  style={{ width: '100%', padding: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px', boxSizing: 'border-box' }}
 
                                />
 
                              </div>
 
                            ))}
 
                          </div>
 
 
 
                          <button
 
                            onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)}
 
                            style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 0 0 0' }}
 
                          >
 
                            {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                          </button>
 
 
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
 
                            <MaxHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
 
                          )}
 
 
 
                        </div>
 
                      );
 
                    })}
 
                  </div>
 
 
 
                  </div>
 
                  )}
 
 
 
                  {coachMaxSubTab === 'metcon' && (
 
                  <div>
 
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: 'var(--fg-10b981)' }}>⏱️ Metcon PR</h4>
 
                  <div style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '14px' }}>
 
                    <span style={{ fontSize: '12px', color: 'var(--fg-475569)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Gestisci l&apos;elenco dei Metcon PR</span>
 
                    <div style={{ display: 'flex', gap: '8px' }}>
 
                      <input type="text" placeholder="Nuovo test (es. 400mt Run)" value={newPrName} onChange={(e) => setNewPrName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addPrExercise('metcon'); }} list="pr_suggestions" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                      <datalist id="pr_suggestions">
 
                        {exerciseLibrary.filter((e: any) => !e.dismissed && !e.pr_kind).map((e: any) => (
 
                          <option key={e.id} value={e.name} />
 
                        ))}
 
                      </datalist>
 
                      <button onClick={() => addPrExercise('metcon')} style={{ padding: '8px 14px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
 
                    </div>
 
                  </div>
 
 
 
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                    {metconPRNames.map((exName) => (
 
                      <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 
                          <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '13px' }}>{exName}</span>
 
                          <ScoreInput
 
                            mode="time"
 
                            value={coachAthleteMaxes[selectedCoachAthlete.id]?.[exName]?.time || ''}
 
                            onChange={(v: string) => handleSpecialMaxTyping(exName, 'tempo', v, selectedCoachAthlete.id)}
 
                            onCommit={(v: string) => handleSpecialMaxChange(exName, 'tempo', v, selectedCoachAthlete.id)}
 
                          />
 
                          <button onClick={() => removePrExercise(exName)} title="Togli dall'elenco PR" style={{ background: 'none', border: 'none', color: 'var(--fg-ef4444)', cursor: 'pointer', fontSize: '15px', padding: '0 2px' }}>×</button>
 
                        </div>
 
                        <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                        </button>
 
                        {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
 
                          <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} lowerIsBetter unit="tempo" onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
 
                        )}
 
 
 
                      </div>
 
                    ))}
 
                  </div>
 
 
 
                  </div>
 
                  )}
 
 
 
                  {coachMaxSubTab === 'gym' && (
 
                  <div>
 
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: 'var(--fg-10b981)' }}>🤸 Gymnastics PR</h4>
 
                  <div style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '14px' }}>
 
                    <span style={{ fontSize: '12px', color: 'var(--fg-475569)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Gestisci l&apos;elenco dei Gymnastics PR</span>
 
                    <div style={{ display: 'flex', gap: '8px' }}>
 
                      <input type="text" placeholder="Nuovo test (es. 400mt Run)" value={newPrName} onChange={(e) => setNewPrName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addPrExercise('gym'); }} list="pr_suggestions_gym" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                      <datalist id="pr_suggestions_gym">
 
                        {exerciseLibrary.filter((e: any) => !e.dismissed && !e.pr_kind).map((e: any) => (
 
                          <option key={e.id} value={e.name} />
 
                        ))}
 
                      </datalist>
 
                      <button onClick={() => addPrExercise('gym')} style={{ padding: '8px 14px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Aggiungi</button>
 
                    </div>
 
                  </div>
 
 
 
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                    {gymPRNames.map((exName) => (
 
                      <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 
                          <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '13px' }}>{exName}</span>
 
                          <ScoreInput
 
                            mode="reps"
 
                            value={coachAthleteMaxes[selectedCoachAthlete.id]?.[exName]?.reps || ''}
 
                            onChange={(v: string) => handleSpecialMaxTyping(exName, 'rep', v, selectedCoachAthlete.id)}
 
                            onCommit={(v: string) => handleSpecialMaxChange(exName, 'rep', v, selectedCoachAthlete.id)}
 
                          />
 
                          <button onClick={() => removePrExercise(exName)} title="Togli dall'elenco PR" style={{ background: 'none', border: 'none', color: 'var(--fg-ef4444)', cursor: 'pointer', fontSize: '15px', padding: '0 2px' }}>×</button>
 
                        </div>
 
                        <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                        </button>
 
                        {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
 
                          <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} unit="rep" onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
 
                        )}
 
 
 
                      </div>
 
                    ))}
 
                  </div>
 
                  </div>
 
                  )}
 
 
 
                  {coachMaxSubTab === 'bench' && (
 
                  <div>
 
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: 'var(--fg-10b981)' }}>🏅 Benchmark WOD</h4>
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 
                    {BENCHMARK_WODS.map((b) => {
 
                      const dato = coachAthleteMaxes[selectedCoachAthlete.id]?.[b.name];
 
                      const lvl = benchLevel[b.name] || dato?.level || 'rx';
 
                      return (
 
                        <div key={b.name} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
 
                            <span style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '15px' }}>{b.name}</span>
 
                            <div style={{ display: 'flex', gap: '4px' }}>
 
                              {[['rx', 'RX'], ['int', 'INT'], ['beg', 'BEG']].map(([k, label]) => (
 
                                <button key={k} onClick={() => setBenchLevel({ ...benchLevel, [b.name]: k as any })} style={{ padding: '4px 9px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{label}</button>
 
                              ))}
 
                            </div>
 
                          </div>
 
                          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(b, lvl)}</p>
 
                          <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginBottom: '8px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(b, lvl)}</div>
 
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                            <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', flex: 1 }}>Risultato</span>
 
                            <ScoreInput
 
                              mode={b.type}
 
                              value={dato?.result || ''}
 
                              onChange={(v: string) => handleBenchTyping(b.name, v, lvl, selectedCoachAthlete.id)}
 
                              onCommit={(v: string) => handleBenchSave(b.name, v, lvl, b.type, selectedCoachAthlete.id)}
 
                            />
 
                          </div>
 
                          <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, b.name)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                            {openHistoryKey === `${selectedCoachAthlete.id}|${b.name}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                          </button>
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${b.name}` && (
 
                            <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${b.name}`]} lowerIsBetter={b.type === 'time'} unit={b.type === 'time' ? 'tempo' : b.type === 'rounds' ? 'round' : 'rep'} onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${b.name}`)} />
 
                          )}
 
                        </div>
 
                      );
 
                    })}
 
                  </div>
 
                  </div>
 
                  )}
 
 
 
                  </div>
 
                  )}
 
 
 
                  {coachAthleteDetailTab === 'abbonamento' && (() => {
 
                    const stato = coachSubs[selectedCoachAthlete.id] || 'prova';
 
                    const opzioni = [
 
                      { k: 'attivo',  t: 'Attivo',  d: 'Vede le sue schede e il banner promozionale', bg: 'var(--bg-dcfce7)', bd: '#4ade80', fg: 'var(--fg-166534)' },
 
                      { k: 'prova',   t: 'In prova', d: 'Vede solo la settimana di prova che ha scelto', bg: 'var(--bg-fef9c3)', bd: '#facc15', fg: 'var(--fg-854d0e)' },
 
                      { k: 'scaduto', t: 'Scaduto',  d: 'Nessuna scheda: vede l\u2019invito ad abbonarsi', bg: 'var(--bg-fee2e2)', bd: '#f87171', fg: 'var(--fg-991b1b)' },
 
                    ];
 
                    return (
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 
                        <h4 style={{ fontSize: '15px', margin: 0, color: 'var(--fg-10b981)' }}>Stato abbonamento</h4>
 
                        <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: 0, lineHeight: 1.45 }}>
 
                          Chi si registra parte automaticamente &quot;In prova&quot;. Cambia lo stato quando acquista o quando l&apos;abbonamento finisce.
 
                        </p>
 
 
 
                        {opzioni.map((o) => (
 
                          <button
 
                            key={o.k}
 
                            onClick={() => setAthleteSubscription(selectedCoachAthlete.id, o.k)}
 
                            style={{
 
                              display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
 
                              padding: '14px', borderRadius: '10px', cursor: 'pointer',
 
                              background: stato === o.k ? o.bg : 'var(--bg-ffffff)',
 
                              border: stato === o.k ? `2px solid ${o.bd}` : '1px solid var(--bd-e2e8f0)',
 
                            }}
 
                          >
 
                            <span style={{
 
                              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
 
                              border: `2px solid ${stato === o.k ? o.bd : 'var(--bd-cbd5e1)'}`,
 
                              background: stato === o.k ? o.bd : 'transparent',
 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
 
                              color: '#fff', fontSize: '12px', fontWeight: 'bold',
 
                            }}>{stato === o.k ? '\u2713' : ''}</span>
 
                            <span style={{ flex: 1 }}>
 
                              <span style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', color: stato === o.k ? o.fg : 'var(--fg-334155)' }}>{o.t}</span>
 
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--fg-64748b)', marginTop: '2px' }}>{o.d}</span>
 
                            </span>
 
                          </button>
 
                        ))}
 
 
 
                        <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '12px', marginTop: '4px' }}>
 
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '6px' }}>Settimana di prova</span>
 
                          <select
 
                            value={selectedCoachAthlete.trial_choice || ''}
 
                            onChange={(e) => setAthleteTrialStyle(selectedCoachAthlete.id, e.target.value)}
 
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)', marginBottom: '6px' }}
 
                          >
 
                            <option value="">Non ancora scelta</option>
 
                            <option value="pesi">🏋️ Sala Pesi</option>
 
                            <option value="hybrid">🏃 Hybrid</option>
 
                            <option value="cross">🤸 Cross Training</option>
 
                          </select>
 
                          <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', lineHeight: 1.4, display: 'block' }}>
 
                            Solo tu puoi cambiare lo stile: l'atleta lo sceglie una volta sola. La scadenza resta di sette giorni dall'iscrizione e non riparte.
 
                          </span>
 
                        </div>
 
                      </div>
 
                    );
 
                  })()}
 
 
 
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
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
 
                          <textarea value={athAnamnesi.goal} onChange={(e) => updateField('goal', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
 
                          <select value={athAnamnesi.weekly_sessions} onChange={(e) => updateField('weekly_sessions', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                            <option value="">Seleziona...</option>
 
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
 
                          </select>
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
 
                          <select value={athAnamnesi.session_duration} onChange={(e) => updateField('session_duration', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                            <option value="">Seleziona...</option>
 
                            <option value="30'">30'</option>
 
                            <option value="1 ora">1 ora</option>
 
                            <option value="1 ora e 30'">1 ora e 30'</option>
 
                            <option value="2 ore">2 ore</option>
 
                            <option value="più di 2 ore">più di 2 ore</option>
 
                          </select>
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
 
                          <textarea value={athAnamnesi.equipment} onChange={(e) => updateField('equipment', e.target.value)} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
 
                          <textarea value={athAnamnesi.physical_issues} onChange={(e) => updateField('physical_issues', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <button
 
                          disabled={anamnesisSaving}
 
                          onClick={() => saveAnamnesis(selectedCoachAthlete.id, athAnamnesi, true)}
 
                          style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
 
                        >
 
                          {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
 
                        </button>
 
                      </div>
 
                    );
 
                  })()}
 
                </div>
 
              ) : (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--fg-10b981)' }}>Seleziona un Atleta</h3>
 
 
 
 <div style={{ position: 'relative', marginBottom: '12px' }}>
 
   <input
 
     type="text"
 
     placeholder="Cerca un atleta..."
 
     value={cercaProfili}
 
     onChange={(e: any) => setCercaProfili(e.target.value)}
 
     style={{ width: '100%', boxSizing: 'border-box', padding: '11px 34px 11px 12px', borderRadius: '10px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}
 
   />
 
   {cercaProfili && (
 
     <button onClick={() => setCercaProfili('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
 
       <Icona nome="chiudi" size={15} />
 
     </button>
 
   )}
 
 </div>
 
 
 
                  {!showAddAthlete ? (
 
                    <button
 
                      onClick={() => setShowAddAthlete(true)}
 
                      style={{ width: '100%', boxSizing: 'border-box', marginBottom: '14px', padding: '12px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
 
                    >
 
                      ➕ Aggiungi atleta manualmente
 
                    </button>
 
                  ) : (
 
                    <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
 
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--fg-10b981)' }}>Nuovo atleta</h4>
 
                      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: 'var(--fg-64748b)', lineHeight: 1.45 }}>
 
                        L&apos;account viene creato già attivo, senza email di conferma. Comunica tu email e password all&apos;atleta: al primo accesso gli verrà chiesto di accettare l&apos;informativa privacy e potrà cambiare la password dal suo profilo.
 
                      </p>
 
 
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
 
                        <div style={{ display: 'flex', gap: '9px' }}>
 
                          <input type="text" placeholder="Nome" value={newAthlete.first_name} onChange={(e) => setNewAthlete({ ...newAthlete, first_name: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          <input type="text" placeholder="Cognome" value={newAthlete.last_name} onChange={(e) => setNewAthlete({ ...newAthlete, last_name: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        </div>
 
                        <input type="email" placeholder="Email" value={newAthlete.email} onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        <input type="text" placeholder="Password provvisoria (min. 6 caratteri)" value={newAthlete.password} onChange={(e) => setNewAthlete({ ...newAthlete, password: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
 
 
                        <div>
 
                          <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
 
                          <input type="date" value={newAthlete.birth_date} onChange={(e) => setNewAthlete({ ...newAthlete, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        </div>
 
 
 
                        {isMinorenne(personalData.birth_date) && (
 
                          <div style={{ background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '8px', padding: '12px' }}>
 
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-92400e)', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
 
                            <input type="text" placeholder="Nome e cognome" value={personalData.guardian_name || ''} onChange={(e) => setPersonalData({ ...personalData, guardian_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          </div>
 
                        )}
 
                        <div>
 
                          <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Sesso</label>
 
                          <div style={{ display: 'flex', gap: '8px' }}>
 
                            {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                              <button key={k} type="button" onClick={() => setNewAthlete({ ...newAthlete, gender: k })} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: newAthlete.gender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: newAthlete.gender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                            ))}
 
                          </div>
 
                        </div>
 
 
 
                        <div style={{ display: 'flex', gap: '9px' }}>
 
                          <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={newAthlete.weight} onChange={(e) => setNewAthlete({ ...newAthlete, weight: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={newAthlete.height} onChange={(e) => setNewAthlete({ ...newAthlete, height: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        </div>
 
 
 
                        <div>
 
                          <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Abbonamento</label>
 
                          <select value={newAthlete.subscription_status} onChange={(e) => setNewAthlete({ ...newAthlete, subscription_status: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}>
 
                            <option value="attivo">✅ Attivo</option>
 
                            <option value="prova">🎁 In prova</option>
 
                            <option value="scaduto">⛔ Scaduto</option>
 
                          </select>
 
                        </div>
 
 
 
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
 
                          <button onClick={creaAtletaManuale} disabled={addingAthlete} style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', opacity: addingAthlete ? 0.6 : 1 }}>
 
                            {addingAthlete ? 'Creazione...' : 'Crea atleta'}
 
                          </button>
 
                          <button onClick={() => { setShowAddAthlete(false); setNewAthlete(emptyNewAthlete); }} style={{ padding: '12px 16px', borderRadius: '999px', border: 'none', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
 
                            Annulla
 
                          </button>
 
                        </div>
 
                      </div>
 
                    </div>
 
                  )}
 
                  {athletes.length === 0 ? (
 
                    <p style={{ color: 'var(--fg-64748b)' }}>Nessun atleta registrato.</p>
 
                  ) : athletes.filter((a: any) => contiene(a.full_name || a.email, cercaProfili)).length === 0 ? (
 
                    <p style={{ color: 'var(--fg-94a3b8)', fontSize: '13px' }}>Nessun atleta con &quot;{cercaProfili}&quot;.</p>
 
                  ) : (
 
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                      {athletes.filter((a: any) => contiene(a.full_name || a.email, cercaProfili)).map((a) => (
 
                        <div key={a.id} onClick={() => setSelectedCoachAthlete(a)} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--bd-e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
 
                            {(() => {
 
                              const st = coachSubs[a.id] || 'prova';
 
                              const col = st === 'attivo' ? '#22c55e' : st === 'scaduto' ? 'var(--fg-ef4444)' : '#eab308';
 
                              const lab = st === 'attivo' ? 'Attivo' : st === 'scaduto' ? 'Scaduto' : 'In prova';
 
                              return <span title={lab} style={{ width: '10px', height: '10px', borderRadius: '50%', background: col, flexShrink: 0 }} />;
 
                            })()}
 
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-000000)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name || a.email}</span>
 
                          </span>
 
                          <span style={{ fontSize: '12px', color: 'var(--fg-10b981)' }}>Visualizza Profilo →</span>
 
                        </div>
 
                      ))}
 
                    </div>
 
                  )}
 
                </div>
 
              )}
 
            </div>
 
          ) : editingProgram ? (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 
                <h3 style={{ fontSize: '18px', color: 'var(--fg-10b981)', margin: 0 }}>Modifica Programma</h3>
 
                <button onClick={() => setEditingProgram(null)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>Annulla</button>
 
              </div>
 
 
 
              <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Titolo Programma:</label>
 
              <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', marginBottom: '12px', boxSizing: 'border-box' }} />
 
 
 
              {editingProgram.trialStyle ? (
 
                <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
 
                  <span style={{ fontSize: '12px', color: 'var(--fg-1e40af)', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>📅 Durata automatica</span>
 
                  <span style={{ fontSize: '12px', color: 'var(--fg-1e3a8a)', lineHeight: 1.4 }}>Le settimane di prova durano sette giorni dal momento in cui l&apos;atleta le sceglie, quindi le date non servono.</span>
 
                </div>
 
              ) : (
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
 
                <div>
 
                  <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
 
                  <input type="date" value={editingProgram.startDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
                </div>
 
                <div>
 
                  <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
 
                  <input type="date" value={editingProgram.endDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
                </div>
 
              </div>
 
              )}
 
 
 
              <div style={{ marginBottom: '20px' }}>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Settimana di prova:</label>
 
                <select value={editingProgram.trialStyle || ''} onChange={(e) => setEditingProgram({ ...editingProgram, trialStyle: e.target.value || null })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                  <option value="">Non è un programma di prova</option>
 
                  <option value="pesi">🏋️ Prova — Sala Pesi</option>
 
                  <option value="hybrid">🏃 Prova — Hybrid</option>
 
                  <option value="cross">🤸 Prova — Cross Training</option>
 
                </select>
 
                {editingProgram.trialStyle === 'pesi' && (
 
                  <div style={{ marginBottom: '12px' }}>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Per quale sesso è questa scheda:</label>
 
                    <div style={{ display: 'flex', gap: '8px' }}>
 
                      {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                        <button key={k} type="button" onClick={() => setEditingProgram({ ...editingProgram, trialGender: k })} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', border: 'none', background: (editingProgram.trialGender || '') === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: (editingProgram.trialGender || '') === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                      ))}
 
                    </div>
 
                    <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginTop: '5px' }}>Serve solo per la Sala Pesi: ogni atleta riceve la scheda del proprio sesso.</span>
 
                  </div>
 
                )}
 
 
 
 
 
                {!editingProgram.trialStyle && (<>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Chi vede questo programma:</label>
 
                <select value={editingProgram.visibility || 'selected'} onChange={(e) => {
 
                  const v = e.target.value;
 
                  const prev = editingProgram.visibility || 'selected';
 
                  const ids = v === 'all'
 
                    ? athletes.map((a: any) => a.id)
 
                    : v === 'none' || (v === 'selected' && prev === 'all')
 
                      ? []
 
                      : (editingProgram.assignedAthleteIds || []);
 
                  setEditingProgram({ ...editingProgram, visibility: v, assignedAthleteIds: ids });
 
                }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                  <option value="none">🔒 Nessuno — bozza, la vedi solo tu</option>
 
                  <option value="all">🌍 Tutti gli atleti</option>
 
                  <option value="selected">👥 Solo gli atleti selezionati qui sotto</option>
 
                </select>
 
                </>)}
 
                {!editingProgram.trialStyle && (editingProgram.visibility || 'selected') !== 'none' && (<>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
 
                <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '8px', padding: '10px' }}>
 
                  {athletes.map((a) => {
 
                    const currentAssigned = editingProgram.assignedAthleteIds || [];
 
                    return (
 
                      <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-000000)', marginBottom: '6px', cursor: 'pointer' }}>
 
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
 
                </>)}
 
              </div>
 
 
 
              <div style={{ marginBottom: '16px', background: 'var(--bg-f1f5f9)', padding: '12px', borderRadius: '8px' }}>
 
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
 
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
 
                  {editingProgram.weeks?.map((week: any, wIdx: number) => {
 
                    const isSelected = selectedWeekView === week.weekName;
 
                    return (
 
                      <button
 
                        key={wIdx}
 
                        onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }}
 
                        style={{ ...pillola(isSelected, 'var(--fg-334155)', 'piccolo') }}
 
                      >
 
                        {week.hidden ? `\u{1F6AB} ${week.weekName}` : week.weekName}
 
                      </button>
 
                    );
 
                  })}
 
            <button onClick={addEditingWeek} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Settimana</button>
 
                </div>
 
 
 
                {(() => {
 
                  const tutte = editingProgram.weeks || [];
 
                  const pos = tutte.findIndex((w: any) => w.weekName === selectedWeekView);
 
                  if (pos < 0) return null;
 
                  const sett = tutte[pos];
 
                  const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                  return (
 
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
 
                      <button onClick={() => moveEditingWeekOrder(pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                        <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                      </button>
 
                      <button onClick={() => moveEditingWeekOrder(pos, 'right')} disabled={pos === tutte.length - 1} style={{ ...azione, opacity: pos === tutte.length - 1 ? 0.4 : 1 }}>
 
                        <Icona nome="destra" size={12} /> Sposta a destra
 
                      </button>
 
                      <button onClick={() => cloneEditingWeek(sett)} style={azione}>
 
                        <Icona nome="duplica" size={12} /> Duplica
 
                      </button>
 
                    </div>
 
                  );
 
                })()}
 
              </div>
 
 
 
              {editingProgram.weeks?.filter((w: any) => w.weekName === selectedWeekView).map((week: any) => {
 
                const actualWIdx = editingProgram.weeks.findIndex((w: any) => w.weekName === selectedWeekView);
 
 
 
                return (
 
                  <div key={actualWIdx} style={{ marginBottom: '16px' }}>
 
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: 'var(--bg-e2e8f0)', padding: '10px', borderRadius: '8px' }}>
 
                      <input
 
                        type="text"
 
                        value={week.weekName}
 
                        onChange={(e) => {
 
                          const updated = JSON.parse(JSON.stringify(editingProgram));
 
                          updated.weeks[actualWIdx].weekName = e.target.value;
 
                          setSelectedWeekView(e.target.value);
 
                          setEditingProgram(updated);
 
                        }}
 
                        style={{ fontWeight: 'bold', color: 'var(--fg-141416)', fontSize: '15px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', width: '200px', maxWidth: '100%', minWidth: 0 }}
 
                      />
 
                      {pulsanteVisibilita(!!week.hidden, () => toggleVisibilitaSettimana(actualWIdx))}
 
                      {editingProgram.weeks.length > 1 && (
 
                        <button onClick={() => {
 
                          // conferma prima di eliminare: dico anche cosa si perde
 
                          const g = (week.days || []).length;
 
                          const e = (week.days || []).reduce((t: number, d: any) => t + (d.blocks || []).length, 0);
 
                          const dettaglio = e > 0
 
                            ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'} e ${e} ${e === 1 ? 'esercizio' : 'esercizi'}`
 
                            : (g > 0 ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'}` : '');
 
                          if (!confirm(`Eliminare "${week.weekName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                          const updated = JSON.parse(JSON.stringify(editingProgram));
 
                          updated.weeks.splice(actualWIdx, 1);
 
                          setEditingProgram(updated);
 
                          // resto sulla settimana vicina invece di tornare alla prima
 
                          const vicina = updated.weeks[Math.min(actualWIdx, updated.weeks.length - 1)];
 
                          if (vicina) {
 
                            setSelectedWeekView(vicina.weekName);
 
                            if (vicina.days?.length > 0) setSelectedDayView(vicina.days[0].dayName);
 
                          }
 
                        }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Settimana</button>
 
                      )}
 
                    </div>
 
 
 
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
 
                      {week.days?.map((day: any, dIdx: number) => {
 
                        const isSelected = selectedDayView === day.dayName;
 
                        return (
 
                          <button
 
                            key={dIdx}
 
                            onClick={() => setSelectedDayView(day.dayName)}
 
                            style={{ ...pillola(isSelected, 'var(--fg-10b981)', 'piccolo') }}
 
                          >
 
                            {day.hidden ? `\u{1F6AB} ${day.dayName}` : day.dayName}
 
                          </button>
 
                        );
 
                      })}
 
                      <button onClick={() => addEditingDay(actualWIdx)} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Giorno</button>
 
                    </div>
 
 
 
                    {(() => {
 
                      const giorni = week.days || [];
 
                      const pos = giorni.findIndex((d: any) => d.dayName === selectedDayView);
 
                      if (pos < 0) return null;
 
                      const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                      return (
 
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
 
                          <button onClick={() => moveEditingDayOrder(actualWIdx, pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                            <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                          </button>
 
                          <button onClick={() => moveEditingDayOrder(actualWIdx, pos, 'right')} disabled={pos === giorni.length - 1} style={{ ...azione, opacity: pos === giorni.length - 1 ? 0.4 : 1 }}>
 
                            <Icona nome="destra" size={12} /> Sposta a destra
 
                          </button>
 
                          <button onClick={() => cloneEditingDay(actualWIdx, giorni[pos])} style={azione}>
 
                            <Icona nome="duplica" size={12} /> Duplica
 
                          </button>
 
                        </div>
 
                      );
 
                    })()}
 
 
 
                    {week.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
 
                      const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
 
                      return (
 
                        <div key={actualDIdx} style={{ background: 'var(--bg-f8fafc)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
 
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 180px', minWidth: 0 }}>
 
                              <input
 
                                type="text"
 
                                value={day.dayName}
 
                                onChange={(e) => {
 
                                  const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                  updated.weeks[actualWIdx].days[actualDIdx].dayName = e.target.value;
 
                                  setSelectedDayView(e.target.value);
 
                                  setEditingProgram(updated);
 
                                }}
 
                                style={{ fontWeight: 'bold', color: 'var(--fg-10b981)', fontSize: '14px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', flex: 1, minWidth: 0 }}
 
                              />
 
                              {(() => {
 
                                const quanti = (day.blocks || []).length;
 
                                return (
 
                                  <span
 
                                    title={quanti === 1 ? 'Un blocco in questo giorno' : `${quanti} blocchi in questo giorno`}
 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5px 11px', borderRadius: '999px', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
 
                                  >
 
                                    {quanti === 1 ? '1 blocco' : `${quanti} blocchi`}
 
                                  </span>
 
                                );
 
                              })()}
 
                            </div>
 
                            {pulsanteVisibilita(!!day.hidden, () => toggleVisibilitaGiorno(actualWIdx, actualDIdx))}
 
                            {week.days.length > 1 && (
 
                              <button onClick={() => {
 
                                // conferma prima di eliminare il giorno
 
                                const e = (day.blocks || []).length;
 
                                const dettaglio = e > 0 ? ` con ${e} ${e === 1 ? 'esercizio' : 'esercizi'}` : '';
 
                                if (!confirm(`Eliminare "${day.dayName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                                const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                updated.weeks[actualWIdx].days.splice(actualDIdx, 1);
 
                                setEditingProgram(updated);
 
                                // resto sul giorno vicino invece di tornare al primo
 
                                const vicino = updated.weeks[actualWIdx].days[Math.min(actualDIdx, updated.weeks[actualWIdx].days.length - 1)];
 
                                if (vicino) setSelectedDayView(vicino.dayName);
 
                              }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Giorno</button>
 
                            )}
 
                          </div>
 
 
 
                          {day.blocks?.map((block: any, bIdx: number) => {
 
                            const blockKey = `edit_${actualWIdx}_${actualDIdx}_${bIdx}`;
 
                            const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
 
 
                            return (
 
                              <div key={block.id || bIdx} style={{ background: 'var(--bg-ffffff)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
 
                                  <span
 
                                    title={`Blocco ${bIdx + 1} di ${(day.blocks || []).length}`}
 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '26px', height: '26px', padding: '0 7px', borderRadius: '999px', background: 'var(--bg-1f2937)', color: '#fff', fontSize: '11.5px', fontWeight: 'bold', flexShrink: 0 }}
 
                                  >
 
                                    {bIdx + 1}
 
                                  </span>
 
                                  <div style={{ position: 'relative', flex: '1 1 140px', minWidth: 0 }}>
 
                                    <select
 
                                      value={block.type || 'forza'}
 
                                      onChange={(e) => scegliTipoBlocco('edit', actualWIdx, actualDIdx, bIdx, e.target.value)}
 
                                      style={{
 
                                        width: '100%', boxSizing: 'border-box',
 
                                        padding: '9px 30px 9px 14px', borderRadius: '999px', cursor: 'pointer',
 
                                        fontSize: '12.5px', fontWeight: 'bold',
 
                                        border: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
 
                                        background: block.type === 'warmup' ? '#f59e0b'
 
                                        : block.type === 'superserie' ? '#c2410c'
 
                                          : block.type === 'wod' ? '#2563eb'
 
                                          : block.type === 'test' ? '#7c3aed'
 
                                          : 'var(--bg-10b981)',
 
                                        color: block.type === 'warmup' ? '#101214' : block.type === 'superserie' ? '#ffffff' : block.type === 'wod' ? '#ffffff' : block.type === 'test' ? '#ffffff' : 'var(--onacc)',
 
                                      }}
 
                                    >
 
                                      <option value="warmup">WARM UP</option>
 
                                      <option value="superserie">SUPERSERIE</option>
 
                                      <option value="forza">FORZA</option>
 
                                      <option value="wod">WOD</option>
 
                                      <option value="test">TEST</option>
 
                                    </select>
 
                                    <span style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#fff' }}>
 
                                      <Icona nome="giu" size={14} />
 
                                    </span>
 
                                  </div>
 
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
 
                                    <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
 
                                    <button type="button" onClick={() => apriDuplicaBlocco('edit', actualWIdx, actualDIdx, bIdx, block)} title="Duplica esercizio" style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '4px 7px', cursor: 'pointer', fontSize: '13px' }}><Icona nome="duplica" size={14} /></button>
 
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="su" size={14} /></button>
 
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="giu" size={14} /></button>
 
                                    <button type="button" onClick={() => {
 
                                      // chiedo conferma solo se c'e' qualcosa da perdere
 
                                      const pieno = block && (
 
                                        String(block.name || '').trim() ||
 
                                        String(block.wodNotes || '').trim() ||
 
                                        String(block.notes || '').trim() ||
 
                                        (block.items || []).length > 0
 
                                      );
 
                                      if (pieno) {
 
                                        const nome = String(block.name || '').trim() || 'questo esercizio';
 
                                        if (!confirm(`Eliminare ${nome}?`)) return;
 
                                      }
 
 
 
                                      const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                      updated.weeks[actualWIdx].days[actualDIdx].blocks.splice(bIdx, 1);
 
                                      setEditingProgram(updated);
 
                                    }} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="cestino" size={14} /></button>
 
                                  </div>
 
                                </div>
 
 
 
                                <div style={{ marginBottom: '10px' }}>
 
                                  {block.type === 'test' ? (
 
                                    <select value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '8px' }}>
 
                                      <option value="">Scegli un test...</option>
 
                                      <optgroup label="Metcon">
 
                                        {metconPRNames.map((n: string) => <option key={n} value={n}>{`Max Effort ${n}`}</option>)}
 
                                      </optgroup>
 
                                      <optgroup label="Gymnastics">
 
                                        {gymPRNames.map((n: string) => <option key={n} value={n}>{`Max Rep ${n}`}</option>)}
 
                                      </optgroup>
 
                                      <optgroup label="Benchmark WOD">
 
                                        {BENCHMARK_NAMES.map((n: string) => <option key={n} value={n}>{n}</option>)}
 
                                      </optgroup>
 
                                    </select>
 
                                  ) : block.type === 'forza' ? (
 
                                    <div>
 
                                      <CampoEsercizio
 
                                        placeholder="Inserisci o seleziona esercizio..."
 
                                        valore={block.name}
 
                                        onChange={(v: string) => {
 
                                          const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                          const b = updated.weeks[actualWIdx].days[actualDIdx].blocks[bIdx];
 
                                          b.name = v;
 
                                          const inLibreria = exerciseLibrary.find((ex: any) => sameName(ex.name, v));
 
                                          if (inLibreria && inLibreria.video_url) b.videoUrl = inLibreria.video_url;
 
                                          setEditingProgram(updated);
 
                                        }}
 
                                        elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                      />
 
                                    </div>
 
                                  ) : haElenco(block.type) ? (
 
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-92400e)' }}>
 
                                      {block.name || 'Warm up'}
 
                                    </span>
 
                                  ) : (
 
                                    <input type="text" value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                  )}
 
                                </div>
 
 
 
                                {!isClosed && (
 
                                  <div>
 
                                    {!haElenco(block.type) && (
 
                                    <div style={{ marginBottom: '10px' }}>
 
                                      <input type="url" value={block.videoUrl || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '12px' }} />
 
                                      {block.type === 'forza' && block.name && block.name.trim() && !exerciseLibrary.some((ex: any) => sameName(ex.name, block.name)) && (
 
                                        <button
 
                                          type="button"
 
                                          onClick={() => salvaInLibreriaDaScheda(block.name, block.videoUrl || '')}
 
                                          style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px', padding: '8px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
 
                                        >
 
                                          ➕ Salva &quot;{block.name}&quot; in Libreria Esercizi
 
                                        </button>
 
                                      )}
 
                                    </div>
 
                                    )}
 
                                    {block.type === 'test' ? (
 
                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '8px' }}>
 
                                        {(() => {
 
                                          const bench = BENCHMARK_WODS.find((b) => b.name === block.name);
 
                                          if (!bench) return null;
 
                                          const lvl = block.benchLevel || 'rx';
 
                                          return (
 
                                            <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
 
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
 
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-10b981)' }}>{bench.name}</span>
 
                                                <div style={{ display: 'flex', gap: '3px' }}>
 
                                                  {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                    <button key={k} type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'benchLevel', k)} style={{ padding: '3px 8px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                  ))}
 
                                                </div>
 
                                              </div>
 
                                              <p style={{ margin: 0, fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                              <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                            </div>
 
                                          );
 
                                        })()}
 
                                        <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE DEL COACH</label>
 
                                        <input type="text" placeholder="Indicazioni per l'atleta (facoltativo)" value={block.target || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'target', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                        <p style={{ fontSize: '10px', color: 'var(--fg-64748b)', margin: '6px 0 0 0', lineHeight: 1.3 }}>Blocco di test: niente serie, ripetizioni, carico o recupero.</p>
 
                                      </div>
 
                                    ) : haElenco(block.type) ? (
 
                                      <div>
 
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
 
                                          <div style={{ flex: '2 1 150px', minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Titolo della sezione</label>
 
                                            <input type="text" placeholder={nomeElenco(block.type)} value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', nomeElenco(block.type)); }} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                                          </div>
 
                                          <div style={{ flex: '1 1 80px', minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>N. round</label>
 
                                            <input type="text" inputMode="numeric" placeholder="1" value={block.rounds || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }} />
 
                                          </div>
 
                                          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Rest tra i round</label>
 
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
 
                                              <input
 
                                                type="text"
 
                                                inputMode="numeric"
 
                                                placeholder="0"
 
                                                value={block.warmRestMin ?? ''}
 
                                                onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'warmRestMin', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                              />
 
                                              <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>:</span>
 
                                              <input
 
                                                type="text"
 
                                                inputMode="numeric"
 
                                                placeholder="0"
 
                                                value={block.warmRestSec ?? ''}
 
                                                onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'warmRestSec', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                              />
 
                                            </div>
 
                                            <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--fg-94a3b8)', marginTop: '2px' }}>min : sec — vuoto = nessun recupero</span>
 
                                          </div>
 
                                        </div>
 
 
 
                                        {block.type === 'superserie' && <SelettoreModoSuperserie valore={block.scoreUnit} onChange={(v: string) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />}
 
                                        {(block.items || []).map((it: any, i: number) => (
 
                                          <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                            <CampoEsercizio
 
                                              placeholder="Nome esercizio"
 
                                              valore={it.name}
 
                                              onChange={(v: string) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                              elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                              style={{ marginBottom: '7px' }}
 
                                            />
 
 
 
                                            <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
 
                                              <input
 
                                                type="text"
 
                                                placeholder="10 rep / 30&quot;"
 
                                                value={it.value || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'value', e.target.value)}
 
                                                style={{ flex: '2 1 150px', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                              />
 
                                              <input
 
                                                type="text"
 
                                                placeholder="rec. 1:30"
 
                                                title="Recupero dopo questo esercizio. Vuoto = vale quello della sezione."
 
                                                value={it.rest || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'rest', e.target.value)}
 
                                                style={{ flex: '1 1 78px', minWidth: 0, boxSizing: 'border-box', padding: '10px 6px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px', textAlign: 'center' }}
 
                                              />
 
 
                                            </div>
 
                                            {block.type === 'superserie' && block.scoreUnit !== 'spunta' && <SelettoreScoreItem valore={it.scoreUnit} onChange={(v: string) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'scoreUnit', v)} />}
 
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
                                              <input
 
                                                type="text"
 
                                                placeholder="80% / RPE 8"
 
                                                title="Carico previsto: percentuale sul massimale oppure RPE. Vuoto = nessuna indicazione."
 
                                                value={it.load || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'load', e.target.value)}
 
                                                style={{ flex: '1 1 130px', minWidth: 0, maxWidth: '200px', boxSizing: 'border-box', padding: '10px 8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                              />
 
                                              <span style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
 
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="su" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="giu" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => togliWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="cestino" size={14} />
 
                                              </button>
 
                                              </span>
 
                                            </div>
 
 
 
                                            <input type="url" placeholder="Link video (facoltativo)" value={it.videoUrl || ''} onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }} />
 
                                          </div>
 
                                        ))}
 
 
 
 
 
                                        <button type="button" onClick={() => aggiungiWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                          Aggiungi esercizio
 
                                        </button>
 
 
 
      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', margin: '10px 0 3px 0' }}>Note del coach</label>
 
      <textarea rows={2} placeholder="Indicazioni sull'esecuzione, cosa curare..." value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
 
                                      </div>
 
                                    ) : isMobility(block.name) ? (
 
                                      <div>
 
                                        <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Testo della mobility (lo vedrà l&apos;atleta)</label>
 
                                        <textarea
 
                                          rows={6}
 
                                          placeholder={'Scrivi qui la sequenza.\nVai a capo dove vuoi: le righe vengono rispettate.'}
 
                                          value={block.wodNotes || ''}
 
                                          onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)}
 
                                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '8px' }}
 
                                        />
 
                                        <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', lineHeight: 1.45 }}>
 
                                          L&apos;atleta non inserisce punteggi: vede il testo e il video, può spuntare &quot;fatto&quot; e lasciare una nota.
 
                                        </span>
 
                                      </div>
 
                                    ) : block.type === 'forza' ? (
 
                                      <div>
 
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</label>
 
                                            <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</label>
 
                                            <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                        </div>
 
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</label>
 
                                            <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</label>
 
                                            <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                        </div>
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                        <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                          <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE</label>
 
                                          <input type="text" value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
                                        </div>
 
                                      </div>
 
                                    ) : (
 
                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                        <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</label>
 
                                        <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', boxSizing: 'border-box', height: '70px', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
 
 
                                          {(() => {
 
                                            const trovati = trovaEserciziNelTesto(block.wodNotes, block.items);
 
                                            if (trovati.length === 0) return null;
 
                                            return (
 
                                              <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '10px 12px', margin: '10px 0' }}>
 
                                                <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--fg-1e40af)', marginBottom: '7px', lineHeight: 1.45 }}>
 
                                                  <strong>{trovati.length === 1 ? 'Trovato 1 esercizio' : `Trovati ${trovati.length} esercizi`} in libreria:</strong>{' '}
 
                                                  {trovati.map((t: any) => t.name).join(' · ')}
 
                                                </span>
 
                                                <button
 
                                                  type="button"
 
                                                  onClick={() => aggiornaWarmItems('edit', actualWIdx, actualDIdx, bIdx, [...(block.items || []), ...trovati])}
 
                                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                >
 
                                                  <Icona nome="piu" size={12} /> Aggiungi con i video
 
                                                </button>
 
                                              </div>
 
                                            );
 
                                          })()}
 
 
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', margin: '10px 0 4px 0' }}>
 
                                          <div style={{ flex: 1, minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>
 
                                              Esercizi con video <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'normal' }}>(facoltativo)</span>
 
                                            </label>
 
                                          </div>
 
                                          <div style={{ width: '92px', flexShrink: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Round</label>
 
                                            <input
 
                                              type="text"
 
                                              inputMode="numeric"
 
                                              placeholder="—"
 
                                              value={block.scoreRounds || ''}
 
                                              onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreRounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                              title="Quante caselle dare all'atleta per il risultato. Vuoto = una sola."
 
                                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                            />
 
                                          </div>
 
                                        </div>
 
                                        {(block.items || []).map((it: any, i: number) => (
 
                                          <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                            <CampoEsercizio
 
                                              placeholder="Nome esercizio"
 
                                              valore={it.name}
 
                                              onChange={(v: string) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                              elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                              style={{ marginBottom: '7px' }}
 
                                            />
 
 
 
                                            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
 
                                              <input
 
                                                type="url"
 
                                                placeholder="Link video"
 
                                                value={it.videoUrl || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)}
 
                                                style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }}
 
                                              />
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="su" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="giu" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => togliWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="cestino" size={14} />
 
                                              </button>
 
                                            </div>
 
                                          </div>
 
                                        ))}
 
                                        <button type="button" onClick={() => aggiungiWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '999px', border: '1px dashed #3b82f6', background: 'var(--bg-eff6ff)', color: 'var(--fg-1d4ed8)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
 
                                          Aggiungi esercizio con video
 
                                        </button>
 
                                      </div>
 
                                    )}
 
                                  </div>
 
                                )}
 
                              </div>
 
                            );
 
                          })}
 
                          <button onClick={() => addBlockToEditingDay(actualWIdx, actualDIdx)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Aggiungi Blocco</button>
 
                        </div>
 
                      );
 
                    })}
 
                  </div>
 
                );
 
              })}
 
 
 
              <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
 
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-10b981)', display: 'block', marginBottom: '10px' }}>💡 Consigli per l&apos;atleta</span>
 
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli per l&apos;allenamento</label>
 
                <textarea rows={4} placeholder={'Indicazioni su tecnica, riscaldamento, recuperi, gestione dei carichi...'} value={editingProgram.trainingTips || ''} onChange={(e) => setEditingProgram({ ...editingProgram, trainingTips: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '12px' }} />
 
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli nutrizionali</label>
 
                <textarea rows={4} placeholder={'Indicazioni generali su alimentazione e idratazione...'} value={editingProgram.nutritionTips || ''} onChange={(e) => setEditingProgram({ ...editingProgram, nutritionTips: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
 
              </div>
 
 
 
              <button onClick={saveEditedProgram} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>Salva Modifiche</button>
 
            </div>
 
          ) : (
 
            <div>
 
              <div id="menu-coach-ancora" />
 
              <div style={{
 
                display: 'flex',
 
                flexWrap: 'wrap',
 
                gap: '8px',
 
                marginBottom: menuAgganciato ? '10px' : '20px',
 
                position: menuAgganciato ? 'sticky' : 'static',
 
                top: timerRidotto ? '62px' : 0,
 
                zIndex: 40,
 
                background: menuAgganciato ? 'var(--bg-18181b)' : 'transparent',
 
                paddingTop: menuAgganciato ? '8px' : 0,
 
                paddingBottom: menuAgganciato ? '8px' : 0,
 
                boxShadow: menuAgganciato ? '0 6px 14px rgba(0,0,0,0.45)' : 'none',
 
                transition: 'padding .16s ease, margin .16s ease',
 
              }}>
 
                <button
 
                  onClick={() => setActiveTab('create')}
 
                  style={{
 
                    ...pillola(activeTab === 'create'),
 
                    flex: '1 1 0', minWidth: 0,
 
                    whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2,
 
                    padding: menuAgganciato ? '8px 6px' : '10px 6px',
 
                    fontSize: '12.5px',
 
                  }}
 
                >
 
                  Crea Programma
 
                </button>
 
                <button
 
                  onClick={() => setActiveTab('library')}
 
                  style={{
 
                    ...pillola(activeTab === 'library'),
 
                    flex: '1 1 0', minWidth: 0,
 
                    whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2,
 
                    padding: menuAgganciato ? '8px 6px' : '10px 6px',
 
                    fontSize: '12.5px',
 
                  }}
 
                >
 
                  Libreria Programmi
 
                </button>
 
                <button
 
                  onClick={() => setActiveTab('exercises')}
 
                  style={{
 
                    ...pillola(activeTab === 'exercises'),
 
                    flex: '1 1 0', minWidth: 0,
 
                    whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2,
 
                    padding: menuAgganciato ? '8px 6px' : '10px 6px',
 
                    fontSize: '12.5px',
 
                  }}
 
                >
 
                  Libreria Esercizi
 
                </button>
 
              </div>
 
 
 
              {activeTab === 'exercises' ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 
                    <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>{showDeletedExercises ? 'Cestino Esercizi' : 'Gestione Libreria Esercizi'}</h3>
 
                    <button onClick={() => setShowDeletedExercises(!showDeletedExercises)} style={{ padding: '8px 10px', borderRadius: '999px', border: 'none', background: showDeletedExercises ? 'var(--bg-10b981)' : '#64748b', color: showDeletedExercises ? 'var(--onacc)' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
 
                      {showDeletedExercises ? 'Torna agli esercizi' : '🗑️ Cestino'}
 
                    </button>
 
                  </div>
 
 
 
                  {!showDeletedExercises && (
 
                    <form onSubmit={addGlobalExercise} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                      <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px' }} />
 
                      <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px' }} />
 
                      <select value={newExType} onChange={(e) => setNewExType(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)', marginBottom: '10px' }}>
 
                        <option value="">Esercizio generico (nessun massimale)</option>
 
                        <option value="forza">🏋️ Forza — con massimali 1/3/5/10 RM</option>
 
                        <option value="metcon">⏱️ Metcon — risultato a tempo</option>
 
                        <option value="gym">🤸 Ginnastica — massimo di ripetizioni</option>
 
                      </select>
 
                      <button type="submit" style={{ padding: '10px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', borderRadius: '999px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
 
                    </form>
 
                  )}
 
 
 
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
 
                    <input
 
                      type="text"
 
                      placeholder="Cerca un esercizio..."
 
                      value={cercaEsercizi}
 
                      onChange={(e: any) => setCercaEsercizi(e.target.value)}
 
                      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 34px 11px 12px', borderRadius: '10px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}
 
                    />
 
                    {cercaEsercizi && (
 
                      <button onClick={() => setCercaEsercizi('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
 
                        <Icona nome="chiudi" size={15} />
 
                      </button>
 
                    )}
 
                  </div>
 
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                    {exerciseLibrary.filter((ex) => (showDeletedExercises ? ex.dismissed : !ex.dismissed) && contiene(ex.name, cercaEsercizi)).length === 0 ? (
 
                      <p style={{ color: 'var(--fg-64748b)', textAlign: 'center', padding: '20px' }}>
 
                        {cercaEsercizi
 
                          ? `Nessun esercizio con "${cercaEsercizi}".`
 
                          : showDeletedExercises
 
                            ? 'Il cestino è vuoto.'
 
                            : 'Nessun esercizio in libreria.'}
 
                      </p>
 
                    ) : (
 
                      sortExerciseLibrary(exerciseLibrary.filter((ex) => (showDeletedExercises ? ex.dismissed : !ex.dismissed) && contiene(ex.name, cercaEsercizi))).map((ex) => (
 
                        libEditId === ex.id ? (
 
                          <div key={ex.id} style={{ background: 'var(--bg-ffffff)', padding: '12px', borderRadius: '8px', border: '2px solid var(--bd-10b981)' }}>
 
                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Nome esercizio</label>
 
                            <input
 
                              type="text"
 
                              value={libEditName}
 
                              onChange={(e) => setLibEditName(e.target.value)}
 
                              style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '9px' }}
 
                              autoFocus
 
                            />
 
                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Link video</label>
 
                            <input
 
                              type="url"
 
                              placeholder="https://..."
 
                              value={libEditVideo}
 
                              onChange={(e) => setLibEditVideo(e.target.value)}
 
                              onKeyDown={(e) => { if (e.key === 'Enter') salvaEsercizioLibreria(ex); }}
 
                              style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '10px' }}
 
                            />
 
                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>
 
                              Abbreviazioni <span style={{ color: 'var(--fg-94a3b8)' }}>(facoltative, separate da virgola)</span>
 
                            </label>
 
                            <input
 
                              type="text"
 
                              placeholder="es. DU, DUs"
 
                              value={libEditAlias}
 
                              onChange={(e) => setLibEditAlias(e.target.value)}
 
                              style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '6px' }}
 
                            />
 
                            <p style={{ fontSize: '10.5px', color: 'var(--fg-94a3b8)', margin: '0 0 10px 0', lineHeight: 1.45 }}>
 
                              Servono a riconoscere l&apos;esercizio nel testo dei WOD: scrivendo &quot;DU&quot; qui, un WOD con &quot;50 DU&quot; propone questo esercizio.
 
                            </p>
 
 
 
                            <div style={{ display: 'flex', gap: '7px' }}>
 
                              <button onClick={() => salvaEsercizioLibreria(ex)} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                Salva
 
                              </button>
 
                              <button onClick={() => { setLibEditId(null); setLibEditName(''); setLibEditVideo(''); setLibEditAlias(''); }} style={{ padding: '10px 15px', borderRadius: '999px', border: 'none', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                Annulla
 
                              </button>
 
                            </div>
 
                            {libEditName.trim() && libEditName.trim() !== ex.name && (
 
                              <p style={{ fontSize: '10.5px', color: 'var(--fg-92400e)', margin: '9px 0 0 0', lineHeight: 1.45, background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '6px', padding: '8px 10px' }}>
 
                                Cambiando il nome verrà aggiornato ovunque: nelle schede già create, nei massimali degli atleti e nel loro storico. Nessun dato viene perso.
 
                              </p>
 
                            )}
 
                          </div>
 
                        ) : (
 
                        <div key={ex.id} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
 
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-000000)' }}>{ex.name}</div>
 
                            <div style={{ fontSize: '11px', color: ex.video_url ? 'var(--fg-0284c7)' : 'var(--fg-94a3b8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
 
                              {ex.video_url ? 'Video disponibile' : 'Nessun video'}
 
                            </div>
 
                            {ex.pr_kind ? (
 
                              <span style={{ display: 'inline-block', marginTop: '5px', background: ex.pr_kind === 'metcon' ? 'var(--bg-dbeafe)' : 'var(--bg-fce7f3)', color: ex.pr_kind === 'metcon' ? 'var(--fg-1e40af)' : 'var(--fg-9d174d)', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
 
                                {ex.pr_kind === 'metcon' ? '⏱️ Metcon PR' : '🤸 Gymnastics PR'}
 
                              </span>
 
                            ) : ex.track_max ? (
 
                              <span style={{ display: 'inline-block', marginTop: '5px', background: 'var(--bg-dcfce7)', color: 'var(--fg-166534)', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
 
                                🏋️ Forza — massimali
 
                              </span>
 
                            ) : null}
 
                            {!showDeletedExercises && !ex.pr_kind && (
 
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '5px', cursor: 'pointer' }}>
 
                                <input type="checkbox" checked={!!ex.track_max} onChange={(e) => toggleTrackMax(ex.id, e.target.checked)} />
 
                                <span style={{ fontSize: '11px', color: 'var(--fg-0284c7)', fontWeight: 'bold' }}>Traccia massimali</span>
 
                              </label>
 
                            )}
 
                          </div>
 
                          {showDeletedExercises ? (
 
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 
                              <button onClick={() => restoreGlobalExercise(ex.id)} style={{ background: 'var(--bg-10b981)', border: 'none', color: 'var(--onacc)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>♻️ Ripristina</button>
 
                              <button onClick={() => permanentlyDeleteGlobalExercise(ex.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Definitivo</button>
 
                            </div>
 
                          ) : (
 
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 
                              {ex.video_url && (
 
                                <a
 
                                  href={ex.video_url}
 
                                  target="_blank"
 
                                  rel="noopener noreferrer"
 
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', borderRadius: '999px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}
 
                                >
 
                                  <Icona nome="video" size={12} /> Video
 
                                </a>
 
                              )}
 
                              <button onClick={() => { setLibEditId(ex.id); setLibEditName(ex.name); setLibEditVideo(ex.video_url || ''); setLibEditAlias(ex.aliases || ''); }} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '999px', padding: '7px 11px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="modifica" size={12} /> Modifica</button>
 
                              <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina</button>
 
                            </div>
 
                          )}
 
                        </div>
 
                        )
 
                      ))
 
                    )}
 
                  </div>
 
                </div>
 
              ) : activeTab === 'create' ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
 
 
 
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', marginBottom: '12px', boxSizing: 'border-box' }} />
 
 
 
                  {programTrialStyle ? (
 
                    <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
 
                      <span style={{ fontSize: '12px', color: 'var(--fg-1e40af)', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>📅 Durata automatica</span>
 
                      <span style={{ fontSize: '12px', color: 'var(--fg-1e3a8a)', lineHeight: 1.4 }}>Le settimane di prova durano sette giorni dal momento in cui l&apos;atleta le sceglie, quindi le date non servono.</span>
 
                    </div>
 
                  ) : (
 
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
 
                    <div>
 
                      <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
 
                      <input type="date" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
                    </div>
 
                    <div>
 
                      <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
 
                      <input type="date" value={programEndDate} onChange={(e) => setProgramEndDate(e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
                    </div>
 
                  </div>
 
                  )}
 
 
 
                  <div style={{ marginBottom: '16px' }}>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Settimana di prova:</label>
 
                    <select value={programTrialStyle} onChange={(e) => setProgramTrialStyle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                      <option value="">Non è un programma di prova</option>
 
                      <option value="pesi">🏋️ Prova — Sala Pesi</option>
 
                      <option value="hybrid">🏃 Prova — Hybrid</option>
 
                      <option value="cross">🤸 Prova — Cross Training</option>
 
                    </select>
 
                    {programTrialStyle === 'pesi' && (
 
                      <div style={{ marginBottom: '12px' }}>
 
                        <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Per quale sesso è questa scheda:</label>
 
                        <div style={{ display: 'flex', gap: '8px' }}>
 
                          {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                            <button key={k} type="button" onClick={() => setProgramTrialGender(k)} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', border: 'none', background: programTrialGender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: programTrialGender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                          ))}
 
                        </div>
 
                        <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginTop: '5px' }}>Serve solo per la Sala Pesi: ogni atleta riceve la scheda del proprio sesso.</span>
 
                      </div>
 
                    )}
 
 
 
 
 
                    {!programTrialStyle && (<>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Chi vede questo programma:</label>
 
                    <select value={programVisibility} onChange={(e) => {
 
                      const v = e.target.value as any;
 
                      const prev = programVisibility;
 
                      setProgramVisibility(v);
 
                      if (v === 'all') setSelectedAthleteIds(athletes.map((a: any) => a.id));
 
                      if (v === 'none') setSelectedAthleteIds([]);
 
                      // arrivando da "tutti", riparto senza nessuna spunta
 
                      if (v === 'selected' && prev === 'all') setSelectedAthleteIds([]);
 
                    }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                      <option value="none">🔒 Nessuno — bozza, la vedi solo tu</option>
 
                      <option value="all">🌍 Tutti gli atleti</option>
 
                      <option value="selected">👥 Solo gli atleti selezionati qui sotto</option>
 
                    </select>
 
                    </>)}
 
                    {!programTrialStyle && programVisibility !== 'none' && (<>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
 
                    <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '8px', padding: '10px' }}>
 
                      {athletes.length === 0 ? (
 
                        <span style={{ fontSize: '12px', color: 'var(--fg-64748b)' }}>Nessun atleta disponibile.</span>
 
                      ) : (
 
                        athletes.map((a) => (
 
                          <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-000000)', marginBottom: '6px', cursor: 'pointer' }}>
 
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
 
                    </>)}
 
                  </div>
 
 
 
                  <div style={{ marginBottom: '16px', background: 'var(--bg-f1f5f9)', padding: '12px', borderRadius: '8px' }}>
 
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
 
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
 
                      {programWeeks.map((week, wIdx) => {
 
                        const isSelected = selectedWeekView === week.weekName;
 
                        return (
 
                          <button
 
                            key={wIdx}
 
                            onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }}
 
                            style={{ ...pillola(isSelected, 'var(--fg-334155)', 'piccolo') }}
 
                          >
 
                            {week.weekName}
 
                          </button>
 
                        );
 
                      })}
 
                      <button onClick={addWeek} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Settimana</button>
 
                    </div>
 
 
 
                    {(() => {
 
                      const tutte = programWeeks || [];
 
                      const pos = tutte.findIndex((w: any) => w.weekName === selectedWeekView);
 
                      if (pos < 0) return null;
 
                      const sett = tutte[pos];
 
                      const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                      return (
 
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
 
                          <button onClick={() => moveWeekOrder(pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                            <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                          </button>
 
                          <button onClick={() => moveWeekOrder(pos, 'right')} disabled={pos === tutte.length - 1} style={{ ...azione, opacity: pos === tutte.length - 1 ? 0.4 : 1 }}>
 
                            <Icona nome="destra" size={12} /> Sposta a destra
 
                          </button>
 
                          <button onClick={() => cloneWeek(sett)} style={azione}>
 
                            <Icona nome="duplica" size={12} /> Duplica
 
                          </button>
 
                        </div>
 
                      );
 
                    })()}
 
                  </div>
 
 
 
                  {programWeeks.filter((w) => w.weekName === selectedWeekView).map((week) => {
 
                    const actualWIdx = programWeeks.findIndex((w) => w.weekName === selectedWeekView);
 
 
 
                    return (
 
                      <div key={actualWIdx} style={{ marginBottom: '16px' }}>
 
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: 'var(--bg-e2e8f0)', padding: '10px', borderRadius: '8px' }}>
 
                          <input
 
                            type="text"
 
                            value={week.weekName}
 
                            onChange={(e) => {
 
                              const upd = JSON.parse(JSON.stringify(programWeeks));
 
                              upd[actualWIdx].weekName = e.target.value;
 
                              setSelectedWeekView(e.target.value);
 
                              setProgramWeeks(upd);
 
                            }}
 
                            style={{ fontWeight: 'bold', color: 'var(--fg-141416)', fontSize: '15px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', width: '200px', maxWidth: '100%', minWidth: 0 }}
 
                          />
 
                          {programWeeks.length > 1 && (
 
                            <button onClick={() => {
 
                              // conferma prima di eliminare: dico anche cosa si perde
 
                              const g = (week.days || []).length;
 
                              const e = (week.days || []).reduce((t: number, d: any) => t + (d.blocks || []).length, 0);
 
                              const dettaglio = e > 0
 
                                ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'} e ${e} ${e === 1 ? 'esercizio' : 'esercizi'}`
 
                                : (g > 0 ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'}` : '');
 
                              if (!confirm(`Eliminare "${week.weekName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                              const upd = JSON.parse(JSON.stringify(programWeeks));
 
                              upd.splice(actualWIdx, 1);
 
                              setProgramWeeks(upd);
 
                              // resto sulla settimana vicina invece di tornare alla prima
 
                              const vicina = upd[Math.min(actualWIdx, upd.length - 1)];
 
                              if (vicina) {
 
                                setSelectedWeekView(vicina.weekName);
 
                                if (vicina.days?.length > 0) setSelectedDayView(vicina.days[0].dayName);
 
                              }
 
                            }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Settimana</button>
 
                          )}
 
                        </div>
 
 
 
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
 
                          {week.days.map((day: any, dIdx: number) => {
 
                            const isSelected = selectedDayView === day.dayName;
 
                            return (
 
                              <button
 
                                key={dIdx}
 
                                onClick={() => setSelectedDayView(day.dayName)}
 
                                style={{ ...pillola(isSelected, 'var(--fg-10b981)', 'piccolo') }}
 
                              >
 
                                {day.dayName}
 
                              </button>
 
                            );
 
                          })}
 
                          <button onClick={() => addDay(actualWIdx)} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Giorno</button>
 
                        </div>
 
 
 
                        {(() => {
 
                          const giorni = week.days || [];
 
                          const pos = giorni.findIndex((d: any) => d.dayName === selectedDayView);
 
                          if (pos < 0) return null;
 
                          const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                          return (
 
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
 
                              <button onClick={() => moveDayOrder(actualWIdx, pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                                <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                              </button>
 
                              <button onClick={() => moveDayOrder(actualWIdx, pos, 'right')} disabled={pos === giorni.length - 1} style={{ ...azione, opacity: pos === giorni.length - 1 ? 0.4 : 1 }}>
 
                                <Icona nome="destra" size={12} /> Sposta a destra
 
                              </button>
 
                              <button onClick={() => cloneDay(actualWIdx, giorni[pos])} style={azione}>
 
                                <Icona nome="duplica" size={12} /> Duplica
 
                              </button>
 
                            </div>
 
                          );
 
                        })()}
 
 
 
                        {week.days.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
 
                          const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
 
                          return (
 
                            <div key={actualDIdx} style={{ background: 'var(--bg-f8fafc)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
 
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 180px', minWidth: 0 }}>
 
                                  <input
 
                                    type="text"
 
                                    value={day.dayName}
 
                                    onChange={(e) => {
 
                                      const upd = JSON.parse(JSON.stringify(programWeeks));
 
                                      upd[actualWIdx].days[actualDIdx].dayName = e.target.value;
 
                                      setSelectedDayView(e.target.value);
 
                                      setProgramWeeks(upd);
 
                                    }}
 
                                    style={{ fontWeight: 'bold', color: 'var(--fg-10b981)', fontSize: '14px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', flex: 1, minWidth: 0 }}
 
                                  />
 
                                  {(() => {
 
                                    const quanti = (day.blocks || []).length;
 
                                    return (
 
                                      <span
 
                                        title={quanti === 1 ? 'Un blocco in questo giorno' : `${quanti} blocchi in questo giorno`}
 
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5px 11px', borderRadius: '999px', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
 
                                      >
 
                                        {quanti === 1 ? '1 blocco' : `${quanti} blocchi`}
 
                                      </span>
 
                                    );
 
                                  })()}
 
                                </div>
 
                                {week.days.length > 1 && (
 
                                  <button onClick={() => {
 
                                    // conferma prima di eliminare il giorno
 
                                    const e = (day.blocks || []).length;
 
                                    const dettaglio = e > 0 ? ` con ${e} ${e === 1 ? 'esercizio' : 'esercizi'}` : '';
 
                                    if (!confirm(`Eliminare "${day.dayName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                                    const upd = JSON.parse(JSON.stringify(programWeeks));
 
                                    upd[actualWIdx].days.splice(actualDIdx, 1);
 
                                    setProgramWeeks(upd);
 
                                    // resto sul giorno vicino invece di tornare al primo
 
                                    const vicino = upd[actualWIdx].days[Math.min(actualDIdx, upd[actualWIdx].days.length - 1)];
 
                                    if (vicino) setSelectedDayView(vicino.dayName);
 
                                  }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Giorno</button>
 
                                )}
 
                              </div>
 
 
 
                              {day.blocks.map((block: any, bIdx: number) => {
 
                                const blockKey = `prog_${actualWIdx}_${actualDIdx}_${bIdx}`;
 
                                const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
 
 
                                return (
 
                                  <div key={block.id} style={{ background: 'var(--bg-ffffff)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
 
                                      <span
 
                                        title={`Blocco ${bIdx + 1} di ${(day.blocks || []).length}`}
 
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '26px', height: '26px', padding: '0 7px', borderRadius: '999px', background: 'var(--bg-1f2937)', color: '#fff', fontSize: '11.5px', fontWeight: 'bold', flexShrink: 0 }}
 
                                      >
 
                                        {bIdx + 1}
 
                                      </span>
 
                                      <div style={{ position: 'relative', flex: '1 1 140px', minWidth: 0 }}>
 
                                        <select
 
                                          value={block.type || 'forza'}
 
                                          onChange={(e) => scegliTipoBlocco('free', actualWIdx, actualDIdx, bIdx, e.target.value)}
 
                                          style={{
 
                                            width: '100%', boxSizing: 'border-box',
 
                                            padding: '9px 30px 9px 14px', borderRadius: '999px', cursor: 'pointer',
 
                                            fontSize: '12.5px', fontWeight: 'bold',
 
                                            border: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
 
                                            background: block.type === 'warmup' ? '#f59e0b'
 
                                            : block.type === 'superserie' ? '#c2410c'
 
                                              : block.type === 'wod' ? '#2563eb'
 
                                              : block.type === 'test' ? '#7c3aed'
 
                                              : 'var(--bg-10b981)',
 
                                            color: block.type === 'warmup' ? '#101214' : block.type === 'superserie' ? '#ffffff' : block.type === 'wod' ? '#ffffff' : block.type === 'test' ? '#ffffff' : 'var(--onacc)',
 
                                          }}
 
                                        >
 
                                          <option value="warmup">WARM UP</option>
 
                                          <option value="superserie">SUPERSERIE</option>
 
                                          <option value="forza">FORZA</option>
 
                                          <option value="wod">WOD</option>
 
                                          <option value="test">TEST</option>
 
                                        </select>
 
                                        <span style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#fff' }}>
 
                                          <Icona nome="giu" size={14} />
 
                                        </span>
 
                                      </div>
 
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
 
                                        <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
 
                                        <button type="button" onClick={() => apriDuplicaBlocco('free', actualWIdx, actualDIdx, bIdx, block)} title="Duplica esercizio" style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '4px 7px', cursor: 'pointer', fontSize: '13px' }}><Icona nome="duplica" size={14} /></button>
 
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="su" size={14} /></button>
 
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="giu" size={14} /></button>
 
                                        <button type="button" onClick={() => removeBlockFromFreeDay(actualWIdx, actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="cestino" size={14} /></button>
 
                                      </div>
 
                                    </div>
 
 
 
                                    <div style={{ marginBottom: '10px' }}>
 
                                      {block.type === 'test' ? (
 
                                        <select value={block.name || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '8px' }}>
 
                                          <option value="">Scegli un test...</option>
 
                                          <optgroup label="Metcon">
 
                                            {metconPRNames.map((n: string) => <option key={n} value={n}>{`Max Effort ${n}`}</option>)}
 
                                          </optgroup>
 
                                          <optgroup label="Gymnastics">
 
                                            {gymPRNames.map((n: string) => <option key={n} value={n}>{`Max Rep ${n}`}</option>)}
 
                                          </optgroup>
 
                                          <optgroup label="Benchmark WOD">
 
                                            {BENCHMARK_NAMES.map((n: string) => <option key={n} value={n}>{n}</option>)}
 
                                          </optgroup>
 
                                        </select>
 
                                      ) : block.type === 'forza' ? (
 
                                        <div>
 
                                          <CampoEsercizio
 
                                            placeholder="Inserisci o seleziona esercizio..."
 
                                            valore={block.name}
 
                                            onChange={(v: string) => {
 
                                              const upd = JSON.parse(JSON.stringify(programWeeks));
 
                                              const target = upd[actualWIdx].days[actualDIdx].blocks[bIdx];
 
                                              target.name = v;
 
                                              const inLibreria = exerciseLibrary.find((ex: any) => sameName(ex.name, v));
 
                                              if (inLibreria && inLibreria.video_url) target.videoUrl = inLibreria.video_url;
 
                                              setProgramWeeks(upd);
 
                                            }}
 
                                            elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                          />
 
                                        </div>
 
                                      ) : haElenco(block.type) ? (
 
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-92400e)' }}>{block.name || 'Warm up'}</span>
 
                                      ) : (
 
                                        <input type="text" value={block.name} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                      )}
 
                                    </div>
 
 
 
                                    {!isClosed && (
 
                                      <div>
 
                                        {!haElenco(block.type) && (
 
                                        <div style={{ marginBottom: '10px' }}>
 
                                          <input type="url" value={block.videoUrl || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '12px' }} />
 
                                          {block.type === 'forza' && block.name && block.name.trim() && !exerciseLibrary.some((ex: any) => sameName(ex.name, block.name)) && (
 
                                            <button
 
                                              type="button"
 
                                              onClick={() => salvaInLibreriaDaScheda(block.name, block.videoUrl || '')}
 
                                              style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px', padding: '8px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
 
                                            >
 
                                              ➕ Salva &quot;{block.name}&quot; in Libreria Esercizi
 
                                            </button>
 
                                          )}
 
                                        </div>
 
                                        )}
 
                                        {block.type === 'test' ? (
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '8px' }}>
 
                                            {(() => {
 
                                              const bench = BENCHMARK_WODS.find((b) => b.name === block.name);
 
                                              if (!bench) return null;
 
                                              const lvl = block.benchLevel || 'rx';
 
                                              return (
 
                                                <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
 
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
 
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-10b981)' }}>{bench.name}</span>
 
                                                    <div style={{ display: 'flex', gap: '3px' }}>
 
                                                      {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                        <button key={k} type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'benchLevel', k)} style={{ padding: '3px 8px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                      ))}
 
                                                    </div>
 
                                                  </div>
 
                                                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                                  <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                                </div>
 
                                              );
 
                                            })()}
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE DEL COACH</label>
 
                                            <input type="text" placeholder="Indicazioni per l'atleta (facoltativo)" value={block.target || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'target', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                            <p style={{ fontSize: '10px', color: 'var(--fg-64748b)', margin: '6px 0 0 0', lineHeight: 1.3 }}>Blocco di test: niente serie, ripetizioni, carico o recupero.</p>
 
                                          </div>
 
                                        ) : haElenco(block.type) ? (
 
                                          <div>
 
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
 
                                              <div style={{ flex: '2 1 150px', minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Titolo della sezione</label>
 
                                                <input type="text" placeholder={nomeElenco(block.type)} value={block.name || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', nomeElenco(block.type)); }} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                                              </div>
 
                                              <div style={{ flex: '1 1 80px', minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>N. round</label>
 
                                                <input type="text" inputMode="numeric" placeholder="1" value={block.rounds || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }} />
 
                                              </div>
 
                                              <div style={{ flex: '1 1 120px', minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Rest tra i round</label>
 
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
 
                                                  <input
 
                                                    type="text"
 
                                                    inputMode="numeric"
 
                                                    placeholder="0"
 
                                                    value={block.warmRestMin ?? ''}
 
                                                    onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'warmRestMin', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                    style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                                  />
 
                                                  <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>:</span>
 
                                                  <input
 
                                                    type="text"
 
                                                    inputMode="numeric"
 
                                                    placeholder="0"
 
                                                    value={block.warmRestSec ?? ''}
 
                                                    onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'warmRestSec', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                    style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                                  />
 
                                                </div>
 
                                                <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--fg-94a3b8)', marginTop: '2px' }}>min : sec — vuoto = nessun recupero</span>
 
                                              </div>
 
                                            </div>
 
 
 
                                        {block.type === 'superserie' && <SelettoreModoSuperserie valore={block.scoreUnit} onChange={(v: string) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />}
 
                                            {(block.items || []).map((it: any, i: number) => (
 
                                              <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                                <CampoEsercizio
 
                                                  placeholder="Nome esercizio"
 
                                                  valore={it.name}
 
                                                  onChange={(v: string) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                                  elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                                  style={{ marginBottom: '7px' }}
 
                                                />
 
 
 
                                                <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
 
                                                  <input
 
                                                    type="text"
 
                                                    placeholder="10 rep / 30&quot;"
 
                                                    value={it.value || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'value', e.target.value)}
 
                                                    style={{ flex: '2 1 150px', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                                  />
 
                                                  <input
 
                                                    type="text"
 
                                                    placeholder="rec. 1:30"
 
                                                    title="Recupero dopo questo esercizio. Vuoto = vale quello della sezione."
 
                                                    value={it.rest || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'rest', e.target.value)}
 
                                                    style={{ flex: '1 1 78px', minWidth: 0, boxSizing: 'border-box', padding: '10px 6px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px', textAlign: 'center' }}
 
                                                  />
 
 
                                                </div>
 
                                            {block.type === 'superserie' && block.scoreUnit !== 'spunta' && <SelettoreScoreItem valore={it.scoreUnit} onChange={(v: string) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'scoreUnit', v)} />}
 
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
                                                  <input
 
                                                    type="text"
 
                                                    placeholder="80% / RPE 8"
 
                                                    title="Carico previsto: percentuale sul massimale oppure RPE. Vuoto = nessuna indicazione."
 
                                                    value={it.load || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'load', e.target.value)}
 
                                                    style={{ flex: '1 1 130px', minWidth: 0, maxWidth: '200px', boxSizing: 'border-box', padding: '10px 8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                                  />
 
                                                  <span style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
 
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="su" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="giu" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => togliWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="cestino" size={14} />
 
                                                  </button>
 
                                                  </span>
 
                                                </div>
 
 
 
                                                <input type="url" placeholder="Link video (facoltativo)" value={it.videoUrl || ''} onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }} />
 
                                              </div>
 
                                            ))}
 
 
 
 
 
                                            <button type="button" onClick={() => aggiungiWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                              Aggiungi esercizio
 
                                            </button>
 
 
 
      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', margin: '10px 0 3px 0' }}>Note del coach</label>
 
      <textarea rows={2} placeholder="Indicazioni sull'esecuzione, cosa curare..." value={block.notes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
 
                                          </div>
 
                                        ) : isMobility(block.name) ? (
 
                                          <div>
 
                                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Testo della mobility (lo vedrà l&apos;atleta)</label>
 
                                            <textarea
 
                                              rows={6}
 
                                              placeholder={'Scrivi qui la sequenza.\nVai a capo dove vuoi: le righe vengono rispettate.'}
 
                                              value={block.wodNotes || ''}
 
                                              onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)}
 
                                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '8px' }}
 
                                            />
 
                                            <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', lineHeight: 1.45 }}>
 
                                              L&apos;atleta non inserisce punteggi: vede il testo e il video, può spuntare &quot;fatto&quot; e lasciare una nota.
 
                                            </span>
 
                                          </div>
 
                                        ) : block.type === 'forza' ? (
 
                                          <div>
 
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</label>
 
                                                <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</label>
 
                                                <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                            </div>
 
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</label>
 
                                                <input type="text" value={block.load} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</label>
 
                                                <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                            </div>
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                            <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                              <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE</label>
 
                                              <input type="text" value={block.notes} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
                                            </div>
 
                                          </div>
 
                                        ) : (
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</label>
 
                                            <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', boxSizing: 'border-box', height: '70px', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
 
 
                                              {(() => {
 
                                                const trovati = trovaEserciziNelTesto(block.wodNotes, block.items);
 
                                                if (trovati.length === 0) return null;
 
                                                return (
 
                                                  <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '10px 12px', margin: '10px 0' }}>
 
                                                    <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--fg-1e40af)', marginBottom: '7px', lineHeight: 1.45 }}>
 
                                                      <strong>{trovati.length === 1 ? 'Trovato 1 esercizio' : `Trovati ${trovati.length} esercizi`} in libreria:</strong>{' '}
 
                                                      {trovati.map((t: any) => t.name).join(' · ')}
 
                                                    </span>
 
                                                    <button
 
                                                      type="button"
 
                                                      onClick={() => aggiornaWarmItems('free', actualWIdx, actualDIdx, bIdx, [...(block.items || []), ...trovati])}
 
                                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                    >
 
                                                      <Icona nome="piu" size={12} /> Aggiungi con i video
 
                                                    </button>
 
                                                  </div>
 
                                                );
 
                                              })()}
 
 
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', margin: '10px 0 4px 0' }}>
 
                                              <div style={{ flex: 1, minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>
 
                                                  Esercizi con video <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'normal' }}>(facoltativo)</span>
 
                                                </label>
 
                                              </div>
 
                                              <div style={{ width: '92px', flexShrink: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Round</label>
 
                                                <input
 
                                                  type="text"
 
                                                  inputMode="numeric"
 
                                                  placeholder="—"
 
                                                  value={block.scoreRounds || ''}
 
                                                  onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreRounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                  title="Quante caselle dare all'atleta per il risultato. Vuoto = una sola."
 
                                                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                                />
 
                                              </div>
 
                                            </div>
 
                                            {(block.items || []).map((it: any, i: number) => (
 
                                              <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                                <CampoEsercizio
 
                                                  placeholder="Nome esercizio"
 
                                                  valore={it.name}
 
                                                  onChange={(v: string) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                                  elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                                  style={{ marginBottom: '7px' }}
 
                                                />
 
 
 
                                                <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
 
                                                  <input
 
                                                    type="url"
 
                                                    placeholder="Link video"
 
                                                    value={it.videoUrl || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)}
 
                                                    style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }}
 
                                                  />
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="su" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="giu" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => togliWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="cestino" size={14} />
 
                                                  </button>
 
                                                </div>
 
                                              </div>
 
                                            ))}
 
                                            <button type="button" onClick={() => aggiungiWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '999px', border: '1px dashed #3b82f6', background: 'var(--bg-eff6ff)', color: 'var(--fg-1d4ed8)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
 
                                              Aggiungi esercizio con video
 
                                            </button>
 
                                          </div>
 
                                        )}
 
                                      </div>
 
                                    )}
 
                                  </div>
 
                                );
 
                              })}
 
                              <button onClick={() => addBlockToFreeDay(actualWIdx, actualDIdx)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Aggiungi Blocco</button>
 
                            </div>
 
                          );
 
                        })}
 
                      </div>
 
                    );
 
                  })}
 
 
 
                  {saveMessage && <p style={{ color: 'var(--fg-10b981)', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
 
                  <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-10b981)', display: 'block', marginBottom: '10px' }}>💡 Consigli per l&apos;atleta</span>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli per l&apos;allenamento</label>
 
                    <textarea rows={4} placeholder={'Indicazioni su tecnica, riscaldamento, recuperi, gestione dei carichi...'} value={programTrainingTips} onChange={(e) => setProgramTrainingTips(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '12px' }} />
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli nutrizionali</label>
 
                    <textarea rows={4} placeholder={'Indicazioni generali su alimentazione e idratazione...'} value={programNutritionTips} onChange={(e) => setProgramNutritionTips(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
 
                  </div>
 
 
 
                  <button onClick={saveProgramToLibrary} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
 
                </div>
 
              ) : (
 
                <div>
 
                  <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>
 
                    {libraryView === 'cestino' ? 'Cestino Programmi' : 'Libreria Programmi'}
 
                  </h3>
 
 
 
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
 
                    {[
 
                      { k: 'programmi', t: '📋 Programmi', n: 0 },
 
                      { k: 'cestino', t: '🗑️ Cestino', n: contaCestino },
 
                    ].map((v) => (
 
                      <button
 
                        key={v.k}
 
                        onClick={() => setLibraryView(v.k as any)}
 
                        style={{ ...pillola(libraryView === v.k, 'var(--fg-334155)'), flex: '1 1 auto' }}
 
                      >
 
                        {v.t}{v.n > 0 ? ` (${v.n})` : ''}
 
                      </button>
 
                    ))}
 
                  </div>
 
 
 
                  {libraryView === 'programmi' && (
 
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
 
                      {[
 
                        { k: 'tutti', t: 'Tutti', n: attivi.length, col: 'var(--fg-475569)' },
 
                        { k: 'assegnati', t: '✅ Assegnati', n: contaAssegnati, col: 'var(--fg-16a34a)' },
 
                        { k: 'bozze', t: '🔒 Bozze', n: contaBozze, col: '#d97706' },
 
                        { k: 'prove', t: '🎁 Prove', n: contaProve, col: 'var(--fg-2563eb)' },
 
                        { k: 'inscadenza', t: '⏳ In scadenza', n: contaInScadenza, col: 'var(--fg-ea580c)' },
 
                        { k: 'scaduti', t: '⛔ Scaduti', n: contaScaduti, col: 'var(--fg-dc2626)' },
 
                      ].map((f) => (
 
                        <button
 
                          key={f.k}
 
                          onClick={() => setLibraryFilter(f.k as any)}
 
                          style={{ ...pillola(libraryFilter === f.k, f.col, 'piccolo'), flex: '1 1 auto' }}
 
                        >
 
                          {f.t} ({f.n})
 
                        </button>
 
                      ))}
 
                    </div>
 
                  )}
 
 
 
 
 
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
 
                    <input
 
                      type="text"
 
                      placeholder="Cerca un programma..."
 
                      value={cercaProgrammi}
 
                      onChange={(e: any) => setCercaProgrammi(e.target.value)}
 
                      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 34px 11px 12px', borderRadius: '10px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}
 
                    />
 
                    {cercaProgrammi && (
 
                      <button onClick={() => setCercaProgrammi('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
 
                        <Icona nome="chiudi" size={15} />
 
                      </button>
 
                    )}
 
                  </div>
 
 
 
                  {libraryView === 'programmi' && (libraryFilter === 'tutti' || libraryFilter === 'assegnati') && (
 
                    <select value={libraryFilterAthlete} onChange={(e) => setLibraryFilterAthlete(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)', marginBottom: '12px' }}>
 
                      <option value="">Filtra per utente (Tutti)</option>
 
                      {athletes.map((a) => (
 
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
 
                      ))}
 
                    </select>
 
                  )}
 
 
 
                  {filteredLibraryPrograms.length === 0 ? (
 
                    <p style={{ color: 'var(--fg-64748b)', textAlign: 'center', padding: '30px', fontSize: '13px', lineHeight: 1.5 }}>
 
                      {cercaProgrammi
 
                        ? `Nessun programma con "${cercaProgrammi}".`
 
                        : libraryView === 'cestino'
 
                        ? 'Il cestino è vuoto.'
 
                        : libraryFilter === 'scaduti'
 
                          ? 'Nessun programma scaduto.'
 
                          : libraryFilter === 'inscadenza'
 
                            ? 'Nessun programma in scadenza nei prossimi sette giorni.'
 
                            : libraryFilter === 'prove'
 
                          ? 'Nessuna settimana di prova. Creane una da "Crea Programma" indicando lo stile nel campo "Settimana di prova".'
 
                          : libraryFilter === 'bozze'
 
                            ? 'Nessuna bozza: tutti i programmi sono visibili a qualcuno.'
 
                            : libraryFilter === 'assegnati'
 
                              ? 'Nessun programma assegnato.'
 
                              : 'Nessun programma trovato.'}
 
                    </p>
 
                  ) : (
 
                    filteredLibraryPrograms.map((prog) => {
 
                      const assignedList = athletes.filter((a) => prog.assignedAthleteIds?.includes(a.id));
 
 
 
                      const weeks = normalizeProgramWeeks(prog);
 
                      const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
 
                      const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
 
                      const activeDay = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
 
 
 
                      // Stato scadenza: le settimane di prova non cambiano mai colore
 
                      const gg = prog.trialStyle ? null : giorniDallaScadenza(prog.endDate);
 
                      const progScaduto = gg !== null && gg > 0;
 
                      const progInScadenza = gg !== null && gg <= 0 && gg >= -7;
 
 
 
                      return (
 
                        <div key={prog.id} style={{ background: prog.trialStyle ? 'var(--bg-d6e9fb)' : progScaduto ? 'var(--bg-fee2e2)' : prog.visibility === 'none' ? 'var(--bg-fdf3d3)' : 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '16px', borderRadius: '14px', border: prog.trialStyle ? '2px solid #3b82f6' : progScaduto ? '2px solid #dc2626' : progInScadenza ? '2px solid #f97316' : prog.visibility === 'none' ? '2px solid var(--bd-e0a80c)' : '1px solid var(--bd-d8dde3)', marginBottom: '16px' }}>
 
                          <div style={{ marginBottom: '12px' }}>
 
                            <div>
 
                              <h4 style={{ overflowWrap: 'anywhere', margin: '0 0 6px 0', color: 'var(--fg-10b981)', fontSize: '17px', lineHeight: 1.25 }}>{prog.title}</h4>
 
                              <div style={{ marginBottom: '8px' }}>
 
                                {prog.trialStyle ? (
 
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', background: 'var(--bg-dbeafe)', color: 'var(--fg-1e40af)' }}>
 
                                    🎁 Settimana di prova — {prog.trialStyle === 'pesi' ? 'Sala Pesi' : prog.trialStyle === 'hybrid' ? 'Hybrid' : 'Cross Training'}
 
                                  </span>
 
                                ) : (
 
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', background: prog.visibility === 'none' ? 'var(--bg-fef3c7)' : prog.visibility === 'all' ? 'var(--bg-e0f2fe)' : 'var(--bg-dcfce7)', color: prog.visibility === 'none' ? 'var(--fg-92400e)' : prog.visibility === 'all' ? 'var(--fg-075985)' : 'var(--fg-166534)' }}>
 
                                    {prog.visibility === 'none' ? '🔒 Bozza — non visibile' : prog.visibility === 'all' ? '🌍 Visibile a tutti' : '👥 Visibile agli assegnati'}
 
                                  </span>
 
                                )}
 
                              </div>
 
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
 
                                {!prog.trialStyle && <span style={{ fontSize: '11px', color: assignedList.length > 0 ? 'var(--fg-0284c7)' : 'var(--fg-000000)', background: 'var(--bg-f1f5f9)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
 
                                  Assegnato: {assignedList.length > 0 ? assignedList.map(a => (a.full_name || a.email || '').trim()).join(', ') : 'Tutti (Generale)'}
 
                                </span>}
 
                                {!prog.trialStyle && (prog.startDate || prog.endDate) && (() => {
 
                                  const st = getProgramDateStatus(prog.startDate, prog.endDate);
 
                                  return (
 
                                  <span style={{ fontSize: '11px', color: st.color, background: st.bg, padding: '3px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>
 
                                    {st.icon} {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}{st.label ? ` · ${st.label}` : ''}
 
                                  </span>
 
                                  ); })()}
 
 
 
                              </div>
 
                            </div>
 
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
 
                              {showDeletedPrograms ? (
 
                                <>
 
                                  <button onClick={() => restoreProgram(prog.id)} style={{ background: 'var(--bg-ecfdf5)', border: '1px solid var(--bd-a7f3d0)', color: 'var(--fg-047857)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>♻️ Ripristina</button>
 
                                  <button onClick={() => permanentlyDeleteProgram(prog.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Icona nome="cestino" size={12} /> Elimina definitivamente</button>
 
                                </>
 
                              ) : (
 
                                <>
 
                                  {!prog.trialStyle && (
 
                                    <button
 
                                      onClick={() => setRisultatiAperti({ progId: prog.id })}
 
                                      style={{ background: 'var(--bg-ecfdf5)', border: '1px solid var(--bd-6ee7b7)', color: 'var(--fg-047857)', borderRadius: '999px', padding: '7px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
 
                                    >
 
                                      <Icona nome="grafico" size={12} /> Risultati
 
                                    </button>
 
                                  )}
 
                                  {!prog.trialStyle && <button onClick={() => toggleProgramVisibility(prog)} title={prog.visibility === 'none' ? 'Rendi visibile agli atleti' : 'Nascondi agli atleti'} style={{ background: prog.visibility === 'none' ? 'var(--bg-fef3c7)' : 'var(--bg-f4f4f5)', border: prog.visibility === 'none' ? '1px solid var(--bd-fcd34d)' : '1px solid var(--bd-d4d4d8)', color: prog.visibility === 'none' ? 'var(--fg-92400e)' : 'var(--fg-3f3f46)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{prog.visibility === 'none' ? '👁 Mostra' : '🙈 Nascondi'}</button>}
 
                                  <button onClick={() => duplicateProgram(prog)} style={{ background: 'var(--bg-ecfdf5)', border: '1px solid var(--bd-a7f3d0)', color: 'var(--fg-047857)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
 
                                  <button onClick={() => {
 
                                    const progToEdit = JSON.parse(JSON.stringify(prog));
 
                                    progToEdit.weeks = normalizeProgramWeeks(progToEdit);
 
                                    setEditingProgram(progToEdit);
 
                                    if (progToEdit.weeks.length > 0) {
 
                                      setSelectedWeekView(progToEdit.weeks[0].weekName);
 
                                      if (progToEdit.weeks[0].days?.length > 0) setSelectedDayView(progToEdit.weeks[0].days[0].dayName);
 
                                    }
 
                                  }} style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', color: 'var(--fg-1d4ed8)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
 
                                  <button onClick={() => deleteProgram(prog.id)} style={{ background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', color: 'var(--fg-b91c1c)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
 
                                </>
 
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
 
 
 
          {subscriptionStatus === 'attivo' && bannerData.image_url && (
 
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
 
              {bannerData.link_url ? (
 
                <a href={bannerData.link_url} target="_blank" rel="noopener noreferrer">
 
                  <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', boxSizing: 'border-box', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--bd-26262a)', cursor: 'pointer' }} />
 
                </a>
 
              ) : (
 
                <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--bd-26262a)' }} />
 
              )}
 
            </div>
 
          )}
 
 
 
          {provaAttiva && trialChoice && (
 
            <div style={{ background: 'var(--bg-fef9c3)', border: '1px solid var(--bd-facc15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
 
              <span style={{ fontSize: '20px' }}>⏳</span>
 
              <span style={{ fontSize: '13px', color: 'var(--fg-854d0e)', fontWeight: 'bold' }}>
 
                Settimana di prova — {giorniProvaRimasti === 1 ? 'ultimo giorno' : `ancora ${giorniProvaRimasti} giorni`}
 
              </span>
 
            </div>
 
          )}
 
 
 
          {subscriptionStatus === 'prova' && !trialChoice && (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', borderRadius: '14px', border: '1px solid var(--bd-d8dde3)', padding: '20px', marginBottom: '20px' }}>
 
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--fg-10b981)', fontSize: '19px' }}>🎁 La tua settimana di prova</h3>
 
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--fg-475569)', lineHeight: 1.5 }}>
 
                Scegli lo stile di allenamento che preferisci: riceverai subito cinque giorni di allenamento da provare.
 
              </p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 
                {[
 
                  { k: 'pesi', icon: '🏋️', t: 'Sala Pesi', d: 'Forza e ipertrofia, schede classiche da palestra' },
 
                  { k: 'hybrid', icon: '🏃', t: 'Hybrid', d: 'Resistenza e forza insieme, lavoro continuo' },
 
                  { k: 'cross', icon: '🤸', t: 'Cross Training', d: 'Sollevamenti, ginnastica e circuiti misti' },
 
                ].map((s) => (
 
                  <button
 
                    key={s.k}
 
                    onClick={() => chooseTrial(s.k)}
 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '14px', borderRadius: '999px', border: '1px solid var(--bd-cbd5e1)', background: 'var(--bg-ffffff)', cursor: 'pointer' }}
 
                  >
 
                    <span style={{ fontSize: '26px' }}>{s.icon}</span>
 
                    <span style={{ flex: 1 }}>
 
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '15px', color: 'var(--fg-000000)' }}>{s.t}</span>
 
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--fg-64748b)' }}>{s.d}</span>
 
                    </span>
 
                    <span style={{ color: 'var(--fg-10b981)', fontWeight: 'bold' }}>→</span>
 
                  </button>
 
                ))}
 
              </div>
 
            </div>
 
          )}
 
 
 
          {(subscriptionStatus === 'scaduto' || provaScaduta) && (
 
            <div style={{ background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', borderRadius: '14px', padding: '24px 20px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 3px 14px rgba(0,0,0,0.32)' }}>
 
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>💪</div>
 
              <h3 style={{ margin: '0 0 8px 0', fontSize: '19px' }}>{provaScaduta ? 'La tua settimana di prova è finita' : 'Vuoi continuare ad allenarti con noi?'}</h3>
 
              <p style={{ margin: '0 0 18px 0', fontSize: '14px', lineHeight: 1.6, opacity: 0.95, whiteSpace: 'pre-line' }}>
 
                {trialCta.text || 'Scopri le programmazioni personalizzate e riprendi da dove hai lasciato.'}
 
              </p>
 
              <p style={{ margin: '0 0 18px 0', fontSize: '13px', lineHeight: 1.55, opacity: 0.95, background: 'rgba(var(--onacc-rgb), 0.12)', borderRadius: '10px', padding: '12px 14px' }}>
 
                Quella che hai provato è una scheda standard, uguale per tutti. Il percorso vero è un altro: viene costruito su di te, sui tuoi obiettivi, sul tempo che hai e su eventuali problematiche fisiche — e viene aggiornato man mano che progredisci.
 
              </p>
 
              {trialCta.link_url && (
 
                <a
 
                  href={trialCta.link_url}
 
                  target="_blank"
 
                  rel="noopener noreferrer"
 
                  style={{ display: 'inline-block', padding: '13px 26px', borderRadius: '10px', background: 'var(--bg-ffffff)', color: 'var(--fg-059669)', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}
 
                >
 
                  Scopri le programmazioni
 
                </a>
 
              )}
 
            </div>
 
          )}
 
 
 
 
 
 
 
          {activeTab === 'profile' ? (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
 
                <button onClick={() => setAthleteProfileTab('anagrafici')} style={{ ...pillola(athleteProfileTab === 'anagrafici', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>Dati Anagrafici</button>
 
                <button onClick={() => setAthleteProfileTab('anamnesi')} style={{ ...pillola(athleteProfileTab === 'anamnesi', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>Anamnesi</button>
 
                <button onClick={() => setAthleteProfileTab('privacy')} style={{ ...pillola(athleteProfileTab === 'privacy', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>Privacy</button>
 
              </div>
 
 
 
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
 
                <button onClick={() => setAthleteProfileTab('maxes')} style={{ ...pillola(athleteProfileTab === 'maxes', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>🏋🏻 Massimali</button>
 
                <button onClick={() => setAthleteProfileTab('gare')} style={{ ...pillola(athleteProfileTab === 'gare', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>🎯 Gare</button>
 
                <button onClick={() => setAthleteProfileTab('progressi')} style={{ ...pillola(athleteProfileTab === 'progressi', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>🚀 Percorso</button>
 
              </div>
 
 
 
              {athleteProfileTab === 'anagrafici' && (
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>Dati Anagrafici</h3>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Nome e Cognome</label>
 
                    <input type="text" value={personalData.full_name} onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Email</label>
 
                    <input type="text" value={session.user.email || ''} disabled style={{ overflowWrap: 'anywhere', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)', background: 'var(--bg-f1f5f9)', color: 'var(--fg-64748b)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
 
                    <input type="date" value={personalData.birth_date} onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  {isMinorenne(personalData.birth_date) && (
 
                    <div style={{ background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '8px', padding: '12px' }}>
 
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-92400e)', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
 
                      <input type="text" placeholder="Nome e cognome" value={personalData.guardian_name || ''} onChange={(e) => setPersonalData({ ...personalData, guardian_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                    </div>
 
                  )}
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Sesso</label>
 
                    <div style={{ display: 'flex', gap: '8px' }}>
 
                      {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                        <button key={k} type="button" onClick={() => setPersonalData({ ...personalData, gender: k })} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: personalData.gender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: personalData.gender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                      ))}
 
                    </div>
 
                  </div>
 
                  <div style={{ display: 'flex', gap: '12px' }}>
 
                    <div style={{ flex: 1 }}>
 
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Peso (kg)</label>
 
                      <input type="number" step="0.1" min="0" value={personalData.weight} onChange={(e) => setPersonalData({ ...personalData, weight: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                    </div>
 
                    <div style={{ flex: 1 }}>
 
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Altezza (cm)</label>
 
                      <input type="number" step="0.1" min="0" value={personalData.height} onChange={(e) => setPersonalData({ ...personalData, height: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                    </div>
 
                  </div>
 
                  <button
 
                    disabled={personalDataSaving}
 
                    onClick={() => savePersonalData(session.user.id, personalData, false)}
 
                    style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: personalDataSaving ? 0.6 : 1 }}
 
                  >
 
                    {personalDataSaving ? 'Salvataggio...' : 'Salva Dati Anagrafici'}
 
                  </button>
 
                </div>
 
              )}
 
 
 
              {athleteProfileTab === 'gare' && pannelloCompetizioni(session.user.id, competitions, false)}
 
 
 
              {athleteProfileTab === 'progressi' && pannelloProgressi(storicoCarichi, true, session.user.id)}
 
 
 
              {athleteProfileTab === 'maxes' && (
 
              <>
 
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
 
                <button onClick={() => setAthleteMaxSubTab('strength')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'strength' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'strength' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Strength PR</button>
 
                <button onClick={() => setAthleteMaxSubTab('metcon')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'metcon' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'metcon' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Metcon PR</button>
 
                <button onClick={() => setAthleteMaxSubTab('gym')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'gym' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'gym' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Gymnastics PR</button>
 
                  <button onClick={() => setAthleteMaxSubTab('bench')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'bench' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'bench' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Benchmark</button>
 
              </div>
 
 
 
              {athleteMaxSubTab === 'strength' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fg-10b981)' }}>Strength PR</h3>
 
 
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 
                {maxExerciseNames.map((exName) => (
 
                  <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                    <div style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '14px', marginBottom: '10px' }}>{exName}</div>
 
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', alignItems: 'stretch' }}>
 
                      {REP_SCHEMES.map((reps) => (
 
                        <div key={reps} style={{ background: 'var(--bg-ffffff)', padding: '8px 6px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', display: 'flex', flexDirection: 'column' }}>
 
                          <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>{reps} RM</label>
 
                          <input type="text" placeholder="kg" value={athleteMaxes[exName]?.[reps] || ''} onChange={(e) => handleMaxTyping(exName, reps, e.target.value)} onBlur={(e) => handleMaxChange(exName, reps, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }} />
 
                        </div>
 
                      ))}
 
                    </div>
 
 
 
                    <button
 
                      onClick={() => toggleMaxHistory(session.user.id, exName)}
 
                      style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 0 0 0' }}
 
                    >
 
                      {openHistoryKey === `${session.user.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                    </button>
 
 
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
 
                      <MaxHistoryChart points={historyCache[`${session.user.id}|${exName}`]} onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
 
                    )}
 
 
 
                  </div>
 
                ))}
 
              </div>
 
 
 
              </>
 
              )}
 
 
 
              {athleteMaxSubTab === 'metcon' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>⏱️ Metcon PR</h3>
 
              <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0' }}>Inserisci il tempo nel formato minuti:secondi (es. 1:45). Più basso è, meglio è.</p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                {metconPRNames.map((exName) => (
 
                  <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 
                      <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '13px' }}>{exName}</span>
 
                      <input
 
                        type="text"
 
                        placeholder="mm:ss"
 
                        value={athleteMaxes[exName]?.time || ''}
 
                        onChange={(e) => handleSpecialMaxTyping(exName, 'tempo', e.target.value)} onBlur={(e) => handleSpecialMaxChange(exName, 'tempo', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
 
                        style={{ width: '90px', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
 
                      />
 
                    </div>
 
                    <button onClick={() => toggleMaxHistory(session.user.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                      {openHistoryKey === `${session.user.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                    </button>
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
 
                      <SimpleHistoryChart points={historyCache[`${session.user.id}|${exName}`]} lowerIsBetter unit="tempo" onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
 
                    )}
 
 
 
                  </div>
 
                ))}
 
              </div>
 
 
 
              </>
 
              )}
 
 
 
              {athleteMaxSubTab === 'gym' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>🤸 Gymnastics PR</h3>
 
              <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0' }}>Massimo numero di ripetizioni consecutive (unbroken).</p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                {gymPRNames.map((exName) => (
 
                  <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 
                      <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '13px' }}>{exName}</span>
 
                      <input
 
                        type="number"
 
                        min="0"
 
                        placeholder="rep"
 
                        value={athleteMaxes[exName]?.reps || ''}
 
                        onChange={(e) => handleSpecialMaxTyping(exName, 'rep', e.target.value)} onBlur={(e) => handleSpecialMaxChange(exName, 'rep', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
 
                        style={{ width: '90px', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
 
                      />
 
                    </div>
 
                    <button onClick={() => toggleMaxHistory(session.user.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                      {openHistoryKey === `${session.user.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                    </button>
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
 
                      <SimpleHistoryChart points={historyCache[`${session.user.id}|${exName}`]} unit="rep" onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
 
                    )}
 
 
 
                  </div>
 
                ))}
 
              </div>
 
              </>
 
              )}
 
 
 
              {athleteMaxSubTab === 'bench' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>🏅 Benchmark WOD</h3>
 
              <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0' }}>Scegli il livello con cui l&apos;hai affrontato e registra il risultato.</p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 
                {BENCHMARK_WODS.map((b) => {
 
                  const lvl = benchLevel[b.name] || (athleteMaxes[b.name]?.level as any) || 'rx';
 
                  const saved = athleteMaxes[b.name]?.result || '';
 
                  const unita = b.type === 'time' ? 'tempo (mm:ss)' : b.type === 'rounds' ? 'round + rep' : 'ripetizioni';
 
                  return (
 
                    <div key={b.name} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
 
                        <span style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '16px' }}>{b.name}</span>
 
                        <div style={{ display: 'flex', gap: '4px' }}>
 
                          {[['rx', 'RX'], ['int', 'INT'], ['beg', 'BEG']].map(([k, label]) => (
 
                            <button key={k} onClick={() => setBenchLevel({ ...benchLevel, [b.name]: k as any })} style={{ padding: '4px 9px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{label}</button>
 
                          ))}
 
                        </div>
 
                      </div>
 
 
 
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(b, lvl)}</p>
 
                      <div style={{ fontSize: '11px', color: 'var(--fg-b45309)', background: 'var(--bg-fef3c7)', display: 'inline-block', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '10px' }}>🎯 Target: {benchTarget(b, lvl)}</div>
 
 
 
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                        <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', flex: 1 }}>Il tuo risultato — {unita}</span>
 
                        <ScoreInput
 
                          mode={b.type}
 
                          value={saved}
 
                          onChange={(v: string) => handleBenchTyping(b.name, v, lvl)}
 
                          onCommit={(v: string) => handleBenchSave(b.name, v, lvl, b.type)}
 
                        />
 
                      </div>
 
 
 
                      <button onClick={() => toggleMaxHistory(session.user.id, b.name)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                        {openHistoryKey === `${session.user.id}|${b.name}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                      </button>
 
                      {openHistoryKey === `${session.user.id}|${b.name}` && (
 
                        <SimpleHistoryChart points={historyCache[`${session.user.id}|${b.name}`]} lowerIsBetter={b.type === 'time'} unit={b.type === 'time' ? 'tempo' : b.type === 'rounds' ? 'round' : 'rep'} onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${b.name}`)} />
 
                      )}
 
                    </div>
 
                  );
 
                })}
 
              </div>
 
              </>
 
              )}
 
 
 
              </>
 
              )}
 
 
 
              {athleteProfileTab === 'anamnesi' && (
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
                  {needsAnamnesis && (
 
                    <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-93c5fd)', borderRadius: '8px', padding: '14px' }}>
 
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--fg-1e40af)', display: 'block', marginBottom: '4px' }}>👋 Benvenuto in AM Training!</span>
 
                      <span style={{ fontSize: '13px', color: 'var(--fg-1e3a8a)', lineHeight: 1.4 }}>
 
                        Prima di iniziare, compila la tua anamnesi: serve al coach per costruire un programma adatto a te e sicuro. Ci vuole un minuto.
 
                      </span>
 
                    </div>
 
                  )}
 
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>Anamnesi</h3>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
 
                    <textarea value={anamnesis.goal} onChange={(e) => setAnamnesis({ ...anamnesis, goal: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
 
                    <select value={anamnesis.weekly_sessions} onChange={(e) => setAnamnesis({ ...anamnesis, weekly_sessions: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                      <option value="">Seleziona...</option>
 
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
 
                    </select>
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
 
                    <select value={anamnesis.session_duration} onChange={(e) => setAnamnesis({ ...anamnesis, session_duration: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                      <option value="">Seleziona...</option>
 
                      <option value="30'">30'</option>
 
                      <option value="1 ora">1 ora</option>
 
                      <option value="1 ora e 30'">1 ora e 30'</option>
 
                      <option value="2 ore">2 ore</option>
 
                      <option value="più di 2 ore">più di 2 ore</option>
 
                    </select>
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
 
                    <textarea value={anamnesis.equipment} onChange={(e) => setAnamnesis({ ...anamnesis, equipment: e.target.value })} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
 
                    <textarea value={anamnesis.physical_issues} onChange={(e) => setAnamnesis({ ...anamnesis, physical_issues: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <button
 
                    disabled={anamnesisSaving}
 
                    onClick={() => saveAnamnesis(session.user.id, anamnesis, false)}
 
                    style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
 
                  >
 
                    {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
 
                  </button>
 
                </div>
 
              )}
 
 
 
              {athleteProfileTab === 'privacy' && (
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>Privacy e dati personali</h3>
 
 
 
                  <div style={{ background: 'var(--bg-f0fdf4)', border: '1px solid var(--bd-86efac)', borderRadius: '8px', padding: '12px' }}>
 
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-166534)', display: 'block', marginBottom: '4px' }}>Stato del consenso</span>
 
                    <span style={{ fontSize: '13px', color: 'var(--fg-334155)' }}>
 
                      {privacyConsentAt
 
                        ? `Consenso prestato il ${new Date(privacyConsentAt).toLocaleDateString('it-IT')} (informativa v${PRIVACY_VERSION})`
 
                        : 'Consenso non ancora registrato.'}
 
                    </span>
 
                  </div>
 
 
 
                  <div>
 
                    <button onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
 
                      {showPrivacyPolicy ? '▲ Nascondi informativa' : '▼ Leggi l\'informativa completa'}
 
                    </button>
 
                    {showPrivacyPolicy && (
 
                      <div style={{ marginTop: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '14px', maxHeight: '400px', overflowY: 'auto' }}>
 
                        <PrivacyPolicyContent minor={isMinorenne(personalData.birth_date)} />
 
                      </div>
 
                    )}
 
                  </div>
 
 
 
                  <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '6px' }}>🔑 Cambia password</span>
 
                    {!showChangePassword ? (
 
                      <button onClick={() => setShowChangePassword(true)} style={{ padding: '10px 16px', borderRadius: '999px', background: '#475569', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
 
                        Imposta una nuova password
 
                      </button>
 
                    ) : (
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                        <input type="password" placeholder="Nuova password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        <input type="password" placeholder="Ripeti la nuova password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        <div style={{ display: 'flex', gap: '8px' }}>
 
                          <button onClick={cambiaPassword} disabled={passwordSaving} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: passwordSaving ? 0.6 : 1 }}>
 
                            {passwordSaving ? 'Salvataggio...' : 'Salva'}
 
                          </button>
 
                          <button onClick={() => { setShowChangePassword(false); setNewPassword(''); setNewPassword2(''); }} style={{ padding: '10px 16px', borderRadius: '999px', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
 
                            Annulla
 
                          </button>
 
                        </div>
 
                      </div>
 
                    )}
 
                  </div>
 
 
 
                  <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '6px' }}>📥 Scarica i tuoi dati</span>
 
                    <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0', lineHeight: 1.4 }}>Ottieni una copia completa di tutti i dati che ti riguardano (anagrafica, anamnesi, massimali, risultati, programmi assegnati) in un file leggibile.</p>
 
                    <button onClick={downloadMyData} disabled={accountActionLoading} style={{ padding: '10px 16px', borderRadius: '999px', background: '#0284c7', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: accountActionLoading ? 0.6 : 1 }}>
 
                      {accountActionLoading ? 'Attendere...' : 'Scarica i miei dati'}
 
                    </button>
 
                  </div>
 
 
 
                  <div style={{ background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', borderRadius: '8px', padding: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-991b1b)', display: 'block', marginBottom: '6px' }}><Icona nome="cestino" size={12} /> Elimina il tuo account</span>
 
                    <p style={{ fontSize: '12px', color: 'var(--fg-7f1d1d)', margin: '0 0 10px 0', lineHeight: 1.4 }}>Cancella definitivamente l&apos;account e tutti i dati associati: anagrafica, anamnesi, massimali e risultati. L&apos;operazione non è reversibile.</p>
 
                    <button onClick={deleteMyAccount} disabled={accountActionLoading} style={{ padding: '10px 16px', borderRadius: '999px', background: '#dc2626', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: accountActionLoading ? 0.6 : 1 }}>
 
                      {accountActionLoading ? 'Attendere...' : 'Elimina account'}
 
                    </button>
 
                  </div>
 
 
 
                  <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', lineHeight: 1.4, margin: 0 }}>
 
                    Per rettificare i dati, limitare o opporti al trattamento, revocare il consenso o per qualsiasi altra richiesta, contatta il coach. Hai diritto di proporre reclamo al Garante per la protezione dei dati personali.
 
                  </p>
 
                </div>
 
              )}
 
            </div>
 
          ) : (
 
            <div>
 
              <CompetitionCountdown gare={competitions} />
 
 
 
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>I tuoi allenamenti</h3>
 
              {athletePrograms.length === 0 ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '36px 24px', borderRadius: '14px', border: '1px solid var(--bd-d8dde3)', textAlign: 'center' }}>
 
                  <svg viewBox="0 0 120 90" style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto 18px auto' }} aria-hidden="true">
 
                    {/* bilanciere appoggiato: nessun allenamento in corso */}
 
                    <rect x="16" y="43" width="88" height="4" rx="2" style={{ fill: 'var(--fg-cbd5e1)' }} />
 
                    <rect x="24" y="34" width="9" height="22" rx="3" style={{ fill: 'var(--fg-94a3b8)' }} />
 
                    <rect x="12" y="38" width="8" height="14" rx="3" style={{ fill: 'var(--fg-cbd5e1)' }} />
 
                    <rect x="87" y="34" width="9" height="22" rx="3" style={{ fill: 'var(--fg-94a3b8)' }} />
 
                    <rect x="100" y="38" width="8" height="14" rx="3" style={{ fill: 'var(--fg-cbd5e1)' }} />
 
                    <ellipse cx="60" cy="72" rx="34" ry="4" style={{ fill: 'var(--fg-e2e8f0)' }} />
 
                    <circle cx="60" cy="20" r="9" fill="none" style={{ stroke: 'var(--fg-10b981)' }} strokeWidth="2.5" strokeDasharray="3 3" />
 
                    <path d="M60 15v6l4 2" style={{ stroke: 'var(--fg-10b981)' }} strokeWidth="2.5" strokeLinecap="round" fill="none" />
 
                  </svg>
 
 
 
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--fg-334155)' }}>
 
                    {subscriptionStatus === 'prova' && !trialChoice
 
                      ? 'Scegli come iniziare'
 
                      : 'Nessun allenamento assegnato'}
 
                  </h4>
 
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-64748b)', lineHeight: 1.55, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
 
                    {subscriptionStatus === 'prova' && !trialChoice
 
                      ? 'Seleziona qui sopra lo stile di allenamento che preferisci per attivare la tua settimana di prova.'
 
                      : 'Il coach sta preparando il tuo programma. Appena sarà pronto lo troverai qui e riceverai una notifica.'}
 
                  </p>
 
                </div>
 
              ) : (
 
                athletePrograms.map((prog) => {
 
                  const weeks = normalizeProgramWeeks(prog);
 
                  const settimaneVisibili = weeks.filter((w: any) => !w?.hidden);
 
                  const sceltaSett = selectedWeeksByProgram[prog.id];
 
                  const currentProgramActiveWeek = (sceltaSett && settimaneVisibili.some((w: any) => w.weekName === sceltaSett))
 
                    ? sceltaSett
 
                    : (settimaneVisibili[0]?.weekName || '');
 
                  const currentWeekObj = weeks.find((w: any) => w.weekName === currentProgramActiveWeek) || settimaneVisibili[0];
 
                  const giorniVisibili = (currentWeekObj?.days || []).filter((d: any) => !d?.hidden);
 
                  const sceltaGiorno = selectedDaysByProgram[prog.id];
 
                  const currentProgramActiveDay = (sceltaGiorno && giorniVisibili.some((d: any) => d.dayName === sceltaGiorno))
 
                    ? sceltaGiorno
 
                    : (giorniVisibili[0]?.dayName || '');
 
                  const giorniScaduto = giorniDallaScadenza(prog.endDate);
 
                  const scaduto = giorniScaduto !== null && giorniScaduto > 0;
 
                  // ultimi sette giorni prima della fine: giorniDallaScadenza e' negativo
 
                  // finche' il programma e' valido, e vale zero il giorno stesso
 
                  const inScadenza = giorniScaduto !== null && giorniScaduto <= 0 && giorniScaduto >= -7;
 
                  const giorniRimasti = scaduto ? GIORNI_VISIBILITA_DOPO_SCADENZA - giorniScaduto : null;
 
 
 
                  return (
 
                    <div key={prog.id} style={{ background: scaduto ? 'var(--bg-fef2f2)' : 'var(--bg-ffffff)', color: 'var(--fg-000000)', boxShadow: '0 6px 22px rgba(0,0,0,0.45)', padding: '20px', borderRadius: '16px', border: scaduto ? '2px solid #ef4444' : inScadenza ? '2px solid #f97316' : '1px solid var(--bd-d8dde3)', marginBottom: '20px' }}>
 
                      {scaduto && (
 
                        <div style={{ background: 'var(--bg-fee2e2)', border: '1px solid var(--bd-fca5a5)', borderRadius: '10px', padding: '11px 13px', marginBottom: '14px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
 
                          <span style={{ fontSize: '17px', flexShrink: 0 }}>⛔</span>
 
                          <span style={{ fontSize: '12.5px', color: 'var(--fg-991b1b)', lineHeight: 1.5 }}>
 
                            <strong>Programma scaduto.</strong>{' '}
 
                            {giorniRimasti !== null && giorniRimasti > 0
 
                              ? `Resterà visibile ancora ${giorniRimasti} ${giorniRimasti === 1 ? 'giorno' : 'giorni'}, poi sparirà da questa schermata.`
 
                              : 'Sparirà da questa schermata a breve.'}
 
                          </span>
 
                        </div>
 
                      )}
 
 
 
                      <div style={{ marginBottom: '12px' }}>
 
                        <h4 style={{ overflowWrap: 'anywhere', color: 'var(--fg-10b981)', margin: '0 0 4px 0', fontSize: '18px' }}>{prog.title}</h4>
 
                        {(prog.startDate || prog.endDate) && (() => {
 
                          const st = getProgramDateStatus(prog.startDate, prog.endDate);
 
                          return (
 
                            <span style={{ display: 'block', fontSize: '11px', color: st.color, fontWeight: 'bold' }}>
 
                              {st.icon} {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}{st.label ? ` · ${st.label}` : ''}
 
                            </span>
 
                          );
 
                        })()}
 
                      </div>
 
 
 
                      {(() => {
 
                        const prog_ = progressiCompleti(prog, athleteResults[prog.id], storicoCarichi);
 
                        if (!prog_) return null;
 
                        return (
 
                          <button
 
                            onClick={() => setProgressiAperti({ dati: prog_, titolo: prog.title, perAtleta: true })}
 
                            style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '9px', marginBottom: '14px', padding: '12px 14px', borderRadius: '999px', border: '1px solid var(--bd-6ee7b7)', background: 'var(--bg-ecfdf5)', cursor: 'pointer' }}
 
                          >
 
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                              <Icona nome="grafico" size={17} style={{ color: 'var(--fg-047857)' }} />
 
                              <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-047857)' }}>I tuoi progressi</span>
 
                            </span>
 
                            <span style={{ fontSize: '12px', color: 'var(--fg-059669)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
 
                              {prog_.migliorati}/{prog_.totale}
 
                            </span>
 
                          </button>
 
                        );
 
                      })()}
 
 
 
                      {(prog.trainingTips || prog.nutritionTips) && (() => {
 
                        const aperto = openTipsProgram === prog.id;
 
                        const daLeggere = consigliDaLeggere(prog);
 
                        return (
 
                        <div style={{ marginBottom: '14px' }}>
 
                          <button
 
                            onClick={() => apriConsigli(prog.id, aperto)}
 
                            style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '12px 14px', borderRadius: '999px', border: '1px solid var(--bd-fde68a)', background: 'var(--bg-fffbeb)', cursor: 'pointer' }}
 
                          >
 
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                              <span style={{ fontSize: '18px' }}>💡</span>
 
                              <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-92400e)' }}>Consigli del coach</span>
 
                              {daLeggere && !aperto && (
 
                                <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>NUOVO</span>
 
                              )}
 
                            </span>
 
                            <span style={{ color: 'var(--fg-b45309)', fontWeight: 'bold', fontSize: '14px' }}>{aperto ? '▲' : '▼'}</span>
 
                          </button>
 
 
 
                          {aperto && (
 
                            <div style={{ marginTop: '8px' }}>
 
                              {prog.trainingTips && prog.nutritionTips && (
 
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
 
                                  <button onClick={() => setTipsTab('training')} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: tipsTab === 'training' ? 'var(--bg-10b981)' : 'var(--bg-f1f5f9)', color: tipsTab === 'training' ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🏋️ Allenamento</button>
 
                                  <button onClick={() => setTipsTab('nutrition')} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: tipsTab === 'nutrition' ? '#0284c7' : 'var(--bg-f1f5f9)', color: tipsTab === 'nutrition' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🥗 Nutrizione</button>
 
                                </div>
 
                              )}
 
 
 
                              {prog.trainingTips && (!prog.nutritionTips || tipsTab === 'training') && (
 
                                <div style={{ background: 'var(--bg-f0fdf4)', border: '1px solid var(--bd-86efac)', borderRadius: '10px', padding: '14px' }}>
 
                                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-166534)', marginBottom: '6px' }}>🏋️ Consigli di allenamento</span>
 
                                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{prog.trainingTips}</p>
 
                                </div>
 
                              )}
 
 
 
                              {prog.nutritionTips && (!prog.trainingTips || tipsTab === 'nutrition') && (
 
                                <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '10px', padding: '14px' }}>
 
                                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-1e40af)', marginBottom: '6px' }}>🥗 Consigli nutrizionali</span>
 
                                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{prog.nutritionTips}</p>
 
                                </div>
 
                              )}
 
                            </div>
 
                          )}
 
                        </div>
 
                        ); })()}
 
 
 
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
 
                        {weeks.map((week: any) => week?.hidden ? null : (
 
                          <button
 
                            key={week.weekName}
 
                            onClick={() => {
 
                              setSelectedWeeksByProgram(prev => ({ ...prev, [prog.id]: week.weekName }));
 
                              if (week.days && week.days.length > 0) {
 
                                const primoVisibile = (week.days || []).find((d: any) => !d?.hidden);
 
                                if (primoVisibile) setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: primoVisibile.dayName }));
 
                              }
 
                            }}
 
                            style={{
 
                              padding: '7px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
 
                              fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
 
                              background: currentProgramActiveWeek === week.weekName ? 'var(--bg-334155)' : 'var(--bg-e8edf3)',
 
                              color: currentProgramActiveWeek === week.weekName ? '#fff' : 'var(--fg-64748b)',
 
                            }}
 
                          >
 
                            {week.weekName}
 
                          </button>
 
                        ))}
 
                      </div>
 
 
 
                      {currentWeekObj?.days ? (
 
                        <div>
 
                          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
 
                            {currentWeekObj.days.map((day: any, idx: number) => {
 
                              if (day?.hidden) return null;
 
                              const attivo = currentProgramActiveDay === day.dayName;
 
 
 
                              // quanti blocchi di quel giorno hanno un risultato compilato
 
                              const wReale = weeks.findIndex((w: any) => w.weekName === currentProgramActiveWeek);
 
                              const tuttiDelGiorno = day.blocks || [];
 
                              const indiciDelGiorno = tuttiDelGiorno.map((_b: any, bi: number) => bi);
 
                              const blocchi = indiciDelGiorno.map((bi: number) => tuttiDelGiorno[bi]);
 
                              const fatti = indiciDelGiorno.filter((bi: number) => {
 
                                const r = athleteResults[prog.id]?.[`${wReale}_${idx}_${bi}`];
 
                                return r && (String(r.score || '').trim() || String(r.notes || '').trim() || r.done);
 
                              }).length;
 
                              const totale = blocchi.length;
 
                              const completo = totale > 0 && fatti === totale;
 
 
 
                              return (
 
                                <button
 
                                  key={idx}
 
                                  onClick={() => setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: day.dayName }))}
 
                                  style={{
 
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
 
                                    padding: '9px 15px', borderRadius: '999px', border: 'none', cursor: 'pointer',
 
                                    fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
 
                                    background: attivo ? 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)' : 'var(--bg-e8edf3)',
 
                                    color: attivo ? 'var(--onacc)' : 'var(--fg-334155)',
 
                                    boxShadow: attivo ? '0 3px 9px rgba(var(--acc-rgb), 0.4)' : 'none',
 
                                    transition: 'background .15s ease',
 
                                  }}
 
                                >
 
                                  {day.dayName}
 
                                  {totale > 0 && (
 
                                    <span
 
                                      title={`${fatti} di ${totale} compilati`}
 
                                      style={{
 
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
 
                                        minWidth: '19px', height: '19px', borderRadius: '999px', padding: '0 5px',
 
                                        fontSize: '10px', fontWeight: 'bold',
 
                                        background: completo ? (attivo ? 'rgba(var(--onacc-rgb), 0.2)' : 'var(--bg-10b981)')
 
: fatti > 0 ? (attivo ? 'rgba(var(--onacc-rgb), 0.2)' : '#fcd34d')
 
: (attivo ? 'rgba(var(--onacc-rgb), 0.2)' : 'var(--bg-cbd5e1)'),
 
color: attivo || completo ? 'var(--onacc)' : fatti > 0 ? '#101214' : 'var(--fg-334155)',
 
                                      }}
 
                                    >
 
                                      {completo ? <Icona nome="spunta" size={11} /> : `${fatti}/${totale}`}
 
                                    </span>
 
                                  )}
 
                                </button>
 
                              );
 
                            })}
 
                          </div>
 
 
 
                          {currentWeekObj.days.filter((d: any) => d.dayName === currentProgramActiveDay && !d?.hidden).map((day: any) => {
 
                            const realWeekIndex = weeks.findIndex((w: any) => w.weekName === currentProgramActiveWeek);
 
                            const realDayIndex = currentWeekObj.days.findIndex((d: any) => d.dayName === day.dayName);
 
                            const dayCollapseKey = `${prog.id}_w_${realWeekIndex}_d_${realDayIndex}`;
 
                            const isDayClosed = collapsedProgramDays[dayCollapseKey] === undefined ? true : collapsedProgramDays[dayCollapseKey];
 
 
 
                            return (
 
                              <div key={realDayIndex} style={{ background: 'var(--bg-eef2f7)', padding: '14px', borderRadius: '12px', border: '1px solid var(--bd-dbe3ec)', boxShadow: 'inset 0 2px 5px rgba(15,23,42,0.07)', marginBottom: '14px' }}>
 
                                <div
 
                                  onClick={() => toggleProgramDayCollapse(dayCollapseKey)}
 
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: isDayClosed ? '0' : '12px', cursor: 'pointer' }}
 
                                >
 
                                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-141416)' }}>{currentWeekObj.weekName} - {day.dayName}</span>
 
                                  <button
 
                                    type="button"
 
                                    onClick={(e) => { e.stopPropagation(); toggleProgramDayCollapse(dayCollapseKey); }}
 
                                    title={isDayClosed ? 'Apri' : 'Chiudi'}
 
                                    style={{ background: 'transparent', border: 'none', color: 'var(--fg-10b981)', padding: '4px 6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', lineHeight: 1, flexShrink: 0 }}
 
                                  >
 
                                    {isDayClosed ? '▼' : '▲'}
 
                                  </button>
 
                                </div>
 
 
 
                                {!isDayClosed && (
 
                                  <div>
 
                                    {day.blocks?.length === 0 ? (
 
                                      <p style={{ color: 'var(--fg-64748b)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nessun esercizio inserito.</p>
 
                                    ) : (
 
                                      day.blocks?.map((blk: any, bIdx: number) => {
 
                                        const blockKey = `ath_${prog.id}_${realWeekIndex}_${realDayIndex}_${bIdx}`;
 
                                        const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
 
                                        // La finestra dei risultati vale ovunque serva un punteggio.
 
                                        // Restano fuori Mobility e riscaldamento, che hanno la spunta.
 
                                        const usaFinestra = blk.type !== 'warmup' && !isMobility(blk.name);
 
                                        const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
 
 
                                        return (
 
                                          <div key={bIdx} style={{ background: 'var(--bg-ffffff)', padding: '14px', borderRadius: '10px', marginBottom: '10px', border: '1px solid var(--bd-e6ebf2)', boxShadow: '0 2px 6px rgba(15,23,42,0.09)' }}>
 
                                            <div
 
                                              onClick={() => toggleBlockCollapse(blockKey)}
 
                                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}
 
                                            >
 
                                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--fg-10b981)' }}>{blk.name || (haElenco(blk.type) ? nomeElenco(blk.type) : '')}</div>
 
                                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
 
                                                {(blk.type === 'wod' || blk.type === 'test') && (
 
                                                  <button
 
                                                    type="button"
 
                                                    onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'scelta', progId: prog.id, key: resultKey }); }}
 
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', padding: '7px 13px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(var(--acc-rgb), 0.35)' }}
 
                                                  >
 
                                                      <Icona nome="timer" size={13} /> Timer
 
                                                  </button>
 
                                                )}
 
                                                {blk.videoUrl && (
 
                                                  <a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '7px 13px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
 
                                                    <Icona nome="video" size={13} /> Video
 
                                                  </a>
 
                                                )}
 
                                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleBlockCollapse(blockKey); }} style={{ background: 'var(--bg-f1f5f9)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', padding: '4px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
 
                                              </div>
 
                                            </div>
 
 
 
                                            {!isClosed && (
 
                                              <div>
 
                                                {haElenco(blk.type) ? (
 
                                                  <div style={{ background: blk.type === 'superserie' ? 'var(--bg-ffffff)' : 'var(--bg-fffbeb)', border: blk.type === 'superserie' ? '1px solid var(--bd-e2e8f0)' : '1px solid var(--bd-fde68a)', borderRadius: '10px', padding: '12px' }}>
 
                                                    {(parseInt(String(blk.rounds || ''), 10) || 1) > 1 && (
 
                                                      <span style={{ display: 'inline-block', background: blk.type === 'superserie' ? '#c2410c' : '#f59e0b', color: blk.type === 'superserie' ? '#fff' : '#101214', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '999px', marginBottom: '9px' }}>
 
                                                        {parseInt(String(blk.rounds), 10)} round
 
                                                      </span>
 
                                                    )}
 
                                                    {(blk.items || []).length === 0 && (
 
                                                      <span style={{ fontSize: '12px', color: blk.type === 'superserie' ? 'var(--fg-64748b)' : 'var(--fg-a16207)' }}>Nessun esercizio inserito.</span>
 
                                                    )}
 
                                                    {(blk.items || []).map((it: any, i: number) => (
 
                                                      <React.Fragment key={i}>
 
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 26px 26px', alignItems: 'center', columnGap: '8px', padding: '7px 0', borderBottom: 'none' }}>
 
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: blk.type === 'superserie' ? 'var(--fg-334155)' : 'var(--fg-78350f)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                          {it.name}
 
                                                          {String(it.load || '').trim() ? (() => {
 
                                                            const suggerito = computeLoadHint(it.load, it.value, trovaMaxes(athleteMaxes, it.name));
 
                                                            return (
 
                                                              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 'normal', color: 'var(--fg-64748b)', marginTop: '2px' }}>
 
                                                                {it.load}
 
                                                                {suggerito ? <span style={{ color: 'var(--fg-1d4ed8)', fontWeight: 'bold' }}>{` \u00b7 ${suggerito}`}</span> : null}
 
                                                              </span>
 
                                                            );
 
                                                          })() : null}
 
                                                        </span>
 
 
 
                                                        <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: blk.type === 'superserie' ? 'var(--fg-475569)' : 'var(--fg-b45309)', overflowWrap: 'anywhere', maxWidth: '110px', textAlign: 'right' }}>
 
                                                          {it.value}
 
                                                        </span>
 
 
 
                                                        <span style={{ display: 'flex', justifyContent: 'center' }}>
 
                                                          {it.videoUrl && (
 
                                                            <a
 
                                                              href={it.videoUrl}
 
                                                              target="_blank"
 
                                                              rel="noopener noreferrer"
 
                                                              onClick={(e) => e.stopPropagation()}
 
                                                              title="Guarda il video"
 
                                                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '999px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 2px 5px rgba(37,99,235,0.3)' }}
 
                                                            >
 
                                                              <Icona nome="video" size={12} />
 
                                                            </a>
 
                                                          )}
 
                                                        </span>
 
 
 
                                                        <span style={{ display: 'flex', justifyContent: 'center' }}>
 
                                                          {(() => {
 
                                                            const sec = tempoDaValore(it.value);
 
                                                            if (!sec) return null;
 
                                                            return (
 
                                                              <button
 
                                                                onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: sec }); }}
 
                                                                title="Avvia il timer"
 
                                                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '999px', border: 'none', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', cursor: 'pointer', boxShadow: '0 2px 5px rgba(var(--acc-rgb), 0.35)' }}
 
                                                              >
 
                                                                <Icona nome="timer" size={14} />
 
                                                              </button>
 
                                                            );
 
                                                          })()}
 
                                                        </span>
 
                                                      </div>
 
                                                        {i < (blk.items.length - 1) && (() => {
 
                                                          const linea = blk.type === 'superserie' ? 'var(--fg-e2e8f0)' : '#fde68a';
 
                                                          const secRecEx = String(it.rest || '').trim() ? tempoDaValore(it.rest) : 0;
 
                                                          return (
 
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                                                              <span style={{ flex: 1, height: '1px', background: linea }} />
 
                                                              {String(it.rest || '').trim() ? (secRecEx ? (
 
                                                                <button
 
                                                                  onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: secRecEx }); }}
 
                                                                  title="Avvia questo recupero"
 
                                                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${linea}`, background: 'var(--bg-ffffff)', color: 'var(--fg-475569)', fontSize: '10.5px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                                >
 
                                                                  <Icona nome="timer" size={11} /> {`rec. ${it.rest}`}
 
                                                                </button>
 
                                                              ) : (
 
                                                                <span style={{ flexShrink: 0, fontSize: '10.5px', color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>{`rec. ${it.rest}`}</span>
 
                                                              )) : null}
 
                                                              <span style={{ flex: 1, height: '1px', background: linea }} />
 
                                                            </div>
 
                                                          );
 
                                                        })()}
 
                                                      </React.Fragment>
 
                                                    ))}
 
                                                    {blk.type !== 'superserie' && (
 
                                                    <button
 
                                                      onClick={() => handleResultChange(prog.id, resultKey, 'done', athleteResults[prog.id]?.[resultKey]?.done ? '' : 'si')}
 
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '9px', padding: '10px', borderRadius: '999px', cursor: 'pointer', marginTop: '10px', border: athleteResults[prog.id]?.[resultKey]?.done ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-fcd34d)', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-ecfdf5)' : 'var(--bg-ffffff)' }}
 
                                                    >
 
                                                      <span style={{ width: '20px', height: '20px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101214', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-10b981)' : '#fde68a' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done && <Icona nome="spunta" size={13} />}
 
                                                      </span>
 
                                                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--fg-047857)' : 'var(--fg-92400e)' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done ? 'Completato' : 'Segna come fatto'}
 
                                                      </span>
 
                                                    </button>
 
                                                    )}
 
 
 
                                                    {(() => {
 
                                                      const mm = parseInt(String(blk.warmRestMin ?? ''), 10) || 0;
 
                                                      const ss = parseInt(String(blk.warmRestSec ?? ''), 10) || 0;
 
                                                      const totale = mm * 60 + ss;
 
                                                      const grezzo = mmss(totale);
 
                                                      const senza = totale <= 0;
 
                                                      if (senza) {
 
                                                        return (
 
                                                          <span style={{ display: 'block', fontSize: '11px', color: blk.type === 'superserie' ? 'var(--fg-64748b)' : 'var(--fg-a16207)', marginTop: '7px', textAlign: 'center' }}>
 
                                                            Nessun recupero tra i round
 
                                                          </span>
 
                                                        );
 
                                                      }
 
                                                      return (
 
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '9px', marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-fef3c7)', border: '1px solid var(--bd-fcd34d)' }}>
 
                                                          <span style={{ fontSize: '12px', color: 'var(--fg-92400e)' }}>
 
                                                            Rest tra i round <strong style={{ fontSize: '14px' }}>{grezzo}</strong>
 
                                                          </span>
 
                                                          <button
 
                                                            onClick={() => { preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: totale }); }}
 
                                                            title="Avvia il recupero"
 
                                                            aria-label="Avvia il recupero"
 
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', padding: 0, background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(var(--acc-rgb), 0.35)' }}
 
                                                          >
 
                                                            <Icona nome="timer" size={16} />
 
                                                          </button>
 
                                                        </div>
 
                                                      );
 
                                                    })()}
 
 
 
                                                    {blk.notes && (
 
                                                      <p style={{ overflowWrap: 'anywhere', margin: '9px 0 0 0', fontSize: '11.5px', color: blk.type === 'superserie' ? 'var(--fg-334155)' : 'var(--fg-78350f)', lineHeight: 1.5, fontStyle: 'italic', background: blk.type === 'superserie' ? 'var(--bg-f8fafc)' : 'var(--bg-fef3c7)', borderRadius: '6px', padding: '8px 10px', whiteSpace: 'pre-line' }}>
 
                                                        {blk.notes}
 
                                                      </p>
 
                                                    )}
 
                                                  </div>
 
                                                ) : isMobility(blk.name) ? (
 
                                                  <div>
 
                                                    {blk.wodNotes && (
 
                                                      <div style={{ background: 'var(--bg-f5f3ff)', border: '1px solid var(--bd-ddd6fe)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
 
                                                        <p style={{ overflowWrap: 'anywhere', margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{blk.wodNotes}</p>
 
                                                      </div>
 
                                                    )}
 
                                                    <button
 
                                                      onClick={() => handleResultChange(prog.id, resultKey, 'done', athleteResults[prog.id]?.[resultKey]?.done ? '' : 'si')}
 
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '999px', cursor: 'pointer', marginBottom: '8px', border: athleteResults[prog.id]?.[resultKey]?.done ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-cbd5e1)', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-ecfdf5)' : 'var(--bg-ffffff)' }}
 
                                                    >
 
                                                      <span style={{ width: '22px', height: '22px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: 'var(--onacc)', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done ? '\u2713' : ''}
 
                                                      </span>
 
                                                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--fg-047857)' : 'var(--fg-334155)' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done ? 'Completata' : 'Segna come fatta'}
 
                                                      </span>
 
                                                    </button>
 
                                                  </div>
 
                                                ) : blk.type === 'test' ? (
 
                                                  <div style={{ background: 'var(--bg-eff6ff)', padding: '12px', borderRadius: '6px', border: '1px solid var(--bd-bfdbfe)', marginBottom: '8px', textAlign: 'center' }}>
 
                                                    <span style={{ fontSize: '16px', color: 'var(--fg-1e3a8a)', display: 'block', fontWeight: 'bold' }}>{blk.name || 'TEST'}</span>
 
                                                    <span style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--fg-1e40af)', letterSpacing: '0.5px' }}>
 
                                                        {gymPRNames.includes(blk.name) ? 'MAX REP UBK' : metconPRNames.includes(blk.name) ? 'MAX EFFORT' : 'TEST'}
 
                                                    </span>
 
                                                    {blk.target && <span style={{ overflowWrap: 'anywhere', display: 'block', fontSize: '12px', color: 'var(--fg-1e40af)', marginTop: '4px', fontWeight: 'normal' }}>{blk.target}</span>}
 
                                                    {(() => {
 
                                                      const bench = BENCHMARK_WODS.find((b) => b.name === blk.name);
 
                                                      if (!bench) return null;
 
                                                      const lvl = athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
 
                                                      return (
 
                                                        <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '6px', padding: '10px', marginTop: '8px', textAlign: 'left' }}>
 
                                                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
 
                                                            {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                              <button key={k} type="button" onClick={(e) => { e.stopPropagation(); handleResultChange(prog.id, resultKey, 'level', k); }} style={{ padding: '3px 10px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                            ))}
 
                                                          </div>
 
                                                          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                                          <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                                        </div>
 
                                                      );
 
                                                    })()}
 
                                                  </div>
 
                                                ) : blk.type === 'forza' ? (
 
                                                  <div>
 
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.sets}</span>
 
                                                      </div>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.reps}</span>
 
                                                      </div>
 
                                                    </div>
 
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.load}</span>
 
                                                      </div>
 
                                                      {(() => {
 
                                                        const secRec = parseRestSeconds(blk.rest);
 
                                                        return (
 
                                                        <div
 
                                                          onClick={() => { preparaAudio(); setTimerConfig(secRec ? { tipo: 'recupero', secondi: secRec } : { tipo: 'recupero', secondi: 90, daImpostare: true }); }}
 
                                                          style={{ background: 'var(--bg-ecfdf5)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-6ee7b7)', cursor: 'pointer' }}
 
                                                        >
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.rest}</span>
 
                                                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--fg-047857)', fontWeight: 'bold', marginTop: '3px' }}>
 
                                                          {secRec ? '⏱️ AVVIA TIMER' : '⏱️ IMPOSTA TIMER'}
 
                                                        </span>
 
                                                        </div>
 
                                                        ); })()}
 
                                                    </div>
 
 
 
                                                    {(() => {
 
                                                      const hint = computeLoadHint(blk.load, blk.reps, trovaMaxes(athleteMaxes, blk.name));
 
                                                      if (hint) {
 
                                                        return (
 
                                                          <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '9px 11px', marginTop: '8px' }}>
 
                                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--fg-1e40af)', marginBottom: '2px' }}>PESO CONSIGLIATO IN BASE AI TUOI RM</span>
 
                                                            <span style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: 'var(--fg-1d4ed8)' }}>{hint}</span>
 
                                                          </div>
 
                                                        );
 
                                                      }
 
 
 
                                                      // Nessun massimale per questo esercizio: mostro l'ultimo carico che ha usato
 
                                                      const usati = ultimoCaricoUsato(blk.name, blk.reps);
 
                                                      if (!usati || usati.length === 0) return null;
 
                                                      return (
 
                                                        <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '9px 11px', marginTop: '8px' }}>
 
                                                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--fg-64748b)', marginBottom: '3px' }}>
 
                                                            {usati.length === 1 ? 'L\u2019ULTIMA VOLTA AVEVI USATO' : 'CARICHI CHE HAI GIÀ USATO'}
 
                                                          </span>
 
                                                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', flexWrap: 'wrap' }}>
 
                                                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: String(usati[0].reps ?? '') === String(blk.reps ?? '') ? 'var(--fg-047857)' : 'var(--fg-334155)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                              {usati[0].reps ? `${usati[0].reps} rip. → ` : ''}{mostraCarico(usati[0])}
 
                                                            </span>
 
                                                            {usati.length > 1 && (
 
                                                              <span style={{ fontSize: '11px', color: 'var(--fg-94a3b8)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                                {usati.slice(1).map((u: any) => `${u.reps ? u.reps + ' rip. ' : ''}${mostraCarico(u).replace(' kg', '')}`).join(' · ')}
 
                                                              </span>
 
                                                            )}
 
                                                          </div>
 
                                                        </div>
 
                                                      );
 
                                                    })()}
 
                                                    {blk.notes && (
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE</span>
 
                                                        <p style={{ overflowWrap: 'anywhere', margin: '2px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)' }}>{blk.notes}</p>
 
                                                      </div>
 
                                                    )}
 
                                                  </div>
 
                                                ) : (
 
                                                  <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '8px' }}>
 
                                                    <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</span>
 
                                                    <p style={{ overflowWrap: 'anywhere', margin: '2px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
 
                                                  </div>
 
                                                )}
 
 
 
                                                {blk.type === 'wod' && (blk.items || []).some((it: any) => it.name && it.videoUrl) && (
 
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '9px', marginBottom: '2px' }}>
 
                                                    {(blk.items || []).filter((it: any) => it.name && it.videoUrl).map((it: any, i: number) => (
 
                                                      <a
 
                                                        key={i}
 
                                                        href={it.videoUrl}
 
                                                        target="_blank"
 
                                                        rel="noopener noreferrer"
 
                                                        onClick={(e) => e.stopPropagation()}
 
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 2px 5px rgba(37,99,235,0.3)' }}
 
                                                      >
 
                                                        <Icona nome="video" size={12} /> {it.name}
 
                                                      </a>
 
                                                    ))}
 
                                                  </div>
 
                                                )}
 
 
 
 
 
                                                {blk.type !== 'warmup' && (
 
                                                <div style={{ marginTop: '10px', background: 'var(--bg-f1f5f9)', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                                  <span style={{ fontSize: '11px', color: 'var(--fg-10b981)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 I TUOI RISULTATI / NOTE:</span>
 
                                                  {usaFinestra && blk.scoreUnit !== 'spunta' && (
 
                                                    <button
 
                                                      onClick={() => setScoreAperto({ progId: prog.id, key: resultKey, blk, lvl: athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel })}
 
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '9px', padding: '11px', borderRadius: '999px', border: 'none', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 7px rgba(var(--acc-rgb), 0.32)' }}
 
                                                    >
 
                                                      <Icona nome="modifica" size={14} /> {blk.type === 'forza' && (!blk.scoreUnit || blk.scoreUnit === 'kg') ? 'Inserisci i carichi' : 'Segna il risultato'}
 
                                                    </button>
 
                                                  )}
 
                                                  {usaFinestra ? (
 
                                                    /* Con la finestra dei carichi il riepilogo si legge qui, non si digita */
 
                                                    (() => {
 
                                                      const dato = athleteResults[prog.id]?.[resultKey];
 
                                                      return (
 
                                                        <>
 
                                                        {blk.scoreUnit !== 'spunta' && (
 
                                                        <RiepilogoScore
 
                                                          punteggio={String(dato?.score || '').trim()}
 
                                                          note={String(dato?.notes || '').trim()}
 
                                                        />
 
                                                        )}
 
                                                          {blk.scoreUnit === 'spunta' && (<><SpuntaFatta fatto={!!dato?.done} onChange={(v: string) => handleResultChange(prog.id, resultKey, 'done', v)} /><CampoNote valore={dato?.notes} onSalva={(v: string) => handleResultChange(prog.id, resultKey, 'notes', v)} /></>)}
 
                                                        </>
 
                                                      );
 
                                                    })()
 
 
                                                  ) : (
 
                                                  <div style={{ display: 'grid', gridTemplateColumns: isMobility(blk.name) ? '1fr' : '1fr 2fr', gap: '8px' }}>
 
                                                    {!isMobility(blk.name) && blk.type !== 'warmup' && (
 
                                                    <div>
 
                                                      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>Score / Carico</label>
 
                                                      {(() => {
 
                                                        const bench = BENCHMARK_WODS.find((b: any) => b.name === blk.name);
 
                                                        const mode = bench ? bench.type
 
                                                          : metconPRNames.includes(blk.name) ? 'time'
 
                                                          : gymPRNames.includes(blk.name) ? 'reps'
 
                                                          : 'text';
 
                                                        const lvl = athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
 
                                                        return (
 
                                                          <ScoreInput
 
                                                            mode={mode}
 
                                                            value={athleteResults[prog.id]?.[resultKey]?.score || ''}
 
                                                            onChange={(v: string) => handleResultChange(prog.id, resultKey, 'score', v)}
 
                                                            onCommit={(v: string) => maybeUpdateMaxFromScore(session.user.id, blk.name || '', blk.reps, v, false, blk.type, lvl)}
 
                                                          />
 
                                                        );
 
                                                      })()}
 
                                                    </div>
 
                                                    )}
 
                                                    <div>
 
                                                      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>Note personali</label>
 
                                                      <input type="text" placeholder="Sensazioni..." value={athleteResults[prog.id]?.[resultKey]?.notes || ''} onChange={(e) => handleResultChange(prog.id, resultKey, 'notes', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                                    </div>
 
                                                  </div>
 
                                                  )}
 
                                                </div>
 
                                                )}
 
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
 
 
 
      <div style={{
 
        position: 'fixed',
 
        left: 0,
 
        right: 0,
 
        bottom: 0,
 
        display: 'flex',
 
        background: 'var(--bg-1a1a1d)',
 
        transform: 'translateZ(0)',
 
        WebkitTransform: 'translateZ(0)',
 
        WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden',
 
        borderTop: '1px solid var(--bd-2a2a2e)',
 
        paddingBottom: 'env(safe-area-inset-bottom)',
 
        zIndex: 500
 
      }}>
 
        {(role === 'coach'
 
          ? [
 
              { key: 'programs', icon: '📋', label: 'Programmi' },
 
              { key: 'athletes', icon: '👤', label: 'Profili' },
 
              { key: 'banner', icon: '📢', label: 'Banner' },
 
            ]
 
          : [
 
              { key: 'create', icon: '🏋️', label: 'Allenamenti' },
 
              { key: 'profile', icon: '👤', label: 'Profilo' },
 
            ]
 
        ).map((item) => {
 
          const active = role === 'coach' ? coachSubView === item.key : activeTab === item.key;
 
          return (
 
            <button
 
              key={item.key}
 
              onClick={() => {
 
                if (role === 'coach') {
 
                  setCoachSubView(item.key as any);
 
                  if (item.key === 'programs') setEditingProgram(null);
 
                  if (item.key === 'athletes') setSelectedCoachAthlete(null);
 
                } else {
 
                  setActiveTab(item.key as any);
 
                }
 
              }}
 
              style={{
 
                flex: 1,
 
                background: 'none',
 
                border: 'none',
 
                cursor: 'pointer',
 
                padding: '10px 2px 20px 2px',
 
                display: 'flex',
 
                flexDirection: 'column',
 
                alignItems: 'center',
 
                gap: '3px',
 
                color: active ? 'var(--fg-10b981)' : 'var(--fg-94a3b8)',
 
                borderTop: active ? '2px solid var(--bd-10b981)' : '2px solid transparent'
 
              }}
 
            >
 
              <span style={{ fontSize: '19px', lineHeight: 1 }}>{item.icon}</span>
 
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.label}</span>
 
            </button>
 
          );
 
        })}
 
      </div>
 
    </div>
 
  );
 
}
 
 
// Casella della modifica rapida: si scrive e si salva appena si esce dal campo.
 
function CampoRapido({ etichetta, valore, onSalva, largo }: any) {
 
  const [t, setT] = useState(String(valore ?? ''));
 
  useEffect(() => {
 
    setT(String(valore ?? ''));
 
  }, [valore]);
 
  return (
 
    <label style={{ display: 'block', gridColumn: largo ? '1 / -1' : 'auto', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '6px 9px' }}>
 
      <span style={{ display: 'block', fontSize: '10px', color: 'var(--fg-64748b)' }}>{etichetta}</span>
 
      <input
 
        value={t}
 
        onChange={(e: any) => setT(e.target.value)}
 
        onBlur={() => {
 
          if (t !== String(valore ?? '')) onSalva(t);
 
        }}
 
        enterKeyHint="done"
 
        style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent', color: 'var(--fg-000000)', fontSize: '15px', fontWeight: 'bold', padding: '3px 0' }}
 
      />
 
    </label>
 
  );
 
}
 
function GrigliaModificaRapida({ blk, onSalva }: any) {
 
  const campi: string[][] = [['sets', 'SET'], ['reps', 'REP'], ['load', 'CARICO'], ['rest', 'REC.']];
 
  return (
 
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginBottom: '10px' }}>
 
      {campi.map(([k, etichetta]) => (
 
        <CampoRapido key={k} etichetta={etichetta} valore={blk[k]} onSalva={(v: string) => onSalva(k, v)} />
 
      ))}
 
      <CampoRapido largo etichetta="NOTE" valore={blk.notes} onSalva={(v: string) => onSalva('notes', v)} />
 
    </div>
 
  );
 
}
 

 
// Pagina: tiene il tema scelto (anche sul dispositivo) e lo passa all'app.
 
export default function Page() {
 
  const [tema, setTema] = useState<string>('scuro');
 
  useEffect(() => {
 
    try {
 
      const t = window.localStorage.getItem('amt_tema');
 
      if (t && TEMI[t]) {
 
        TEMA_ATTIVO = t;
 
        setTema(t);
 
      }
 
    } catch (e) {
 
      // se il dispositivo non permette di salvare, resta il tema predefinito
 
    }
 
  }, []);
 
  const impostaTema = (t: string) => {
 
    if (!TEMI[t]) return;
 
    TEMA_ATTIVO = t;
 
    setTema(t);
 
    try {
 
      window.localStorage.setItem('amt_tema', t);
 
    } catch (e) {
 
      // niente da fare
 
    }
 
  };
 
  return (
 
    <>
 
      <StileTema tema={tema} />
 
      <TrainingApp tema={tema} impostaTema={impostaTema} />
 
    </>
 
  );
 
}
 
                          <button onClick={() => removePrExercise(exName)} title="Togli dall'elenco PR" style={{ background: 'none', border: 'none', color: 'var(--fg-ef4444)', cursor: 'pointer', fontSize: '15px', padding: '0 2px' }}>×</button>
 
                        </div>
 
                        <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                        </button>
 
                        {openHistoryKey === `${selectedCoachAthlete.id}|${exName}` && (
 
                          <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${exName}`]} unit="rep" onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${exName}`)} />
 
                        )}
 
 
 
                      </div>
 
                    ))}
 
                  </div>
 
                  </div>
 
                  )}
 
 
 
                  {coachMaxSubTab === 'bench' && (
 
                  <div>
 
                  <h4 style={{ fontSize: '15px', margin: '0 0 8px 0', color: 'var(--fg-10b981)' }}>🏅 Benchmark WOD</h4>
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 
                    {BENCHMARK_WODS.map((b) => {
 
                      const dato = coachAthleteMaxes[selectedCoachAthlete.id]?.[b.name];
 
                      const lvl = benchLevel[b.name] || dato?.level || 'rx';
 
                      return (
 
                        <div key={b.name} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
 
                            <span style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '15px' }}>{b.name}</span>
 
                            <div style={{ display: 'flex', gap: '4px' }}>
 
                              {[['rx', 'RX'], ['int', 'INT'], ['beg', 'BEG']].map(([k, label]) => (
 
                                <button key={k} onClick={() => setBenchLevel({ ...benchLevel, [b.name]: k as any })} style={{ padding: '4px 9px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{label}</button>
 
                              ))}
 
                            </div>
 
                          </div>
 
                          <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(b, lvl)}</p>
 
                          <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginBottom: '8px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(b, lvl)}</div>
 
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                            <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', flex: 1 }}>Risultato</span>
 
                            <ScoreInput
 
                              mode={b.type}
 
                              value={dato?.result || ''}
 
                              onChange={(v: string) => handleBenchTyping(b.name, v, lvl, selectedCoachAthlete.id)}
 
                              onCommit={(v: string) => handleBenchSave(b.name, v, lvl, b.type, selectedCoachAthlete.id)}
 
                            />
 
                          </div>
 
                          <button onClick={() => toggleMaxHistory(selectedCoachAthlete.id, b.name)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                            {openHistoryKey === `${selectedCoachAthlete.id}|${b.name}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                          </button>
 
                          {openHistoryKey === `${selectedCoachAthlete.id}|${b.name}` && (
 
                            <SimpleHistoryChart points={historyCache[`${selectedCoachAthlete.id}|${b.name}`]} lowerIsBetter={b.type === 'time'} unit={b.type === 'time' ? 'tempo' : b.type === 'rounds' ? 'round' : 'rep'} onDelete={(id) => deleteHistoryPoint(id, `${selectedCoachAthlete.id}|${b.name}`)} />
 
                          )}
 
                        </div>
 
                      );
 
                    })}
 
                  </div>
 
                  </div>
 
                  )}
 
 
 
                  </div>
 
                  )}
 
 
 
                  {coachAthleteDetailTab === 'abbonamento' && (() => {
 
                    const stato = coachSubs[selectedCoachAthlete.id] || 'prova';
 
                    const opzioni = [
 
                      { k: 'attivo',  t: 'Attivo',  d: 'Vede le sue schede e il banner promozionale', bg: 'var(--bg-dcfce7)', bd: '#4ade80', fg: 'var(--fg-166534)' },
 
                      { k: 'prova',   t: 'In prova', d: 'Vede solo la settimana di prova che ha scelto', bg: 'var(--bg-fef9c3)', bd: '#facc15', fg: 'var(--fg-854d0e)' },
 
                      { k: 'scaduto', t: 'Scaduto',  d: 'Nessuna scheda: vede l\u2019invito ad abbonarsi', bg: 'var(--bg-fee2e2)', bd: '#f87171', fg: 'var(--fg-991b1b)' },
 
                    ];
 
                    return (
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
 
                        <h4 style={{ fontSize: '15px', margin: 0, color: 'var(--fg-10b981)' }}>Stato abbonamento</h4>
 
                        <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: 0, lineHeight: 1.45 }}>
 
                          Chi si registra parte automaticamente &quot;In prova&quot;. Cambia lo stato quando acquista o quando l&apos;abbonamento finisce.
 
                        </p>
 
 
 
                        {opzioni.map((o) => (
 
                          <button
 
                            key={o.k}
 
                            onClick={() => setAthleteSubscription(selectedCoachAthlete.id, o.k)}
 
                            style={{
 
                              display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
 
                              padding: '14px', borderRadius: '10px', cursor: 'pointer',
 
                              background: stato === o.k ? o.bg : 'var(--bg-ffffff)',
 
                              border: stato === o.k ? `2px solid ${o.bd}` : '1px solid var(--bd-e2e8f0)',
 
                            }}
 
                          >
 
                            <span style={{
 
                              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
 
                              border: `2px solid ${stato === o.k ? o.bd : 'var(--bd-cbd5e1)'}`,
 
                              background: stato === o.k ? o.bd : 'transparent',
 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
 
                              color: '#fff', fontSize: '12px', fontWeight: 'bold',
 
                            }}>{stato === o.k ? '\u2713' : ''}</span>
 
                            <span style={{ flex: 1 }}>
 
                              <span style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', color: stato === o.k ? o.fg : 'var(--fg-334155)' }}>{o.t}</span>
 
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--fg-64748b)', marginTop: '2px' }}>{o.d}</span>
 
                            </span>
 
                          </button>
 
                        ))}
 
 
 
                        <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '12px', marginTop: '4px' }}>
 
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '6px' }}>Settimana di prova</span>
 
                          <select
 
                            value={selectedCoachAthlete.trial_choice || ''}
 
                            onChange={(e) => setAthleteTrialStyle(selectedCoachAthlete.id, e.target.value)}
 
                            style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)', marginBottom: '6px' }}
 
                          >
 
                            <option value="">Non ancora scelta</option>
 
                            <option value="pesi">🏋️ Sala Pesi</option>
 
                            <option value="hybrid">🏃 Hybrid</option>
 
                            <option value="cross">🤸 Cross Training</option>
 
                          </select>
 
                          <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', lineHeight: 1.4, display: 'block' }}>
 
                            Solo tu puoi cambiare lo stile: l'atleta lo sceglie una volta sola. La scadenza resta di sette giorni dall'iscrizione e non riparte.
 
                          </span>
 
                        </div>
 
                      </div>
 
                    );
 
                  })()}
 
 
 
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
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
 
                          <textarea value={athAnamnesi.goal} onChange={(e) => updateField('goal', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
 
                          <select value={athAnamnesi.weekly_sessions} onChange={(e) => updateField('weekly_sessions', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                            <option value="">Seleziona...</option>
 
                            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
 
                          </select>
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
 
                          <select value={athAnamnesi.session_duration} onChange={(e) => updateField('session_duration', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                            <option value="">Seleziona...</option>
 
                            <option value="30'">30'</option>
 
                            <option value="1 ora">1 ora</option>
 
                            <option value="1 ora e 30'">1 ora e 30'</option>
 
                            <option value="2 ore">2 ore</option>
 
                            <option value="più di 2 ore">più di 2 ore</option>
 
                          </select>
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
 
                          <textarea value={athAnamnesi.equipment} onChange={(e) => updateField('equipment', e.target.value)} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <div>
 
                          <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
 
                          <textarea value={athAnamnesi.physical_issues} onChange={(e) => updateField('physical_issues', e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                        </div>
 
                        <button
 
                          disabled={anamnesisSaving}
 
                          onClick={() => saveAnamnesis(selectedCoachAthlete.id, athAnamnesi, true)}
 
                          style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
 
                        >
 
                          {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
 
                        </button>
 
                      </div>
 
                    );
 
                  })()}
 
                </div>
 
              ) : (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'var(--fg-10b981)' }}>Seleziona un Atleta</h3>
 
 
 
 <div style={{ position: 'relative', marginBottom: '12px' }}>
 
   <input
 
     type="text"
 
     placeholder="Cerca un atleta..."
 
     value={cercaProfili}
 
     onChange={(e: any) => setCercaProfili(e.target.value)}
 
     style={{ width: '100%', boxSizing: 'border-box', padding: '11px 34px 11px 12px', borderRadius: '10px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}
 
   />
 
   {cercaProfili && (
 
     <button onClick={() => setCercaProfili('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
 
       <Icona nome="chiudi" size={15} />
 
     </button>
 
   )}
 
 </div>
 
 
 
                  {!showAddAthlete ? (
 
                    <button
 
                      onClick={() => setShowAddAthlete(true)}
 
                      style={{ width: '100%', boxSizing: 'border-box', marginBottom: '14px', padding: '12px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
 
                    >
 
                      ➕ Aggiungi atleta manualmente
 
                    </button>
 
                  ) : (
 
                    <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
 
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--fg-10b981)' }}>Nuovo atleta</h4>
 
                      <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: 'var(--fg-64748b)', lineHeight: 1.45 }}>
 
                        L&apos;account viene creato già attivo, senza email di conferma. Comunica tu email e password all&apos;atleta: al primo accesso gli verrà chiesto di accettare l&apos;informativa privacy e potrà cambiare la password dal suo profilo.
 
                      </p>
 
 
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
 
                        <div style={{ display: 'flex', gap: '9px' }}>
 
                          <input type="text" placeholder="Nome" value={newAthlete.first_name} onChange={(e) => setNewAthlete({ ...newAthlete, first_name: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          <input type="text" placeholder="Cognome" value={newAthlete.last_name} onChange={(e) => setNewAthlete({ ...newAthlete, last_name: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        </div>
 
                        <input type="email" placeholder="Email" value={newAthlete.email} onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        <input type="text" placeholder="Password provvisoria (min. 6 caratteri)" value={newAthlete.password} onChange={(e) => setNewAthlete({ ...newAthlete, password: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
 
 
                        <div>
 
                          <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
 
                          <input type="date" value={newAthlete.birth_date} onChange={(e) => setNewAthlete({ ...newAthlete, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        </div>
 
 
 
                        {isMinorenne(personalData.birth_date) && (
 
                          <div style={{ background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '8px', padding: '12px' }}>
 
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-92400e)', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
 
                            <input type="text" placeholder="Nome e cognome" value={personalData.guardian_name || ''} onChange={(e) => setPersonalData({ ...personalData, guardian_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          </div>
 
                        )}
 
                        <div>
 
                          <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Sesso</label>
 
                          <div style={{ display: 'flex', gap: '8px' }}>
 
                            {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                              <button key={k} type="button" onClick={() => setNewAthlete({ ...newAthlete, gender: k })} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: newAthlete.gender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: newAthlete.gender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                            ))}
 
                          </div>
 
                        </div>
 
 
 
                        <div style={{ display: 'flex', gap: '9px' }}>
 
                          <input type="number" step="0.1" min="0" placeholder="Peso (kg)" value={newAthlete.weight} onChange={(e) => setNewAthlete({ ...newAthlete, weight: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                          <input type="number" step="0.1" min="0" placeholder="Altezza (cm)" value={newAthlete.height} onChange={(e) => setNewAthlete({ ...newAthlete, height: e.target.value })} style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        </div>
 
 
 
                        <div>
 
                          <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Abbonamento</label>
 
                          <select value={newAthlete.subscription_status} onChange={(e) => setNewAthlete({ ...newAthlete, subscription_status: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}>
 
                            <option value="attivo">✅ Attivo</option>
 
                            <option value="prova">🎁 In prova</option>
 
                            <option value="scaduto">⛔ Scaduto</option>
 
                          </select>
 
                        </div>
 
 
 
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
 
                          <button onClick={creaAtletaManuale} disabled={addingAthlete} style={{ flex: 1, minWidth: 0, padding: '12px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', opacity: addingAthlete ? 0.6 : 1 }}>
 
                            {addingAthlete ? 'Creazione...' : 'Crea atleta'}
 
                          </button>
 
                          <button onClick={() => { setShowAddAthlete(false); setNewAthlete(emptyNewAthlete); }} style={{ padding: '12px 16px', borderRadius: '999px', border: 'none', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
 
                            Annulla
 
                          </button>
 
                        </div>
 
                      </div>
 
                    </div>
 
                  )}
 
                  {athletes.length === 0 ? (
 
                    <p style={{ color: 'var(--fg-64748b)' }}>Nessun atleta registrato.</p>
 
                  ) : athletes.filter((a: any) => contiene(a.full_name || a.email, cercaProfili)).length === 0 ? (
 
                    <p style={{ color: 'var(--fg-94a3b8)', fontSize: '13px' }}>Nessun atleta con &quot;{cercaProfili}&quot;.</p>
 
                  ) : (
 
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                      {athletes.filter((a: any) => contiene(a.full_name || a.email, cercaProfili)).map((a) => (
 
                        <div key={a.id} onClick={() => setSelectedCoachAthlete(a)} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--bd-e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
 
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
 
                            {(() => {
 
                              const st = coachSubs[a.id] || 'prova';
 
                              const col = st === 'attivo' ? '#22c55e' : st === 'scaduto' ? 'var(--fg-ef4444)' : '#eab308';
 
                              const lab = st === 'attivo' ? 'Attivo' : st === 'scaduto' ? 'Scaduto' : 'In prova';
 
                              return <span title={lab} style={{ width: '10px', height: '10px', borderRadius: '50%', background: col, flexShrink: 0 }} />;
 
                            })()}
 
                            <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-000000)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name || a.email}</span>
 
                          </span>
 
                          <span style={{ fontSize: '12px', color: 'var(--fg-10b981)' }}>Visualizza Profilo →</span>
 
                        </div>
 
                      ))}
 
                    </div>
 
                  )}
 
                </div>
 
              )}
 
            </div>
 
          ) : editingProgram ? (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 
                <h3 style={{ fontSize: '18px', color: 'var(--fg-10b981)', margin: 0 }}>Modifica Programma</h3>
 
                <button onClick={() => setEditingProgram(null)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px' }}>Annulla</button>
 
              </div>
 
 
 
              <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Titolo Programma:</label>
 
              <input type="text" value={editingProgram.title} onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', marginBottom: '12px', boxSizing: 'border-box' }} />
 
 
 
              {editingProgram.trialStyle ? (
 
                <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
 
                  <span style={{ fontSize: '12px', color: 'var(--fg-1e40af)', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>📅 Durata automatica</span>
 
                  <span style={{ fontSize: '12px', color: 'var(--fg-1e3a8a)', lineHeight: 1.4 }}>Le settimane di prova durano sette giorni dal momento in cui l&apos;atleta le sceglie, quindi le date non servono.</span>
 
                </div>
 
              ) : (
 
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
 
                <div>
 
                  <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
 
                  <input type="date" value={editingProgram.startDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
{editingProgram.startDate && (<button type="button" onClick={() => setEditingProgram({ ...editingProgram, startDate: '' })} style={{ marginTop: '6px', background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', color: 'var(--fg-b91c1c)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancella data</button>)}
 
                </div>
 
                <div>
 
                  <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
 
                  <input type="date" value={editingProgram.endDate || ''} onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
{editingProgram.endDate && (<button type="button" onClick={() => setEditingProgram({ ...editingProgram, endDate: '' })} style={{ marginTop: '6px', background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', color: 'var(--fg-b91c1c)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancella data</button>)}
 
                </div>
 
              </div>
 
              )}
 
 
 
              <div style={{ marginBottom: '20px' }}>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Settimana di prova:</label>
 
                <select value={editingProgram.trialStyle || ''} onChange={(e) => setEditingProgram({ ...editingProgram, trialStyle: e.target.value || null })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                  <option value="">Non è un programma di prova</option>
 
                  <option value="pesi">🏋️ Prova — Sala Pesi</option>
 
                  <option value="hybrid">🏃 Prova — Hybrid</option>
 
                  <option value="cross">🤸 Prova — Cross Training</option>
 
                </select>
 
                {editingProgram.trialStyle === 'pesi' && (
 
                  <div style={{ marginBottom: '12px' }}>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Per quale sesso è questa scheda:</label>
 
                    <div style={{ display: 'flex', gap: '8px' }}>
 
                      {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                        <button key={k} type="button" onClick={() => setEditingProgram({ ...editingProgram, trialGender: k })} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', border: 'none', background: (editingProgram.trialGender || '') === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: (editingProgram.trialGender || '') === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                      ))}
 
                    </div>
 
                    <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginTop: '5px' }}>Serve solo per la Sala Pesi: ogni atleta riceve la scheda del proprio sesso.</span>
 
                  </div>
 
                )}
 
 
 
 
 
                {!editingProgram.trialStyle && (<>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Chi vede questo programma:</label>
 
                <select value={editingProgram.visibility || 'selected'} onChange={(e) => {
 
                  const v = e.target.value;
 
                  const prev = editingProgram.visibility || 'selected';
 
                  const ids = v === 'all'
 
                    ? athletes.map((a: any) => a.id)
 
                    : v === 'none' || (v === 'selected' && prev === 'all')
 
                      ? []
 
                      : (editingProgram.assignedAthleteIds || []);
 
                  setEditingProgram({ ...editingProgram, visibility: v, assignedAthleteIds: ids });
 
                }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                  <option value="none">🔒 Nessuno — bozza, la vedi solo tu</option>
 
                  <option value="all">🌍 Tutti gli atleti</option>
 
                  <option value="selected">👥 Solo gli atleti selezionati qui sotto</option>
 
                </select>
 
                </>)}
 
                {!editingProgram.trialStyle && (editingProgram.visibility || 'selected') !== 'none' && (<>
 
                <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
 
                <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '8px', padding: '10px' }}>
 
                  {athletes.map((a) => {
 
                    const currentAssigned = editingProgram.assignedAthleteIds || [];
 
                    return (
 
                      <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-000000)', marginBottom: '6px', cursor: 'pointer' }}>
 
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
 
                </>)}
 
              </div>
 
 
 
              <div style={{ marginBottom: '16px', background: 'var(--bg-f1f5f9)', padding: '12px', borderRadius: '8px' }}>
 
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
 
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
 
                  {editingProgram.weeks?.map((week: any, wIdx: number) => {
 
                    const isSelected = selectedWeekView === week.weekName;
 
                    return (
 
                      <button
 
                        key={wIdx}
 
                        onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }}
 
                        style={{ ...pillola(isSelected, 'var(--fg-334155)', 'piccolo') }}
 
                      >
 
                        {week.hidden ? `\u{1F6AB} ${week.weekName}` : week.weekName}
 
                      </button>
 
                    );
 
                  })}
 
            <button onClick={addEditingWeek} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Settimana</button>
 
                </div>
 
 
 
                {(() => {
 
                  const tutte = editingProgram.weeks || [];
 
                  const pos = tutte.findIndex((w: any) => w.weekName === selectedWeekView);
 
                  if (pos < 0) return null;
 
                  const sett = tutte[pos];
 
                  const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                  return (
 
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
 
                      <button onClick={() => moveEditingWeekOrder(pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                        <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                      </button>
 
                      <button onClick={() => moveEditingWeekOrder(pos, 'right')} disabled={pos === tutte.length - 1} style={{ ...azione, opacity: pos === tutte.length - 1 ? 0.4 : 1 }}>
 
                        <Icona nome="destra" size={12} /> Sposta a destra
 
                      </button>
 
                      <button onClick={() => cloneEditingWeek(sett)} style={azione}>
 
                        <Icona nome="duplica" size={12} /> Duplica
 
                      </button>
 
                    </div>
 
                  );
 
                })()}
 
              </div>
 
 
 
              {editingProgram.weeks?.filter((w: any) => w.weekName === selectedWeekView).map((week: any) => {
 
                const actualWIdx = editingProgram.weeks.findIndex((w: any) => w.weekName === selectedWeekView);
 
 
 
                return (
 
                  <div key={actualWIdx} style={{ marginBottom: '16px' }}>
 
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: 'var(--bg-e2e8f0)', padding: '10px', borderRadius: '8px' }}>
 
                      <input
 
                        type="text"
 
                        value={week.weekName}
 
                        onChange={(e) => {
 
                          const updated = JSON.parse(JSON.stringify(editingProgram));
 
                          updated.weeks[actualWIdx].weekName = e.target.value;
 
                          setSelectedWeekView(e.target.value);
 
                          setEditingProgram(updated);
 
                        }}
 
                        style={{ fontWeight: 'bold', color: 'var(--fg-141416)', fontSize: '15px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', width: '200px', maxWidth: '100%', minWidth: 0 }}
 
                      />
 
                      {pulsanteVisibilita(!!week.hidden, () => toggleVisibilitaSettimana(actualWIdx))}
 
                      {editingProgram.weeks.length > 1 && (
 
                        <button onClick={() => {
 
                          // conferma prima di eliminare: dico anche cosa si perde
 
                          const g = (week.days || []).length;
 
                          const e = (week.days || []).reduce((t: number, d: any) => t + (d.blocks || []).length, 0);
 
                          const dettaglio = e > 0
 
                            ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'} e ${e} ${e === 1 ? 'esercizio' : 'esercizi'}`
 
                            : (g > 0 ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'}` : '');
 
                          if (!confirm(`Eliminare "${week.weekName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                          const updated = JSON.parse(JSON.stringify(editingProgram));
 
                          updated.weeks.splice(actualWIdx, 1);
 
                          setEditingProgram(updated);
 
                          // resto sulla settimana vicina invece di tornare alla prima
 
                          const vicina = updated.weeks[Math.min(actualWIdx, updated.weeks.length - 1)];
 
                          if (vicina) {
 
                            setSelectedWeekView(vicina.weekName);
 
                            if (vicina.days?.length > 0) setSelectedDayView(vicina.days[0].dayName);
 
                          }
 
                        }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Settimana</button>
 
                      )}
 
                    </div>
 
 
 
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
 
                      {week.days?.map((day: any, dIdx: number) => {
 
                        const isSelected = selectedDayView === day.dayName;
 
                        return (
 
                          <button
 
                            key={dIdx}
 
                            onClick={() => setSelectedDayView(day.dayName)}
 
                            style={{ ...pillola(isSelected, 'var(--fg-10b981)', 'piccolo') }}
 
                          >
 
                            {day.hidden ? `\u{1F6AB} ${day.dayName}` : day.dayName}
 
                          </button>
 
                        );
 
                      })}
 
                      <button onClick={() => addEditingDay(actualWIdx)} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Giorno</button>
 
                    </div>
 
 
 
                    {(() => {
 
                      const giorni = week.days || [];
 
                      const pos = giorni.findIndex((d: any) => d.dayName === selectedDayView);
 
                      if (pos < 0) return null;
 
                      const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                      return (
 
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
 
                          <button onClick={() => moveEditingDayOrder(actualWIdx, pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                            <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                          </button>
 
                          <button onClick={() => moveEditingDayOrder(actualWIdx, pos, 'right')} disabled={pos === giorni.length - 1} style={{ ...azione, opacity: pos === giorni.length - 1 ? 0.4 : 1 }}>
 
                            <Icona nome="destra" size={12} /> Sposta a destra
 
                          </button>
 
                          <button onClick={() => cloneEditingDay(actualWIdx, giorni[pos])} style={azione}>
 
                            <Icona nome="duplica" size={12} /> Duplica
 
                          </button>
 
                        </div>
 
                      );
 
                    })()}
 
 
 
                    {week.days?.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
 
                      const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
 
                      return (
 
                        <div key={actualDIdx} style={{ background: 'var(--bg-f8fafc)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
 
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 180px', minWidth: 0 }}>
 
                              <input
 
                                type="text"
 
                                value={day.dayName}
 
                                onChange={(e) => {
 
                                  const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                  updated.weeks[actualWIdx].days[actualDIdx].dayName = e.target.value;
 
                                  setSelectedDayView(e.target.value);
 
                                  setEditingProgram(updated);
 
                                }}
 
                                style={{ fontWeight: 'bold', color: 'var(--fg-10b981)', fontSize: '14px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', flex: 1, minWidth: 0 }}
 
                              />
 
                              {(() => {
 
                                const quanti = (day.blocks || []).length;
 
                                return (
 
                                  <span
 
                                    title={quanti === 1 ? 'Un blocco in questo giorno' : `${quanti} blocchi in questo giorno`}
 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5px 11px', borderRadius: '999px', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
 
                                  >
 
                                    {quanti === 1 ? '1 blocco' : `${quanti} blocchi`}
 
                                  </span>
 
                                );
 
                              })()}
 
                            </div>
 
                            {pulsanteVisibilita(!!day.hidden, () => toggleVisibilitaGiorno(actualWIdx, actualDIdx))}
 
                            {week.days.length > 1 && (
 
                              <button onClick={() => {
 
                                // conferma prima di eliminare il giorno
 
                                const e = (day.blocks || []).length;
 
                                const dettaglio = e > 0 ? ` con ${e} ${e === 1 ? 'esercizio' : 'esercizi'}` : '';
 
                                if (!confirm(`Eliminare "${day.dayName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                                const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                updated.weeks[actualWIdx].days.splice(actualDIdx, 1);
 
                                setEditingProgram(updated);
 
                                // resto sul giorno vicino invece di tornare al primo
 
                                const vicino = updated.weeks[actualWIdx].days[Math.min(actualDIdx, updated.weeks[actualWIdx].days.length - 1)];
 
                                if (vicino) setSelectedDayView(vicino.dayName);
 
                              }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Giorno</button>
 
                            )}
 
                          </div>
 
 
 
                          {day.blocks?.map((block: any, bIdx: number) => {
 
                            const blockKey = `edit_${actualWIdx}_${actualDIdx}_${bIdx}`;
 
                            const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
 
 
                            return (
 
                              <div key={block.id || bIdx} style={{ background: 'var(--bg-ffffff)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
 
                                  <span
 
                                    title={`Blocco ${bIdx + 1} di ${(day.blocks || []).length}`}
 
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '26px', height: '26px', padding: '0 7px', borderRadius: '999px', background: 'var(--bg-1f2937)', color: '#fff', fontSize: '11.5px', fontWeight: 'bold', flexShrink: 0 }}
 
                                  >
 
                                    {bIdx + 1}
 
                                  </span>
 
                                  <div style={{ position: 'relative', flex: '1 1 140px', minWidth: 0 }}>
 
                                    <select
 
                                      value={block.type || 'forza'}
 
                                      onChange={(e) => scegliTipoBlocco('edit', actualWIdx, actualDIdx, bIdx, e.target.value)}
 
                                      style={{
 
                                        width: '100%', boxSizing: 'border-box',
 
                                        padding: '9px 30px 9px 14px', borderRadius: '999px', cursor: 'pointer',
 
                                        fontSize: '12.5px', fontWeight: 'bold',
 
                                        border: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
 
                                        background: block.type === 'warmup' ? '#f59e0b'
 
                                        : block.type === 'superserie' ? '#c2410c'
 
                                          : block.type === 'wod' ? '#2563eb'
 
                                          : block.type === 'test' ? '#7c3aed'
 
                                          : 'var(--bg-10b981)',
 
                                        color: block.type === 'warmup' ? '#101214' : block.type === 'superserie' ? '#ffffff' : block.type === 'wod' ? '#ffffff' : block.type === 'test' ? '#ffffff' : 'var(--onacc)',
 
                                      }}
 
                                    >
 
                                      <option value="warmup">WARM UP</option>
 
                                      <option value="superserie">SUPERSERIE</option>
 
                                      <option value="forza">FORZA</option>
 
                                      <option value="wod">WOD</option>
 
                                      <option value="test">TEST</option>
 
                                    </select>
 
                                    <span style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#fff' }}>
 
                                      <Icona nome="giu" size={14} />
 
                                    </span>
 
                                  </div>
 
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
 
                                    <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
 
                                    <button type="button" onClick={() => apriDuplicaBlocco('edit', actualWIdx, actualDIdx, bIdx, block)} title="Duplica esercizio" style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '4px 7px', cursor: 'pointer', fontSize: '13px' }}><Icona nome="duplica" size={14} /></button>
 
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="su" size={14} /></button>
 
                                    <button type="button" onClick={() => moveEditingBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="giu" size={14} /></button>
 
                                    <button type="button" onClick={() => {
 
                                      // chiedo conferma solo se c'e' qualcosa da perdere
 
                                      const pieno = block && (
 
                                        String(block.name || '').trim() ||
 
                                        String(block.wodNotes || '').trim() ||
 
                                        String(block.notes || '').trim() ||
 
                                        (block.items || []).length > 0
 
                                      );
 
                                      if (pieno) {
 
                                        const nome = String(block.name || '').trim() || 'questo esercizio';
 
                                        if (!confirm(`Eliminare ${nome}?`)) return;
 
                                      }
 
 
 
                                      const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                      updated.weeks[actualWIdx].days[actualDIdx].blocks.splice(bIdx, 1);
 
                                      setEditingProgram(updated);
 
                                    }} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="cestino" size={14} /></button>
 
                                  </div>
 
                                </div>
 
 
 
                                <div style={{ marginBottom: '10px' }}>
 
                                  {block.type === 'test' ? (
 
                                    <select value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '8px' }}>
 
                                      <option value="">Scegli un test...</option>
 
                                      <optgroup label="Metcon">
 
                                        {metconPRNames.map((n: string) => <option key={n} value={n}>{`Max Effort ${n}`}</option>)}
 
                                      </optgroup>
 
                                      <optgroup label="Gymnastics">
 
                                        {gymPRNames.map((n: string) => <option key={n} value={n}>{`Max Rep ${n}`}</option>)}
 
                                      </optgroup>
 
                                      <optgroup label="Benchmark WOD">
 
                                        {BENCHMARK_NAMES.map((n: string) => <option key={n} value={n}>{n}</option>)}
 
                                      </optgroup>
 
                                    </select>
 
                                  ) : block.type === 'forza' ? (
 
                                    <div>
 
                                      <CampoEsercizio
 
                                        placeholder="Inserisci o seleziona esercizio..."
 
                                        valore={block.name}
 
                                        onChange={(v: string) => {
 
                                          const updated = JSON.parse(JSON.stringify(editingProgram));
 
                                          const b = updated.weeks[actualWIdx].days[actualDIdx].blocks[bIdx];
 
                                          b.name = v;
 
                                          const inLibreria = exerciseLibrary.find((ex: any) => sameName(ex.name, v));
 
                                          if (inLibreria && inLibreria.video_url) b.videoUrl = inLibreria.video_url;
 
                                          setEditingProgram(updated);
 
                                        }}
 
                                        elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                      />
 
                                    </div>
 
                                  ) : haElenco(block.type) ? (
 
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-92400e)' }}>
 
                                      {block.name || 'Warm up'}
 
                                    </span>
 
                                  ) : (
 
                                    <input type="text" value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                  )}
 
                                </div>
 
 
 
                                {!isClosed && (
 
                                  <div>
 
                                    {!haElenco(block.type) && (
 
                                    <div style={{ marginBottom: '10px' }}>
 
                                      <input type="url" value={block.videoUrl || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '12px' }} />
 
                                      {block.type === 'forza' && block.name && block.name.trim() && !exerciseLibrary.some((ex: any) => sameName(ex.name, block.name)) && (
 
                                        <button
 
                                          type="button"
 
                                          onClick={() => salvaInLibreriaDaScheda(block.name, block.videoUrl || '')}
 
                                          style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px', padding: '8px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
 
                                        >
 
                                          ➕ Salva &quot;{block.name}&quot; in Libreria Esercizi
 
                                        </button>
 
                                      )}
 
                                    </div>
 
                                    )}
 
                                    {block.type === 'test' ? (
 
                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '8px' }}>
 
                                        {(() => {
 
                                          const bench = BENCHMARK_WODS.find((b) => b.name === block.name);
 
                                          if (!bench) return null;
 
                                          const lvl = block.benchLevel || 'rx';
 
                                          return (
 
                                            <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
 
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
 
                                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-10b981)' }}>{bench.name}</span>
 
                                                <div style={{ display: 'flex', gap: '3px' }}>
 
                                                  {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                    <button key={k} type="button" onClick={() => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'benchLevel', k)} style={{ padding: '3px 8px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                  ))}
 
                                                </div>
 
                                              </div>
 
                                              <p style={{ margin: 0, fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                              <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                            </div>
 
                                          );
 
                                        })()}
 
                                        <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE DEL COACH</label>
 
                                        <input type="text" placeholder="Indicazioni per l'atleta (facoltativo)" value={block.target || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'target', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                        <p style={{ fontSize: '10px', color: 'var(--fg-64748b)', margin: '6px 0 0 0', lineHeight: 1.3 }}>Blocco di test: niente serie, ripetizioni, carico o recupero.</p>
 
                                      </div>
 
                                    ) : haElenco(block.type) ? (
 
                                      <div>
 
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
 
                                          <div style={{ flex: '2 1 150px', minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Titolo della sezione</label>
 
                                            <input type="text" placeholder={nomeElenco(block.type)} value={block.name || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'name', nomeElenco(block.type)); }} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                                          </div>
 
                                          <div style={{ flex: '1 1 80px', minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>N. round</label>
 
                                            <input type="text" inputMode="numeric" placeholder="1" value={block.rounds || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }} />
 
                                          </div>
 
                                          <div style={{ flex: '1 1 120px', minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Rest tra i round</label>
 
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
 
                                              <input
 
                                                type="text"
 
                                                inputMode="numeric"
 
                                                placeholder="0"
 
                                                value={block.warmRestMin ?? ''}
 
                                                onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'warmRestMin', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                              />
 
                                              <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>:</span>
 
                                              <input
 
                                                type="text"
 
                                                inputMode="numeric"
 
                                                placeholder="0"
 
                                                value={block.warmRestSec ?? ''}
 
                                                onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'warmRestSec', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                              />
 
                                            </div>
 
                                            <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--fg-94a3b8)', marginTop: '2px' }}>min : sec — vuoto = nessun recupero</span>
 
                                          </div>
 
                                        </div>
 
 
 
                                        {block.type === 'superserie' && <SelettoreModoSuperserie valore={block.scoreUnit} onChange={(v: string) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />}
 
                                        {(block.items || []).map((it: any, i: number) => (
 
                                          <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                            <CampoEsercizio
 
                                              placeholder="Nome esercizio"
 
                                              valore={it.name}
 
                                              onChange={(v: string) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                              elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                              style={{ marginBottom: '7px' }}
 
                                            />
 
 
 
                                            <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
 
                                              <input
 
                                                type="text"
 
                                                placeholder="10 rep / 30&quot;"
 
                                                value={it.value || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'value', e.target.value)}
 
                                                style={{ flex: '2 1 150px', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                              />
 
                                              <input
 
                                                type="text"
 
                                                placeholder="rec. 1:30"
 
                                                title="Recupero dopo questo esercizio. Vuoto = vale quello della sezione."
 
                                                value={it.rest || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'rest', e.target.value)}
 
                                                style={{ flex: '1 1 78px', minWidth: 0, boxSizing: 'border-box', padding: '10px 6px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px', textAlign: 'center' }}
 
                                              />
 
 
                                            </div>
 
                                            {block.type === 'superserie' && block.scoreUnit !== 'spunta' && <SelettoreScoreItem valore={it.scoreUnit} onChange={(v: string) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'scoreUnit', v)} />}
 
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
                                              <input
 
                                                type="text"
 
                                                placeholder="80% / RPE 8"
 
                                                title="Carico previsto: percentuale sul massimale oppure RPE. Vuoto = nessuna indicazione."
 
                                                value={it.load || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'load', e.target.value)}
 
                                                style={{ flex: '1 1 130px', minWidth: 0, maxWidth: '200px', boxSizing: 'border-box', padding: '10px 8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                              />
 
                                              <span style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
 
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="su" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="giu" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => togliWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="cestino" size={14} />
 
                                              </button>
 
                                              </span>
 
                                            </div>
 
 
 
                                            <input type="url" placeholder="Link video (facoltativo)" value={it.videoUrl || ''} onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }} />
 
                                          </div>
 
                                        ))}
 
 
 
 
 
                                        <button type="button" onClick={() => aggiungiWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                          Aggiungi esercizio
 
                                        </button>
 
 
 
      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', margin: '10px 0 3px 0' }}>Note del coach</label>
 
      <textarea rows={3} placeholder="Indicazioni sull'esecuzione, cosa curare..." value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
 
                                      </div>
 
                                    ) : isMobility(block.name) ? (
 
                                      <div>
 
                                        <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Testo della mobility (lo vedrà l&apos;atleta)</label>
 
                                        <textarea
 
                                          rows={6}
 
                                          placeholder={'Scrivi qui la sequenza.\nVai a capo dove vuoi: le righe vengono rispettate.'}
 
                                          value={block.wodNotes || ''}
 
                                          onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)}
 
                                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '8px' }}
 
                                        />
 
                                        <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', lineHeight: 1.45 }}>
 
                                          L&apos;atleta non inserisce punteggi: vede il testo e il video, può spuntare &quot;fatto&quot; e lasciare una nota.
 
                                        </span>
 
                                      </div>
 
                                    ) : block.type === 'forza' ? (
 
                                      <div>
 
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</label>
 
                                            <input type="number" value={block.sets || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</label>
 
                                            <input type="text" value={block.reps || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                        </div>
 
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</label>
 
                                            <input type="text" value={block.load || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</label>
 
                                            <input type="text" value={block.rest || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                          </div>
 
                                        </div>
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                        <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                          <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE</label>
 
                                          <textarea rows={3} value={block.notes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ minHeight: '78px', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
                                        </div>
 
                                      </div>
 
                                    ) : (
 
                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                        <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</label>
 
                                        <textarea value={block.wodNotes || ''} onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', boxSizing: 'border-box', height: '120px', fontFamily: 'inherit', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
 
 
                                          {(() => {
 
                                            const trovati = trovaEserciziNelTesto(block.wodNotes, block.items);
 
                                            if (trovati.length === 0) return null;
 
                                            return (
 
                                              <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '10px 12px', margin: '10px 0' }}>
 
                                                <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--fg-1e40af)', marginBottom: '7px', lineHeight: 1.45 }}>
 
                                                  <strong>{trovati.length === 1 ? 'Trovato 1 esercizio' : `Trovati ${trovati.length} esercizi`} in libreria:</strong>{' '}
 
                                                  {trovati.map((t: any) => t.name).join(' · ')}
 
                                                </span>
 
                                                <button
 
                                                  type="button"
 
                                                  onClick={() => aggiornaWarmItems('edit', actualWIdx, actualDIdx, bIdx, [...(block.items || []), ...trovati])}
 
                                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                >
 
                                                  <Icona nome="piu" size={12} /> Aggiungi con i video
 
                                                </button>
 
                                              </div>
 
                                            );
 
                                          })()}
 
 
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', margin: '10px 0 4px 0' }}>
 
                                          <div style={{ flex: 1, minWidth: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>
 
                                              Esercizi con video <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'normal' }}>(facoltativo)</span>
 
                                            </label>
 
                                          </div>
 
                                          <div style={{ width: '92px', flexShrink: 0 }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Round</label>
 
                                            <input
 
                                              type="text"
 
                                              inputMode="numeric"
 
                                              placeholder="—"
 
                                              value={block.scoreRounds || ''}
 
                                              onChange={(e) => updateEditingBlock(actualWIdx, actualDIdx, bIdx, 'scoreRounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                              title="Quante caselle dare all'atleta per il risultato. Vuoto = una sola."
 
                                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                            />
 
                                          </div>
 
                                        </div>
 
                                        {(block.items || []).map((it: any, i: number) => (
 
                                          <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                            <CampoEsercizio
 
                                              placeholder="Nome esercizio"
 
                                              valore={it.name}
 
                                              onChange={(v: string) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                              elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                              style={{ marginBottom: '7px' }}
 
                                            />
 
 
 
                                            <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
 
                                              <input
 
                                                type="url"
 
                                                placeholder="Link video"
 
                                                value={it.videoUrl || ''}
 
                                                onChange={(e) => modificaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)}
 
                                                style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }}
 
                                              />
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="su" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => spostaWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="giu" size={14} />
 
                                              </button>
 
                                              <button type="button" onClick={() => togliWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                <Icona nome="cestino" size={14} />
 
                                              </button>
 
                                            </div>
 
                                          </div>
 
                                        ))}
 
                                        <button type="button" onClick={() => aggiungiWarmItem('edit', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '999px', border: '1px dashed #3b82f6', background: 'var(--bg-eff6ff)', color: 'var(--fg-1d4ed8)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
 
                                          Aggiungi esercizio con video
 
                                        </button>
 
                                      </div>
 
                                    )}
 
                                  </div>
 
                                )}
 
                              </div>
 
                            );
 
                          })}
 
                          <button onClick={() => addBlockToEditingDay(actualWIdx, actualDIdx)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Aggiungi Blocco</button>
 
                        </div>
 
                      );
 
                    })}
 
                  </div>
 
                );
 
              })}
 
 
 
              <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
 
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-10b981)', display: 'block', marginBottom: '10px' }}>💡 Consigli per l&apos;atleta</span>
 
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli per l&apos;allenamento</label>
 
                <textarea rows={4} placeholder={'Indicazioni su tecnica, riscaldamento, recuperi, gestione dei carichi...'} value={editingProgram.trainingTips || ''} onChange={(e) => setEditingProgram({ ...editingProgram, trainingTips: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '12px' }} />
 
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli nutrizionali</label>
 
                <textarea rows={4} placeholder={'Indicazioni generali su alimentazione e idratazione...'} value={editingProgram.nutritionTips || ''} onChange={(e) => setEditingProgram({ ...editingProgram, nutritionTips: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
 
              </div>
 
 
 
              <button onClick={saveEditedProgram} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '10px' }}>Salva Modifiche</button>
 
            </div>
 
          ) : (
 
            <div>
 
              <div id="menu-coach-ancora" />
 
              <div style={{
 
                display: 'flex',
 
                flexWrap: 'wrap',
 
                gap: '8px',
 
                marginBottom: menuAgganciato ? '10px' : '20px',
 
                position: menuAgganciato ? 'sticky' : 'static',
 
                top: timerRidotto ? '62px' : 0,
 
                zIndex: 40,
 
                background: menuAgganciato ? 'var(--bg-18181b)' : 'transparent',
 
                paddingTop: menuAgganciato ? '8px' : 0,
 
                paddingBottom: menuAgganciato ? '8px' : 0,
 
                boxShadow: menuAgganciato ? '0 6px 14px rgba(0,0,0,0.45)' : 'none',
 
                transition: 'padding .16s ease, margin .16s ease',
 
              }}>
 
                <button
 
                  onClick={() => setActiveTab('create')}
 
                  style={{
 
                    ...pillola(activeTab === 'create'),
 
                    flex: '1 1 0', minWidth: 0,
 
                    whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2,
 
                    padding: menuAgganciato ? '8px 6px' : '10px 6px',
 
                    fontSize: '12.5px',
 
                  }}
 
                >
 
                  Crea Programma
 
                </button>
 
                <button
 
                  onClick={() => setActiveTab('library')}
 
                  style={{
 
                    ...pillola(activeTab === 'library'),
 
                    flex: '1 1 0', minWidth: 0,
 
                    whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2,
 
                    padding: menuAgganciato ? '8px 6px' : '10px 6px',
 
                    fontSize: '12.5px',
 
                  }}
 
                >
 
                  Libreria Programmi
 
                </button>
 
                <button
 
                  onClick={() => setActiveTab('exercises')}
 
                  style={{
 
                    ...pillola(activeTab === 'exercises'),
 
                    flex: '1 1 0', minWidth: 0,
 
                    whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2,
 
                    padding: menuAgganciato ? '8px 6px' : '10px 6px',
 
                    fontSize: '12.5px',
 
                  }}
 
                >
 
                  Libreria Esercizi
 
                </button>
 
              </div>
 
 
 
              {activeTab === 'exercises' ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 
                    <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>{showDeletedExercises ? 'Cestino Esercizi' : 'Gestione Libreria Esercizi'}</h3>
 
                    <button onClick={() => setShowDeletedExercises(!showDeletedExercises)} style={{ padding: '8px 10px', borderRadius: '999px', border: 'none', background: showDeletedExercises ? 'var(--bg-10b981)' : '#64748b', color: showDeletedExercises ? 'var(--onacc)' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
 
                      {showDeletedExercises ? 'Torna agli esercizi' : '🗑️ Cestino'}
 
                    </button>
 
                  </div>
 
 
 
                  {!showDeletedExercises && (
 
                    <form onSubmit={addGlobalExercise} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                      <input type="text" placeholder="Nome Esercizio" value={newExName} onChange={(e) => setNewExName(e.target.value)} required style={{ padding: '10px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px' }} />
 
                      <input type="url" placeholder="Link Video" value={newExVideo} onChange={(e) => setNewExVideo(e.target.value)} style={{ padding: '10px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px' }} />
 
                      <select value={newExType} onChange={(e) => setNewExType(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)', marginBottom: '10px' }}>
 
                        <option value="">Esercizio generico (nessun massimale)</option>
 
                        <option value="forza">🏋️ Forza — con massimali 1/3/5/10 RM</option>
 
                        <option value="metcon">⏱️ Metcon — risultato a tempo</option>
 
                        <option value="gym">🤸 Ginnastica — massimo di ripetizioni</option>
 
                      </select>
 
                      <button type="submit" style={{ padding: '10px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', borderRadius: '999px', cursor: 'pointer', fontSize: '13px' }}>+ Aggiungi Esercizio</button>
 
                    </form>
 
                  )}
 
 
 
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
 
                    <input
 
                      type="text"
 
                      placeholder="Cerca un esercizio..."
 
                      value={cercaEsercizi}
 
                      onChange={(e: any) => setCercaEsercizi(e.target.value)}
 
                      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 34px 11px 12px', borderRadius: '10px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}
 
                    />
 
                    {cercaEsercizi && (
 
                      <button onClick={() => setCercaEsercizi('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
 
                        <Icona nome="chiudi" size={15} />
 
                      </button>
 
                    )}
 
                  </div>
 
 
 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                    {exerciseLibrary.filter((ex) => (showDeletedExercises ? ex.dismissed : !ex.dismissed) && contiene(ex.name, cercaEsercizi)).length === 0 ? (
 
                      <p style={{ color: 'var(--fg-64748b)', textAlign: 'center', padding: '20px' }}>
 
                        {cercaEsercizi
 
                          ? `Nessun esercizio con "${cercaEsercizi}".`
 
                          : showDeletedExercises
 
                            ? 'Il cestino è vuoto.'
 
                            : 'Nessun esercizio in libreria.'}
 
                      </p>
 
                    ) : (
 
                      sortExerciseLibrary(exerciseLibrary.filter((ex) => (showDeletedExercises ? ex.dismissed : !ex.dismissed) && contiene(ex.name, cercaEsercizi))).map((ex) => (
 
                        libEditId === ex.id ? (
 
                          <div key={ex.id} style={{ background: 'var(--bg-ffffff)', padding: '12px', borderRadius: '8px', border: '2px solid var(--bd-10b981)' }}>
 
                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Nome esercizio</label>
 
                            <input
 
                              type="text"
 
                              value={libEditName}
 
                              onChange={(e) => setLibEditName(e.target.value)}
 
                              style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '9px' }}
 
                              autoFocus
 
                            />
 
                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Link video</label>
 
                            <input
 
                              type="url"
 
                              placeholder="https://..."
 
                              value={libEditVideo}
 
                              onChange={(e) => setLibEditVideo(e.target.value)}
 
                              onKeyDown={(e) => { if (e.key === 'Enter') salvaEsercizioLibreria(ex); }}
 
                              style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '10px' }}
 
                            />
 
                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>
 
                              Abbreviazioni <span style={{ color: 'var(--fg-94a3b8)' }}>(facoltative, separate da virgola)</span>
 
                            </label>
 
                            <input
 
                              type="text"
 
                              placeholder="es. DU, DUs"
 
                              value={libEditAlias}
 
                              onChange={(e) => setLibEditAlias(e.target.value)}
 
                              style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '6px' }}
 
                            />
 
                            <p style={{ fontSize: '10.5px', color: 'var(--fg-94a3b8)', margin: '0 0 10px 0', lineHeight: 1.45 }}>
 
                              Servono a riconoscere l&apos;esercizio nel testo dei WOD: scrivendo &quot;DU&quot; qui, un WOD con &quot;50 DU&quot; propone questo esercizio.
 
                            </p>
 
 
 
                            <div style={{ display: 'flex', gap: '7px' }}>
 
                              <button onClick={() => salvaEsercizioLibreria(ex)} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', border: 'none', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                Salva
 
                              </button>
 
                              <button onClick={() => { setLibEditId(null); setLibEditName(''); setLibEditVideo(''); setLibEditAlias(''); }} style={{ padding: '10px 15px', borderRadius: '999px', border: 'none', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                Annulla
 
                              </button>
 
                            </div>
 
                            {libEditName.trim() && libEditName.trim() !== ex.name && (
 
                              <p style={{ fontSize: '10.5px', color: 'var(--fg-92400e)', margin: '9px 0 0 0', lineHeight: 1.45, background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '6px', padding: '8px 10px' }}>
 
                                Cambiando il nome verrà aggiornato ovunque: nelle schede già create, nei massimali degli atleti e nel loro storico. Nessun dato viene perso.
 
                              </p>
 
                            )}
 
                          </div>
 
                        ) : (
 
                        <div key={ex.id} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                          <div style={{ flex: '1 1 160px', minWidth: 0 }}>
 
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-000000)' }}>{ex.name}</div>
 
                            <div style={{ fontSize: '11px', color: ex.video_url ? 'var(--fg-0284c7)' : 'var(--fg-94a3b8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
 
                              {ex.video_url ? 'Video disponibile' : 'Nessun video'}
 
                            </div>
 
                            {ex.pr_kind ? (
 
                              <span style={{ display: 'inline-block', marginTop: '5px', background: ex.pr_kind === 'metcon' ? 'var(--bg-dbeafe)' : 'var(--bg-fce7f3)', color: ex.pr_kind === 'metcon' ? 'var(--fg-1e40af)' : 'var(--fg-9d174d)', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
 
                                {ex.pr_kind === 'metcon' ? '⏱️ Metcon PR' : '🤸 Gymnastics PR'}
 
                              </span>
 
                            ) : ex.track_max ? (
 
                              <span style={{ display: 'inline-block', marginTop: '5px', background: 'var(--bg-dcfce7)', color: 'var(--fg-166534)', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '20px' }}>
 
                                🏋️ Forza — massimali
 
                              </span>
 
                            ) : null}
 
                            {!showDeletedExercises && !ex.pr_kind && (
 
                              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '5px', cursor: 'pointer' }}>
 
                                <input type="checkbox" checked={!!ex.track_max} onChange={(e) => toggleTrackMax(ex.id, e.target.checked)} />
 
                                <span style={{ fontSize: '11px', color: 'var(--fg-0284c7)', fontWeight: 'bold' }}>Traccia massimali</span>
 
                              </label>
 
                            )}
 
                          </div>
 
                          {showDeletedExercises ? (
 
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 
                              <button onClick={() => restoreGlobalExercise(ex.id)} style={{ background: 'var(--bg-10b981)', border: 'none', color: 'var(--onacc)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>♻️ Ripristina</button>
 
                              <button onClick={() => permanentlyDeleteGlobalExercise(ex.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>🗑️ Definitivo</button>
 
                            </div>
 
                          ) : (
 
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 
                              {ex.video_url && (
 
                                <a
 
                                  href={ex.video_url}
 
                                  target="_blank"
 
                                  rel="noopener noreferrer"
 
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', borderRadius: '999px', padding: '7px 12px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}
 
                                >
 
                                  <Icona nome="video" size={12} /> Video
 
                                </a>
 
                              )}
 
                              <button onClick={() => { setLibEditId(ex.id); setLibEditName(ex.name); setLibEditVideo(ex.video_url || ''); setLibEditAlias(ex.aliases || ''); }} style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '999px', padding: '7px 11px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="modifica" size={12} /> Modifica</button>
 
                              <button onClick={() => deleteGlobalExercise(ex.id)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina</button>
 
                            </div>
 
                          )}
 
                        </div>
 
                        )
 
                      ))
 
                    )}
 
                  </div>
 
                </div>
 
              ) : activeTab === 'create' ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                  <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Nuovo Allenamento</h3>
 
 
 
                  <input type="text" placeholder="Titolo Programma" value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', marginBottom: '12px', boxSizing: 'border-box' }} />
 
 
 
                  {programTrialStyle ? (
 
                    <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
 
                      <span style={{ fontSize: '12px', color: 'var(--fg-1e40af)', fontWeight: 'bold', display: 'block', marginBottom: '3px' }}>📅 Durata automatica</span>
 
                      <span style={{ fontSize: '12px', color: 'var(--fg-1e3a8a)', lineHeight: 1.4 }}>Le settimane di prova durano sette giorni dal momento in cui l&apos;atleta le sceglie, quindi le date non servono.</span>
 
                    </div>
 
                  ) : (
 
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
 
                    <div>
 
                      <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Inizio:</label>
 
                      <input type="date" value={programStartDate} onChange={(e) => setProgramStartDate(e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
{programStartDate && (<button type="button" onClick={() => setProgramStartDate('')} style={{ marginTop: '6px', background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', color: 'var(--fg-b91c1c)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancella data</button>)}
 
                    </div>
 
                    <div>
 
                      <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Data Fine:</label>
 
                      <input type="date" value={programEndDate} onChange={(e) => setProgramEndDate(e.target.value)} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', boxSizing: 'border-box' }} />
 
{programEndDate && (<button type="button" onClick={() => setProgramEndDate('')} style={{ marginTop: '6px', background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', color: 'var(--fg-b91c1c)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>Cancella data</button>)}
 
                    </div>
 
                  </div>
 
                  )}
 
 
 
                  <div style={{ marginBottom: '16px' }}>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Settimana di prova:</label>
 
                    <select value={programTrialStyle} onChange={(e) => setProgramTrialStyle(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                      <option value="">Non è un programma di prova</option>
 
                      <option value="pesi">🏋️ Prova — Sala Pesi</option>
 
                      <option value="hybrid">🏃 Prova — Hybrid</option>
 
                      <option value="cross">🤸 Prova — Cross Training</option>
 
                    </select>
 
                    {programTrialStyle === 'pesi' && (
 
                      <div style={{ marginBottom: '12px' }}>
 
                        <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Per quale sesso è questa scheda:</label>
 
                        <div style={{ display: 'flex', gap: '8px' }}>
 
                          {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                            <button key={k} type="button" onClick={() => setProgramTrialGender(k)} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', border: 'none', background: programTrialGender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: programTrialGender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                          ))}
 
                        </div>
 
                        <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginTop: '5px' }}>Serve solo per la Sala Pesi: ogni atleta riceve la scheda del proprio sesso.</span>
 
                      </div>
 
                    )}
 
 
 
 
 
                    {!programTrialStyle && (<>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Chi vede questo programma:</label>
 
                    <select value={programVisibility} onChange={(e) => {
 
                      const v = e.target.value as any;
 
                      const prev = programVisibility;
 
                      setProgramVisibility(v);
 
                      if (v === 'all') setSelectedAthleteIds(athletes.map((a: any) => a.id));
 
                      if (v === 'none') setSelectedAthleteIds([]);
 
                      // arrivando da "tutti", riparto senza nessuna spunta
 
                      if (v === 'selected' && prev === 'all') setSelectedAthleteIds([]);
 
                    }} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '12px', background: 'var(--bg-ffffff)' }}>
 
                      <option value="none">🔒 Nessuno — bozza, la vedi solo tu</option>
 
                      <option value="all">🌍 Tutti gli atleti</option>
 
                      <option value="selected">👥 Solo gli atleti selezionati qui sotto</option>
 
                    </select>
 
                    </>)}
 
                    {!programTrialStyle && programVisibility !== 'none' && (<>
 
                    <label style={{ fontSize: '12px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '6px' }}>Assegna ad Atleti:</label>
 
                    <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '8px', padding: '10px' }}>
 
                      {athletes.length === 0 ? (
 
                        <span style={{ fontSize: '12px', color: 'var(--fg-64748b)' }}>Nessun atleta disponibile.</span>
 
                      ) : (
 
                        athletes.map((a) => (
 
                          <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--fg-000000)', marginBottom: '6px', cursor: 'pointer' }}>
 
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
 
                    </>)}
 
                  </div>
 
 
 
                  <div style={{ marginBottom: '16px', background: 'var(--bg-f1f5f9)', padding: '12px', borderRadius: '8px' }}>
 
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '8px' }}>📅 SETTIMANE</span>
 
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
 
                      {programWeeks.map((week, wIdx) => {
 
                        const isSelected = selectedWeekView === week.weekName;
 
                        return (
 
                          <button
 
                            key={wIdx}
 
                            onClick={() => { setSelectedWeekView(week.weekName); if (week.days && week.days.length > 0) setSelectedDayView(week.days[0].dayName); }}
 
                            style={{ ...pillola(isSelected, 'var(--fg-334155)', 'piccolo') }}
 
                          >
 
                            {week.weekName}
 
                          </button>
 
                        );
 
                      })}
 
                      <button onClick={addWeek} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Settimana</button>
 
                    </div>
 
 
 
                    {(() => {
 
                      const tutte = programWeeks || [];
 
                      const pos = tutte.findIndex((w: any) => w.weekName === selectedWeekView);
 
                      if (pos < 0) return null;
 
                      const sett = tutte[pos];
 
                      const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                      return (
 
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
 
                          <button onClick={() => moveWeekOrder(pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                            <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                          </button>
 
                          <button onClick={() => moveWeekOrder(pos, 'right')} disabled={pos === tutte.length - 1} style={{ ...azione, opacity: pos === tutte.length - 1 ? 0.4 : 1 }}>
 
                            <Icona nome="destra" size={12} /> Sposta a destra
 
                          </button>
 
                          <button onClick={() => cloneWeek(sett)} style={azione}>
 
                            <Icona nome="duplica" size={12} /> Duplica
 
                          </button>
 
                        </div>
 
                      );
 
                    })()}
 
                  </div>
 
 
 
                  {programWeeks.filter((w) => w.weekName === selectedWeekView).map((week) => {
 
                    const actualWIdx = programWeeks.findIndex((w) => w.weekName === selectedWeekView);
 
 
 
                    return (
 
                      <div key={actualWIdx} style={{ marginBottom: '16px' }}>
 
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: 'var(--bg-e2e8f0)', padding: '10px', borderRadius: '8px' }}>
 
                          <input
 
                            type="text"
 
                            value={week.weekName}
 
                            onChange={(e) => {
 
                              const upd = JSON.parse(JSON.stringify(programWeeks));
 
                              upd[actualWIdx].weekName = e.target.value;
 
                              setSelectedWeekView(e.target.value);
 
                              setProgramWeeks(upd);
 
                            }}
 
                            style={{ fontWeight: 'bold', color: 'var(--fg-141416)', fontSize: '15px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', width: '200px', maxWidth: '100%', minWidth: 0 }}
 
                          />
 
                          {programWeeks.length > 1 && (
 
                            <button onClick={() => {
 
                              // conferma prima di eliminare: dico anche cosa si perde
 
                              const g = (week.days || []).length;
 
                              const e = (week.days || []).reduce((t: number, d: any) => t + (d.blocks || []).length, 0);
 
                              const dettaglio = e > 0
 
                                ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'} e ${e} ${e === 1 ? 'esercizio' : 'esercizi'}`
 
                                : (g > 0 ? ` con ${g} ${g === 1 ? 'giorno' : 'giorni'}` : '');
 
                              if (!confirm(`Eliminare "${week.weekName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                              const upd = JSON.parse(JSON.stringify(programWeeks));
 
                              upd.splice(actualWIdx, 1);
 
                              setProgramWeeks(upd);
 
                              // resto sulla settimana vicina invece di tornare alla prima
 
                              const vicina = upd[Math.min(actualWIdx, upd.length - 1)];
 
                              if (vicina) {
 
                                setSelectedWeekView(vicina.weekName);
 
                                if (vicina.days?.length > 0) setSelectedDayView(vicina.days[0].dayName);
 
                              }
 
                            }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Settimana</button>
 
                          )}
 
                        </div>
 
 
 
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
 
                          {week.days.map((day: any, dIdx: number) => {
 
                            const isSelected = selectedDayView === day.dayName;
 
                            return (
 
                              <button
 
                                key={dIdx}
 
                                onClick={() => setSelectedDayView(day.dayName)}
 
                                style={{ ...pillola(isSelected, 'var(--fg-10b981)', 'piccolo') }}
 
                              >
 
                                {day.dayName}
 
                              </button>
 
                            );
 
                          })}
 
                          <button onClick={() => addDay(actualWIdx)} style={{ ...pillola(false, 'var(--fg-10b981)', 'piccolo'), background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', border: '1px dashed var(--bd-10b981)' }}>+ Giorno</button>
 
                        </div>
 
 
 
                        {(() => {
 
                          const giorni = week.days || [];
 
                          const pos = giorni.findIndex((d: any) => d.dayName === selectedDayView);
 
                          if (pos < 0) return null;
 
                          const azione: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '999px', padding: '6px 11px', fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-475569)', cursor: 'pointer' };
 
                          return (
 
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
 
                              <button onClick={() => moveDayOrder(actualWIdx, pos, 'left')} disabled={pos === 0} style={{ ...azione, opacity: pos === 0 ? 0.4 : 1 }}>
 
                                <Icona nome="sinistra" size={12} /> Sposta a sinistra
 
                              </button>
 
                              <button onClick={() => moveDayOrder(actualWIdx, pos, 'right')} disabled={pos === giorni.length - 1} style={{ ...azione, opacity: pos === giorni.length - 1 ? 0.4 : 1 }}>
 
                                <Icona nome="destra" size={12} /> Sposta a destra
 
                              </button>
 
                              <button onClick={() => cloneDay(actualWIdx, giorni[pos])} style={azione}>
 
                                <Icona nome="duplica" size={12} /> Duplica
 
                              </button>
 
                            </div>
 
                          );
 
                        })()}
 
 
 
                        {week.days.filter((d: any) => d.dayName === selectedDayView).map((day: any) => {
 
                          const actualDIdx = week.days.findIndex((d: any) => d.dayName === selectedDayView);
 
                          return (
 
                            <div key={actualDIdx} style={{ background: 'var(--bg-f8fafc)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
 
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 180px', minWidth: 0 }}>
 
                                  <input
 
                                    type="text"
 
                                    value={day.dayName}
 
                                    onChange={(e) => {
 
                                      const upd = JSON.parse(JSON.stringify(programWeeks));
 
                                      upd[actualWIdx].days[actualDIdx].dayName = e.target.value;
 
                                      setSelectedDayView(e.target.value);
 
                                      setProgramWeeks(upd);
 
                                    }}
 
                                    style={{ fontWeight: 'bold', color: 'var(--fg-10b981)', fontSize: '14px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', padding: '6px 10px', borderRadius: '6px', flex: 1, minWidth: 0 }}
 
                                  />
 
                                  {(() => {
 
                                    const quanti = (day.blocks || []).length;
 
                                    return (
 
                                      <span
 
                                        title={quanti === 1 ? 'Un blocco in questo giorno' : `${quanti} blocchi in questo giorno`}
 
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '5px 11px', borderRadius: '999px', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0 }}
 
                                      >
 
                                        {quanti === 1 ? '1 blocco' : `${quanti} blocchi`}
 
                                      </span>
 
                                    );
 
                                  })()}
 
                                </div>
 
                                {week.days.length > 1 && (
 
                                  <button onClick={() => {
 
                                    // conferma prima di eliminare il giorno
 
                                    const e = (day.blocks || []).length;
 
                                    const dettaglio = e > 0 ? ` con ${e} ${e === 1 ? 'esercizio' : 'esercizi'}` : '';
 
                                    if (!confirm(`Eliminare "${day.dayName}"${dettaglio}?\n\nNon si puo' annullare.`)) return;
 
 
 
                                    const upd = JSON.parse(JSON.stringify(programWeeks));
 
                                    upd[actualWIdx].days.splice(actualDIdx, 1);
 
                                    setProgramWeeks(upd);
 
                                    // resto sul giorno vicino invece di tornare al primo
 
                                    const vicino = upd[actualWIdx].days[Math.min(actualDIdx, upd[actualWIdx].days.length - 1)];
 
                                    if (vicino) setSelectedDayView(vicino.dayName);
 
                                  }} style={{ background: 'var(--bg-fee2e2)', border: '1px solid #ef4444', color: 'var(--fg-ef4444)', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0, whiteSpace: 'nowrap' }}>Elimina Giorno</button>
 
                                )}
 
                              </div>
 
 
 
                              {day.blocks.map((block: any, bIdx: number) => {
 
                                const blockKey = `prog_${actualWIdx}_${actualDIdx}_${bIdx}`;
 
                                const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
 
 
                                return (
 
                                  <div key={block.id} style={{ background: 'var(--bg-ffffff)', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
 
                                      <span
 
                                        title={`Blocco ${bIdx + 1} di ${(day.blocks || []).length}`}
 
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '26px', height: '26px', padding: '0 7px', borderRadius: '999px', background: 'var(--bg-1f2937)', color: '#fff', fontSize: '11.5px', fontWeight: 'bold', flexShrink: 0 }}
 
                                      >
 
                                        {bIdx + 1}
 
                                      </span>
 
                                      <div style={{ position: 'relative', flex: '1 1 140px', minWidth: 0 }}>
 
                                        <select
 
                                          value={block.type || 'forza'}
 
                                          onChange={(e) => scegliTipoBlocco('free', actualWIdx, actualDIdx, bIdx, e.target.value)}
 
                                          style={{
 
                                            width: '100%', boxSizing: 'border-box',
 
                                            padding: '9px 30px 9px 14px', borderRadius: '999px', cursor: 'pointer',
 
                                            fontSize: '12.5px', fontWeight: 'bold',
 
                                            border: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
 
                                            background: block.type === 'warmup' ? '#f59e0b'
 
                                            : block.type === 'superserie' ? '#c2410c'
 
                                              : block.type === 'wod' ? '#2563eb'
 
                                              : block.type === 'test' ? '#7c3aed'
 
                                              : 'var(--bg-10b981)',
 
                                            color: block.type === 'warmup' ? '#101214' : block.type === 'superserie' ? '#ffffff' : block.type === 'wod' ? '#ffffff' : block.type === 'test' ? '#ffffff' : 'var(--onacc)',
 
                                          }}
 
                                        >
 
                                          <option value="warmup">WARM UP</option>
 
                                          <option value="superserie">SUPERSERIE</option>
 
                                          <option value="forza">FORZA</option>
 
                                          <option value="wod">WOD</option>
 
                                          <option value="test">TEST</option>
 
                                        </select>
 
                                        <span style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex', color: '#fff' }}>
 
                                          <Icona nome="giu" size={14} />
 
                                        </span>
 
                                      </div>
 
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
 
                                        <button type="button" onClick={() => toggleBlockCollapse(blockKey)} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
 
                                        <button type="button" onClick={() => apriDuplicaBlocco('free', actualWIdx, actualDIdx, bIdx, block)} title="Duplica esercizio" style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '4px 7px', cursor: 'pointer', fontSize: '13px' }}><Icona nome="duplica" size={14} /></button>
 
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'up')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="su" size={14} /></button>
 
                                        <button type="button" onClick={() => moveFreeBlock(actualWIdx, actualDIdx, bIdx, 'down')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="giu" size={14} /></button>
 
                                        <button type="button" onClick={() => removeBlockFromFreeDay(actualWIdx, actualDIdx, bIdx)} style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}><Icona nome="cestino" size={14} /></button>
 
                                      </div>
 
                                    </div>
 
 
 
                                    <div style={{ marginBottom: '10px' }}>
 
                                      {block.type === 'test' ? (
 
                                        <select value={block.name || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '4px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', marginBottom: '8px' }}>
 
                                          <option value="">Scegli un test...</option>
 
                                          <optgroup label="Metcon">
 
                                            {metconPRNames.map((n: string) => <option key={n} value={n}>{`Max Effort ${n}`}</option>)}
 
                                          </optgroup>
 
                                          <optgroup label="Gymnastics">
 
                                            {gymPRNames.map((n: string) => <option key={n} value={n}>{`Max Rep ${n}`}</option>)}
 
                                          </optgroup>
 
                                          <optgroup label="Benchmark WOD">
 
                                            {BENCHMARK_NAMES.map((n: string) => <option key={n} value={n}>{n}</option>)}
 
                                          </optgroup>
 
                                        </select>
 
                                      ) : block.type === 'forza' ? (
 
                                        <div>
 
                                          <CampoEsercizio
 
                                            placeholder="Inserisci o seleziona esercizio..."
 
                                            valore={block.name}
 
                                            onChange={(v: string) => {
 
                                              const upd = JSON.parse(JSON.stringify(programWeeks));
 
                                              const target = upd[actualWIdx].days[actualDIdx].blocks[bIdx];
 
                                              target.name = v;
 
                                              const inLibreria = exerciseLibrary.find((ex: any) => sameName(ex.name, v));
 
                                              if (inLibreria && inLibreria.video_url) target.videoUrl = inLibreria.video_url;
 
                                              setProgramWeeks(upd);
 
                                            }}
 
                                            elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                          />
 
                                        </div>
 
                                      ) : haElenco(block.type) ? (
 
                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-92400e)' }}>{block.name || 'Warm up'}</span>
 
                                      ) : (
 
                                        <input type="text" value={block.name} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} placeholder="Nome WOD" style={{ width: '100%', padding: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                      )}
 
                                    </div>
 
 
 
                                    {!isClosed && (
 
                                      <div>
 
                                        {!haElenco(block.type) && (
 
                                        <div style={{ marginBottom: '10px' }}>
 
                                          <input type="url" value={block.videoUrl || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'videoUrl', e.target.value)} placeholder="Link video esercizio" style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '6px', fontSize: '12px' }} />
 
                                          {block.type === 'forza' && block.name && block.name.trim() && !exerciseLibrary.some((ex: any) => sameName(ex.name, block.name)) && (
 
                                            <button
 
                                              type="button"
 
                                              onClick={() => salvaInLibreriaDaScheda(block.name, block.videoUrl || '')}
 
                                              style={{ width: '100%', boxSizing: 'border-box', marginBottom: '8px', padding: '8px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}
 
                                            >
 
                                              ➕ Salva &quot;{block.name}&quot; in Libreria Esercizi
 
                                            </button>
 
                                          )}
 
                                        </div>
 
                                        )}
 
                                        {block.type === 'test' ? (
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '8px' }}>
 
                                            {(() => {
 
                                              const bench = BENCHMARK_WODS.find((b) => b.name === block.name);
 
                                              if (!bench) return null;
 
                                              const lvl = block.benchLevel || 'rx';
 
                                              return (
 
                                                <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', borderRadius: '6px', padding: '8px', marginBottom: '8px' }}>
 
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
 
                                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--fg-10b981)' }}>{bench.name}</span>
 
                                                    <div style={{ display: 'flex', gap: '3px' }}>
 
                                                      {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                        <button key={k} type="button" onClick={() => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'benchLevel', k)} style={{ padding: '3px 8px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                      ))}
 
                                                    </div>
 
                                                  </div>
 
                                                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                                  <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                                </div>
 
                                              );
 
                                            })()}
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE DEL COACH</label>
 
                                            <input type="text" placeholder="Indicazioni per l'atleta (facoltativo)" value={block.target || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'target', e.target.value)} style={{ width: '100%', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontWeight: 'bold', boxSizing: 'border-box' }} />
 
                                            <p style={{ fontSize: '10px', color: 'var(--fg-64748b)', margin: '6px 0 0 0', lineHeight: 1.3 }}>Blocco di test: niente serie, ripetizioni, carico o recupero.</p>
 
                                          </div>
 
                                        ) : haElenco(block.type) ? (
 
                                          <div>
 
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
 
                                              <div style={{ flex: '2 1 150px', minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Titolo della sezione</label>
 
                                                <input type="text" placeholder={nomeElenco(block.type)} value={block.name || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', e.target.value)} onBlur={(e) => { if (!e.target.value.trim()) updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'name', nomeElenco(block.type)); }} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                                              </div>
 
                                              <div style={{ flex: '1 1 80px', minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>N. round</label>
 
                                                <input type="text" inputMode="numeric" placeholder="1" value={block.rounds || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }} />
 
                                              </div>
 
                                              <div style={{ flex: '1 1 120px', minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Rest tra i round</label>
 
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
 
                                                  <input
 
                                                    type="text"
 
                                                    inputMode="numeric"
 
                                                    placeholder="0"
 
                                                    value={block.warmRestMin ?? ''}
 
                                                    onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'warmRestMin', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                    style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                                  />
 
                                                  <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>:</span>
 
                                                  <input
 
                                                    type="text"
 
                                                    inputMode="numeric"
 
                                                    placeholder="0"
 
                                                    value={block.warmRestSec ?? ''}
 
                                                    onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'warmRestSec', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                    style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', padding: '9px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                                  />
 
                                                </div>
 
                                                <span style={{ display: 'block', fontSize: '9.5px', color: 'var(--fg-94a3b8)', marginTop: '2px' }}>min : sec — vuoto = nessun recupero</span>
 
                                              </div>
 
                                            </div>
 
 
 
                                        {block.type === 'superserie' && <SelettoreModoSuperserie valore={block.scoreUnit} onChange={(v: string) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />}
 
                                            {(block.items || []).map((it: any, i: number) => (
 
                                              <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                                <CampoEsercizio
 
                                                  placeholder="Nome esercizio"
 
                                                  valore={it.name}
 
                                                  onChange={(v: string) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                                  elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                                  style={{ marginBottom: '7px' }}
 
                                                />
 
 
 
                                                <div style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
 
                                                  <input
 
                                                    type="text"
 
                                                    placeholder="10 rep / 30&quot;"
 
                                                    value={it.value || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'value', e.target.value)}
 
                                                    style={{ flex: '2 1 150px', minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                                  />
 
                                                  <input
 
                                                    type="text"
 
                                                    placeholder="rec. 1:30"
 
                                                    title="Recupero dopo questo esercizio. Vuoto = vale quello della sezione."
 
                                                    value={it.rest || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'rest', e.target.value)}
 
                                                    style={{ flex: '1 1 78px', minWidth: 0, boxSizing: 'border-box', padding: '10px 6px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px', textAlign: 'center' }}
 
                                                  />
 
 
                                                </div>
 
                                            {block.type === 'superserie' && block.scoreUnit !== 'spunta' && <SelettoreScoreItem valore={it.scoreUnit} onChange={(v: string) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'scoreUnit', v)} />}
 
                                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '7px', alignItems: 'center', marginBottom: '7px' }}>
                                                  <input
 
                                                    type="text"
 
                                                    placeholder="80% / RPE 8"
 
                                                    title="Carico previsto: percentuale sul massimale oppure RPE. Vuoto = nessuna indicazione."
 
                                                    value={it.load || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'load', e.target.value)}
 
                                                    style={{ flex: '1 1 130px', minWidth: 0, maxWidth: '200px', boxSizing: 'border-box', padding: '10px 8px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '14px' }}
 
                                                  />
 
                                                  <span style={{ display: 'flex', gap: '7px', alignItems: 'center', flexShrink: 0 }}>
 
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="su" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="giu" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => togliWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="cestino" size={14} />
 
                                                  </button>
 
                                                  </span>
 
                                                </div>
 
 
 
                                                <input type="url" placeholder="Link video (facoltativo)" value={it.videoUrl || ''} onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }} />
 
                                              </div>
 
                                            ))}
 
 
 
 
 
                                            <button type="button" onClick={() => aggiungiWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '999px', border: '1px dashed var(--bd-10b981)', background: 'var(--bg-ecfdf5)', color: 'var(--fg-047857)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
 
                                              Aggiungi esercizio
 
                                            </button>
 
 
 
      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', margin: '10px 0 3px 0' }}>Note del coach</label>
 
      <textarea rows={3} placeholder="Indicazioni sull'esecuzione, cosa curare..." value={block.notes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '9px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical' }} />
 
                                          </div>
 
                                        ) : isMobility(block.name) ? (
 
                                          <div>
 
                                            <label style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px' }}>Testo della mobility (lo vedrà l&apos;atleta)</label>
 
                                            <textarea
 
                                              rows={6}
 
                                              placeholder={'Scrivi qui la sequenza.\nVai a capo dove vuoi: le righe vengono rispettate.'}
 
                                              value={block.wodNotes || ''}
 
                                              onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)}
 
                                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '8px' }}
 
                                            />
 
                                            <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', display: 'block', lineHeight: 1.45 }}>
 
                                              L&apos;atleta non inserisce punteggi: vede il testo e il video, può spuntare &quot;fatto&quot; e lasciare una nota.
 
                                            </span>
 
                                          </div>
 
                                        ) : block.type === 'forza' ? (
 
                                          <div>
 
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</label>
 
                                                <input type="number" value={block.sets} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'sets', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</label>
 
                                                <input type="text" value={block.reps} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'reps', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                            </div>
 
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</label>
 
                                                <input type="text" value={block.load} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'load', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                              <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</label>
 
                                                <input type="text" value={block.rest} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'rest', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }} />
 
                                              </div>
 
                                            </div>
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                            <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                              <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE</label>
 
                                              <textarea rows={3} value={block.notes} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'notes', e.target.value)} placeholder="Note..." style={{ minHeight: '78px', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
                                            </div>
 
                                          </div>
 
                                        ) : (
 
                                          <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                            <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</label>
 
                                            <textarea value={block.wodNotes || ''} onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'wodNotes', e.target.value)} placeholder="Scrivi il WOD..." style={{ width: '100%', boxSizing: 'border-box', height: '120px', fontFamily: 'inherit', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', fontSize: '12px' }} />
 
 
 
                                              {(() => {
 
                                                const trovati = trovaEserciziNelTesto(block.wodNotes, block.items);
 
                                                if (trovati.length === 0) return null;
 
                                                return (
 
                                                  <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '10px 12px', margin: '10px 0' }}>
 
                                                    <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--fg-1e40af)', marginBottom: '7px', lineHeight: 1.45 }}>
 
                                                      <strong>{trovati.length === 1 ? 'Trovato 1 esercizio' : `Trovati ${trovati.length} esercizi`} in libreria:</strong>{' '}
 
                                                      {trovati.map((t: any) => t.name).join(' · ')}
 
                                                    </span>
 
                                                    <button
 
                                                      type="button"
 
                                                      onClick={() => aggiornaWarmItems('free', actualWIdx, actualDIdx, bIdx, [...(block.items || []), ...trovati])}
 
                                                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                    >
 
                                                      <Icona nome="piu" size={12} /> Aggiungi con i video
 
                                                    </button>
 
                                                  </div>
 
                                                );
 
                                              })()}
 
 
 
                                        <SelettoreScore valore={block.scoreUnit} onChange={(v: string) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreUnit', v)} />
 
                                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', margin: '10px 0 4px 0' }}>
 
                                              <div style={{ flex: 1, minWidth: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>
 
                                                  Esercizi con video <span style={{ color: 'var(--fg-94a3b8)', fontWeight: 'normal' }}>(facoltativo)</span>
 
                                                </label>
 
                                              </div>
 
                                              <div style={{ width: '92px', flexShrink: 0 }}>
 
                                                <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '3px' }}>Round</label>
 
                                                <input
 
                                                  type="text"
 
                                                  inputMode="numeric"
 
                                                  placeholder="—"
 
                                                  value={block.scoreRounds || ''}
 
                                                  onChange={(e) => updateFreeBlock(actualWIdx, actualDIdx, bIdx, 'scoreRounds', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
 
                                                  title="Quante caselle dare all'atleta per il risultato. Vuoto = una sola."
 
                                                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 4px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', textAlign: 'center' }}
 
                                                />
 
                                              </div>
 
                                            </div>
 
                                            {(block.items || []).map((it: any, i: number) => (
 
                                              <div key={i} style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
 
                                                <CampoEsercizio
 
                                                  placeholder="Nome esercizio"
 
                                                  valore={it.name}
 
                                                  onChange={(v: string) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'name', v)}
 
                                                  elenco={exerciseLibrary.filter((ex: any) => !ex.dismissed).map((ex: any) => ex.name)}
 
                                                  style={{ marginBottom: '7px' }}
 
                                                />
 
 
 
                                                <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
 
                                                  <input
 
                                                    type="url"
 
                                                    placeholder="Link video"
 
                                                    value={it.videoUrl || ''}
 
                                                    onChange={(e) => modificaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'videoUrl', e.target.value)}
 
                                                    style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', color: 'var(--fg-000000)', fontSize: '12.5px' }}
 
                                                  />
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'su')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="su" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => spostaWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i, 'giu')} style={{ background: 'var(--bg-f1f5f9)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-475569)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="giu" size={14} />
 
                                                  </button>
 
                                                  <button type="button" onClick={() => togliWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items, i)} style={{ background: 'var(--bg-fee2e2)', border: 'none', borderRadius: '999px', padding: '9px 10px', color: 'var(--fg-b91c1c)', cursor: 'pointer', flexShrink: 0 }}>
 
                                                    <Icona nome="cestino" size={14} />
 
                                                  </button>
 
                                                </div>
 
                                              </div>
 
                                            ))}
 
                                            <button type="button" onClick={() => aggiungiWarmItem('free', actualWIdx, actualDIdx, bIdx, block.items)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', borderRadius: '999px', border: '1px dashed #3b82f6', background: 'var(--bg-eff6ff)', color: 'var(--fg-1d4ed8)', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
 
                                              Aggiungi esercizio con video
 
                                            </button>
 
                                          </div>
 
                                        )}
 
                                      </div>
 
                                    )}
 
                                  </div>
 
                                );
 
                              })}
 
                              <button onClick={() => addBlockToFreeDay(actualWIdx, actualDIdx)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: 'var(--bg-f1f5f9)', border: 'none', color: 'var(--fg-000000)', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Aggiungi Blocco</button>
 
                            </div>
 
                          );
 
                        })}
 
                      </div>
 
                    );
 
                  })}
 
 
 
                  {saveMessage && <p style={{ color: 'var(--fg-10b981)', fontSize: '14px', marginBottom: '12px' }}>{saveMessage}</p>}
 
                  <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-10b981)', display: 'block', marginBottom: '10px' }}>💡 Consigli per l&apos;atleta</span>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli per l&apos;allenamento</label>
 
                    <textarea rows={4} placeholder={'Indicazioni su tecnica, riscaldamento, recuperi, gestione dei carichi...'} value={programTrainingTips} onChange={(e) => setProgramTrainingTips(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, marginBottom: '12px' }} />
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Consigli nutrizionali</label>
 
                    <textarea rows={4} placeholder={'Indicazioni generali su alimentazione e idratazione...'} value={programNutritionTips} onChange={(e) => setProgramNutritionTips(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }} />
 
                  </div>
 
 
 
                  <button onClick={saveProgramToLibrary} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' }}>Salva Programma</button>
 
                </div>
 
              ) : (
 
                <div>
 
                  <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>
 
                    {libraryView === 'cestino' ? 'Cestino Programmi' : 'Libreria Programmi'}
 
                  </h3>
 
 
 
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
 
                    {[
 
                      { k: 'programmi', t: '📋 Programmi', n: 0 },
 
                      { k: 'cestino', t: '🗑️ Cestino', n: contaCestino },
 
                    ].map((v) => (
 
                      <button
 
                        key={v.k}
 
                        onClick={() => setLibraryView(v.k as any)}
 
                        style={{ ...pillola(libraryView === v.k, 'var(--fg-334155)'), flex: '1 1 auto' }}
 
                      >
 
                        {v.t}{v.n > 0 ? ` (${v.n})` : ''}
 
                      </button>
 
                    ))}
 
                  </div>
 
 
 
                  {libraryView === 'programmi' && (
 
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
 
                      {[
 
                        { k: 'tutti', t: 'Tutti', n: attivi.length, col: 'var(--fg-475569)' },
 
                        { k: 'assegnati', t: '✅ Assegnati', n: contaAssegnati, col: 'var(--fg-16a34a)' },
 
                        { k: 'bozze', t: '🔒 Bozze', n: contaBozze, col: '#d97706' },
 
                        { k: 'prove', t: '🎁 Prove', n: contaProve, col: 'var(--fg-2563eb)' },
 
                        { k: 'inscadenza', t: '⏳ In scadenza', n: contaInScadenza, col: 'var(--fg-ea580c)' },
 
                        { k: 'scaduti', t: '⛔ Scaduti', n: contaScaduti, col: 'var(--fg-dc2626)' },
 
                      ].map((f) => (
 
                        <button
 
                          key={f.k}
 
                          onClick={() => setLibraryFilter(f.k as any)}
 
                          style={{ ...pillola(libraryFilter === f.k, f.col, 'piccolo'), flex: '1 1 auto' }}
 
                        >
 
                          {f.t} ({f.n})
 
                        </button>
 
                      ))}
 
                    </div>
 
                  )}
 
 
 
 
 
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
 
                    <input
 
                      type="text"
 
                      placeholder="Cerca un programma..."
 
                      value={cercaProgrammi}
 
                      onChange={(e: any) => setCercaProgrammi(e.target.value)}
 
                      style={{ width: '100%', boxSizing: 'border-box', padding: '11px 34px 11px 12px', borderRadius: '10px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)' }}
 
                    />
 
                    {cercaProgrammi && (
 
                      <button onClick={() => setCercaProgrammi('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg-94a3b8)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
 
                        <Icona nome="chiudi" size={15} />
 
                      </button>
 
                    )}
 
                  </div>
 
 
 
                  {libraryView === 'programmi' && (libraryFilter === 'tutti' || libraryFilter === 'assegnati') && (
 
                    <select value={libraryFilterAthlete} onChange={(e) => setLibraryFilterAthlete(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', background: 'var(--bg-ffffff)', marginBottom: '12px' }}>
 
                      <option value="">Filtra per utente (Tutti)</option>
 
                      {athletes.map((a) => (
 
                        <option key={a.id} value={a.id}>{a.full_name || a.email}</option>
 
                      ))}
 
                    </select>
 
                  )}
 
 
 
                  {filteredLibraryPrograms.length === 0 ? (
 
                    <p style={{ color: 'var(--fg-64748b)', textAlign: 'center', padding: '30px', fontSize: '13px', lineHeight: 1.5 }}>
 
                      {cercaProgrammi
 
                        ? `Nessun programma con "${cercaProgrammi}".`
 
                        : libraryView === 'cestino'
 
                        ? 'Il cestino è vuoto.'
 
                        : libraryFilter === 'scaduti'
 
                          ? 'Nessun programma scaduto.'
 
                          : libraryFilter === 'inscadenza'
 
                            ? 'Nessun programma in scadenza nei prossimi sette giorni.'
 
                            : libraryFilter === 'prove'
 
                          ? 'Nessuna settimana di prova. Creane una da "Crea Programma" indicando lo stile nel campo "Settimana di prova".'
 
                          : libraryFilter === 'bozze'
 
                            ? 'Nessuna bozza: tutti i programmi sono visibili a qualcuno.'
 
                            : libraryFilter === 'assegnati'
 
                              ? 'Nessun programma assegnato.'
 
                              : 'Nessun programma trovato.'}
 
                    </p>
 
                  ) : (
 
                    filteredLibraryPrograms.map((prog) => {
 
                      const assignedList = athletes.filter((a) => prog.assignedAthleteIds?.includes(a.id));
 
 
 
                      const weeks = normalizeProgramWeeks(prog);
 
                      const activeWeekName = coachSelectedWeek[prog.id] || (weeks.length > 0 ? weeks[0].weekName : '');
 
                      const activeWeekObj = weeks.find((w: any) => w.weekName === activeWeekName) || weeks[0];
 
                      const activeDay = coachSelectedDay[prog.id] || (activeWeekObj?.days && activeWeekObj.days.length > 0 ? activeWeekObj.days[0].dayName : '');
 
 
 
                      // Stato scadenza: le settimane di prova non cambiano mai colore
 
                      const gg = prog.trialStyle ? null : giorniDallaScadenza(prog.endDate);
 
                      const progScaduto = gg !== null && gg > 0;
 
                      const progInScadenza = gg !== null && gg <= 0 && gg >= -7;
 
 
 
                      return (
 
                        <div key={prog.id} style={{ background: prog.trialStyle ? 'var(--bg-d6e9fb)' : progScaduto ? 'var(--bg-fee2e2)' : prog.visibility === 'none' ? 'var(--bg-fdf3d3)' : 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '16px', borderRadius: '14px', border: prog.trialStyle ? '2px solid #3b82f6' : progScaduto ? '2px solid #dc2626' : progInScadenza ? '2px solid #f97316' : prog.visibility === 'none' ? '2px solid var(--bd-e0a80c)' : '1px solid var(--bd-d8dde3)', marginBottom: '16px' }}>
 
                          <div style={{ marginBottom: '12px' }}>
 
                            <div>
 
                              <h4 style={{ overflowWrap: 'anywhere', margin: '0 0 6px 0', color: 'var(--fg-10b981)', fontSize: '17px', lineHeight: 1.25 }}>{prog.title}</h4>
 
                              <div style={{ marginBottom: '8px' }}>
 
                                {prog.trialStyle ? (
 
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', background: 'var(--bg-dbeafe)', color: 'var(--fg-1e40af)' }}>
 
                                    🎁 Settimana di prova — {prog.trialStyle === 'pesi' ? 'Sala Pesi' : prog.trialStyle === 'hybrid' ? 'Hybrid' : 'Cross Training'}
 
                                  </span>
 
                                ) : (
 
                                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 9px', borderRadius: '20px', background: prog.visibility === 'none' ? 'var(--bg-fef3c7)' : prog.visibility === 'all' ? 'var(--bg-e0f2fe)' : 'var(--bg-dcfce7)', color: prog.visibility === 'none' ? 'var(--fg-92400e)' : prog.visibility === 'all' ? 'var(--fg-075985)' : 'var(--fg-166534)' }}>
 
                                    {prog.visibility === 'none' ? '🔒 Bozza — non visibile' : prog.visibility === 'all' ? '🌍 Visibile a tutti' : '👥 Visibile agli assegnati'}
 
                                  </span>
 
                                )}
 
                              </div>
 
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
 
                                {!prog.trialStyle && <span style={{ fontSize: '11px', color: assignedList.length > 0 ? 'var(--fg-0284c7)' : 'var(--fg-000000)', background: 'var(--bg-f1f5f9)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
 
                                  Assegnato: {assignedList.length > 0 ? assignedList.map(a => (a.full_name || a.email || '').trim()).join(', ') : 'Tutti (Generale)'}
 
                                </span>}
 
                                {!prog.trialStyle && (prog.startDate || prog.endDate) && (() => {
 
                                  const st = getProgramDateStatus(prog.startDate, prog.endDate);
 
                                  return (
 
                                  <span style={{ fontSize: '11px', color: st.color, background: st.bg, padding: '3px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}>
 
                                    {st.icon} {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}{st.label ? ` · ${st.label}` : ''}
 
                                  </span>
 
                                  ); })()}
 
 
 
                              </div>
 
                            </div>
 
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
 
                              {showDeletedPrograms ? (
 
                                <>
 
                                  <button onClick={() => restoreProgram(prog.id)} style={{ background: 'var(--bg-ecfdf5)', border: '1px solid var(--bd-a7f3d0)', color: 'var(--fg-047857)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>♻️ Ripristina</button>
 
                                  <button onClick={() => permanentlyDeleteProgram(prog.id)} style={{ background: '#7f1d1d', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}><Icona nome="cestino" size={12} /> Elimina definitivamente</button>
 
                                </>
 
                              ) : (
 
                                <>
 
                                  {!prog.trialStyle && (
 
                                    <button
 
                                      onClick={() => setRisultatiAperti({ progId: prog.id })}
 
                                      style={{ background: 'var(--bg-ecfdf5)', border: '1px solid var(--bd-6ee7b7)', color: 'var(--fg-047857)', borderRadius: '999px', padding: '7px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
 
                                    >
 
                                      <Icona nome="grafico" size={12} /> Risultati
 
                                    </button>
 
                                  )}
 
                                  {!prog.trialStyle && <button onClick={() => toggleProgramVisibility(prog)} title={prog.visibility === 'none' ? 'Rendi visibile agli atleti' : 'Nascondi agli atleti'} style={{ background: prog.visibility === 'none' ? 'var(--bg-fef3c7)' : 'var(--bg-f4f4f5)', border: prog.visibility === 'none' ? '1px solid var(--bd-fcd34d)' : '1px solid var(--bd-d4d4d8)', color: prog.visibility === 'none' ? 'var(--fg-92400e)' : 'var(--fg-3f3f46)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>{prog.visibility === 'none' ? '👁 Mostra' : '🙈 Nascondi'}</button>}
 
                                  <button onClick={() => duplicateProgram(prog)} style={{ background: 'var(--bg-ecfdf5)', border: '1px solid var(--bd-a7f3d0)', color: 'var(--fg-047857)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Duplica</button>
 
                                  <button onClick={() => {
 
                                    const progToEdit = JSON.parse(JSON.stringify(prog));
 
                                    progToEdit.weeks = normalizeProgramWeeks(progToEdit);
 
                                    setEditingProgram(progToEdit);
 
                                    if (progToEdit.weeks.length > 0) {
 
                                      setSelectedWeekView(progToEdit.weeks[0].weekName);
 
                                      if (progToEdit.weeks[0].days?.length > 0) setSelectedDayView(progToEdit.weeks[0].days[0].dayName);
 
                                    }
 
                                  }} style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', color: 'var(--fg-1d4ed8)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Modifica</button>
 
                                  <button onClick={() => deleteProgram(prog.id)} style={{ background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', color: 'var(--fg-b91c1c)', padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Elimina</button>
 
                                </>
 
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
 
 
 
          {subscriptionStatus === 'attivo' && bannerData.image_url && (
 
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
 
              {bannerData.link_url ? (
 
                <a href={bannerData.link_url} target="_blank" rel="noopener noreferrer">
 
                  <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', boxSizing: 'border-box', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--bd-26262a)', cursor: 'pointer' }} />
 
                </a>
 
              ) : (
 
                <img src={bannerData.image_url} alt="Sponsor Banner" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--bd-26262a)' }} />
 
              )}
 
            </div>
 
          )}
 
 
 
          {provaAttiva && trialChoice && (
 
            <div style={{ background: 'var(--bg-fef9c3)', border: '1px solid var(--bd-facc15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
 
              <span style={{ fontSize: '20px' }}>⏳</span>
 
              <span style={{ fontSize: '13px', color: 'var(--fg-854d0e)', fontWeight: 'bold' }}>
 
                Settimana di prova — {giorniProvaRimasti === 1 ? 'ultimo giorno' : `ancora ${giorniProvaRimasti} giorni`}
 
              </span>
 
            </div>
 
          )}
 
 
 
          {subscriptionStatus === 'prova' && !trialChoice && (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', borderRadius: '14px', border: '1px solid var(--bd-d8dde3)', padding: '20px', marginBottom: '20px' }}>
 
              <h3 style={{ margin: '0 0 6px 0', color: 'var(--fg-10b981)', fontSize: '19px' }}>🎁 La tua settimana di prova</h3>
 
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--fg-475569)', lineHeight: 1.5 }}>
 
                Scegli lo stile di allenamento che preferisci: riceverai subito cinque giorni di allenamento da provare.
 
              </p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 
                {[
 
                  { k: 'pesi', icon: '🏋️', t: 'Sala Pesi', d: 'Forza e ipertrofia, schede classiche da palestra' },
 
                  { k: 'hybrid', icon: '🏃', t: 'Hybrid', d: 'Resistenza e forza insieme, lavoro continuo' },
 
                  { k: 'cross', icon: '🤸', t: 'Cross Training', d: 'Sollevamenti, ginnastica e circuiti misti' },
 
                ].map((s) => (
 
                  <button
 
                    key={s.k}
 
                    onClick={() => chooseTrial(s.k)}
 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left', padding: '14px', borderRadius: '999px', border: '1px solid var(--bd-cbd5e1)', background: 'var(--bg-ffffff)', cursor: 'pointer' }}
 
                  >
 
                    <span style={{ fontSize: '26px' }}>{s.icon}</span>
 
                    <span style={{ flex: 1 }}>
 
                      <span style={{ display: 'block', fontWeight: 'bold', fontSize: '15px', color: 'var(--fg-000000)' }}>{s.t}</span>
 
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--fg-64748b)' }}>{s.d}</span>
 
                    </span>
 
                    <span style={{ color: 'var(--fg-10b981)', fontWeight: 'bold' }}>→</span>
 
                  </button>
 
                ))}
 
              </div>
 
            </div>
 
          )}
 
 
 
          {(subscriptionStatus === 'scaduto' || provaScaduta) && (
 
            <div style={{ background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', borderRadius: '14px', padding: '24px 20px', marginBottom: '20px', textAlign: 'center', boxShadow: '0 3px 14px rgba(0,0,0,0.32)' }}>
 
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>💪</div>
 
              <h3 style={{ margin: '0 0 8px 0', fontSize: '19px' }}>{provaScaduta ? 'La tua settimana di prova è finita' : 'Vuoi continuare ad allenarti con noi?'}</h3>
 
              <p style={{ margin: '0 0 18px 0', fontSize: '14px', lineHeight: 1.6, opacity: 0.95, whiteSpace: 'pre-line' }}>
 
                {trialCta.text || 'Scopri le programmazioni personalizzate e riprendi da dove hai lasciato.'}
 
              </p>
 
              <p style={{ margin: '0 0 18px 0', fontSize: '13px', lineHeight: 1.55, opacity: 0.95, background: 'rgba(var(--onacc-rgb), 0.12)', borderRadius: '10px', padding: '12px 14px' }}>
 
                Quella che hai provato è una scheda standard, uguale per tutti. Il percorso vero è un altro: viene costruito su di te, sui tuoi obiettivi, sul tempo che hai e su eventuali problematiche fisiche — e viene aggiornato man mano che progredisci.
 
              </p>
 
              {trialCta.link_url && (
 
                <a
 
                  href={trialCta.link_url}
 
                  target="_blank"
 
                  rel="noopener noreferrer"
 
                  style={{ display: 'inline-block', padding: '13px 26px', borderRadius: '10px', background: 'var(--bg-ffffff)', color: 'var(--fg-059669)', fontWeight: 'bold', textDecoration: 'none', fontSize: '15px' }}
 
                >
 
                  Scopri le programmazioni
 
                </a>
 
              )}
 
            </div>
 
          )}
 
 
 
 
 
 
 
          {activeTab === 'profile' ? (
 
            <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '20px', borderRadius: '12px', border: '1px solid var(--bd-e2e8f0)' }}>
 
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
 
                <button onClick={() => setAthleteProfileTab('anagrafici')} style={{ ...pillola(athleteProfileTab === 'anagrafici', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>Dati Anagrafici</button>
 
                <button onClick={() => setAthleteProfileTab('anamnesi')} style={{ ...pillola(athleteProfileTab === 'anamnesi', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>Anamnesi</button>
 
                <button onClick={() => setAthleteProfileTab('privacy')} style={{ ...pillola(athleteProfileTab === 'privacy', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>Privacy</button>
 
              </div>
 
 
 
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
 
                <button onClick={() => setAthleteProfileTab('maxes')} style={{ ...pillola(athleteProfileTab === 'maxes', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>🏋🏻 Massimali</button>
 
                <button onClick={() => setAthleteProfileTab('gare')} style={{ ...pillola(athleteProfileTab === 'gare', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>🎯 Gare</button>
 
                <button onClick={() => setAthleteProfileTab('progressi')} style={{ ...pillola(athleteProfileTab === 'progressi', 'var(--fg-10b981)', 'piccolo'), flex: '1 1 auto' }}>🚀 Percorso</button>
 
              </div>
 
 
 
              {athleteProfileTab === 'anagrafici' && (
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>Dati Anagrafici</h3>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Nome e Cognome</label>
 
                    <input type="text" value={personalData.full_name} onChange={(e) => setPersonalData({ ...personalData, full_name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Email</label>
 
                    <input type="text" value={session.user.email || ''} disabled style={{ overflowWrap: 'anywhere', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)', background: 'var(--bg-f1f5f9)', color: 'var(--fg-64748b)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Data di nascita</label>
 
                    <input type="date" value={personalData.birth_date} onChange={(e) => setPersonalData({ ...personalData, birth_date: e.target.value })} style={{ width: '100%', maxWidth: '100%', minWidth: 0, padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  {isMinorenne(personalData.birth_date) && (
 
                    <div style={{ background: 'var(--bg-fffbeb)', border: '1px solid var(--bd-fcd34d)', borderRadius: '8px', padding: '12px' }}>
 
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-92400e)', display: 'block', marginBottom: '4px' }}>Genitore o tutore</label>
 
                      <input type="text" placeholder="Nome e cognome" value={personalData.guardian_name || ''} onChange={(e) => setPersonalData({ ...personalData, guardian_name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                    </div>
 
                  )}
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Sesso</label>
 
                    <div style={{ display: 'flex', gap: '8px' }}>
 
                      {[['m', '♂ Maschio'], ['f', '♀ Femmina']].map(([k, label]) => (
 
                        <button key={k} type="button" onClick={() => setPersonalData({ ...personalData, gender: k })} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: personalData.gender === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: personalData.gender === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>{label}</button>
 
                      ))}
 
                    </div>
 
                  </div>
 
                  <div style={{ display: 'flex', gap: '12px' }}>
 
                    <div style={{ flex: 1 }}>
 
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Peso (kg)</label>
 
                      <input type="number" step="0.1" min="0" value={personalData.weight} onChange={(e) => setPersonalData({ ...personalData, weight: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                    </div>
 
                    <div style={{ flex: 1 }}>
 
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Altezza (cm)</label>
 
                      <input type="number" step="0.1" min="0" value={personalData.height} onChange={(e) => setPersonalData({ ...personalData, height: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                    </div>
 
                  </div>
 
                  <button
 
                    disabled={personalDataSaving}
 
                    onClick={() => savePersonalData(session.user.id, personalData, false)}
 
                    style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: personalDataSaving ? 0.6 : 1 }}
 
                  >
 
                    {personalDataSaving ? 'Salvataggio...' : 'Salva Dati Anagrafici'}
 
                  </button>
 
                </div>
 
              )}
 
 
 
              {athleteProfileTab === 'gare' && pannelloCompetizioni(session.user.id, competitions, false)}
 
 
 
              {athleteProfileTab === 'progressi' && pannelloProgressi(storicoCarichi, true, session.user.id)}
 
 
 
              {athleteProfileTab === 'maxes' && (
 
              <>
 
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
 
                <button onClick={() => setAthleteMaxSubTab('strength')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'strength' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'strength' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Strength PR</button>
 
                <button onClick={() => setAthleteMaxSubTab('metcon')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'metcon' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'metcon' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Metcon PR</button>
 
                <button onClick={() => setAthleteMaxSubTab('gym')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'gym' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'gym' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Gymnastics PR</button>
 
                  <button onClick={() => setAthleteMaxSubTab('bench')} style={{ flex: '1 1 auto', padding: '8px 12px', whiteSpace: 'nowrap', borderRadius: '999px', border: 'none', background: athleteMaxSubTab === 'bench' ? '#0284c7' : 'var(--bg-f1f5f9)', color: athleteMaxSubTab === 'bench' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Benchmark</button>
 
              </div>
 
 
 
              {athleteMaxSubTab === 'strength' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--fg-10b981)' }}>Strength PR</h3>
 
 
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 
                {maxExerciseNames.map((exName) => (
 
                  <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                    <div style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '14px', marginBottom: '10px' }}>{exName}</div>
 
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', alignItems: 'stretch' }}>
 
                      {REP_SCHEMES.map((reps) => (
 
                        <div key={reps} style={{ background: 'var(--bg-ffffff)', padding: '8px 6px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', display: 'flex', flexDirection: 'column' }}>
 
                          <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>{reps} RM</label>
 
                          <input type="text" placeholder="kg" value={athleteMaxes[exName]?.[reps] || ''} onChange={(e) => handleMaxTyping(exName, reps, e.target.value)} onBlur={(e) => handleMaxChange(exName, reps, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }} style={{ width: '100%', boxSizing: 'border-box', padding: '6px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }} />
 
                        </div>
 
                      ))}
 
                    </div>
 
 
 
                    <button
 
                      onClick={() => toggleMaxHistory(session.user.id, exName)}
 
                      style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 0 0 0' }}
 
                    >
 
                      {openHistoryKey === `${session.user.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                    </button>
 
 
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
 
                      <MaxHistoryChart points={historyCache[`${session.user.id}|${exName}`]} onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
 
                    )}
 
 
 
                  </div>
 
                ))}
 
              </div>
 
 
 
              </>
 
              )}
 
 
 
              {athleteMaxSubTab === 'metcon' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>⏱️ Metcon PR</h3>
 
              <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0' }}>Inserisci il tempo nel formato minuti:secondi (es. 1:45). Più basso è, meglio è.</p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                {metconPRNames.map((exName) => (
 
                  <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 
                      <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '13px' }}>{exName}</span>
 
                      <input
 
                        type="text"
 
                        placeholder="mm:ss"
 
                        value={athleteMaxes[exName]?.time || ''}
 
                        onChange={(e) => handleSpecialMaxTyping(exName, 'tempo', e.target.value)} onBlur={(e) => handleSpecialMaxChange(exName, 'tempo', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
 
                        style={{ width: '90px', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
 
                      />
 
                    </div>
 
                    <button onClick={() => toggleMaxHistory(session.user.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                      {openHistoryKey === `${session.user.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                    </button>
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
 
                      <SimpleHistoryChart points={historyCache[`${session.user.id}|${exName}`]} lowerIsBetter unit="tempo" onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
 
                    )}
 
 
 
                  </div>
 
                ))}
 
              </div>
 
 
 
              </>
 
              )}
 
 
 
              {athleteMaxSubTab === 'gym' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>🤸 Gymnastics PR</h3>
 
              <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0' }}>Massimo numero di ripetizioni consecutive (unbroken).</p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                {gymPRNames.map((exName) => (
 
                  <div key={exName} style={{ background: 'var(--bg-f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 
                      <span style={{ flex: 1, fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '13px' }}>{exName}</span>
 
                      <input
 
                        type="number"
 
                        min="0"
 
                        placeholder="rep"
 
                        value={athleteMaxes[exName]?.reps || ''}
 
                        onChange={(e) => handleSpecialMaxTyping(exName, 'rep', e.target.value)} onBlur={(e) => handleSpecialMaxChange(exName, 'rep', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
 
                        style={{ width: '90px', padding: '6px', background: 'var(--bg-ffffff)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}
 
                      />
 
                    </div>
 
                    <button onClick={() => toggleMaxHistory(session.user.id, exName)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                      {openHistoryKey === `${session.user.id}|${exName}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                    </button>
 
                    {openHistoryKey === `${session.user.id}|${exName}` && (
 
                      <SimpleHistoryChart points={historyCache[`${session.user.id}|${exName}`]} unit="rep" onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${exName}`)} />
 
                    )}
 
 
 
                  </div>
 
                ))}
 
              </div>
 
              </>
 
              )}
 
 
 
              {athleteMaxSubTab === 'bench' && (
 
              <>
 
              <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', color: 'var(--fg-10b981)' }}>🏅 Benchmark WOD</h3>
 
              <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0' }}>Scegli il livello con cui l&apos;hai affrontato e registra il risultato.</p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
 
                {BENCHMARK_WODS.map((b) => {
 
                  const lvl = benchLevel[b.name] || (athleteMaxes[b.name]?.level as any) || 'rx';
 
                  const saved = athleteMaxes[b.name]?.result || '';
 
                  const unita = b.type === 'time' ? 'tempo (mm:ss)' : b.type === 'rounds' ? 'round + rep' : 'ripetizioni';
 
                  return (
 
                    <div key={b.name} style={{ background: 'var(--bg-f8fafc)', padding: '14px', borderRadius: '10px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
 
                        <span style={{ fontWeight: 'bold', color: 'var(--fg-000000)', fontSize: '16px' }}>{b.name}</span>
 
                        <div style={{ display: 'flex', gap: '4px' }}>
 
                          {[['rx', 'RX'], ['int', 'INT'], ['beg', 'BEG']].map(([k, label]) => (
 
                            <button key={k} onClick={() => setBenchLevel({ ...benchLevel, [b.name]: k as any })} style={{ padding: '4px 9px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>{label}</button>
 
                          ))}
 
                        </div>
 
                      </div>
 
 
 
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(b, lvl)}</p>
 
                      <div style={{ fontSize: '11px', color: 'var(--fg-b45309)', background: 'var(--bg-fef3c7)', display: 'inline-block', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '10px' }}>🎯 Target: {benchTarget(b, lvl)}</div>
 
 
 
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                        <span style={{ fontSize: '11px', color: 'var(--fg-64748b)', flex: 1 }}>Il tuo risultato — {unita}</span>
 
                        <ScoreInput
 
                          mode={b.type}
 
                          value={saved}
 
                          onChange={(v: string) => handleBenchTyping(b.name, v, lvl)}
 
                          onCommit={(v: string) => handleBenchSave(b.name, v, lvl, b.type)}
 
                        />
 
                      </div>
 
 
 
                      <button onClick={() => toggleMaxHistory(session.user.id, b.name)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: '8px 0 0 0' }}>
 
                        {openHistoryKey === `${session.user.id}|${b.name}` ? '\u25b2 Chiudi storico' : '\u25bc Apri storico'}
 
                      </button>
 
                      {openHistoryKey === `${session.user.id}|${b.name}` && (
 
                        <SimpleHistoryChart points={historyCache[`${session.user.id}|${b.name}`]} lowerIsBetter={b.type === 'time'} unit={b.type === 'time' ? 'tempo' : b.type === 'rounds' ? 'round' : 'rep'} onDelete={(id) => deleteHistoryPoint(id, `${session.user.id}|${b.name}`)} />
 
                      )}
 
                    </div>
 
                  );
 
                })}
 
              </div>
 
              </>
 
              )}
 
 
 
              </>
 
              )}
 
 
 
              {athleteProfileTab === 'anamnesi' && (
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
 
                  {needsAnamnesis && (
 
                    <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-93c5fd)', borderRadius: '8px', padding: '14px' }}>
 
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--fg-1e40af)', display: 'block', marginBottom: '4px' }}>👋 Benvenuto in AM Training!</span>
 
                      <span style={{ fontSize: '13px', color: 'var(--fg-1e3a8a)', lineHeight: 1.4 }}>
 
                        Prima di iniziare, compila la tua anamnesi: serve al coach per costruire un programma adatto a te e sicuro. Ci vuole un minuto.
 
                      </span>
 
                    </div>
 
                  )}
 
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>Anamnesi</h3>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Obiettivo</label>
 
                    <textarea value={anamnesis.goal} onChange={(e) => setAnamnesis({ ...anamnesis, goal: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Numero allenamenti settimanali</label>
 
                    <select value={anamnesis.weekly_sessions} onChange={(e) => setAnamnesis({ ...anamnesis, weekly_sessions: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                      <option value="">Seleziona...</option>
 
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n}</option>)}
 
                    </select>
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Durata singolo allenamento</label>
 
                    <select value={anamnesis.session_duration} onChange={(e) => setAnamnesis({ ...anamnesis, session_duration: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }}>
 
                      <option value="">Seleziona...</option>
 
                      <option value="30'">30'</option>
 
                      <option value="1 ora">1 ora</option>
 
                      <option value="1 ora e 30'">1 ora e 30'</option>
 
                      <option value="2 ore">2 ore</option>
 
                      <option value="più di 2 ore">più di 2 ore</option>
 
                    </select>
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Attrezzatura disponibile</label>
 
                    <textarea value={anamnesis.equipment} onChange={(e) => setAnamnesis({ ...anamnesis, equipment: e.target.value })} rows={2} placeholder='Se ti alleni in palestra scrivi: "palestra"' style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <div>
 
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '4px' }}>Problematiche fisiche o sistemiche</label>
 
                    <textarea value={anamnesis.physical_issues} onChange={(e) => setAnamnesis({ ...anamnesis, physical_issues: e.target.value })} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px', boxSizing: 'border-box' }} />
 
                  </div>
 
                  <button
 
                    disabled={anamnesisSaving}
 
                    onClick={() => saveAnamnesis(session.user.id, anamnesis, false)}
 
                    style={{ padding: '12px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: anamnesisSaving ? 0.6 : 1 }}
 
                  >
 
                    {anamnesisSaving ? 'Salvataggio...' : 'Salva Anamnesi'}
 
                  </button>
 
                </div>
 
              )}
 
 
 
              {athleteProfileTab === 'privacy' && (
 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 
                  <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--fg-10b981)' }}>Privacy e dati personali</h3>
 
 
 
                  <div style={{ background: 'var(--bg-f0fdf4)', border: '1px solid var(--bd-86efac)', borderRadius: '8px', padding: '12px' }}>
 
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-166534)', display: 'block', marginBottom: '4px' }}>Stato del consenso</span>
 
                    <span style={{ fontSize: '13px', color: 'var(--fg-334155)' }}>
 
                      {privacyConsentAt
 
                        ? `Consenso prestato il ${new Date(privacyConsentAt).toLocaleDateString('it-IT')} (informativa v${PRIVACY_VERSION})`
 
                        : 'Consenso non ancora registrato.'}
 
                    </span>
 
                  </div>
 
 
 
                  <div>
 
                    <button onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)} style={{ background: 'none', border: 'none', color: 'var(--fg-0284c7)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
 
                      {showPrivacyPolicy ? '▲ Nascondi informativa' : '▼ Leggi l\'informativa completa'}
 
                    </button>
 
                    {showPrivacyPolicy && (
 
                      <div style={{ marginTop: '10px', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '14px', maxHeight: '400px', overflowY: 'auto' }}>
 
                        <PrivacyPolicyContent minor={isMinorenne(personalData.birth_date)} />
 
                      </div>
 
                    )}
 
                  </div>
 
 
 
                  <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '6px' }}>🔑 Cambia password</span>
 
                    {!showChangePassword ? (
 
                      <button onClick={() => setShowChangePassword(true)} style={{ padding: '10px 16px', borderRadius: '999px', background: '#475569', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
 
                        Imposta una nuova password
 
                      </button>
 
                    ) : (
 
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
 
                        <input type="password" placeholder="Nuova password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        <input type="password" placeholder="Ripeti la nuova password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', fontSize: '13px' }} />
 
                        <div style={{ display: 'flex', gap: '8px' }}>
 
                          <button onClick={cambiaPassword} disabled={passwordSaving} style={{ flex: 1, minWidth: 0, padding: '10px', borderRadius: '999px', background: 'var(--bg-10b981)', color: 'var(--onacc)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: passwordSaving ? 0.6 : 1 }}>
 
                            {passwordSaving ? 'Salvataggio...' : 'Salva'}
 
                          </button>
 
                          <button onClick={() => { setShowChangePassword(false); setNewPassword(''); setNewPassword2(''); }} style={{ padding: '10px 16px', borderRadius: '999px', background: 'var(--bg-e2e8f0)', color: 'var(--fg-334155)', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
 
                            Annulla
 
                          </button>
 
                        </div>
 
                      </div>
 
                    )}
 
                  </div>
 
 
 
                  <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-475569)', display: 'block', marginBottom: '6px' }}>📥 Scarica i tuoi dati</span>
 
                    <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', margin: '0 0 10px 0', lineHeight: 1.4 }}>Ottieni una copia completa di tutti i dati che ti riguardano (anagrafica, anamnesi, massimali, risultati, programmi assegnati) in un file leggibile.</p>
 
                    <button onClick={downloadMyData} disabled={accountActionLoading} style={{ padding: '10px 16px', borderRadius: '999px', background: '#0284c7', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: accountActionLoading ? 0.6 : 1 }}>
 
                      {accountActionLoading ? 'Attendere...' : 'Scarica i miei dati'}
 
                    </button>
 
                  </div>
 
 
 
                  <div style={{ background: 'var(--bg-fef2f2)', border: '1px solid var(--bd-fecaca)', borderRadius: '8px', padding: '14px' }}>
 
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--fg-991b1b)', display: 'block', marginBottom: '6px' }}><Icona nome="cestino" size={12} /> Elimina il tuo account</span>
 
                    <p style={{ fontSize: '12px', color: 'var(--fg-7f1d1d)', margin: '0 0 10px 0', lineHeight: 1.4 }}>Cancella definitivamente l&apos;account e tutti i dati associati: anagrafica, anamnesi, massimali e risultati. L&apos;operazione non è reversibile.</p>
 
                    <button onClick={deleteMyAccount} disabled={accountActionLoading} style={{ padding: '10px 16px', borderRadius: '999px', background: '#dc2626', color: '#fff', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '13px', opacity: accountActionLoading ? 0.6 : 1 }}>
 
                      {accountActionLoading ? 'Attendere...' : 'Elimina account'}
 
                    </button>
 
                  </div>
 
 
 
                  <p style={{ fontSize: '12px', color: 'var(--fg-64748b)', lineHeight: 1.4, margin: 0 }}>
 
                    Per rettificare i dati, limitare o opporti al trattamento, revocare il consenso o per qualsiasi altra richiesta, contatta il coach. Hai diritto di proporre reclamo al Garante per la protezione dei dati personali.
 
                  </p>
 
                </div>
 
              )}
 
            </div>
 
          ) : (
 
            <div>
 
              <CompetitionCountdown gare={competitions} />
 
 
 
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>I tuoi allenamenti</h3>
 
              {athletePrograms.length === 0 ? (
 
                <div style={{ background: 'var(--bg-fafafa)', color: 'var(--fg-000000)', boxShadow: '0 3px 14px rgba(0,0,0,0.32)', padding: '36px 24px', borderRadius: '14px', border: '1px solid var(--bd-d8dde3)', textAlign: 'center' }}>
 
                  <svg viewBox="0 0 120 90" style={{ width: '150px', height: 'auto', display: 'block', margin: '0 auto 18px auto' }} aria-hidden="true">
 
                    {/* bilanciere appoggiato: nessun allenamento in corso */}
 
                    <rect x="16" y="43" width="88" height="4" rx="2" style={{ fill: 'var(--fg-cbd5e1)' }} />
 
                    <rect x="24" y="34" width="9" height="22" rx="3" style={{ fill: 'var(--fg-94a3b8)' }} />
 
                    <rect x="12" y="38" width="8" height="14" rx="3" style={{ fill: 'var(--fg-cbd5e1)' }} />
 
                    <rect x="87" y="34" width="9" height="22" rx="3" style={{ fill: 'var(--fg-94a3b8)' }} />
 
                    <rect x="100" y="38" width="8" height="14" rx="3" style={{ fill: 'var(--fg-cbd5e1)' }} />
 
                    <ellipse cx="60" cy="72" rx="34" ry="4" style={{ fill: 'var(--fg-e2e8f0)' }} />
 
                    <circle cx="60" cy="20" r="9" fill="none" style={{ stroke: 'var(--fg-10b981)' }} strokeWidth="2.5" strokeDasharray="3 3" />
 
                    <path d="M60 15v6l4 2" style={{ stroke: 'var(--fg-10b981)' }} strokeWidth="2.5" strokeLinecap="round" fill="none" />
 
                  </svg>
 
 
 
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--fg-334155)' }}>
 
                    {subscriptionStatus === 'prova' && !trialChoice
 
                      ? 'Scegli come iniziare'
 
                      : 'Nessun allenamento assegnato'}
 
                  </h4>
 
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-64748b)', lineHeight: 1.55, maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
 
                    {subscriptionStatus === 'prova' && !trialChoice
 
                      ? 'Seleziona qui sopra lo stile di allenamento che preferisci per attivare la tua settimana di prova.'
 
                      : 'Il coach sta preparando il tuo programma. Appena sarà pronto lo troverai qui e riceverai una notifica.'}
 
                  </p>
 
                </div>
 
              ) : (
 
                athletePrograms.map((prog) => {
 
                  const weeks = normalizeProgramWeeks(prog);
 
                  const settimaneVisibili = weeks.filter((w: any) => !w?.hidden);
 
                  const sceltaSett = selectedWeeksByProgram[prog.id];
 
                  const currentProgramActiveWeek = (sceltaSett && settimaneVisibili.some((w: any) => w.weekName === sceltaSett))
 
                    ? sceltaSett
 
                    : (settimaneVisibili[0]?.weekName || '');
 
                  const currentWeekObj = weeks.find((w: any) => w.weekName === currentProgramActiveWeek) || settimaneVisibili[0];
 
                  const giorniVisibili = (currentWeekObj?.days || []).filter((d: any) => !d?.hidden);
 
                  const sceltaGiorno = selectedDaysByProgram[prog.id];
 
                  const currentProgramActiveDay = (sceltaGiorno && giorniVisibili.some((d: any) => d.dayName === sceltaGiorno))
 
                    ? sceltaGiorno
 
                    : (giorniVisibili[0]?.dayName || '');
 
                  const giorniScaduto = giorniDallaScadenza(prog.endDate);
 
                  const scaduto = giorniScaduto !== null && giorniScaduto > 0;
 
                  // ultimi sette giorni prima della fine: giorniDallaScadenza e' negativo
 
                  // finche' il programma e' valido, e vale zero il giorno stesso
 
                  const inScadenza = giorniScaduto !== null && giorniScaduto <= 0 && giorniScaduto >= -7;
 
                  const giorniRimasti = scaduto ? GIORNI_VISIBILITA_DOPO_SCADENZA - giorniScaduto : null;
 
 
 
                  return (
 
                    <div key={prog.id} style={{ background: scaduto ? 'var(--bg-fef2f2)' : 'var(--bg-ffffff)', color: 'var(--fg-000000)', boxShadow: '0 6px 22px rgba(0,0,0,0.45)', padding: '20px', borderRadius: '16px', border: scaduto ? '2px solid #ef4444' : inScadenza ? '2px solid #f97316' : '1px solid var(--bd-d8dde3)', marginBottom: '20px' }}>
 
                      {scaduto && (
 
                        <div style={{ background: 'var(--bg-fee2e2)', border: '1px solid var(--bd-fca5a5)', borderRadius: '10px', padding: '11px 13px', marginBottom: '14px', display: 'flex', gap: '9px', alignItems: 'flex-start' }}>
 
                          <span style={{ fontSize: '17px', flexShrink: 0 }}>⛔</span>
 
                          <span style={{ fontSize: '12.5px', color: 'var(--fg-991b1b)', lineHeight: 1.5 }}>
 
                            <strong>Programma scaduto.</strong>{' '}
 
                            {giorniRimasti !== null && giorniRimasti > 0
 
                              ? `Resterà visibile ancora ${giorniRimasti} ${giorniRimasti === 1 ? 'giorno' : 'giorni'}, poi sparirà da questa schermata.`
 
                              : 'Sparirà da questa schermata a breve.'}
 
                          </span>
 
                        </div>
 
                      )}
 
 
 
                      <div style={{ marginBottom: '12px' }}>
 
                        <h4 style={{ overflowWrap: 'anywhere', color: 'var(--fg-10b981)', margin: '0 0 4px 0', fontSize: '18px' }}>{prog.title}</h4>
 
                        {(prog.startDate || prog.endDate) && (() => {
 
                          const st = getProgramDateStatus(prog.startDate, prog.endDate);
 
                          return (
 
                            <span style={{ display: 'block', fontSize: '11px', color: st.color, fontWeight: 'bold' }}>
 
                              {st.icon} {formatDateToIT(prog.startDate)} → {formatDateToIT(prog.endDate)}{st.label ? ` · ${st.label}` : ''}
 
                            </span>
 
                          );
 
                        })()}
 
                      </div>
 
 
 
                      {(() => {
 
                        const prog_ = progressiCompleti(prog, athleteResults[prog.id], storicoCarichi);
 
                        if (!prog_) return null;
 
                        return (
 
                          <button
 
                            onClick={() => setProgressiAperti({ dati: prog_, titolo: prog.title, perAtleta: true })}
 
                            style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '9px', marginBottom: '14px', padding: '12px 14px', borderRadius: '999px', border: '1px solid var(--bd-6ee7b7)', background: 'var(--bg-ecfdf5)', cursor: 'pointer' }}
 
                          >
 
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                              <Icona nome="grafico" size={17} style={{ color: 'var(--fg-047857)' }} />
 
                              <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-047857)' }}>I tuoi progressi</span>
 
                            </span>
 
                            <span style={{ fontSize: '12px', color: 'var(--fg-059669)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
 
                              {prog_.migliorati}/{prog_.totale}
 
                            </span>
 
                          </button>
 
                        );
 
                      })()}
 
 
 
                      {(prog.trainingTips || prog.nutritionTips) && (() => {
 
                        const aperto = openTipsProgram === prog.id;
 
                        const daLeggere = consigliDaLeggere(prog);
 
                        return (
 
                        <div style={{ marginBottom: '14px' }}>
 
                          <button
 
                            onClick={() => apriConsigli(prog.id, aperto)}
 
                            style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '12px 14px', borderRadius: '999px', border: '1px solid var(--bd-fde68a)', background: 'var(--bg-fffbeb)', cursor: 'pointer' }}
 
                          >
 
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                              <span style={{ fontSize: '18px' }}>💡</span>
 
                              <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-92400e)' }}>Consigli del coach</span>
 
                              {daLeggere && !aperto && (
 
                                <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>NUOVO</span>
 
                              )}
 
                            </span>
 
                            <span style={{ color: 'var(--fg-b45309)', fontWeight: 'bold', fontSize: '14px' }}>{aperto ? '▲' : '▼'}</span>
 
                          </button>
 
 
 
                          {aperto && (
 
                            <div style={{ marginTop: '8px' }}>
 
                              {prog.trainingTips && prog.nutritionTips && (
 
                                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
 
                                  <button onClick={() => setTipsTab('training')} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: tipsTab === 'training' ? 'var(--bg-10b981)' : 'var(--bg-f1f5f9)', color: tipsTab === 'training' ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🏋️ Allenamento</button>
 
                                  <button onClick={() => setTipsTab('nutrition')} style={{ flex: 1, minWidth: 0, padding: '9px', borderRadius: '999px', border: 'none', background: tipsTab === 'nutrition' ? '#0284c7' : 'var(--bg-f1f5f9)', color: tipsTab === 'nutrition' ? '#fff' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>🥗 Nutrizione</button>
 
                                </div>
 
                              )}
 
 
 
                              {prog.trainingTips && (!prog.nutritionTips || tipsTab === 'training') && (
 
                                <div style={{ background: 'var(--bg-f0fdf4)', border: '1px solid var(--bd-86efac)', borderRadius: '10px', padding: '14px' }}>
 
                                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-166534)', marginBottom: '6px' }}>🏋️ Consigli di allenamento</span>
 
                                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{prog.trainingTips}</p>
 
                                </div>
 
                              )}
 
 
 
                              {prog.nutritionTips && (!prog.trainingTips || tipsTab === 'nutrition') && (
 
                                <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '10px', padding: '14px' }}>
 
                                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--fg-1e40af)', marginBottom: '6px' }}>🥗 Consigli nutrizionali</span>
 
                                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{prog.nutritionTips}</p>
 
                                </div>
 
                              )}
 
                            </div>
 
                          )}
 
                        </div>
 
                        ); })()}
 
 
 
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
 
                        {weeks.map((week: any) => week?.hidden ? null : (
 
                          <button
 
                            key={week.weekName}
 
                            onClick={() => {
 
                              setSelectedWeeksByProgram(prev => ({ ...prev, [prog.id]: week.weekName }));
 
                              if (week.days && week.days.length > 0) {
 
                                const primoVisibile = (week.days || []).find((d: any) => !d?.hidden);
 
                                if (primoVisibile) setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: primoVisibile.dayName }));
 
                              }
 
                            }}
 
                            style={{
 
                              padding: '7px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
 
                              fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
 
                              background: currentProgramActiveWeek === week.weekName ? 'var(--bg-334155)' : 'var(--bg-e8edf3)',
 
                              color: currentProgramActiveWeek === week.weekName ? '#fff' : 'var(--fg-64748b)',
 
                            }}
 
                          >
 
                            {week.weekName}
 
                          </button>
 
                        ))}
 
                      </div>
 
 
 
                      {currentWeekObj?.days ? (
 
                        <div>
 
                          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '6px' }}>
 
                            {currentWeekObj.days.map((day: any, idx: number) => {
 
                              if (day?.hidden) return null;
 
                              const attivo = currentProgramActiveDay === day.dayName;
 
 
 
                              // quanti blocchi di quel giorno hanno un risultato compilato
 
                              const wReale = weeks.findIndex((w: any) => w.weekName === currentProgramActiveWeek);
 
                              const tuttiDelGiorno = day.blocks || [];
 
                              const indiciDelGiorno = tuttiDelGiorno.map((_b: any, bi: number) => bi);
 
                              const blocchi = indiciDelGiorno.map((bi: number) => tuttiDelGiorno[bi]);
 
                              const fatti = indiciDelGiorno.filter((bi: number) => {
 
                                const r = athleteResults[prog.id]?.[`${wReale}_${idx}_${bi}`];
 
                                return r && (String(r.score || '').trim() || String(r.notes || '').trim() || r.done);
 
                              }).length;
 
                              const totale = blocchi.length;
 
                              const completo = totale > 0 && fatti === totale;
 
 
 
                              return (
 
                                <button
 
                                  key={idx}
 
                                  onClick={() => setSelectedDaysByProgram(prev => ({ ...prev, [prog.id]: day.dayName }))}
 
                                  style={{
 
                                    display: 'inline-flex', alignItems: 'center', gap: '7px',
 
                                    padding: '9px 15px', borderRadius: '999px', border: 'none', cursor: 'pointer',
 
                                    fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
 
                                    background: attivo ? 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)' : 'var(--bg-e8edf3)',
 
                                    color: attivo ? 'var(--onacc)' : 'var(--fg-334155)',
 
                                    boxShadow: attivo ? '0 3px 9px rgba(var(--acc-rgb), 0.4)' : 'none',
 
                                    transition: 'background .15s ease',
 
                                  }}
 
                                >
 
                                  {day.dayName}
 
                                  {totale > 0 && (
 
                                    <span
 
                                      title={`${fatti} di ${totale} compilati`}
 
                                      style={{
 
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
 
                                        minWidth: '19px', height: '19px', borderRadius: '999px', padding: '0 5px',
 
                                        fontSize: '10px', fontWeight: 'bold',
 
                                        background: completo ? (attivo ? 'rgba(var(--onacc-rgb), 0.2)' : 'var(--bg-10b981)')
 
: fatti > 0 ? (attivo ? 'rgba(var(--onacc-rgb), 0.2)' : '#fcd34d')
 
: (attivo ? 'rgba(var(--onacc-rgb), 0.2)' : 'var(--bg-cbd5e1)'),
 
color: attivo || completo ? 'var(--onacc)' : fatti > 0 ? '#101214' : 'var(--fg-334155)',
 
                                      }}
 
                                    >
 
                                      {completo ? <Icona nome="spunta" size={11} /> : `${fatti}/${totale}`}
 
                                    </span>
 
                                  )}
 
                                </button>
 
                              );
 
                            })}
 
                          </div>
 
 
 
                          {currentWeekObj.days.filter((d: any) => d.dayName === currentProgramActiveDay && !d?.hidden).map((day: any) => {
 
                            const realWeekIndex = weeks.findIndex((w: any) => w.weekName === currentProgramActiveWeek);
 
                            const realDayIndex = currentWeekObj.days.findIndex((d: any) => d.dayName === day.dayName);
 
                            const dayCollapseKey = `${prog.id}_w_${realWeekIndex}_d_${realDayIndex}`;
 
                            const isDayClosed = collapsedProgramDays[dayCollapseKey] === undefined ? true : collapsedProgramDays[dayCollapseKey];
 
 
 
                            return (
 
                              <div key={realDayIndex} style={{ background: 'var(--bg-eef2f7)', padding: '14px', borderRadius: '12px', border: '1px solid var(--bd-dbe3ec)', boxShadow: 'inset 0 2px 5px rgba(15,23,42,0.07)', marginBottom: '14px' }}>
 
                                <div
 
                                  onClick={() => toggleProgramDayCollapse(dayCollapseKey)}
 
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: isDayClosed ? '0' : '12px', cursor: 'pointer' }}
 
                                >
 
                                  <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--fg-141416)' }}>{currentWeekObj.weekName} - {day.dayName}</span>
 
                                  <button
 
                                    type="button"
 
                                    onClick={(e) => { e.stopPropagation(); toggleProgramDayCollapse(dayCollapseKey); }}
 
                                    title={isDayClosed ? 'Apri' : 'Chiudi'}
 
                                    style={{ background: 'transparent', border: 'none', color: 'var(--fg-10b981)', padding: '4px 6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', lineHeight: 1, flexShrink: 0 }}
 
                                  >
 
                                    {isDayClosed ? '▼' : '▲'}
 
                                  </button>
 
                                </div>
 
 
 
                                {!isDayClosed && (
 
                                  <div>
 
                                    {day.blocks?.length === 0 ? (
 
                                      <p style={{ color: 'var(--fg-64748b)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>Nessun esercizio inserito.</p>
 
                                    ) : (
 
                                      day.blocks?.map((blk: any, bIdx: number) => {
 
                                        const blockKey = `ath_${prog.id}_${realWeekIndex}_${realDayIndex}_${bIdx}`;
 
                                        const resultKey = `${realWeekIndex}_${realDayIndex}_${bIdx}`;
 
                                        // La finestra dei risultati vale ovunque serva un punteggio.
 
                                        // Restano fuori Mobility e riscaldamento, che hanno la spunta.
 
                                        const usaFinestra = blk.type !== 'warmup' && !isMobility(blk.name);
 
                                        const isClosed = collapsedBlocks[blockKey] === undefined ? true : collapsedBlocks[blockKey];
 
 
 
                                        return (
 
                                          <div key={bIdx} style={{ background: 'var(--bg-ffffff)', padding: '14px', borderRadius: '10px', marginBottom: '10px', border: '1px solid var(--bd-e6ebf2)', boxShadow: '0 2px 6px rgba(15,23,42,0.09)' }}>
 
                                            <div
 
                                              onClick={() => toggleBlockCollapse(blockKey)}
 
                                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}
 
                                            >
 
                                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--fg-10b981)' }}>{blk.name || (haElenco(blk.type) ? nomeElenco(blk.type) : '')}</div>
 
                                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
 
                                                {(blk.type === 'wod' || blk.type === 'test') && (
 
                                                  <button
 
                                                    type="button"
 
                                                    onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'scelta', progId: prog.id, key: resultKey }); }}
 
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', padding: '7px 13px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(var(--acc-rgb), 0.35)' }}
 
                                                  >
 
                                                      <Icona nome="timer" size={13} /> Timer
 
                                                  </button>
 
                                                )}
 
                                                {blk.videoUrl && (
 
                                                  <a href={blk.videoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '7px 13px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 'bold', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 6px rgba(37,99,235,0.35)' }}>
 
                                                    <Icona nome="video" size={13} /> Video
 
                                                  </a>
 
                                                )}
 
                                                <button type="button" onClick={(e) => { e.stopPropagation(); toggleBlockCollapse(blockKey); }} style={{ background: 'var(--bg-f1f5f9)', border: '1px solid var(--bd-cbd5e1)', color: 'var(--fg-000000)', padding: '4px 8px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px' }}>{isClosed ? '▼' : '▲'}</button>
 
                                              </div>
 
                                            </div>
 
 
 
                                            {!isClosed && (
 
                                              <div>
 
                                                {haElenco(blk.type) ? (
 
                                                  <div style={{ background: blk.type === 'superserie' ? 'var(--bg-ffffff)' : 'var(--bg-fffbeb)', border: blk.type === 'superserie' ? '1px solid var(--bd-e2e8f0)' : '1px solid var(--bd-fde68a)', borderRadius: '10px', padding: '12px' }}>
 
                                                    {(parseInt(String(blk.rounds || ''), 10) || 1) > 1 && (
 
                                                      <span style={{ display: 'inline-block', background: blk.type === 'superserie' ? '#c2410c' : '#f59e0b', color: blk.type === 'superserie' ? '#fff' : '#101214', fontSize: '11px', fontWeight: 'bold', padding: '3px 10px', borderRadius: '999px', marginBottom: '9px' }}>
 
                                                        {parseInt(String(blk.rounds), 10)} round
 
                                                      </span>
 
                                                    )}
 
                                                    {(blk.items || []).length === 0 && (
 
                                                      <span style={{ fontSize: '12px', color: blk.type === 'superserie' ? 'var(--fg-64748b)' : 'var(--fg-a16207)' }}>Nessun esercizio inserito.</span>
 
                                                    )}
 
                                                    {(blk.items || []).map((it: any, i: number) => (
 
                                                      <React.Fragment key={i}>
 
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 26px 26px', alignItems: 'center', columnGap: '8px', padding: '7px 0', borderBottom: 'none' }}>
 
                                                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: blk.type === 'superserie' ? 'var(--fg-334155)' : 'var(--fg-78350f)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                          {it.name}
 
                                                          {String(it.load || '').trim() ? (() => {
 
                                                            const suggerito = computeLoadHint(it.load, it.value, trovaMaxes(athleteMaxes, it.name));
 
                                                            return (
 
                                                              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 'normal', color: 'var(--fg-64748b)', marginTop: '2px' }}>
 
                                                                {it.load}
 
                                                                {suggerito ? <span style={{ color: 'var(--fg-1d4ed8)', fontWeight: 'bold' }}>{` \u00b7 ${suggerito}`}</span> : null}
 
                                                              </span>
 
                                                            );
 
                                                          })() : null}
 
                                                        </span>
 
 
 
                                                        <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: blk.type === 'superserie' ? 'var(--fg-475569)' : 'var(--fg-b45309)', overflowWrap: 'anywhere', maxWidth: '110px', textAlign: 'right' }}>
 
                                                          {it.value}
 
                                                        </span>
 
 
 
                                                        <span style={{ display: 'flex', justifyContent: 'center' }}>
 
                                                          {it.videoUrl && (
 
                                                            <a
 
                                                              href={it.videoUrl}
 
                                                              target="_blank"
 
                                                              rel="noopener noreferrer"
 
                                                              onClick={(e) => e.stopPropagation()}
 
                                                              title="Guarda il video"
 
                                                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '999px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', boxShadow: '0 2px 5px rgba(37,99,235,0.3)' }}
 
                                                            >
 
                                                              <Icona nome="video" size={12} />
 
                                                            </a>
 
                                                          )}
 
                                                        </span>
 
 
 
                                                        <span style={{ display: 'flex', justifyContent: 'center' }}>
 
                                                          {(() => {
 
                                                            const sec = tempoDaValore(it.value);
 
                                                            if (!sec) return null;
 
                                                            return (
 
                                                              <button
 
                                                                onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: sec }); }}
 
                                                                title="Avvia il timer"
 
                                                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '999px', border: 'none', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', cursor: 'pointer', boxShadow: '0 2px 5px rgba(var(--acc-rgb), 0.35)' }}
 
                                                              >
 
                                                                <Icona nome="timer" size={14} />
 
                                                              </button>
 
                                                            );
 
                                                          })()}
 
                                                        </span>
 
                                                      </div>
 
                                                        {i < (blk.items.length - 1) && (() => {
 
                                                          const linea = blk.type === 'superserie' ? 'var(--fg-e2e8f0)' : '#fde68a';
 
                                                          const secRecEx = String(it.rest || '').trim() ? tempoDaValore(it.rest) : 0;
 
                                                          return (
 
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 
                                                              <span style={{ flex: 1, height: '1px', background: linea }} />
 
                                                              {String(it.rest || '').trim() ? (secRecEx ? (
 
                                                                <button
 
                                                                  onClick={(e) => { e.stopPropagation(); preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: secRecEx }); }}
 
                                                                  title="Avvia questo recupero"
 
                                                                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, padding: '3px 10px', borderRadius: '999px', border: `1px solid ${linea}`, background: 'var(--bg-ffffff)', color: 'var(--fg-475569)', fontSize: '10.5px', fontWeight: 'bold', cursor: 'pointer' }}
 
                                                                >
 
                                                                  <Icona nome="timer" size={11} /> {`rec. ${it.rest}`}
 
                                                                </button>
 
                                                              ) : (
 
                                                                <span style={{ flexShrink: 0, fontSize: '10.5px', color: 'var(--fg-94a3b8)', fontWeight: 'bold' }}>{`rec. ${it.rest}`}</span>
 
                                                              )) : null}
 
                                                              <span style={{ flex: 1, height: '1px', background: linea }} />
 
                                                            </div>
 
                                                          );
 
                                                        })()}
 
                                                      </React.Fragment>
 
                                                    ))}
 
                                                    {blk.type !== 'superserie' && (
 
                                                    <button
 
                                                      onClick={() => handleResultChange(prog.id, resultKey, 'done', athleteResults[prog.id]?.[resultKey]?.done ? '' : 'si')}
 
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '9px', padding: '10px', borderRadius: '999px', cursor: 'pointer', marginTop: '10px', border: athleteResults[prog.id]?.[resultKey]?.done ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-fcd34d)', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-ecfdf5)' : 'var(--bg-ffffff)' }}
 
                                                    >
 
                                                      <span style={{ width: '20px', height: '20px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#101214', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-10b981)' : '#fde68a' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done && <Icona nome="spunta" size={13} />}
 
                                                      </span>
 
                                                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--fg-047857)' : 'var(--fg-92400e)' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done ? 'Completato' : 'Segna come fatto'}
 
                                                      </span>
 
                                                    </button>
 
                                                    )}
 
 
 
{blk.type === 'warmup' && (<CampoNote valore={athleteResults[prog.id]?.[resultKey]?.notes} onSalva={(v: string) => handleResultChange(prog.id, resultKey, 'notes', v)} />)}
 
                                                    {(() => {
 
                                                      const mm = parseInt(String(blk.warmRestMin ?? ''), 10) || 0;
 
                                                      const ss = parseInt(String(blk.warmRestSec ?? ''), 10) || 0;
 
                                                      const totale = mm * 60 + ss;
 
                                                      const grezzo = mmss(totale);
 
                                                      const senza = totale <= 0;
 
                                                      if (senza) {
 
                                                        return (
 
                                                          <span style={{ display: 'block', fontSize: '11px', color: blk.type === 'superserie' ? 'var(--fg-64748b)' : 'var(--fg-a16207)', marginTop: '7px', textAlign: 'center' }}>
 
                                                            Nessun recupero tra i round
 
                                                          </span>
 
                                                        );
 
                                                      }
 
                                                      return (
 
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '9px', marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-fef3c7)', border: '1px solid var(--bd-fcd34d)' }}>
 
                                                          <span style={{ fontSize: '12px', color: 'var(--fg-92400e)' }}>
 
                                                            Rest tra i round <strong style={{ fontSize: '14px' }}>{grezzo}</strong>
 
                                                          </span>
 
                                                          <button
 
                                                            onClick={() => { preparaAudio(); setTimerConfig({ tipo: 'recupero', secondi: totale }); }}
 
                                                            title="Avvia il recupero"
 
                                                            aria-label="Avvia il recupero"
 
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', padding: 0, background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', border: 'none', borderRadius: '999px', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(var(--acc-rgb), 0.35)' }}
 
                                                          >
 
                                                            <Icona nome="timer" size={16} />
 
                                                          </button>
 
                                                        </div>
 
                                                      );
 
                                                    })()}
 
 
 
                                                    {blk.notes && (
 
                                                      <p style={{ overflowWrap: 'anywhere', margin: '9px 0 0 0', fontSize: '11.5px', color: blk.type === 'superserie' ? 'var(--fg-334155)' : 'var(--fg-78350f)', lineHeight: 1.5, fontStyle: 'italic', background: blk.type === 'superserie' ? 'var(--bg-f8fafc)' : 'var(--bg-fef3c7)', borderRadius: '6px', padding: '8px 10px', whiteSpace: 'pre-line' }}>
 
                                                        {blk.notes}
 
                                                      </p>
 
                                                    )}
 
                                                  </div>
 
                                                ) : isMobility(blk.name) ? (
 
                                                  <div>
 
                                                    {blk.wodNotes && (
 
                                                      <div style={{ background: 'var(--bg-f5f3ff)', border: '1px solid var(--bd-ddd6fe)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
 
                                                        <p style={{ overflowWrap: 'anywhere', margin: 0, fontSize: '13px', color: 'var(--fg-334155)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{blk.wodNotes}</p>
 
                                                      </div>
 
                                                    )}
 
                                                    <button
 
                                                      onClick={() => handleResultChange(prog.id, resultKey, 'done', athleteResults[prog.id]?.[resultKey]?.done ? '' : 'si')}
 
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '999px', cursor: 'pointer', marginBottom: '8px', border: athleteResults[prog.id]?.[resultKey]?.done ? '2px solid var(--bd-10b981)' : '1px solid var(--bd-cbd5e1)', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-ecfdf5)' : 'var(--bg-ffffff)' }}
 
                                                    >
 
                                                      <span style={{ width: '22px', height: '22px', borderRadius: '999px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold', color: 'var(--onacc)', background: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done ? '\u2713' : ''}
 
                                                      </span>
 
                                                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: athleteResults[prog.id]?.[resultKey]?.done ? 'var(--fg-047857)' : 'var(--fg-334155)' }}>
 
                                                        {athleteResults[prog.id]?.[resultKey]?.done ? 'Completata' : 'Segna come fatta'}
 
                                                      </span>
 
                                                    </button>
 
                                                  </div>
 
                                                ) : blk.type === 'test' ? (
 
                                                  <div style={{ background: 'var(--bg-eff6ff)', padding: '12px', borderRadius: '6px', border: '1px solid var(--bd-bfdbfe)', marginBottom: '8px', textAlign: 'center' }}>
 
                                                    <span style={{ fontSize: '16px', color: 'var(--fg-1e3a8a)', display: 'block', fontWeight: 'bold' }}>{blk.name || 'TEST'}</span>
 
                                                    <span style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--fg-1e40af)', letterSpacing: '0.5px' }}>
 
                                                        {gymPRNames.includes(blk.name) ? 'MAX REP UBK' : metconPRNames.includes(blk.name) ? 'MAX EFFORT' : 'TEST'}
 
                                                    </span>
 
                                                    {blk.target && <span style={{ overflowWrap: 'anywhere', display: 'block', fontSize: '12px', color: 'var(--fg-1e40af)', marginTop: '4px', fontWeight: 'normal' }}>{blk.target}</span>}
 
                                                    {(() => {
 
                                                      const bench = BENCHMARK_WODS.find((b) => b.name === blk.name);
 
                                                      if (!bench) return null;
 
                                                      const lvl = athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
 
                                                      return (
 
                                                        <div style={{ background: 'var(--bg-ffffff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '6px', padding: '10px', marginTop: '8px', textAlign: 'left' }}>
 
                                                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
 
                                                            {[['rx','RX'],['int','INT'],['beg','BEG']].map(([k, lab]) => (
 
                                                              <button key={k} type="button" onClick={(e) => { e.stopPropagation(); handleResultChange(prog.id, resultKey, 'level', k); }} style={{ padding: '3px 10px', borderRadius: '999px', border: 'none', background: lvl === k ? 'var(--bg-10b981)' : 'var(--bg-e2e8f0)', color: lvl === k ? 'var(--onacc)' : 'var(--fg-334155)', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}>{lab}</button>
 
                                                            ))}
 
                                                          </div>
 
                                                          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--fg-334155)', whiteSpace: 'pre-line', lineHeight: 1.45 }}>{benchDesc(bench, lvl)}</p>
 
                                                          <div style={{ fontSize: '10px', color: 'var(--fg-b45309)', marginTop: '6px', fontWeight: 'bold' }}>🎯 Target: {benchTarget(bench, lvl)}</div>
 
                                                        </div>
 
                                                      );
 
                                                    })()}
 
                                                  </div>
 
                                                ) : blk.type === 'forza' ? (
 
                                                  <div>
 
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>SET</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.sets}</span>
 
                                                      </div>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>REP</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.reps}</span>
 
                                                      </div>
 
                                                    </div>
 
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>CARICO / RPE</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.load}</span>
 
                                                      </div>
 
                                                      {(() => {
 
                                                        const secRec = parseRestSeconds(blk.rest);
 
                                                        return (
 
                                                        <div
 
                                                          onClick={() => { preparaAudio(); setTimerConfig(secRec ? { tipo: 'recupero', secondi: secRec } : { tipo: 'recupero', secondi: 90, daImpostare: true }); }}
 
                                                          style={{ background: 'var(--bg-ecfdf5)', padding: '8px', borderRadius: '6px', textAlign: 'center', border: '1px solid var(--bd-6ee7b7)', cursor: 'pointer' }}
 
                                                        >
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>RECUPERO</span>
 
                                                        <span style={{ overflowWrap: 'anywhere', fontWeight: 'bold', fontSize: '13px', color: 'var(--fg-000000)' }}>{blk.rest}</span>
 
                                                        <span style={{ display: 'block', fontSize: '9px', color: 'var(--fg-047857)', fontWeight: 'bold', marginTop: '3px' }}>
 
                                                          {secRec ? '⏱️ AVVIA TIMER' : '⏱️ IMPOSTA TIMER'}
 
                                                        </span>
 
                                                        </div>
 
                                                        ); })()}
 
                                                    </div>
 
 
 
                                                    {(() => {
 
                                                      const hint = computeLoadHint(blk.load, blk.reps, trovaMaxes(athleteMaxes, blk.name));
 
                                                      if (hint) {
 
                                                        return (
 
                                                          <div style={{ background: 'var(--bg-eff6ff)', border: '1px solid var(--bd-bfdbfe)', borderRadius: '8px', padding: '9px 11px', marginTop: '8px' }}>
 
                                                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--fg-1e40af)', marginBottom: '2px' }}>PESO CONSIGLIATO IN BASE AI TUOI RM</span>
 
                                                            <span style={{ display: 'block', fontSize: '15px', fontWeight: 'bold', color: 'var(--fg-1d4ed8)' }}>{hint}</span>
 
                                                          </div>
 
                                                        );
 
                                                      }
 
 
 
                                                      // Nessun massimale per questo esercizio: mostro l'ultimo carico che ha usato
 
                                                      const usati = ultimoCaricoUsato(blk.name, blk.reps);
 
                                                      if (!usati || usati.length === 0) return null;
 
                                                      return (
 
                                                        <div style={{ background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '9px 11px', marginTop: '8px' }}>
 
                                                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--fg-64748b)', marginBottom: '3px' }}>
 
                                                            {usati.length === 1 ? 'L\u2019ULTIMA VOLTA AVEVI USATO' : 'CARICHI CHE HAI GIÀ USATO'}
 
                                                          </span>
 
                                                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '9px', flexWrap: 'wrap' }}>
 
                                                            <span style={{ fontSize: '15px', fontWeight: 'bold', color: String(usati[0].reps ?? '') === String(blk.reps ?? '') ? 'var(--fg-047857)' : 'var(--fg-334155)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                              {usati[0].reps ? `${usati[0].reps} rip. → ` : ''}{mostraCarico(usati[0])}
 
                                                            </span>
 
                                                            {usati.length > 1 && (
 
                                                              <span style={{ fontSize: '11px', color: 'var(--fg-94a3b8)', overflowWrap: 'anywhere', minWidth: 0 }}>
 
                                                                {usati.slice(1).map((u: any) => `${u.reps ? u.reps + ' rip. ' : ''}${mostraCarico(u).replace(' kg', '')}`).join(' · ')}
 
                                                              </span>
 
                                                            )}
 
                                                          </div>
 
                                                        </div>
 
                                                      );
 
                                                    })()}
 
                                                    {blk.notes && (
 
                                                      <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)' }}>
 
                                                        <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>NOTE</span>
 
                                                        <p style={{ overflowWrap: 'anywhere', margin: '2px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)' }}>{blk.notes}</p>
 
                                                      </div>
 
                                                    )}
 
                                                  </div>
 
                                                ) : (
 
                                                  <div style={{ background: 'var(--bg-f8fafc)', padding: '8px', borderRadius: '6px', border: '1px solid var(--bd-e2e8f0)', marginBottom: '8px' }}>
 
                                                    <span style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>WOD / CIRCUITO</span>
 
                                                    <p style={{ overflowWrap: 'anywhere', margin: '2px 0 0 0', fontSize: '12px', color: 'var(--fg-334155)', whiteSpace: 'pre-wrap' }}>{blk.wodNotes}</p>
 
                                                  </div>
 
                                                )}
 
 
 
                                                {blk.type === 'wod' && (blk.items || []).some((it: any) => it.name && it.videoUrl) && (
 
                                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '9px', marginBottom: '2px' }}>
 
                                                    {(blk.items || []).filter((it: any) => it.name && it.videoUrl).map((it: any, i: number) => (
 
                                                      <a
 
                                                        key={i}
 
                                                        href={it.videoUrl}
 
                                                        target="_blank"
 
                                                        rel="noopener noreferrer"
 
                                                        onClick={(e) => e.stopPropagation()}
 
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(160deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 2px 5px rgba(37,99,235,0.3)' }}
 
                                                      >
 
                                                        <Icona nome="video" size={12} /> {it.name}
 
                                                      </a>
 
                                                    ))}
 
                                                  </div>
 
                                                )}
 
 
 
 
 
                                                {blk.type !== 'warmup' && (
 
                                                <div style={{ marginTop: '10px', background: 'var(--bg-f1f5f9)', padding: '10px', borderRadius: '6px', border: '1px solid var(--bd-cbd5e1)' }}>
 
                                                  <span style={{ fontSize: '11px', color: 'var(--fg-10b981)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📝 I TUOI RISULTATI / NOTE:</span>
 
                                                  {usaFinestra && blk.scoreUnit !== 'spunta' && (
 
                                                    <button
 
                                                      onClick={() => setScoreAperto({ progId: prog.id, key: resultKey, blk, lvl: athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel })}
 
                                                      style={{ width: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '9px', padding: '11px', borderRadius: '999px', border: 'none', background: 'linear-gradient(160deg, var(--bg-10b981) 0%, var(--bg-059669) 100%)', color: 'var(--onacc)', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 7px rgba(var(--acc-rgb), 0.32)' }}
 
                                                    >
 
                                                      <Icona nome="modifica" size={14} /> {blk.type === 'forza' && (!blk.scoreUnit || blk.scoreUnit === 'kg') ? 'Inserisci i carichi' : 'Segna il risultato'}
 
                                                    </button>
 
                                                  )}
 
                                                  {usaFinestra ? (
 
                                                    /* Con la finestra dei carichi il riepilogo si legge qui, non si digita */
 
                                                    (() => {
 
                                                      const dato = athleteResults[prog.id]?.[resultKey];
 
                                                      return (
 
                                                        <>
 
                                                        {blk.scoreUnit !== 'spunta' && (
 
                                                        <RiepilogoScore
 
                                                          punteggio={String(dato?.score || '').trim()}
 
note={blk.type === 'superserie' ? '' : String(dato?.notes || '').trim()}
 
                                                        />
 
                                                        )}
 
{blk.type === 'superserie' && blk.scoreUnit !== 'spunta' && (<CampoNote valore={dato?.notes} onSalva={(v: string) => handleResultChange(prog.id, resultKey, 'notes', v)} />)}
 
                                                          {blk.scoreUnit === 'spunta' && (<><SpuntaFatta fatto={!!dato?.done} onChange={(v: string) => handleResultChange(prog.id, resultKey, 'done', v)} /><CampoNote valore={dato?.notes} onSalva={(v: string) => handleResultChange(prog.id, resultKey, 'notes', v)} /></>)}
 
                                                        </>
 
                                                      );
 
                                                    })()
 
 
                                                  ) : (
 
                                                  <div style={{ display: 'grid', gridTemplateColumns: isMobility(blk.name) ? '1fr' : '1fr 2fr', gap: '8px' }}>
 
                                                    {!isMobility(blk.name) && blk.type !== 'warmup' && (
 
                                                    <div>
 
                                                      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>Score / Carico</label>
 
                                                      {(() => {
 
                                                        const bench = BENCHMARK_WODS.find((b: any) => b.name === blk.name);
                                                        const mode = bench ? bench.type
 
                                                          : metconPRNames.includes(blk.name) ? 'time'
 
                                                          : gymPRNames.includes(blk.name) ? 'reps'
 
                                                          : 'text';
 
                                                        const lvl = athleteResults[prog.id]?.[resultKey]?.level || blk.benchLevel || 'rx';
 
                                                        return (
 
                                                          <ScoreInput
 
                                                            mode={mode}
 
                                                            value={athleteResults[prog.id]?.[resultKey]?.score || ''}
 
                                                            onChange={(v: string) => handleResultChange(prog.id, resultKey, 'score', v)}
 
                                                            onCommit={(v: string) => maybeUpdateMaxFromScore(session.user.id, blk.name || '', blk.reps, v, false, blk.type, lvl)}
 
                                                          />
 
                                                        );
 
                                                      })()}
 
                                                    </div>
 
                                                    )}
 
                                                    <div>
 
                                                      <label style={{ fontSize: '10px', color: 'var(--fg-64748b)', display: 'block' }}>Note personali</label>
 
<CampoNote rows={3} margine="0" placeholder="Sensazioni..." valore={athleteResults[prog.id]?.[resultKey]?.notes || ''} onSalva={(v: string) => handleResultChange(prog.id, resultKey, 'notes', v)} />
 
                                                    </div>
 
                                                  </div>
 
                                                  )}
 
                                                </div>
 
                                                )}
 
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
 
 
 
      <div style={{
 
        position: 'fixed',
 
        left: 0,
 
        right: 0,
 
        bottom: 0,
 
        display: 'flex',
 
        background: 'var(--bg-1a1a1d)',
 
        transform: 'translateZ(0)',
 
        WebkitTransform: 'translateZ(0)',
 
        WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden',
 
        borderTop: '1px solid var(--bd-2a2a2e)',
 
        paddingBottom: 'env(safe-area-inset-bottom)',
 
        zIndex: 500
 
      }}>
 
        {(role === 'coach'
 
          ? [
 
              { key: 'programs', icon: '📋', label: 'Programmi' },
 
              { key: 'athletes', icon: '👤', label: 'Profili' },
 
              { key: 'banner', icon: '📢', label: 'Banner' },
 
            ]
 
          : [
 
              { key: 'create', icon: '🏋️', label: 'Allenamenti' },
 
              { key: 'profile', icon: '👤', label: 'Profilo' },
 
            ]
 
        ).map((item) => {
 
          const active = role === 'coach' ? coachSubView === item.key : activeTab === item.key;
 
          return (
 
            <button
 
              key={item.key}
 
              onClick={() => {
 
                if (role === 'coach') {
 
                  setCoachSubView(item.key as any);
 
                  if (item.key === 'programs') setEditingProgram(null);
 
                  if (item.key === 'athletes') setSelectedCoachAthlete(null);
 
                } else {
 
                  setActiveTab(item.key as any);
 
                }
 
              }}
 
              style={{
 
                flex: 1,
 
                background: 'none',
 
                border: 'none',
 
                cursor: 'pointer',
 
                padding: '10px 2px 20px 2px',
 
                display: 'flex',
 
                flexDirection: 'column',
 
                alignItems: 'center',
 
                gap: '3px',
 
                color: active ? 'var(--fg-10b981)' : 'var(--fg-94a3b8)',
 
                borderTop: active ? '2px solid var(--bd-10b981)' : '2px solid transparent'
 
              }}
 
            >
 
              <span style={{ fontSize: '19px', lineHeight: 1 }}>{item.icon}</span>
 
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.label}</span>
 
            </button>
 
          );
 
        })}
 
      </div>
 
    </div>
 
  );
 
}
 
 
// Casella della modifica rapida: si scrive e si salva appena si esce dal campo.
 
function CampoRapido({ etichetta, valore, onSalva, largo }: any) {
 
  const [t, setT] = useState(String(valore ?? ''));
 
  useEffect(() => {
 
    setT(String(valore ?? ''));
 
  }, [valore]);
 
  return (
 
    <label style={{ display: 'block', gridColumn: largo ? '1 / -1' : 'auto', background: 'var(--bg-f8fafc)', border: '1px solid var(--bd-e2e8f0)', borderRadius: '8px', padding: '6px 9px' }}>
 
      <span style={{ display: 'block', fontSize: '10px', color: 'var(--fg-64748b)' }}>{etichetta}</span>
 
      <input
 
        value={t}
 
        onChange={(e: any) => setT(e.target.value)}
 
        onBlur={() => {
 
          if (t !== String(valore ?? '')) onSalva(t);
 
        }}
 
        enterKeyHint="done"
 
        style={{ width: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', background: 'transparent', color: 'var(--fg-000000)', fontSize: '15px', fontWeight: 'bold', padding: '3px 0' }}
 
      />
 
    </label>
 
  );
 
}
 
function GrigliaModificaRapida({ blk, onSalva }: any) {
 
  const campi: string[][] = [['sets', 'SET'], ['reps', 'REP'], ['load', 'CARICO'], ['rest', 'REC.']];
 
  return (
 
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', marginBottom: '10px' }}>
 
      {campi.map(([k, etichetta]) => (
 
        <CampoRapido key={k} etichetta={etichetta} valore={blk[k]} onSalva={(v: string) => onSalva(k, v)} />
 
      ))}
 
      <CampoRapido largo etichetta="NOTE" valore={blk.notes} onSalva={(v: string) => onSalva('notes', v)} />
 
    </div>
 
  );
 
}
 

 
// Pagina: tiene il tema scelto (anche sul dispositivo) e lo passa all'app.
 
export default function Page() {
 
  const [tema, setTema] = useState<string>('scuro');
 
  useEffect(() => {
 
    try {
 
      const t = window.localStorage.getItem('amt_tema');
 
      if (t && TEMI[t]) {
 
        TEMA_ATTIVO = t;
 
        setTema(t);
 
      }
 
    } catch (e) {
 
      // se il dispositivo non permette di salvare, resta il tema predefinito
 
    }
 
  }, []);
 
  const impostaTema = (t: string) => {
 
    if (!TEMI[t]) return;
 
    TEMA_ATTIVO = t;
 
    setTema(t);
 
    try {
 
      window.localStorage.setItem('amt_tema', t);
 
    } catch (e) {
 
      // niente da fare




     







     
    }
 
  };
 
  return (
 
    <>
 
      <StileTema tema={tema} />
 
      <TrainingApp tema={tema} impostaTema={impostaTema} />
 
    </>
 
  );
 
}
 
