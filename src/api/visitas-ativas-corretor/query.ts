import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import {
  VISITAS_ATIVAS_DEFAULT_LIMIT,
  VISITAS_ATIVAS_MAX_LIMIT,
  VISITA_ATIVA_SELECT,
  type VisitasAtivasCorretorResponse,
  type VisitasAtivasQueryParams,
  type VisitaAtiva,
} from './types';

type VisitsRow = Database['public']['Tables']['visits']['Row'];

function normalizeLimit(limit?: number): number {
  if (limit === undefined || Number.isNaN(limit)) return VISITAS_ATIVAS_DEFAULT_LIMIT;
  return Math.min(Math.max(1, limit), VISITAS_ATIVAS_MAX_LIMIT);
}

function normalizeOffset(offset?: number): number {
  if (offset === undefined || Number.isNaN(offset)) return 0;
  return Math.max(0, offset);
}

export function parseVisitasAtivasQueryParams(
  searchParams: URLSearchParams,
): VisitasAtivasQueryParams {
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  return {
    limit: limit !== null ? Number(limit) : undefined,
    offset: offset !== null ? Number(offset) : undefined,
  };
}

export async function getVisitasAtivasCorretor(
  supabase: SupabaseClient<Database>,
  integraId: string,
  params: VisitasAtivasQueryParams = {},
): Promise<VisitasAtivasCorretorResponse> {
  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);

  const { count, error: countError } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('corretor_id', integraId)
    .eq('status', 'ativo');

  if (countError) {
    throw countError;
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
    throw error;
  }

  const rows = (data ?? []) as Pick<
    VisitsRow,
    | 'id'
    | 'cliente_nome'
    | 'cliente_cpf'
    | 'cliente_whatsapp'
    | 'loja'
    | 'andar'
    | 'mesa'
    | 'empreendimento'
    | 'horario_entrada'
    | 'created_at'
    | 'corretor_nome'
  >[];

  const visitas: VisitaAtiva[] = rows.map(({ corretor_nome: _, ...visita }) => visita);
  const corretor_nome = rows[0]?.corretor_nome ?? null;

  return {
    integra_id: integraId,
    corretor_nome,
    total: count ?? 0,
    visitas,
  };
}
