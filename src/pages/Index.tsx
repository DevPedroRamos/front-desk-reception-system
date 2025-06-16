
import { Layout } from "@/components/Layout";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { VisitCard } from "@/components/VisitCard";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();

  // Buscar estatísticas do dashboard
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        throw error;
      }
      
      return data?.[0] || {
        total_visitas_hoje: 0,
        visitas_ativas: 0,
        visitas_finalizadas_hoje: 0,
        mesas_ocupadas: 0
      };
    }
  });

  // Buscar visitas ativas
  const { data: visitasAtivas = [], isLoading: visitasLoading, refetch: refetchVisitas } = useQuery({
    queryKey: ['visitas-ativas-dashboard'],
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

  // Configurar tempo real para visitas
  useEffect(() => {
    const channel = supabase
      .channel('visits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits'
        },
        () => {
          refetchStats();
          refetchVisitas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchStats, refetchVisitas]);

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

      refetchStats();
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

  const dashboardData = [
    {
      title: "Visitas Hoje",
      value: stats?.total_visitas_hoje?.toString() || "0",
      icon: Users,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Atendimentos Ativos",
      value: stats?.visitas_ativas?.toString() || "0",
      icon: Clock,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Finalizadas Hoje",
      value: stats?.visitas_finalizadas_hoje?.toString() || "0",
      icon: CheckCircle,
      trend: { value: 0, isPositive: true }
    },
    {
      title: "Mesas Ocupadas",
      value: stats?.mesas_ocupadas?.toString() || "0",
      icon: MapPin,
      trend: { value: 0, isPositive: false }
    }
  ];

  if (statsLoading || visitasLoading) {
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Visão geral do sistema de recepção</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        {/* Visitas Ativas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atendimentos em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitasAtivas.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                Nenhum atendimento em andamento no momento.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

export default Index;
