import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonaAdminData } from "@/hooks/usePersonaAdminData";
import { format } from "date-fns";
import { User, GraduationCap, Briefcase, Heart, Target, MessageSquare } from "lucide-react";

interface PersonaResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: PersonaAdminData | null;
}

export function PersonaResponseModal({ isOpen, onClose, response }: PersonaResponseModalProps) {
  if (!response) return null;

  // Complete question mapping for all sections
  const questionMappings: Record<string, Record<string, string>> = {
    dados_pessoais: {
      nome: 'Nome',
      apelido: 'Apelido',
      idade: 'Qual é a sua idade?',
      sexo: 'Qual é o seu sexo?',
      estado_civil: 'Qual é o seu estado civil?',
      tem_filhos: 'Você tem filhos?',
      nasceu_sao_paulo: 'Você nasceu em São Paulo/SP?',
      nivel_educacao: 'Qual é o seu nível de educação?',
      quantos_idiomas: 'Quantos idiomas você fala?'
    },
    experiencia_profissional: {
      experiencia_imobiliario: 'Você já teve experiência no mercado imobiliário anteriormente?',
      creci: 'Você possui CRECI definitivo ou estagiário ativo?',
      canais_atualizacao: 'Como você costuma se manter atualizado sobre o mercado imobiliário?',
      estilo_negociacao: 'Qual é o seu estilo de negociação?',
      tipo_cliente_sucesso: 'Qual tipo de cliente você tem mais sucesso em tratar?',
      estrategia_indecisos: 'Qual é a sua estratégia para lidar com clientes indecisos?',
      lidar_rejeicao: 'Como você lida com a rejeição ou com clientes que não estão satisfeitos?',
      qualidades_consultor: 'Que qualidades você acredita que um bom consultor de vendas deve ter?',
      participacao_eventos: 'Você já participou de eventos de networking ou feiras do setor?',
      acompanhamento_pos_venda: 'Como você faz acompanhamento com clientes após a venda?',
      visao_marketing_digital: 'Qual é a sua visão sobre a importância do marketing digital no setor imobiliário?',
      experiencia_gestao: 'Você já teve experiência com gestão de equipe?'
    },
    motivacao_objetivos: {
      maior_motivacao: 'Qual é a sua maior motivação?',
      objetivo_metrocasa: 'Qual é o seu maior objetivo na Metrocasa?'
    },
    rotina_localizacao: {
      translado_trabalho: 'Como você faz o seu translado de casa para o trabalho?',
      tempo_trajeto: 'Qual é o tempo de trajeto entre sua casa e trabalho?',
      regiao_residencia: 'Em qual região você reside?',
      suporte_dificuldade: 'Como você busca suporte quando encontra dificuldades no trabalho?',
      dispositivo_trabalho: 'Que tipo de dispositivo você usa no trabalho?',
      aplicativos_ferramentas: 'Quais aplicativos e ferramentas você utiliza no dia a dia?'
    },
    estilo_vida: {
      exercicios_fisicos: 'Com que frequência você pratica exercícios físicos?',
      frequencia_praias_parques: 'Com que frequência você vai a praias ou parques?',
      frequencia_viagens: 'Com que frequência você viaja?',
      receber_informacoes: 'Como você prefere receber informações importantes?',
      canais_comunicacao: 'Quais canais de comunicação você prefere usar?'
    },
    informacoes_adicionais: {
      horario_chegada: 'Que horas você costuma chegar no trabalho?',
      horario_saida: 'Que horas você costuma sair do trabalho?',
      dias_folga: 'Quais são os seus dias de folga?',
      atividade_folga: 'O que você gosta de fazer nos seus dias de folga?',
      quantidade_filhos: 'Quantos filhos você tem?',
      escolaridade_detalhada: 'Detalhe sua escolaridade',
      pos_graduado: 'Você é pós-graduado?',
      tecnico: 'Você tem formação técnica?',
      gerencia: 'Qual gerência você trabalha?',
      superintendencia: 'Qual superintendência você trabalha?',
      diretoria: 'Qual diretoria você trabalha?',
      primeiro_gerente: 'Quem foi seu primeiro gerente?'
    }
  };

  // Section configuration with icons and titles
  const sectionConfig: Record<string, { title: string; icon: any; color: string }> = {
    dados_pessoais: { title: 'Dados Pessoais', icon: User, color: 'text-blue-600' },
    experiencia_profissional: { title: 'Experiência Profissional', icon: GraduationCap, color: 'text-green-600' },
    motivacao_objetivos: { title: 'Motivação e Objetivos', icon: Target, color: 'text-purple-600' },
    rotina_localizacao: { title: 'Rotina e Localização', icon: Briefcase, color: 'text-orange-600' },
    estilo_vida: { title: 'Estilo de Vida', icon: Heart, color: 'text-pink-600' },
    informacoes_adicionais: { title: 'Informações Adicionais', icon: MessageSquare, color: 'text-indigo-600' }
  };

  const formatValue = (value: any): JSX.Element => {
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {String(item)}
            </Badge>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div className="bg-muted/30 p-3 rounded-md border-l-4 border-primary/30">
          <p className="text-sm leading-relaxed">{value}</p>
        </div>
      );
    }
    
    return <p className="text-sm font-medium">{String(value)}</p>;
  };

  const renderSection = (sectionKey: string, sectionData: any) => {
    const config = sectionConfig[sectionKey];
    if (!config || !sectionData || typeof sectionData !== 'object') return null;

    const Icon = config.icon;
    const questions = questionMappings[sectionKey] || {};

    return (
      <Card key={sectionKey} className="border-l-4 border-l-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className={`w-5 h-5 ${config.color}`} />
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(sectionData).map(([key, value]) => {
            const questionText = questions[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={key} className="border-l-2 border-muted-foreground/20 pl-4 py-2">
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  {questionText}
                </p>
                <div className="ml-2">
                  {formatValue(value)}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Respostas do Questionário de Persona
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[75vh] pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nome</p>
                    <p className="font-semibold text-foreground">{response.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">CPF</p>
                    <p className="font-semibold text-foreground">{response.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Data de Submissão</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(response.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Superintendência</p>
                    <Badge variant="secondary" className="font-medium">
                      {response.superintendencia}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(response.respostas).map(([sectionKey]) => {
                const config = sectionConfig[sectionKey];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <Badge 
                    key={sectionKey} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      document.getElementById(`section-${sectionKey}`)?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {config.title}
                  </Badge>
                );
              })}
            </div>

            {/* Structured Responses */}
            <div className="space-y-6">
              {Object.entries(response.respostas).map(([sectionKey, sectionData]) => (
                <div key={sectionKey} id={`section-${sectionKey}`}>
                  {renderSection(sectionKey, sectionData)}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}