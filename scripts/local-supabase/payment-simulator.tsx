import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const Secret = createContext('');
export function EmbeddedCheckoutProvider({ options, children }: {
  options: { fetchClientSecret: () => Promise<string> }; children: ReactNode;
}) {
  const [secret, setSecret] = useState('');
  const fetchClientSecret = options.fetchClientSecret;
  useEffect(() => { let active = true; fetchClientSecret().then(value => {
    if (active) setSecret(value);
  }).catch(() => { /* The real payment page presents the retry state. */ });
  return () => { active = false; }; }, [fetchClientSecret]);
  return <Secret.Provider value={secret}>{children}</Secret.Provider>;
}
export function EmbeddedCheckout() {
  const secret = useContext(Secret);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="space-y-4 p-4">
    <p role="status">SIMULACIÓN LOCAL · No se realiza ningún cargo</p>
    <button disabled={!secret || busy} onClick={async () => {
      setBusy(true);
      try {
        const response = await fetch('/__local_payment/complete', { method: 'POST',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientSecret: secret }) });
        if (!response.ok) throw Error('No se pudo completar la simulación');
        const { returnUrl } = await response.json();
        const target = new URL(returnUrl, location.origin);
        if (target.origin !== location.origin || !target.pathname.startsWith('/pago/')) throw Error('Destino local inválido');
        location.assign(target.href);
      } catch (cause) { setError(String(cause)); setBusy(false); }
    }}>Confirmar pago simulado</button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
