
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Clock, Building2, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { VisitCard } from "@/components/VisitCard";
import { useToast } from "@/hooks/use-toast";

const Corretor = () => {
  const { toast } = useToast();

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
  }, [refetchAgendamentos, refetchVisitas]);

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

  const gerarLinkIndicacao = (nomeCorretor: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/cliente?corretor=${encodeURIComponent(nomeCorretor)}`;
  };

  const copiarLink = (nomeCorretor: string) => {
    const link = gerarLinkIndicacao(nomeCorretor);
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "O link de indicação foi copiado para a área de transferência.",
    });
  };

  if (agendamentosLoading || visitasLoading) {
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

        {/* Links de Indicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Links de Indicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              Gere links personalizados para seus clientes agendarem visitas:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">João Silva:</span>
                <Button 
                  size="sm" 
                  onClick={() => copiarLink("João Silva")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Copiar Link
                </Button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium">Maria Santos:</span>
                <Button 
                  size="sm" 
                  onClick={() => copiarLink("Maria Santos")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Copiar Link
                </Button>
              </div>
            </div>
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
