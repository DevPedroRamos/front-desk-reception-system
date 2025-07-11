import { useState, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setDeferredPrompt(null);
      setIsInstalled(true);
      toast({
        title: "App instalado!",
        description: "O Front Desk foi instalado com sucesso no seu dispositivo.",
      });
    };

    checkIfInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Debug: forçar evento após alguns segundos se não disparar
    const debugTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        console.log('PWA install prompt not available - may already be installed or criteria not met');
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(debugTimer);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    console.log('Install button clicked', { deferredPrompt: !!deferredPrompt, isInstalled });
    
    if (isInstalled) {
      toast({
        title: "App já instalado",
        description: "O Front Desk já está instalado no seu dispositivo.",
      });
      return;
    }

    if (deferredPrompt) {
      try {
        console.log('Triggering install prompt');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User choice:', outcome);
        
        if (outcome === 'accepted') {
          toast({
            title: "Instalação iniciada",
            description: "O app está sendo instalado...",
          });
        } else {
          toast({
            title: "Instalação cancelada",
            description: "Você pode instalar o app a qualquer momento.",
          });
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error during PWA install:', error);
        toast({
          title: "Erro na instalação",
          description: "Tente usar o menu do navegador para instalar o app.",
        });
      }
    } else {
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
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
        isInstalled 
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
    >
      {isInstalled ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {isInstalled ? 'App Instalado' : 'Instalar App'}
      </span>
    </button>
  );
}