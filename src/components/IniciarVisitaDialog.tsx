
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  whatsapp?: string;
  corretor_id?: string;
  corretor_nome?: string;
}

interface IniciarVisitaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onVisitaIniciada: () => void;
}

export function IniciarVisitaDialog({ isOpen, onClose, cliente, onVisitaIniciada }: IniciarVisitaDialogProps) {
  const [corretor, setCorretor] = useState('');
  const [loja, setLoja] = useState('');
  const [andar, setAndar] = useState('');
  const [mesa, setMesa] = useState('');
  const [empreendimento, setEmpreendimento] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar corretores
  const { data: corretores = [] } = useQuery({
    queryKey: ['corretores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, apelido, cpf')
        .eq('role', 'corretor')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar corretores:', error);
        return [];
      }
      return data || [];
    }
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
      console.log('Empreendimentos carregados:', data);
      return data || [];
    }
  });

  // Buscar mesas disponíveis baseado na loja e andar selecionados
  const { data: mesasDisponiveis = [] } = useQuery({
    queryKey: ['mesas-disponiveis', loja, andar],
    queryFn: async () => {
      if (!loja || !andar) return [];
      
      try {
        // Buscar mesas ocupadas
        const { data: mesasOcupadas, error } = await supabase
          .from('visits')
          .select('mesa')
          .eq('loja', loja)
          .eq('andar', andar)
          .eq('status', 'ativo');

        if (error) {
          console.error('Erro ao buscar mesas ocupadas:', error);
          return [];
        }

        // Gerar lista de mesas de 1 a 50 e filtrar as ocupadas
        const todasMesas = Array.from({ length: 50 }, (_, i) => i + 1);
        const ocupadas = mesasOcupadas?.map(m => m.mesa) || [];
        
        return todasMesas.filter(mesa => !ocupadas.includes(mesa));
      } catch (error) {
        console.error('Erro ao buscar mesas:', error);
        return [];
      }
    },
    enabled: !!loja && !!andar
  });

  // Pré-preencher dados quando vem da lista de espera
  useEffect(() => {
    if (isOpen && cliente) {
      console.log('Cliente selecionado:', cliente);
      
      // Se cliente tem corretor_id, pré-selecionar
      if (cliente.corretor_id) {
        console.log('Pre-preenchendo corretor:', cliente.corretor_id, cliente.corretor_nome);
        setCorretor(cliente.corretor_id);
      }
      
      // Reset outros campos
      setLoja('');
      setAndar('');
      setMesa('');
      setEmpreendimento('');
    }
  }, [cliente, isOpen]);

  // Reset do select de mesa quando loja/andar mudam
  useEffect(() => {
    setMesa('');
  }, [loja, andar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!corretor || !loja || !andar || !mesa) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar se a mesa está disponível
      const { data: visitasAtivas, error: checkError } = await supabase
        .from('visits')
        .select('id')
        .eq('loja', loja)
        .eq('andar', andar)
        .eq('mesa', parseInt(mesa))
        .eq('status', 'ativo');

      if (checkError) {
        console.error('Erro ao verificar mesa:', checkError);
        toast({
          title: "Erro ao verificar mesa",
          description: "Ocorreu um erro ao verificar disponibilidade da mesa.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (visitasAtivas && visitasAtivas.length > 0) {
        toast({
          title: "Mesa ocupada",
          description: "Esta mesa já está sendo utilizada.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Buscar dados do corretor selecionado
      const corretorSelecionado = corretores.find(c => c.id === corretor);
      
      if (!corretorSelecionado) {
        toast({
          title: "Erro",
          description: "Corretor não encontrado.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Criar a visita
      const { error: visitError } = await supabase
        .from('visits')
        .insert({
          cliente_nome: cliente.nome,
          cliente_cpf: cliente.cpf,
          cliente_whatsapp: cliente.whatsapp,
          corretor_id: corretor,
          corretor_nome: corretorSelecionado.apelido || corretorSelecionado.name,
          loja,
          andar,
          mesa: parseInt(mesa),
          empreendimento: empreendimento || null,
          status: 'ativo'
        });

      if (visitError) {
        console.error('Erro ao iniciar visita:', visitError);
        toast({
          title: "Erro ao iniciar visita",
          description: "Ocorreu um erro ao iniciar a visita. Tente novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Atualizar status na lista de espera
      const { error: updateError } = await supabase
        .from('lista_espera')
        .update({ status: 'atendido' })
        .eq('id', cliente.id);

      if (updateError) {
        console.error('Erro ao atualizar lista de espera:', updateError);
      }

      toast({
        title: "Visita iniciada!",
        description: `Visita iniciada para ${cliente.nome} com ${corretorSelecionado.apelido || corretorSelecionado.name}.`,
      });

      onVisitaIniciada();
      onClose();
      
      // Reset form
      setCorretor('');
      setLoja('');
      setAndar('');
      setMesa('');
      setEmpreendimento('');
      
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Iniciar Visita</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <Input 
              value={`${cliente.nome} - ${cliente.cpf}`} 
              disabled 
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="corretor">Corretor *</Label>
            <Select value={corretor} onValueChange={setCorretor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o corretor" />
              </SelectTrigger>
              <SelectContent>
                {corretores.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.apelido}) - CPF: {c.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loja">Loja *</Label>
              <Select value={loja} onValueChange={setLoja}>
                <SelectTrigger>
                  <SelectValue placeholder="Loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Loja 1">Loja 1</SelectItem>
                  <SelectItem value="Loja 2">Loja 2</SelectItem>
                  <SelectItem value="Loja 3">Loja 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="andar">Andar *</Label>
              <Select value={andar} onValueChange={setAndar}>
                <SelectTrigger>
                  <SelectValue placeholder="Andar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Térreo">Térreo</SelectItem>
                  <SelectItem value="1º Andar">1º Andar</SelectItem>
                  <SelectItem value="2º Andar">2º Andar</SelectItem>
                  <SelectItem value="3º Andar">3º Andar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="mesa">Mesa *</Label>
            <Select value={mesa} onValueChange={setMesa}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma mesa" />
              </SelectTrigger>
              <SelectContent>
                {!loja || !andar ? (
                  <SelectItem value="placeholder" disabled>
                    Selecione loja e andar primeiro
                  </SelectItem>
                ) : mesasDisponiveis.length === 0 ? (
                  <SelectItem value="no-mesas" disabled>
                    Nenhuma mesa disponível
                  </SelectItem>
                ) : (
                  mesasDisponiveis.map((mesaNum) => (
                    <SelectItem key={mesaNum} value={mesaNum.toString()}>
                      Mesa {mesaNum}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="empreendimento">Empreendimento de Interesse</Label>
            <Select value={empreendimento} onValueChange={setEmpreendimento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um empreendimento (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {empreendimentos.length === 0 ? (
                  <SelectItem value="no-empreendimentos" disabled>
                    Nenhum empreendimento cadastrado
                  </SelectItem>
                ) : (
                  empreendimentos.map((emp) => (
                    <SelectItem key={emp.id} value={emp.nome}>
                      {emp.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Iniciando...' : 'Iniciar Visita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
