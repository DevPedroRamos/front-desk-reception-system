
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link2, Copy, Calendar, User } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

export function GerarLinkConfirmacao() {
  const { toast } = useToast();
  const { userProfile } = useUserRole();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteCpf: '',
    data: '',
    hora: '',
    empreendimento: ''
  });

  const criarAgendamentoMutation = useMutation({
    mutationFn: async (dados: typeof formData) => {
      if (!userProfile?.cpf) {
        throw new Error('CPF do corretor não encontrado');
      }

      // Buscar dados do corretor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, apelido')
        .eq('cpf', userProfile.cpf)
        .single();

      if (userError || !userData) {
        throw new Error('Dados do corretor não encontrados');
      }

      // Criar agendamento
      const { data: agendamento, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          cliente_nome: dados.clienteNome,
          cliente_cpf: dados.clienteCpf,
          data: dados.data,
          hora: dados.hora,
          empreendimento: dados.empreendimento,
          corretor_id: userData.id,
          status: 'pendente',
          whatsapp: ''
        })
        .select('id')
        .single();

      if (agendamentoError) {
        throw agendamentoError;
      }

      // Gerar token de confirmação
      const { data: token, error: tokenError } = await supabase.rpc('gerar_token_agendamento', {
        agendamento_uuid: agendamento.id
      });

      if (tokenError) {
        throw tokenError;
      }

      return { token, agendamento, corretor: userData };
    },
    onSuccess: ({ token }) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/confirmar-agendamento/${token}`;
      
      navigator.clipboard.writeText(link).then(() => {
        toast({
          title: "Link de confirmação criado!",
          description: "O link foi copiado para a área de transferência. Envie para o cliente confirmar.",
        });
      }).catch(() => {
        toast({
          title: "Link criado!",
          description: `Link: ${link}`,
        });
      });

      // Limpar formulário
      setFormData({
        clienteNome: '',
        clienteCpf: '',
        data: '',
        hora: '',
        empreendimento: ''
      });

      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos'] });
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteNome || !formData.clienteCpf || !formData.data || !formData.hora) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    criarAgendamentoMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Gerar Link de Confirmação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clienteNome">Nome do Cliente *</Label>
              <Input
                id="clienteNome"
                value={formData.clienteNome}
                onChange={(e) => setFormData(prev => ({ ...prev, clienteNome: e.target.value }))}
                placeholder="Nome completo do cliente"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="clienteCpf">CPF do Cliente *</Label>
              <Input
                id="clienteCpf"
                value={formData.clienteCpf}
                onChange={(e) => setFormData(prev => ({ ...prev, clienteCpf: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="hora">Horário *</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="empreendimento">Empreendimento</Label>
              <Input
                id="empreendimento"
                value={formData.empreendimento}
                onChange={(e) => setFormData(prev => ({ ...prev, empreendimento: e.target.value }))}
                placeholder="Nome do empreendimento (opcional)"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={criarAgendamentoMutation.isPending}
          >
            {criarAgendamentoMutation.isPending ? "Criando..." : "Gerar Link de Confirmação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
