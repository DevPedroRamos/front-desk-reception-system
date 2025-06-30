
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ValidacoesProps {
  brindes: any[];
  onUpdate: () => void;
}

export const PesquisaRelatorioValidacoes = ({ brindes, onUpdate }: ValidacoesProps) => {
  const [codigoValidacao, setCodigoValidacao] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleValidarBrinde = async (brindeId: string) => {
    try {
      const { error } = await supabase
        .from('brindes')
        .update({ 
          validado: true, 
          data_validacao: new Date().toISOString(),
          codigo_usado: codigoValidacao 
        })
        .eq('id', brindeId);

      if (error) throw error;

      toast({
        title: "Brinde validado com sucesso!",
        description: "O brinde foi marcado como validado.",
      });

      setCodigoValidacao('');
      onUpdate();
    } catch (error) {
      console.error('Erro ao validar brinde:', error);
      toast({
        title: "Erro ao validar brinde",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleInvalidarBrinde = async (brindeId: string) => {
    try {
      const { error } = await supabase
        .from('brindes')
        .update({ 
          validado: false, 
          data_validacao: null,
          codigo_usado: null 
        })
        .eq('id', brindeId);

      if (error) throw error;

      toast({
        title: "Brinde invalidado",
        description: "O brinde foi marcado como não validado.",
      });

      onUpdate();
    } catch (error) {
      console.error('Erro ao invalidar brinde:', error);
      toast({
        title: "Erro ao invalidar brinde",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const brindesFiltrados = brindes.filter(brinde => 
    brinde.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brinde.cliente_cpf.includes(searchTerm) ||
    brinde.corretor_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brinde.tipo_brinde.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const brindesNaoValidados = brindesFiltrados.filter(b => !b.validado);
  const brindesValidados = brindesFiltrados.filter(b => b.validado);

  return (
    <div className="space-y-6">
      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Brindes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF, corretor ou tipo de brinde..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brindes Não Validados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Brindes Pendentes de Validação ({brindesNaoValidados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brindesNaoValidados.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum brinde pendente de validação encontrado.
              </p>
            ) : (
              brindesNaoValidados.map((brinde) => (
                <div key={brinde.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">{brinde.cliente_nome}</h4>
                      <p className="text-sm text-muted-foreground">CPF: {brinde.cliente_cpf}</p>
                      <p className="text-sm text-muted-foreground">Corretor: {brinde.corretor_nome}</p>
                      <Badge variant="outline">{brinde.tipo_brinde}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Brinde</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <p><strong>Cliente:</strong> {brinde.cliente_nome}</p>
                            <p><strong>CPF:</strong> {brinde.cliente_cpf}</p>
                            <p><strong>Corretor:</strong> {brinde.corretor_nome}</p>
                            <p><strong>Tipo:</strong> {brinde.tipo_brinde}</p>
                            <p><strong>Data:</strong> {new Date(brinde.created_at).toLocaleString()}</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        onClick={() => handleValidarBrinde(brinde.id)}
                        size="sm"
                        disabled={!codigoValidacao}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Validar
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código de validação"
                      value={codigoValidacao}
                      onChange={(e) => setCodigoValidacao(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brindes Validados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Brindes Validados ({brindesValidados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {brindesValidados.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum brinde validado encontrado.
              </p>
            ) : (
              brindesValidados.map((brinde) => (
                <div key={brinde.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">{brinde.cliente_nome}</h4>
                      <p className="text-sm text-muted-foreground">CPF: {brinde.cliente_cpf}</p>
                      <p className="text-sm text-muted-foreground">Corretor: {brinde.corretor_nome}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{brinde.tipo_brinde}</Badge>
                        <Badge variant="default">Validado</Badge>
                      </div>
                      {brinde.codigo_usado && (
                        <p className="text-sm text-muted-foreground">Código: {brinde.codigo_usado}</p>
                      )}
                      {brinde.data_validacao && (
                        <p className="text-sm text-muted-foreground">
                          Validado em: {new Date(brinde.data_validacao).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleInvalidarBrinde(brinde.id)}
                      variant="outline"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" />
                      Invalidar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
