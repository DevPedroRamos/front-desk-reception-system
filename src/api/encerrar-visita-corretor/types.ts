export type OrigemEncerramento =
  | { tipo: 'corretor'; integra_id: string; encerrado_em: string }
  | { tipo: 'recepcao'; role: string; nome: string; encerrado_em: string };

export interface EncerrarVisitaInput {
  visitId: string;
  integraId: string;
}

export interface EncerrarVisitaResponse {
  success: true;
  visita: {
    id: string;
    status: string;
    horario_saida: string;
    encerrado_por_corretor: boolean;
    origem_encerramento: OrigemEncerramento;
  };
}

export class EncerrarVisitaError extends Error {
  constructor(
    message: string,
    public statusCode: 403 | 404 | 409,
  ) {
    super(message);
    this.name = 'EncerrarVisitaError';
  }
}
