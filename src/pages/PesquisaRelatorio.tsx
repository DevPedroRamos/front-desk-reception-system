
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PesquisaRelatorioDashboard } from '@/components/pesquisa-relatorio/PesquisaRelatorioDashboard';
import { PesquisaRelatorioTabela } from '@/components/pesquisa-relatorio/PesquisaRelatorioTabela';
import { PesquisaRelatorioFilters } from '@/components/pesquisa-relatorio/PesquisaRelatorioFilters';
import { usePesquisasData, useBrindesData, useCorretores, PesquisaFilters } from '@/hooks/usePesquisasData';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, FileText, Filter } from 'lucide-react';

const PesquisaRelatorio = () => {
  const [filters, setFilters] = useState<PesquisaFilters>({});
  
  const { data: pesquisas = [], isLoading: isLoadingPesquisas, refetch: refetchPesquisas } = usePesquisasData(filters);
  const { data: brindes = [], isLoading: isLoadingBrindes, refetch: refetchBrindes } = useBrindesData(filters);
  const { data: corretores = [] } = useCorretores();

  const handleUpdate = () => {
    refetchPesquisas();
    refetchBrindes();
  };

  const isLoading = isLoadingPesquisas || isLoadingBrindes;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios de Pesquisa de Satisfação</h1>
            <p className="text-muted-foreground">
              Gerencie e analise as pesquisas de satisfação e validação de brindes
            </p>
          </div>
          
          <PesquisaRelatorioFilters 
            filters={filters}
            onFiltersChange={setFilters}
            corretores={corretores}
          />
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PesquisaRelatorioDashboard pesquisas={pesquisas} brindes={brindes} />
          </TabsContent>

          <TabsContent value="relatorios">
            <PesquisaRelatorioTabela pesquisas={pesquisas} />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Analytics em desenvolvimento. Esta seção conterá gráficos avançados e insights detalhados.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PesquisaRelatorio;
