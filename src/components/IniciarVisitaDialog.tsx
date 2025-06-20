
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClienteListaEspera {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp: string | null;
  corretor_nome: string | null;
  corretor_id: string | null;
  empreendimento: string | null;
  loja: string;
}

interface AgendamentoCliente {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  whatsapp: string;
  data: string;
  hora: string;
  empreendimento: string;
  status: string;
}

interface IniciarVisitaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteListaEspera;
  onVisitaIniciada: () => void;
}

export function IniciarVisitaDialog({ open, onOpenChange, cliente, onVisitaIniciada }: IniciarVisitaDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    andar: "",
    mesa: "",
  });
  const [clienteSelecionado, setClienteSelecionado] = useState<AgendamentoCliente | null>(null);
  const [tipoAtendimento, setTipoAtendimento] = useState<"lista" | "agendado">("lista");

  // Configuração das lojas
  const lojasConfig = {
    "Loja 1": { mesas: 22, temAndar: false },
    "Loja 2": { mesas: 20, temAndar: true },
    "Loja 3": { mesas: 10, temAndar: false },
    "Loja Superior 37 andar": { mesas: 20, temAndar: false }
  };

  // Buscar visitas ativas para verificar mesas ocupadas
  const { data: visitasAtivas = [] } = useQuery({
    queryKey: ['visitas-ativas-dialog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('mesa, loja, andar')
        .eq('status', 'ativo');
      
      if (error) {
        console.error('Erro ao buscar visitas ativas:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Buscar agendamentos do corretor se houver corretor selecionado
  const { data: agendamentosCorretor = [] } = useQuery({
    queryKey: ['agendamentos-corretor-dialog', cliente.corretor_id],
    queryFn: async () => {
      if (!cliente.corretor_id || cliente.corretor_id === '00000000-0000-0000-0000-000000000000') {
        return [];
      }
      
      const { data, error } = await supabase.rpc('buscar_agendamentos_corretor', {
        corretor_uuid: cliente.corretor_id
      });
      
      if (error) {
        console.error('Erro ao buscar agendamentos do corretor:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!cliente.corretor_id && cliente.corretor_id !== '00000000-0000-0000-0000-000000000000' && open
  });

  // Calcular mesas ocupadas
  const mesasOcupadas = visitasAtivas
    .filter(visita => visita.loja === cliente.loja && 
      (formData.andar === '' || visita.andar === formData.andar || formData.andar === 'N/A'))
    .map(visita => visita.mesa);

  // Limpar andar quando trocar de loja
  useEffect(() => {
    if (cliente.loja && !lojasConfig[cliente.loja as keyof typeof lojasConfig]?.temAndar) {
      setFormData(prev => ({ ...prev, andar: "" }));
    }
  }, [cliente.loja]);

  // Reset ao abrir dialog
  useEffect(() => {
    if (open) {
      setClienteSelecionado(null);
      setTipoAtendimento("lista");
      setFormData({ andar: "", mesa: "" });
    }
  }, [open]);

  // Mutation para iniciar visita
  const iniciarVisitaMutation = useMutation({
    mutationFn: async (visitaData: typeof formData) => {
      const mesaNum = parseInt(visitaData.mesa);
      const maxMesas = getMaxMesas();
      
      if (mesaNum < 1 || mesaNum > maxMesas) {
        throw new Error(`Mesa deve estar entre 1 e ${maxMesas} para ${cliente.loja}`);
      }

      // Dados do cliente a serem usados (da lista de espera ou do agendamento)
      const dadosCliente = clienteSelecionado || {
        cliente_nome: cliente.cliente_nome,
        cliente_cpf: cliente.cliente_cpf,
        cliente_whatsapp: cliente.cliente_whatsapp,
        empreendimento: cliente.empreendimento
      };

      const { data, error } = await supabase
        .from('visits')
        .insert({
          cliente_nome: dadosCliente.cliente_nome || cliente.cliente_nome,
          cliente_cpf: dadosCliente.cliente_cpf || cliente.cliente_cpf,
          cliente_whatsapp: dadosCliente.whatsapp || dadosCliente.cliente_whatsapp || cliente.cliente_whatsapp,
          corretor_nome: cliente.corretor_nome || '',
          corretor_id: cliente.corretor_id || '00000000-0000-0000-0000-000000000000',
          empreendimento: dadosCliente.empreendimento || cliente.empreendimento,
          loja: cliente.loja,
          andar: visitaData.andar || 'N/A',
          mesa: mesaNum,
          status: 'ativo'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado ao iniciar visita:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Visita iniciada!",
        description: `${data.cliente_nome} foi alocado na mesa ${data.mesa}.`,
      });

      onVisitaIniciada();
    },
    onError: (error) => {
      console.error('Erro ao iniciar visita:', error);
      toast({
        title: "Erro ao iniciar visita",
        description: "Ocorreu um erro ao iniciar a visita. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mesa) {
      toast({
        title: "Mesa obrigatória",
        description: "Por favor, selecione uma mesa.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se precisa de andar para Loja 2
    if (cliente.loja === "Loja 2" && !formData.andar) {
      toast({
        title: "Andar obrigatório",
        description: "Para Loja 2, é necessário selecionar o andar.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se a mesa está ocupada
    if (mesasOcupadas.includes(parseInt(formData.mesa))) {
      toast({
        title: "Mesa ocupada",
        description: "Esta mesa já está sendo utilizada. Escolha outra mesa.",
        variant: "destructive",
      });
      return;
    }

    iniciarVisitaMutation.mutate(formData);
  };

  const getMaxMesas = () => {
    if (!cliente.loja) return 0;
    return lojasConfig[cliente.loja as keyof typeof lojasConfig]?.mesas || 0;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Iniciar Visita</DialogTitle>
        </DialogHeader>
        
        <Tabs value={tipoAtendimento} onValueChange={(value) => setTipoAtendimento(value as "lista" | "agendado")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Cliente da Lista</TabsTrigger>
            <TabsTrigger value="agendado" disabled={agendamentosCorretor.length === 0}>
              Cliente Agendado ({agendamentosCorretor.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{cliente.cliente_nome}</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p><strong>CPF:</strong> {cliente.cliente_cpf}</p>
                {cliente.cliente_whatsapp && (
                  <p><strong>WhatsApp:</strong> {cliente.cliente_whatsapp}</p>
                )}
                {cliente.corretor_nome && (
                  <p><strong>Corretor:</strong> {cliente.corretor_nome}</p>
                )}
                <p><strong>Loja:</strong> {cliente.loja}</p>
                {cliente.empreendimento && (
                  <p><strong>Empreendimento:</strong> {cliente.empreendimento}</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="agendado" className="space-y-4">
            <div className="space-y-3">
              <Label>Selecionar Cliente Agendado</Label>
              {agendamentosCorretor.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    clienteSelecionado?.id === agendamento.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setClienteSelecionado(agendamento)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{agendamento.cliente_nome}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{agendamento.hora}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        CPF: {agendamento.cliente_cpf} | WhatsApp: {agendamento.whatsapp}
                      </p>
                      {agendamento.empreendimento && (
                        <p className="text-xs text-gray-500">
                          Interesse: {agendamento.empreendimento}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {cliente.loja === "Loja 2" && (
            <div className="space-y-2">
              <Label htmlFor="andar">Andar *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, andar: value, mesa: "" }))}>
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
          
          <div className="space-y-2">
            <Label htmlFor="mesa">Mesa *</Label>
            <Select 
              onValueChange={(value) => setFormData(prev => ({ ...prev, mesa: value }))}
              disabled={cliente.loja === "Loja 2" && !formData.andar}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a mesa" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: getMaxMesas() }, (_, i) => i + 1).map((mesa) => 
                  renderMesaOption(mesa)
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={iniciarVisitaMutation.isPending || (tipoAtendimento === "agendado" && !clienteSelecionado)}
            >
              {iniciarVisitaMutation.isPending ? "Iniciando..." : "Iniciar Visita"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
