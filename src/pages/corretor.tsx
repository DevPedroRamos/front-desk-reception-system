import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Clock, Building2, Link } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { VisitCard } from "@/components/VisitCard";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LinkGenerator } from "@/components/corretor/LinkGenerator";
import { CriarLinkDialog } from "@/components/corretor/CriarLinkDialog";

const Corretor = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar agendamentos confirmados do corretor
  const { data: agendamentosConfirmados = [], isLoading: agendamentosConfirmadosLoading, refetch: refetchAgendamentosConfirmados } = useQuery({
    queryKey: ['agendamentos-confirmados-corretor', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('corretor_id', user.id)
        .eq('status', 'confirmado')
        .gte('data', new Date().toISOString().split('T')[0]) // Apenas agendamentos futuros
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

  // Buscar agendamentos do dia
  const { data: agendamentos = [], isLoading: agendamentosLoading, refetch: refetchAgendamentos } = useQuery({
    queryKey: ['agendamentos-hoje'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('data', hoje)
        .order('hora', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Buscar visitas ativas
  const { data: visitasAtivas = [], isLoading: visitasLoading, refetch: refetchVisitas } = useQuery({
    queryKey: ['visitas-ativas-corretor'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('status', 'ativo')
        .order('horario_entrada', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar visitas ativas:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Configurar tempo real
  useEffect(() => {
    const channel = supabase
      .channel('corretor-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos'
        },
        () => {
          refetchAgendamentos();
          refetchAgendamentosConfirmados();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visits'
        },
        () => {
          refetchVisitas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchAgendamentos, refetchVisitas, refetchAgendamentosConfirmados]);

  // Função para finalizar visita
  const handleFinalizarVisita = async (visitId: string) => {
    try {
      const { error } = await supabase.rpc('finalizar_visita', { visit_id: visitId });
      
      if (error) {
        console.error('Erro ao finalizar visita:', error);
        toast({
          title: "Erro ao finalizar visita",
          description: "Ocorreu um erro ao finalizar a visita. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Visita finalizada!",
        description: "A visita foi finalizada com sucesso.",
      });

      refetchVisitas();
    } catch (error) {
      console.error('Erro ao finalizar visita:', error);
      toast({
        title: "Erro ao finalizar visita",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (agendamentosLoading || visitasLoading || agendamentosConfirmadosLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Área do Corretor</h1>
            <p className="text-slate-600">Gerencie seus agendamentos e atendimentos</p>
          </div>
        </div>

        {/* Links de Confirmação */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Links de Confirmação
              </CardTitle>
              <CriarLinkDialog onLinkCreated={() => refetchAgendamentosConfirmados()} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Gere links de confirmação para seus agendamentos confirmados:
            </p>
            {agendamentosConfirmados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Nenhum agendamento confirmado encontrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {agendamentosConfirmados.map((agendamento) => (
                  <div key={agendamento.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agendamento.cliente_nome}</span>
                        <Badge variant="outline">{agendamento.data} - {agendamento.hora}</Badge>
                      </div>
                      <div className="text-sm text-slate-600">
                        <span>CPF: {agendamento.cliente_cpf}</span>
                        {agendamento.empreendimento && (
                          <span className="ml-4">Empreendimento: {agendamento.empreendimento}</span>
                        )}
                      </div>
                    </div>
                    <LinkGenerator 
                      agendamentoId={agendamento.id}
                      onTokenGenerated={() => refetchAgendamentosConfirmados()}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agendamentos de Hoje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agendamentos de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agendamentos.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Nenhum agendamento para hoje.
                </p>
              ) : (
                <div className="space-y-3">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{agendamento.cliente_nome}</h3>
                        <Badge variant="outline">{agendamento.hora}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p><strong>CPF:</strong> {agendamento.cliente_cpf}</p>
                        <p><strong>WhatsApp:</strong> {agendamento.whatsapp}</p>
                        {agendamento.empreendimento && (
                          <p><strong>Interesse:</strong> {agendamento.empreendimento}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atendimentos Ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Atendimentos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitasAtivas.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Nenhum atendimento ativo no momento.
                </p>
              ) : (
                <div className="space-y-4">
                  {visitasAtivas.map((visita) => (
                    <VisitCard
                      key={visita.id}
                      visit={visita}
                      onFinalize={handleFinalizarVisita}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Corretor;
