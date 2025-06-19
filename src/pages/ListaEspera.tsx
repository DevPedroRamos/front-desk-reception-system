
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, UserX, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddClienteDialog } from "@/components/AddClienteDialog";
import { IniciarVisitaDialog } from "@/components/IniciarVisitaDialog";
import { TrocarCorretorDialog } from "@/components/TrocarCorretorDialog";

interface ClienteListaEspera {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp: string | null;
  corretor_nome: string | null;
  corretor_id: string | null;
  empreendimento: string | null;
  loja: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const ListaEspera = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filtroLoja, setFiltroLoja] = useState<string>("todos");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showIniciarVisitaDialog, setShowIniciarVisitaDialog] = useState(false);
  const [showTrocarCorretorDialog, setShowTrocarCorretorDialog] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteListaEspera | null>(null);

  const lojas = ["Loja 1", "Loja 2", "Loja 3", "Loja Superior 37 andar"];

  // Buscar lista de espera
  const { data: listaEspera = [], isLoading } = useQuery({
    queryKey: ['lista-espera', filtroLoja],
    queryFn: async () => {
      let query = supabase
        .from('lista_espera')
        .select('*')
        .eq('status', 'aguardando')
        .order('created_at', { ascending: true });

      if (filtroLoja !== "todos") {
        query = query.eq('loja', filtroLoja);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar lista de espera:', error);
        return [];
      }

      return data || [];
    }
  });

  // Verificar se cliente excedeu tempo
  const verificarTempoExcedido = (createdAt: string) => {
    const agora = new Date();
    const criacao = new Date(createdAt);
    const diffMinutos = (agora.getTime() - criacao.getTime()) / (1000 * 60);
    return diffMinutos > 20;
  };

  // Mutation para remover da lista de espera
  const removerDaListaMutation = useMutation({
    mutationFn: async (clienteId: string) => {
      const { error } = await supabase
        .from('lista_espera')
        .delete()
        .eq('id', clienteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lista-espera'] });
    }
  });

  const handleIniciarVisita = (cliente: ClienteListaEspera) => {
    setClienteSelecionado(cliente);
    setShowIniciarVisitaDialog(true);
  };

  const handleTrocarCorretor = (cliente: ClienteListaEspera) => {
    setClienteSelecionado(cliente);
    setShowTrocarCorretorDialog(true);
  };

  const onVisitaIniciada = () => {
    if (clienteSelecionado) {
      removerDaListaMutation.mutate(clienteSelecionado.id);
    }
    setShowIniciarVisitaDialog(false);
    setClienteSelecionado(null);
  };

  const onCorretorTrocado = () => {
    queryClient.invalidateQueries({ queryKey: ['lista-espera'] });
    setShowTrocarCorretorDialog(false);
    setClienteSelecionado(null);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Lista de Espera</h1>
              <p className="text-slate-600">Gerencie clientes aguardando atendimento</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Filtros por Loja */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Loja</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filtroLoja === "todos" ? "default" : "outline"}
                onClick={() => setFiltroLoja("todos")}
                size="sm"
              >
                Todos
              </Button>
              {lojas.map((loja) => (
                <Button
                  key={loja}
                  variant={filtroLoja === loja ? "default" : "outline"}
                  onClick={() => setFiltroLoja(loja)}
                  size="sm"
                >
                  {loja}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Espera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Clientes em Espera
              <Badge variant="secondary" className="ml-2">
                {listaEspera.length} {listaEspera.length === 1 ? 'cliente' : 'clientes'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Carregando lista de espera...</p>
              </div>
            ) : listaEspera.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente na lista de espera</p>
              </div>
            ) : (
              <div className="space-y-4">
                {listaEspera.map((cliente) => {
                  const tempoExcedido = verificarTempoExcedido(cliente.created_at);
                  const tempoEspera = Math.floor((new Date().getTime() - new Date(cliente.created_at).getTime()) / (1000 * 60));

                  return (
                    <div key={cliente.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{cliente.cliente_nome}</h3>
                            <Badge variant="outline">{cliente.loja}</Badge>
                            {tempoExcedido && (
                              <Badge variant="destructive">Tempo Excedido</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                            <p><strong>CPF:</strong> {cliente.cliente_cpf}</p>
                            {cliente.cliente_whatsapp && (
                              <p><strong>WhatsApp:</strong> {cliente.cliente_whatsapp}</p>
                            )}
                            {cliente.corretor_nome && (
                              <p><strong>Corretor:</strong> {cliente.corretor_nome}</p>
                            )}
                            {cliente.empreendimento && (
                              <p><strong>Empreendimento:</strong> {cliente.empreendimento}</p>
                            )}
                          </div>
                          
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {tempoEspera} min na fila
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleIniciarVisita(cliente)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar Visita
                          </Button>
                          
                          {tempoExcedido && (
                            <Button
                              onClick={() => handleTrocarCorretor(cliente)}
                              variant="destructive"
                              size="sm"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Excedeu o Tempo
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddClienteDialog 
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onClienteAdicionado={() => {
            queryClient.invalidateQueries({ queryKey: ['lista-espera'] });
            setShowAddDialog(false);
          }}
        />

        {clienteSelecionado && (
          <>
            <IniciarVisitaDialog
              open={showIniciarVisitaDialog}
              onOpenChange={setShowIniciarVisitaDialog}
              cliente={clienteSelecionado}
              onVisitaIniciada={onVisitaIniciada}
            />

            <TrocarCorretorDialog
              open={showTrocarCorretorDialog}
              onOpenChange={setShowTrocarCorretorDialog}
              cliente={clienteSelecionado}
              onCorretorTrocado={onCorretorTrocado}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default ListaEspera;
