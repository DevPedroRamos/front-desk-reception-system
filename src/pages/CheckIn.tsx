import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { QrCode, Loader2, CheckCircle } from 'lucide-react';

export default function CheckIn() {
  const [step, setStep] = useState<'cpf' | 'dados' | 'sucesso'>('cpf');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [agendamento, setAgendamento] = useState<any>(null);
  const [checkInData, setCheckInData] = useState({
    loja: '',
    andar: '',
    empreendimento: '',
  });
  const { toast } = useToast();
  const { formatCpf } = useCpfValidation();

  const buscarAgendamento = async () => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: 'CPF inválido',
        description: 'Por favor, digite um CPF válido',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const cpfLimpo = cpf.replace(/\D/g, '');

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('cliente_cpf', cpfLimpo)
        .eq('status', 'confirmado')
        .single();

      if (error || !data) {
        toast({
          title: 'Agendamento não encontrado',
          description: 'Não foi encontrado nenhum agendamento confirmado para este CPF',
          variant: 'destructive',
        });
        return;
      }

      setAgendamento(data);
      setStep('dados');
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar o agendamento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const realizarCheckIn = async () => {
    if (!checkInData.loja || !checkInData.andar) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha a loja e o andar',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Buscar mesa disponível
      const { data: mesasOcupadas } = await supabase
        .from('visits')
        .select('mesa')
        .eq('status', 'ativo');

      const mesasDisponiveis = Array.from({ length: 30 }, (_, i) => i + 1)
        .filter(mesa => !mesasOcupadas?.some(v => v.mesa === mesa));

      if (mesasDisponiveis.length === 0) {
        // Adicionar à lista de espera
        const { error: listaError } = await supabase
          .from('lista_espera')
          .insert({
            cliente_nome: agendamento.cliente_nome,
            cliente_cpf: agendamento.cliente_cpf,
            cliente_whatsapp: agendamento.cliente_telefone,
            corretor_id: agendamento.corretor_id,
            corretor_nome: agendamento.corretor_nome,
            loja: checkInData.loja,
            empreendimento: checkInData.empreendimento,
            status: 'aguardando',
          });

        if (listaError) throw listaError;

        // Atualizar agendamento
        await supabase
          .from('agendamentos')
          .update({
            status: 'check_in',
            checked_in_at: new Date().toISOString(),
            loja: checkInData.loja,
            andar: checkInData.andar,
            empreendimento: checkInData.empreendimento,
          })
          .eq('id', agendamento.id);

        toast({
          title: 'Adicionado à lista de espera',
          description: 'No momento não há mesas disponíveis. Você foi adicionado à lista de espera.',
        });
        setStep('sucesso');
        return;
      }

      const mesaAlocada = mesasDisponiveis[0];

      // Criar visita
      const { error: visitError } = await supabase
        .from('visits')
        .insert({
          corretor_id: agendamento.corretor_id,
          corretor_nome: agendamento.corretor_nome,
          cliente_nome: agendamento.cliente_nome,
          cliente_cpf: agendamento.cliente_cpf,
          cliente_whatsapp: agendamento.cliente_telefone,
          mesa: mesaAlocada,
          loja: checkInData.loja,
          andar: checkInData.andar,
          empreendimento: checkInData.empreendimento,
          status: 'ativo',
        });

      if (visitError) throw visitError;

      // Atualizar agendamento
      await supabase
        .from('agendamentos')
        .update({
          status: 'check_in',
          checked_in_at: new Date().toISOString(),
          mesa: mesaAlocada,
          loja: checkInData.loja,
          andar: checkInData.andar,
          empreendimento: checkInData.empreendimento,
        })
        .eq('id', agendamento.id);

      toast({
        title: 'Check-in realizado!',
        description: `Mesa ${mesaAlocada} alocada com sucesso`,
      });
      setStep('sucesso');
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar o check-in',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            Check-in de Visita
          </CardTitle>
          <CardDescription>
            {step === 'cpf' && 'Digite seu CPF para fazer o check-in'}
            {step === 'dados' && 'Confirme seus dados e complete o check-in'}
            {step === 'sucesso' && 'Check-in realizado com sucesso!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'cpf' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>
              <Button onClick={buscarAgendamento} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar Agendamento'
                )}
              </Button>
            </div>
          )}

          {step === 'dados' && agendamento && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p><strong>Cliente:</strong> {agendamento.cliente_nome}</p>
                <p><strong>Corretor:</strong> {agendamento.corretor_nome}</p>
                <p><strong>Data da Visita:</strong> {new Date(agendamento.data_visita).toLocaleString('pt-BR')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loja">Loja *</Label>
                <Select value={checkInData.loja} onValueChange={(value) => setCheckInData({ ...checkInData, loja: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viva-vista">Viva Vista</SelectItem>
                    <SelectItem value="vc-perto">Viva Casa Perto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="andar">Andar *</Label>
                <Select value={checkInData.andar} onValueChange={(value) => setCheckInData({ ...checkInData, andar: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o andar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="terreo">Térreo</SelectItem>
                    <SelectItem value="primeiro">Primeiro Andar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="empreendimento">Empreendimento</Label>
                <Input
                  id="empreendimento"
                  value={checkInData.empreendimento}
                  onChange={(e) => setCheckInData({ ...checkInData, empreendimento: e.target.value })}
                  placeholder="Nome do empreendimento"
                />
              </div>

              <Button onClick={realizarCheckIn} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Realizando Check-in...
                  </>
                ) : (
                  'Confirmar Check-in'
                )}
              </Button>
            </div>
          )}

          {step === 'sucesso' && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <p className="text-lg font-semibold">Check-in realizado com sucesso!</p>
              <p className="text-muted-foreground">
                Seja bem-vindo! Aguarde ser direcionado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
