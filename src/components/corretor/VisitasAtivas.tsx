
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock, MapPin, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Visita {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp: string | null;
  loja: string;
  mesa: number;
  andar: string;
  empreendimento: string | null;
  horario_entrada: string;
  status: string;
}

export function VisitasAtivas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: visitasAtivas = [], isLoading } = useQuery({
    queryKey: ['visitas-ativas-corretor', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('User ID não encontrado');
        return [];
      }

      console.log('Buscando visitas ativas para corretor:', user.id);

      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('corretor_id', user.id)
        .eq('status', 'ativo')
        .order('horario_entrada', { ascending: false });

      if (error) {
        console.error('Erro ao buscar visitas ativas:', error);
        throw error;
      }

      console.log('Visitas ativas encontradas:', data);
      return data || [];
    },
    enabled: !!user?.id
  });

  const finalizarVisitaMutation = useMutation({
    mutationFn: async (visitaId: string) => {
      console.log('Finalizando visita:', visitaId);
      const { error } = await supabase.rpc('finalizar_visita', {
        visit_id: visitaId
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visitas-ativas-corretor'] });
      queryClient.invalidateQueries({ queryKey: ['corretor-stats'] });
      queryClient.invalidateQueries({ queryKey: ['visitas-historico-corretor'] });
      toast({
        title: "Visita finalizada!",
        description: "A visita foi finalizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao finalizar visita:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Não foi possível finalizar a visita.",
        variant: "destructive",
      });
    }
  });

  const calcularTempoAtendimento = (horarioEntrada: string) => {
    const entrada = new Date(horarioEntrada);
    const agora = new Date();
    const diffMs = agora.getTime() - entrada.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutos < 60) {
      return `${diffMinutos} min`;
    } else {
      const horas = Math.floor(diffMinutos / 60);
      const minutosRestantes = diffMinutos % 60;
      return `${horas}h ${minutosRestantes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Carregando visitas...</p>
        </div>
      </div>
    );
  }

  console.log('Renderizando VisitasAtivas com', visitasAtivas.length, 'visitas');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Visitas Ativas ({visitasAtivas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visitasAtivas.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma visita ativa no momento</p>
            <p className="text-sm text-gray-400 mt-2">User ID: {user?.id}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visitasAtivas.map((visita) => (
              <Card key={visita.id} className="p-4 border-l-4 border-l-blue-500">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{visita.cliente_nome}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{visita.loja} - Mesa {visita.mesa}</span>
                      {visita.andar !== 'N/A' && <span>({visita.andar})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{format(new Date(visita.horario_entrada), 'HH:mm', { locale: ptBR })}</span>
                    </div>
                    <div className="text-blue-600 font-semibold">
                      Tempo: {calcularTempoAtendimento(visita.horario_entrada)}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p><strong>CPF:</strong> {visita.cliente_cpf}</p>
                    {visita.cliente_whatsapp && (
                      <p><strong>WhatsApp:</strong> {visita.cliente_whatsapp}</p>
                    )}
                    {visita.empreendimento && (
                      <p><strong>Empreendimento:</strong> {visita.empreendimento}</p>
                    )}
                  </div>

                  <div className="pt-3">
                    <Button
                      onClick={() => finalizarVisitaMutation.mutate(visita.id)}
                      disabled={finalizarVisitaMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {finalizarVisitaMutation.isPending ? 'Finalizando...' : 'Finalizar Atendimento'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
