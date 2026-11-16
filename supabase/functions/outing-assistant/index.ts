import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { Output, jsonSchema } from 'npm:ai@6';
import { createResponsesCall } from './responses.ts';
import { ASSISTANT_INSTRUCTIONS, DRAFT_FIELDS } from './policy.ts';

const json = (body: unknown, status: number) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_ANON_KEY');
  const aiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!url || !key || !aiKey) return json({ error: 'La conexión de IA no está configurada.' }, 401);
  const auth = req.headers.get('Authorization') ?? '';
  const db = createClient(url, key, { global: { headers: { Authorization: auth } } });
  const { data: user, error } = await db.auth.getUser(auth.replace(/^Bearer\s+/i, ''));
  if (error || !user.user) return json({ error: 'Inicia sesión para utilizar el asistente.' }, 401);
  const { data: admin } = await db.rpc('has_role', { _user_id: user.user.id, _role: 'admin' });
  if (!admin) return json({ error: 'Solo administración puede utilizar este asistente.' }, 403);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Solicitud no válida.' }, 400); }
  if (!body || typeof body.instructions !== 'string' || body.instructions.length > 2000 || !body.context || typeof body.context !== 'object' || Array.isArray(body.context) || JSON.stringify(body.context).length > 16000) return json({ error: 'Revisa los datos y la petición (máximo 2000 caracteres).' }, 400);
  const { result, gateway } = createResponsesCall(req, { baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey: aiKey, model: 'openai/gpt-6-astra' }, [{ role: 'user', content: JSON.stringify({ datos: body.context, peticion: body.instructions }) }], ASSISTANT_INSTRUCTIONS, Output.object({ schema: jsonSchema({ type: 'object', properties: { ...Object.fromEntries(DRAFT_FIELDS.map(k => [k, { type: ['string', 'null'] }])), missing: { type: 'array', items: { type: 'string' } } }, required: [...DRAFT_FIELDS, 'missing'], additionalProperties: false }) }));
  const iterator = result.fullStream[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  const safeError = (e: unknown) => {
    const ex = e as { statusCode?: number; responseBody?: string; message?: string };
    let message = ex.message ?? 'No se pudo generar una propuesta. Tus datos se conservan.';
    try { const data = JSON.parse(ex.responseBody ?? ''); message = data.message ?? data.error?.message ?? message; } catch { /* no response body */ }
    return { error: message.slice(0, 800), status: ex.statusCode ?? 500 };
  };
  try {
    // Wait only for the first upstream event, not for the full generation.
    const first = await iterator.next();
    if (!first.done && first.value.type === 'error') { const e = safeError(first.value.error); return json({ error: e.error }, e.status); }
    const runId = await gateway.waitForRunId();
    const stream = new ReadableStream({
      async start(controller) {
        const emit = (v: unknown) => controller.enqueue(encoder.encode(JSON.stringify(v) + '\n'));
        try {
          let chunk = first;
          while (!chunk.done) {
            const part = chunk.value;
            if (part.type === 'text-delta') emit({ delta: part.text });
            if (part.type === 'error') { emit(safeError(part.error)); controller.close(); return; }
            chunk = await iterator.next();
          }
          const output = await result.output;
          if (!output) emit({ error: 'La IA no devolvió una propuesta válida.' });
          else emit({ done: output });
          controller.close();
        } catch (e) { emit(safeError(e)); controller.close(); }
      },
      async cancel() { await iterator.return?.(); },
    });
    return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'application/x-ndjson', ...(runId ? { 'X-Lovable-AIG-Run-ID': runId, 'Access-Control-Expose-Headers': 'X-Lovable-AIG-Run-ID' } : {}) } });
  } catch (e) { if (req.signal.aborted) return json({ error: 'Generación detenida.' }, 499); const x = safeError(e); return json({ error: x.error }, x.status); }
});