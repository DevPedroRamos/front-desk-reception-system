"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AutoSuggest } from "@/components/AutoSuggest"
import { supabase } from "@/integrations/supabase/client"
import { useCpfValidation } from "@/hooks/useCpfValidation"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import {
  User,
  Mail,
  CreditCard,
  Building2,
  Star,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Gift,
  Phone,
  MapPin,
} from "lucide-react"

interface Empreendimento {
  id: string
  nome: string
}

interface ClienteInfo {
  nome: string
  corretor_nome?: string
}

const PesquisaSatisfacaoMetrocasa = () => {
  const { toast } = useToast()
  const { formatCpf } = useCpfValidation()

  // Estados do formulário
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [codigoValidacao, setCodigoValidacao] = useState("")

  // Dados básicos
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [cpf, setCpf] = useState("")
  const [email, setEmail] = useState("")

  // Dados do cliente encontrado
  const [clienteInfo, setClienteInfo] = useState<ClienteInfo | null>(null)

  // Dados da pesquisa
  const [corretorNome, setCorretorNome] = useState("")
  const [ondeConheceu, setOndeConheceu] = useState("")
  const [empreendimentoInteresse, setEmpreendimentoInteresse] = useState("")
  const [comprouEmpreendimento, setComprouEmpreendimento] = useState("")
  const [empreendimentoAdquirido, setEmpreendimentoAdquirido] = useState("")
  const [notaConsultor, setNotaConsultor] = useState("")
  const [avaliacaoExperiencia, setAvaliacaoExperiencia] = useState("")
  const [dicasSugestoes, setDicasSugestoes] = useState("")

  // Buscar empreendimentos
  const { data: empreendimentos = [] } = useQuery({
    queryKey: ["empreendimentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("empreendimentos").select("id, nome").order("nome")

      if (error) throw error
      return data as Empreendimento[]
    },
  })

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value))
  }

  const buscarDadosCliente = async () => {
    if (!nomeCompleto || !cpf || !email) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos básicos.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const cpfLimpo = cpf.replace(/[.-]/g, "")

      // Buscar nas visitas
      const { data: visitasData, error: visitasError } = await supabase
        .from("visits")
        .select("cliente_nome, corretor_nome")
        .eq("cliente_cpf", cpfLimpo)
        .order("created_at", { ascending: false })
        .limit(1)

      if (visitasError) throw visitasError

      let corretor = ""
      let nomeEncontrado = ""

      if (visitasData && visitasData.length > 0) {
        nomeEncontrado = visitasData[0].cliente_nome
        corretor = visitasData[0].corretor_nome
      } else {
        // Buscar na lista de espera se não encontrou nas visitas
        const { data: listaEsperaData, error: listaEsperaError } = await supabase
          .from("lista_espera")
          .select("cliente_nome, corretor_nome")
          .eq("cliente_cpf", cpfLimpo)
          .order("created_at", { ascending: false })
          .limit(1)

        if (listaEsperaError) throw listaEsperaError

        if (listaEsperaData && listaEsperaData.length > 0) {
          nomeEncontrado = listaEsperaData[0].cliente_nome
          corretor = listaEsperaData[0].corretor_nome || ""
        }
      }

      setClienteInfo({ nome: nomeEncontrado, corretor_nome: corretor })
      setCorretorNome(corretor)
      setStep(2)
    } catch (error) {
      console.error("Erro ao buscar dados do cliente:", error)
      toast({
        title: "Erro",
        description: "Erro ao buscar dados. Você pode continuar com a pesquisa.",
        variant: "destructive",
      })
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const gerarCodigoValidacao = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }

  const handleSubmitPesquisa = async () => {
    setLoading(true)

    try {
      const codigo = gerarCodigoValidacao()

      const { error } = await supabase.from("pesquisas_satisfacao").insert({
        nome_completo: nomeCompleto,
        cpf: cpf.replace(/[.-]/g, ""),
        email,
        corretor_nome: corretorNome,
        onde_conheceu: ondeConheceu,
        empreendimento_interesse: empreendimentoInteresse,
        comprou_empreendimento: comprouEmpreendimento === "sim",
        empreendimento_adquirido: comprouEmpreendimento === "sim" ? empreendimentoAdquirido : null,
        nota_consultor: notaConsultor ? Number.parseInt(notaConsultor) : null,
        avaliacao_experiencia: avaliacaoExperiencia,
        dicas_sugestoes: dicasSugestoes,
        codigo_validacao: codigo,
      })

      if (error) throw error

      setCodigoValidacao(codigo)
      setStep(3)

      toast({
        title: "Pesquisa enviada!",
        description: "Obrigado pela sua participação!",
      })
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar pesquisa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getProgressValue = () => {
    switch (step) {
      case 1:
        return 33
      case 2:
        return 66
      case 3:
        return 100
      default:
        return 0
    }
  }

  const renderStarRating = () => {
    const stars = []
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setNotaConsultor(i.toString())}
          className={`p-1 transition-colors ${
            Number.parseInt(notaConsultor) >= i
              ? "text-yellow-400 hover:text-yellow-500"
              : "text-gray-300 hover:text-yellow-300"
          }`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>,
      )
    }
    return (
      <div className="flex items-center gap-1 justify-center">
        {stars}
        {notaConsultor && <span className="ml-2 text-sm font-medium text-gray-600">{notaConsultor}/10</span>}
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Metrocasa */}
        <div className="bg-[#dc2626] text-white">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/metrocasa-logo.png" alt="Metrocasa" className="h-10" />
              <span className="text-lg font-medium">Pesquisa de Satisfação</span>
            </div>
            <Button variant="outline" className="bg-white text-[#dc2626] border-white hover:bg-gray-100">
              Fale Conosco
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="text-center pb-4 bg-[#dc2626] text-white rounded-t-lg">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Pesquisa Concluída!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <p className="text-gray-600 text-lg">Obrigado por participar da nossa pesquisa de satisfação!</p>

              <div className="bg-[#dc2626]/5 border border-[#dc2626]/20 p-6 rounded-xl">
                <div className="flex items-center justify-center mb-3">
                  <Gift className="w-6 h-6 text-[#dc2626] mr-2" />
                  <p className="text-sm font-medium text-[#dc2626]">Seu código de validação:</p>
                </div>
                <p className="text-4xl font-bold text-[#dc2626] tracking-wider">{codigoValidacao}</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">🎁 Guarde este código para retirar seu brinde!</p>
              </div>

              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[#dc2626] hover:bg-[#dc2626]/90 h-12"
              >
                Nova Pesquisa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Metrocasa */}
      <div className="bg-[#dc2626] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/metrocasa-logo.png" alt="Metrocasa" className="h-10" />
            <span className="text-lg font-medium">Pesquisa de Satisfação</span>
          </div>
          <Button variant="outline" className="bg-white text-[#dc2626] border-white hover:bg-gray-100">
            Fale Conosco
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#dc2626] text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AVALIE E GANHE</h1>
          <p className="text-xl mb-8 opacity-90">
            Sua opinião é muito importante para nós! Participe da nossa pesquisa de satisfação
            <br />e concorra a brindes exclusivos. É simples, rápido e vantajoso para todos!
          </p>
          <div className="flex justify-center items-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold">R$500</div>
              <div className="text-sm opacity-80">em brindes</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Ilimitado</div>
              <div className="text-sm opacity-80">número de participações</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Rápido</div>
              <div className="text-sm opacity-80">preenchimento garantido</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Formulário Principal */}
        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Header do Formulário */}
          <div className="bg-[#dc2626] text-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Formulário de Pesquisa</h2>
            </div>
            <p className="opacity-90">Preencha os dados abaixo para avaliar seus amigos e familiares</p>

            {/* Progress Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm opacity-80">
                <span>Etapa {step} de 3</span>
                <span>{getProgressValue()}% concluído</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressValue()}%` }}
                />
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Abas de Navegação */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <div
                className={`flex-1 text-center py-3 px-4 rounded-md transition-all ${
                  step === 1
                    ? "bg-[#dc2626] text-white shadow-sm"
                    : step > 1
                      ? "bg-green-100 text-green-700"
                      : "text-gray-500"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span className="font-medium">Seus dados</span>
                </div>
              </div>
              <div
                className={`flex-1 text-center py-3 px-4 rounded-md transition-all ${
                  step === 2
                    ? "bg-[#dc2626] text-white shadow-sm"
                    : step > 2
                      ? "bg-green-100 text-green-700"
                      : "text-gray-400"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  <span className="font-medium">Dados da Pesquisa</span>
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Informações Pessoais</h3>
                  <p className="text-gray-600">Digite seus dados para começar a pesquisa</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-2 text-[#dc2626]">
                      <User className="w-4 h-4" />
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="h-12 text-base border-gray-300 focus:border-[#dc2626] focus:ring-[#dc2626]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-sm font-medium flex items-center gap-2 text-[#dc2626]">
                        <CreditCard className="w-4 h-4" />
                        CPF *
                      </Label>
                      <Input
                        id="cpf"
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder="000.000.000-00"
                        className="h-12 text-base border-gray-300 focus:border-[#dc2626] focus:ring-[#dc2626]"
                        maxLength={14}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-[#dc2626]">
                        <Mail className="w-4 h-4" />
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="h-12 text-base border-gray-300 focus:border-[#dc2626] focus:ring-[#dc2626]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={buscarDadosCliente}
                    disabled={loading}
                    className="w-full h-12 text-base bg-[#dc2626] hover:bg-[#dc2626]/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Buscando dados...
                      </>
                    ) : (
                      <>
                        Próximo passo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Avalie Sua Experiência</h3>
                  <p className="text-gray-600">Conte-nos sobre sua experiência conosco</p>
                </div>

                {clienteInfo?.nome && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 font-medium">Dados encontrados!</p>
                    </div>
                    <p className="text-green-700 mt-1">
                      Nome: <strong>{clienteInfo.nome}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="corretor" className="text-sm font-medium text-[#dc2626]">
                      Corretor Responsável
                    </Label>
                    <Input
                      id="corretor"
                      value={corretorNome}
                      readOnly
                      className="bg-gray-50 h-12 border-gray-300"
                      placeholder="Não informado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="onde_conheceu" className="text-sm font-medium text-[#dc2626]">
                      Onde conheceu a Construtora Metrocasa?
                    </Label>
                    <Input
                      id="onde_conheceu"
                      value={ondeConheceu}
                      onChange={(e) => setOndeConheceu(e.target.value)}
                      placeholder="Ex: redes sociais, indicação, site, etc."
                      className="h-12 border-gray-300 focus:border-[#dc2626] focus:ring-[#dc2626]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2 text-[#dc2626]">
                      <Building2 className="w-4 h-4" />
                      Empreendimento/Bairro de Interesse
                    </Label>
                    <AutoSuggest
                      label=""
                      placeholder="Digite para buscar empreendimentos"
                      options={empreendimentos.map((emp) => ({ id: emp.id, name: emp.nome }))}
                      value={empreendimentoInteresse}
                      onValueChange={setEmpreendimentoInteresse}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-[#dc2626]">
                      Você comprou algum empreendimento conosco?
                    </Label>
                    <RadioGroup
                      value={comprouEmpreendimento}
                      onValueChange={setComprouEmpreendimento}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim" id="comprou_sim" className="border-[#dc2626] text-[#dc2626]" />
                        <Label htmlFor="comprou_sim" className="cursor-pointer">
                          Sim
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao" id="comprou_nao" className="border-[#dc2626] text-[#dc2626]" />
                        <Label htmlFor="comprou_nao" className="cursor-pointer">
                          Não
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {comprouEmpreendimento === "sim" && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <Label className="text-sm font-medium text-[#dc2626]">Qual empreendimento você adquiriu?</Label>
                      <AutoSuggest
                        label=""
                        placeholder="Digite para buscar empreendimentos"
                        options={empreendimentos.map((emp) => ({ id: emp.id, name: emp.nome }))}
                        value={empreendimentoAdquirido}
                        onValueChange={setEmpreendimentoAdquirido}
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2 text-[#dc2626]">
                      <Star className="w-4 h-4" />
                      Avalie nosso consultor (0 a 10)
                    </Label>
                    <div className="p-6 bg-gray-50 rounded-lg">{renderStarRating()}</div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experiencia" className="text-sm font-medium text-[#dc2626]">
                      Como você avalia sua experiência em nossa sede?
                    </Label>
                    <Textarea
                      id="experiencia"
                      value={avaliacaoExperiencia}
                      onChange={(e) => setAvaliacaoExperiencia(e.target.value)}
                      placeholder="Conte-nos sobre sua experiência conosco..."
                      rows={4}
                      className="resize-none border-gray-300 focus:border-[#dc2626] focus:ring-[#dc2626]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sugestoes" className="text-sm font-medium text-[#dc2626]">
                      Sugestões para melhorarmos
                    </Label>
                    <Textarea
                      id="sugestoes"
                      value={dicasSugestoes}
                      onChange={(e) => setDicasSugestoes(e.target.value)}
                      placeholder="Suas sugestões são muito importantes para nós..."
                      rows={4}
                      className="resize-none border-gray-300 focus:border-[#dc2626] focus:ring-[#dc2626]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmitPesquisa}
                    disabled={loading}
                    className="flex-1 h-12 bg-[#dc2626] hover:bg-[#dc2626]/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar Pesquisa
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
          <p className="text-gray-600 mb-12">Entenda as regras e benefícios do nosso programa de pesquisa</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#dc2626]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Responda</h3>
              <p className="text-gray-600">Preencha o formulário com seus dados e avalie sua experiência conosco</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-[#dc2626]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Acompanhe</h3>
              <p className="text-gray-600">Nossos consultores entrarão em contato com seu amigo</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#dc2626]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-[#dc2626]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Receba</h3>
              <p className="text-gray-600">Quando seu indicado fechar negócio, você recebe sua recompensa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/metrocasa-logo.png" alt="Metrocasa" className="h-12 mb-4" />
              <p className="text-gray-400">Construindo sonhos, criando histórias.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Entre em Contato</li>
                <li>Carreiras</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Suporte Via Chat</li>
                <li>Central de Atendimento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(11) 5061-0022</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>Copyright © 2025 Construtora Metrocasa - Todos os Direitos Reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PesquisaSatisfacao
