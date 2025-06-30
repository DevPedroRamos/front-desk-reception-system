
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Layout } from '@/components/Layout';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { Search, Eye, CheckCircle, XCircle, FileText, Users, Star, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PesquisaSatisfacao {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  corretor_nome: string;
  onde_conheceu: string;
  empreendimento_interesse: string;
  comprou_empreendimento: boolean;
  empreendimento_adquirido: string;
  nota_consultor: number;
  avaliacao_experiencia: string;
  dicas_sugestoes: string;
  validado: boolean;
  created_at: string;
}

export default function PesquisaRelatorio() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPesquisa, setSelectedPesquisa] = useState<PesquisaSatisfacao | null>(null);
  const { toast } = useToast();

  const { data: pesquisas = [], isLoading, refetch } = useQuery({
    queryKey: ['pesquisas-satisfacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesquisas_satisfacao')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PesquisaSatisfacao[];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['pesquisas-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesquisas_satisfacao')
        .select('validado, nota_consultor');

      if (error) throw error;

      const total = data.length;
      const validadas = data.filter(p => p.validado).length;
      const pendentes = total - validadas;
      const notaMedia = data
        .filter(p => p.nota_consultor !== null)
        .reduce((acc, p) => acc + (p.nota_consultor || 0), 0) / 
        data.filter(p => p.nota_consultor !== null).length || 0;

      return { total, validadas, pendentes, notaMedia: notaMedia.toFixed(1) };
    }
  });

  const filteredPesquisas = pesquisas.filter(pesquisa => {
    const matchesSearch = 
      pesquisa.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pesquisa.cpf.includes(searchTerm) ||
      pesquisa.corretor_nome?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'validado' && pesquisa.validado) ||
      (statusFilter === 'pendente' && !pesquisa.validado);

    return matchesSearch && matchesStatus;
  });

  const toggleValidacao = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pesquisas_satisfacao')
        .update({ validado: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Pesquisa ${!currentStatus ? 'validada' : 'invalidada'} com sucesso.`,
      });

      refetch();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da pesquisa.",
        variant: "destructive",
      });
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['recepcionista']}>
      <Layout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pesquisas de Satisfação</h1>
              <p className="text-gray-600">Gerencie e visualize as pesquisas de satisfação dos clientes</p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pesquisas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Validadas</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.validadas || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendentes || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
                <Star className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats?.notaMedia || '0.0'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por nome, CPF ou corretor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="validado">Validados</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Pesquisas */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pesquisas</CardTitle>
              <CardDescription>
                {filteredPesquisas.length} pesquisa(s) encontrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Corretor</TableHead>
                      <TableHead>Nota</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPesquisas.map((pesquisa) => (
                      <TableRow key={pesquisa.id}>
                        <TableCell className="font-medium">
                          {pesquisa.nome_completo}
                        </TableCell>
                        <TableCell>{pesquisa.cpf}</TableCell>
                        <TableCell>{pesquisa.corretor_nome || 'N/A'}</TableCell>
                        <TableCell>
                          {pesquisa.nota_consultor ? (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              {pesquisa.nota_consultor}/10
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={pesquisa.validado ? "default" : "secondary"}
                            className={pesquisa.validado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                          >
                            {pesquisa.validado ? 'Validado' : 'Pendente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(pesquisa.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPesquisa(pesquisa)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Pesquisa</DialogTitle>
                                  <DialogDescription>
                                    Informações completas da pesquisa de satisfação
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedPesquisa && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Nome Completo</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.nome_completo}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">CPF</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.cpf}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Email</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Corretor</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.corretor_nome || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Onde Conheceu</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.onde_conheceu || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Empreendimento de Interesse</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.empreendimento_interesse || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Comprou Empreendimento</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.comprou_empreendimento ? 'Sim' : 'Não'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Empreendimento Adquirido</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.empreendimento_adquirido || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Nota do Consultor</label>
                                        <p className="text-sm text-gray-600">{selectedPesquisa.nota_consultor || 'N/A'}/10</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Avaliação da Experiência</label>
                                      <p className="text-sm text-gray-600 mt-1">{selectedPesquisa.avaliacao_experiencia || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Dicas e Sugestões</label>
                                      <p className="text-sm text-gray-600 mt-1">{selectedPesquisa.dicas_sugestoes || 'N/A'}</p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant={pesquisa.validado ? "destructive" : "default"}
                              size="sm"
                              onClick={() => toggleValidacao(pesquisa.id, pesquisa.validado)}
                            >
                              {pesquisa.validado ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
}
