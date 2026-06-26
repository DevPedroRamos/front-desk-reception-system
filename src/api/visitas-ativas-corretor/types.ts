export interface VisitaAtiva {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp: string | null;
  loja: string;
  andar: string;
  mesa: number;
  empreendimento: string | null;
  horario_entrada: string | null;
  created_at: string | null;
}

export interface VisitasAtivasQueryParams {
  limit?: number;
  offset?: number;
}

export interface VisitasAtivasCorretorResponse {
  integra_id: string;
  corretor_nome: string | null;
  total: number;
  visitas: VisitaAtiva[];
}

export const VISITAS_ATIVAS_DEFAULT_LIMIT = 50;
export const VISITAS_ATIVAS_MAX_LIMIT = 200;

export const VISITA_ATIVA_SELECT = [
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
