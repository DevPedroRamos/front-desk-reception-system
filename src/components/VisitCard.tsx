
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, User } from "lucide-react";

interface Visit {
  id: string;
  cliente_nome: string;
  corretor_nome: string;
  empreendimento: string;
  loja: string;
  mesa: number;
  horario_entrada: string;
  status: string;
}

interface VisitCardProps {
  visit: Visit;
  onFinalize?: (id: string) => void;
}

export function VisitCard({ visit, onFinalize }: VisitCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-100 text-green-800 border-green-200";
      case "finalizado": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span className="font-semibold text-slate-900">{visit.cliente_nome}</span>
          </div>
          <Badge className={getStatusColor(visit.status)}>
            {visit.status === "ativo" ? "Em Atendimento" : "Finalizado"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">Corretor:</span>
            <span className="font-medium">{visit.corretor_nome}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">Mesa:</span>
            <span className="font-medium">{visit.mesa}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-slate-600">Entrada:</span>
            <span className="font-medium">{formatTime(visit.horario_entrada)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Loja:</span>
            <span className="font-medium">{visit.loja}</span>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="text-sm text-slate-600">Empreendimento:</div>
          <div className="font-medium text-slate-900">{visit.empreendimento}</div>
        </div>

        {visit.status === "ativo" && onFinalize && (
          <div className="pt-3 border-t border-slate-100">
            <Button 
              size="sm" 
              onClick={() => onFinalize(visit.id)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Finalizar Atendimento
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
