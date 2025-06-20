
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendamentoData {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  whatsapp: string;
  data: string;
  hora: string;
  empreendimento: string;
  status: string;
  corretor_nome: string;
}

const ConfirmarAgendamento = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    cpf: '',
    empreendimento: ''
  });

  // Buscar dados do agendamento pelo token
  const { data: agendamento, isLoading, error } = useQuery({
    queryKey: ['agendamento-token', token],
    queryFn: async () => {
      if (!token) return null;

      // Primeiro buscar o token
      const { data: tokenData, error: tokenError } = await supabase
        .from('agendamento_tokens')
        .select(`
          agendamento_id,
          expires_at,
          used,
          agendamentos (
            id,
            cliente_nome,
            cliente_cpf,
            whatsapp,
            data,
            hora,
            empreendimento,
            status,
            corretor_id,
            users (name)
          )
        `)
        .eq('token', token)
        .single();

      if (tokenError) {
        console.error('Erro ao buscar token:', tokenError);
        throw new Error('Token inválido ou expirado');
      }

      // Verificar se o token expirou
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Token expirado');
      }

      // Verificar se já foi usado
      if (tokenData.used) {
        throw new Error('Este link já foi utilizado');
      }

      const agendamentoInfo = tokenData.agendamentos as any;
      return {
        ...agendamentoInfo,
        corretor_nome: agendamentoInfo.users?.name || 'Não informado'
      };
    },
    enabled: !!token
  });

  // Preencher formulário com dados existentes
  useEffect(() => {
    if (agendamento) {
      setFormData({
        nome: agendamento.cliente_nome || '',
        whatsapp: agendamento.whatsapp || '',
        cpf: agendamento.cliente_cpf || '',
        empreendimento: agendamento.empreendimento || ''
      });
    }
  }, [agendamento]);

  // Mutation para confirmar agendamento
  const confirmarMutation = useMutation({
    mutationFn: async (dadosCliente: typeof formData) => {
      if (!token || !agendamento) throw new Error('Dados inválidos');

      // Atualizar dados do agendamento
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({
          cliente_nome: dadosCliente.nome,
          whatsapp: dadosCliente.whatsapp,
          cliente_cpf: dadosCliente.cpf,
          empreendimento: dadosCliente.empreendimento || agendamento.empreendimento,
          status: 'confirmado'
        })
        .eq('id', agendamento.id);

      if (updateError) throw updateError;

      // Marcar token como usado
      const { error: tokenError } = await supabase
        .from('agendamento_tokens')
        .update({ used: true })
        .eq('token', token);

      if (tokenError) throw tokenError;
    },
    onSuccess: () => {
      setConfirmed(true);
      toast({
        title: "Agendamento confirmado!",
        description: "Seus dados foram atualizados com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao confirmar agendamento:', error);
      toast({
        title: "Erro ao confirmar",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.whatsapp || !formData.cpf) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    confirmarMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando agendamento...</p>
        </div>
      </div>
    );
  }

  if (error || !agendamento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {error?.message || 'Este link não é válido ou expirou.'}
            </p>
            <p className="text-sm text-gray-500">
              Entre em contato com seu corretor para obter um novo link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-green-600 flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Confirmado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Seu agendamento foi confirmado com sucesso!
            </p>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(agendamento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{agendamento.hora}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Corretor: {agendamento.corretor_nome}</span>
                </div>
                {formData.empreendimento && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.empreendimento}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Você receberá um lembrete próximo à data do agendamento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Confirmar Agendamento</CardTitle>
            <p className="text-center text-gray-600">
              Por favor, confirme seus dados para finalizar o agendamento
            </p>
          </CardHeader>
          <CardContent>
            {/* Informações do Agendamento */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">Detalhes do Agendamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{format(new Date(agendamento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{agendamento.hora}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Corretor: {agendamento.corretor_nome}</span>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="empreendimento">Empreendimento de Interesse</Label>
                  <Input
                    id="empreendimento"
                    value={formData.empreendimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, empreendimento: e.target.value }))}
                    placeholder="Nome do empreendimento (opcional)"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={confirmarMutation.isPending}
                >
                  {confirmarMutation.isPending ? "Confirmando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmarAgendamento;
