
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Download, Calendar } from 'lucide-react';
import { useExportCSV } from '@/hooks/useExportCSV';

interface Visit {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp?: string;
  corretor_nome: string;
  corretor_id: string;
  empreendimento?: string;
  loja: string;
  andar: string;
  mesa: number;
  status: string;
  horario_entrada: string;
  horario_saida?: string;
  created_at: string;
}

interface DashboardStats {
  total_visitas_hoje: number;
  visitas_ativas: number;
  visitas_finalizadas_hoje: number;
  mesas_ocupadas: number;
  clientes_lista_espera: number;
}

export default function Index() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [superintendentes, setSuperintendentes] = useState<string[]>([]);
  const [superintendenteFilter, setSuperintendenteFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const { toast } = useToast();
  const { exportToCSV } = useExportCSV();

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar estatísticas usando função do banco
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats_filtered', {
          start_date: startDate || null,
          end_date: endDate || null,
          superintendente: superintendenteFilter !== 'all' ? superintendenteFilter : null
        });

      if (statsError) {
        console.error('Erro ao buscar estatísticas:', statsError);
      } else if (statsData && statsData.length > 0) {
        setStats(statsData[0]);
      }

      // Carregar visitas
      let query = supabase
        .from('visits')
        .select('*')
        .order('horario_entrada', { ascending: false });

      if (startDate) {
        query = query.gte('horario_entrada', startDate);
      }
      if (endDate) {
        query = query.lte('horario_entrada', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar visitas:', error);
        toast({
          title: "Erro ao carregar",
          description: "Ocorreu um erro ao carregar as visitas.",
          variant: "destructive",
        });
        return;
      }

      setVisits(data || []);

      // Extrair superintendentes únicos
      const superintendentesSet = new Set<string>();
      data?.forEach((visit) => {
        superintendentesSet.add(visit.corretor_nome);
      });
      setSuperintendentes(Array.from(superintendentesSet));
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, superintendenteFilter]);

  useEffect(() => {
    let filtered = visits;

    if (superintendenteFilter !== 'all') {
      filtered = filtered.filter((visit) => visit.corretor_nome === superintendenteFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (visit) =>
          visit.cliente_nome.toLowerCase().includes(term) ||
          visit.cliente_cpf.toLowerCase().includes(term) ||
          visit.corretor_nome.toLowerCase().includes(term)
      );
    }

    setFilteredVisits(filtered);
  }, [visits, superintendenteFilter, searchTerm]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSuperintendenteFilter('all');
    setSearchTerm('');
  };

  const setTodayFilter = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setStartDate(today);
    setEndDate(today);
  };

  const setCurrentMonthFilter = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(format(firstDay, 'yyyy-MM-dd'));
    setEndDate(format(lastDay, 'yyyy-MM-dd'));
  };

  const handleExportCSV = () => {
    if (filteredVisits.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há visitas para exportar com os filtros aplicados.",
        variant: "destructive",
      });
      return;
    }
    
    exportToCSV(filteredVisits, `visitas-${format(new Date(), 'dd-MM-yyyy')}.csv`);
    toast({
      title: "Exportação concluída",
      description: `${filteredVisits.length} visitas exportadas com sucesso.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Visão geral das atividades do sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total de Visitas</CardTitle>
              <CardDescription>Baseado nos filtros aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats?.total_visitas_hoje || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atendimentos Ativos</CardTitle>
              <CardDescription>Visitas em andamento agora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats?.visitas_ativas || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visitas Finalizadas</CardTitle>
              <CardDescription>Baseado nos filtros aplicados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats?.visitas_finalizadas_hoje || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesas Ocupadas</CardTitle>
              <CardDescription>Mesas sendo utilizadas agora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats?.mesas_ocupadas || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Espera</CardTitle>
              <CardDescription>Clientes aguardando atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stats?.clientes_lista_espera || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Visitas Finalizadas</CardTitle>
            <CardDescription>
              Histórico completo de visitas finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                  <div>
                    <Label htmlFor="startDate">Data Inicial</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data Final</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="superintendenteFilter">Superintendente</Label>
                    <Select value={superintendenteFilter} onValueChange={setSuperintendenteFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os superintendentes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os superintendentes</SelectItem>
                        {superintendentes.map((sup) => (
                          <SelectItem key={sup} value={sup}>
                            {sup}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="searchTerm">Pesquisar</Label>
                    <Input
                      id="searchTerm"
                      placeholder="Nome, CPF, corretor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={setTodayFilter} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Hoje
                  </Button>
                  <Button variant="outline" onClick={setCurrentMonthFilter} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Mês Atual
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                  <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Corretor</TableHead>
                    <TableHead>Empreendimento</TableHead>
                    <TableHead>Loja</TableHead>
                    <TableHead>Mesa</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">Carregando...</TableCell>
                    </TableRow>
                  ) : filteredVisits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">Nenhuma visita encontrada.</TableCell>
                    </TableRow>
                  ) : (
                    filteredVisits.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium">{visit.cliente_nome}</TableCell>
                        <TableCell>{visit.cliente_cpf}</TableCell>
                        <TableCell>{visit.corretor_nome}</TableCell>
                        <TableCell>{visit.empreendimento || '-'}</TableCell>
                        <TableCell>{visit.loja} - {visit.andar}</TableCell>
                        <TableCell>{visit.mesa}</TableCell>
                        <TableCell>
                          {format(new Date(visit.horario_entrada), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {visit.horario_saida
                            ? format(new Date(visit.horario_saida), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
