import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const NOTIFICATIONS_URL = 'https://api.metrocasamais.app/api/notifications/send';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('METROCASA_API_KEY')?.trim();
    if (!apiKey) {
      console.error('METROCASA_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'METROCASA_API_KEY ausente no ambiente da edge function' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const payload = await req.json();

    const res = await fetch(NOTIFICATIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const body = await res.text();

    return new Response(body, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        ...corsHeaders,
        'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
      },
    });
  } catch (err) {
    console.error('Erro inesperado em send-notification:', err);
    return new Response(
      JSON.stringify({ error: 'Erro inesperado', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
