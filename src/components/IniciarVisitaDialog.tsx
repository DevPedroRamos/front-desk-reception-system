
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { AutoSuggest } from '@/components/AutoSuggest';

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
  const [loja, setLoja] = useState('');
  const [andar, setAndar] = useState('');
  const [mesa, setMesa] = useState('');
  const [empreendimento, setEmpreendimento] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Configuração das lojas (mesma da recepção)
  const lojasConfig = {
    "Loja 1": { mesas: 22, temAndar: false },
    "Loja 2": { mesas: 29, temAndar: true },
    "Loja 3": { mesas: 10, temAndar: false },
    "Loja Superior 37 andar": { mesas: 29, temAndar: false }
  };

  // Buscar empreendimentos para AutoSuggest
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
      
      return data?.map(emp => ({
        id: emp.id,
        name: emp.nome
      })) || [];
    }
  });

  // Buscar visitas ativas para verificar mesas ocupadas
  const { data: visitasAtivas = [] } = useQuery({
    queryKey: ['visitas-ativas-dialog', loja, andar],
    queryFn: async () => {
      if (!loja) return [];
      
      const { data, error } = await supabase
        .from('visits')
        .select('mesa, loja, andar')
        .eq('status', 'ativo')
        .eq('loja', loja);
      
      if (error) {
        console.error('Erro ao buscar visitas ativas:', error);
        return [];
      }
      
      // Filtrar por andar se necessário
      if (loja === "Loja 2" && andar) {
        return data?.filter(v => v.andar === andar) || [];
      }
      
      return data || [];
    },
    enabled: !!loja
  });

  // Calcular mesas ocupadas
  const mesasOcupadas = visitasAtivas.map(visita => visita.mesa);

  // Reset form quando dialog abre/fecha
  useEffect(() => {
    if (isOpen) {
      setLoja('');
      setAndar('');
      setMesa('');
      setEmpreendimento('');
    }
  }, [isOpen]);

  // Limpar andar quando trocar de loja
  useEffect(() => {
    if (loja && !lojasConfig[loja as keyof typeof lojasConfig]?.temAndar) {
      setAndar('');
    }
    setMesa(''); // Sempre limpar mesa quando mudar loja
  }, [loja]);

  // Limpar mesa quando trocar andar
  useEffect(() => {
    setMesa('');
  }, [andar]);

  const getMaxMesas = () => {
    if (!loja) return 0;
    return lojasConfig[loja as keyof typeof lojasConfig]?.mesas || 0;
  };

  const renderMesaOption = (mesa: number) => {
    const isOcupada = mesasOcupadas.includes(mesa);
    return (
      <SelectItem 
        key={mesa} 
        value={mesa.toString()} 
        disabled={isOcupada}
        className={isOcupada ? "opacity-50" : ""}
      >
        <div className="flex items-center gap-2">
          <span>Mesa {mesa}</span>
          {isOcupada && (
            <Badge variant="secondary" className="text-xs">
              Ocupada
            </Badge>
          )}
        </div>
      </SelectItem>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loja || !mesa) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha loja e mesa.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se precisa de andar para Loja 2
    if (loja === "Loja 2" && !andar) {
      toast({
        title: "Andar obrigatório",
        description: "Para Loja 2, é necessário selecionar o andar.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se a mesa está ocupada
    if (mesasOcupadas.includes(parseInt(mesa))) {
      toast({
        title: "Mesa ocupada",
        description: "Esta mesa já está sendo utilizada. Escolha outra mesa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar novamente se a mesa está disponível
      const { data: visitasAtivas, error: checkError } = await supabase
        .from('visits')
        .select('id')
        .eq('loja', loja)
        .eq('andar', andar || 'N/A')
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

      // Criar a visita
      const { error: visitError } = await supabase
        .from('visits')
        .insert({
          cliente_nome: cliente.nome,
          cliente_cpf: cliente.cpf,
          cliente_whatsapp: cliente.whatsapp,
          corretor_id: cliente.corretor_id || '00000000-0000-0000-0000-000000000000',
          corretor_nome: cliente.corretor_nome || '',
          loja,
          andar: andar || 'N/A',
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
        description: `Visita iniciada para ${cliente.nome} na ${loja}, Mesa ${mesa}.`,
      });

      onVisitaIniciada();
      onClose();
      
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
            <Label>Corretor</Label>
            <Input 
              value={cliente.corretor_nome || 'Não informado'} 
              disabled 
              className="bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loja">Loja *</Label>
              <Select value={loja} onValueChange={setLoja}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(lojasConfig).map((lojaKey) => (
                    <SelectItem key={lojaKey} value={lojaKey}>
                      {lojaKey} ({lojasConfig[lojaKey as keyof typeof lojasConfig].mesas} mesas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loja === "Loja 2" && (
              <div>
                <Label htmlFor="andar">Andar *</Label>
                <Select value={andar} onValueChange={setAndar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o andar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Térreo">Térreo</SelectItem>
                    <SelectItem value="Mezanino">Mezanino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="mesa">Mesa *</Label>
            <Select 
              value={mesa} 
              onValueChange={setMesa}
              disabled={!loja || (loja === "Loja 2" && !andar)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a mesa" />
              </SelectTrigger>
              <SelectContent>
                {!loja || (loja === "Loja 2" && !andar) ? (
                  <SelectItem value="placeholder" disabled>
                    {loja === "Loja 2" ? "Selecione o andar primeiro" : "Selecione a loja primeiro"}
                  </SelectItem>
                ) : (
                  Array.from({ length: getMaxMesas() }, (_, i) => i + 1).map((mesaNum) => 
                    renderMesaOption(mesaNum)
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <AutoSuggest
            label="Empreendimento de Interesse"
            placeholder="Digite o nome do empreendimento"
            options={empreendimentos}
            value={empreendimento}
            onValueChange={setEmpreendimento}
          />

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
