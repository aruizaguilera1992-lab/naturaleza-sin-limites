import { useEffect, useRef } from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';

// TODO: Reemplaza este ID con tu ID real de Google Analytics
const GA_ID = 'G-XXXXXXX';

export function AnalyticsLoader() {
  const { consent } = useCookieConsent();
  const loaded = useRef(false);

  useEffect(() => {
    if (!consent.analytics || loaded.current) return;
    if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
      loaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_ID}', { anonymize_ip: true });
    `;
    document.head.appendChild(inline);

    loaded.current = true;

    // TODO: Añadir aquí otros servicios opcionales condicionados por consentimiento
    // Ejemplo: Meta Pixel (consent.marketing), Hotjar (consent.analytics), etc.
  }, [consent.analytics]);

  return null;
}
