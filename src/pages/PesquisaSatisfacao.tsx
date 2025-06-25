"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"

interface Empreendimento {
  id: string
  nome: string
}

interface ClienteInfo {
  nome: string
  corretor_nome?: string
}

const PesquisaSatisfacao = () => {
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
      <div className="flex items-center gap-1">
        {stars}
        {notaConsultor && <span className="ml-2 text-sm font-medium text-gray-600">{notaConsultor}/10</span>}
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-700 font-bold">Pesquisa Concluída!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600 text-lg">Obrigado por participar da nossa pesquisa de satisfação!</p>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
              <div className="flex items-center justify-center mb-3">
                <Gift className="w-6 h-6 text-red-600 mr-2" />
                <p className="text-sm font-medium text-red-800">Seu código de validação:</p>
              </div>
              <p className="text-4xl font-bold text-red-600 tracking-wider">{codigoValidacao}</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 font-medium">🎁 Guarde este código para retirar seu brinde!</p>
            </div>

            <Button onClick={() => window.location.reload()} className="w-full bg-red-600 hover:bg-red-700">
              Nova Pesquisa
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
      {/* Header com progresso */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesquisa de Satisfação</h1>
            <p className="text-gray-600">Sua opinião é muito importante para nós</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Etapa {step} de 3</span>
              <span>{getProgressValue()}% concluído</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              {step === 1 && <User className="w-6 h-6 text-red-600" />}
              {step === 2 && <MessageSquare className="w-6 h-6 text-red-600" />}
              <CardTitle className="text-xl">
                {step === 1 && "Seus Dados Básicos"}
                {step === 2 && "Avalie Sua Experiência"}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-1">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="h-12 text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      CPF *
                    </Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      className="h-12 text-base"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <Button
                  onClick={buscarDadosCliente}
                  disabled={loading}
                  className="w-full h-12 text-base bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando dados...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {clienteInfo?.nome && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-red-600" />
                      <p className="text-red-800 font-medium">Dados encontrados!</p>
                    </div>
                    <p className="text-red-700 mt-1">
                      Nome: <strong>{clienteInfo.nome}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="corretor" className="text-sm font-medium">
                    Corretor Responsável
                  </Label>
                  <Input
                    id="corretor"
                    value={corretorNome}
                    readOnly
                    className="bg-gray-50 h-12"
                    placeholder="Não informado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="onde_conheceu" className="text-sm font-medium">
                    Onde conheceu a Construtora Metrocasa?
                  </Label>
                  <Input
                    id="onde_conheceu"
                    value={ondeConheceu}
                    onChange={(e) => setOndeConheceu(e.target.value)}
                    placeholder="Ex: redes sociais, indicação, site, etc."
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
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
                  <Label className="text-sm font-medium">Você comprou algum empreendimento conosco?</Label>
                  <RadioGroup
                    value={comprouEmpreendimento}
                    onValueChange={setComprouEmpreendimento}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="comprou_sim" />
                      <Label htmlFor="comprou_sim" className="cursor-pointer">
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="comprou_nao" />
                      <Label htmlFor="comprou_nao" className="cursor-pointer">
                        Não
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {comprouEmpreendimento === "sim" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-medium">Qual empreendimento você adquiriu?</Label>
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
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Avalie nosso consultor (0 a 10)
                  </Label>
                  <div className="p-4 bg-gray-50 rounded-lg">{renderStarRating()}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experiencia" className="text-sm font-medium">
                    Como você avalia sua experiência em nossa sede?
                  </Label>
                  <Textarea
                    id="experiencia"
                    value={avaliacaoExperiencia}
                    onChange={(e) => setAvaliacaoExperiencia(e.target.value)}
                    placeholder="Conte-nos sobre sua experiência conosco..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sugestoes" className="text-sm font-medium">
                    Sugestões para melhorarmos
                  </Label>
                  <Textarea
                    id="sugestoes"
                    value={dicasSugestoes}
                    onChange={(e) => setDicasSugestoes(e.target.value)}
                    placeholder="Suas sugestões são muito importantes para nós..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmitPesquisa}
                    disabled={loading}
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700"
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
      </div>
    </div>
  )
}

export default PesquisaSatisfacao
