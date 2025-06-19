
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";

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

  // Configuração das lojas
  const lojasConfig = {
    "Loja 1": { mesas: 22, temAndar: false },
    "Loja 2": { mesas: 29, temAndar: true },
    "Loja 3": { mesas: 10, temAndar: false },
    "Loja Superior 37 andar": { mesas: 29, temAndar: false }
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

  // Buscar corretor pela ID para obter o apelido
  const { data: corretorData } = useQuery({
    queryKey: ['corretor', cliente.corretor_id],
    queryFn: async () => {
      if (!cliente.corretor_id || cliente.corretor_id === '00000000-0000-0000-0000-000000000000') {
        return null;
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('apelido')
        .eq('id', cliente.corretor_id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar corretor:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!cliente.corretor_id && cliente.corretor_id !== '00000000-0000-0000-0000-000000000000'
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

  // Função para copiar texto para clipboard
  const copiarParaClipboard = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência.",
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
    }
  };

  // Mutation para iniciar visita
  const iniciarVisitaMutation = useMutation({
    mutationFn: async (visitaData: typeof formData) => {
      // Verificar se mesa está válida antes de inserir
      const mesaNum = parseInt(visitaData.mesa);
      const maxMesas = getMaxMesas();
      
      if (mesaNum < 1 || mesaNum > maxMesas) {
        throw new Error(`Mesa deve estar entre 1 e ${maxMesas}`);
      }

      const { data, error } = await supabase
        .from('visits')
        .insert({
          cliente_nome: cliente.cliente_nome,
          cliente_cpf: cliente.cliente_cpf,
          cliente_whatsapp: cliente.cliente_whatsapp,
          corretor_nome: cliente.corretor_nome || '',
          corretor_id: cliente.corretor_id || '00000000-0000-0000-0000-000000000000',
          empreendimento: cliente.empreendimento,
          loja: cliente.loja,
          andar: visitaData.andar || 'N/A',
          mesa: mesaNum,
          status: 'ativo'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao iniciar visita:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Criar mensagem para copiar
      const primeiroNome = cliente.cliente_nome.split(' ')[0];
      const apelidoCorretor = corretorData?.apelido || cliente.corretor_nome || 'Não definido';
      const mensagem = `Cliente: ${primeiroNome} - Corretor: ${apelidoCorretor} - em espera na ${cliente.loja}`;
      
      // Copiar automaticamente
      copiarParaClipboard(mensagem);

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Visita</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-6">
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
        </div>
        
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
              disabled={iniciarVisitaMutation.isPending}
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
