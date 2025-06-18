
import { Layout } from "@/components/Layout";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Clock, CheckCircle, MapPin, Download, Printer, Calendar as CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { VisitCard } from "@/components/VisitCard";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Index = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedSuperintendente, setSelectedSuperintendente] = useState<string>("todos");

  const superintendentes = [
    "ALINE",
    "ANTONELLA", 
    "BELLA",
    "ISABELLA",
    "JEAN",
    "LISBOA",
    "MATHEUS",
    "VASQUES"
  ];

  // Buscar estatísticas do dashboard com filtros
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', startDate, endDate, selectedSuperintendente],
    queryFn: async () => {
      let query = supabase.rpc('get_dashboard_stats_filtered', {
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        superintendente: selectedSuperintendente === "todos" ? null : selectedSuperintendente
      });

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Fallback para função sem filtros se a com filtros não existir
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('get_dashboard_stats');
        if (fallbackError) throw fallbackError;
        return fallbackData?.[0] || {
          total_visitas_hoje: 0,
          visitas_ativas: 0,
          visitas_finalizadas_hoje: 0,
          mesas_ocupadas: 0
        };
      }
      
      return data?.[0] || {
        total_visitas_hoje: 0,
        visitas_ativas: 0,
        visitas_finalizadas_hoje: 0,
        mesas_ocupadas: 0
      };
    }
  });

  // Buscar visitas ativas com filtros
  const { data: visitasAtivas = [], isLoading: visitasLoading, refetch: refetchVisitas } = useQuery({
    queryKey: ['visitas-ativas-dashboard', startDate, endDate, selectedSuperintendente],
    queryFn: async () => {
      let query = supabase
        .from('visits')
        .select(`
          *,
          users!inner(superintendente)
        `)
        .eq('status', 'ativo')
        .order('horario_entrada', { ascending: false });

      // Aplicar filtro de data se definido
      if (startDate) {
        query = query.gte('horario_entrada', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('horario_entrada', format(endDate, 'yyyy-MM-dd 23:59:59'));
      }

      // Aplicar filtro de superintendente se definido
      if (selectedSuperintendente !== "todos") {
        query = query.eq('users.superintendente', selectedSuperintendente);
      }
      
      const { data, error } = await query;
      
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

  // Função para exportar CSV
  const exportToCSV = () => {
    const csvData = visitasAtivas.map(visita => ({
      'Cliente': visita.cliente_nome,
      'CPF': visita.cliente_cpf,
      'Corretor': visita.corretor_nome,
      'Empreendimento': visita.empreendimento,
      'Loja': visita.loja,
      'Mesa': visita.mesa,
      'Entrada': format(new Date(visita.horario_entrada), 'dd/MM/yyyy HH:mm'),
      'Status': visita.status
    }));

    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exportado!",
      description: "O arquivo foi baixado com sucesso.",
    });
  };

  // Função para imprimir
  const handlePrint = () => {
    window.print();
  };

  const dashboardData = [
    {
      title: "Visitas Hoje",
      value: stats?.total_visitas_hoje?.toString() || "0",
      icon: Users,
      trend: "stable" as const
    },
    {
      title: "Atendimentos Ativos",
      value: stats?.visitas_ativas?.toString() || "0",
      icon: Clock,
      trend: "stable" as const
    },
    {
      title: "Finalizadas Hoje",
      value: stats?.visitas_finalizadas_hoje?.toString() || "0",
      icon: CheckCircle,
      trend: "stable" as const
    },
    {
      title: "Mesas Ocupadas",
      value: stats?.mesas_ocupadas?.toString() || "0",
      icon: MapPin,
      trend: "stable" as const
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
      <div className="space-y-8 print:space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start print:mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 print:text-2xl">Dashboard</h1>
            <p className="text-slate-600 print:text-sm">Visão geral do sistema de recepção</p>
          </div>
          
          {/* Botões de ação - ocultos na impressão */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Filtros - ocultos na impressão */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          {/* Filtro Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Filtro Superintendente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Superintendente</label>
            <Select value={selectedSuperintendente} onValueChange={setSelectedSuperintendente}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar superintendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {superintendentes.map((superintendente) => (
                  <SelectItem key={superintendente} value={superintendente}>
                    {superintendente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:gap-4">
          {dashboardData.map((item, index) => (
            <DashboardCard key={index} {...item} />
          ))}
        </div>

        {/* Visitas Ativas */}
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 print:text-lg">
              <Clock className="h-5 w-5" />
              Atendimentos em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitasAtivas.length === 0 ? (
              <p className="text-slate-500 text-center py-8 print:py-4">
                Nenhum atendimento em andamento no momento.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-2 print:gap-2">
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

      {/* Estilos de impressão */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Index;
