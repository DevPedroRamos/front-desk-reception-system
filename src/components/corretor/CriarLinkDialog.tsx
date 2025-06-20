
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [isOpen, setIsOpen] = useState(false);
  const [titulo, setTitulo] = useState('');

  const criarLinkMutation = useMutation({
    mutationFn: async (linkTitulo: string) => {
      if (!userProfile?.cpf) {
        throw new Error('CPF do corretor não encontrado');
      }

      // Buscar dados do corretor na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, apelido')
        .eq('cpf', userProfile.cpf)
        .single();

      if (userError || !userData) {
        throw new Error('Dados do corretor não encontrados');
      }

      const { data: token, error } = await supabase.rpc('gerar_link_agendamento_direto', {
        corretor_uuid: userData.id,
        corretor_nome_param: userData.name,
        corretor_apelido_param: userData.apelido
      });

      if (error) {
        throw error;
      }

      return { token, corretor: userData };
    },
    onSuccess: ({ token, corretor }) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/agendar/${token}?nome=${encodeURIComponent(corretor.name)}&apelido=${encodeURIComponent(corretor.apelido)}&corretor_id=${corretor.id}`;
      
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
      setIsOpen(false);
      setTitulo('');
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
    criarLinkMutation.mutate(titulo || 'Link de Agendamento');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-2" />
          Copiar Link de Agendamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Link de Agendamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título do Link (opcional)</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Link de Agendamento"
            />
          </div>

          <div className="text-xs text-gray-500">
            <p>• O link permitirá que clientes agendem diretamente com você</p>
            <p>• Clientes poderão escolher data e hora disponível</p>
            <p>• O link será copiado automaticamente para área de transferência</p>
          </div>

          <Button 
            onClick={handleCriarLink}
            disabled={criarLinkMutation.isPending}
            className="w-full"
          >
            {criarLinkMutation.isPending ? "Criando..." : "Criar e Copiar Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
