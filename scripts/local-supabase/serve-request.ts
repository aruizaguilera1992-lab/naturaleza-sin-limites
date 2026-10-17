// Native Deno transport for the unchanged function handler; not Edge Runtime.
const local = JSON.parse(await Deno.readTextFile('.tools/local-supabase/status.local.json'));
if (local.API_URL !== 'http://127.0.0.1:54321') throw Error('Local API required');
Deno.env.set('SUPABASE_URL', local.API_URL);
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', local.SERVICE_ROLE_KEY);
for (const key of ['RESEND_API_KEY', 'LOVABLE_API_KEY', 'STRIPE_SECRET_KEY']) Deno.env.delete(key);
Deno.env.set('EMAIL_DELIVERY_MODE', 'disabled');
Deno.env.set('NOTIFICATION_EMAIL', 'owner@example.test');
const serve = Deno.serve;
Deno.serve = ((handler: (req: Request) => Response | Promise<Response>) => {
  Deno.serve = serve;
  return serve({ hostname: '127.0.0.1', port: 54325 }, req => {
    if (new URL(req.url).pathname !== '/submit-request') return new Response('Not found', { status: 404 });
    return handler(req);
  });
}) as typeof Deno.serve;
await import('../../supabase/functions/submit-request/index.ts');
