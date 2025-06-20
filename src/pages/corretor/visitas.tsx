
import { Layout } from '@/components/Layout';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { VisitasAtivas } from '@/components/corretor/VisitasAtivas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Users, History, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisitaHistorico {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  loja: string;
  mesa: number;
  andar: string;
  empreendimento: string | null;
  horario_entrada: string;
  horario_saida: string | null;
  status: string;
}

const VisitasCorretor = () => {
  const { user } = useAuth();

  const { data: visitasHistorico = [], isLoading } = useQuery({
    queryKey: ['visitas-historico-corretor', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('corretor_id', user.id)
        .eq('status', 'finalizado')
        .order('horario_entrada', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Erro ao buscar histórico de visitas:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const calcularDuracaoVisita = (entrada: string, saida: string | null) => {
    if (!saida) return 'Em andamento';
    
    const entradaDate = new Date(entrada);
    const saidaDate = new Date(saida);
    const diffMs = saidaDate.getTime() - entradaDate.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutos < 60) {
      return `${diffMinutos} min`;
    } else {
      const horas = Math.floor(diffMinutos / 60);
      const minutosRestantes = diffMinutos % 60;
      return `${horas}h ${minutosRestantes}m`;
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['corretor']}>
      <Layout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Minhas Visitas</h1>
              <p className="text-slate-600">Acompanhe suas visitas ativas e histórico</p>
            </div>
          </div>

          {/* Visitas Ativas */}
          <VisitasAtivas />

          {/* Histórico de Visitas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Visitas Finalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm">Carregando histórico...</p>
                  </div>
                </div>
              ) : visitasHistorico.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma visita finalizada ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visitasHistorico.map((visita) => (
                    <Card key={visita.id} className="p-4 border-l-4 border-l-gray-300">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{visita.cliente_nome}</h3>
                          <Badge className="bg-gray-100 text-gray-800">
                            Finalizada
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{visita.loja} - Mesa {visita.mesa}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>
                              {format(new Date(visita.horario_entrada), 'dd/MM HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600 font-semibold">
                              Duração: {calcularDuracaoVisita(visita.horario_entrada, visita.horario_saida)}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            CPF: {visita.cliente_cpf}
                          </div>
                        </div>

                        {visita.empreendimento && (
                          <div className="text-sm text-gray-600">
                            <p><strong>Empreendimento:</strong> {visita.empreendimento}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
};

export default VisitasCorretor;
