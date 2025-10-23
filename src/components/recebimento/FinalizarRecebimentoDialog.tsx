import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRecebimentos } from '@/hooks/useRecebimentos';
import { useAuth } from '@/contexts/AuthContext';

interface FinalizarRecebimentoDialogProps {
  recebimento: {
    id: string;
    valor_entrada: number;
  };
}

export function FinalizarRecebimentoDialog({ recebimento }: FinalizarRecebimentoDialogProps) {
  const [valorPago, setValorPago] = useState(recebimento.valor_entrada.toString());
  const [open, setOpen] = useState(false);
  const { finalizarRecebimento } = useRecebimentos();
  const { user } = useAuth();

  const handleFinalizar = () => {
    const valor = parseFloat(valorPago.replace(',', '.'));
    if (isNaN(valor) || valor <= 0 || !user) {
      return;
    }

    finalizarRecebimento.mutate(
      {
        recebimento_id: recebimento.id,
        valor_pago: valor,
        user_id: user.id,
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">
          Finalizar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Devolução da Maquininha</AlertDialogTitle>
          <AlertDialogDescription>
            Confirme o valor pago e finalize o recebimento. A maquininha será marcada como devolvida.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Valor Original</Label>
            <Input
              value={`R$ ${recebimento.valor_entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Valor Pago (R$) *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valorPago}
              onChange={(e) => setValorPago(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleFinalizar} disabled={finalizarRecebimento.isPending}>
            {finalizarRecebimento.isPending ? 'Finalizando...' : 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
