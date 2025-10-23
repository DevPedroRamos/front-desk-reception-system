import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { RecebimentoStats } from '@/components/recebimento/RecebimentoStats';
import { RecebimentoFilters } from '@/components/recebimento/RecebimentoFilters';
import { RecebimentoTable } from '@/components/recebimento/RecebimentoTable';
import { AddRecebimentoDialog } from '@/components/recebimento/AddRecebimentoDialog';
import { useRecebimentos } from '@/hooks/useRecebimentos';

export default function Recebimento() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [superintendenteFilter, setSuperintendenteFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const {
    recebimentos,
    isLoading,
    stats,
    createRecebimento,
    exportToCSV,
  } = useRecebimentos({
    startDate,
    endDate,
    status: statusFilter,
    superintendente: superintendenteFilter,
    searchTerm,
  });

  // Extrair superintendentes únicos
  const superintendentes = useMemo(() => {
    const unique = Array.from(
      new Set(
        recebimentos
          .map((r) => r.corretor_superintendente)
          .filter((s): s is string => !!s)
      )
    ).sort();
    return unique;
  }, [recebimentos]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSuperintendenteFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Recebimentos</h1>
            <p className="text-muted-foreground">Controle de pagamentos e maquininhas</p>
          </div>
          <AddRecebimentoDialog
            onSubmit={(data) => createRecebimento.mutate(data)}
            isSubmitting={createRecebimento.isPending}
          />
        </div>

        {/* Cards de Estatísticas */}
        <RecebimentoStats stats={stats} />

        {/* Filtros e Ações */}
        <RecebimentoFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          superintendenteFilter={superintendenteFilter}
          onSuperintendenteChange={setSuperintendenteFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={handleClearFilters}
          onExport={exportToCSV}
          superintendentes={superintendentes}
        />

        {/* Tabela */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando recebimentos...
          </div>
        ) : (
          <RecebimentoTable recebimentos={recebimentos} />
        )}
      </div>
    </Layout>
  );
}
