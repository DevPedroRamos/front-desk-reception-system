import { AnalyticsCard } from './AnalyticsCard';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';

interface MetricsData {
  totalVisitas: number;
  visitasHoje: number;
  visitasAtivas: number;
  tempoMedio: number;
  taxaConversao: number;
  crescimentoSemanal: number;
  metaMensal: number;
  performanceGeral: number;
}

interface MetricsGridProps {
  data: MetricsData;
  isLoading?: boolean;
}

export function MetricsGrid({ data, isLoading }: MetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AnalyticsCard
        title="Total de Visitas"
        value={data.totalVisitas}
        description="Todas as visitas registradas"
        icon={Users}
        trend={{
          value: data.crescimentoSemanal,
          label: "vs semana anterior",
          isPositive: data.crescimentoSemanal > 0
        }}
        variant="gradient"
      />
      
      <AnalyticsCard
        title="Visitas Hoje"
        value={data.visitasHoje}
        description="Atendimentos de hoje"
        icon={Calendar}
        trend={{
          value: 12,
          label: "vs ontem",
          isPositive: true
        }}
      />
      
      <AnalyticsCard
        title="Atendimentos Ativos"
        value={data.visitasAtivas}
        description="Em andamento agora"
        icon={Activity}
        className="border-green-200 dark:border-green-800"
      />
      
      <AnalyticsCard
        title="Tempo Médio"
        value={`${data.tempoMedio}min`}
        description="Por atendimento"
        icon={Clock}
        trend={{
          value: -5,
          label: "vs média anterior",
          isPositive: true
        }}
      />
      
      <AnalyticsCard
        title="Taxa de Conversão"
        value={`${data.taxaConversao}%`}
        description="Visitas que resultaram em vendas"
        icon={Target}
        trend={{
          value: 8,
          label: "vs mês anterior",
          isPositive: true
        }}
        variant="gradient"
      />
      
      <AnalyticsCard
        title="Meta Mensal"
        value={`${data.metaMensal}%`}
        description="Progresso da meta"
        icon={Award}
        className="border-blue-200 dark:border-blue-800"
      />
      
      <AnalyticsCard
        title="Performance Geral"
        value={`${data.performanceGeral}%`}
        description="Índice de performance"
        icon={TrendingUp}
        trend={{
          value: 15,
          label: "vs período anterior",
          isPositive: true
        }}
      />
      
      <AnalyticsCard
        title="Análise Preditiva"
        value="Excelente"
        description="Tendência para próxima semana"
        icon={BarChart3}
        variant="gradient"
      />
    </div>
  );
}