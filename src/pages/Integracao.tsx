import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Users, 
  MapPin, 
  Clock, 
  Gift, 
  BarChart3, 
  UserCheck, 
  FileText, 
  HelpCircle, 
  Lightbulb,
  ChevronRight,
  Home,
  ArrowUp,
  User,
  Target,
  Award,
  TrendingUp,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

const Integracao = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const { userProfile, loading } = useUserRole();

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Seções para recepcionistas
  const recepcionistasSections = [
    { id: 'overview', title: 'Visão Geral', icon: BookOpen, color: 'text-blue-600' },
    { id: 'recepcao-guide', title: 'Guia da Recepção', icon: Users, color: 'text-green-600' },
    { id: 'lojas-mesas', title: 'Sistema de Lojas', icon: MapPin, color: 'text-purple-600' },
    { id: 'lista-espera', title: 'Lista de Espera', icon: Clock, color: 'text-orange-600' },
    { id: 'brindes', title: 'Sistema de Brindes', icon: Gift, color: 'text-pink-600' },
    { id: 'dashboard', title: 'Dashboard', icon: BarChart3, color: 'text-indigo-600' },
    { id: 'corretor', title: 'Portal do Corretor', icon: UserCheck, color: 'text-teal-600' },
    { id: 'pesquisa', title: 'Pesquisa de Satisfação', icon: FileText, color: 'text-red-600' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: HelpCircle, color: 'text-gray-600' },
    { id: 'dicas', title: 'Dicas e Boas Práticas', icon: Lightbulb, color: 'text-yellow-600' },
  ];

  // Seções para corretores
  const corretoresSections = [
    { id: 'corretor-overview', title: 'Bem-vindo ao Portal', icon: BookOpen, color: 'text-blue-600' },
    { id: 'minhas-visitas', title: 'Minhas Visitas', icon: Users, color: 'text-green-600' },
    { id: 'perfil-profissional', title: 'Perfil Profissional', icon: User, color: 'text-purple-600' },
    { id: 'sistema-atendimento', title: 'Sistema de Atendimento', icon: UserCheck, color: 'text-teal-600' },
    { id: 'pesquisa-satisfacao', title: 'Pesquisa de Satisfação', icon: MessageSquare, color: 'text-orange-600' },
    { id: 'metricas-performance', title: 'Métricas e Performance', icon: TrendingUp, color: 'text-indigo-600' },
    { id: 'dicas-corretor', title: 'Dicas e Boas Práticas', icon: Lightbulb, color: 'text-yellow-600' },
    { id: 'troubleshooting-corretor', title: 'Troubleshooting', icon: HelpCircle, color: 'text-gray-600' },
  ];

  const sections = userProfile?.role === 'corretor' ? corretoresSections : recepcionistasSections;
  const isCorretor = userProfile?.role === 'corretor';

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                {isCorretor ? 'Portal do Corretor - Guia Completo' : 'Integração - Guia Completo'}
              </h1>
              <p className="text-lg text-slate-600">
                {isCorretor 
                  ? 'Manual de orientação para corretores no Front Desk System'
                  : 'Manual de orientação para novos colaboradores'
                }
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <p className="text-slate-700 leading-relaxed">
              {isCorretor ? (
                <>Bem-vindo ao <strong>Portal do Corretor</strong>! Este guia foi criado especialmente para ajudar 
                corretores a utilizar todas as funcionalidades do sistema de forma eficiente e otimizar 
                seu atendimento aos clientes.</>
              ) : (
                <>Bem-vindo ao <strong>Front Desk System</strong>! Este guia completo foi criado para ajudar novos colaboradores 
                a entender e utilizar todas as funcionalidades do nosso sistema de recepção de forma eficiente e profissional.</>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Navegação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto py-3 px-3"
                      onClick={() => scrollToSection(section.id)}
                    >
                      <section.icon className={`h-4 w-4 mr-3 ${section.color}`} />
                      <span className="text-sm">{section.title}</span>
                      <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                    </Button>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={scrollToTop}
                  >
                    <ArrowUp className="h-4 w-4 mr-3" />
                    Voltar ao Topo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {isCorretor ? (
              // Conteúdo específico para corretores
              <>
                {/* Seção: Bem-vindo ao Portal do Corretor */}
                <section id="corretor-overview">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Bem-vindo ao Portal do Corretor
                      </CardTitle>
                      <CardDescription>
                        Entenda como funciona seu portal e suas responsabilidades
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">O que é o Portal do Corretor?</h3>
                        <p className="text-slate-600 leading-relaxed">
                          O Portal do Corretor é sua interface personalizada no Front Desk System. Aqui você pode 
                          acompanhar suas visitas ativas, finalizar atendimentos, visualizar métricas pessoais 
                          e gerenciar seu perfil profissional.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">✅ Você PODE:</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Ver suas visitas ativas</li>
                            <li>• Finalizar seus atendimentos</li>
                            <li>• Acessar métricas pessoais</li>
                            <li>• Gerenciar seu perfil</li>
                            <li>• Ver histórico de visitas</li>
                          </ul>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-800 mb-2">❌ Você NÃO PODE:</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• Registrar novas visitas</li>
                            <li>• Ver dados de outros corretores</li>
                            <li>• Acessar relatórios gerais</li>
                            <li>• Gerenciar lista de espera</li>
                            <li>• Validar brindes</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">🔄 Seu Fluxo de Trabalho</h4>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">1</div>
                            <p>Cliente é<br/>Registrado</p>
                          </div>
                          <ChevronRight className="text-slate-400" />
                          <div className="text-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">2</div>
                            <p>Você recebe<br/>Notificação</p>
                          </div>
                          <ChevronRight className="text-slate-400" />
                          <div className="text-center">
                            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">3</div>
                            <p>Inicia<br/>Atendimento</p>
                          </div>
                          <ChevronRight className="text-slate-400" />
                          <div className="text-center">
                            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">4</div>
                            <p>Finaliza no<br/>Sistema</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Minhas Visitas */}
                <section id="minhas-visitas">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-green-600" />
                        Minhas Visitas - Guia Completo
                      </CardTitle>
                      <CardDescription>
                        Como gerenciar e finalizar seus atendimentos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-800 mb-2">👀 Visualizando Visitas Ativas</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside ml-4">
                            <li>Acesse "Minhas Visitas" no menu lateral</li>
                            <li>Veja todas as suas visitas ativas em tempo real</li>
                            <li>Cada card mostra: nome do cliente, mesa, horário de início</li>
                            <li>Tempo de atendimento é calculado automaticamente</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-blue-800 mb-2">✅ Finalizando um Atendimento</h4>
                          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4">
                            <li>Localize a visita que deseja finalizar</li>
                            <li>Clique no botão "Finalizar Atendimento"</li>
                            <li>Confirme a finalização no modal</li>
                            <li>Sistema registra automaticamente o horário de saída</li>
                            <li>Mesa fica disponível para novo atendimento</li>
                          </ol>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-purple-800 mb-2">📊 Métricas em Tempo Real</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                            <li><strong>Total de Visitas:</strong> Seu histórico completo</li>
                            <li><strong>Visitas Hoje:</strong> Atendimentos realizados no dia</li>
                            <li><strong>Tempo Médio:</strong> Duração média dos seus atendimentos</li>
                            <li><strong>Visitas Ativas:</strong> Atendimentos em andamento</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">💡 Dicas Importantes</h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                          <li>Sempre finalize as visitas quando o cliente sair</li>
                          <li>Mantenha um tempo de atendimento adequado (30-45 min)</li>
                          <li>Acompanhe suas métricas para melhorar performance</li>
                          <li>Em caso de problemas, contate a recepção</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Perfil Profissional */}
                <section id="perfil-profissional">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <User className="h-6 w-6 text-purple-600" />
                        Perfil Profissional
                      </CardTitle>
                      <CardDescription>
                        Gerencie suas informações e acompanhe sua hierarquia
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">👤 Informações Pessoais</h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="text-sm font-medium text-blue-800">Nome Completo</p>
                              <p className="text-xs text-blue-600">Seu nome como aparece no sistema</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800">CPF</p>
                              <p className="text-xs text-green-600">Documento de identificação (não editável)</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="text-sm font-medium text-purple-800">Função</p>
                              <p className="text-xs text-purple-600">Corretor (definido pelo sistema)</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🏢 Estrutura Hierárquica</h4>
                          <div className="space-y-3">
                            <div className="bg-orange-50 p-3 rounded border border-orange-200">
                              <p className="text-sm font-medium text-orange-800">Gerente</p>
                              <p className="text-xs text-orange-600">Seu gerente direto</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded border border-red-200">
                              <p className="text-sm font-medium text-red-800">Superintendente</p>
                              <p className="text-xs text-red-600">Superintendente da sua região</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">📊 Estatísticas de Performance</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="bg-blue-500 text-white rounded-lg p-3 mb-2">
                              <Target className="h-6 w-6 mx-auto" />
                            </div>
                            <p className="font-medium">Visitas Totais</p>
                            <p className="text-xs text-slate-500">Histórico completo</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-green-500 text-white rounded-lg p-3 mb-2">
                              <TrendingUp className="h-6 w-6 mx-auto" />
                            </div>
                            <p className="font-medium">Média Mensal</p>
                            <p className="text-xs text-slate-500">Performance média</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-purple-500 text-white rounded-lg p-3 mb-2">
                              <Clock className="h-6 w-6 mx-auto" />
                            </div>
                            <p className="font-medium">Tempo Médio</p>
                            <p className="text-xs text-slate-500">Duração atendimento</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-orange-500 text-white rounded-lg p-3 mb-2">
                              <Award className="h-6 w-6 mx-auto" />
                            </div>
                            <p className="font-medium">Avaliação</p>
                            <p className="text-xs text-slate-500">Nota média clientes</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Sistema de Atendimento */}
                <section id="sistema-atendimento">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <UserCheck className="h-6 w-6 text-teal-600" />
                        Sistema de Atendimento
                      </CardTitle>
                      <CardDescription>
                        Como funciona o processo e suas responsabilidades
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                        <h4 className="font-semibold text-teal-800 mb-2">🎯 Seu Papel no Processo</h4>
                        <p className="text-sm text-teal-700">
                          Como corretor, você é responsável pelo atendimento direto ao cliente. A recepção faz o 
                          registro inicial, mas o sucesso da visita depende da qualidade do seu atendimento.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-blue-800 mb-2">📋 Processo Completo</h4>
                          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4">
                            <li><strong>Cliente chega:</strong> Recepção registra os dados no sistema</li>
                            <li><strong>Você é notificado:</strong> Sistema mostra nova visita ativa</li>
                            <li><strong>Mesa designada:</strong> Cliente é direcionado para sua mesa</li>
                            <li><strong>Atendimento:</strong> Você conduz a apresentação/negociação</li>
                            <li><strong>Finalização:</strong> Você finaliza a visita no sistema</li>
                            <li><strong>Pesquisa:</strong> Cliente pode receber link de satisfação</li>
                          </ol>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-800 mb-2">⭐ Responsabilidades Durante o Atendimento</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                            <li>Recepcionar o cliente de forma profissional</li>
                            <li>Apresentar os empreendimentos adequados ao perfil</li>
                            <li>Esclarecer dúvidas e conduzir negociação</li>
                            <li>Manter foco e qualidade durante todo o processo</li>
                            <li>Finalizar corretamente no sistema ao término</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-purple-800 mb-2">⏱️ Gestão de Tempo</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                            <li><strong>Tempo ideal:</strong> 30 a 45 minutos por atendimento</li>
                            <li><strong>Tempo mínimo:</strong> 15 minutos (evitar atendimentos muito rápidos)</li>
                            <li><strong>Tempo máximo:</strong> 60 minutos (evitar ocupar mesa muito tempo)</li>
                            <li><strong>Acompanhamento:</strong> Sistema calcula tempo automaticamente</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">🚨 Situações Especiais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-yellow-700 mb-1">Cliente não compareceu:</h5>
                            <p className="text-yellow-600">Aguarde 10 minutos e finalize a visita</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-yellow-700 mb-1">Atendimento muito longo:</h5>
                            <p className="text-yellow-600">Considere agendar continuação</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-yellow-700 mb-1">Problemas técnicos:</h5>
                            <p className="text-yellow-600">Contate a recepção imediatamente</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-yellow-700 mb-1">Cliente insatisfeito:</h5>
                            <p className="text-yellow-600">Chame o gerente se necessário</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Pesquisa de Satisfação */}
                <section id="pesquisa-satisfacao">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <MessageSquare className="h-6 w-6 text-orange-600" />
                        Pesquisa de Satisfação
                      </CardTitle>
                      <CardDescription>
                        Como os clientes avaliam seu atendimento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">🎯 Importância das Avaliações</h4>
                        <p className="text-sm text-orange-700">
                          As pesquisas de satisfação são fundamentais para medir a qualidade do seu atendimento. 
                          Clientes avaliam diversos aspectos da experiência, e sua nota individual impacta 
                          diretamente sua performance e crescimento profissional.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📝 O que é Avaliado</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Nota do Consultor (1-10):</strong> Avaliação específica do seu atendimento</li>
                            <li><strong>Experiência Geral:</strong> Satisfação com todo o processo</li>
                            <li><strong>Qualidade da Informação:</strong> Clareza e completude das explicações</li>
                            <li><strong>Profissionalismo:</strong> Postura e atendimento profissional</li>
                            <li><strong>Tempo de Atendimento:</strong> Se foi adequado às necessidades</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📊 Como Funciona</h4>
                          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                            <li>Cliente finaliza atendimento</li>
                            <li>Recebe link da pesquisa por WhatsApp/Email</li>
                            <li>Preenche avaliação online</li>
                            <li>Dados são registrados no sistema</li>
                            <li>Você pode acompanhar suas notas</li>
                            <li>Relatórios são gerados para gestão</li>
                          </ol>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3">⭐ Como Melhorar sua Avaliação</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">🤝 Relacionamento</h5>
                            <ul className="text-green-600 space-y-1 list-disc list-inside">
                              <li>Seja cordial e profissional</li>
                              <li>Escute ativamente o cliente</li>
                              <li>Demonstre interesse genuíno</li>
                              <li>Mantenha contato visual</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">💼 Técnica</h5>
                            <ul className="text-green-600 space-y-1 list-disc list-inside">
                              <li>Prepare-se antes do atendimento</li>
                              <li>Conheça bem os produtos</li>
                              <li>Seja claro nas explicações</li>
                              <li>Tire todas as dúvidas</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">🎁 Sistema de Brindes</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Clientes que respondem à pesquisa recebem códigos para retirar brindes, incentivando 
                          a participação e melhorando nossa taxa de resposta.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-blue-700 mb-1">Como funciona:</h5>
                            <ul className="text-blue-600 space-y-1 list-disc list-inside">
                              <li>Cliente responde pesquisa</li>
                              <li>Recebe código automaticamente</li>
                              <li>Pode retirar brinde na recepção</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-700 mb-1">Benefícios:</h5>
                            <ul className="text-blue-600 space-y-1 list-disc list-inside">
                              <li>Maior taxa de resposta</li>
                              <li>Feedback mais detalhado</li>
                              <li>Cliente se sente valorizado</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Métricas e Performance */}
                <section id="metricas-performance">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-indigo-600" />
                        Métricas e Performance
                      </CardTitle>
                      <CardDescription>
                        Acompanhe e melhore sua performance continuamente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-2">📈 Importância das Métricas</h4>
                        <p className="text-sm text-indigo-700">
                          Acompanhar suas métricas é essencial para entender sua performance, identificar 
                          pontos de melhoria e alcançar seus objetivos profissionais. Use os dados para 
                          se desenvolver continuamente.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📊 Métricas Principais</h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="text-sm font-medium text-blue-800">Total de Visitas</p>
                              <p className="text-xs text-blue-600">Quantidade total de atendimentos realizados</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800">Visitas por Período</p>
                              <p className="text-xs text-green-600">Produtividade diária, semanal e mensal</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="text-sm font-medium text-purple-800">Tempo Médio</p>
                              <p className="text-xs text-purple-600">Duração média dos seus atendimentos</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded border border-orange-200">
                              <p className="text-sm font-medium text-orange-800">Nota Média</p>
                              <p className="text-xs text-orange-600">Avaliação média nas pesquisas de satisfação</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🎯 Metas e Objetivos</h4>
                          <div className="space-y-3">
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                              <p className="text-sm font-medium text-yellow-800">Meta Mensal</p>
                              <p className="text-xs text-yellow-600">Número de visitas esperadas por mês</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded border border-red-200">
                              <p className="text-sm font-medium text-red-800">Qualidade</p>
                              <p className="text-xs text-red-600">Manter nota média acima de 8.0</p>
                            </div>
                            <div className="bg-teal-50 p-3 rounded border border-teal-200">
                              <p className="text-sm font-medium text-teal-800">Eficiência</p>
                              <p className="text-xs text-teal-600">Tempo médio entre 30-45 minutos</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">📋 Como Interpretar seus Dados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">🔍 Análise de Tendências</h5>
                            <ul className="text-slate-600 space-y-1 list-disc list-inside">
                              <li>Compare períodos (semana atual vs anterior)</li>
                              <li>Identifique padrões de alta/baixa performance</li>
                              <li>Correlacione tempo de atendimento com satisfação</li>
                              <li>Observe impacto de melhorias implementadas</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">⚡ Ações de Melhoria</h5>
                            <ul className="text-slate-600 space-y-1 list-disc list-inside">
                              <li>Se nota baixa: foque na qualidade do atendimento</li>
                              <li>Se tempo alto: otimize apresentação</li>
                              <li>Se produtividade baixa: analise causas</li>
                              <li>Se tudo bem: mantenha padrão e busque inovação</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">🏆 Programa de Reconhecimento</h4>
                        <p className="text-sm text-green-700 mb-3">
                          Corretores com melhor performance são reconhecidos mensalmente através de:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-green-700 mb-1">🥇 Ranking</h5>
                            <p className="text-green-600">Posição no pódio de vendas</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-green-700 mb-1">🎖️ Premiações</h5>
                            <p className="text-green-600">Reconhecimento por metas atingidas</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-green-700 mb-1">📈 Desenvolvimento</h5>
                            <p className="text-green-600">Oportunidades de crescimento</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Dicas e Boas Práticas para Corretores */}
                <section id="dicas-corretor">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Lightbulb className="h-6 w-6 text-yellow-600" />
                        Dicas e Boas Práticas
                      </CardTitle>
                      <CardDescription>
                        Estratégias para otimizar seu atendimento e performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🎯 Técnicas de Atendimento</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Primeiro contato:</strong> Cumprimente cordialmente e apresente-se</li>
                            <li><strong>Qualificação:</strong> Entenda as necessidades antes de apresentar</li>
                            <li><strong>Apresentação:</strong> Foque nos benefícios, não apenas nas características</li>
                            <li><strong>Objeções:</strong> Escute, entenda e responda com clareza</li>
                            <li><strong>Fechamento:</strong> Seja assertivo mas não pressione demais</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">⏱️ Gestão de Tempo</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Preparação:</strong> Organize materiais antes do cliente chegar</li>
                            <li><strong>Foco:</strong> Mantenha conversa direcionada ao objetivo</li>
                            <li><strong>Ritmo:</strong> Adapte velocidade às características do cliente</li>
                            <li><strong>Priorização:</strong> Apresente opções mais adequadas primeiro</li>
                            <li><strong>Encerramento:</strong> Defina próximos passos claramente</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">💼 Profissionalismo</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Aparência:</strong> Mantenha vestimenta adequada e profissional</li>
                            <li><strong>Postura:</strong> Demonstre confiança e conhecimento</li>
                            <li><strong>Comunicação:</strong> Use linguagem clara e apropriada</li>
                            <li><strong>Pontualidade:</strong> Respeite horários e compromissos</li>
                            <li><strong>Follow-up:</strong> Mantenha contato pós-atendimento quando apropriado</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📱 Uso do Sistema</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Monitoramento:</strong> Verifique visitas ativas regularmente</li>
                            <li><strong>Finalização:</strong> Sempre finalize visitas imediatamente</li>
                            <li><strong>Métricas:</strong> Acompanhe sua performance diariamente</li>
                            <li><strong>Suporte:</strong> Reporte problemas técnicos rapidamente</li>
                            <li><strong>Atualização:</strong> Mantenha dados do perfil atualizados</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                        <h4 className="font-semibold text-slate-800 mb-3">🌟 Fórmula do Sucesso</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">
                              <User className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium text-slate-700 mb-1">Preparação</h5>
                            <p className="text-slate-600">Conheça produtos e clientes</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">
                              <MessageSquare className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium text-slate-700 mb-1">Comunicação</h5>
                            <p className="text-slate-600">Escute e adapte abordagem</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">
                              <Target className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium text-slate-700 mb-1">Execução</h5>
                            <p className="text-slate-600">Apresente com qualidade</p>
                          </div>
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">
                              <CheckCircle className="h-6 w-6" />
                            </div>
                            <h5 className="font-medium text-slate-700 mb-1">Finalização</h5>
                            <p className="text-slate-600">Encerre com próximos passos</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Troubleshooting para Corretores */}
                <section id="troubleshooting-corretor">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <HelpCircle className="h-6 w-6 text-gray-600" />
                        Troubleshooting - Corretor
                      </CardTitle>
                      <CardDescription>
                        Soluções para problemas comuns do portal do corretor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-800 mb-2">❌ Problema: "Não consigo ver minhas visitas"</h4>
                          <p className="text-sm text-slate-600 mb-2"><strong>Possíveis soluções:</strong></p>
                          <ol className="text-sm text-slate-600 list-decimal list-inside ml-4 space-y-1">
                            <li>Verifique se você está logado corretamente</li>
                            <li>Atualize a página (F5 ou Ctrl+R)</li>
                            <li>Confirme com a recepção se há visitas registradas para você</li>
                            <li>Verifique sua conexão com a internet</li>
                          </ol>
                        </div>

                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Problema: "Erro ao finalizar visita"</h4>
                          <p className="text-sm text-slate-600 mb-2"><strong>Passos para resolver:</strong></p>
                          <ol className="text-sm text-slate-600 list-decimal list-inside ml-4 space-y-1">
                            <li>Tente novamente após alguns segundos</li>
                            <li>Verifique se a conexão está estável</li>
                            <li>Se persistir, anote o horário e contate a recepção</li>
                            <li>A recepção pode finalizar manualmente se necessário</li>
                          </ol>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-blue-800 mb-2">💭 FAQ: "Posso editar dados da visita?"</h4>
                          <p className="text-sm text-slate-600">
                            <strong>Resposta:</strong> Não. Apenas a recepção pode editar dados das visitas. 
                            Se houver erro nos dados do cliente, solicite correção à recepção.
                          </p>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                          <h4 className="font-semibold text-purple-800 mb-2">💭 FAQ: "Como vejo meu histórico completo?"</h4>
                          <p className="text-sm text-slate-600">
                            <strong>Resposta:</strong> Atualmente o sistema mostra apenas visitas ativas. 
                            Para relatórios históricos, solicite à sua liderança ou à equipe de relatórios.
                          </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-800 mb-2">📞 Contatos de Suporte</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                            <ul className="space-y-1">
                              <li><strong>Problemas Técnicos:</strong> Equipe de TI</li>
                              <li><strong>Dúvidas do Sistema:</strong> Recepção</li>
                              <li><strong>Questões de Performance:</strong> Seu Gerente</li>
                            </ul>
                            <ul className="space-y-1">
                              <li><strong>Emergências:</strong> Supervisor de plantão</li>
                              <li><strong>Sugestões:</strong> Coordenação</li>
                              <li><strong>Treinamento:</strong> RH/Desenvolvimento</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                        <h4 className="font-semibold text-slate-800 mb-3">🎯 Lembre-se</h4>
                        <p className="text-slate-700 leading-relaxed">
                          Este portal foi desenvolvido especialmente para facilitar seu trabalho e melhorar 
                          seus resultados. Use-o a seu favor, acompanhe suas métricas e busque sempre a 
                          excelência no atendimento. Seu sucesso é nosso sucesso!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            ) : (
              // Conteúdo original para recepcionistas (manter existente)
              <>
                {/* Seção: Visão Geral */}
                <section id="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                        Visão Geral do Sistema
                      </CardTitle>
                      <CardDescription>
                        Entenda o propósito e funcionamento geral do Front Desk System
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">O que é o Front Desk System?</h3>
                        <p className="text-slate-600 leading-relaxed">
                          O Front Desk System é uma plataforma completa para gerenciamento de recepção de lojas imobiliárias. 
                          Ele permite controlar visitas de clientes, organizar atendimentos por corretor, gerenciar mesas e espaços, 
                          além de coletar feedback através de pesquisas de satisfação.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">👥 Recepcionistas</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Registrar chegada de clientes</li>
                            <li>• Gerenciar ocupação de mesas</li>
                            <li>• Controlar lista de espera</li>
                            <li>• Finalizar atendimentos</li>
                            <li>• Acessar relatórios</li>
                          </ul>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">🏢 Corretores</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Visualizar suas visitas ativas</li>
                            <li>• Finalizar seus atendimentos</li>
                            <li>• Acompanhar métricas pessoais</li>
                            <li>• Gerenciar perfil</li>
                            <li>• Ver histórico de visitas</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">🔄 Fluxo Geral de Trabalho</h4>
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-center">
                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">1</div>
                            <p>Cliente<br/>Chega</p>
                          </div>
                          <ChevronRight className="text-slate-400" />
                          <div className="text-center">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">2</div>
                            <p>Recepção<br/>Registra</p>
                          </div>
                          <ChevronRight className="text-slate-400" />
                          <div className="text-center">
                            <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">3</div>
                            <p>Atendimento<br/>Inicia</p>
                          </div>
                          <ChevronRight className="text-slate-400" />
                          <div className="text-center">
                            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mb-2 mx-auto">4</div>
                            <p>Visita<br/>Finalizada</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Guia da Recepção */}
                <section id="recepcao-guide">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-green-600" />
                        Guia da Recepção - Passo a Passo
                      </CardTitle>
                      <CardDescription>
                        Aprenda como registrar e gerenciar visitas de clientes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-800 mb-2">📝 Passo 1: Registrar Nova Visita</h4>
                          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4">
                            <li>Acesse a página "Recepção" no menu lateral</li>
                            <li>Clique no botão "Nova Visita"</li>
                            <li>Preencha os <strong>campos obrigatórios</strong>:
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Nome completo do cliente</li>
                                <li>CPF (formato: xxx.xxx.xxx-xx)</li>
                                <li>Corretor responsável</li>
                                <li>Loja de atendimento</li>
                                <li>Número da mesa</li>
                              </ul>
                            </li>
                            <li>Preencha os <em>campos opcionais</em> se disponível:
                              <ul className="list-disc list-inside ml-4 mt-1">
                                <li>WhatsApp do cliente</li>
                                <li>Empreendimento de interesse</li>
                              </ul>
                            </li>
                            <li>Confirme se a mesa está disponível (sistema mostra status)</li>
                            <li>Clique em "Iniciar Visita"</li>
                          </ol>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-blue-800 mb-2">👀 Passo 2: Monitorar Visitas Ativas</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                            <li>Visitas ativas aparecem no dashboard principal</li>
                            <li>Tempo de atendimento é calculado automaticamente</li>
                            <li>Status das mesas é atualizado em tempo real</li>
                            <li>Corretores podem gerenciar suas próprias visitas</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-800 mb-2">✅ Passo 3: Finalizar Atendimento</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                            <li>Clique em "Finalizar Atendimento" na visita ativa</li>
                            <li>Sistema registra automaticamente horário de saída</li>
                            <li>Mesa fica disponível para novo atendimento</li>
                            <li>Cliente pode receber pesquisa de satisfação</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Pontos de Atenção</h4>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                          <li>Sempre confirme os dados do cliente antes de iniciar a visita</li>
                          <li>Verifique se a mesa está realmente livre fisicamente</li>
                          <li>CPF deve ser validado (sistema faz verificação automática)</li>
                          <li>Em caso de erro, corrija imediatamente os dados</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Sistema de Lojas e Mesas */}
                <section id="lojas-mesas">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-purple-600" />
                        Sistema de Lojas e Mesas
                      </CardTitle>
                      <CardDescription>
                        Configuração e organização dos espaços de atendimento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded text-xs flex items-center justify-center">1</div>
                            Loja 1
                          </h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>📍 <strong>22 mesas</strong> disponíveis</li>
                            <li>🏢 <strong>Sem andar</strong> (térreo único)</li>
                            <li>📋 Mesas numeradas de 1 a 22</li>
                            <li>✅ Configuração simples</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-500 text-white rounded text-xs flex items-center justify-center">2</div>
                            Loja 2
                          </h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>📍 <strong>29 mesas</strong> disponíveis</li>
                            <li>🏢 <strong>2 andares:</strong> Térreo e Mezanino</li>
                            <li>📋 Mesas numeradas de 1 a 29</li>
                            <li>⚠️ Especificar andar obrigatório</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-yellow-500 text-white rounded text-xs flex items-center justify-center">3</div>
                            Loja 3
                          </h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>📍 <strong>10 mesas</strong> disponíveis</li>
                            <li>🏢 <strong>Sem andar</strong> (térreo único)</li>
                            <li>📋 Mesas numeradas de 1 a 10</li>
                            <li>✅ Menor capacidade</li>
                          </ul>
                        </div>

                        <div className="border rounded-lg p-4">
                          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <div className="w-6 h-6 bg-purple-500 text-white rounded text-xs flex items-center justify-center">4</div>
                            Loja Superior 37º
                          </h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>📍 <strong>29 mesas</strong> disponíveis</li>
                            <li>🏢 <strong>Sem andar</strong> (piso único)</li>
                            <li>📋 Mesas numeradas de 1 a 29</li>
                            <li>🏙️ Localização premium</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">🔍 Status Visual das Mesas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span><strong>Verde:</strong> Mesa disponível</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span><strong>Vermelho:</strong> Mesa ocupada</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                            <span><strong>Amarelo:</strong> Em limpeza</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">💡 Dicas para Organização</h4>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                          <li>Sempre verifique fisicamente se a mesa está livre antes de alocar</li>
                          <li>Na Loja 2, considere o andar preferido do cliente (mobilidade)</li>
                          <li>Distribua clientes equilibradamente entre as mesas</li>
                          <li>Mantenha controle visual das ocupações</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Lista de Espera */}
                <section id="lista-espera">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-orange-600" />
                        Lista de Espera
                      </CardTitle>
                      <CardDescription>
                        Gerencie clientes aguardando atendimento
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold">🕐 Quando Usar</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                            <li>Todas as mesas estão ocupadas</li>
                            <li>Cliente chegou sem agendamento</li>
                            <li>Corretor específico não disponível</li>
                            <li>Horário de pico com fila</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">📋 Como Gerenciar</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                            <li>Adicione cliente na lista</li>
                            <li>Informe tempo estimado</li>
                            <li>Monitor periodicamente</li>
                            <li>Chame por ordem de chegada</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">📝 Processo Passo a Passo</h4>
                        <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
                          <li>Acesse "Lista de Espera" no menu</li>
                          <li>Clique em "Adicionar à Lista"</li>
                          <li>Preencha dados do cliente</li>
                          <li>Informe tempo estimado de espera</li>
                          <li>Cliente recebe posição na fila</li>
                          <li>Monitore e chame quando disponível</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Sistema de Brindes */}
                <section id="brindes">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Gift className="h-6 w-6 text-pink-600" />
                        Sistema de Brindes
                      </CardTitle>
                      <CardDescription>
                        Gestão completa do programa de brindes e validações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🎁 Como Funciona</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li>Clientes recebem códigos após visitas</li>
                            <li>Códigos podem ser validados na recepção</li>
                            <li>Sistema registra data de validação</li>
                            <li>Controle de estoque automático</li>
                            <li>Relatórios de brindes entregues</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🔐 Tipos de Código</h4>
                          <div className="space-y-2">
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800">Código Válido</p>
                              <p className="text-xs text-green-600">Pode ser usado para retirar brinde</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded border border-red-200">
                              <p className="text-sm font-medium text-red-800">Código Usado</p>
                              <p className="text-xs text-red-600">Já foi validado anteriormente</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                        <h4 className="font-semibold text-pink-800 mb-3">📋 Processo de Validação</h4>
                        <ol className="text-sm text-pink-700 space-y-2 list-decimal list-inside">
                          <li>Cliente apresenta código do brinde</li>
                          <li>Acesse "Brindes" no menu lateral</li>
                          <li>Digite o código na caixa de validação</li>
                          <li>Sistema verifica se código é válido</li>
                          <li>Se válido, confirme entrega do brinde</li>
                          <li>Código fica marcado como "usado"</li>
                          <li>Registro fica salvo no sistema</li>
                        </ol>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">📊 Relatórios Disponíveis</h4>
                          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                            <li>Brindes validados por período</li>
                            <li>Performance por corretor</li>
                            <li>Códigos ainda não utilizados</li>
                            <li>Histórico de validações</li>
                          </ul>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Atenção</h4>
                          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            <li>Códigos só podem ser usados uma vez</li>
                            <li>Verificar se cliente é o portador</li>
                            <li>Conferir dados pessoais quando necessário</li>
                            <li>Registrar observações importantes</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Dashboard */}
                <section id="dashboard">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <BarChart3 className="h-6 w-6 text-indigo-600" />
                        Dashboard e Métricas
                      </CardTitle>
                      <CardDescription>
                        Interpretação de dados e análise de performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📊 Cards Principais</h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="text-sm font-medium text-blue-800">Total de Visitas Hoje</p>
                              <p className="text-xs text-blue-600">Todas as visitas iniciadas no dia</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800">Visitas Ativas</p>
                              <p className="text-xs text-green-600">Atendimentos em andamento agora</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="text-sm font-medium text-purple-800">Visitas Finalizadas</p>
                              <p className="text-xs text-purple-600">Atendimentos concluídos hoje</p>
                            </div>
                            <div className="bg-orange-50 p-3 rounded border border-orange-200">
                              <p className="text-sm font-medium text-orange-800">Mesas Ocupadas</p>
                              <p className="text-xs text-orange-600">Número de mesas em uso</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📈 Gráficos Disponíveis</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Visitas por Hora:</strong> Mostra picos de movimento</li>
                            <li><strong>Performance por Corretor:</strong> Ranking de atendimentos</li>
                            <li><strong>Tempo Médio de Atendimento:</strong> Eficiência temporal</li>
                            <li><strong>Ocupação por Loja:</strong> Distribuição de clientes</li>
                            <li><strong>Satisfação dos Clientes:</strong> Notas das pesquisas</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-3">🔍 Filtros Disponíveis</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-indigo-700">Por Período</p>
                            <ul className="text-indigo-600 space-y-1 list-disc list-inside ml-2">
                              <li>Hoje</li>
                              <li>Esta semana</li>
                              <li>Este mês</li>
                              <li>Personalizado</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-indigo-700">Por Superintendente</p>
                            <ul className="text-indigo-600 space-y-1 list-disc list-inside ml-2">
                              <li>Todos</li>
                              <li>Por região</li>
                              <li>Por equipe</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-indigo-700">Por Status</p>
                            <ul className="text-indigo-600 space-y-1 list-disc list-inside ml-2">
                              <li>Ativas</li>
                              <li>Finalizadas</li>
                              <li>Todas</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">💡 Como Interpretar os Dados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">🕐 Horários de Pico</h5>
                            <p className="text-slate-600">Identifique quando há mais movimento para otimizar escalas de trabalho.</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">⚡ Tempo de Atendimento</h5>
                            <p className="text-slate-600">Monitore se atendimentos estão dentro do padrão esperado.</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">🏆 Performance</h5>
                            <p className="text-slate-600">Compare resultados entre corretores e identifique melhores práticas.</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-2">📍 Ocupação</h5>
                            <p className="text-slate-600">Verifique distribuição de clientes entre lojas e mesas.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Portal do Corretor */}
                <section id="corretor">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <UserCheck className="h-6 w-6 text-teal-600" />
                        Portal do Corretor
                      </CardTitle>
                      <CardDescription>
                        Funcionalidades específicas para corretores
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                        <h4 className="font-semibold text-teal-800 mb-2">🔐 Diferenças de Acesso</h4>
                        <p className="text-sm text-teal-700 mb-3">
                          Corretores têm acesso limitado e personalizado, vendo apenas informações relevantes ao seu trabalho.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-teal-800 mb-2">✅ Corretor PODE:</h5>
                            <ul className="text-sm text-teal-700 space-y-1 list-disc list-inside">
                              <li>• Ver suas visitas ativas</li>
                              <li>• Finalizar seus atendimentos</li>
                              <li>• Acessar métricas pessoais</li>
                              <li>• Gerenciar seu perfil</li>
                              <li>• Ver histórico próprio</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-teal-800 mb-2">❌ Corretor NÃO PODE:</h5>
                            <ul className="text-sm text-teal-700 space-y-1 list-disc list-inside">
                              <li>• Registrar novas visitas</li>
                              <li>• Ver dados de outros corretores</li>
                              <li>• Acessar relatórios gerais</li>
                              <li>• Gerenciar lista de espera</li>
                              <li>• Validar brindes</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📱 Páginas Disponíveis</h4>
                          <div className="space-y-3">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="text-sm font-medium text-blue-800">Minhas Visitas</p>
                              <p className="text-xs text-blue-600">Lista de atendimentos ativos do corretor</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800">Perfil</p>
                              <p className="text-xs text-green-600">Dados pessoais e configurações</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="text-sm font-medium text-purple-800">Pódio</p>
                              <p className="text-xs text-purple-600">Ranking e gamificação</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📊 Métricas Pessoais</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li><strong>Total de Visitas:</strong> Histórico completo</li>
                            <li><strong>Visitas Hoje:</strong> Atendimentos do dia</li>
                            <li><strong>Tempo Médio:</strong> Duração dos atendimentos</li>
                            <li><strong>Taxa de Conversão:</strong> Vendas realizadas</li>
                            <li><strong>Satisfação Média:</strong> Notas recebidas</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-3">🚀 Processo do Corretor</h4>
                        <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                          <li>Corretor recebe notificação de novo cliente</li>
                          <li>Inicia atendimento na mesa designada</li>
                          <li>Durante visita, pode acompanhar tempo no sistema</li>
                          <li>Ao finalizar, confirma conclusão no portal</li>
                          <li>Cliente pode receber pesquisa de satisfação</li>
                          <li>Métricas são atualizadas automaticamente</li>
                        </ol>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">💼 Gestão de Perfil</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Corretores podem atualizar algumas informações pessoais, mas dados críticos como CPF e role são protegidos.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-slate-700 mb-1">Pode Editar:</h5>
                            <ul className="text-slate-600 list-disc list-inside space-y-1">
                              <li>Nome de exibição</li>
                              <li>Foto de perfil</li>
                              <li>Preferências</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-1">Não Pode Editar:</h5>
                            <ul className="text-slate-600 list-disc list-inside space-y-1">
                              <li>CPF</li>
                              <li>Função/Role</li>
                              <li>Hierarquia</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Pesquisa de Satisfação */}
                <section id="pesquisa">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-red-600" />
                        Pesquisa de Satisfação
                      </CardTitle>
                      <CardDescription>
                        Sistema de feedback e avaliação da experiência do cliente
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-red-800 mb-2">🎯 Objetivo</h4>
                        <p className="text-sm text-red-700">
                          Coletar feedback dos clientes sobre a experiência de atendimento, qualidade do serviço e satisfação geral, 
                          gerando insights valiosos para melhoria contínua do processo.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📝 Como Funciona</h4>
                          <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                            <li>Cliente finaliza atendimento na loja</li>
                            <li>Recebe link para pesquisa (por WhatsApp/email)</li>
                            <li>Acessa formulário público e anônimo</li>
                            <li>Preenche avaliação em poucos minutos</li>
                            <li>Dados são salvos automaticamente</li>
                            <li>Gera código para possível brinde</li>
                          </ol>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📊 Campos da Pesquisa</h4>
                          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                            <li>Dados pessoais básicos</li>
                            <li>Nota para o consultor (1-10)</li>
                            <li>Avaliação da experiência</li>
                            <li>Como conheceu a empresa</li>
                            <li>Interesse em empreendimentos</li>
                            <li>Sugestões e melhorias</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-3">🔗 Link Público</h4>
                        <p className="text-sm text-blue-700 mb-2">
                          A pesquisa fica disponível em uma URL pública que pode ser compartilhada facilmente:
                        </p>
                        <div className="bg-white p-2 rounded border font-mono text-xs text-blue-800">
                          https://recepcao.metrocasa.com.br/pesquisa-satisfacao
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          * Este link pode ser enviado por WhatsApp, email ou QR Code
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">📈 Análise de Dados</h4>
                          <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                            <li>Relatórios por período</li>
                            <li>Média de notas por corretor</li>
                            <li>Distribuição de satisfação</li>
                            <li>Comentários e sugestões</li>
                            <li>Taxa de resposta</li>
                          </ul>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2">🎁 Integração com Brindes</h4>
                          <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
                            <li>Pesquisa gera código automático</li>
                            <li>Cliente pode resgatar brinde</li>
                            <li>Incentiva participação</li>
                            <li>Rastreamento completo</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">📋 Acesso aos Relatórios</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Na página "Pesquisa de Satisfação" do sistema, você encontra:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <h5 className="font-medium text-slate-700 mb-1">📊 Dashboard</h5>
                            <ul className="text-slate-600 list-disc list-inside space-y-1">
                              <li>Visão geral</li>
                              <li>Métricas principais</li>
                              <li>Gráficos</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-1">📋 Filtros</h5>
                            <ul className="text-slate-600 list-disc list-inside space-y-1">
                              <li>Por período</li>
                              <li>Por corretor</li>
                              <li>Por nota</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-700 mb-1">📄 Exportação</h5>
                            <ul className="text-slate-600 list-disc list-inside space-y-1">
                              <li>Excel/CSV</li>
                              <li>Relatórios PDF</li>
                              <li>Dados brutos</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Troubleshooting */}
                <section id="troubleshooting">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <HelpCircle className="h-6 w-6 text-gray-600" />
                        Troubleshooting e FAQ
                      </CardTitle>
                      <CardDescription>
                        Soluções para problemas comuns
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 pl-4">
                          <h4 className="font-semibold text-red-800 mb-2">❌ Problema: "Mesa aparece ocupada mas está vazia"</h4>
                          <p className="text-sm text-slate-600 mb-2"><strong>Solução:</strong></p>
                          <ol className="text-sm text-slate-600 list-decimal list-inside ml-4 space-y-1">
                            <li>Verifique no dashboard se há visita ativa para essa mesa</li>
                            <li>Se sim, finalize a visita manualmente</li>
                            <li>Se não, entre em contato com o suporte técnico</li>
                          </ol>
                        </div>

                        <div className="border-l-4 border-yellow-500 pl-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Problema: "CPF inválido"</h4>
                          <p className="text-sm text-slate-600 mb-2"><strong>Solução:</strong></p>
                          <ul className="text-sm text-slate-600 list-disc list-inside ml-4 space-y-1">
                            <li>Confirme se o CPF foi digitado corretamente</li>
                            <li>Formato deve ser: xxx.xxx.xxx-xx</li>
                            <li>Verifique se não há espaços extras</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-blue-800 mb-2">💭 FAQ: "Como excluir uma visita?"</h4>
                          <p className="text-sm text-slate-600">
                            <strong>Resposta:</strong> Não é possível excluir visitas. Apenas finalize-as normalmente. 
                            Todas as visitas ficam registradas para controle e auditoria.
                          </p>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                          <h4 className="font-semibold text-green-800 mb-2">📞 Contatos de Suporte</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li><strong>Suporte Técnico:</strong> Equipe de TI - Interno</li>
                            <li><strong>Dúvidas do Sistema:</strong> Coordenação</li>
                            <li><strong>Emergências:</strong> Supervisor de plantão</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Seção: Dicas e Boas Práticas */}
                <section id="dicas">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Lightbulb className="h-6 w-6 text-yellow-600" />
                        Dicas e Melhores Práticas
                      </CardTitle>
                      <CardDescription>
                        Otimize seu trabalho com essas recomendações
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🚀 Produtividade</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li>Mantenha o dashboard sempre aberto</li>
                            <li>Use atalhos do teclado quando possível</li>
                            <li>Verifique mesas fisicamente antes de alocar</li>
                            <li>Atualize dados em tempo real</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">💬 Comunicação</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li>Seja claro sobre tempo de espera</li>
                            <li>Informe sobre amenidades disponíveis</li>
                            <li>Mantenha cliente atualizado</li>
                            <li>Confirme dados importantes</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">📊 Organização</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li>Revise métricas regularmente</li>
                            <li>Mantenha workspace organizado</li>
                            <li>Faça backup de informações importantes</li>
                            <li>Documente ocorrências especiais</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-slate-800">🎯 Qualidade</h4>
                          <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                            <li>Priorize experiência do cliente</li>
                            <li>Seja proativo na solução de problemas</li>
                            <li>Mantenha profissionalismo sempre</li>
                            <li>Busque melhoria contínua</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                        <h4 className="font-semibold text-slate-800 mb-3">🌟 Lembrete Final</h4>
                        <p className="text-slate-700 leading-relaxed">
                          Este sistema foi desenvolvido para facilitar seu trabalho e melhorar a experiência dos nossos clientes. 
                          Use este guia sempre que precisar, e não hesite em buscar ajuda quando necessário. 
                          Sua dedicação faz a diferença no sucesso da nossa operação!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500 border-t pt-6">
          <p>© 2025 Front Desk System | Metro Lab🧪 - Documentação v1.0</p>
          <p className="mt-1">
            Para sugestões de melhoria nesta documentação, entre em contato com a equipe de desenvolvimento.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Integracao;
