
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
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
    
    if (!error && data.user) {
      // Buscar o papel do usuário para redirecionar corretamente
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      // Redirecionar baseado no papel do usuário
      setTimeout(() => {
        if (profileData?.role === 'corretor') {
          window.location.href = '/corretor/visitas';
        } else {
          window.location.href = '/';
        }
      }, 100);
    }
    
    return { error };
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
