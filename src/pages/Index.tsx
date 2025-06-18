
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Users, CheckCheck, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DashboardStats {
  total_visitas_hoje: number;
  visitas_ativas: number;
  visitas_finalizadas_hoje: number;
  mesas_ocupadas: number;
}

interface Visit {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp: string;
  corretor_nome: string;
  empreendimento: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
  horario_saida: string | null;
  status: string;
  corretor_id: string;
}

interface User {
  id: string;
  name: string;
  superintendente: string;
}

export default function Index() {
  const [stats, setStats] = useState<DashboardStats>({
    total_visitas_hoje: 0,
    visitas_ativas: 0,
    visitas_finalizadas_hoje: 0,
    mesas_ocupadas: 0,
  });
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [finishedVisits, setFinishedVisits] = useState<Visit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    superintendente: '',
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchActiveVisits();
    fetchFinishedVisits();
  }, [filters]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, superintendente");

    if (error) {
      console.error("Erro ao buscar usuários:", error);
    } else {
      setUsers(data || []);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats_filtered', {
        start_date: filters.startDate || null,
        end_date: filters.endDate || null,
        superintendente: filters.superintendente || null,
      });

      if (error) {
        console.error("Erro ao buscar estatísticas:", error);
      } else if (data && data.length > 0) {
        setStats({
          total_visitas_hoje: data[0].total_visitas_hoje || 0,
          visitas_ativas: data[0].visitas_ativas || 0,
          visitas_finalizadas_hoje: data[0].visitas_finalizadas_hoje || 0,
          mesas_ocupadas: data[0].mesas_ocupadas || 0,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const fetchActiveVisits = async () => {
    let query = supabase
      .from("visits")
      .select(`
        *,
        users!visits_corretor_id_fkey(name, superintendente)
      `)
      .eq("status", "ativo")
      .order("horario_entrada", { ascending: false });

    if (filters.superintendente) {
      query = query.eq("users.superintendente", filters.superintendente);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar visitas ativas:", error);
    } else {
      setActiveVisits(data || []);
    }
  };

  const fetchFinishedVisits = async () => {
    let query = supabase
      .from("visits")
      .select(`
        *,
        users!visits_corretor_id_fkey(name, superintendente)
      `)
      .eq("status", "finalizado")
      .order("horario_entrada", { ascending: false });

    if (filters.startDate) {
      query = query.gte("horario_entrada", `${filters.startDate}T00:00:00`);
    }
    if (filters.endDate) {
      query = query.lte("horario_entrada", `${filters.endDate}T23:59:59`);
    }
    if (filters.superintendente) {
      query = query.eq("users.superintendente", filters.superintendente);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar visitas finalizadas:", error);
    } else {
      setFinishedVisits(data || []);
    }
  };

  const handleFinalizarVisita = async (visitId: string) => {
    try {
      const { error } = await supabase.rpc('finalizar_visita', {
        visit_id: visitId
      });

      if (error) {
        console.error("Erro ao finalizar visita:", error);
        toast({
          title: "Erro",
          description: "Erro ao finalizar atendimento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Atendimento finalizado com sucesso",
        });
        fetchActiveVisits();
        fetchFinishedVisits();
        fetchStats();
      }
    } catch (error) {
      console.error("Erro ao finalizar visita:", error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar atendimento",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const allVisits = [...activeVisits, ...finishedVisits];
    
    if (allVisits.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'Cliente',
      'CPF',
      'WhatsApp',
      'Corretor',
      'Empreendimento',
      'Loja',
      'Andar',
      'Mesa',
      'Entrada',
      'Saída',
      'Status'
    ];

    const csvContent = [
      headers.join(','),
      ...allVisits.map(visit => [
        `"${visit.cliente_nome}"`,
        `"${visit.cliente_cpf}"`,
        `"${visit.cliente_whatsapp || ''}"`,
        `"${visit.corretor_nome}"`,
        `"${visit.empreendimento || ''}"`,
        `"${visit.loja}"`,
        `"${visit.andar}"`,
        visit.mesa,
        `"${new Date(visit.horario_entrada).toLocaleString('pt-BR')}"`,
        `"${visit.horario_saida ? new Date(visit.horario_saida).toLocaleString('pt-BR') : ''}"`,
        `"${visit.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_visitas_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso",
    });
  };

  const clearFilters = () => {
    setFilters({
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      superintendente: '',
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const uniqueSuperintendentes = Array.from(new Set(users.map(user => user.superintendente))).filter(Boolean);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Visão geral do sistema de recepção</p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="superintendente">Superintendente</Label>
                <Select 
                  value={filters.superintendente} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, superintendente: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os superintendentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os superintendentes</SelectItem>
                    {uniqueSuperintendentes.map((superintendente) => (
                      <SelectItem key={superintendente} value={superintendente}>
                        {superintendente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Visitas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total_visitas_hoje}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Visitas Ativas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.visitas_ativas}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-orange-100 p-3">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Visitas Finalizadas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.visitas_finalizadas_hoje}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-slate-900">{stats.mesas_ocupadas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabelas de Visitas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Atendimentos Ativos ({activeVisits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeVisits.map((visit) => (
                  <div key={visit.id} className="border border-slate-200 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{visit.cliente_nome}</h4>
                        <p className="text-sm text-slate-600">CPF: {visit.cliente_cpf}</p>
                        {visit.cliente_whatsapp && (
                          <p className="text-sm text-slate-600">WhatsApp: {visit.cliente_whatsapp}</p>
                        )}
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Ativo
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-slate-600">Corretor:</span>
                        <span className="font-medium ml-1">{visit.corretor_nome}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Mesa:</span>
                        <span className="font-medium ml-1">{visit.mesa}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Loja:</span>
                        <span className="font-medium ml-1">{visit.loja}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Andar:</span>
                        <span className="font-medium ml-1">{visit.andar}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm mb-3">
                      <span className="text-slate-600">Entrada:</span>
                      <span className="font-medium ml-1">{formatTime(visit.horario_entrada)}</span>
                    </div>
                    
                    {visit.empreendimento && (
                      <div className="text-sm mb-3">
                        <span className="text-slate-600">Empreendimento:</span>
                        <span className="font-medium ml-1">{visit.empreendimento}</span>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => handleFinalizarVisita(visit.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      Finalizar Atendimento
                    </Button>
                  </div>
                ))}
                
                {activeVisits.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    Nenhum atendimento ativo no momento
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">
                Atendimentos Finalizados ({finishedVisits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {finishedVisits.map((visit) => (
                  <div key={visit.id} className="border border-slate-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{visit.cliente_nome}</h4>
                        <p className="text-sm text-slate-600">CPF: {visit.cliente_cpf}</p>
                        {visit.cliente_whatsapp && (
                          <p className="text-sm text-slate-600">WhatsApp: {visit.cliente_whatsapp}</p>
                        )}
                      </div>
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                        Finalizado
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-slate-600">Corretor:</span>
                        <span className="font-medium ml-1">{visit.corretor_nome}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Mesa:</span>
                        <span className="font-medium ml-1">{visit.mesa}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Loja:</span>
                        <span className="font-medium ml-1">{visit.loja}</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Andar:</span>
                        <span className="font-medium ml-1">{visit.andar}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-slate-600">Entrada:</span>
                        <span className="font-medium ml-1">{formatTime(visit.horario_entrada)}</span>
                      </div>
                      {visit.horario_saida && (
                        <div>
                          <span className="text-slate-600">Saída:</span>
                          <span className="font-medium ml-1">{formatTime(visit.horario_saida)}</span>
                        </div>
                      )}
                    </div>
                    
                    {visit.empreendimento && (
                      <div className="text-sm">
                        <span className="text-slate-600">Empreendimento:</span>
                        <span className="font-medium ml-1">{visit.empreendimento}</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {finishedVisits.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    Nenhum atendimento finalizado encontrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
