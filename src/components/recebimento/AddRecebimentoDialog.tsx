import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoSuggest } from '@/components/AutoSuggest';
import { useCorretoresAtivos, useVisitasCorretor } from '@/hooks/useRecebimentos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AddRecebimentoDialogProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function AddRecebimentoDialog({ onSubmit, isSubmitting }: AddRecebimentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCorretor, setSelectedCorretor] = useState<any>(null);
  const [corretorInputValue, setCorretorInputValue] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [empreendimento, setEmpreendimento] = useState('');
  const [empreendimentoInputValue, setEmpreendimentoInputValue] = useState('');
  const [unidade, setUnidade] = useState('');
  const [valorEntrada, setValorEntrada] = useState('');

  const { data: corretores = [] } = useCorretoresAtivos();
  const { data: visits = [] } = useVisitasCorretor(selectedCorretor?.id);

  // Buscar empreendimentos
  const { data: empreendimentos = [] } = useQuery({
    queryKey: ['empreendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimentos')
        .select('nome')
        .order('nome');
      if (error) throw error;
      return data.map((e) => e.nome);
    },
  });

  useEffect(() => {
    if (visits.length === 1) {
      setSelectedVisit(visits[0]);
    }
  }, [visits]);

  const handleReset = () => {
    setSelectedCorretor(null);
    setCorretorInputValue('');
    setSelectedVisit(null);
    setEmpreendimento('');
    setEmpreendimentoInputValue('');
    setUnidade('');
    setValorEntrada('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCorretor || !selectedVisit || !valorEntrada) {
      return;
    }

    const valor = parseFloat(valorEntrada.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) {
      return;
    }

    onSubmit({
      visit_id: selectedVisit.id,
      corretor_id: selectedCorretor.id,
      corretor_apelido: selectedCorretor.name,
      corretor_gerente: selectedCorretor.gerente,
      corretor_superintendente: selectedCorretor.superintendente,
      cliente_nome: selectedVisit.cliente_nome,
      cliente_cpf: selectedVisit.cliente_cpf,
      empreendimento: empreendimento || null,
      unidade: unidade || null,
      valor_entrada: valor,
    });

    handleReset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Recebimento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Recebimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção do Corretor */}
          <AutoSuggest
            label="Apelido do Corretor"
            options={corretores.map((c) => ({ id: c.id, name: c.name }))}
            value={corretorInputValue}
            onValueChange={(value) => {
              // Sempre atualizar o valor do input
              setCorretorInputValue(value);
              
              // Limpar seleção se campo estiver vazio
              if (value === '') {
                setSelectedCorretor(null);
                setSelectedVisit(null);
                return;
              }
              
              // Procurar corretor que corresponda exatamente
              const corretor = corretores.find((c) => c.name === value);
              if (corretor) {
                setSelectedCorretor(corretor);
                setSelectedVisit(null);
              } else {
                // Se não encontrar, limpar apenas a seleção mas manter o texto
                setSelectedCorretor(null);
                setSelectedVisit(null);
              }
            }}
            placeholder="Digite o apelido do corretor..."
            required
          />

          {/* Informações Auto-preenchidas */}
          {selectedCorretor && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gerente</Label>
                  <Input value={selectedCorretor.gerente || '-'} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Superintendente</Label>
                  <Input value={selectedCorretor.superintendente || '-'} disabled />
                </div>
              </div>

              {/* Seleção do Cliente (se múltiplas visitas) */}
              {visits.length > 1 && (
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Select
                    value={selectedVisit?.id || ''}
                    onValueChange={(value) => {
                      const visit = visits.find((v) => v.id === value);
                      setSelectedVisit(visit);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {visits.map((visit) => (
                        <SelectItem key={visit.id} value={visit.id}>
                          {visit.cliente_nome} - Mesa {visit.mesa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {visits.length === 1 && selectedVisit && (
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Input value={`${selectedVisit.cliente_nome} - Mesa ${selectedVisit.mesa}`} disabled />
                </div>
              )}
            </>
          )}

          {/* Campos Manuais */}
          {selectedVisit && (
            <>
              <AutoSuggest
                label="Empreendimento"
                options={empreendimentos.map((e, idx) => ({ id: String(idx), name: e }))}
                value={empreendimentoInputValue}
                onValueChange={(value) => {
                  // Sempre atualizar o valor do input
                  setEmpreendimentoInputValue(value);
                  // Atualizar o empreendimento selecionado
                  setEmpreendimento(value);
                }}
                placeholder="Digite o empreendimento..."
              />

              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  placeholder="Ex: Apto 101"
                />
              </div>

              <div className="space-y-2">
                <Label>Valor da Entrada (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorEntrada}
                  onChange={(e) => setValorEntrada(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedCorretor || !selectedVisit || !valorEntrada}>
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
