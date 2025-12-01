import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle } from "lucide-react";

interface EntregaStatsProps {
  stats?: {
    totalHoje: number;
    aguardando: number;
    finalizadas: number;
  };
}

export function EntregaStats({ stats }: EntregaStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalHoje || 0}</div>
          <p className="text-xs text-muted-foreground">Entregas registradas hoje</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aguardando Retirada</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.aguardando || 0}</div>
          <p className="text-xs text-muted-foreground">Entregas pendentes</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Finalizadas Hoje</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.finalizadas || 0}</div>
          <p className="text-xs text-muted-foreground">Entregas retiradas hoje</p>
        </CardContent>
      </Card>
    </div>
  );
}