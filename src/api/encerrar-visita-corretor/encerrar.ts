import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import {
  EncerrarVisitaError,
  type EncerrarVisitaInput,
  type EncerrarVisitaResponse,
  type OrigemEncerramento,
} from './types';

const VISITA_ENCERRADA_SELECT = [
  'id',
  'status',
  'horario_saida',
  'encerrado_por_corretor',
  'origem_encerramento',
  'corretor_id',
].join(', ');

export async function encerrarVisitaCorretor(
  supabase: SupabaseClient<Database>,
  input: EncerrarVisitaInput,
): Promise<EncerrarVisitaResponse> {
  const { visitId, integraId } = input;

  const { data: visita, error: fetchError } = await supabase
    .from('visits')
    .select(VISITA_ENCERRADA_SELECT)
    .eq('id', visitId)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!visita) {
    throw new EncerrarVisitaError('Visita nao encontrada', 404);
  }

  if (visita.status !== 'ativo') {
    throw new EncerrarVisitaError('Visita ja finalizada', 409);
  }

  if (visita.corretor_id !== integraId) {
    throw new EncerrarVisitaError('Corretor nao autorizado para encerrar esta visita', 403);
  }

  const encerradoEm = new Date().toISOString();
  const origemEncerramento: OrigemEncerramento = {
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
    throw updateError;
  }

  if (!atualizada?.horario_saida) {
    throw new Error('Falha ao encerrar visita');
  }

  return {
    success: true,
    visita: {
      id: atualizada.id,
      status: atualizada.status ?? 'finalizado',
      horario_saida: atualizada.horario_saida,
      encerrado_por_corretor: atualizada.encerrado_por_corretor,
      origem_encerramento: atualizada.origem_encerramento as OrigemEncerramento,
    },
  };
}
