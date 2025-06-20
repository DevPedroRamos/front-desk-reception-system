
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CorretorStats {
  total_visitas: number;
  visitas_ativas: number;
  visitas_hoje: number;
  tempo_medio_minutos: number | null;
  agendamentos_confirmados: number;
}

export function useCorretorStats(corretorId: string | null) {
  return useQuery({
    queryKey: ['corretor-stats', corretorId],
    queryFn: async (): Promise<CorretorStats> => {
      if (!corretorId) {
        console.log('Corretor ID não fornecido para stats');
        return {
          total_visitas: 0,
          visitas_ativas: 0,
          visitas_hoje: 0,
          tempo_medio_minutos: null,
          agendamentos_confirmados: 0
        };
      }

      console.log('Buscando stats para corretor:', corretorId);

      const { data, error } = await supabase.rpc('get_corretor_stats', {
        corretor_uuid: corretorId
      });

      if (error) {
        console.error('Erro ao buscar stats do corretor:', error);
        throw error;
      }

      const stats = data?.[0] || {
        total_visitas: 0,
        visitas_ativas: 0,
        visitas_hoje: 0,
        tempo_medio_minutos: null,
        agendamentos_confirmados: 0
      };

      console.log('Stats do corretor:', stats);
      return stats;
    },
    enabled: !!corretorId
  });
}
