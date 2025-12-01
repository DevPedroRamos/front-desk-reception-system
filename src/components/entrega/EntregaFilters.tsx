import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Download, Search, X } from "lucide-react";

interface EntregaFiltersProps {
  startDate: string;
  endDate: string;
  status: string;
  andar: string;
  searchTerm: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAndarChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onExport: () => void;
}

export function EntregaFilters({
  startDate,
  endDate,
  status,
  andar,
  searchTerm,
  onStartDateChange,
  onEndDateChange,
  onStatusChange,
  onAndarChange,
  onSearchChange,
  onClear,
  onExport,
}: EntregaFiltersProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por remetente ou destinatário..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="aguardando_retirada">Aguardando</SelectItem>
                <SelectItem value="finalizado">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Andar</label>
            <div className="flex gap-2">
              <Input
                placeholder="Filtrar por andar"
                value={andar}
                onChange={(e) => onAndarChange(e.target.value)}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={onClear}
                title="Limpar filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}