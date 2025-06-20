
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCorretorStats(corretorId: string | null) {
  return useQuery({
    queryKey: ['corretor-stats', corretorId],
    queryFn: async () => {
      if (!corretorId) return null;

      const { data, error } = await supabase.rpc('get_corretor_stats', {
        corretor_uuid: corretorId
      });

      if (error) {
        console.error('Erro ao buscar estatísticas do corretor:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    enabled: !!corretorId
  });
}
