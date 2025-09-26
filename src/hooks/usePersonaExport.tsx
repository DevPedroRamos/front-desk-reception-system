import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { PersonaFilters, PersonaAdminData } from './usePersonaAdminData';

export const usePersonaExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const fetchAllPersonaData = async (filters: PersonaFilters): Promise<PersonaAdminData[]> => {
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

    // Apply date filters
    if (filters.dataInicio) {
      query = query.gte('created_at', format(filters.dataInicio, 'yyyy-MM-dd'));
    }
    if (filters.dataFim) {
      query = query.lte('created_at', format(filters.dataFim, 'yyyy-MM-dd'));
    }

    const { data: personaData, error: personaError } = await query;
    
    if (personaError) throw personaError;

    // Get user data for filtering and display
    if (!personaData || personaData.length === 0) {
      return [];
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
        email: (persona.respostas as any)?.dados_pessoais?.email || (persona.respostas as any)?.email || 'N/A',
        superintendencia: user?.superintendente || 'N/A',
        gerencia: user?.gerente || 'N/A',
        created_at: persona.created_at,
        respostas: (persona.respostas as Record<string, any>) || {}
      };
    });

    // Apply filters
    let filteredData = joinedData;

    // Apply name filter
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

    return filteredData;
  };

  return {
    fetchAllPersonaData,
    isExporting,
    setIsExporting
  };
};