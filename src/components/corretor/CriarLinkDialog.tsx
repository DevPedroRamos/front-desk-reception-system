
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Link2 } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface CriarLinkDialogProps {
  onLinkCreated: () => void;
}

export function CriarLinkDialog({ onLinkCreated }: CriarLinkDialogProps) {
  const { toast } = useToast();
  const { userProfile } = useUserRole();

  const criarLinkMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile?.cpf) {
        throw new Error('CPF do corretor não encontrado');
      }

      // Buscar dados do corretor na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, apelido')
        .eq('cpf', userProfile.cpf)
        .single();

      if (userError || !userData) {
        throw new Error('Dados do corretor não encontrados');
      }

      const { data: token, error } = await supabase.rpc('gerar_link_agendamento_direto', {
        corretor_uuid: userData.id,
        corretor_nome_param: userData.apelido,
        corretor_apelido_param: userData.apelido
      });

      if (error) {
        throw error;
      }

      return { token, corretor: userData };
    },
    onSuccess: ({ token, corretor }) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/agendar/${token}?apelido=${encodeURIComponent(corretor.apelido)}&corretor_id=${corretor.id}`;
      
      // Copiar para área de transferência
      navigator.clipboard.writeText(link).then(() => {
        toast({
          title: "Link criado e copiado!",
          description: "O link de agendamento foi criado e copiado para a área de transferência.",
        });
      }).catch(() => {
        toast({
          title: "Link criado!",
          description: "O link de agendamento foi criado com sucesso.",
        });
      });

      onLinkCreated();
    },
    onError: (error) => {
      console.error('Erro ao criar link:', error);
      toast({
        title: "Erro ao criar link",
        description: "Não foi possível criar o link de agendamento.",
        variant: "destructive",
      });
    }
  });

  const handleCriarLink = () => {
    criarLinkMutation.mutate();
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleCriarLink}
      disabled={criarLinkMutation.isPending}
    >
      <Link2 className="h-4 w-4 mr-2" />
      {criarLinkMutation.isPending ? "Criando..." : "Copiar Link de Agendamento"}
    </Button>
  );
}
