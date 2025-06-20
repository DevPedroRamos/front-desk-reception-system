import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IniciarVisitaDialog } from '@/components/IniciarVisitaDialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, UserCheck, Search, XCircle } from 'lucide-react';

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  whatsapp?: string;
  createdAt: string;
}

export default function ListaEspera() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error);
        toast({
          title: "Erro ao carregar",
          description: "Ocorreu um erro ao carregar a lista de espera.",
          variant: "destructive",
        });
        return;
      }

      setClientes(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async () => {
    // Implementar a lógica para criar um novo cliente
    toast({
      title: "Funcionalidade em breve!",
      description: "Aguarde novas implementações.",
    });
  };

  const filteredClients = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lista de Espera</h1>
            <p className="text-slate-600">Gerencie os clientes na lista de espera</p>
          </div>
          <Button onClick={handleCreateClient}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Clientes na Lista de Espera</CardTitle>
            <CardDescription>
              Clientes aguardando atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Pesquisar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Carregando...</TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Nenhum cliente encontrado.</TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.cpf}</TableCell>
                      <TableCell>{cliente.whatsapp || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(cliente.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedCliente(cliente)}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Iniciar Visita
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Correção na chamada do IniciarVisitaDialog */}
      {selectedCliente && (
        <IniciarVisitaDialog
          isOpen={!!selectedCliente}
          onClose={() => setSelectedCliente(null)}
          cliente={selectedCliente}
          onVisitaIniciada={loadData}
        />
      )}
    </Layout>
  );
}
