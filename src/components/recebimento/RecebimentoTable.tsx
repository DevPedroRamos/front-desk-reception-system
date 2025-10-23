import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FinalizarRecebimentoDialog } from './FinalizarRecebimentoDialog';

interface Recebimento {
  id: string;
  corretor_apelido: string;
  cliente_nome: string;
  empreendimento?: string;
  unidade?: string;
  valor_entrada: number;
  valor_pago?: number;
  status: string;
  data_hora: string;
}

interface RecebimentoTableProps {
  recebimentos: Recebimento[];
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'aguardando_devolucao':
      return 'default';
    case 'finalizado':
      return 'secondary';
    case 'cancelado':
      return 'destructive';
    default:
      return 'default';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'aguardando_devolucao':
      return 'Aguardando';
    case 'finalizado':
      return 'Finalizado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return status;
  }
}

export function RecebimentoTable({ recebimentos }: RecebimentoTableProps) {
  if (recebimentos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum recebimento encontrado</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Corretor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Empreendimento</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Valor Entrada</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recebimentos.map((recebimento) => (
              <TableRow key={recebimento.id}>
                <TableCell>
                  {format(new Date(recebimento.data_hora), 'dd/MM HH:mm')}
                </TableCell>
                <TableCell className="font-medium">{recebimento.corretor_apelido}</TableCell>
                <TableCell>{recebimento.cliente_nome}</TableCell>
                <TableCell>{recebimento.empreendimento || '-'}</TableCell>
                <TableCell>{recebimento.unidade || '-'}</TableCell>
                <TableCell>
                  R$ {recebimento.valor_entrada.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {recebimento.valor_pago
                    ? `R$ ${recebimento.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(recebimento.status)}>
                    {getStatusLabel(recebimento.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {recebimento.status === 'aguardando_devolucao' && (
                    <FinalizarRecebimentoDialog recebimento={recebimento} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
