
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AgendamentoCliente {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  whatsapp: string;
  data: string;
  hora: string;
  empreendimento: string;
  status: string;
}

export function IniciarVisitaDialog({ onVisitaIniciada }: { onVisitaIniciada: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_cpf: '',
    cliente_whatsapp: '',
    loja: '',
    mesa: '',
    andar: '',
    empreendimento: '',
    corretor_id: '',
    corretor_nome: ''
  });
  const [clienteSelecionado, setClienteSelecionado] = useState<AgendamentoCliente | null>(null);

  // Buscar agendamentos confirmados
  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos-confirmados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('status', 'confirmado')
        .eq('data', new Date().toISOString().split('T')[0]);
      
      if (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Buscar corretores
  const { data: corretores = [] } = useQuery({
    queryKey: ['corretores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'corretor')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar corretores:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Verificar disponibilidade da mesa
  const verificarMesaMutation = useMutation({
    mutationFn: async ({ loja, andar, mesa }: { loja: string; andar: string; mesa: number }) => {
      const { data, error } = await supabase.rpc('check_mesa_disponivel', {
        p_loja: loja,
        p_andar: andar,
        p_mesa: mesa
      });

      if (error) {
        throw error;
      }

      return data;
    }
  });

  const iniciarVisitaMutation = useMutation({
    mutationFn: async (dadosVisita: typeof formData) => {
      const { data, error } = await supabase
        .from('visits')
        .insert({
          cliente_nome: dadosVisita.cliente_nome,
          cliente_cpf: dadosVisita.cliente_cpf,
          cliente_whatsapp: dadosVisita.cliente_whatsapp,
          loja: dadosVisita.loja,
          mesa: parseInt(dadosVisita.mesa),
          andar: dadosVisita.andar,
          empreendimento: dadosVisita.empreendimento,
          corretor_id: dadosVisita.corretor_id,
          corretor_nome: dadosVisita.corretor_nome,
          status: 'ativo'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Visita iniciada!",
        description: "A visita foi iniciada com sucesso.",
      });
      
      setFormData({
        cliente_nome: '',
        cliente_cpf: '',
        cliente_whatsapp: '',
        loja: '',
        mesa: '',
        andar: '',
        empreendimento: '',
        corretor_id: '',
        corretor_nome: ''
      });
      setClienteSelecionado(null);
      setIsOpen(false);
      onVisitaIniciada();
    },
    onError: (error) => {
      console.error('Erro ao iniciar visita:', error);
      toast({
        title: "Erro ao iniciar visita",
        description: "Não foi possível iniciar a visita. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || !formData.cliente_cpf || !formData.loja || 
        !formData.mesa || !formData.andar || !formData.corretor_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se a mesa está disponível
    try {
      const mesaDisponivel = await verificarMesaMutation.mutateAsync({
        loja: formData.loja,
        andar: formData.andar,
        mesa: parseInt(formData.mesa)
      });

      if (!mesaDisponivel) {
        toast({
          title: "Mesa ocupada",
          description: "Esta mesa já está ocupada. Escolha outra mesa.",
          variant: "destructive",
        });
        return;
      }

      iniciarVisitaMutation.mutate(formData);
    } catch (error) {
      console.error('Erro ao verificar mesa:', error);
      toast({
        title: "Erro ao verificar mesa",
        description: "Não foi possível verificar a disponibilidade da mesa.",
        variant: "destructive",
      });
    }
  };

  const selecionarAgendamento = (agendamento: any) => {
    const agendamentoFormatado: AgendamentoCliente = {
      id: agendamento.id,
      cliente_nome: agendamento.cliente_nome,
      cliente_cpf: agendamento.cliente_cpf,
      whatsapp: agendamento.whatsapp, // Corrigido: usar whatsapp em vez de cliente_whatsapp
      data: agendamento.data,
      hora: agendamento.hora,
      empreendimento: agendamento.empreendimento,
      status: agendamento.status
    };
    
    setClienteSelecionado(agendamentoFormatado);
    setFormData(prev => ({
      ...prev,
      cliente_nome: agendamento.cliente_nome,
      cliente_cpf: agendamento.cliente_cpf,
      cliente_whatsapp: agendamento.whatsapp, // Corrigido: usar whatsapp
      empreendimento: agendamento.empreendimento || '',
      corretor_id: agendamento.corretor_id || ''
    }));

    // Buscar nome do corretor
    const corretor = corretores.find(c => c.id === agendamento.corretor_id);
    if (corretor) {
      setFormData(prev => ({
        ...prev,
        corretor_nome: corretor.name
      }));
    }
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento =>
    agendamento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agendamento.cliente_cpf.includes(searchTerm)
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Iniciar Visita
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Iniciar Nova Visita</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Cliente Agendado */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Clientes com Agendamento Hoje</h3>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {agendamentosFiltrados.length > 0 && (
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {agendamentosFiltrados.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      clienteSelecionado?.id === agendamento.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => selecionarAgendamento(agendamento)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{agendamento.cliente_nome}</p>
                        <p className="text-sm text-gray-600">CPF: {agendamento.cliente_cpf}</p>
                        <p className="text-sm text-gray-600">WhatsApp: {agendamento.whatsapp}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{agendamento.hora}</p>
                        <p className="text-sm text-gray-600">{agendamento.empreendimento}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulário de Dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
              <Input
                id="cliente_nome"
                value={formData.cliente_nome}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cliente_cpf">CPF *</Label>
              <Input
                id="cliente_cpf"
                value={formData.cliente_cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div>
              <Label htmlFor="cliente_whatsapp">WhatsApp</Label>
              <Input
                id="cliente_whatsapp"
                value={formData.cliente_whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, cliente_whatsapp: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="empreendimento">Empreendimento</Label>
              <Input
                id="empreendimento"
                value={formData.empreendimento}
                onChange={(e) => setFormData(prev => ({ ...prev, empreendimento: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="loja">Loja *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, loja: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a loja" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Loja A">Loja A</SelectItem>
                  <SelectItem value="Loja B">Loja B</SelectItem>
                  <SelectItem value="Loja C">Loja C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="andar">Andar *</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, andar: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o andar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Térreo">Térreo</SelectItem>
                  <SelectItem value="1º Andar">1º Andar</SelectItem>
                  <SelectItem value="2º Andar">2º Andar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mesa">Mesa *</Label>
              <Input
                id="mesa"
                type="number"
                value={formData.mesa}
                onChange={(e) => setFormData(prev => ({ ...prev, mesa: e.target.value }))}
                placeholder="Número da mesa"
                required
              />
            </div>

            <div>
              <Label htmlFor="corretor">Corretor *</Label>
              <Select onValueChange={(value) => {
                const corretor = corretores.find(c => c.id === value);
                setFormData(prev => ({ 
                  ...prev, 
                  corretor_id: value,
                  corretor_nome: corretor?.name || ''
                }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o corretor" />
                </SelectTrigger>
                <SelectContent>
                  {corretores.map((corretor) => (
                    <SelectItem key={corretor.id} value={corretor.id}>
                      {corretor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={iniciarVisitaMutation.isPending || verificarMesaMutation.isPending}
          >
            {iniciarVisitaMutation.isPending ? "Iniciando..." : "Iniciar Visita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
