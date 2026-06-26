import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const VISITA_ATIVA_SELECT = [
  'id',
  'cliente_nome',
  'cliente_cpf',
  'cliente_whatsapp',
  'loja',
  'andar',
  'mesa',
  'empreendimento',
  'horario_entrada',
  'created_at',
  'corretor_nome',
].join(', ');

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeLimit(raw: string | null): number {
  if (raw === null) return DEFAULT_LIMIT;
  const n = Number(raw);
  if (Number.isNaN(n)) return DEFAULT_LIMIT;
  return Math.min(Math.max(1, n), MAX_LIMIT);
}

function normalizeOffset(raw: string | null): number {
  if (raw === null) return 0;
  const n = Number(raw);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, n);
}

function validateApiKey(req: Request): boolean {
  const expected = Deno.env.get('FRONT_DESK_API_KEY')?.trim();
  if (!expected) return false;
  const provided = req.headers.get('x-api-key')?.trim();
  return provided === expected;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Metodo nao permitido' }, 405);
  }

  if (!validateApiKey(req)) {
    return jsonResponse({ error: 'Nao autorizado' }, 401);
  }

  const url = new URL(req.url);
  const integraId = url.searchParams.get('integraId')?.trim();

  if (!integraId) {
    return jsonResponse({ error: 'Parametro integraId e obrigatorio' }, 400);
  }

  const limit = normalizeLimit(url.searchParams.get('limit'));
  const offset = normalizeOffset(url.searchParams.get('offset'));

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes');
    return jsonResponse({ error: 'Configuracao do servidor incompleta' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { count, error: countError } = await supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .eq('corretor_id', integraId)
      .eq('status', 'ativo');

    if (countError) {
      console.error('Erro ao contar visitas ativas:', countError);
      return jsonResponse({ error: 'Falha ao consultar visitas ativas', detail: countError.message }, 500);
    }

    const { data, error } = await supabase
      .from('visits')
      .select(VISITA_ATIVA_SELECT)
      .eq('corretor_id', integraId)
      .eq('status', 'ativo')
      .order('horario_entrada', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro ao buscar visitas ativas:', error);
      return jsonResponse({ error: 'Falha ao consultar visitas ativas', detail: error.message }, 500);
    }

    const rows = data ?? [];
    const corretor_nome = rows[0]?.corretor_nome ?? null;
    const visitas = rows.map(({ corretor_nome: _, ...visita }) => visita);

    return jsonResponse({
      integra_id: integraId,
      corretor_nome,
      total: count ?? 0,
      visitas,
    });
  } catch (err) {
    console.error('Erro inesperado em get-corretor-visitas-ativas:', err);
    return jsonResponse({ error: 'Erro inesperado', detail: String(err) }, 500);
  }
});
