
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Clock, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { VisitCard } from "@/components/VisitCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Corretor = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar visitas ativas
  const { data: visitasAtivas = [], isLoading: visitasLoading, refetch: refetchVisitas } = useQuery({
    queryKey: ['visitas-ativas-corretor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('status', 'ativo')
        .order('horario_entrada', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar visitas ativas:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Configurar tempo real
  useEffect(() => {
    const channel = supabase
      .channel('corretor-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits'
        },
        () => {
          refetchVisitas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchVisitas]);

  // Função para finalizar visita
  const handleFinalizarVisita = async (visitId: string) => {
    try {
      const { error } = await supabase.rpc('finalizar_visita', { visit_id: visitId });
      
      if (error) {
        console.error('Erro ao finalizar visita:', error);
        toast({
          title: "Erro ao finalizar visita",
          description: "Ocorreu um erro ao finalizar a visita. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Visita finalizada!",
        description: "A visita foi finalizada com sucesso.",
      });

      refetchVisitas();
    } catch (error) {
      console.error('Erro ao finalizar visita:', error);
      toast({
        title: "Erro ao finalizar visita",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (visitasLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Área do Corretor</h1>
            <p className="text-slate-600">Gerencie seus atendimentos</p>
          </div>
        </div>

        {/* Atendimentos Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Atendimentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitasAtivas.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhum atendimento ativo no momento.
              </p>
            ) : (
              <div className="space-y-4">
                {visitasAtivas.map((visita) => (
                  <VisitCard
                    key={visita.id}
                    visit={visita}
                    onFinalize={handleFinalizarVisita}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Corretor;
