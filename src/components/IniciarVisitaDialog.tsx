
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AutoSuggest } from '@/components/AutoSuggest';

interface IniciarVisitaDialogProps {
  onVisitaIniciada: () => void;
}

export function IniciarVisitaDialog({ onVisitaIniciada }: IniciarVisitaDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_cpf: "",
    cliente_whatsapp: "",
    corretor_nome: "",
    empreendimento: "",
    loja: "",
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

  // Buscar corretores
  const { data: corretores = [] } = useQuery({
    queryKey: ['corretores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, apelido')
        .eq('role', 'corretor');
      
      if (error) {
        console.error('Erro ao buscar corretores:', error);
        return [];
      }
      
      return data?.map(corretor => ({
        id: corretor.id,
        name: `${corretor.name} (${corretor.apelido})`
      })) || [];
    }
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
      
      return data?.map(emp => ({
        id: emp.id,
        name: emp.nome
      })) || [];
    }
  });

  // Buscar visitas ativas para verificar mesas ocupadas
  const { data: visitasAtivas = [] } = useQuery({
    queryKey: ['visitas-ativas'],
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

  // Mutation para criar nova visita
  const createVisitMutation = useMutation({
    mutationFn: async (visitData: typeof formData) => {
      // Buscar ID do corretor se foi informado
      let corretor_id = null;
      if (visitData.corretor_nome) {
        const { data: corretorData } = await supabase
          .from('users')
          .select('id')
          .or(`name.ilike.%${visitData.corretor_nome.split(' (')[0]}%,apelido.ilike.%${visitData.corretor_nome}%`)
          .limit(1)
          .single();
        
        corretor_id = corretorData?.id || null;
      }

      // Usar CPF padrão se não foi preenchido
      const cpfFinal = visitData.cliente_cpf.trim() || "00000000000";

      const { data, error } = await supabase
        .from('visits')
        .insert({
          cliente_nome: visitData.cliente_nome,
          cliente_cpf: cpfFinal,
          cliente_whatsapp: visitData.cliente_whatsapp || null,
          corretor_nome: visitData.corretor_nome || '',
          corretor_id: corretor_id || '00000000-0000-0000-0000-000000000000',
          empreendimento: visitData.empreendimento || null,
          loja: visitData.loja,
          andar: visitData.andar || 'N/A',
          mesa: parseInt(visitData.mesa),
          status: 'ativo'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar visita:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Visita iniciada!",
        description: `Cliente ${data.cliente_nome} foi registrado na mesa ${data.mesa}.`,
      });

      // Limpar formulário
      setFormData({
        cliente_nome: "",
        cliente_cpf: "",
        cliente_whatsapp: "",
        corretor_nome: "",
        empreendimento: "",
        loja: "",
        andar: "",
        mesa: "",
      });

      setIsOpen(false);
      onVisitaIniciada();
      queryClient.invalidateQueries({ queryKey: ['visitas-ativas'] });
    },
    onError: (error) => {
      console.error('Erro ao iniciar visita:', error);
      toast({
        title: "Erro ao iniciar visita",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Calcular mesas ocupadas
  const mesasOcupadas = visitasAtivas
    .filter(visita => visita.loja === formData.loja && 
      (formData.andar === '' || visita.andar === formData.andar || formData.andar === 'N/A'))
    .map(visita => visita.mesa);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || !formData.mesa || !formData.loja) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (formData.loja === "Loja 2" && !formData.andar) {
      toast({
        title: "Andar obrigatório",
        description: "Para Loja 2, é necessário selecionar o andar.",
        variant: "destructive",
      });
      return;
    }

    if (mesasOcupadas.includes(parseInt(formData.mesa))) {
      toast({
        title: "Mesa ocupada",
        description: "Esta mesa já está sendo utilizada. Escolha outra mesa.",
        variant: "destructive",
      });
      return;
    }

    createVisitMutation.mutate(formData);
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

  const getMaxMesas = () => {
    if (!formData.loja) return 0;
    return lojasConfig[formData.loja as keyof typeof lojasConfig]?.mesas || 0;
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        Iniciar Nova Visita
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Iniciar Nova Visita</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                <Input
                  id="cliente_nome"
                  placeholder="Digite o nome do cliente"
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
                <Label htmlFor="cliente_whatsapp">WhatsApp</Label>
                <Input
                  id="cliente_whatsapp"
                  placeholder="(00) 00000-0000"
                  value={formData.cliente_whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_whatsapp: e.target.value }))}
                />
              </div>

              <AutoSuggest
                label="Corretor"
                placeholder="Digite o nome do corretor"
                options={corretores}
                value={formData.corretor_nome}
                onValueChange={(value) => setFormData(prev => ({ ...prev, corretor_nome: value }))}
              />
              
              <AutoSuggest
                label="Empreendimento de Interesse"
                placeholder="Digite o nome do empreendimento"
                options={empreendimentos}
                value={formData.empreendimento}
                onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}
              />
              
              <div className="space-y-2">
                <Label htmlFor="loja">Loja *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loja: value, mesa: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(lojasConfig).map((loja) => (
                      <SelectItem key={loja} value={loja}>
                        {loja}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.loja === "Loja 2" && (
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
                  disabled={!formData.loja || (formData.loja === "Loja 2" && !formData.andar)}
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
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={createVisitMutation.isPending}
              >
                {createVisitMutation.isPending ? "Iniciando..." : "Iniciar Visita"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
