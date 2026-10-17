import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

// No project env files or provider plugin. Read only the local PUBLIC key.
const statusFile = fileURLToPath(new URL('./.tools/local-supabase/status.local.json', import.meta.url));
let publicKey = 'local-ui-preview-placeholder';
if (existsSync(statusFile)) {
  const local = JSON.parse(readFileSync(statusFile, 'utf8').replace(/^\uFEFF/, ''));
  if (local.API_URL !== 'http://127.0.0.1:54321' ||
      typeof local.PUBLISHABLE_KEY !== 'string' ||
      !local.PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
    throw new Error('Expected local API and publishable key; refusing isolated startup');
  }
  publicKey = local.PUBLISHABLE_KEY;
}
const policy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' ws://127.0.0.1:8081 http://127.0.0.1:54321 ws://127.0.0.1:54321",
  "frame-src 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "base-uri 'self'",
].join('; ');

export default defineConfig({
  envDir: false,
  envPrefix: 'NSL_ISOLATED_UNUSED_',
  plugins: [react(), {
    name: 'local-fixture-login',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url === '/__local_recovery') {
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.setHeader('Content-Security-Policy', policy);
          return response.end(readFileSync(fileURLToPath(new URL('./scripts/local-supabase/recovery.html', import.meta.url)), 'utf8'));
        }
        if (request.url !== '/__local_login') return next();
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.setHeader('Content-Security-Policy', policy.replace("form-action 'none'", "form-action 'self'"));
        const html = readFileSync(fileURLToPath(new URL('./scripts/local-supabase/login.html', import.meta.url)), 'utf8');
        response.end(html.replace('__LOCAL_PUBLIC_KEY__', publicKey));
      });
    },
  }],
  // Local database binaries/clusters and generated previews are not app inputs.
  optimizeDeps: { entries: ['index.html'] },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://127.0.0.1:8082/local-supabase'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(publicKey),
    'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify('nsl-local-ui'),
    'import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN': JSON.stringify(''),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: '127.0.0.1',
    port: 8081,
    strictPort: true,
    preTransformRequests: false,
    watch: { ignored: ['**/.tools/**'] },
    headers: { 'Content-Security-Policy': policy },
  },
  build: { outDir: '.tools/local-ui-dist' },
  preview: {
    host: '127.0.0.1', port: 8082, strictPort: true,
    headers: { 'Content-Security-Policy': policy },
    proxy: {
      '/local-supabase': {
        target: 'http://127.0.0.1:54321',
        rewrite: (url) => url.replace(/^\/local-supabase/, ''),
      },
    },
  },
});
