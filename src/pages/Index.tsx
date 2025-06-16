
import { Layout } from "@/components/Layout";
import { DashboardCard } from "@/components/DashboardCard";
import { VisitCard } from "@/components/VisitCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar, TrendingUp, Plus, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

// Mock data para demonstração
const mockVisits = [
  {
    id: "1",
    cliente_nome: "João Silva",
    corretor_nome: "Maria Santos",
    empreendimento: "Residencial Park View",
    loja: "Loja A",
    mesa: 3,
    horario_entrada: "2024-01-15T14:30:00",
    status: "ativo" as const,
  },
  {
    id: "2",
    cliente_nome: "Ana Costa",
    corretor_nome: "Carlos Oliveira",
    empreendimento: "Condomínio Jardins",
    loja: "Loja B",
    mesa: 7,
    horario_entrada: "2024-01-15T15:15:00",
    status: "ativo" as const,
  },
  {
    id: "3",
    cliente_nome: "Pedro Lima",
    corretor_nome: "Fernanda Rocha",
    empreendimento: "Torres do Atlântico",
    loja: "Loja A",
    mesa: 12,
    horario_entrada: "2024-01-15T13:45:00",
    status: "finalizado" as const,
  },
];

const Index = () => {
  const { toast } = useToast();
  const [visits, setVisits] = useState(mockVisits);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFinalizeVisit = (visitId: string) => {
    setVisits(prev => 
      prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, status: "finalizado" as const }
          : visit
      )
    );
    
    toast({
      title: "Atendimento finalizado!",
      description: "A visita foi marcada como finalizada com sucesso.",
    });
  };

  const activeVisits = visits.filter(v => v.status === "ativo");
  const completedVisits = visits.filter(v => v.status === "finalizado");

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard Front Desk</h1>
            <p className="text-slate-600 mt-1">
              {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nova Visita
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Atendimentos Ativos"
            value={activeVisits.length}
            description="Clientes sendo atendidos agora"
            icon={<UserCheck className="h-4 w-4" />}
            trend="stable"
            className="border-l-4 border-l-green-500"
          />
          
          <DashboardCard
            title="Total Hoje"
            value={visits.length}
            description="Visitas registradas hoje"
            icon={<Users className="h-4 w-4" />}
            trend="up"
            trendValue="+12% vs ontem"
            className="border-l-4 border-l-blue-500"
          />
          
          <DashboardCard
            title="Agendamentos"
            value={8}
            description="Para hoje"
            icon={<Calendar className="h-4 w-4" />}
            className="border-l-4 border-l-orange-500"
          />
          
          <DashboardCard
            title="Taxa de Conversão"
            value="85%"
            description="Visitas que resultaram em negócio"
            icon={<TrendingUp className="h-4 w-4" />}
            trend="up"
            trendValue="+5% vs semana passada"
            className="border-l-4 border-l-purple-500"
          />
        </div>

        {/* Active Visits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-slate-900">Atendimentos Ativos</CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {activeVisits.length} ativo{activeVisits.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activeVisits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeVisits.map((visit) => (
                  <VisitCard 
                    key={visit.id} 
                    visit={visit} 
                    onFinalize={handleFinalizeVisit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Nenhum atendimento ativo
                </h3>
                <p className="text-slate-600">
                  Todos os clientes foram atendidos ou não há visitas no momento.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed Visits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Visitas Finalizadas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            {completedVisits.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedVisits.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">Nenhuma visita finalizada hoje ainda.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
