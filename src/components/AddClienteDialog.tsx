
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AutoSuggest } from "@/components/AutoSuggest";

interface AddClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteAdicionado: () => void;
}

export function AddClienteDialog({ open, onOpenChange, onClienteAdicionado }: AddClienteDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_cpf: "",
    cliente_whatsapp: "",
    corretor_nome: "",
    empreendimento: "",
    loja: "",
  });

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
        name: corretor.apelido || corretor.name
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

  // Mutation para adicionar à lista de espera
  const addToListaMutation = useMutation({
    mutationFn: async (clienteData: typeof formData) => {
      // Buscar ID do corretor se foi informado
      let corretor_id = null;
      let apelidoCorretor = null;
      if (clienteData.corretor_nome) {
        const { data: corretorData } = await supabase
          .from('users')
          .select('id, apelido')
          .or(`name.ilike.%${clienteData.corretor_nome.split(' (')[0]}%,apelido.ilike.%${clienteData.corretor_nome}%`)
          .limit(1)
          .single();
        
        corretor_id = corretorData?.id || null;
        apelidoCorretor = corretorData?.apelido || null;
      }

      // Usar CPF padrão se não foi preenchido
      const cpfFinal = clienteData.cliente_cpf.trim() || "00000000000";

      const { data, error } = await supabase
        .from('lista_espera')
        .insert({
          cliente_nome: clienteData.cliente_nome,
          cliente_cpf: cpfFinal,
          cliente_whatsapp: clienteData.cliente_whatsapp || null,
          corretor_nome: clienteData.corretor_nome || null,
          corretor_id: corretor_id || '00000000-0000-0000-0000-000000000000',
          empreendimento: clienteData.empreendimento || null,
          loja: clienteData.loja,
          status: 'aguardando'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar à lista de espera:', error);
        throw error;
      }

      return { data, apelidoCorretor };
    },
    onSuccess: ({ data, apelidoCorretor }) => {
      // Criar mensagem para copiar
      const primeiroNome = data.cliente_nome.split(' ')[0];
      const apelido = apelidoCorretor || 'Não definido';
      const mensagem = `Cliente: ${primeiroNome} - Corretor: ${apelido} - em espera na ${data.loja}`;
      
      // Copiar automaticamente
      copiarParaClipboard(mensagem);

      toast({
        title: "Cliente adicionado à lista de espera!",
        description: `${data.cliente_nome} foi adicionado à lista de espera da ${data.loja}.`,
      });

      // Limpar formulário
      setFormData({
        cliente_nome: "",
        cliente_cpf: "",
        cliente_whatsapp: "",
        corretor_nome: "",
        empreendimento: "",
        loja: "",
      });

      onClienteAdicionado();
    },
    onError: (error) => {
      console.error('Erro ao adicionar à lista de espera:', error);
      toast({
        title: "Erro ao adicionar à lista de espera",
        description: "Ocorreu um erro ao salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || !formData.loja) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o nome do cliente e selecione a loja.",
        variant: "destructive",
      });
      return;
    }

    addToListaMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Cliente à Lista de Espera</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Dados do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome Completo *</Label>
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
                  placeholder="000.000.000-00 (opcional)"
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
            </div>
          </div>

          {/* Dados da Visita */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Dados da Visita
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoSuggest
                label="Empreendimento de Interesse"
                placeholder="Digite o nome do empreendimento"
                options={empreendimentos}
                value={formData.empreendimento}
                onValueChange={(value) => setFormData(prev => ({ ...prev, empreendimento: value }))}
              />
              
              <div className="space-y-2">
                <Label htmlFor="loja">Loja *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loja: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loja 1">Loja 1</SelectItem>
                    <SelectItem value="Loja 2">Loja 2</SelectItem>
                    <SelectItem value="Loja 3">Loja 3</SelectItem>
                    <SelectItem value="Loja Superior 37 andar">Loja Superior 37 andar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={addToListaMutation.isPending}
            >
              {addToListaMutation.isPending ? "Adicionando..." : "Adicionar à Lista"}
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
