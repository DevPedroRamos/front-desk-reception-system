import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BanCheckResult {
  isBanned: boolean;
  loading: boolean;
  error: Error | null;
}

export function useBanCheck(): BanCheckResult {
  const { user, signOut } = useAuth();
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkBanStatus = async (): Promise<boolean> => {
      if (!user) return false;
      try {
        const { data, error: rpcError } = await supabase.rpc('is_user_banned', {
          _user_id: user.id,
        });
        if (rpcError) {
          // Fail-closed: em caso de erro de verificação, bloqueia acesso
          console.error('Erro ao verificar ban via RPC, bloqueando por segurança:', rpcError);
          return true;
        }
        return data === true;
      } catch (err) {
        console.error('Exceção ao verificar ban, bloqueando por segurança:', err);
        return true;
      }
    };

    const resolveCpf = async (): Promise<string | null> => {
      const metaCpf = (user?.user_metadata as { cpf?: string } | undefined)?.cpf;
      if (metaCpf) return metaCpf;
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('cpf')
        .eq('id', user.id)
        .maybeSingle();
      return data?.cpf ?? null;
    };

    (async () => {
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const banned = await checkBanStatus();
      if (cancelled) return;
      setIsBanned(banned);
      setLoading(false);
    })();

    // Realtime: deslogar imediatamente se o ban for ativado durante a sessão
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (user) {
      (async () => {
        const cpf = await resolveCpf();
        if (cancelled || !cpf) return;

        channel = supabase
          .channel(`ban-watch-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `cpf=eq.${cpf}`,
            },
            async (payload) => {
              const newBan = (payload.new as { ban?: boolean } | null)?.ban;
              if (newBan === true) {
                toast.error('Sua conta foi suspensa. Você será desconectado.');
                setIsBanned(true);
                try {
                  await signOut();
                } catch (e) {
                  console.error('Erro ao deslogar usuário banido:', e);
                  window.location.href = '/banned';
                }
              }
            }
          )
          .subscribe();
      })();
    }

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, signOut]);

  return { isBanned, loading, error };
}
