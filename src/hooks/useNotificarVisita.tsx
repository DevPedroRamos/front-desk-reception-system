import { useCallback } from 'react';

export interface NotificarVisitaInput {
  corretor_nome: string;
  corretor_cpf: string;
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

function buildPayload(dados: NotificarVisitaInput) {
  const cpf = (dados.corretor_cpf || '').replace(/\D/g, '');
  return {
    title: 'Nova visita registrada',
    body: `${dados.cliente_nome} - ${dados.loja}, Mesa ${dados.mesa}`,
    platformType: 'MOBILE',
    targetType: 'USERS',
    targetIds: [cpf],
    data: {
      cpf,
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
      const cpfLimpo = (dados.corretor_cpf || '').replace(/\D/g, '');
      if (!cpfLimpo) {
        console.warn('notificarVisita: corretor_cpf vazio; notificação não enviada.');
        return null;
      }

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
          Authorization: authToken,
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

  const testarNotificacao = useCallback(async (): Promise<NotificarVisitaResult | null> => {
    try {
      const authToken = import.meta.env.VITE_METROCASA_API_TOKEN;
      if (!authToken) {
        console.error('VITE_METROCASA_API_TOKEN não configurado');
        return null;
      }

      const payload = {
        userIds: [] as string[],
        title: 'Teste de Conexao',
        body: 'Corpo do teste',
        platformType: ['WEB'],
        type: 'SYSTEM',
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authToken,
        },
        body: JSON.stringify(payload),
      });

      const body = await response.text();
      const result: NotificarVisitaResult = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        body,
        payload: payload as unknown as Record<string, unknown>,
      };

      if (!response.ok) {
        console.error('Erro no teste de notificação:', response.status, body);
      }

      return result;
    } catch (error) {
      console.error('Erro no teste de notificação:', error);
      return null;
    }
  }, []);

  return { notificarVisita, testarNotificacao };
}
