import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface PersonaFilters {
  nome?: string;
  superintendencia?: string;
  gerente?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

export interface PersonaAdminData {
  id: string;
  cpf: string;
  nome: string;
  email?: string;
  superintendencia?: string;
  gerencia?: string;
  created_at: string;
  respostas: Record<string, any>;
}

export const usePersonaAdminData = (filters: PersonaFilters, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ['persona-admin-data', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('persona_respostas')
        .select(`
          id,
          cpf,
          created_at,
          respostas,
          user_id
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.dataInicio) {
        query = query.gte('created_at', format(filters.dataInicio, 'yyyy-MM-dd'));
      }
      if (filters.dataFim) {
        query = query.lte('created_at', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: personaData, error: personaError, count } = await query;
      
      if (personaError) throw personaError;

      // Get user data for filtering and display
      if (!personaData || personaData.length === 0) {
        return { data: [], count: 0 };
      }

      const cpfs = personaData.map(p => p.cpf);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('cpf, name, gerente, superintendente')
        .in('cpf', cpfs);

      if (userError) throw userError;

      // Join data
      const joinedData = personaData.map(persona => {
        const user = userData?.find(u => u.cpf === persona.cpf);
        return {
          id: persona.id,
          cpf: persona.cpf,
          nome: user?.name || 'N/A',
          email: (persona.respostas as any)?.email || 'N/A',
          superintendencia: user?.superintendente || 'N/A',
          gerencia: user?.gerente || 'N/A',
          created_at: persona.created_at,
          respostas: (persona.respostas as Record<string, any>) || {}
        };
      });

      // Apply name filter
      let filteredData = joinedData;
      if (filters.nome) {
        filteredData = filteredData.filter(item => 
          item.nome.toLowerCase().includes(filters.nome!.toLowerCase())
        );
      }

      // Apply superintendencia filter
      if (filters.superintendencia && filters.superintendencia !== 'todos') {
        filteredData = filteredData.filter(item => 
          item.superintendencia === filters.superintendencia
        );
      }

      // Apply gerente filter
      if (filters.gerente && filters.gerente !== 'todos') {
        filteredData = filteredData.filter(item => 
          item.gerencia === filters.gerente
        );
      }

      return { data: filteredData, count: count || 0 };
    },
  });
};

export const usePersonaStats = () => {
  return useQuery({
    queryKey: ['persona-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('persona_respostas')
        .select('respostas');

      if (error) throw error;

      // Process statistics from responses
      const stats = {
        total: data.length,
        idadeDistribution: {} as Record<string, number>,
        sexoDistribution: {} as Record<string, number>,
        estadoCivilDistribution: {} as Record<string, number>,
        experienciaImobiliariaDistribution: {} as Record<string, number>,
        motivacaoDistribution: {} as Record<string, number>
      };

      data.forEach(item => {
        const respostas = (item.respostas as Record<string, any>) || {};
        
        // Process age distribution
        if (respostas.idade) {
          const faixaEtaria = getFaixaEtaria(Number(respostas.idade));
          stats.idadeDistribution[faixaEtaria] = (stats.idadeDistribution[faixaEtaria] || 0) + 1;
        }

        // Process gender distribution
        if (respostas.sexo) {
          stats.sexoDistribution[String(respostas.sexo)] = (stats.sexoDistribution[String(respostas.sexo)] || 0) + 1;
        }

        // Process marital status
        if (respostas.estado_civil) {
          stats.estadoCivilDistribution[String(respostas.estado_civil)] = (stats.estadoCivilDistribution[String(respostas.estado_civil)] || 0) + 1;
        }

        // Process real estate experience
        if (respostas.experiencia_imobiliaria) {
          stats.experienciaImobiliariaDistribution[String(respostas.experiencia_imobiliaria)] = (stats.experienciaImobiliariaDistribution[String(respostas.experiencia_imobiliaria)] || 0) + 1;
        }

        // Process motivation
        if (respostas.motivacao_principal) {
          stats.motivacaoDistribution[String(respostas.motivacao_principal)] = (stats.motivacaoDistribution[String(respostas.motivacao_principal)] || 0) + 1;
        }
      });

      return stats;
    },
  });
};

function getFaixaEtaria(idade: number): string {
  if (idade < 25) return '18-24';
  if (idade < 35) return '25-34';
  if (idade < 45) return '35-44';
  if (idade < 55) return '45-54';
  if (idade < 65) return '55-64';
  return '65+';
}