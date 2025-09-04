import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface Visit {
  id: string;
  corretor_nome: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
  cliente_nome: string;
}

export function VisitasTable() {
  const { data: visits, isLoading } = useQuery({
    queryKey: ['tv-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('id, corretor_nome, loja, andar, mesa, horario_entrada, cliente_nome')
        .order('horario_entrada', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Erro ao buscar visitas:', error);
        throw error;
      }

      return data as Visit[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold text-lg">Corretor</TableHead>
            <TableHead className="font-bold text-lg">Local</TableHead>
            <TableHead className="font-bold text-lg">Entrada</TableHead>
            <TableHead className="font-bold text-lg">Cliente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits?.map((visit) => (
            <TableRow key={visit.id} className="text-base">
              <TableCell className="font-medium">
                {visit.corretor_nome}
              </TableCell>
              <TableCell>
                {visit.loja} - {visit.andar} - Mesa {visit.mesa}
              </TableCell>
              <TableCell>
                {format(new Date(visit.horario_entrada), 'HH:mm', { locale: ptBR })}
              </TableCell>
              <TableCell className="font-bold text-primary text-lg">
                {visit.cliente_nome}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {(!visits || visits.length === 0) && (
        <div className="p-8 text-center text-muted-foreground">
          Nenhuma visita registrada ainda hoje.
        </div>
      )}
    </Card>
  );
}