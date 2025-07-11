import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Apple } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar se é iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    setIsInstalled(standalone);

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após um delay se não estiver instalado
      if (!standalone) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    // Listener para detecção de instalação
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      toast({
        title: "App Instalado!",
        description: "O Front Desk System foi instalado com sucesso.",
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Para iOS, mostrar instruções manuais
      if (isIOS) {
        toast({
          title: "Instalar no iOS",
          description: "Toque no ícone de compartilhamento e selecione 'Adicionar à Tela de Início'",
          duration: 5000,
        });
        return;
      }

      // Para outros navegadores sem suporte ao prompt automático
      toast({
        title: "Instalação Manual",
        description: "Use o menu do navegador (⋮) e selecione 'Instalar app' ou 'Adicionar à tela inicial'",
        duration: 5000,
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro durante a instalação:', error);
      toast({
        title: "Erro na Instalação",
        description: "Não foi possível instalar o app. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Não mostrar se já estiver instalado ou em modo standalone
  if (isInstalled || isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-2">
      <Card className="border border-border bg-card shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-destructive-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">Instalar App</CardTitle>
                <CardDescription className="text-xs">
                  Front Desk System
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowPrompt(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">
            Instale o app para acesso rápido e melhor experiência
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              {isIOS ? (
                <>
                  <Apple className="w-3 h-3 mr-1" />
                  Instruções
                </>
              ) : (
                <>
                  <Download className="w-3 h-3 mr-1" />
                  Instalar
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrompt(false)}
            >
              Depois
            </Button>
          </div>

          {isIOS && (
            <div className="mt-3 p-2 bg-muted rounded-md">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Smartphone className="w-3 h-3" />
                <span>iOS: Compartilhar → Adicionar à Tela de Início</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};