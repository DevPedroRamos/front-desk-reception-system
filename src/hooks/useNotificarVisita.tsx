import { useCallback } from 'react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: payload,
  });

  if (error) {
    let status = 500;
    let statusText = error.name;
    let body = error.message;

    if (error instanceof FunctionsHttpError) {
      status = error.context.status;
      statusText = error.context.statusText;
      try {
        body = await error.context.text();
      } catch {
        body = error.message;
      }
    }

    console.error('Erro ao enviar notificação:', status, body);
    return { ok: false, status, statusText, body, payload };
  }

  const body = typeof data === 'string' ? data : JSON.stringify(data ?? {});
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    body,
    payload,
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
