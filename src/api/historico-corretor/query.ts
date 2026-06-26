import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import {
  HISTORICO_DEFAULT_LIMIT,
  HISTORICO_MAX_LIMIT,
  VISITA_HISTORICO_SELECT,
  type HistoricoCorretorQueryParams,
  type HistoricoCorretorResponse,
  type VisitaHistorico,
} from './types';

type VisitsRow = Database['public']['Tables']['visits']['Row'];

function normalizeLimit(limit?: number): number {
  if (limit === undefined || Number.isNaN(limit)) return HISTORICO_DEFAULT_LIMIT;
  return Math.min(Math.max(1, limit), HISTORICO_MAX_LIMIT);
}

function normalizeOffset(offset?: number): number {
  if (offset === undefined || Number.isNaN(offset)) return 0;
  return Math.max(0, offset);
}

export function parseHistoricoQueryParams(
  searchParams: URLSearchParams,
): HistoricoCorretorQueryParams {
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  return {
    limit: limit !== null ? Number(limit) : undefined,
    offset: offset !== null ? Number(offset) : undefined,
  };
}

export async function getHistoricoCorretor(
  supabase: SupabaseClient<Database>,
  integraId: string,
  params: HistoricoCorretorQueryParams = {},
): Promise<HistoricoCorretorResponse> {
  const limit = normalizeLimit(params.limit);
  const offset = normalizeOffset(params.offset);

  const { count, error: countError } = await supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('corretor_id', integraId)
    .eq('status', 'finalizado');

  if (countError) {
    throw countError;
  }

  const { data, error } = await supabase
    .from('visits')
    .select(VISITA_HISTORICO_SELECT)
    .eq('corretor_id', integraId)
    .eq('status', 'finalizado')
    .order('horario_saida', { ascending: false, nullsFirst: false })
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
    | 'loja'
    | 'andar'
    | 'mesa'
    | 'empreendimento'
    | 'horario_entrada'
    | 'horario_saida'
    | 'created_at'
    | 'corretor_nome'
  >[];

  const visitas: VisitaHistorico[] = rows.map(({ corretor_nome: _, ...visita }) => visita);
  const corretor_nome = rows[0]?.corretor_nome ?? null;

  return {
    integra_id: integraId,
    corretor_nome,
    total: count ?? 0,
    visitas,
  };
}
