
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, Users, Star, Gift, CheckCircle, XCircle } from 'lucide-react';

interface DashboardProps {
  pesquisas: any[];
  brindes: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const PesquisaRelatorioDashboard = ({ pesquisas, brindes }: DashboardProps) => {
  const totalPesquisas = pesquisas.length;
  const pesquisasValidadas = pesquisas.filter(p => p.validado).length;
  const totalBrindes = brindes.length;
  const brindesValidados = brindes.filter(b => b.validado).length;
  
  const taxaValidacao = totalPesquisas > 0 ? (pesquisasValidadas / totalPesquisas) * 100 : 0;
  const taxaValidacaoBrindes = totalBrindes > 0 ? (brindesValidados / totalBrindes) * 100 : 0;

  // Dados para gráfico de pesquisas por corretor
  const pesquisasPorCorretor = pesquisas.reduce((acc, pesquisa) => {
    const corretor = pesquisa.corretor_nome || 'Sem corretor';
    acc[corretor] = (acc[corretor] || 0) + 1;
    return acc;
  }, {});

  const dadosGraficoCorretor = Object.entries(pesquisasPorCorretor).map(([nome, quantidade]) => ({
    nome: nome.length > 15 ? nome.substring(0, 15) + '...' : nome,
    quantidade
  }));

  // Dados para gráfico de notas
  const notasDistribuicao = pesquisas.reduce((acc, pesquisa) => {
    if (pesquisa.nota_consultor) {
      acc[pesquisa.nota_consultor] = (acc[pesquisa.nota_consultor] || 0) + 1;
    }
    return acc;
  }, {});

  const dadosGraficoNotas = Object.entries(notasDistribuicao).map(([nota, quantidade]) => ({
    nota: `Nota ${nota}`,
    quantidade,
    fill: COLORS[parseInt(nota) - 1] || COLORS[4]
  }));

  const notaMedia = pesquisas.length > 0 
    ? pesquisas.filter(p => p.nota_consultor).reduce((sum, p) => sum + (p.nota_consultor || 0), 0) / pesquisas.filter(p => p.nota_consultor).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pesquisas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPesquisas}</div>
            <div className="flex items-center mt-2">
              <Badge variant={pesquisasValidadas > 0 ? "default" : "secondary"}>
                {pesquisasValidadas} validadas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Validação</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaValidacao.toFixed(1)}%</div>
            <Progress value={taxaValidacao} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notaMedia.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground mt-2">
              De {pesquisas.filter(p => p.nota_consultor).length} avaliações
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brindes</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBrindes}</div>
            <div className="flex items-center mt-2">
              <Badge variant={brindesValidados > 0 ? "default" : "secondary"}>
                {brindesValidados} validados
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pesquisas por Corretor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoCorretor}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição das Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGraficoNotas}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, quantidade }) => `${nome}: ${quantidade}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {dadosGraficoNotas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
