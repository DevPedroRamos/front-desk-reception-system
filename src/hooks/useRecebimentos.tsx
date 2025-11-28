import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Recebimento {
  id: string;
  visit_id?: string;
  corretor_id: string;
  corretor_apelido: string;
  corretor_gerente?: string;
  corretor_superintendente?: string;
  cliente_nome: string;
  cliente_cpf?: string;
  empreendimento?: string;
  unidade?: string;
  valor_entrada: number;
  valor_pago?: number;
  status: 'aguardando_devolucao' | 'finalizado' | 'cancelado';
  data_hora: string;
  finalizado_em?: string;
  finalizado_por?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface CreateRecebimentoData {
  visit_id?: string;
  corretor_id: string;
  corretor_apelido: string;
  corretor_gerente?: string;
  corretor_superintendente?: string;
  cliente_nome: string;
  cliente_cpf?: string;
  empreendimento?: string;
  unidade?: string;
  valor_entrada: number;
}

interface FinalizarRecebimentoData {
  recebimento_id: string;
  valor_pago: number;
  user_id: string;
}

interface RecebimentoFilters {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  superintendente?: string;
  searchTerm?: string;
}

export function useRecebimentos(filters?: RecebimentoFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os recebimentos com filtros
  const { data: recebimentos, isLoading } = useQuery({
    queryKey: ['recebimentos', filters],
    queryFn: async () => {
      let query = supabase
        .from('recebimentos')
        .select('*')
        .order('data_hora', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('data_hora', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('data_hora', endOfDay.toISOString());
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.superintendente && filters.superintendente !== 'all') {
        query = query.eq('corretor_superintendente', filters.superintendente);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtro de pesquisa por nome (cliente-side)
      let filteredData = data || [];
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (r) =>
            r.corretor_apelido?.toLowerCase().includes(term) ||
            r.cliente_nome?.toLowerCase().includes(term)
        );
      }

      return filteredData as Recebimento[];
    },
  });

  // Criar novo recebimento
  const createRecebimento = useMutation({
    mutationFn: async (data: CreateRecebimentoData) => {
      const { error } = await supabase.from('recebimentos').insert({
        visit_id: data.visit_id,
        corretor_id: data.corretor_id,
        corretor_apelido: data.corretor_apelido,
        corretor_gerente: data.corretor_gerente,
        corretor_superintendente: data.corretor_superintendente,
        cliente_nome: data.cliente_nome,
        cliente_cpf: data.cliente_cpf,
        empreendimento: data.empreendimento,
        unidade: data.unidade,
        valor_entrada: data.valor_entrada,
        status: 'aguardando_devolucao',
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Recebimento registrado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
    },
    onError: (error) => {
      console.error('Erro ao criar recebimento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o recebimento',
        variant: 'destructive',
      });
    },
  });

  // Finalizar recebimento
  const finalizarRecebimento = useMutation({
    mutationFn: async (data: FinalizarRecebimentoData) => {
      const { error } = await supabase
        .from('recebimentos')
        .update({
          status: 'finalizado',
          valor_pago: data.valor_pago,
          finalizado_em: new Date().toISOString(),
          finalizado_por: data.user_id,
        })
        .eq('id', data.recebimento_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso',
        description: 'Recebimento finalizado com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
    },
    onError: (error) => {
      console.error('Erro ao finalizar recebimento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o recebimento',
        variant: 'destructive',
      });
    },
  });

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ['recebimentos-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('recebimentos')
        .select('*')
        .gte('data_hora', today.toISOString());

      if (error) throw error;

      const totalHoje = data?.length || 0;
      const valorTotal =
        data?.reduce((sum, r) => sum + Number(r.valor_pago || r.valor_entrada), 0) || 0;
      const emUso = data?.filter((r) => r.status === 'aguardando_devolucao').length || 0;
      const media = totalHoje > 0 ? valorTotal / totalHoje : 0;

      return {
        totalHoje,
        valorTotal,
        emUso,
        media,
      };
    },
  });

  // Exportar para CSV
  const exportToCSV = () => {
    if (!recebimentos || recebimentos.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Não há dados para exportar',
        variant: 'destructive',
      });
      return;
    }

    const csvData = recebimentos.map((r) => ({
      'Data/Hora': format(new Date(r.data_hora), 'dd/MM/yyyy HH:mm'),
      Corretor: r.corretor_apelido,
      Gerente: r.corretor_gerente || '-',
      Superintendente: r.corretor_superintendente || '-',
      Cliente: r.cliente_nome,
      CPF: r.cliente_cpf || '-',
      Empreendimento: r.empreendimento || '-',
      Unidade: r.unidade || '-',
      'Valor Entrada': r.valor_entrada.toFixed(2),
      'Valor Pago': r.valor_pago ? r.valor_pago.toFixed(2) : '-',
      Status: r.status,
    }));

    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((h) => `"${row[h as keyof typeof row]}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recebimentos_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Sucesso',
      description: 'Relatório exportado com sucesso!',
    });
  };

  return {
    recebimentos: recebimentos || [],
    isLoading,
    stats: stats || { totalHoje: 0, valorTotal: 0, emUso: 0, media: 0 },
    createRecebimento,
    finalizarRecebimento,
    exportToCSV,
  };
}

// Hook para buscar todos os corretores ativos da tabela users
export function useCorretoresAtivos() {
  return useQuery({
    queryKey: ['corretores-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, apelido, gerente, superintendente')
        .eq('ban', false)
        .order('apelido');

      if (error) throw error;

      return data?.map((user) => ({
        id: user.id,
        name: user.apelido,
        gerente: user.gerente,
        superintendente: user.superintendente,
      })) || [];
    },
  });
}

// Hook para buscar visitas ativas de um corretor específico
export function useVisitasCorretor(corretorId?: string) {
  return useQuery({
    queryKey: ['visitas-corretor', corretorId],
    queryFn: async () => {
      if (!corretorId) return [];

      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .eq('corretor_id', corretorId)
        .eq('status', 'ativo');

      if (error) throw error;
      return data || [];
    },
    enabled: !!corretorId,
  });
}
