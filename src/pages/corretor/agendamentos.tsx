
import { Layout } from '@/components/Layout';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GerarLinkConfirmacao } from '@/components/corretor/GerarLinkConfirmacao';
import { AgendamentosPendentes } from '@/components/corretor/AgendamentosPendentes';
import { CriarLinkDialog } from '@/components/corretor/CriarLinkDialog';
import { GerenciarLinks } from '@/components/corretor/GerenciarLinks';
import { Calendar, Link, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AgendamentosCorretor = () => {
  const { user } = useAuth();

  // Buscar agendamentos confirmados
  const { data: agendamentosConfirmados = [] } = useQuery({
    queryKey: ['agendamentos-confirmados', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('corretor_id', user.id)
        .eq('status', 'confirmado')
        .gte('data', new Date().toISOString().split('T')[0])
        .order('data', { ascending: true })
        .order('hora', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar agendamentos confirmados:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  return (
    <RoleProtectedRoute allowedRoles={['corretor']}>
      <Layout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Meus Agendamentos</h1>
              <p className="text-slate-600">Gerencie agendamentos e envie links de confirmação para clientes</p>
            </div>
          </div>

          {/* Gerar Link de Confirmação */}
          <GerarLinkConfirmacao />

          {/* Agendamentos Pendentes */}
          <AgendamentosPendentes />

          {/* Links de Agendamento Direto */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Links de Agendamento Direto
                </CardTitle>
                <CriarLinkDialog onLinkCreated={() => {}} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                Crie links para que clientes possam agendar visitas diretamente:
              </p>
              <GerenciarLinks />
            </CardContent>
          </Card>

          {/* Agendamentos Confirmados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Próximos Agendamentos Confirmados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agendamentosConfirmados.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum agendamento confirmado encontrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agendamentosConfirmados.map((agendamento) => (
                    <div key={agendamento.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agendamento.cliente_nome}</span>
                          <Badge variant="outline">
                            {format(new Date(agendamento.data), "dd/MM", { locale: ptBR })} - {agendamento.hora}
                          </Badge>
                          {agendamento.origem === 'link_agendamento' && (
                            <Badge variant="secondary">Via Link</Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          <span>CPF: {agendamento.cliente_cpf}</span>
                          <span className="ml-4">WhatsApp: {agendamento.whatsapp}</span>
                          {agendamento.empreendimento && (
                            <span className="ml-4">Empreendimento: {agendamento.empreendimento}</span>
                          )}
                        </div>
                      </div>
                    </div>
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

export default AgendamentosCorretor;
