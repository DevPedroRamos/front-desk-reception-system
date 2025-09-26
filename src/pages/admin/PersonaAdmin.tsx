import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { PersonaAdminFilters } from '@/components/admin/PersonaAdminFilters';
import { PersonaAdminTable } from '@/components/admin/PersonaAdminTable';
import { PersonaResponseModal } from '@/components/admin/PersonaResponseModal';
import { PersonaAdminStats } from '@/components/admin/PersonaAdminStats';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Users, BarChart3 } from 'lucide-react';
import { usePersonaAdminData, PersonaFilters, PersonaAdminData } from '@/hooks/usePersonaAdminData';
import { toast } from '@/hooks/use-toast';

export default function PersonaAdmin() {
  const [filters, setFilters] = useState<PersonaFilters>({});
  const [selectedResponse, setSelectedResponse] = useState<PersonaAdminData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, error } = usePersonaAdminData(filters, currentPage, pageSize);

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleViewResponse = (response: PersonaAdminData) => {
    setSelectedResponse(response);
  };

  const handleExportCSV = async (type: 'filtered' | 'all' | 'superintendencia' | 'gerente') => {
    try {
      let exportFilters = filters;
      
      if (type === 'all') {
        exportFilters = {};
      } else if (type === 'superintendencia' && !filters.superintendencia) {
        toast({
          title: "Erro",
          description: "Selecione uma superintendência para exportar.",
          variant: "destructive"
        });
        return;
      } else if (type === 'gerente' && !filters.gerente) {
        toast({
          title: "Erro", 
          description: "Selecione um gerente para exportar.",
          variant: "destructive"
        });
        return;
      }

      // Here you would implement the actual CSV export logic
      // For now, just show a success message
      toast({
        title: "Exportação iniciada",
        description: "O arquivo CSV será baixado em breve.",
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <AdminProtectedRoute>
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar dados</h1>
              <p className="text-muted-foreground">Não foi possível carregar os questionários de persona.</p>
            </div>
          </div>
        </AdminProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminProtectedRoute>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Administração – Questionários de Persona
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie e analise os questionários de persona submetidos pelos usuários
              </p>
            </div>
          </div>

          <Separator />

          {/* Filters */}
          <PersonaAdminFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Export Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportCSV('filtered')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download CSV (Filtros Aplicados)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportCSV('all')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download CSV (Todos os Registros)
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportCSV('superintendencia')}
              className="flex items-center gap-2"
              disabled={!filters.superintendencia}
            >
              <Download className="h-4 w-4" />
              Download por Superintendência
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportCSV('gerente')}
              className="flex items-center gap-2"
              disabled={!filters.gerente}
            >
              <Download className="h-4 w-4" />
              Download por Gerente
            </Button>
          </div>

          {/* Results Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Resultados</h2>
              {data && (
                <p className="text-sm text-muted-foreground">
                  Mostrando {data.data.length} de {data.count} registros
                </p>
              )}
            </div>
            
            <PersonaAdminTable
              data={data?.data || []}
              loading={isLoading}
              onViewResponse={handleViewResponse}
            />
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Relatórios Rápidos</h2>
            </div>
            <PersonaAdminStats />
          </div>

          {/* Response Modal */}
          <PersonaResponseModal
            isOpen={!!selectedResponse}
            onClose={() => setSelectedResponse(null)}
            response={selectedResponse}
          />
        </div>
      </AdminProtectedRoute>
    </Layout>
  );
}