
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCorretorStats } from '@/hooks/useCorretorStats';
import { Users, Clock, Trophy, TrendingUp } from 'lucide-react';

export function MetricasPersonais() {
  const { data: stats, isLoading, error } = useCorretorStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar métricas</p>
      </div>
    );
  }

  const formatTempo = (minutos: number | null) => {
    if (!minutos) return 'N/A';
    if (minutos < 60) return `${Math.round(minutos)}min`;
    const horas = Math.floor(minutos / 60);
    const mins = Math.round(minutos % 60);
    return `${horas}h ${mins}min`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_visitas || 0}</div>
          <p className="text-xs text-muted-foreground">
            Todas as visitas realizadas
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visitas Hoje</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.visitas_hoje || 0}</div>
          <p className="text-xs text-muted-foreground">
            Atendimentos de hoje
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visitas Ativas</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats?.visitas_ativas || 0}</div>
          <p className="text-xs text-muted-foreground">
            Em andamento agora
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTempo(stats?.tempo_medio_minutos)}</div>
          <p className="text-xs text-muted-foreground">
            Por atendimento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
