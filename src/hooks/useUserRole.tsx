
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'corretor' | 'recepcionista' | null;

interface UserProfile {
  role: UserRole;
  name: string;
  cpf: string;
}

export function useUserRole() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, name, cpf')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          setUserProfile(null);
        } else {
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  return {
    userProfile,
    isCorretor: userProfile?.role === 'corretor',
    isRecepcionista: userProfile?.role === 'recepcionista',
    loading
  };
}
