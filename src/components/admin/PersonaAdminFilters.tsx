import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PersonaFilters } from "@/hooks/usePersonaAdminData";

interface PersonaAdminFiltersProps {
  filters: PersonaFilters;
  onFiltersChange: (filters: PersonaFilters) => void;
  onClearFilters: () => void;
}

const superintendencias = [
  'Bella', 'Tayna', 'Vasques', 'Pessoania', 'Jean', 'Antonela', 'Mateus', 'Duarte'
];

export function PersonaAdminFilters({ filters, onFiltersChange, onClearFilters }: PersonaAdminFiltersProps) {
  return (
    <div className="bg-card p-6 rounded-lg border space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            placeholder="Buscar por nome..."
            value={filters.nome || ''}
            onChange={(e) => onFiltersChange({ ...filters, nome: e.target.value })}
          />
        </div>

        {/* Superintendência */}
        <div className="space-y-2">
          <Label>Superintendência</Label>
          <Select
            value={filters.superintendencia || 'todos'}
            onValueChange={(value) => onFiltersChange({ 
              ...filters, 
              superintendencia: value === 'todos' ? undefined : value 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {superintendencias.map((super_) => (
                <SelectItem key={super_} value={super_}>{super_}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gerente */}
        <div className="space-y-2">
          <Label htmlFor="gerente">Gerente</Label>
          <Input
            id="gerente"
            placeholder="Filtrar por gerente..."
            value={filters.gerente || ''}
            onChange={(e) => onFiltersChange({ ...filters, gerente: e.target.value })}
          />
        </div>

        {/* Data Início */}
        <div className="space-y-2">
          <Label>Data Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dataInicio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataInicio ? format(filters.dataInicio, "dd/MM/yyyy") : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dataInicio}
                onSelect={(date) => onFiltersChange({ ...filters, dataInicio: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <Label>Data Fim</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dataFim && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dataFim ? format(filters.dataFim, "dd/MM/yyyy") : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dataFim}
                onSelect={(date) => onFiltersChange({ ...filters, dataFim: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}