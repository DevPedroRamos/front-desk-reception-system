
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, UserCheck, Clock, Building2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { DateRange } from "react-day-picker";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [selectedSuperintendente, setSelectedSuperintendente] = useState<string>("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  // Para corretores, buscar apenas dados básicos do dia atual
  const { data: corretorStats, isLoading: corretorLoading } = useQuery({
    queryKey: ['corretor-stats'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      
      // Buscar agendamentos de hoje
      const { data: agendamentos, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('data', hoje);

      if (agendamentosError) {
        console.error('Erro ao buscar agendamentos:', agendamentosError);
      }

      // Buscar visitas ativas
      const { data: visitasAtivas, error: visitasError } = await supabase
        .from('visits')
        .select('*')
        .eq('status', 'ativo');

      if (visitasError) {
        console.error('Erro ao buscar visitas ativas:', visitasError);
      }

      return {
        agendamentos_hoje: agendamentos?.length || 0,
        visitas_ativas: visitasAtivas?.length || 0,
      };
    },
    enabled: profile?.role === 'corretor',
  });

  // Para recepcionistas, manter a funcionalidade completa com filtros
  const { data: dashboardStats, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard-stats', dateRange, selectedSuperintendente],
    queryFn: async () => {
      const startDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined;
      const endDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined;

      const { data, error } = await supabase.rpc('get_dashboard_stats_filtered', {
        start_date: startDate,
        end_date: endDate,
        superintendente: selectedSuperintendente === "all" ? undefined : selectedSuperintendente,
      });

      if (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        return null;
      }

      return data ? data[0] : null;
    },
    enabled: profile?.role === 'recepcionista',
  });

  const { data: superintendentes = [], isLoading: superLoading } = useQuery({
    queryKey: ['superintendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('superintendente')
        .not('superintendente', 'is', null);

      if (error) {
        console.error('Erro ao buscar superintendentes:', error);
        return [];
      }

      // Extrair valores únicos manualmente
      const uniqueSuperintendentes = Array.from(
        new Set(data?.map(item => item.superintendente) || [])
      );

      return uniqueSuperintendentes;
    },
    enabled: profile?.role === 'recepcionista',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const isRecepcao = profile.role === 'recepcionista';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with logout */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600">
                Bem-vindo, {profile.name} ({profile.role})
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Date Range Picker and Filter - apenas para recepcionistas */}
        {isRecepcao && (
          <div className="flex items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR }) + 
                    " - " + 
                    format(dateRange.to || dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecionar data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range) {
                      setDateRange({
                        from: range.from || new Date(),
                        to: range.to || range.from || new Date(),
                      });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select onValueChange={(value) => setSelectedSuperintendente(value)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrar por Superintendente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Superintendentes</SelectItem>
                {superintendentes.map((superintendente) => (
                  <SelectItem key={superintendente} value={superintendente}>
                    {superintendente}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isRecepcao ? (
            <>
              <DashboardCard
                title="Visitas Hoje"
                value={dashboardLoading ? "Carregando..." : dashboardStats?.total_visitas_hoje?.toString() || "0"}
                icon={Users}
                description="Total de visitas agendadas para hoje"
              />
              <DashboardCard
                title="Atendimentos Ativos"
                value={dashboardLoading ? "Carregando..." : dashboardStats?.visitas_ativas?.toString() || "0"}
                icon={UserCheck}
                description="Número de atendimentos em andamento"
              />
              <DashboardCard
                title="Visitas Finalizadas"
                value={dashboardLoading ? "Carregando..." : dashboardStats?.visitas_finalizadas_hoje?.toString() || "0"}
                icon={Clock}
                description="Total de visitas finalizadas hoje"
              />
              <DashboardCard
                title="Mesas Ocupadas"
                value={dashboardLoading ? "Carregando..." : dashboardStats?.mesas_ocupadas?.toString() || "0"}
                icon={Building2}
                description="Número de mesas atualmente em uso"
              />
            </>
          ) : (
            <>
              <DashboardCard
                title="Agendamentos Hoje"
                value={corretorLoading ? "Carregando..." : corretorStats?.agendamentos_hoje?.toString() || "0"}
                icon={Calendar}
                description="Seus agendamentos para hoje"
              />
              <DashboardCard
                title="Atendimentos Ativos"
                value={corretorLoading ? "Carregando..." : corretorStats?.visitas_ativas?.toString() || "0"}
                icon={UserCheck}
                description="Atendimentos em andamento"
              />
            </>
          )}
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {isRecepcao 
                ? "Este dashboard fornece uma visão geral do sistema de recepção. Use os filtros acima para refinar os dados exibidos."
                : "Visualize seus agendamentos e atendimentos do dia. Para funcionalidades completas, entre em contato com a recepção."
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
