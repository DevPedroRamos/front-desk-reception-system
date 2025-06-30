"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Activity,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Zap,
  XCircle,
} from "lucide-react"
import { Bar, BarChart, Pie, PieChart as RechartsPieChart, Cell, XAxis, YAxis, Area, AreaChart } from "recharts"
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Layout } from "@/components/Layout"
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute"

interface PesquisaSatisfacao {
  id: string
  nome_completo: string
  cpf: string
  email: string
  corretor_nome: string
  onde_conheceu: string
  empreendimento_interesse: string
  comprou_empreendimento: boolean
  empreendimento_adquirido: string
  nota_consultor: number
  avaliacao_experiencia: string
  dicas_sugestoes: string
  validado: boolean
  created_at: string
  codigo_validacao?: string
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
  codigo_usado?: string
}

const ITEMS_PER_PAGE = 10

const AdvancedReportsDashboard = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Estados para filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [filtroCorretor, setFiltroCorretor] = useState("")
  const [filtroTipoBrinde, setFiltroTipoBrinde] = useState("")
  const [filtroNota, setFiltroNota] = useState("")
  const [filtroPeriodo, setFiltroPeriodo] = useState("")
  const [busca, setBusca] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Estados para paginação e ordenação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [ordenacao, setOrdenacao] = useState<{ campo: string; direcao: "asc" | "desc" }>({
    campo: "created_at",
    direcao: "desc",
  })

  // Estados para modal e validação
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pesquisaSelecionada, setPesquisaSelecionada] = useState<PesquisaSatisfacao | null>(null)
  const [codigoValidacao, setCodigoValidacao] = useState("")
  const [tipoBrinde, setTipoBrinde] = useState("")

  // Estados para visualização
  const [mostrarDetalhes, setMostrarDetalhes] = useState(true)
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(false)

  // Buscar pesquisas de satisfação
  const { data: pesquisas = [], isLoading } = useQuery({
    queryKey: ["pesquisas-satisfacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pesquisas_satisfacao")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      return data as PesquisaSatisfacao[]
    },
  })

  // Buscar brindes validados
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

  // Estatísticas das pesquisas
  const { data: stats } = useQuery({
    queryKey: ["pesquisas-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pesquisas_satisfacao").select("validado, nota_consultor")

      if (error) throw error

      const total = data.length
      const validadas = data.filter((p) => p.validado).length
      const pendentes = total - validadas
      const notaMedia =
        data.filter((p) => p.nota_consultor !== null).reduce((acc, p) => acc + (p.nota_consultor || 0), 0) /
          data.filter((p) => p.nota_consultor !== null).length || 0

      return { total, validadas, pendentes, notaMedia: notaMedia.toFixed(1) }
    },
  })

  // Mutation para validar brinde
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
      queryClient.invalidateQueries({ queryKey: ["pesquisas-stats"] })
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

  // Mutation para toggle validação
  const toggleValidacaoMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: boolean }) => {
      const { error } = await supabase.from("pesquisas_satisfacao").update({ validado: !currentStatus }).eq("id", id)

      if (error) throw error
    },
    onSuccess: (_, { currentStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["pesquisas-satisfacao"] })
      queryClient.invalidateQueries({ queryKey: ["pesquisas-stats"] })
      toast({
        title: "Status atualizado",
        description: `Pesquisa ${!currentStatus ? "validada" : "invalidada"} com sucesso.`,
      })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da pesquisa.",
        variant: "destructive",
      })
    },
  })

  // Aplicar filtros de período predefinido
  const aplicarFiltroPeriodo = (periodo: string) => {
    const hoje = new Date()
    switch (periodo) {
      case "hoje":
        setFiltroDataInicio(format(hoje, "yyyy-MM-dd"))
        setFiltroDataFim(format(hoje, "yyyy-MM-dd"))
        break
      case "semana":
        setFiltroDataInicio(format(subDays(hoje, 7), "yyyy-MM-dd"))
        setFiltroDataFim(format(hoje, "yyyy-MM-dd"))
        break
      case "mes":
        setFiltroDataInicio(format(startOfMonth(hoje), "yyyy-MM-dd"))
        setFiltroDataFim(format(endOfMonth(hoje), "yyyy-MM-dd"))
        break
      case "mes_anterior":
        const mesAnterior = subMonths(hoje, 1)
        setFiltroDataInicio(format(startOfMonth(mesAnterior), "yyyy-MM-dd"))
        setFiltroDataFim(format(endOfMonth(mesAnterior), "yyyy-MM-dd"))
        break
      default:
        setFiltroDataInicio("")
        setFiltroDataFim("")
    }
    setFiltroPeriodo(periodo)
  }

  // Filtrar pesquisas
  const pesquisasFiltradas = useMemo(() => {
    return pesquisas.filter((pesquisa) => {
      const matchesSearch =
        pesquisa.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
        pesquisa.cpf.includes(busca) ||
        pesquisa.corretor_nome?.toLowerCase().includes(busca.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "validado" && pesquisa.validado) ||
        (statusFilter === "pendente" && !pesquisa.validado)

      const matchesCorretor =
        !filtroCorretor || pesquisa.corretor_nome?.toLowerCase().includes(filtroCorretor.toLowerCase())

      const matchesNota =
        !filtroNota ||
        (() => {
          const nota = pesquisa.nota_consultor
          if (!nota) return false
          switch (filtroNota) {
            case "9-10":
              return nota >= 9
            case "7-8":
              return nota >= 7 && nota < 9
            case "5-6":
              return nota >= 5 && nota < 7
            case "0-4":
              return nota < 5
            default:
              return true
          }
        })()

      return matchesSearch && matchesStatus && matchesCorretor && matchesNota
    })
  }, [pesquisas, busca, statusFilter, filtroCorretor, filtroNota])

  // Filtrar dados de brindes
  const dadosFiltrados = useMemo(() => {
    let dados = [...brindesValidados]

    if (filtroDataInicio && filtroDataFim) {
      dados = dados.filter((item) => {
        if (!item.data_validacao) return false
        const dataItem = new Date(item.data_validacao)
        return isWithinInterval(dataItem, {
          start: new Date(filtroDataInicio),
          end: new Date(filtroDataFim + "T23:59:59"),
        })
      })
    }

    if (filtroCorretor) {
      dados = dados.filter((item) => item.corretor_nome.toLowerCase().includes(filtroCorretor.toLowerCase()))
    }

    if (filtroTipoBrinde) {
      dados = dados.filter((item) => item.tipo_brinde === filtroTipoBrinde)
    }

    if (busca) {
      dados = dados.filter(
        (item) => item.cliente_nome.toLowerCase().includes(busca.toLowerCase()) || item.cliente_cpf.includes(busca),
      )
    }

    return dados
  }, [brindesValidados, filtroDataInicio, filtroDataFim, filtroCorretor, filtroTipoBrinde, busca])

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    const brindesPorTipo = dadosFiltrados.reduce(
      (acc, brinde) => {
        acc[brinde.tipo_brinde] = (acc[brinde.tipo_brinde] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const brindesPorCorretor = dadosFiltrados.reduce(
      (acc, brinde) => {
        acc[brinde.corretor_nome] = (acc[brinde.corretor_nome] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const brindesPorDia = dadosFiltrados.reduce(
      (acc, brinde) => {
        if (brinde.data_validacao) {
          const dia = format(new Date(brinde.data_validacao), "dd/MM")
          acc[dia] = (acc[dia] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      porTipo: Object.entries(brindesPorTipo).map(([tipo, quantidade]) => ({
        tipo,
        quantidade,
        fill: tipo === "Cinemark" ? "#8b5cf6" : "#06b6d4",
      })),
      porCorretor: Object.entries(brindesPorCorretor).map(([corretor, quantidade]) => ({
        corretor,
        quantidade,
      })),
      porDia: Object.entries(brindesPorDia)
        .map(([dia, quantidade]) => ({
          dia,
          quantidade,
        }))
        .slice(-7), // Últimos 7 dias
    }
  }, [dadosFiltrados])

  // Paginação
  const totalPaginas = Math.ceil(pesquisasFiltradas.length / ITEMS_PER_PAGE)
  const dadosPaginados = pesquisasFiltradas.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE)

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

  const toggleValidacao = (id: string, currentStatus: boolean) => {
    toggleValidacaoMutation.mutate({ id, currentStatus })
  }

  const exportarCSV = () => {
    if (dadosFiltrados.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há brindes validados para exportar.",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      ["Cliente", "CPF", "Corretor", "Tipo Brinde", "Data Validação"],
      ...dadosFiltrados.map((brinde) => [
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
    link.download = `relatorio_brindes_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()
  }

  const exportarJSON = () => {
    const jsonContent = JSON.stringify(dadosFiltrados, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio_brindes_${format(new Date(), "dd-MM-yyyy")}.json`
    link.click()
  }

  const limparFiltros = () => {
    setFiltroDataInicio("")
    setFiltroDataFim("")
    setFiltroCorretor("")
    setFiltroTipoBrinde("")
    setFiltroNota("")
    setFiltroPeriodo("")
    setBusca("")
    setStatusFilter("all")
    setPaginaAtual(1)
  }

  const pesquisasPendentes = pesquisas.filter((p) => !p.validado)

  return (
    <RoleProtectedRoute allowedRoles={["recepcionista"]}>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Avançado</h1>
                    <p className="text-gray-600">Análise completa de brindes e pesquisas de satisfação</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={atualizacaoAutomatica} onCheckedChange={setAtualizacaoAutomatica} />
                    <Label className="text-sm">Auto-refresh</Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["pesquisas-satisfacao"] })
                      queryClient.invalidateQueries({ queryKey: ["brindes-validados"] })
                      queryClient.invalidateQueries({ queryKey: ["pesquisas-stats"] })
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="validacoes" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Validações
                </TabsTrigger>
                <TabsTrigger value="relatorios" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Relatórios
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="space-y-6">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Total Pesquisas</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.total || 0}</div>
                        </div>
                        <FileText className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Validadas</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.validadas || 0}</div>
                        </div>
                        <CheckCircle className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Pendentes</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.pendentes || 0}</div>
                        </div>
                        <Clock className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Nota Média</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.notaMedia || "0.0"}</div>
                        </div>
                        <Star className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Distribuição por Tipo de Brinde
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          quantidade: {
                            label: "Quantidade",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <RechartsPieChart>
                          <Pie
                            data={dadosGraficos.porTipo}
                            dataKey="quantidade"
                            nameKey="tipo"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                          >
                            {dadosGraficos.porTipo.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RechartsPieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Performance por Corretor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          quantidade: {
                            label: "Brindes Validados",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <BarChart data={dadosGraficos.porCorretor}>
                          <XAxis dataKey="corretor" />
                          <YAxis />
                          <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={[4, 4, 0, 0]} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Tendência Temporal */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Tendência de Validações (Últimos 7 dias)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        quantidade: {
                          label: "Validações",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <AreaChart data={dadosGraficos.porDia}>
                        <XAxis dataKey="dia" />
                        <YAxis />
                        <Area
                          type="monotone"
                          dataKey="quantidade"
                          stroke="var(--color-quantidade)"
                          fill="var(--color-quantidade)"
                          fillOpacity={0.3}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="validacoes" className="space-y-6">
                {/* Pesquisas Pendentes */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-purple-600" />
                        <div>
                          <CardTitle className="text-xl">Pesquisas Pendentes de Validação</CardTitle>
                          <p className="text-gray-600 mt-1">Clientes aguardando validação para receber brindes</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {pesquisasPendentes.length} pendente{pesquisasPendentes.length !== 1 ? "s" : ""}
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
                    ) : pesquisasPendentes.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Todas as pesquisas validadas!</h3>
                        <p className="text-gray-500">Não há pesquisas pendentes de validação no momento.</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {pesquisasPendentes.map((pesquisa) => (
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
                                      <Badge className="bg-yellow-100 text-yellow-800">
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
                                      <RadioGroup
                                        value={tipoBrinde}
                                        onValueChange={setTipoBrinde}
                                        className="space-y-3"
                                      >
                                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                          <RadioGroupItem value="Cinemark" id="cinemark" />
                                          <Label
                                            htmlFor="cinemark"
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                          >
                                            <span className="text-2xl">🎬</span>
                                            <div>
                                              <div className="font-medium">Cinemark</div>
                                              <div className="text-sm text-gray-500">Ingresso de cinema</div>
                                            </div>
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                          <RadioGroupItem value="Vinho" id="vinho" />
                                          <Label
                                            htmlFor="vinho"
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                          >
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
              </TabsContent>

              <TabsContent value="relatorios" className="space-y-6">
                {/* Filtros Avançados */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Filter className="w-6 h-6 text-blue-600" />
                        <CardTitle className="text-xl">Filtros Avançados</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={limparFiltros}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Limpar
                        </Button>
                        <div className="flex items-center gap-2">
                          <Switch checked={mostrarDetalhes} onCheckedChange={setMostrarDetalhes} />
                          <Label className="text-sm">Detalhes</Label>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Períodos Predefinidos */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Períodos Rápidos</Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Hoje", value: "hoje" },
                          { label: "Última Semana", value: "semana" },
                          { label: "Este Mês", value: "mes" },
                          { label: "Mês Anterior", value: "mes_anterior" },
                          { label: "Personalizado", value: "" },
                        ].map((periodo) => (
                          <Button
                            key={periodo.value}
                            variant={filtroPeriodo === periodo.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => aplicarFiltroPeriodo(periodo.value)}
                          >
                            {periodo.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Filtros Detalhados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Buscar Cliente
                        </Label>
                        <Input
                          placeholder="Nome ou CPF..."
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="validado">Validados</SelectItem>
                            <SelectItem value="pendente">Pendentes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Corretor</Label>
                        <Input
                          placeholder="Nome do corretor..."
                          value={filtroCorretor}
                          onChange={(e) => setFiltroCorretor(e.target.value)}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Faixa de Nota</Label>
                        <Select value={filtroNota} onValueChange={setFiltroNota}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todas as notas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todas</SelectItem>
                            <SelectItem value="9-10">⭐ Excelente (9-10)</SelectItem>
                            <SelectItem value="7-8">👍 Bom (7-8)</SelectItem>
                            <SelectItem value="5-6">😐 Regular (5-6)</SelectItem>
                            <SelectItem value="0-4">👎 Ruim (0-4)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {filtroPeriodo === "" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Data Início
                          </Label>
                          <Input
                            type="date"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Data Fim
                          </Label>
                          <Input
                            type="date"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Ações de Exportação */}
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={exportarCSV} className="bg-emerald-600 hover:bg-emerald-700">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV ({dadosFiltrados.length})
                      </Button>
                      <Button onClick={exportarJSON} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabela de Pesquisas */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-600" />
                        <div>
                          <CardTitle className="text-xl">Lista de Pesquisas</CardTitle>
                          <p className="text-gray-600 mt-1">
                            Mostrando {dadosPaginados.length} de {pesquisasFiltradas.length} registros
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                    ) : pesquisasFiltradas.length === 0 ? (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-gray-500">Tente ajustar os filtros para ver mais resultados.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="font-semibold">Cliente</TableHead>
                                <TableHead className="font-semibold">CPF</TableHead>
                                <TableHead className="font-semibold">Corretor</TableHead>
                                <TableHead className="font-semibold">Nota</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Data</TableHead>
                                <TableHead className="font-semibold">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dadosPaginados.map((pesquisa) => (
                                <TableRow key={pesquisa.id} className="hover:bg-gray-50/50">
                                  <TableCell className="font-medium">{pesquisa.nome_completo}</TableCell>
                                  <TableCell className="font-mono text-sm">{pesquisa.cpf}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{pesquisa.corretor_nome || "N/A"}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {pesquisa.nota_consultor ? (
                                      <div className="flex items-center">
                                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                        {pesquisa.nota_consultor}/10
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={pesquisa.validado ? "default" : "secondary"}
                                      className={
                                        pesquisa.validado
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }
                                    >
                                      {pesquisa.validado ? "Validado" : "Pendente"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {format(new Date(pesquisa.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                      </div>
                                      <div className="text-gray-500">
                                        {format(new Date(pesquisa.created_at), "HH:mm", { locale: ptBR })}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPesquisaSelecionada(pesquisa)}
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                          <DialogHeader>
                                            <DialogTitle>Detalhes da Pesquisa</DialogTitle>
                                          </DialogHeader>
                                          {pesquisaSelecionada && (
                                            <div className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <label className="text-sm font-medium">Nome Completo</label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.nome_completo}
                                                  </p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">CPF</label>
                                                  <p className="text-sm text-gray-600">{pesquisaSelecionada.cpf}</p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Email</label>
                                                  <p className="text-sm text-gray-600">{pesquisaSelecionada.email}</p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Corretor</label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.corretor_nome || "N/A"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Onde Conheceu</label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.onde_conheceu || "N/A"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">
                                                    Empreendimento de Interesse
                                                  </label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.empreendimento_interesse || "N/A"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Comprou Empreendimento</label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.comprou_empreendimento ? "Sim" : "Não"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">
                                                    Empreendimento Adquirido
                                                  </label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.empreendimento_adquirido || "N/A"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium">Nota do Consultor</label>
                                                  <p className="text-sm text-gray-600">
                                                    {pesquisaSelecionada.nota_consultor || "N/A"}/10
                                                  </p>
                                                </div>
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium">Avaliação da Experiência</label>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {pesquisaSelecionada.avaliacao_experiencia || "N/A"}
                                                </p>
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium">Dicas e Sugestões</label>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {pesquisaSelecionada.dicas_sugestoes || "N/A"}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </DialogContent>
                                      </Dialog>
                                      <Button
                                        variant={pesquisa.validado ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => toggleValidacao(pesquisa.id, pesquisa.validado)}
                                        disabled={toggleValidacaoMutation.isPending}
                                      >
                                        {pesquisa.validado ? (
                                          <XCircle className="h-4 w-4" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Paginação */}
                        {totalPaginas > 1 && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Página {paginaAtual} de {totalPaginas}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                                disabled={paginaAtual === 1}
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                                disabled={paginaAtual === totalPaginas}
                              >
                                Próximo
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Insights Avançados */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-600" />
                        Insights Principais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Performance</span>
                        </div>
                        <p className="text-blue-800">
                          Taxa de conversão de{" "}
                          <strong>
                            {stats?.total ? Math.round((Number(stats.validadas) / Number(stats.total)) * 100) : 0}%
                          </strong>{" "}
                          nas validações.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-900">Satisfação</span>
                        </div>
                        <p className="text-emerald-800">
                          Nota média de <strong>{stats?.notaMedia}</strong> indica alta satisfação dos clientes.
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Atividade</span>
                        </div>
                        <p className="text-purple-800">
                          <strong>{stats?.pendentes}</strong> pesquisas aguardando validação.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        Métricas Detalhadas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Total de Pesquisas</span>
                          <Badge variant="secondary">{stats?.total || 0}</Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Pesquisas Validadas</span>
                          <Badge className="bg-green-100 text-green-800">{stats?.validadas || 0}</Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Pendentes</span>
                          <Badge variant={Number(stats?.pendentes) > 0 ? "destructive" : "secondary"}>
                            {stats?.pendentes || 0}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Brindes Entregues</span>
                          <Badge variant="secondary">{brindesValidados.length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Layout>
    </RoleProtectedRoute>
  )
}

export default PesquisaRelatorio
