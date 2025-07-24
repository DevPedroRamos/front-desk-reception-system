import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VisitasTable } from '@/components/tv/VisitasTable';
import { NotificationPopup } from '@/components/tv/NotificationPopup';
import { YouTubeEmbed } from '@/components/tv/YouTubeEmbed';
import { PromoBanner } from '@/components/tv/PromoBanner';

interface Visit {
  id: string;
  corretor_nome: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
  cliente_nome: string;
}

export default function TV() {
  const [newVisit, setNewVisit] = useState<Visit | null>(null);

  useEffect(() => {
    // Subscribe to real-time changes in visits table
    const channel = supabase
      .channel('visits-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'visits'
        },
        (payload) => {
          console.log('Nova visita detectada:', payload);
          const visit = payload.new as Visit;
          setNewVisit(visit);
          
          // Auto-close popup after 3 seconds
          setTimeout(() => {
            setNewVisit(null);
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-4xl font-bold text-center">
          Central de Monitoramento - TV
        </h1>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-8">
        {/* Top Section: YouTube + Visits Table */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* YouTube Video */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Vídeo Institucional</h2>
            <YouTubeEmbed />
          </div>

          {/* Visits Table */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Últimas Visitas</h2>
            <VisitasTable />
          </div>
        </div>

        {/* Bottom Section: Promotional Banner */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Promoções & Novidades</h2>
          <PromoBanner />
        </div>
      </div>

      {/* Notification Popup */}
      {newVisit && (
        <NotificationPopup visit={newVisit} onClose={() => setNewVisit(null)} />
      )}
    </div>
  );
}