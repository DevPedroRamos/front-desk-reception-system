import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agendamento {
  id: string;
  token: string;
  corretor_id: string;
  corretor_nome: string;
  corretor_cpf: string;
  corretor_apelido?: string;
  cliente_nome?: string;
  cliente_cpf?: string;
  cliente_telefone?: string;
  data_visita?: string;
  status: 'pendente' | 'confirmado' | 'check_in' | 'finalizado' | 'cancelado';
  created_at: string;
  confirmed_at?: string;
  checked_in_at?: string;
  expires_at: string;
  mesa?: number;
  loja?: string;
  andar?: string;
  empreendimento?: string;
}

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgendamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          users!agendamentos_corretor_id_fkey(apelido)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const agendamentosComApelido = (data || []).map((agendamento: any) => ({
        ...agendamento,
        corretor_apelido: agendamento.users?.apelido || agendamento.corretor_nome
      }));
      
      setAgendamentos(agendamentosComApelido as Agendamento[]);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  return {
    agendamentos,
    loading,
    refetch: fetchAgendamentos,
  };
}
