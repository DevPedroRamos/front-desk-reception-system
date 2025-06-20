
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LinkGenerator } from './LinkGenerator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, Clock, MapPin, User, X, UserX } from 'lucide-react';

interface Agendamento {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  whatsapp: string;
  data: string;
  hora: string;
  empreendimento: string;
  status: string;
  created_at: string;
}

export function AgendamentosCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos-corretor', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('corretor_id', user.id)
        .in('status', ['confirmado', 'cancelado', 'nao_veio'])
        .order('data', { ascending: true })
        .order('hora', { ascending: true });

      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-corretor'] });
      toast({
        title: "Status atualizado!",
        description: "O status do agendamento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do agendamento.",
        variant: "destructive",
      });
    }
  });

  // Filtrar agendamentos para a data selecionada
  const agendamentosDoSelecionado = selectedDate
    ? agendamentos.filter(ag => ag.data === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  // Criar array de datas que têm agendamentos
  const datasComAgendamentos = agendamentos.map(ag => new Date(ag.data + 'T00:00:00'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'nao_veio': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      case 'nao_veio': return 'Não Veio';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando agendamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendário de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            modifiers={{
              hasAgendamento: datasComAgendamentos
            }}
            modifiersStyles={{
              hasAgendamento: {
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontWeight: 'bold'
              }
            }}
            className="rounded-md border"
          />
          <div className="mt-4 text-sm text-gray-600">
            <p>• Datas em azul possuem agendamentos</p>
            <p>• Clique em uma data para ver os detalhes</p>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos da Data Selecionada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos - {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosDoSelecionado.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {selectedDate ? 'Nenhum agendamento para esta data' : 'Selecione uma data no calendário'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentosDoSelecionado.map((agendamento) => (
                <Card key={agendamento.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-semibold">{agendamento.cliente_nome}</span>
                      </div>
                      <Badge className={getStatusColor(agendamento.status)}>
                        {getStatusLabel(agendamento.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{agendamento.hora}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{agendamento.empreendimento || 'Não especificado'}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><strong>WhatsApp:</strong> {agendamento.whatsapp}</p>
                      <p><strong>CPF:</strong> {agendamento.cliente_cpf}</p>
                    </div>

                    {agendamento.status === 'confirmado' && (
                      <div className="flex gap-2 pt-2">
                        <LinkGenerator 
                          agendamentoId={agendamento.id}
                          onTokenGenerated={() => queryClient.invalidateQueries({ queryKey: ['agendamentos-corretor'] })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: agendamento.id, status: 'cancelado' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: agendamento.id, status: 'nao_veio' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Não Veio
                        </Button>
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
  );
}
