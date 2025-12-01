import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AddEntregaDialog } from "@/components/entrega/AddEntregaDialog";
import { EntregaStats } from "@/components/entrega/EntregaStats";
import { EntregaFilters } from "@/components/entrega/EntregaFilters";
import { EntregaTable } from "@/components/entrega/EntregaTable";
import { useEntregas } from "@/hooks/useEntregas";
import { format } from "date-fns";

export default function Entregas() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    entregas,
    isLoading,
    stats,
    createEntrega,
    retirarEntrega,
    exportToCSV,
  } = useEntregas({
    startDate,
    endDate,
    status,
    searchTerm,
  });

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatus("todos");
    setSearchTerm("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Entregas</h1>
            <p className="text-muted-foreground">
              Controle de entregas e correspondências
            </p>
          </div>
          <AddEntregaDialog
            onSubmit={(data) => createEntrega.mutate(data)}
            isLoading={createEntrega.isPending}
          />
        </div>

        <EntregaStats stats={stats} />

        <EntregaFilters
          startDate={startDate}
          endDate={endDate}
          status={status}
          searchTerm={searchTerm}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStatusChange={setStatus}
          onSearchChange={setSearchTerm}
          onClear={handleClearFilters}
          onExport={exportToCSV}
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <EntregaTable
            entregas={entregas}
            onRetirar={(data) => retirarEntrega.mutate(data)}
            isLoading={retirarEntrega.isPending}
          />
        )}
      </div>
    </Layout>
  );
}