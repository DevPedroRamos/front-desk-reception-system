import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone, Apple } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listener para app instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      toast({
        title: "App Instalado!",
        description: "Front Desk System instalado com sucesso.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para iOS, sempre mostrar o botão se não estiver instalado
    if (iOS && !isStandalone) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isInstalled) {
      toast({
        title: "App já instalado",
        description: "O Front Desk System já está instalado.",
      });
      return;
    }

    // Para iOS
    if (isIOS) {
      toast({
        title: "Instalar no iOS",
        description: "Toque no ícone de compartilhamento (↗) e selecione 'Adicionar à Tela de Início'",
        duration: 6000,
      });
      return;
    }

    // Para Chrome/Edge com suporte PWA
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setCanInstall(false);
          toast({
            title: "Instalando...",
            description: "O app está sendo instalado.",
          });
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Erro durante instalação:', error);
        toast({
          title: "Erro na instalação",
          description: "Tente usar o menu do navegador para instalar.",
          variant: "destructive",
        });
      }
    } else {
      // Fallback para navegadores sem suporte ao prompt
      toast({
        title: "Instalação Manual",
        description: "Use o menu do navegador (⋮) e selecione 'Instalar app'",
        duration: 5000,
      });
    }
  };

  // Se já estiver instalado, mostrar botão com check
  if (isInstalled) {
    return (
      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
        <Check className="w-4 h-4 mr-1" />
        Instalado
      </Button>
    );
  }

  // Se não puder instalar, não mostrar botão
  if (!canInstall && !isIOS) {
    return null;
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleInstall}>
      {isIOS ? (
        <>
          <Apple className="w-4 h-4 mr-1" />
          Instalar
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-1" />
          Instalar App
        </>
      )}
    </Button>
  );
};