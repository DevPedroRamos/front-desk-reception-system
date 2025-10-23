import { DollarSign, Wallet, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RecebimentoStatsProps {
  stats: {
    totalHoje: number;
    valorTotal: number;
    emUso: number;
    media: number;
  };
}

export function RecebimentoStats({ stats }: RecebimentoStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recebimentos Hoje</p>
              <p className="text-2xl font-bold">{stats.totalHoje}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold">
                R$ {stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Maquininhas em Uso</p>
              <p className="text-2xl font-bold">{stats.emUso}</p>
            </div>
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Média por Entrada</p>
              <p className="text-2xl font-bold">
                R$ {stats.media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
