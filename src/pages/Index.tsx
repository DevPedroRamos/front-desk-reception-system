
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar, Users, Clock, MapPin, FileDown, X } from 'lucide-react';

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
  corretor_nome: string;
  corretor_id: string;
  empreendimento: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
  horario_saida?: string;
  status: string;
}

interface User {
  id: string;
  superintendente: string;
}

export default function Index() {
  const [stats, setStats] = useState<DashboardStats>({
    total_visitas_hoje: 0,
    visitas_ativas: 0,
    visitas_finalizadas_hoje: 0,
    mesas_ocupadas: 0
  });
  
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [finishedVisits, setFinishedVisits] = useState<Visit[]>([]);
  const [superintendentes, setSuperintendentes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSuperintendente, setSelectedSuperintendente] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSuperintendentes = async () => {
    const { data } = await supabase
      .from('users')
      .select('superintendente')
      .not('superintendente', 'is', null);
    
    if (data) {
      const uniqueSuperintendentes = [...new Set(data.map(u => u.superintendente))];
      setSuperintendentes(uniqueSuperintendentes);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const params: any = {};
      
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedSuperintendente !== 'all') params.superintendente = selectedSuperintendente;

      const { data, error } = await supabase.rpc('get_dashboard_stats_filtered', params);
      
      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Erro ao carregar estatísticas do dashboard');
    }
  };

  const loadActiveVisits = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          id,
          cliente_nome,
          cliente_cpf,
          corretor_nome,
          corretor_id,
          empreendimento,
          loja,
          andar,
          mesa,
          horario_entrada,
          status,
          users!visits_corretor_id_fkey(superintendente)
        `)
        .eq('status', 'ativo')
        .order('horario_entrada', { ascending: false });

      if (selectedSuperintendente !== 'all') {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('superintendente', selectedSuperintendente);
        
        if (userData) {
          const userIds = userData.map(u => u.id);
          query = query.in('corretor_id', userIds);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (data) {
        setActiveVisits(data);
      }
    } catch (error) {
      console.error('Error loading active visits:', error);
      toast.error('Erro ao carregar visitas ativas');
    }
  };

  const loadFinishedVisits = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          id,
          cliente_nome,
          cliente_cpf,
          corretor_nome,
          corretor_id,
          empreendimento,
          loja,
          andar,
          mesa,
          horario_entrada,
          horario_saida,
          status,
          users!visits_corretor_id_fkey(superintendente)
        `)
        .eq('status', 'finalizado')
        .order('horario_saida', { ascending: false });

      // Aplicar filtros de data
      if (startDate) {
        query = query.gte('horario_entrada', startDate);
      }
      if (endDate) {
        query = query.lte('horario_entrada', endDate + 'T23:59:59');
      }

      if (selectedSuperintendente !== 'all') {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('superintendente', selectedSuperintendente);
        
        if (userData) {
          const userIds = userData.map(u => u.id);
          query = query.in('corretor_id', userIds);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (data) {
        setFinishedVisits(data);
      }
    } catch (error) {
      console.error('Error loading finished visits:', error);
      toast.error('Erro ao carregar visitas finalizadas');
    }
  };

  const finalizarVisita = async (visitId: string) => {
    try {
      const { error } = await supabase.rpc('finalizar_visita', { visit_id: visitId });
      
      if (error) throw error;
      
      toast.success('Visita finalizada com sucesso!');
      loadActiveVisits();
      loadFinishedVisits();
      loadDashboardStats();
    } catch (error) {
      console.error('Error finishing visit:', error);
      toast.error('Erro ao finalizar visita');
    }
  };

  const exportToCSV = () => {
    const csvData = finishedVisits.map(visit => ({
      'Cliente': visit.cliente_nome,
      'CPF': visit.cliente_cpf,
      'Corretor': visit.corretor_nome,
      'Empreendimento': visit.empreendimento || '',
      'Loja': visit.loja,
      'Andar': visit.andar,
      'Mesa': visit.mesa,
      'Entrada': format(new Date(visit.horario_entrada), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'Saída': visit.horario_saida ? format(new Date(visit.horario_saida), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `visitas_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.click();
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedSuperintendente('all');
    setSearchTerm('');
  };

  const filteredActiveVisits = activeVisits.filter(visit =>
    visit.corretor_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadSuperintendentes();
      await loadDashboardStats();
      await loadActiveVisits();
      await loadFinishedVisits();
      setLoading(false);
    };
    
    loadData();
  }, [startDate, endDate, selectedSuperintendente]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Visão geral dos atendimentos</p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data Final</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Superintendente</label>
                <Select value={selectedSuperintendente} onValueChange={setSelectedSuperintendente}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os superintendentes</SelectItem>
                    {superintendentes.map((sup) => (
                      <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_visitas_hoje}</div>
              <p className="text-xs text-muted-foreground">
                Visitas no período
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendimentos Ativos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visitas_ativas}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas Finalizadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visitas_finalizadas_hoje}</div>
              <p className="text-xs text-muted-foreground">
                Finalizadas no período
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mesas_ocupadas}</div>
              <p className="text-xs text-muted-foreground">
                Atualmente ocupadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Atendimentos Ativos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Atendimentos Ativos</CardTitle>
                <CardDescription>
                  Lista de atendimentos em andamento
                </CardDescription>
              </div>
              <div className="w-64">
                <Input
                  placeholder="Pesquisar por corretor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Corretor</TableHead>
                  <TableHead>Empreendimento</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActiveVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visit.cliente_nome}</p>
                        <p className="text-sm text-gray-500">{visit.cliente_cpf}</p>
                      </div>
                    </TableCell>
                    <TableCell>{visit.corretor_nome}</TableCell>
                    <TableCell>{visit.empreendimento || '-'}</TableCell>
                    <TableCell>
                      {visit.loja} - {visit.andar} - Mesa {visit.mesa}
                    </TableCell>
                    <TableCell>
                      {format(new Date(visit.horario_entrada), 'dd/MM HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => finalizarVisita(visit.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Finalizar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredActiveVisits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum atendimento ativo encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visitas Finalizadas */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Visitas Finalizadas</CardTitle>
                <CardDescription>
                  Histórico de visitas finalizadas
                </CardDescription>
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Corretor</TableHead>
                  <TableHead>Empreendimento</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finishedVisits.slice(0, 50).map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{visit.cliente_nome}</p>
                        <p className="text-sm text-gray-500">{visit.cliente_cpf}</p>
                      </div>
                    </TableCell>
                    <TableCell>{visit.corretor_nome}</TableCell>
                    <TableCell>{visit.empreendimento || '-'}</TableCell>
                    <TableCell>
                      {visit.loja} - {visit.andar} - Mesa {visit.mesa}
                    </TableCell>
                    <TableCell>
                      {format(new Date(visit.horario_entrada), 'dd/MM HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {visit.horario_saida 
                        ? format(new Date(visit.horario_saida), 'dd/MM HH:mm', { locale: ptBR })
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {finishedVisits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma visita finalizada encontrada
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
