import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TipoBrinde {
  id: string;
  nome: string;
  ativo: boolean;
  entrega_automatica: boolean;
  icone_url: string | null;
  estoque: number;
  created_at: string;
  updated_at: string;
}

export function useTiposBrinde() {
  return useQuery({
    queryKey: ["tipos_brinde"],
    queryFn: async (): Promise<TipoBrinde[]> => {
      const { data, error } = await (supabase as any)
        .from("tipos_brinde")
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data || []) as TipoBrinde[];
    },
  });
}

export function useTiposBrindeAtivos() {
  return useQuery({
    queryKey: ["tipos_brinde", "ativos"],
    queryFn: async (): Promise<TipoBrinde[]> => {
      const { data, error } = await (supabase as any)
        .from("tipos_brinde")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data || []) as TipoBrinde[];
    },
  });
}