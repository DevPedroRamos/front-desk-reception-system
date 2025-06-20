
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, User, Phone, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CorretorData {
  id: string;
  name: string;
  apelido: string;
}

const AgendarPage = () => {
  const { token } = useParams();
  const { toast } = useToast();
  
  const [corretorData, setCorretorData] = useState<CorretorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [clienteNome, setClienteNome] = useState('');
  const [clienteCpf, setClienteCpf] = useState('');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [empreendimento, setEmpreendimento] = useState('');

  useEffect(() => {
    const buscarCorretor = async () => {
      if (!token) return;

      try {
        console.log('Buscando corretor para token:', token);
        
        const { data: linkData, error: linkError } = await supabase
          .from('corretor_links')
          .select(`
            corretor_id,
            users!corretor_links_corretor_id_fkey (
              id,
              name,
              apelido
            )
          `)
          .eq('token', token)
          .eq('ativo', true)
          .single();

        if (linkError) {
          console.error('Erro ao buscar link:', linkError);
          toast({
            title: "Link inválido",
            description: "O link de agendamento não foi encontrado ou expirou.",
            variant: "destructive",
          });
          return;
        }

        if (linkData && linkData.users) {
          const corretor = Array.isArray(linkData.users) ? linkData.users[0] : linkData.users;
          setCorretorData({
            id: corretor.id,
            name: corretor.name,
            apelido: corretor.apelido
          });
        }

      } catch (error) {
        console.error('Erro ao buscar corretor:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar os dados do corretor.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    buscarCorretor();
  }, [token, toast]);

  const horarios = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const empreendimentos = [
    'Residencial Jardim das Flores',
    'Condomínio Vila Verde',
    'Edifício Metropolitan',
    'Residencial Park View',
    'Condomínio Bella Vista'
  ];

  const formatarCPF = (valor: string) => {
    const numbers = valor.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return valor;
  };

  const formatarWhatsApp = (valor: string) => {
    const numbers = valor.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return valor;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clienteNome || !clienteCpf || !clienteWhatsapp || !selectedDate || !selectedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!corretorData) {
      toast({
        title: "Erro",
        description: "Dados do corretor não encontrados.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('agendamentos')
        .insert({
          cliente_nome: clienteNome,
          cliente_cpf: clienteCpf.replace(/\D/g, ''),
          whatsapp: clienteWhatsapp.replace(/\D/g, ''),
          data: format(selectedDate, 'yyyy-MM-dd'),
          hora: selectedTime,
          corretor_id: corretorData.id,
          empreendimento: empreendimento || null,
          status: 'confirmado',
          origem: 'link_agendamento',
          link_token: token
        });

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        toast({
          title: "Erro ao agendar",
          description: "Ocorreu um erro ao criar o agendamento. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Agendamento confirmado!",
        description: `Seu agendamento foi confirmado para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime} com ${corretorData.apelido || corretorData.name}.`,
      });

      // Reset form
      setClienteNome('');
      setClienteCpf('');
      setClienteWhatsapp('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setEmpreendimento('');

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!corretorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Link Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>O link de agendamento não foi encontrado ou expirou.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
              Agendar Visita
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Agende sua visita com {corretorData.apelido || corretorData.name}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seus Dados
                </h3>
                
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={clienteCpf}
                    onChange={(e) => setClienteCpf(formatarCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    value={clienteWhatsapp}
                    onChange={(e) => setClienteWhatsapp(formatarWhatsApp(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Data e horário */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Data e Horário
                </h3>
                
                <div>
                  <Label>Data *</Label>
                  <div className="mt-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      locale={ptBR}
                      className="rounded-md border w-fit"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="horario">Horário *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((horario) => (
                        <SelectItem key={horario} value={horario}>
                          {horario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Empreendimento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Interesse
                </h3>
                
                <div>
                  <Label htmlFor="empreendimento">Empreendimento de Interesse</Label>
                  <Select value={empreendimento} onValueChange={setEmpreendimento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um empreendimento (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Não especificado</SelectItem>
                      {empreendimentos.map((emp) => (
                        <SelectItem key={emp} value={emp}>
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
                disabled={submitting}
              >
                {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgendarPage;
