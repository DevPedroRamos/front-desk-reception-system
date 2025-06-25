
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Download, Gift, CheckCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PesquisaSatisfacao {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  corretor_nome: string | null;
  codigo_validacao: string;
  validado: boolean;
  created_at: string;
  nota_consultor: number | null;
}

interface Brinde {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  corretor_nome: string;
  tipo_brinde: string;
  validado: boolean;
  data_validacao: string | null;
  pesquisa_satisfacao_id: string;
  created_at: string;
}

const Brindes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pesquisaSelecionada, setPesquisaSelecionada] = useState<PesquisaSatisfacao | null>(null);
  const [codigoValidacao, setCodigoValidacao] = useState('');
  const [tipoBrinde, setTipoBrinde] = useState('');

  // Buscar pesquisas de satisfação não validadas
  const { data: pesquisas = [], isLoading } = useQuery({
    queryKey: ['pesquisas-satisfacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pesquisas_satisfacao')
        .select('*')
        .eq('validado', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PesquisaSatisfacao[];
    }
  });

  // Buscar brindes validados para exportação
  const { data: brindesValidados = [] } = useQuery({
    queryKey: ['brindes-validados', filtroDataInicio, filtroDataFim],
    queryFn: async () => {
      let query = supabase
        .from('brindes')
        .select('*')
        .eq('validado', true)
        .order('data_validacao', { ascending: false });

      if (filtroDataInicio) {
        query = query.gte('data_validacao', filtroDataInicio);
      }
      if (filtroDataFim) {
        query = query.lte('data_validacao', filtroDataFim + 'T23:59:59');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Brinde[];
    }
  });

  const validarBrindeMutation = useMutation({
    mutationFn: async ({ pesquisa, codigo, brinde }: { pesquisa: PesquisaSatisfacao, codigo: string, brinde: string }) => {
      if (codigo !== pesquisa.codigo_validacao) {
        throw new Error('Código de validação incorreto!');
      }

      // Atualizar pesquisa como validada
      const { error: errorPesquisa } = await supabase
        .from('pesquisas_satisfacao')
        .update({ validado: true })
        .eq('id', pesquisa.id);

      if (errorPesquisa) throw errorPesquisa;

      // Criar registro do brinde
      const { error: errorBrinde } = await supabase
        .from('brindes')
        .insert({
          cliente_nome: pesquisa.nome_completo,
          cliente_cpf: pesquisa.cpf,
          corretor_nome: pesquisa.corretor_nome || '',
          tipo_brinde: brinde,
          validado: true,
          codigo_usado: codigo,
          data_validacao: new Date().toISOString(),
          pesquisa_satisfacao_id: pesquisa.id
        });

      if (errorBrinde) throw errorBrinde;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pesquisas-satisfacao'] });
      queryClient.invalidateQueries({ queryKey: ['brindes-validados'] });
      setDialogOpen(false);
      setCodigoValidacao('');
      setTipoBrinde('');
      setPesquisaSelecionada(null);
      toast({
        title: "Brinde validado!",
        description: "O brinde foi validado com sucesso."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleValidarBrinde = () => {
    if (!pesquisaSelecionada || !codigoValidacao || !tipoBrinde) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    validarBrindeMutation.mutate({
      pesquisa: pesquisaSelecionada,
      codigo: codigoValidacao,
      brinde: tipoBrinde
    });
  };

  const exportarCSV = () => {
    if (brindesValidados.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há brindes validados para exportar.",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Cliente', 'CPF', 'Corretor', 'Tipo Brinde', 'Data Validação'],
      ...brindesValidados.map(brinde => [
        brinde.cliente_nome,
        brinde.cliente_cpf,
        brinde.corretor_nome,
        brinde.tipo_brinde,
        brinde.data_validacao ? format(new Date(brinde.data_validacao), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `brindes_validados_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Brindes</h1>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros para Exportação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={exportarCSV} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV ({brindesValidados.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pesquisas pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Pesquisas Pendentes de Validação ({pesquisas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Carregando...</p>
              </div>
            ) : pesquisas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma pesquisa pendente de validação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pesquisas.map((pesquisa) => (
                  <div key={pesquisa.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{pesquisa.nome_completo}</h3>
                      <p className="text-sm text-gray-600">CPF: {pesquisa.cpf}</p>
                      <p className="text-sm text-gray-600">Corretor: {pesquisa.corretor_nome || 'Não informado'}</p>
                      <p className="text-sm text-gray-600">
                        Data: {format(new Date(pesquisa.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </p>
                      {pesquisa.nota_consultor && (
                        <Badge variant="outline">
                          Nota: {pesquisa.nota_consultor}/10
                        </Badge>
                      )}
                    </div>
                    <Dialog open={dialogOpen && pesquisaSelecionada?.id === pesquisa.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) {
                        setPesquisaSelecionada(null);
                        setCodigoValidacao('');
                        setTipoBrinde('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => {
                            setPesquisaSelecionada(pesquisa);
                            setDialogOpen(true);
                          }}
                        >
                          Validar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Validar Brinde</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p><strong>Cliente:</strong> {pesquisa.nome_completo}</p>
                            <p><strong>CPF:</strong> {pesquisa.cpf}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="codigo">Código de Validação</Label>
                            <Input
                              id="codigo"
                              value={codigoValidacao}
                              onChange={(e) => setCodigoValidacao(e.target.value)}
                              placeholder="Digite o código de 4 dígitos"
                              maxLength={4}
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>Escolha o Brinde</Label>
                            <RadioGroup value={tipoBrinde} onValueChange={setTipoBrinde}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Cinemark" id="cinemark" />
                                <Label htmlFor="cinemark">Cinemark</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Vinho" id="vinho" />
                                <Label htmlFor="vinho">Vinho</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <Button 
                            onClick={handleValidarBrinde}
                            disabled={validarBrindeMutation.isPending}
                            className="w-full"
                          >
                            {validarBrindeMutation.isPending ? "Validando..." : "Validar Brinde"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de brindes validados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Brindes Validados ({brindesValidados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brindesValidados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum brinde validado encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Corretor</TableHead>
                      <TableHead>Tipo Brinde</TableHead>
                      <TableHead>Data Validação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brindesValidados.map((brinde) => (
                      <TableRow key={brinde.id}>
                        <TableCell className="font-medium">{brinde.cliente_nome}</TableCell>
                        <TableCell>{brinde.cliente_cpf}</TableCell>
                        <TableCell>{brinde.corretor_nome}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{brinde.tipo_brinde}</Badge>
                        </TableCell>
                        <TableCell>
                          {brinde.data_validacao 
                            ? format(new Date(brinde.data_validacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Brindes;
