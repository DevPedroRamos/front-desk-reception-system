import { useState } from 'react';
import { Search, X, Download, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecebimentoFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  superintendenteFilter: string;
  onSuperintendenteChange: (value: string) => void;
  startDate?: Date;
  onStartDateChange: (date?: Date) => void;
  endDate?: Date;
  onEndDateChange: (date?: Date) => void;
  onClearFilters: () => void;
  onExport: () => void;
  superintendentes: string[];
}

export function RecebimentoFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  superintendenteFilter,
  onSuperintendenteChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
  onExport,
  superintendentes,
}: RecebimentoFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4 flex-wrap">
          {/* Barra de Pesquisa */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Data Início */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data Início'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {/* Data Fim */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[150px] justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Data Fim'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {/* Filtro de Status */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="min-w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aguardando_devolucao">Aguardando</SelectItem>
              <SelectItem value="finalizado">Finalizados</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Superintendente */}
          <Select value={superintendenteFilter} onValueChange={onSuperintendenteChange}>
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Superintendente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Superintendentes</SelectItem>
              {superintendentes.map((sup) => (
                <SelectItem key={sup} value={sup}>
                  {sup}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botão Limpar */}
          <Button variant="outline" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar
          </Button>

          {/* Botão Exportar */}
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
