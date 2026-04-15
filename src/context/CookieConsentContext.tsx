import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ConsentPreferences,
  defaultConsent,
  acceptAllConsent,
  rejectOptionalConsent,
  getConsentCookie,
  setConsentCookie,
} from '@/lib/cookieConsent';

interface CookieConsentContextType {
  consent: ConsentPreferences;
  hasChoice: boolean;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (prefs: ConsentPreferences) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentPreferences>(defaultConsent);
  const [hasChoice, setHasChoice] = useState(true); // default true to avoid flash
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    const saved = getConsentCookie();
    if (saved) {
      setConsent(saved);
      setHasChoice(true);
    } else {
      setHasChoice(false);
    }
  }, []);

  const persist = useCallback((prefs: ConsentPreferences) => {
    setConsent(prefs);
    setConsentCookie(prefs);
    setHasChoice(true);
  }, []);

  const acceptAll = useCallback(() => {
    persist(acceptAllConsent());
    setIsPreferencesOpen(false);
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist(rejectOptionalConsent());
    setIsPreferencesOpen(false);
  }, [persist]);

  const savePreferences = useCallback(
    (prefs: ConsentPreferences) => {
      persist(prefs);
      setIsPreferencesOpen(false);
    },
    [persist],
  );

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasChoice,
        isPreferencesOpen,
        openPreferences: () => setIsPreferencesOpen(true),
        closePreferences: () => setIsPreferencesOpen(false),
        acceptAll,
        rejectAll,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider');
  return ctx;
}
