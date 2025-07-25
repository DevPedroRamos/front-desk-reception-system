import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

interface Visit {
  id: string;
  corretor_nome: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
  cliente_nome: string;
}

interface NotificationPopupProps {
  visit: Visit;
  onClose: () => void;
}

export function NotificationPopup({ visit, onClose }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 9000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <Card className="p-12 max-w-4xl w-full mx-8 border-4 border-primary shadow-2xl">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="bg-primary text-primary-foreground rounded-full p-6">
              <UserCheck className="h-16 w-16" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold text-primary">
            Nova Visita Registrada!
          </h1>

          {/* Visit Details */}
          <div className="space-y-6 text-2xl">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-left">
                <span className="font-semibold text-muted-foreground">Corretor:</span>
                <div className="text-3xl font-bold mt-2">{visit.corretor_nome}</div>
              </div>
              
              <div className="text-right">
                <span className="font-semibold text-muted-foreground">Local:</span>
                <div className="text-3xl font-bold mt-2">
                  {visit.loja} - {visit.andar} - Mesa {visit.mesa}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-border pt-6">
              <span className="font-semibold text-muted-foreground">Horário de Entrada:</span>
              <div className="text-3xl font-bold mt-2">
                {format(new Date(visit.horario_entrada), 'HH:mm', { locale: ptBR })}
              </div>
            </div>

            {/* Client Name - Highlighted */}
            <div className="bg-primary text-primary-foreground rounded-lg p-6 mt-8">
              <span className="text-xl font-semibold opacity-90">Cliente:</span>
              <div className="text-4xl font-bold mt-2">{visit.cliente_nome}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}