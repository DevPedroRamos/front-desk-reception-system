
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Trophy, Medal, Award, X } from 'lucide-react';

interface CorretorRanking {
  corretor_id: string;
  corretor_nome: string;
  total_visitas: number;
  posicao: number;
}

interface GerenteRanking {
  gerente: string;
  total_visitas: number;
  posicao: number;
}

interface SuperintendenciaRanking {
  superintendente: string;
  total_visitas: number;
  posicao: number;
}

export default function Podio() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [topCorretores, setTopCorretores] = useState<CorretorRanking[]>([]);
  const [topGerentes, setTopGerentes] = useState<GerenteRanking[]>([]);
  const [topSuperintendencias, setTopSuperintendencias] = useState<SuperintendenciaRanking[]>([]);

  const loadRankings = async () => {
    try {
      setLoading(true);

      // Buscar top corretores
      let corretoresQuery = supabase
        .from('visits')
        .select(`
          corretor_id,
          corretor_nome,
          users!visits_corretor_id_fkey(name)
        `);

      if (startDate) {
        corretoresQuery = corretoresQuery.gte('horario_entrada', startDate);
      }
      if (endDate) {
        corretoresQuery = corretoresQuery.lte('horario_entrada', endDate + 'T23:59:59');
      }

      const { data: corretoresData, error: corretoresError } = await corretoresQuery;
      
      if (corretoresError) throw corretoresError;

      // Agrupar por corretor e contar visitas
      const corretoresMap = new Map<string, { nome: string; count: number }>();
      
      corretoresData?.forEach(visit => {
        const key = visit.corretor_id;
        const nome = visit.corretor_nome;
        
        if (corretoresMap.has(key)) {
          corretoresMap.get(key)!.count++;
        } else {
          corretoresMap.set(key, { nome, count: 1 });
        }
      });

      const corretoresRanking = Array.from(corretoresMap.entries())
        .map(([id, data], index) => ({
          corretor_id: id,
          corretor_nome: data.nome,
          total_visitas: data.count,
          posicao: index + 1
        }))
        .sort((a, b) => b.total_visitas - a.total_visitas)
        .slice(0, 10)
        .map((item, index) => ({ ...item, posicao: index + 1 }));

      setTopCorretores(corretoresRanking);

      // Buscar top gerentes
      let gerentesQuery = supabase
        .from('visits')
        .select(`
          corretor_id,
          users!visits_corretor_id_fkey(gerente)
        `);

      if (startDate) {
        gerentesQuery = gerentesQuery.gte('horario_entrada', startDate);
      }
      if (endDate) {
        gerentesQuery = gerentesQuery.lte('horario_entrada', endDate + 'T23:59:59');
      }

      const { data: gerentesData, error: gerentesError } = await gerentesQuery;
      
      if (gerentesError) throw gerentesError;

      // Agrupar por gerente
      const gerentesMap = new Map<string, number>();
      
      gerentesData?.forEach(visit => {
        const gerente = (visit.users as any)?.gerente;
        if (gerente) {
          gerentesMap.set(gerente, (gerentesMap.get(gerente) || 0) + 1);
        }
      });

      const gerentesRanking = Array.from(gerentesMap.entries())
        .map(([gerente, count]) => ({
          gerente,
          total_visitas: count,
          posicao: 0
        }))
        .sort((a, b) => b.total_visitas - a.total_visitas)
        .slice(0, 3)
        .map((item, index) => ({ ...item, posicao: index + 1 }));

      setTopGerentes(gerentesRanking);

      // Buscar top superintendências
      let superintendenciasQuery = supabase
        .from('visits')
        .select(`
          corretor_id,
          users!visits_corretor_id_fkey(superintendente)
        `);

      if (startDate) {
        superintendenciasQuery = superintendenciasQuery.gte('horario_entrada', startDate);
      }
      if (endDate) {
        superintendenciasQuery = superintendenciasQuery.lte('horario_entrada', endDate + 'T23:59:59');
      }

      const { data: superintendenciasData, error: superintendenciasError } = await superintendenciasQuery;
      
      if (superintendenciasError) throw superintendenciasError;

      // Agrupar por superintendência
      const superintendenciasMap = new Map<string, number>();
      
      superintendenciasData?.forEach(visit => {
        const superintendente = (visit.users as any)?.superintendente;
        if (superintendente) {
          superintendenciasMap.set(superintendente, (superintendenciasMap.get(superintendente) || 0) + 1);
        }
      });

      const superintendenciasRanking = Array.from(superintendenciasMap.entries())
        .map(([superintendente, count]) => ({
          superintendente,
          total_visitas: count,
          posicao: 0
        }))
        .sort((a, b) => b.total_visitas - a.total_visitas)
        .slice(0, 3)
        .map((item, index) => ({ ...item, posicao: index + 1 }));

      setTopSuperintendencias(superintendenciasRanking);

    } catch (error) {
      console.error('Error loading rankings:', error);
      toast.error('Erro ao carregar rankings');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-sm font-bold text-slate-600">{position}</span>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  useEffect(() => {
    loadRankings();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando rankings...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">🏆 Pódio de Vendas</h1>
            <p className="text-slate-600">Rankings dos melhores performers</p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Rankings */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top 10 Corretores */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top 10 Corretores
                </CardTitle>
                <CardDescription>
                  Corretores com mais visitas no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topCorretores.map((corretor) => (
                    <div
                      key={corretor.corretor_id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${getPositionColor(corretor.posicao)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getPositionIcon(corretor.posicao)}
                        <div>
                          <p className="font-semibold text-slate-900">{corretor.corretor_nome}</p>
                          <p className="text-sm text-slate-600">#{corretor.posicao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{corretor.total_visitas}</p>
                        <p className="text-sm text-slate-600">visitas</p>
                      </div>
                    </div>
                  ))}
                  {topCorretores.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum dado encontrado para o período selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Top 3 Gerentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-blue-500" />
                  Top 3 Gerentes
                </CardTitle>
                <CardDescription>
                  Gerentes com mais visitas no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topGerentes.map((gerente) => (
                    <div
                      key={gerente.gerente}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${getPositionColor(gerente.posicao)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getPositionIcon(gerente.posicao)}
                        <div>
                          <p className="font-semibold text-slate-900">{gerente.gerente}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">{gerente.total_visitas}</p>
                        <p className="text-xs text-slate-600">visitas</p>
                      </div>
                    </div>
                  ))}
                  {topGerentes.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Nenhum dado encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top 3 Superintendências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-500" />
                  Top 3 Superintendências
                </CardTitle>
                <CardDescription>
                  Superintendências com mais visitas no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topSuperintendencias.map((superintendencia) => (
                    <div
                      key={superintendencia.superintendente}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 ${getPositionColor(superintendencia.posicao)}`}
                    >
                      <div className="flex items-center gap-3">
                        {getPositionIcon(superintendencia.posicao)}
                        <div>
                          <p className="font-semibold text-slate-900">{superintendencia.superintendente}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">{superintendencia.total_visitas}</p>
                        <p className="text-xs text-slate-600">visitas</p>
                      </div>
                    </div>
                  ))}
                  {topSuperintendencias.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Nenhum dado encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
