import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Metodo nao permitido' }, 405);
  }

  if (!validateApiKey(req)) {
    return jsonResponse({ error: 'Nao autorizado' }, 401);
  }

  let body: { visitId?: string; integraId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Body JSON invalido' }, 400);
  }

  const visitId = body.visitId?.trim();
  const integraId = body.integraId?.trim();

  if (!visitId || !integraId) {
    return jsonResponse({ error: 'Campos visitId e integraId sao obrigatorios' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes');
    return jsonResponse({ error: 'Configuracao do servidor incompleta' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: visita, error: fetchError } = await supabase
      .from('visits')
      .select('id, status, corretor_id')
      .eq('id', visitId)
      .maybeSingle();

    if (fetchError) {
      console.error('Erro ao buscar visita:', fetchError);
      return jsonResponse({ error: 'Falha ao encerrar visita', detail: fetchError.message }, 500);
    }

    if (!visita) {
      return jsonResponse({ error: 'Visita nao encontrada' }, 404);
    }

    if (visita.status !== 'ativo') {
      return jsonResponse({ error: 'Visita ja finalizada' }, 409);
    }

    if (visita.corretor_id !== integraId) {
      return jsonResponse({ error: 'Corretor nao autorizado para encerrar esta visita' }, 403);
    }

    const encerradoEm = new Date().toISOString();
    const origemEncerramento = {
      tipo: 'corretor',
      integra_id: integraId,
      encerrado_em: encerradoEm,
    };

    const { data: atualizada, error: updateError } = await supabase
      .from('visits')
      .update({
        status: 'finalizado',
        horario_saida: encerradoEm,
        encerrado_por_corretor: true,
        origem_encerramento: origemEncerramento,
      })
      .eq('id', visitId)
      .eq('status', 'ativo')
      .select('id, status, horario_saida, encerrado_por_corretor, origem_encerramento')
      .single();

    if (updateError) {
      console.error('Erro ao encerrar visita:', updateError);
      return jsonResponse({ error: 'Falha ao encerrar visita', detail: updateError.message }, 500);
    }

    return jsonResponse({
      success: true,
      visita: atualizada,
    });
  } catch (err) {
    console.error('Erro inesperado em encerrar-visita-corretor:', err);
    return jsonResponse({ error: 'Erro inesperado', detail: String(err) }, 500);
  }
});
