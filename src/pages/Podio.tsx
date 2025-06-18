
import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Trophy, Crown, Medal, Star, Calendar } from 'lucide-react';

interface CorretorRanking {
  corretor_nome: string;
  corretor_id: string;
  total_visitas: number;
  gerente: string;
  superintendente: string;
}

interface GerenteRanking {
  gerente: string;
  total_visitas: number;
  superintendente: string;
}

interface SuperintendenciaRanking {
  superintendente: string;
  total_visitas: number;
}

export default function Podio() {
  const [corretoresRanking, setCorretoresRanking] = useState<CorretorRanking[]>([]);
  const [gerentesRanking, setGerentesRanking] = useState<GerenteRanking[]>([]);
  const [superintendenciasRanking, setSuperintendenciasRanking] = useState<SuperintendenciaRanking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros de data
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadCorretoresRanking = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          corretor_nome,
          corretor_id,
          users!visits_corretor_id_fkey(gerente, superintendente)
        `);

      // Aplicar filtros de data
      if (startDate) {
        query = query.gte('horario_entrada', startDate);
      }
      if (endDate) {
        query = query.lte('horario_entrada', endDate + 'T23:59:59');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        // Agrupar por corretor e contar visitas
        const corretorStats = data.reduce((acc: any, visit: any) => {
          const key = visit.corretor_id;
          if (!acc[key]) {
            acc[key] = {
              corretor_nome: visit.corretor_nome,
              corretor_id: visit.corretor_id,
              total_visitas: 0,
              gerente: visit.users?.gerente || '',
              superintendente: visit.users?.superintendente || ''
            };
          }
          acc[key].total_visitas++;
          return acc;
        }, {});

        const ranking = Object.values(corretorStats)
          .sort((a: any, b: any) => b.total_visitas - a.total_visitas)
          .slice(0, 10);

        setCorretoresRanking(ranking as CorretorRanking[]);
      }
    } catch (error) {
      console.error('Error loading corretores ranking:', error);
      toast.error('Erro ao carregar ranking de corretores');
    }
  };

  const loadGerentesRanking = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          users!visits_corretor_id_fkey(gerente, superintendente)
        `);

      // Aplicar filtros de data
      if (startDate) {
        query = query.gte('horario_entrada', startDate);
      }
      if (endDate) {
        query = query.lte('horario_entrada', endDate + 'T23:59:59');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        // Agrupar por gerente e contar visitas
        const gerenteStats = data.reduce((acc: any, visit: any) => {
          const gerente = visit.users?.gerente;
          if (gerente) {
            if (!acc[gerente]) {
              acc[gerente] = {
                gerente,
                total_visitas: 0,
                superintendente: visit.users?.superintendente || ''
              };
            }
            acc[gerente].total_visitas++;
          }
          return acc;
        }, {});

        const ranking = Object.values(gerenteStats)
          .sort((a: any, b: any) => b.total_visitas - a.total_visitas)
          .slice(0, 3);

        setGerentesRanking(ranking as GerenteRanking[]);
      }
    } catch (error) {
      console.error('Error loading gerentes ranking:', error);
      toast.error('Erro ao carregar ranking de gerentes');
    }
  };

  const loadSuperintendenciasRanking = async () => {
    try {
      let query = supabase
        .from('visits')
        .select(`
          users!visits_corretor_id_fkey(superintendente)
        `);

      // Aplicar filtros de data
      if (startDate) {
        query = query.gte('horario_entrada', startDate);
      }
      if (endDate) {
        query = query.lte('horario_entrada', endDate + 'T23:59:59');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        // Agrupar por superintendência e contar visitas
        const superintendenciaStats = data.reduce((acc: any, visit: any) => {
          const superintendente = visit.users?.superintendente;
          if (superintendente) {
            if (!acc[superintendente]) {
              acc[superintendente] = {
                superintendente,
                total_visitas: 0
              };
            }
            acc[superintendente].total_visitas++;
          }
          return acc;
        }, {});

        const ranking = Object.values(superintendenciaStats)
          .sort((a: any, b: any) => b.total_visitas - a.total_visitas)
          .slice(0, 3);

        setSuperintendenciasRanking(ranking as SuperintendenciaRanking[]);
      }
    } catch (error) {
      console.error('Error loading superintendencias ranking:', error);
      toast.error('Erro ao carregar ranking de superintendências');
    }
  };

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Trophy className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankingColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadCorretoresRanking(),
        loadGerentesRanking(),
        loadSuperintendenciasRanking()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Carregando pódio...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">🏆 Pódio</h1>
            <p className="text-slate-600">Ranking dos melhores performers</p>
          </div>
        </div>

        {/* Filtros de Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Filtros de Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Top 10 Corretores */}
          <div className="lg:col-span-2 xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top 10 Corretores
                </CardTitle>
                <CardDescription>
                  Corretores com mais visitas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {corretoresRanking.map((corretor, index) => (
                    <div
                      key={corretor.corretor_i}
                      className={`p-4 rounded-lg border-2 ${getRankingColor(index + 1)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-700">
                              #{index + 1}
                            </span>
                            {getRankingIcon(index + 1)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {corretor.corretor_nome}
                            </p>
                            <p className="text-sm text-slate-600">
                              {corretor.gerente} • {corretor.superintendente}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            {corretor.total_visitas}
                          </p>
                          <p className="text-sm text-slate-600">
                            visitas
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {corretoresRanking.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum dado encontrado para o período selecionado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top 3 Gerentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-blue-500" />
                Top 3 Gerentes
              </CardTitle>
              <CardDescription>
                Gerentes com mais visitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gerentesRanking.map((gerente, index) => (
                  <div
                    key={gerente.gerente}
                    className={`p-4 rounded-lg border-2 ${getRankingColor(index + 1)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-slate-700">
                            #{index + 1}
                          </span>
                          {getRankingIcon(index + 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {gerente.gerente}
                          </p>
                          <p className="text-sm text-slate-600">
                            {gerente.superintendente}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          {gerente.total_visitas}
                        </p>
                        <p className="text-sm text-slate-600">
                          visitas
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {gerentesRanking.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
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
                <Crown className="w-5 h-5 text-purple-500" />
                Top 3 Superintendências
              </CardTitle>
              <CardDescription>
                Superintendências com mais visitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {superintendenciasRanking.map((superintendencia, index) => (
                  <div
                    key={superintendencia.superintendente}
                    className={`p-4 rounded-lg border-2 ${getRankingColor(index + 1)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-slate-700">
                            #{index + 1}
                          </span>
                          {getRankingIcon(index + 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {superintendencia.superintendente}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-900">
                          {superintendencia.total_visitas}
                        </p>
                        <p className="text-sm text-slate-600">
                          visitas
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {superintendenciasRanking.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum dado encontrado
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
