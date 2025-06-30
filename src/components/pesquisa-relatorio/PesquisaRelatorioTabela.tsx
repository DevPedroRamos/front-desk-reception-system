
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, Search } from 'lucide-react';
import { format } from 'date-fns';

interface TabelaProps {
  pesquisas: any[];
}

export const PesquisaRelatorioTabela = ({ pesquisas }: TabelaProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const pesquisasFiltradas = pesquisas.filter(pesquisa => 
    pesquisa.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pesquisa.cpf.includes(searchTerm) ||
    pesquisa.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pesquisa.corretor_nome && pesquisa.corretor_nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(pesquisasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPesquisas = pesquisasFiltradas.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    const headers = [
      'Nome Completo',
      'CPF',
      'Email',
      'Corretor',
      'Nota Consultor',
      'Comprou Empreendimento',
      'Empreendimento Interesse',
      'Onde Conheceu',
      'Validado',
      'Data Criação'
    ];

    const csvContent = [
      headers.join(','),
      ...pesquisasFiltradas.map(p => [
        p.nome_completo,
        p.cpf,
        p.email,
        p.corretor_nome || '',
        p.nota_consultor || '',
        p.comprou_empreendimento ? 'Sim' : 'Não',
        p.empreendimento_interesse || '',
        p.onde_conheceu || '',
        p.validado ? 'Sim' : 'Não',
        format(new Date(p.created_at), 'dd/MM/yyyy HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pesquisas_satisfacao_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Pesquisas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Corretor</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPesquisas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Nenhuma pesquisa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPesquisas.map((pesquisa) => (
                    <TableRow key={pesquisa.id}>
                      <TableCell className="font-medium">
                        {pesquisa.nome_completo}
                      </TableCell>
                      <TableCell>{pesquisa.cpf}</TableCell>
                      <TableCell>{pesquisa.email}</TableCell>
                      <TableCell>{pesquisa.corretor_nome || '-'}</TableCell>
                      <TableCell>
                        {pesquisa.nota_consultor ? (
                          <Badge variant="outline">
                            {pesquisa.nota_consultor}/5
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={pesquisa.validado ? "default" : "secondary"}
                        >
                          {pesquisa.validado ? 'Validado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(pesquisa.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Pesquisa</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Nome Completo</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.nome_completo}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">CPF</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.cpf}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Corretor</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.corretor_nome || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Nota do Consultor</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.nota_consultor || '-'}/5</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Comprou Empreendimento</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.comprou_empreendimento ? 'Sim' : 'Não'}</p>
                                </div>
                              </div>
                              
                              {pesquisa.empreendimento_interesse && (
                                <div>
                                  <label className="text-sm font-medium">Empreendimento de Interesse</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.empreendimento_interesse}</p>
                                </div>
                              )}
                              
                              {pesquisa.empreendimento_adquirido && (
                                <div>
                                  <label className="text-sm font-medium">Empreendimento Adquirido</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.empreendimento_adquirido}</p>
                                </div>
                              )}
                              
                              {pesquisa.onde_conheceu && (
                                <div>
                                  <label className="text-sm font-medium">Onde Conheceu</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.onde_conheceu}</p>
                                </div>
                              )}
                              
                              {pesquisa.avaliacao_experiencia && (
                                <div>
                                  <label className="text-sm font-medium">Avaliação da Experiência</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.avaliacao_experiencia}</p>
                                </div>
                              )}
                              
                              {pesquisa.dicas_sugestoes && (
                                <div>
                                  <label className="text-sm font-medium">Dicas e Sugestões</label>
                                  <p className="text-sm text-muted-foreground">{pesquisa.dicas_sugestoes}</p>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center pt-4">
                                <Badge variant={pesquisa.validado ? "default" : "secondary"}>
                                  {pesquisa.validado ? 'Validado' : 'Pendente'}
                                </Badge>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(pesquisa.created_at), 'dd/MM/yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, pesquisasFiltradas.length)} de {pesquisasFiltradas.length} resultados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
