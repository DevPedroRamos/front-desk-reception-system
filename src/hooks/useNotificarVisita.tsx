import { useCallback } from 'react';

export interface NotificarVisitaInput {
  corretor_nome: string;
  cliente_nome: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
}

export interface NotificarVisitaResult {
  ok: boolean;
  status: number;
  statusText: string;
  body: string;
  payload: Record<string, unknown>;
}

const API_URL = 'https://api.metrocasamais.app/api/notifications/send';

// TODO: substituir pelo CPF do corretor selecionado após testes
const CPF_DESTINATARIO_TESTE = '45566920837';

function buildPayload(dados: NotificarVisitaInput) {
  return {
    title: 'Nova visita registrada',
    body: `${dados.cliente_nome} - ${dados.loja}, Mesa ${dados.mesa}`,
    platformType: 'MOBILE',
    targetType: 'USERS',
    targetIds: [CPF_DESTINATARIO_TESTE],
    data: {
      cpf: CPF_DESTINATARIO_TESTE,
      corretor_nome: dados.corretor_nome,
      cliente_nome: dados.cliente_nome,
      loja: dados.loja,
      andar: dados.andar,
      mesa: dados.mesa,
      horario_entrada: dados.horario_entrada,
    },
  };
}

export function useNotificarVisita() {
  const notificarVisita = useCallback(async (dados: NotificarVisitaInput): Promise<NotificarVisitaResult | null> => {
    try {
      const authToken = import.meta.env.VITE_METROCASA_API_TOKEN;

      if (!authToken) {
        console.error('VITE_METROCASA_API_TOKEN não configurado');
        return null;
      }

      const payload = buildPayload(dados);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await response.text();
      const result: NotificarVisitaResult = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body,
        payload,
      };

      if (!response.ok) {
        console.error('Erro ao notificar visita:', response.status, body);
      }

      return result;
    } catch (error) {
      console.error('Erro ao notificar visita:', error);
      return null;
    }
  }, []);

  return { notificarVisita };
}
