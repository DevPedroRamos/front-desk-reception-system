import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { Copy, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function GerarLink() {
  const [cpf, setCpf] = useState('');
  const [linkGerado, setLinkGerado] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { formatCpf } = useCpfValidation();

  const handleGerarLink = async () => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast({
        title: 'CPF inválido',
        description: 'Por favor, digite um CPF válido',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const cpfLimpo = cpf.replace(/\D/g, '');

      // Buscar dados do corretor
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, cpf')
        .eq('cpf', cpfLimpo)
        .maybeSingle();

      if (userError || !userData) {
        toast({
          title: 'Corretor não encontrado',
          description: 'CPF não cadastrado no sistema',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Gerar token único usando a função SQL
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_scheduling_token');

      if (tokenError || !tokenData) {
        throw new Error('Erro ao gerar token');
      }

      // Criar agendamento
      const { error: insertError } = await supabase
        .from('agendamentos')
        .insert({
          token: tokenData,
          corretor_id: userData.id,
          corretor_nome: userData.name,
          corretor_cpf: userData.cpf,
          status: 'pendente',
        });

      if (insertError) throw insertError;

      // Usar domínio configurado ao invés de window.location.origin
      const link = `https://vcperto.com/agendar/${tokenData}`;
      setLinkGerado(link);

      toast({
        title: 'Link gerado com sucesso!',
        description: 'Compartilhe este link com seu cliente',
      });
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copiarLink = () => {
    navigator.clipboard.writeText(linkGerado);
    toast({
      title: 'Link copiado!',
      description: 'O link foi copiado para a área de transferência',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-6 w-6" />
              Gerar Link de Agendamento
            </CardTitle>
            <CardDescription>
              Digite o CPF do corretor para gerar um link único de agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF do Corretor</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                maxLength={14}
              />
            </div>

            <Button onClick={handleGerarLink} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Link'
              )}
            </Button>

            {linkGerado && (
              <Card className="bg-muted">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Link Gerado</Label>
                    <div className="flex gap-2">
                      <Input value={linkGerado} readOnly />
                      <Button onClick={copiarLink} size="icon" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Este link é válido por 48 horas. Compartilhe com o cliente para que ele possa confirmar o agendamento.
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
