export interface VisitaHistorico {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  loja: string;
  andar: string;
  mesa: number;
  empreendimento: string | null;
  horario_entrada: string | null;
  horario_saida: string | null;
  created_at: string | null;
}

export interface HistoricoCorretorQueryParams {
  limit?: number;
  offset?: number;
}

export interface HistoricoCorretorResponse {
  integra_id: string;
  corretor_nome: string | null;
  total: number;
  visitas: VisitaHistorico[];
}

export const HISTORICO_DEFAULT_LIMIT = 50;
export const HISTORICO_MAX_LIMIT = 200;

export const VISITA_HISTORICO_SELECT = [
  'id',
  'cliente_nome',
  'cliente_cpf',
  'loja',
  'andar',
  'mesa',
  'empreendimento',
  'horario_entrada',
  'horario_saida',
  'created_at',
  'corretor_nome',
].join(', ');
