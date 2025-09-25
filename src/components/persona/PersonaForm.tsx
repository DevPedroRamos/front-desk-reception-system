import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioQuestion } from './RadioQuestion';
import { CheckboxQuestion } from './CheckboxQuestion';
import { TextAreaQuestion } from './TextAreaQuestion';

interface PersonaFormProps {
  userData: {
    id: string;
    name: string;
    cpf: string;
    apelido: string;
  };
  onSubmit: (respostas: any) => void;
}

export function PersonaForm({ userData, onSubmit }: PersonaFormProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sections = [
    { title: 'Dados Pessoais', questions: personalQuestions },
    { title: 'Educação e Experiência', questions: educationQuestions },
    { title: 'Estilo de Trabalho', questions: workStyleQuestions },
    { title: 'Rotina e Localização', questions: routineQuestions },
    { title: 'Estilo de Vida', questions: lifestyleQuestions },
    { title: 'Comunicação', questions: communicationQuestions },
    { title: 'Informações Adicionais', questions: additionalQuestions }
  ];

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Structure answers by section
    const structuredAnswers = {
      dados_pessoais: {
        nome: userData.name,
        apelido: userData.apelido,
        idade: answers.idade,
        sexo: answers.sexo,
        estado_civil: answers.estado_civil,
        tem_filhos: answers.tem_filhos,
        nasceu_sao_paulo: answers.nasceu_sao_paulo,
        nivel_educacao: answers.nivel_educacao,
        quantos_idiomas: answers.quantos_idiomas
      },
      experiencia_profissional: {
        experiencia_imobiliario: answers.experiencia_imobiliario,
        creci: answers.creci,
        canais_atualizacao: answers.canais_atualizacao,
        estilo_negociacao: answers.estilo_negociacao,
        tipo_cliente_sucesso: answers.tipo_cliente_sucesso,
        estrategia_indecisos: answers.estrategia_indecisos,
        lidar_rejeicao: answers.lidar_rejeicao,
        qualidades_consultor: answers.qualidades_consultor,
        participacao_eventos: answers.participacao_eventos,
        acompanhamento_pos_venda: answers.acompanhamento_pos_venda,
        visao_marketing_digital: answers.visao_marketing_digital,
        experiencia_gestao: answers.experiencia_gestao
      },
      motivacao_objetivos: {
        maior_motivacao: answers.maior_motivacao,
        objetivo_metrocasa: answers.objetivo_metrocasa
      },
      rotina_localizacao: {
        translado_trabalho: answers.translado_trabalho,
        tempo_trajeto: answers.tempo_trajeto,
        regiao_residencia: answers.regiao_residencia,
        suporte_dificuldade: answers.suporte_dificuldade,
        dispositivo_trabalho: answers.dispositivo_trabalho,
        aplicativos_ferramentas: answers.aplicativos_ferramentas
      },
      estilo_vida: {
        exercicios_fisicos: answers.exercicios_fisicos,
        frequencia_praias_parques: answers.frequencia_praias_parques,
        frequencia_viagens: answers.frequencia_viagens,
        receber_informacoes: answers.receber_informacoes,
        canais_comunicacao: answers.canais_comunicacao
      },
      informacoes_adicionais: {
        horario_chegada: answers.horario_chegada,
        horario_saida: answers.horario_saida,
        dias_folga: answers.dias_folga,
        atividade_folga: answers.atividade_folga,
        quantidade_filhos: answers.quantidade_filhos,
        escolaridade_detalhada: answers.escolaridade_detalhada,
        pos_graduado: answers.pos_graduado,
        tecnico: answers.tecnico,
        gerencia: answers.gerencia,
        superintendencia: answers.superintendencia,
        diretoria: answers.diretoria,
        primeiro_gerente: answers.primeiro_gerente
      }
    };

    onSubmit(structuredAnswers);
  };

  const currentQuestions = sections[currentSection].questions;
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Info Header */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-2">Dados do Corretor</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Nome:</span> {userData.name}
          </div>
          <div>
            <span className="font-medium">Apelido:</span> {userData.apelido}
          </div>
          <div>
            <span className="font-medium">CPF:</span> {userData.cpf}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{sections[currentSection].title}</h2>
          <span className="text-sm text-muted-foreground">
            Seção {currentSection + 1} de {sections.length}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mb-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {currentQuestions.map((question, index) => {
          const key = `${currentSection}-${index}`;
          
          if (question.type === 'radio') {
            return (
              <RadioQuestion
                key={key}
                question={question.question}
                options={question.options || []}
                value={answers[question.id]}
                onChange={(value) => handleAnswerChange(question.id, value)}
                required={question.required}
              />
            );
          }
          
          if (question.type === 'checkbox') {
            return (
              <CheckboxQuestion
                key={key}
                question={question.question}
                options={question.options || []}
                value={answers[question.id] || []}
                onChange={(value) => handleAnswerChange(question.id, value)}
                required={question.required}
              />
            );
          }
          
          if (question.type === 'textarea') {
            return (
              <TextAreaQuestion
                key={key}
                question={question.question}
                value={answers[question.id] || ''}
                onChange={(value) => handleAnswerChange(question.id, value)}
                required={question.required}
              />
            );
          }
          
          return null;
        })}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentSection === 0}
        >
          Anterior
        </Button>
        
        {currentSection === sections.length - 1 ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar Questionário'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Próxima
          </Button>
        )}
      </div>
    </div>
  );
}

