import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RetirarEntregaDialog } from "./RetirarEntregaDialog";
import { Entrega, RetirarEntregaData } from "@/hooks/useEntregas";

interface EntregaTableProps {
  entregas: Entrega[];
  onRetirar: (data: RetirarEntregaData) => void;
  isLoading: boolean;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "aguardando_retirada":
      return "default";
    case "finalizado":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "aguardando_retirada":
      return "Aguardando";
    case "finalizado":
      return "Finalizado";
    default:
      return status;
  }
};

export function EntregaTable({ entregas, onRetirar, isLoading }: EntregaTableProps) {
  if (entregas.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        Nenhuma entrega encontrada
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Remetente</TableHead>
            <TableHead>Destinatário</TableHead>
            <TableHead>Loja</TableHead>
            <TableHead>Registrado Por</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregas.map((entrega) => (
            <TableRow key={entrega.id}>
              <TableCell>
                {format(new Date(entrega.data_hora_registro), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell className="font-medium">{entrega.remetente}</TableCell>
              <TableCell className="font-medium">{entrega.destinatario}</TableCell>
              <TableCell>{entrega.loja}</TableCell>
              <TableCell>{entrega.usuario_registro_nome}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(entrega.status)}>
                  {getStatusLabel(entrega.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {entrega.status === "aguardando_retirada" && (
                  <RetirarEntregaDialog
                    entregaId={entrega.id}
                    onSubmit={onRetirar}
                    isLoading={isLoading}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}