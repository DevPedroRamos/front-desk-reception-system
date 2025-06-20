
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Calendar, User } from 'lucide-react';

const AgendarPage = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    data: '',
    hora: ''
  });

  // Dados do corretor vindos da URL
  const corretorApelido = searchParams.get('apelido') || '';
  const corretorId = searchParams.get('corretor_id') || '';

  // Mutation para confirmar agendamento
  const confirmarMutation = useMutation({
    mutationFn: async (dadosAgendamento: typeof formData) => {
      if (!token || !corretorId) throw new Error('Dados inválidos');

      // Verificar se o link ainda está ativo
      const { data: linkData, error: linkError } = await supabase
        .from('corretor_links')
        .select('ativo')
        .eq('token', token)
        .eq('corretor_id', corretorId)
        .single();

      if (linkError || !linkData?.ativo) {
        throw new Error('Link inválido ou inativo');
      }

      // Criar o agendamento
      const { error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          cliente_nome: dadosAgendamento.nome,
          cliente_cpf: dadosAgendamento.cpf,
          email: dadosAgendamento.email,
          whatsapp: '', // Pode ser adicionado depois se necessário
          data: dadosAgendamento.data,
          hora: dadosAgendamento.hora,
          empreendimento: 'A definir',
          corretor_id: corretorId,
          status: 'confirmado',
          origem: 'link_agendamento',
          link_token: token
        });

      if (agendamentoError) throw agendamentoError;
    },
    onSuccess: () => {
      setConfirmed(true);
      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao confirmar agendamento:', error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf || !formData.email || !formData.data || !formData.hora) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    confirmarMutation.mutate(formData);
  };

  if (!corretorApelido || !corretorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Este link não é válido ou está incompleto.
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
              Agendamento Confirmado!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Seu agendamento foi confirmado com sucesso!
            </p>
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Corretor: {corretorApelido}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formData.data} às {formData.hora}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Você receberá uma confirmação no seu email e o corretor entrará em contato.
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
            <CardTitle className="text-center">Agendar Visita</CardTitle>
            <p className="text-center text-gray-600">
              Complete seus dados para agendar uma visita
            </p>
          </CardHeader>
          <CardContent>
            {/* Informações do Corretor */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-3">Seu Corretor</h3>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{corretorApelido}</span>
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
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="data">Data Preferida *</Label>
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
                  <Label htmlFor="hora">Horário Preferido *</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                    required
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

export default AgendarPage;
