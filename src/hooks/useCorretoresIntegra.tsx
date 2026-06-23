import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CorretorIntegra {
  id: string;
  nome: string;
  fullName: string;
  apelido: string | null;
  cpf: string;
  telefone: string | null;
}

export function useCorretoresIntegra() {
  return useQuery({
    queryKey: ['corretores-integra'],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<CorretorIntegra[]> => {
      const { data, error } = await supabase.functions.invoke('get-funcionarios', {
        method: 'GET',
      });
      if (error) {
        console.error('Erro ao buscar corretores Integra:', error);
        throw error;
      }
      return (data?.corretores ?? []) as CorretorIntegra[];
    },
  });
}