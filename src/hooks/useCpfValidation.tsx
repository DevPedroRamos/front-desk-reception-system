
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCpfValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateCpf = async (cpf: string): Promise<{ isValid: boolean; userData?: any }> => {
    setIsValidating(true);
    
    try {
      // Limpar CPF removendo pontos e traços
      const cleanCpf = cpf.replace(/[.-]/g, '');
      
      // Verificar se o CPF existe na tabela users
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, cpf')
        .eq('cpf', cleanCpf)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao validar CPF:', error);
        return { isValid: false };
      }

      return { 
        isValid: !!data, 
        userData: data 
      };
    } catch (error) {
      console.error('Erro na validação do CPF:', error);
      return { isValid: false };
    } finally {
      setIsValidating(false);
    }
  };

  const formatCpf = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara XXX.XXX.XXX-XX
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  return {
    validateCpf,
    formatCpf,
    isValidating
  };
}
