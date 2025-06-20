
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CriarLinkDialogProps {
  onLinkCreated: () => void;
}

export function CriarLinkDialog({ onLinkCreated }: CriarLinkDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [titulo, setTitulo] = useState('');

  const criarLinkMutation = useMutation({
    mutationFn: async (linkTitulo: string) => {
      const { data, error } = await supabase.rpc('gerar_link_corretor', {
        corretor_uuid: user?.id,
        link_titulo: linkTitulo || 'Link de Agendamento'
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (token) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/agendar/${token}`;
      
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
    criarLinkMutation.mutate(titulo);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Criar Link de Agendamento
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
            {criarLinkMutation.isPending ? "Criando..." : "Criar Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
