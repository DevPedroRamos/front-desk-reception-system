import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const INTEGRA_URL = 'https://integra.metrocasa.com.br/api/funcionarios';
const VENDAS_DEPT_ID = '073f19fd-76cf-434f-992c-72b770cdad15';

interface IntegraDept { id: string; name: string }
interface IntegraEmployee {
  id: string;
  fullName: string;
  nickname: string | null;
  cpf: string;
  phone: string | null;
  status: string;
  department: IntegraDept | null;
  departments: IntegraDept[] | null;
  role: IntegraDept | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const upstream = await fetch(INTEGRA_URL, {
      method: 'GET',
      headers: { accept: '*/*' },
    });

    if (!upstream.ok) {
      const body = await upstream.text();
      console.error('Integra API erro:', upstream.status, body);
      return new Response(
        JSON.stringify({ error: 'Falha ao consultar Integra', status: upstream.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const payload = await upstream.json() as { employees?: IntegraEmployee[] };
    const employees = Array.isArray(payload.employees) ? payload.employees : [];

    const corretores = employees
      .filter((e) => e.status === 'ACTIVE')
      .filter((e) => {
        if (e.department?.id === VENDAS_DEPT_ID) return true;
        if (Array.isArray(e.departments) && e.departments.some((d) => d?.id === VENDAS_DEPT_ID)) return true;
        return false;
      })
      .map((e) => ({
        id: e.id,
        fullName: e.fullName,
        apelido: e.nickname ?? null,
        nome: (e.nickname && e.nickname.trim()) || e.fullName,
        cpf: (e.cpf || '').replace(/\D/g, ''),
        telefone: e.phone ?? null,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return new Response(
      JSON.stringify({ corretores }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      },
    );
  } catch (err) {
    console.error('Erro inesperado em get-funcionarios:', err);
    return new Response(
      JSON.stringify({ error: 'Erro inesperado', detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});