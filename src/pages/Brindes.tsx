"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Calendar,
  Download,
  Gift,
  CheckCircle,
  Star,
  User,
  CreditCard,
  Clock,
  Filter,
  FileText,
  Award,
  Package,
  Loader2,
  Search,
  Trophy,
  Sparkles,
} from "lucide-react"
import { Layout } from "@/components/Layout"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PesquisaSatisfacao {
  id: string
  nome_completo: string
  cpf: string
  email: string
  corretor_nome: string | null
  codigo_validacao: string
  validado: boolean
  created_at: string
  nota_consultor: number | null
}

interface Brinde {
  id: string
  cliente_nome: string
  cliente_cpf: string
  corretor_nome: string
  tipo_brinde: string
  validado: boolean
  data_validacao: string | null
  pesquisa_satisfacao_id: string
  created_at: string
}

const Brindes = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pesquisaSelecionada, setPesquisaSelecionada] = useState<PesquisaSatisfacao | null>(null)
  const [codigoValidacao, setCodigoValidacao] = useState("")
  const [tipoBrinde, setTipoBrinde] = useState("")

  // Buscar pesquisas de satisfação não validadas
  const { data: pesquisas = [], isLoading } = useQuery({
    queryKey: ["pesquisas-satisfacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pesquisas_satisfacao")
        .select("*")
        .eq("validado", false)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as PesquisaSatisfacao[]
    },
  })

  // Buscar brindes validados para exportação
  const { data: brindesValidados = [] } = useQuery({
    queryKey: ["brindes-validados", filtroDataInicio, filtroDataFim],
    queryFn: async () => {
      let query = supabase
        .from("brindes")
        .select("*")
        .eq("validado", true)
        .order("data_validacao", { ascending: false })

      if (filtroDataInicio) {
        query = query.gte("data_validacao", filtroDataInicio)
      }
      if (filtroDataFim) {
        query = query.lte("data_validacao", filtroDataFim + "T23:59:59")
      }

      const { data, error } = await query
      if (error) throw error
      return data as Brinde[]
    },
  })

  const validarBrindeMutation = useMutation({
    mutationFn: async ({
      pesquisa,
      codigo,
      brinde,
    }: {
      pesquisa: PesquisaSatisfacao
      codigo: string
      brinde: string
    }) => {
      if (codigo !== pesquisa.codigo_validacao) {
        throw new Error("Código de validação incorreto!")
      }

      // Atualizar pesquisa como validada
      const { error: errorPesquisa } = await supabase
        .from("pesquisas_satisfacao")
        .update({ validado: true })
        .eq("id", pesquisa.id)

      if (errorPesquisa) throw errorPesquisa

      // Criar registro do brinde
      const { error: errorBrinde } = await supabase.from("brindes").insert({
        cliente_nome: pesquisa.nome_completo,
        cliente_cpf: pesquisa.cpf,
        corretor_nome: pesquisa.corretor_nome || "",
        tipo_brinde: brinde,
        validado: true,
        codigo_usado: codigo,
        data_validacao: new Date().toISOString(),
        pesquisa_satisfacao_id: pesquisa.id,
      })

      if (errorBrinde) throw errorBrinde
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pesquisas-satisfacao"] })
      queryClient.invalidateQueries({ queryKey: ["brindes-validados"] })
      setDialogOpen(false)
      setCodigoValidacao("")
      setTipoBrinde("")
      setPesquisaSelecionada(null)
      toast({
        title: "Brinde validado!",
        description: "O brinde foi validado com sucesso.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleValidarBrinde = () => {
    if (!pesquisaSelecionada || !codigoValidacao || !tipoBrinde) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    validarBrindeMutation.mutate({
      pesquisa: pesquisaSelecionada,
      codigo: codigoValidacao,
      brinde: tipoBrinde,
    })
  }

  const exportarCSV = () => {
    if (brindesValidados.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há brindes validados para exportar.",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      ["Cliente", "CPF", "Corretor", "Tipo Brinde", "Data Validação"],
      ...brindesValidados.map((brinde) => [
        brinde.cliente_nome,
        brinde.cliente_cpf,
        brinde.corretor_nome,
        brinde.tipo_brinde,
        brinde.data_validacao ? format(new Date(brinde.data_validacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `brindes_validados_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()
  }

  const getBrindeIcon = (tipo: string) => {
    switch (tipo) {
      case "Cinemark":
        return "🎬"
      case "Vinho":
        return "🍷"
      default:
        return "🎁"
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 9) return "bg-emerald-100 text-emerald-800"
    if (nota >= 7) return "bg-blue-100 text-blue-800"
    if (nota >= 5) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Gestão de Brindes</h1>
                <p className="text-gray-600 text-lg">Valide pesquisas e gerencie a entrega de brindes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Pesquisas Pendentes</CardTitle>
                    <div className="text-3xl font-bold mt-1">{pesquisas.length}</div>
                  </div>
                  <Clock className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Brindes Validados</CardTitle>
                    <div className="text-3xl font-bold mt-1">{brindesValidados.length}</div>
                  </div>
                  <CheckCircle className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Taxa de Conversão</CardTitle>
                    <div className="text-3xl font-bold mt-1">
                      {pesquisas.length + brindesValidados.length > 0
                        ? Math.round((brindesValidados.length / (pesquisas.length + brindesValidados.length)) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Filtros para Exportação */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Filtros para Exportação</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Início
                  </Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Fim
                  </Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button
                    onClick={exportarCSV}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                    disabled={brindesValidados.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV ({brindesValidados.length} registros)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pesquisas Pendentes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-xl">Pesquisas Pendentes de Validação</CardTitle>
                    <p className="text-gray-600 mt-1">Clientes aguardando validação para receber brindes</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {pesquisas.length} pendente{pesquisas.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando pesquisas</h3>
                  <p className="text-gray-500">Aguarde enquanto buscamos as pesquisas pendentes...</p>
                </div>
              ) : pesquisas.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Todas as pesquisas validadas!</h3>
                  <p className="text-gray-500">Não há pesquisas pendentes de validação no momento.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pesquisas.map((pesquisa) => (
                    <div
                      key={pesquisa.id}
                      className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{pesquisa.nome_completo}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CreditCard className="w-4 h-4" />
                                {pesquisa.cpf}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                Corretor:{" "}
                                <span className="font-medium">{pesquisa.corretor_nome || "Não informado"}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {format(new Date(pesquisa.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                            {pesquisa.nota_consultor && (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <Badge className={getNotaColor(pesquisa.nota_consultor)}>
                                  Nota: {pesquisa.nota_consultor}/10
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <Dialog
                          open={dialogOpen && pesquisaSelecionada?.id === pesquisa.id}
                          onOpenChange={(open) => {
                            setDialogOpen(open)
                            if (!open) {
                              setPesquisaSelecionada(null)
                              setCodigoValidacao("")
                              setTipoBrinde("")
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => {
                                setPesquisaSelecionada(pesquisa)
                                setDialogOpen(true)
                              }}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Gift className="w-4 h-4 mr-2" />
                              Validar Brinde
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-xl">
                                <Award className="w-6 h-6 text-purple-600" />
                                Validar Brinde
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-600" />
                                  <span className="font-medium">Cliente:</span> {pesquisa.nome_completo}
                                </div>
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-gray-600" />
                                  <span className="font-medium">CPF:</span> {pesquisa.cpf}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="codigo" className="text-sm font-medium flex items-center gap-2">
                                  <Search className="w-4 h-4" />
                                  Código de Validação
                                </Label>
                                <Input
                                  id="codigo"
                                  value={codigoValidacao}
                                  onChange={(e) => setCodigoValidacao(e.target.value)}
                                  placeholder="Digite o código de 4 dígitos"
                                  maxLength={4}
                                  className="h-12 text-center text-lg font-mono tracking-widest"
                                />
                              </div>

                              <div className="space-y-4">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Package className="w-4 h-4" />
                                  Escolha o Brinde
                                </Label>
                                <RadioGroup value={tipoBrinde} onValueChange={setTipoBrinde} className="space-y-3">
                                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value="Cinemark" id="cinemark" />
                                    <Label htmlFor="cinemark" className="flex items-center gap-3 cursor-pointer flex-1">
                                      <span className="text-2xl">🎬</span>
                                      <div>
                                        <div className="font-medium">Cinemark</div>
                                        <div className="text-sm text-gray-500">Ingresso de cinema</div>
                                      </div>
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value="Vinho" id="vinho" />
                                    <Label htmlFor="vinho" className="flex items-center gap-3 cursor-pointer flex-1">
                                      <span className="text-2xl">🍷</span>
                                      <div>
                                        <div className="font-medium">Vinho</div>
                                        <div className="text-sm text-gray-500">Garrafa de vinho</div>
                                      </div>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              <Button
                                onClick={handleValidarBrinde}
                                disabled={validarBrindeMutation.isPending}
                                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                              >
                                {validarBrindeMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Validando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Validar Brinde
                                  </>
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brindes Validados */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div>
                    <CardTitle className="text-xl">Brindes Validados</CardTitle>
                    <p className="text-gray-600 mt-1">Histórico de brindes já entregues</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {brindesValidados.length} validado{brindesValidados.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {brindesValidados.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum brinde validado</h3>
                  <p className="text-gray-500">Os brindes validados aparecerão aqui.</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">CPF</TableHead>
                        <TableHead className="font-semibold">Corretor</TableHead>
                        <TableHead className="font-semibold">Brinde</TableHead>
                        <TableHead className="font-semibold">Data Validação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brindesValidados.map((brinde) => (
                        <TableRow key={brinde.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="font-medium">{brinde.cliente_nome}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{brinde.cliente_cpf}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{brinde.corretor_nome}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getBrindeIcon(brinde.tipo_brinde)}</span>
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {brinde.tipo_brinde}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                {brinde.data_validacao
                                  ? format(new Date(brinde.data_validacao), "dd/MM/yyyy", { locale: ptBR })
                                  : "-"}
                              </div>
                              <div className="text-gray-500">
                                {brinde.data_validacao
                                  ? format(new Date(brinde.data_validacao), "HH:mm", { locale: ptBR })
                                  : ""}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Brindes