// Question definitions
const personalQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'idade',
    question: 'Qual é a sua idade?',
    type: 'radio',
    required: true,
    options: [
      'Menor que 20 anos',
      '20 - 25 anos',
      '26 - 30 anos',
      '31 - 35 anos',
      '35 anos ou mais'
    ]
  },
  {
    id: 'sexo',
    question: 'Qual é o seu sexo?',
    type: 'radio',
    required: true,
    options: ['Masculino', 'Feminino', 'Transgênero', 'Não-binário', 'Outros']
  },
  {
    id: 'estado_civil',
    question: 'Qual é o seu estado civil?',
    type: 'radio',
    required: true,
    options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)']
  },
  {
    id: 'tem_filhos',
    question: 'Você tem filhos?',
    type: 'radio',
    required: true,
    options: ['Sim', 'Não']
  },
  {
    id: 'nasceu_sao_paulo',
    question: 'Você nasceu em São Paulo/SP?',
    type: 'radio',
    required: true,
    options: ['Sim', 'Não']
  },
  {
    id: 'nivel_educacao',
    question: 'Qual é o seu nível de educação?',
    type: 'radio',
    required: true,
    options: [
      'Ensino Fundamental completo',
      'Ensino Médio completo',
      'Cursando superior',
      'Superior completo'
    ]
  },
  {
    id: 'quantos_idiomas',
    question: 'Quantos idiomas você fala?',
    type: 'radio',
    required: true,
    options: ['1 Idioma', '2 Idiomas', '3 Idiomas', '4 Idiomas ou mais']
  }
];

const educationQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'experiencia_imobiliario',
    question: 'Você já teve experiência no mercado imobiliário anteriormente?',
    type: 'radio',
    required: true,
    options: [
      'Não, a Metrocasa foi minha primeira experiência',
      'Sim, tive uma breve experiência anterior',
      'Sim, tenho experiência de pelo menos 1 ano',
      'Sim, tive uma vasta experiência'
    ]
  },
  {
    id: 'creci',
    question: 'Você possui CRECI definitivo ou estagiário ativo?',
    type: 'radio',
    required: true,
    options: ['Não', 'Estágio ativo', 'CRECI Definitivo']
  },
  {
    id: 'canais_atualizacao',
    question: 'Como você costuma se manter atualizado sobre o mercado imobiliário?',
    type: 'checkbox',
    required: true,
    options: [
      'Leio blogs e sites especializados',
      'Sigo influencers e especialistas nas redes sociais',
      'Participo de eventos e conferências',
      'Leio revistas e jornais do setor',
      'Converso com profissionais da área',
      'Treinamento de reciclagem',
      'MetrocasaDay',
      'Não me mantenho atualizado'
    ]
  }
];

const workStyleQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'estilo_negociacao',
    question: 'Qual é o seu estilo de negociação?',
    type: 'radio',
    required: true,
    options: [
      'Muito direto',
      'Consultivo, buscando entender as necessidades',
      'Equilibrado entre direto e consultivo'
    ]
  },
  {
    id: 'tipo_cliente_sucesso',
    question: 'Qual tipo de cliente você tem mais sucesso em tratar?',
    type: 'radio',
    required: true,
    options: ['CEF', 'Direto', 'À vista']
  },
  {
    id: 'estrategia_indecisos',
    question: 'Qual é a sua estratégia para lidar com clientes indecisos?',
    type: 'textarea',
    required: true
  },
  {
    id: 'lidar_rejeicao',
    question: 'Como você lida com a rejeição ou com clientes que não estão satisfeitos?',
    type: 'textarea',
    required: true
  },
  {
    id: 'qualidades_consultor',
    question: 'Que qualidades você acredita que um bom consultor de vendas deve ter?',
    type: 'checkbox',
    required: true,
    options: [
      'Boa comunicação',
      'Escuta ativa',
      'Conhecimento do produto',
      'Empatia',
      'Persuasão',
      'Capacidade de resolver problemas',
      'Proatividade',
      'Flexibilidade',
      'Ética e honestidade'
    ]
  },
  {
    id: 'participacao_eventos',
    question: 'Você já participou de eventos de networking ou feiras do setor?',
    type: 'radio',
    required: true,
    options: [
      'Nunca participei',
      'Raramente (uma vez por ano ou menos)',
      'Ocasionalmente (2–3 vezes por ano)',
      'Frequentemente (4–6 vezes por ano)',
      'Sempre (mais de 6 vezes por ano)'
    ]
  },
  {
    id: 'acompanhamento_pos_venda',
    question: 'Como você faz acompanhamento com clientes após a venda?',
    type: 'textarea',
    required: true
  },
  {
    id: 'visao_marketing_digital',
    question: 'Qual é a sua visão sobre a importância do marketing digital no setor imobiliário?',
    type: 'textarea',
    required: true
  },
  {
    id: 'experiencia_gestao',
    question: 'Você já teve experiência com gestão de equipe?',
    type: 'radio',
    required: true,
    options: ['Sim', 'Não']
  },
  {
    id: 'maior_motivacao',
    question: 'Qual é a sua maior motivação?',
    type: 'radio',
    required: true,
    options: [
      'Dar um futuro melhor para minha família',
      'Estabilidade financeira',
      'Crescimento Profissional',
      'Desenvolvimento pessoal',
      'Ter uma boa remuneração para entretenimento'
    ]
  },
  {
    id: 'objetivo_metrocasa',
    question: 'Qual é o seu maior objetivo na Metrocasa?',
    type: 'radio',
    required: true,
    options: [
      'Ganhar dinheiro',
      'Me tornar um profissional melhor',
      'Me tornar um Gerente/Superintendente',
      'Estar no quadro societário',
      'Aprendizado para oportunidades futuras',
      'Fonte de renda para outro negócio'
    ]
  }
];

const routineQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'translado_trabalho',
    question: 'Como você faz o seu translado de casa para o trabalho?',
    type: 'radio',
    required: true,
    options: [
      'Ônibus',
      'Metrô/Trem',
      'Ônibus e Metrô/Trem',
      'Veículo próprio (Carro ou moto)',
      'Andando',
      'Bicicleta'
    ]
  },
  {
    id: 'tempo_trajeto',
    question: 'Qual é o tempo de trajeto entre sua casa e trabalho?',
    type: 'radio',
    required: true,
    options: [
      '5 - 30 minutos',
      '30 - 60 minutos',
      '60 - 90 minutos',
      '90 - 120 minutos',
      '120 minutos ou mais'
    ]
  },
  {
    id: 'regiao_residencia',
    question: 'Qual região você reside?',
    type: 'radio',
    required: true,
    options: ['Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Centro']
  },
  {
    id: 'suporte_dificuldade',
    question: 'Em momentos de dificuldade, quem você procura?',
    type: 'radio',
    required: true,
    options: ['Família', 'Amigos', 'Terapia', 'Religião', 'Ninguém']
  },
  {
    id: 'dispositivo_trabalho',
    question: 'Para o trabalho, qual dispositivo você usa com mais frequência?',
    type: 'radio',
    required: true,
    options: ['Computador', 'Smartphone', 'Tablet']
  },
  {
    id: 'aplicativos_ferramentas',
    question: 'Quais aplicativos ou ferramentas você utiliza para facilitar suas tarefas diárias?',
    type: 'textarea',
    required: true
  }
];

const lifestyleQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'exercicios_fisicos',
    question: 'Você pratica exercícios físicos?',
    type: 'radio',
    required: true,
    options: [
      'Sim, regularmente (3+ vezes por semana)',
      'Sim, ocasionalmente (1–2 vezes por semana)',
      'Não, mas pretendo começar no próximo mês',
      'Não, não estou interessado',
      'Já pratiquei, mas parei'
    ]
  },
  {
    id: 'frequencia_praias_parques',
    question: 'Com qual periodicidade você frequenta praias e parques?',
    type: 'radio',
    required: true,
    options: [
      'Sempre que posso (todas as semanas)',
      'Uma vez por semana',
      'Algumas vezes por mês',
      'Uma vez por mês',
      'Uma vez por semestre',
      'Nunca'
    ]
  },
  {
    id: 'frequencia_viagens',
    question: 'Com qual periodicidade você faz viagens?',
    type: 'radio',
    required: true,
    options: [
      'Mais de 12 vezes por ano',
      '6 a 12 vezes por ano',
      '3 a 5 vezes por ano',
      '1 a 2 vezes por ano',
      'Nunca'
    ]
  }
];

const communicationQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'receber_informacoes',
    question: 'Como você prefere receber informações sobre produtos ou serviços?',
    type: 'radio',
    required: true,
    options: [
      'E-mail',
      'Mensagens de texto (SMS)',
      'Redes sociais',
      'Telefonema',
      'Aplicativos de mensagens (WhatsApp, Telegram, etc.)',
      'Presencialmente (eventos, feiras, etc.)'
    ]
  },
  {
    id: 'canais_comunicacao',
    question: 'Quais são os canais de comunicação que você mais utiliza?',
    type: 'checkbox',
    required: true,
    options: [
      'E-mail',
      'Redes sociais',
      'SMS',
      'Apps de mensagens (WhatsApp, Telegram, etc.)',
      'Videoconferências (Zoom, Skype, etc.)',
      'Telefonemas'
    ]
  }
];

const additionalQuestions: Array<{
  id: string;
  question: string;
  type: 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
}> = [
  {
    id: 'horario_chegada',
    question: 'Que horas você chega na MC?',
    type: 'textarea',
    required: false
  },
  {
    id: 'horario_saida',
    question: 'Que horas vai embora?',
    type: 'textarea',
    required: false
  },
  {
    id: 'dias_folga',
    question: 'Quais dias você folga?',
    type: 'textarea',
    required: false
  },
  {
    id: 'atividade_folga',
    question: 'O que costuma fazer na sua folga?',
    type: 'textarea',
    required: false
  },
  {
    id: 'quantidade_filhos',
    question: 'Quantos filhos?',
    type: 'textarea',
    required: false
  },
  {
    id: 'escolaridade_detalhada',
    question: 'Escolaridade detalhada',
    type: 'textarea',
    required: false
  },
  {
    id: 'pos_graduado',
    question: 'Pós-graduado?',
    type: 'textarea',
    required: false
  },
  {
    id: 'tecnico',
    question: 'Técnico?',
    type: 'textarea',
    required: false
  },
  {
    id: 'gerencia',
    question: 'Qual sua gerência?',
    type: 'textarea',
    required: false
  },
  {
    id: 'superintendencia',
    question: 'Qual sua superintendência?',
    type: 'textarea',
    required: false
  },
  {
    id: 'diretoria',
    question: 'Qual sua diretoria?',
    type: 'textarea',
    required: false
  },
  {
    id: 'primeiro_gerente',
    question: 'Qual foi seu primeiro gerente?',
    type: 'textarea',
    required: false
  }
];