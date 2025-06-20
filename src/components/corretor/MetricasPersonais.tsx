
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCorretorStats } from '@/hooks/useCorretorStats';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Clock, Users, TrendingUp, Calendar } from 'lucide-react';

export function MetricasPersonais() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useCorretorStats(user?.id || null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatarTempo = (minutos: number | null) => {
    if (!minutos) return '0 min';
    
    if (minutos < 60) {
      return `${Math.round(minutos)} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = Math.round(minutos % 60);
      return `${horas}h ${mins}m`;
    }
  };

  const metricas = [
    {
      title: 'Total de Visitas',
      value: stats?.total_visitas || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Visitas Ativas',
      value: stats?.visitas_ativas || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Visitas Hoje',
      value: stats?.visitas_hoje || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Tempo Médio',
      value: formatarTempo(stats?.tempo_medio_minutos),
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Agendamentos',
      value: stats?.agendamentos_confirmados || 0,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricas.map((metrica, index) => {
        const Icon = metrica.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metrica.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metrica.bgColor}`}>
                <Icon className={`h-4 w-4 ${metrica.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrica.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrica.title === 'Agendamentos' ? 'Confirmados' : 'Histórico geral'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
