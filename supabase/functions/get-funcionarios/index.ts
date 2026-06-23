import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const INTEGRA_URL = 'https://integra.metrocasa.com.br/api/funcionarios';
const VENDAS_DEPT_ID = '073f19fd-76cf-434f-992c-72b770cdad15';
const PAGE_LIMIT = 200;
const MAX_PAGES = 100;

interface IntegraDept { id: string; name: string }
interface IntegraPagination { page: number; limit: number; total: number; totalPages: number }
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
    const integraApiKey = Deno.env.get('INTEGRA_API_KEY');
    if (!integraApiKey) {
      console.error('INTEGRA_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'INTEGRA_API_KEY ausente no ambiente da edge function' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const fetchPage = async (page: number) => {
      const url = `${INTEGRA_URL}?page=${page}&limit=${PAGE_LIMIT}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          accept: '*/*',
          'x-integra-api-key': integraApiKey,
        },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Integra page ${page} erro ${res.status}: ${body}`);
      }
      return await res.json() as {
        employees?: IntegraEmployee[];
        pagination?: IntegraPagination;
      };
    };

    const employees: IntegraEmployee[] = [];
    let page = 1;
    let totalPages = 1;
    try {
      const first = await fetchPage(page);
      if (Array.isArray(first.employees)) employees.push(...first.employees);
      totalPages = first.pagination?.totalPages ?? 1;
      while (page < totalPages && page < MAX_PAGES) {
        page += 1;
        const next = await fetchPage(page);
        if (Array.isArray(next.employees)) employees.push(...next.employees);
      }
    } catch (err) {
      console.error(String(err));
      return new Response(
        JSON.stringify({ error: 'Falha ao consultar Integra', detail: String(err) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    console.log(`Integra paginação: ${employees.length} funcionários em ${page}/${totalPages} páginas`);

    const deptCount: Record<string, { id: string; count: number }> = {};
    for (const e of employees) {
      if (e.status !== 'ACTIVE') continue;
      const depts = [
        ...(e.department ? [e.department] : []),
        ...(Array.isArray(e.departments) ? e.departments : []),
      ];
      for (const d of depts) {
        if (!d?.name) continue;
        const key = d.name;
        if (!deptCount[key]) deptCount[key] = { id: d.id, count: 0 };
        deptCount[key].count += 1;
      }
    }
    console.log('Integra depts ACTIVE:', deptCount);

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
          'Cache-Control': 'public, max-age=300',
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