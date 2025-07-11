import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      toast({
        title: "App instalado!",
        description: "O Front Desk foi instalado com sucesso no seu dispositivo.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // PWA disponível para instalação
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Instalação iniciada",
          description: "O app está sendo instalado...",
        });
      }
      
      setDeferredPrompt(null);
    } else {
      // Fallback - mostrar instruções
      toast({
        title: "Como instalar o app",
        description: "Use o menu do navegador (⋮) e selecione 'Instalar app' ou 'Adicionar à tela inicial'",
        duration: 5000,
      });
    }
  };

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors w-full"
    >
      <Download className="h-4 w-4" />
      <span className="text-sm font-medium">Instalar App</span>
    </button>
  );
}