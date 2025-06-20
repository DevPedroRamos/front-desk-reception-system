
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CriarLinkDialogProps {
  onLinkCreated: () => void;
}

export function CriarLinkDialog({ onLinkCreated }: CriarLinkDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<string>('');

  // Buscar agendamentos confirmados do corretor
  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ['agendamentos-para-link', user?.id],
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
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id && isOpen
  });

  const criarLinkMutation = useMutation({
    mutationFn: async (agendamentoId: string) => {
      const { data, error } = await supabase.rpc('gerar_token_agendamento', {
        agendamento_uuid: agendamentoId
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (token) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/confirmar-agendamento/${token}`;
      
      // Copiar para área de transferência
      navigator.clipboard.writeText(link).then(() => {
        toast({
          title: "Link criado e copiado!",
          description: "O link de confirmação foi criado e copiado para a área de transferência.",
        });
      }).catch(() => {
        toast({
          title: "Link criado!",
          description: "O link de confirmação foi criado com sucesso.",
        });
      });

      onLinkCreated();
      setIsOpen(false);
      setSelectedAgendamento('');
    },
    onError: (error) => {
      console.error('Erro ao criar link:', error);
      toast({
        title: "Erro ao criar link",
        description: "Não foi possível criar o link de confirmação.",
        variant: "destructive",
      });
    }
  });

  const handleCriarLink = () => {
    if (!selectedAgendamento) {
      toast({
        title: "Selecione um agendamento",
        description: "Por favor, selecione um agendamento para criar o link.",
        variant: "destructive",
      });
      return;
    }

    criarLinkMutation.mutate(selectedAgendamento);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Criar Link de Confirmação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Link de Confirmação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="agendamento">Selecionar Agendamento</Label>
            <Select value={selectedAgendamento} onValueChange={setSelectedAgendamento}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um agendamento..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : agendamentos.length === 0 ? (
                  <SelectItem value="empty" disabled>Nenhum agendamento disponível</SelectItem>
                ) : (
                  agendamentos.map((agendamento) => (
                    <SelectItem key={agendamento.id} value={agendamento.id}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{agendamento.cliente_nome}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                          <Clock className="h-3 w-3" />
                          <span>{agendamento.hora}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-gray-500">
            <p>• O link permitirá que o cliente confirme seus dados</p>
            <p>• O link expira em 7 dias após a criação</p>
            <p>• Será copiado automaticamente para área de transferência</p>
          </div>

          <Button 
            onClick={handleCriarLink}
            disabled={!selectedAgendamento || criarLinkMutation.isPending}
            className="w-full"
          >
            {criarLinkMutation.isPending ? "Criando..." : "Criar Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
