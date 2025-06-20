
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, Building2 } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AgendarPage = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_cpf: '',
    whatsapp: '',
    data: '',
    hora: '',
    empreendimento: ''
  });

  // Buscar dados do link e corretor
  const { data: linkData, isLoading, error } = useQuery({
    queryKey: ['link-agendamento', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data: linkInfo, error: linkError } = await supabase
        .from('corretor_links')
        .select(`
          *,
          corretor:users!corretor_links_corretor_id_fkey (
            name,
            apelido
          )
        `)
        .eq('token', token)
        .eq('ativo', true)
        .single();
      
      if (linkError) {
        throw linkError;
      }
      
      return linkInfo;
    },
    enabled: !!token
  });

  // Buscar empreendimentos
  const { data: empreendimentos = [] } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('*')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar empreendimentos:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const agendarMutation = useMutation({
    mutationFn: async (dadosAgendamento: typeof formData) => {
      if (!linkData) throw new Error('Link não encontrado');
      
      const { data, error } = await supabase
        .from('agendamentos')
        .insert({
          cliente_nome: dadosAgendamento.cliente_nome,
          cliente_cpf: dadosAgendamento.cliente_cpf,
          whatsapp: dadosAgendamento.whatsapp,
          data: dadosAgendamento.data,
          hora: dadosAgendamento.hora,
          empreendimento: dadosAgendamento.empreendimento,
          corretor_id: linkData.corretor_id,
          origem: 'link_agendamento',
          link_token: token,
          status: 'confirmado'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi realizado com sucesso. Aguarde o contato do corretor.",
      });
      
      // Limpar formulário
      setFormData({
        cliente_nome: '',
        cliente_cpf: '',
        whatsapp: '',
        data: '',
        hora: '',
        empreendimento: ''
      });
    },
    onError: (error) => {
      console.error('Erro ao agendar:', error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || !formData.cliente_cpf || !formData.whatsapp || 
        !formData.data || !formData.hora || !formData.empreendimento) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    agendarMutation.mutate(formData);
  };

  // Gerar opções de data (próximos 30 dias, exceto domingos)
  const gerarOpcoesData = () => {
    const opcoes = [];
    const hoje = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const data = addDays(hoje, i);
      if (data.getDay() !== 0) { // Excluir domingos
        opcoes.push({
          value: format(data, 'yyyy-MM-dd'),
          label: format(data, "EEEE, dd/MM/yyyy", { locale: ptBR })
        });
      }
    }
    
    return opcoes;
  };

  // Gerar opções de horário (9h às 18h)
  const gerarOpcoesHorario = () => {
    const opcoes = [];
    
    for (let hora = 9; hora <= 18; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horario = format(setMinutes(setHours(new Date(), hora), minuto), 'HH:mm');
        opcoes.push({
          value: horario,
          label: horario
        });
      }
    }
    
    return opcoes;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (error || !linkData) {
    return <Navigate to="/" replace />;
  }

  const nomeCorretor = linkData.corretor?.name || linkData.corretor?.apelido || 'Corretor';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Agendar Visita</CardTitle>
            <p className="text-gray-600">
              Agende sua visita com {nomeCorretor}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_nome">Nome Completo *</Label>
                  <Input
                    id="cliente_nome"
                    value={formData.cliente_nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cliente_cpf">CPF *</Label>
                  <Input
                    id="cliente_cpf"
                    value={formData.cliente_cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <Label htmlFor="empreendimento">Empreendimento de Interesse *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o empreendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {empreendimentos.map((emp) => (
                      <SelectItem key={emp.id} value={emp.nome}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {emp.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, data: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a data" />
                    </SelectTrigger>
                    <SelectContent>
                      {gerarOpcoesData().map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          {opcao.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="hora">Horário *</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, hora: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {gerarOpcoesHorario().map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {opcao.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={agendarMutation.isPending}
              >
                {agendarMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgendarPage;
