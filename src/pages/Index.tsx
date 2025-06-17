import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { DashboardCard } from "@/components/DashboardCard";
import { VisitCard } from "@/components/VisitCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, Printer, Users, UserCheck, ClipboardList, Building } from "lucide-react";
import { format } from "date-fns";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile } = useAuthContext();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [superintendente, setSuperintendente] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", startDate, endDate, superintendente],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats_filtered", {
        start_date: startDate || null,
        end_date: endDate || null,
        superintendente: superintendente || null,
      });
      
      if (error) throw error;
      return data?.[0] || {
        total_visitas_hoje: 0,
        visitas_ativas: 0,
        visitas_finalizadas_hoje: 0,
        mesas_ocupadas: 0,
      };
    },
  });

  const { data: visits } = useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visits")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: superintendentes } = useQuery({
    queryKey: ["superintendentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("superintendente")
        .not("superintendente", "is", null);
      
      if (error) throw error;
      
      const uniqueSuperintendentes = [...new Set(data.map(u => u.superintendente))];
      return uniqueSuperintendentes;
    },
  });

  const exportToCSV = () => {
    if (!visits) return;
    
    const headers = ["Data", "Cliente", "CPF", "Corretor", "Loja", "Mesa", "Status"];
    const csvContent = [
      headers.join(","),
      ...visits.map(visit => [
        format(new Date(visit.created_at), "dd/MM/yyyy"),
        visit.cliente_nome,
        visit.cliente_cpf,
        visit.corretor_nome,
        `${visit.loja} - ${visit.andar}`,
        visit.mesa,
        visit.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio-visitas-${format(new Date(), "dd-MM-yyyy")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    if (!visits) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Visitas - ${format(new Date(), "dd/MM/yyyy")}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .stats { display: flex; justify-content: space-around; margin-bottom: 20px; }
            .stat-card { text-align: center; padding: 10px; border: 1px solid #ddd; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Front Desk - Relatório de Visitas</h1>
            <p>Data: ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <h3>${stats?.total_visitas_hoje || 0}</h3>
              <p>Total de Visitas</p>
            </div>
            <div class="stat-card">
              <h3>${stats?.visitas_ativas || 0}</h3>
              <p>Visitas Ativas</p>
            </div>
            <div class="stat-card">
              <h3>${stats?.visitas_finalizadas_hoje || 0}</h3>
              <p>Visitas Finalizadas</p>
            </div>
            <div class="stat-card">
              <h3>${stats?.mesas_ocupadas || 0}</h3>
              <p>Mesas Ocupadas</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>CPF</th>
                <th>Corretor</th>
                <th>Local</th>
                <th>Mesa</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${visits.map(visit => `
                <tr>
                  <td>${format(new Date(visit.created_at), "dd/MM/yyyy HH:mm")}</td>
                  <td>${visit.cliente_nome}</td>
                  <td>${visit.cliente_cpf}</td>
                  <td>${visit.corretor_nome}</td>
                  <td>${visit.loja} - ${visit.andar}</td>
                  <td>${visit.mesa}</td>
                  <td>${visit.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Front Desk System</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">Faça login para acessar o sistema</p>
            <Button asChild className="w-full">
              <a href="/auth">Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Visão geral do sistema de recepção</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={printReport} variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data Início</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Data Fim</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="superintendente">Superintendente</Label>
                <Select value={superintendente} onValueChange={setSuperintendente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {superintendentes?.map((sup) => (
                      <SelectItem key={sup} value={sup}>
                        {sup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total de Visitas"
            value={stats?.total_visitas_hoje?.toString() || "0"}
            description="Visitas registradas no período"
            icon={<Users className="h-4 w-4 text-blue-600" />}
          />
          <DashboardCard
            title="Visitas Ativas"
            value={stats?.visitas_ativas?.toString() || "0"}
            description="Atendimentos em andamento"
            icon={<UserCheck className="h-4 w-4 text-green-600" />}
          />
          <DashboardCard
            title="Visitas Finalizadas"
            value={stats?.visitas_finalizadas_hoje?.toString() || "0"}
            description="Finalizadas no período"
            icon={<ClipboardList className="h-4 w-4 text-purple-600" />}
          />
          <DashboardCard
            title="Mesas Ocupadas"
            value={stats?.mesas_ocupadas?.toString() || "0"}
            description="Mesas em uso no momento"
            icon={<Building className="h-4 w-4 text-orange-600" />}
          />
        </div>

        {/* Lista de visitas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Visitas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {visits?.slice(0, 10).map((visit) => (
                <VisitCard 
                  key={visit.id} 
                  visit={visit} 
                  canFinalize={profile?.role === 'recepcao'}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
