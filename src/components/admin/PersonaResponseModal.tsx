import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PersonaAdminData } from "@/hooks/usePersonaAdminData";
import { format } from "date-fns";

interface PersonaResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: PersonaAdminData | null;
}

export function PersonaResponseModal({ isOpen, onClose, response }: PersonaResponseModalProps) {
  if (!response) return null;

  const formatKey = (key: string): string => {
    const keyMappings: Record<string, string> = {
      idade: 'Idade',
      sexo: 'Sexo',
      estado_civil: 'Estado Civil',
      profissao: 'Profissão',
      renda_familiar: 'Renda Familiar',
      composicao_familiar: 'Composição Familiar',
      regiao_residencia: 'Região de Residência',
      tipo_moradia_atual: 'Tipo de Moradia Atual',
      experiencia_imobiliaria: 'Experiência Imobiliária',
      motivacao_principal: 'Motivação Principal',
      orcamento_investimento: 'Orçamento de Investimento',
      prazo_compra: 'Prazo para Compra',
      caracteristicas_importantes: 'Características Importantes',
      localizacao_preferencia: 'Localização de Preferência',
      meio_transporte: 'Meio de Transporte',
      hobbies_interesses: 'Hobbies e Interesses',
      frequencia_viagens: 'Frequência de Viagens',
      canais_comunicacao: 'Canais de Comunicação',
      qualidades_consultor: 'Qualidades do Consultor',
      melhor_horario_contato: 'Melhor Horário para Contato',
      email: 'Email',
      telefone: 'Telefone'
    };

    return keyMappings[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Respostas do Questionário de Persona</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-semibold">{response.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-semibold">{response.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Submissão</p>
                  <p className="font-semibold">
                    {format(new Date(response.created_at), "dd/MM/yyyy 'às' HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Superintendência</p>
                  <Badge variant="secondary">{response.superintendencia}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Responses */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Respostas do Questionário</h3>
              {Object.entries(response.respostas).map(([key, value]) => (
                <div key={key} className="border-l-4 border-primary/20 pl-4 py-2">
                  <p className="font-medium text-sm text-muted-foreground mb-1">
                    {formatKey(key)}
                  </p>
                  <div className="text-sm">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                          <Badge key={index} variant="outline">
                            {String(item)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="bg-muted/30 p-2 rounded text-foreground">
                        {formatValue(value)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}