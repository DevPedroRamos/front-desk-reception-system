
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AutoSuggest } from "@/components/AutoSuggest";

interface ClienteListaEspera {
  id: string;
  cliente_nome: string;
  corretor_nome: string | null;
}

interface TrocarCorretorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteListaEspera;
  onCorretorTrocado: () => void;
}

export function TrocarCorretorDialog({ open, onOpenChange, cliente, onCorretorTrocado }: TrocarCorretorDialogProps) {
  const { toast } = useToast();
  const [novoCorretor, setNovoCorretor] = useState("");

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

  // Mutation para trocar corretor
  const trocarCorretorMutation = useMutation({
    mutationFn: async (novoCorretorNome: string) => {
      // Buscar ID do novo corretor
      let corretor_id = null;
      if (novoCorretorNome) {
        const { data: corretorData } = await supabase
          .from('users')
          .select('id')
          .or(`name.ilike.%${novoCorretorNome.split(' (')[0]}%,apelido.ilike.%${novoCorretorNome}%`)
          .limit(1)
          .single();
        
        corretor_id = corretorData?.id || null;
      }

      const { data, error } = await supabase
        .from('lista_espera')
        .update({
          corretor_nome: novoCorretorNome || null,
          corretor_id: corretor_id || '00000000-0000-0000-0000-000000000000',
          updated_at: new Date().toISOString()
        })
        .eq('id', cliente.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao trocar corretor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Corretor alterado!",
        description: `O corretor de ${cliente.cliente_nome} foi alterado com sucesso.`,
      });

      setNovoCorretor("");
      onCorretorTrocado();
    },
    onError: (error) => {
      console.error('Erro ao trocar corretor:', error);
      toast({
        title: "Erro ao alterar corretor",
        description: "Ocorreu um erro ao alterar o corretor. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoCorretor) {
      toast({
        title: "Corretor obrigatório",
        description: "Por favor, selecione o novo corretor.",
        variant: "destructive",
      });
      return;
    }

    trocarCorretorMutation.mutate(novoCorretor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Trocar Corretor</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">Cliente com tempo excedido</h3>
            <div className="text-sm text-red-700 space-y-1">
              <p><strong>Cliente:</strong> {cliente.cliente_nome}</p>
              <p><strong>Corretor atual:</strong> {cliente.corretor_nome || "Nenhum"}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <AutoSuggest
            label="Novo Corretor *"
            placeholder="Digite o nome do novo corretor"
            options={corretores}
            value={novoCorretor}
            onValueChange={setNovoCorretor}
          />

          <div className="flex gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={trocarCorretorMutation.isPending}
            >
              {trocarCorretorMutation.isPending ? "Alterando..." : "Alterar Corretor"}
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
