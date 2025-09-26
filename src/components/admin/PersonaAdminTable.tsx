import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { PersonaAdminData } from "@/hooks/usePersonaAdminData";

interface PersonaAdminTableProps {
  data: PersonaAdminData[];
  loading: boolean;
  onViewResponse: (response: PersonaAdminData) => void;
}

export function PersonaAdminTable({ data, loading, onViewResponse }: PersonaAdminTableProps) {
  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Nenhum questionário encontrado com os filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Superintendência</TableHead>
            <TableHead>Gerência</TableHead>
            <TableHead>Data de Submissão</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nome}</TableCell>
              <TableCell>{item.cpf}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.superintendencia}</TableCell>
              <TableCell>{item.gerencia}</TableCell>
              <TableCell>
                {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm")}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewResponse(item)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Visualizar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}