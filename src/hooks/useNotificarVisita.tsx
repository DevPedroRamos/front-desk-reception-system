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

async function sendNotification(payload: Record<string, unknown>): Promise<NotificarVisitaResult | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY não configurados');
    return null;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseKey}`,
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
    console.error('Erro ao enviar notificação:', response.status, body);
  }

  return result;
}

export function useNotificarVisita() {
  const notificarVisita = useCallback(async (dados: NotificarVisitaInput): Promise<NotificarVisitaResult | null> => {
    try {
      const cpfLimpo = (dados.corretor_cpf || '').replace(/\D/g, '');
      if (!cpfLimpo) {
        console.warn('notificarVisita: corretor_cpf vazio; notificação não enviada.');
        return null;
      }

      const payload = buildPayload(dados);
      return await sendNotification(payload);
    } catch (error) {
      console.error('Erro ao notificar visita:', error);
      return null;
    }
  }, []);

  const testarNotificacao = useCallback(async (): Promise<NotificarVisitaResult | null> => {
    try {
      const payload = {
        targetType: 'ALL',
        title: 'Teste de Conexao',
        body: 'Corpo do teste',
        platformType: 'BOTH',
      };

      return await sendNotification(payload);
    } catch (error) {
      console.error('Erro no teste de notificação:', error);
      return null;
    }
  }, []);

  return { notificarVisita, testarNotificacao };
}
