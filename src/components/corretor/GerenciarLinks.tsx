
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GerenciarLinks() {
  const { toast } = useToast();
  const { userProfile } = useUserRole();

  // Buscar links do corretor
  const { data: links = [], refetch } = useQuery({
    queryKey: ['corretor-links', userProfile?.cpf],
    queryFn: async () => {
      if (!userProfile?.cpf) return [];
      
      // Buscar o ID do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, apelido')
        .eq('cpf', userProfile.cpf)
        .single();

      if (userError || !userData) {
        console.error('Erro ao buscar usuário:', userError);
        return [];
      }

      const { data, error } = await supabase
        .from('corretor_links')
        .select('*')
        .eq('corretor_id', userData.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar links:', error);
        return [];
      }
      
      return data?.map(link => ({ ...link, corretor: userData })) || [];
    },
    enabled: !!userProfile?.cpf
  });

  const toggleLinkMutation = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('corretor_links')
        .update({ ativo: !ativo, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Link atualizado",
        description: "Status do link foi alterado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar link:', error);
      toast({
        title: "Erro ao atualizar link",
        description: "Não foi possível atualizar o status do link.",
        variant: "destructive",
      });
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('corretor_links')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Link removido",
        description: "Link foi removido com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Erro ao remover link:', error);
      toast({
        title: "Erro ao remover link",
        description: "Não foi possível remover o link.",
        variant: "destructive",
      });
    }
  });

  const copiarLink = (token: string, corretor: any) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/agendar/${token}?apelido=${encodeURIComponent(corretor.apelido)}&corretor_id=${corretor.id}`;
    
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    });
  };

  if (links.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">Nenhum link de agendamento criado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <Card key={link.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{link.titulo}</h3>
                  <Badge variant={link.ativo ? "default" : "secondary"}>
                    {link.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Criado em {format(new Date(link.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {window.location.origin}/agendar/{link.token}?apelido={link.corretor?.apelido}&corretor_id={link.corretor?.id}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copiarLink(link.token, link.corretor)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleLinkMutation.mutate({ id: link.id, ativo: link.ativo })}
                  disabled={toggleLinkMutation.isPending}
                >
                  {link.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteLinkMutation.mutate(link.id)}
                  disabled={deleteLinkMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
