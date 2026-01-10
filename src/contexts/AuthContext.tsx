
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, cpf: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      // Only finish loading on definitive auth events
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    // Then seed state with existing session (do not change loading here)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, cpf: string) => {
    // Primeiro, validar se o CPF existe na tabela users
    const cleanCpf = cpf.replace(/[.-]/g, '');
    
    const { data: userData, error: cpfError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('cpf', cleanCpf)
      .single();

    if (cpfError || !userData) {
      return { 
        error: { 
          message: 'CPF não encontrado no sistema. Entre em contato com o administrador.' 
        } 
      };
    }

    // Verificar se o CPF está banido
    const { data: banCheck } = await supabase
      .from('users')
      .select('ban')
      .eq('cpf', cleanCpf)
      .single();

    if (banCheck?.ban === true) {
      return { 
        error: { 
          message: 'Este CPF está suspenso e não pode se cadastrar. Entre em contato com o administrador.' 
        } 
      };
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          cpf: cleanCpf,
          name: userData.name,
          role: userData.role
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error };
    }

    // Verificar se o usuário está banido
    const cpf = data.user?.user_metadata?.cpf;
    
    if (cpf) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('ban')
        .eq('cpf', cpf)
        .single();

      if (!userError && userData?.ban === true) {
        // Fazer logout imediato se banido
        await supabase.auth.signOut();
        return { 
          error: { 
            message: 'Sua conta foi suspensa. Entre em contato com o administrador.' 
          } 
        };
      }
    } else {
      // Tentar buscar CPF na tabela profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('cpf')
        .eq('id', data.user?.id)
        .single();

      if (profileData?.cpf) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('ban')
          .eq('cpf', profileData.cpf)
          .single();

        if (!userError && userData?.ban === true) {
          await supabase.auth.signOut();
          return { 
            error: { 
              message: 'Sua conta foi suspensa. Entre em contato com o administrador.' 
            } 
          };
        }
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    console.log('Iniciando logout...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
        throw error;
      }
      
      // Forçar limpeza do estado local
      setUser(null);
      setSession(null);
      
      console.log('Logout realizado com sucesso');
      
      // Redirecionar para página de login
      window.location.href = '/auth';
    } catch (error) {
      console.error('Erro durante logout:', error);
      // Mesmo com erro, limpar estado local e redirecionar
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
