import { defineConfig, mergeConfig } from 'vite';
import isolated from './vite.isolated.config';
import { fileURLToPath } from 'node:url';

// Explicit local-only build: these aliases are never loaded by vite.config.ts.
const config = mergeConfig(isolated, {
  resolve: { alias: [
    { find: '@stripe/react-stripe-js', replacement: fileURLToPath(new URL('./scripts/local-supabase/payment-simulator.tsx', import.meta.url)) },
    { find: '@/lib/stripe', replacement: fileURLToPath(new URL('./scripts/local-supabase/stripe-simulator.ts', import.meta.url)) },
  ] },
  preview: { proxy: {
    '/local-supabase/functions/v1/get-payment': { target: 'http://127.0.0.1:54327', rewrite: () => '/get-payment' },
    '/__local_payment': { target: 'http://127.0.0.1:54327', rewrite: (url: string) => url.replace('/__local_payment', '') },
  } },
});
// Vite uses the first matching proxy entry, so specific routes come first.
config.preview!.proxy = {
  '/local-supabase/functions/v1/get-payment': { target: 'http://127.0.0.1:54327', rewrite: () => '/get-payment' },
  '/__local_payment': { target: 'http://127.0.0.1:54327', rewrite: (url: string) => url.replace('/__local_payment', '') },
  '/local-supabase': isolated.preview!.proxy!['/local-supabase'],
};
export default defineConfig(config);
