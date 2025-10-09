
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'corretor' | 'recepcionista' | 'admin' | null;

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
          .maybeSingle();

        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          setUserProfile(null);
        } else if (!data) {
          // Fallback: usar metadados do usuário quando não existir perfil ainda
          const meta: any = (user as any)?.user_metadata || {};
          const metaRole = typeof meta.role === 'string' ? meta.role : null;
          const allowedRoles = ['corretor', 'recepcionista', 'admin'] as const;
          const fallbackRole = allowedRoles.includes(metaRole as any) ? (metaRole as UserRole) : null;

          if (fallbackRole) {
            setUserProfile({
              role: fallbackRole,
              name: meta.name || user.email?.split('@')[0] || 'Usuário',
              cpf: meta.cpf || ''
            });
          } else {
            setUserProfile(null);
          }
        } else {
          setUserProfile({
            role: data.role as UserRole,
            name: data.name,
            cpf: data.cpf
          });
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
