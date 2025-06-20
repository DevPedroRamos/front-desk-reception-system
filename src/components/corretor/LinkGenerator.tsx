
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Copy, Link } from 'lucide-react';

interface LinkGeneratorProps {
  agendamentoId: string;
  onTokenGenerated: () => void;
}

export function LinkGenerator({ agendamentoId, onTokenGenerated }: LinkGeneratorProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const generateTokenMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('gerar_token_agendamento', {
        agendamento_uuid: agendamentoId
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (token) => {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/confirmar-agendamento/${token}`;
      setGeneratedLink(link);
      onTokenGenerated();
      
      toast({
        title: "Link gerado com sucesso!",
        description: "O link de confirmação foi criado e está pronto para ser compartilhado.",
      });
    },
    onError: (error) => {
      console.error('Erro ao gerar token:', error);
      toast({
        title: "Erro ao gerar link",
        description: "Não foi possível gerar o link de confirmação.",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link className="h-4 w-4 mr-2" />
          Gerar Link
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Link de Confirmação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!generatedLink ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Clique no botão abaixo para gerar um link único que o cliente poderá usar para confirmar este agendamento.
              </p>
              <Button 
                onClick={() => generateTokenMutation.mutate()}
                disabled={generateTokenMutation.isPending}
                className="w-full"
              >
                {generateTokenMutation.isPending ? "Gerando..." : "Gerar Link"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="generated-link">Link de Confirmação</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-link"
                    value={generatedLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <p>• Este link expira em 7 dias</p>
                <p>• O cliente poderá usar para confirmar o agendamento</p>
                <p>• Compartilhe via WhatsApp, email ou SMS</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
