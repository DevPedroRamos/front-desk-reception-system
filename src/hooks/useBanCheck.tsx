import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BanCheckResult {
  isBanned: boolean;
  loading: boolean;
  error: Error | null;
}

export function useBanCheck(): BanCheckResult {
  const { user } = useAuth();
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar CPF do usuário nos metadados ou na tabela profiles
        const cpf = user.user_metadata?.cpf;
        
        if (!cpf) {
          // Tentar buscar na tabela profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('cpf')
            .eq('id', user.id)
            .single();

          if (profileError || !profileData?.cpf) {
            setLoading(false);
            return;
          }

          // Verificar ban na tabela users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('ban')
            .eq('cpf', profileData.cpf)
            .single();

          if (userError) {
            console.error('Erro ao verificar status de ban:', userError);
            setLoading(false);
            return;
          }

          setIsBanned(userData?.ban === true);
        } else {
          // Verificar ban na tabela users usando CPF dos metadados
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('ban')
            .eq('cpf', cpf)
            .single();

          if (userError) {
            console.error('Erro ao verificar status de ban:', userError);
            setLoading(false);
            return;
          }

          setIsBanned(userData?.ban === true);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    checkBanStatus();
  }, [user]);

  return { isBanned, loading, error };
}
