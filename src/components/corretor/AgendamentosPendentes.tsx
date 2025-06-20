
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, User, Calendar, Copy, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function AgendamentosPendentes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agendamentosPendentes = [], isLoading } = useQuery({
    queryKey: ['agendamentos-pendentes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          agendamento_tokens (
            token,
            used,
            expires_at
          )
        `)
        .eq('corretor_id', user.id)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar agendamentos pendentes:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id
  });

  const deletarAgendamentoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-pendentes'] });
      toast({
        title: "Agendamento removido",
        description: "Agendamento foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao remover agendamento:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o agendamento.",
        variant: "destructive",
      });
    }
  });

  const copiarLinkConfirmacao = (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/confirmar-agendamento/${token}`;
    
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link de confirmação foi copiado para a área de transferência.",
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando agendamentos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Agendamentos Pendentes de Confirmação
        </CardTitle>
      </CardHeader>
      <CardContent>
        {agendamentosPendentes.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum agendamento pendente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentosPendentes.map((agendamento) => {
              const token = agendamento.agendamento_tokens?.[0];
              const isExpired = token && new Date(token.expires_at) < new Date();
              
              return (
                <Card key={agendamento.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{agendamento.cliente_nome}</span>
                        <Badge variant="outline">Pendente</Badge>
                        {isExpired && <Badge variant="destructive">Expirado</Badge>}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{agendamento.hora}</span>
                          </div>
                        </div>
                        <p className="mt-1">CPF: {agendamento.cliente_cpf}</p>
                        {agendamento.empreendimento && (
                          <p>Empreendimento: {agendamento.empreendimento}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {token && !isExpired && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copiarLinkConfirmacao(token.token)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar Link
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletarAgendamentoMutation.mutate(agendamento.id)}
                        disabled={deletarAgendamentoMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
