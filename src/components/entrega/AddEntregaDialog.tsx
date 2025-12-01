import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { CreateEntregaData } from "@/hooks/useEntregas";

interface AddEntregaDialogProps {
  onSubmit: (data: CreateEntregaData) => void;
  isLoading: boolean;
}

export function AddEntregaDialog({ onSubmit, isLoading }: AddEntregaDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { userProfile } = useUserRole();
  const [remetente, setRemetente] = useState("");
  const [destinatario, setDestinatario] = useState("");
  const [loja, setLoja] = useState("");
  const [andar, setAndar] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!remetente || !destinatario || !loja || !user || !userProfile) {
      return;
    }

    onSubmit({
      remetente,
      destinatario,
      loja,
      andar: andar || undefined,
      usuario_registro_id: user.id,
      usuario_registro_nome: userProfile.name,
    });

    setRemetente("");
    setDestinatario("");
    setLoja("");
    setAndar("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Package className="mr-2 h-4 w-4" />
          Receber Entrega
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nova Entrega</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remetente">Remetente *</Label>
            <Input
              id="remetente"
              value={remetente}
              onChange={(e) => setRemetente(e.target.value)}
              placeholder="Nome do remetente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinatario">Destinatário *</Label>
            <Input
              id="destinatario"
              value={destinatario}
              onChange={(e) => setDestinatario(e.target.value)}
              placeholder="Nome do destinatário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loja">Loja *</Label>
            <Select value={loja} onValueChange={setLoja} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Loja Metrô">Loja Metrô</SelectItem>
                <SelectItem value="Loja Leopoldina">Loja Leopoldina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="andar">Andar</Label>
            <Input
              id="andar"
              value={andar}
              onChange={(e) => setAndar(e.target.value)}
              placeholder="Andar (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label>Registrado por</Label>
            <Input value={userProfile?.name || ""} disabled />
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
              {isLoading ? "Registrando..." : "Registrar Entrega"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}