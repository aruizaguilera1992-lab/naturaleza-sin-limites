export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

const COOKIE_NAME = 'nsl_cookie_consent';
const MAX_AGE = 180 * 24 * 60 * 60; // 180 days in seconds

export const defaultConsent: ConsentPreferences = {
  necessary: true,
  analytics: false,
  preferences: false,
  marketing: false,
};

export function acceptAllConsent(): ConsentPreferences {
  return { necessary: true, analytics: true, preferences: true, marketing: true };
}

export function rejectOptionalConsent(): ConsentPreferences {
  return { ...defaultConsent };
}

export function getConsentCookie(): ConsentPreferences | null {
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const value = decodeURIComponent(match.split('=')[1]);
    return JSON.parse(value) as ConsentPreferences;
  } catch {
    return null;
  }
}

export function setConsentCookie(prefs: ConsentPreferences): void {
  const value = encodeURIComponent(JSON.stringify(prefs));
  const isSecure = window.location.protocol === 'https:';
  let cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  if (isSecure) cookie += '; Secure';
  document.cookie = cookie;
}

export function clearConsentCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
