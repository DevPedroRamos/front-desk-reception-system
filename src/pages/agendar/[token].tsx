
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AgendarPage = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_cpf: '',
    whatsapp: '',
    hora: '',
    empreendimento: ''
  });

  // Buscar dados do link
  const { data: linkData, isLoading } = useQuery({
    queryKey: ['link-agendamento', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('corretor_links')
        .select(`
          *,
          users:corretor_id (
            name,
            apelido
          )
        `)
        .eq('token', token)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('Erro ao buscar link:', error);
        throw error;
      }

      return data;
    },
    enabled: !!token
  });

  // Buscar empreendimentos
  const { data: empreendimentos = [] } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('id, nome')
        .order('nome');
      
      if (error) {
        console.error('Erro ao buscar empreendimentos:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Horários disponíveis
  const horariosDisponiveis = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // Mutation para criar agendamento
  const criarAgendamentoMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || !linkData) {
        throw new Error('Data ou corretor não selecionados');
      }

      const agendamentoData = {
        corretor_id: linkData.corretor_id,
        cliente_nome: formData.cliente_nome,
        cliente_cpf: formData.cliente_cpf,
        whatsapp: formData.whatsapp,
        data: format(selectedDate, 'yyyy-MM-dd'),
        hora: formData.hora,
        empreendimento: formData.empreendimento,
        status: 'confirmado',
        origem: 'link_agendamento'
      };

      const { data, error } = await supabase
        .from('agendamentos')
        .insert(agendamentoData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Agendamento confirmado!",
        description: "Seu agendamento foi registrado com sucesso. O corretor entrará em contato.",
      });

      // Limpar formulário
      setFormData({
        cliente_nome: '',
        cliente_cpf: '',
        whatsapp: '',
        hora: '',
        empreendimento: ''
      });
      setSelectedDate(undefined);
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro ao agendar",
        description: "Não foi possível confirmar seu agendamento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data para o agendamento.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cliente_nome || !formData.whatsapp || !formData.hora) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    criarAgendamentoMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-600 mb-2">Link Inválido</h1>
              <p className="text-gray-600">O link de agendamento não foi encontrado ou está inativo.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const corretorNome = linkData.users?.name || 'Corretor';
  const corretorApelido = linkData.users?.apelido || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-2xl">📅</span>
            </div>
            <CardTitle className="text-2xl">Agendar Visita</CardTitle>
            <p className="text-gray-600">
              {linkData.titulo} - Corretor: {corretorNome} {corretorApelido && `(${corretorApelido})`}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Seus Dados</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cliente_nome">Nome Completo *</Label>
                    <Input
                      id="cliente_nome"
                      placeholder="Digite seu nome completo"
                      value={formData.cliente_nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cliente_cpf">CPF</Label>
                    <Input
                      id="cliente_cpf"
                      placeholder="000.000.000-00"
                      value={formData.cliente_cpf}
                      onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      placeholder="(00) 00000-0000"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empreendimento">Empreendimento de Interesse</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um empreendimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {empreendimentos.map((emp) => (
                          <SelectItem key={emp.id} value={emp.nome}>
                            {emp.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Data e hora */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Data e Horário</h3>
                  
                  <div className="space-y-2">
                    <Label>Data da Visita *</Label>
                    <div className="border rounded-lg p-3">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ptBR}
                        disabled={(date) => date < new Date()}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hora">Horário *</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, hora: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {horariosDisponiveis.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={criarAgendamentoMutation.isPending}
                >
                  {criarAgendamentoMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
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
