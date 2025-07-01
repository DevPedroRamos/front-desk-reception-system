
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
  ArrowUp
} from 'lucide-react';

const Integracao = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

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

  const sections = [
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
              <h1 className="text-4xl font-bold text-slate-900">Integração - Guia Completo</h1>
              <p className="text-lg text-slate-600">Manual de orientação para novos colaboradores</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <p className="text-slate-700 leading-relaxed">
              Bem-vindo ao <strong>Front Desk System</strong>! Este guia completo foi criado para ajudar novos colaboradores 
              a entender e utilizar todas as funcionalidades do nosso sistema de recepção de forma eficiente e profissional.
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
                      <li>Sempre verifique fisicamente se a mesa está livre antes de confirmar</li>
                      <li>Na Loja 2, considere o andar preferido do cliente (mobilidade)</li>
                      <li>Distribua clientes equilibradamente entre as mesas</li>
                      <li>Mantenha controle visual das ocupações</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Continue with other sections... */}
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
