
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, Phone, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface Visit {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp?: string;
  corretor_nome: string;
  loja: string;
  andar: string;
  mesa: number;
  status: string;
  horario_entrada?: string;
  horario_saida?: string;
  created_at: string;
}

interface VisitCardProps {
  visit: Visit;
  canFinalize?: boolean;
}

export function VisitCard({ visit, canFinalize = true }: VisitCardProps) {
  const queryClient = useQueryClient();

  const handleFinalize = async () => {
    try {
      const { error } = await supabase.rpc('finalizar_visita', {
        visit_id: visit.id
      });

      if (error) throw error;

      toast({
        title: "Visita finalizada",
        description: "A visita foi finalizada com sucesso.",
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao finalizar visita",
        variant: "destructive",
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return "Data inválida";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span className="font-medium">{visit.cliente_nome}</span>
              <Badge variant={visit.status === 'ativo' ? 'default' : 'secondary'}>
                {visit.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{visit.loja} - {visit.andar} - Mesa {visit.mesa}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{formatDateTime(visit.created_at)}</span>
              </div>
              
              {visit.cliente_whatsapp && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{visit.cliente_whatsapp}</span>
                </div>
              )}
              
              <div>
                <span className="text-slate-500">Corretor:</span> {visit.corretor_nome}
              </div>
            </div>
          </div>
          
          {visit.status === 'ativo' && canFinalize && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFinalize}
              className="ml-4"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Finalizar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
