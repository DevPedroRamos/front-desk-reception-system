
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface CorretorStats {
  total_visitas: number;
  visitas_ativas: number;
  visitas_hoje: number;
  tempo_medio_minutos: number | null;
  agendamentos_confirmados: number;
}

export function useCorretorStats() {
  const { userProfile } = useUserRole();

  return useQuery({
    queryKey: ['corretor-stats', userProfile?.cpf],
    queryFn: async (): Promise<CorretorStats> => {
      if (!userProfile?.cpf) {
        console.log('CPF do corretor não encontrado');
        return {
          total_visitas: 0,
          visitas_ativas: 0,
          visitas_hoje: 0,
          tempo_medio_minutos: null,
          agendamentos_confirmados: 0
        };
      }

      console.log('Buscando stats para corretor CPF:', userProfile.cpf);

      try {
        // Buscar o ID do usuário na tabela users usando o CPF do perfil
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('cpf', userProfile.cpf)
          .single();

        if (userError || !userData) {
          console.error('Erro ao buscar usuário:', userError);
          return {
            total_visitas: 0,
            visitas_ativas: 0,
            visitas_hoje: 0,
            tempo_medio_minutos: null,
            agendamentos_confirmados: 0
          };
        }

        const userId = userData.id;
        console.log('ID do usuário encontrado:', userId);

        // Buscar dados das visitas usando o ID do usuário
        const hoje = new Date().toISOString().split('T')[0];

        // Total de visitas
        const { data: totalVisitas, error: totalError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('corretor_id', userId);

        if (totalError) {
          console.error('Erro ao buscar total de visitas:', totalError);
        }

        // Visitas ativas
        const { data: visitasAtivas, error: ativasError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('corretor_id', userId)
          .eq('status', 'ativo');

        if (ativasError) {
          console.error('Erro ao buscar visitas ativas:', ativasError);
        }

        // Visitas hoje
        const { data: visitasHoje, error: hojeError } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('corretor_id', userId)
          .gte('horario_entrada', `${hoje}T00:00:00`)
          .lt('horario_entrada', `${hoje}T23:59:59`);

        if (hojeError) {
          console.error('Erro ao buscar visitas hoje:', hojeError);
        }

        // Tempo médio (somente visitas finalizadas)
        const { data: visitasFinalizadas, error: tempoError } = await supabase
          .from('visits')
          .select('horario_entrada, horario_saida')
          .eq('corretor_id', userId)
          .eq('status', 'finalizado')
          .not('horario_saida', 'is', null);

        if (tempoError) {
          console.error('Erro ao buscar tempo médio:', tempoError);
        }

        let tempoMedio = null;
        if (visitasFinalizadas && visitasFinalizadas.length > 0) {
          const tempos = visitasFinalizadas.map(v => {
            const entrada = new Date(v.horario_entrada);
            const saida = new Date(v.horario_saida);
            return (saida.getTime() - entrada.getTime()) / (1000 * 60); // em minutos
          });
          tempoMedio = tempos.reduce((a, b) => a + b, 0) / tempos.length;
        }

        // Agendamentos confirmados
        const { data: agendamentos, error: agendError } = await supabase
          .from('agendamentos')
          .select('*', { count: 'exact', head: true })
          .eq('corretor_id', userId)
          .eq('status', 'confirmado');

        if (agendError) {
          console.error('Erro ao buscar agendamentos:', agendError);
        }

        const stats = {
          total_visitas: totalVisitas?.length || 0,
          visitas_ativas: visitasAtivas?.length || 0,
          visitas_hoje: visitasHoje?.length || 0,
          tempo_medio_minutos: tempoMedio,
          agendamentos_confirmados: agendamentos?.length || 0
        };

        console.log('Stats do corretor calculadas:', stats);
        return stats;

      } catch (error) {
        console.error('Erro ao calcular stats:', error);
        return {
          total_visitas: 0,
          visitas_ativas: 0,
          visitas_hoje: 0,
          tempo_medio_minutos: null,
          agendamentos_confirmados: 0
        };
      }
    },
    enabled: !!userProfile?.cpf
  });
}
