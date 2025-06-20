
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gift } from 'lucide-react';

interface BrindeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitData: {
    id: string;
    cliente_nome: string;
    cliente_cpf: string;
    corretor_nome: string;
  };
  onFinalize: () => void;
}

export function BrindeDialog({ open, onOpenChange, visitData, onFinalize }: BrindeDialogProps) {
  const [tipoBrinde, setTipoBrinde] = useState<string>('');
  const { toast } = useToast();

  const registrarBrindeMutation = useMutation({
    mutationFn: async (tipo: string) => {
      const { error } = await supabase
        .from('brindes')
        .insert({
          visit_id: visitData.id,
          cliente_nome: visitData.cliente_nome,
          cliente_cpf: visitData.cliente_cpf,
          corretor_nome: visitData.corretor_nome,
          tipo_brinde: tipo
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Brinde registrado!",
        description: `Brinde ${tipoBrinde} foi registrado para ${visitData.cliente_nome}.`,
      });
      finalizarVisita();
    },
    onError: (error) => {
      console.error('Erro ao registrar brinde:', error);
      toast({
        title: "Erro ao registrar brinde",
        description: "Ocorreu um erro ao salvar o brinde.",
        variant: "destructive",
      });
    }
  });

  const finalizarVisita = () => {
    onOpenChange(false);
    setTipoBrinde('');
    onFinalize();
  };

  const handleComBrinde = () => {
    if (!tipoBrinde) {
      toast({
        title: "Selecione o tipo de brinde",
        description: "Por favor, escolha entre Cinemark ou Vinho.",
        variant: "destructive",
      });
      return;
    }
    registrarBrindeMutation.mutate(tipoBrinde);
  };

  const handleSemBrinde = () => {
    finalizarVisita();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-orange-500" />
            O cliente recebeu brinde?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Cliente: <span className="font-semibold">{visitData.cliente_nome}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="tipo-brinde">Tipo de Brinde</Label>
              <Select value={tipoBrinde} onValueChange={setTipoBrinde}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de brinde" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cinemark">Cinemark</SelectItem>
                  <SelectItem value="Vinho">Vinho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleComBrinde}
              disabled={registrarBrindeMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {registrarBrindeMutation.isPending ? 'Registrando...' : 'Sim, recebeu brinde'}
            </Button>
            
            <Button 
              onClick={handleSemBrinde}
              variant="outline"
              className="w-full"
            >
              Não recebeu brinde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
