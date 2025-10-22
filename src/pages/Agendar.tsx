import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCpfValidation } from '@/hooks/useCpfValidation';
import { Calendar, Loader2, User } from 'lucide-react';

export default function Agendar() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [corretorNome, setCorretorNome] = useState('');
  const [formData, setFormData] = useState({
    clienteNome: '',
    clienteCpf: '',
    clienteTelefone: '',
    dataVisita: '',
  });
  const { toast } = useToast();
  const { formatCpf } = useCpfValidation();

  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        console.log('❌ Token não fornecido na URL');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Verificando token recebido:', token);
        console.log('📊 Tamanho do token:', token.length);
        console.log('🔗 URL completa:', window.location.href);
        
        const { data, error } = await supabase
          .from('agendamentos')
          .select(`
            corretor_nome, 
            status, 
            expires_at, 
            token,
            users!agendamentos_corretor_id_fkey(apelido)
          `)
          .eq('token', token)
          .maybeSingle();

        console.log('📦 Resposta do Supabase:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);

        if (error) {
          console.error('❌ Erro do Supabase ao buscar agendamento:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          toast({
            title: 'Erro ao buscar agendamento',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        if (!data) {
          console.log('❌ Agendamento não encontrado para o token:', token);
          console.log('💡 Verificar: política RLS, expiração, ou token incorreto');
          toast({
            title: 'Link inválido',
            description: 'Este link de agendamento não existe',
            variant: 'destructive',
          });
          return;
        }

        console.log('✅ Dados do agendamento encontrado:', {
          corretor: data.corretor_nome,
          status: data.status,
          expires_at: data.expires_at,
          token_match: data.token === token
        });

        if (data.status !== 'pendente') {
          toast({
            title: 'Agendamento já confirmado',
            description: 'Este agendamento já foi confirmado',
            variant: 'destructive',
          });
          return;
        }

        if (new Date(data.expires_at) < new Date()) {
          toast({
            title: 'Link expirado',
            description: 'Este link de agendamento já expirou',
            variant: 'destructive',
          });
          return;
        }

        setCorretorNome(data.users?.apelido || data.corretor_nome);
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível verificar o agendamento',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clienteNome || !formData.clienteCpf || !formData.clienteTelefone || !formData.dataVisita) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Confirmando agendamento com token:', token);
      console.log('Dados do formulário:', formData);

      const { data: updateResult, error } = await supabase
        .from('agendamentos')
        .update({
          cliente_nome: formData.clienteNome,
          cliente_cpf: formData.clienteCpf.replace(/\D/g, ''),
          cliente_telefone: formData.clienteTelefone,
          data_visita: formData.dataVisita,
          status: 'confirmado',
          confirmed_at: new Date().toISOString(),
        })
        .eq('token', token)
        .select();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Agendamento atualizado:', updateResult);

      toast({
        title: 'Agendamento confirmado!',
        description: 'Seu agendamento foi confirmado com sucesso. Até breve!',
      });

      // Redirecionar para o site principal após 2 segundos
      setTimeout(() => {
        window.location.href = 'https://metrocasa.com.br';
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao confirmar agendamento:', error);
      toast({
        title: 'Erro ao confirmar',
        description: error.message || 'Não foi possível confirmar o agendamento',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Confirmar Agendamento
          </CardTitle>
          <CardDescription>
            Agendamento com <span className="font-semibold">{corretorNome}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.clienteNome}
                onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.clienteCpf}
                onChange={(e) => setFormData({ ...formData, clienteCpf: formatCpf(e.target.value) })}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone/WhatsApp *</Label>
              <Input
                id="telefone"
                value={formData.clienteTelefone}
                onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data e Hora da Visita *</Label>
              <Input
                id="data"
                type="datetime-local"
                value={formData.dataVisita}
                onChange={(e) => setFormData({ ...formData, dataVisita: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                'Confirmar Agendamento'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
