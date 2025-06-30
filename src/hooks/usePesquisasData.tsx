
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface PesquisaFilters {
  dataInicio?: Date;
  dataFim?: Date;
  corretor?: string;
  validado?: string;
  searchTerm?: string;
}

export const usePesquisasData = (filters: PesquisaFilters) => {
  return useQuery({
    queryKey: ['pesquisas-satisfacao', filters],
    queryFn: async () => {
      let query = supabase
        .from('pesquisas_satisfacao')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.dataInicio) {
        query = query.gte('created_at', format(filters.dataInicio, 'yyyy-MM-dd'));
      }

      if (filters.dataFim) {
        query = query.lte('created_at', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      if (filters.corretor && filters.corretor !== 'todos') {
        query = query.eq('corretor_nome', filters.corretor);
      }

      if (filters.validado && filters.validado !== 'todos') {
        query = query.eq('validado', filters.validado === 'true');
      }

      if (filters.searchTerm) {
        query = query.or(`nome_completo.ilike.%${filters.searchTerm}%,cpf.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar pesquisas:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useBrindesData = (filters: PesquisaFilters) => {
  return useQuery({
    queryKey: ['brindes', filters],
    queryFn: async () => {
      let query = supabase
        .from('brindes')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.dataInicio) {
        query = query.gte('created_at', format(filters.dataInicio, 'yyyy-MM-dd'));
      }

      if (filters.dataFim) {
        query = query.lte('created_at', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      if (filters.corretor && filters.corretor !== 'todos') {
        query = query.eq('corretor_nome', filters.corretor);
      }

      if (filters.validado && filters.validado !== 'todos') {
        query = query.eq('validado', filters.validado === 'true');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar brindes:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCorretores = () => {
  return useQuery({
    queryKey: ['corretores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('name, apelido')
        .eq('role', 'corretor')
        .order('name');

      if (error) {
        console.error('Erro ao buscar corretores:', error);
        throw error;
      }

      return data || [];
    },
  });
};
