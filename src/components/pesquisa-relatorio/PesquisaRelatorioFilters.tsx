
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PesquisaFilters } from '@/hooks/usePesquisasData';

interface FiltersProps {
  filters: PesquisaFilters;
  onFiltersChange: (filters: PesquisaFilters) => void;
  corretores: any[];
}

export const PesquisaRelatorioFilters = ({ filters, onFiltersChange, corretores }: FiltersProps) => {
  const handleFilterChange = (key: keyof PesquisaFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Data Início */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataInicio ? (
                    format(filters.dataInicio, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    'Selecionar'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dataInicio}
                  onSelect={(date) => handleFilterChange('dataInicio', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dataFim ? (
                    format(filters.dataFim, 'dd/MM/yyyy', { locale: ptBR })
                  ) : (
                    'Selecionar'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dataFim}
                  onSelect={(date) => handleFilterChange('dataFim', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Corretor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Corretor</label>
            <Select
              value={filters.corretor}
              onValueChange={(value) => handleFilterChange('corretor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {corretores.map((corretor) => (
                  <SelectItem key={corretor.name} value={corretor.name}>
                    {corretor.apelido || corretor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.validado}
              onValueChange={(value) => handleFilterChange('validado', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="true">Validados</SelectItem>
                <SelectItem value="false">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Busca */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Buscar</label>
            <Input
              placeholder="Nome, CPF ou email..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
