import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { Calendar, Clock, User, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Agendamentos() {
  const { agendamentos, loading } = useAgendamentos();

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pendente: { label: 'Pendente', variant: 'secondary' as const },
      confirmado: { label: 'Confirmado', variant: 'default' as const },
      check_in: { label: 'Check-in', variant: 'default' as const },
      finalizado: { label: 'Finalizado', variant: 'outline' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
    };
    const { label, variant } = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <p>Carregando agendamentos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os agendamentos de visitas</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agendamentos.map((agendamento) => (
            <Card key={agendamento.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{agendamento.cliente_nome || 'Aguardando confirmação'}</CardTitle>
                  {getStatusBadge(agendamento.status)}
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {agendamento.corretor_apelido || agendamento.corretor_nome}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {agendamento.cliente_cpf && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>CPF: {agendamento.cliente_cpf}</span>
                  </div>
                )}
                {agendamento.cliente_telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{agendamento.cliente_telefone}</span>
                  </div>
                )}
                {agendamento.data_visita && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(agendamento.data_visita), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Criado em {format(new Date(agendamento.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {agendamento.mesa && (
                  <div className="mt-2 p-2 bg-primary/10 rounded">
                    <strong>Mesa:</strong> {agendamento.mesa}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {agendamentos.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</p>
              <p className="text-muted-foreground">Os agendamentos aparecerão aqui quando forem criados</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
