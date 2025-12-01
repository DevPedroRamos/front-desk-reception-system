import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { RetirarEntregaData } from "@/hooks/useEntregas";

interface RetirarEntregaDialogProps {
  entregaId: string;
  onSubmit: (data: RetirarEntregaData) => void;
  isLoading: boolean;
}

export function RetirarEntregaDialog({
  entregaId,
  onSubmit,
  isLoading,
}: RetirarEntregaDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [quemRetirou, setQuemRetirou] = useState("");
  const [cpf, setCpf] = useState("");

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return cpf;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quemRetirou || !cpf || !user) {
      return;
    }

    onSubmit({
      entrega_id: entregaId,
      quem_retirou: quemRetirou,
      quem_retirou_cpf: cpf.replace(/\D/g, ""),
      user_id: user.id,
    });

    setQuemRetirou("");
    setCpf("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCircle className="mr-2 h-4 w-4" />
          Retirar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Registrar Retirada da Entrega</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quem_retirou">Quem Retirou *</Label>
            <Input
              id="quem_retirou"
              value={quemRetirou}
              onChange={(e) => setQuemRetirou(e.target.value)}
              placeholder="Nome de quem retirou"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              value={cpf}
              onChange={handleCPFChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Data/Hora de Retirada</Label>
            <Input
              value={new Date().toLocaleString("pt-BR")}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Confirmando..." : "Confirmar Retirada"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}