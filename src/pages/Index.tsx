"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Calendar,
  Download,
  CheckCircle2,
  Clock,
  Filter,
  FileText,
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
  UserX,
  MapPin,
  Timer,
  Users,
  Zap,
  Home,
  Award,
  CalendarIcon,
  Building2,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Line,
  LineChart,
} from "recharts"
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Layout } from "@/components/Layout"
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute"

interface Visita {
  id: string
  cliente_nome: string
  cliente_cpf: string
  corretor_nome: string
  empreendimento: string | null
  loja: string
  andar: string
  mesa: string
  horario_entrada: string
  horario_saida: string | null
  finalizada: boolean
  created_at: string
  tempo_atendimento?: number
}

interface VisitaStats {
  totalVisitas: number
  visitasAtivas: number
  visitasFinalizadas: number
  tempoMedioAtendimento: number
  visitasHoje: number
  corretorMaisAtivo: string
  empreendimentoMaisVisitado: string
  mesaMaisUsada: string
}

const ITEMS_PER_PAGE = 10

const AdvancedDashboardHome = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Estados para filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [filtroCorretor, setFiltroCorretor] = useState("")
  const [filtroEmpreendimento, setFiltroEmpreendimento] = useState("")
  const [filtroLoja, setFiltroLoja] = useState("")
  const [filtroPeriodo, setFiltroPeriodo] = useState("")
  const [busca, setBusca] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Estados para paginação e ordenação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [paginaFinalizadas, setPaginaFinalizadas] = useState(1)
  const [ordenacao, setOrdenacao] = useState<{ campo: string; direcao: "asc" | "desc" }>({
    campo: "horario_entrada",
    direcao: "desc",
  })

  // Estados para modal e ações
  const [selectedVisit, setSelectedVisit] = useState<Visita | null>(null)
  const [brindeDialogOpen, setBrindeDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)

  // Estados para visualização
  const [mostrarDetalhes, setMostrarDetalhes] = useState(true)
  const [atualizacaoAutomatica, setAtualizacaoAutomatica] = useState(true)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")

  // Auto-refresh a cada 30 segundos se ativado
  useEffect(() => {
    if (!atualizacaoAutomatica) return

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["visitas"] })
      queryClient.invalidateQueries({ queryKey: ["visitas-stats"] })
    }, 30000)

    return () => clearInterval(interval)
  }, [atualizacaoAutomatica, queryClient])

  // Buscar todas as visitas
  const { data: visitas = [], isLoading } = useQuery({
    queryKey: ["visitas", filtroDataInicio, filtroDataFim],
    queryFn: async () => {
      let query = supabase.from("visitas").select("*").order("horario_entrada", { ascending: false })

      if (filtroDataInicio) {
        query = query.gte("horario_entrada", filtroDataInicio)
      }

      if (filtroDataFim) {
        query = query.lte("horario_entrada", filtroDataFim + "T23:59:59")
      }

      const { data, error } = await query

      if (error) throw error
      return data as Visita[]
    },
  })

  // Estatísticas das visitas
  const { data: stats } = useQuery({
    queryKey: ["visitas-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("visitas").select("*")

      if (error) throw error

      const hoje = new Date()
      const inicioHoje = startOfDay(hoje)
      const fimHoje = endOfDay(hoje)

      const visitasHoje = data.filter((v) =>
        isWithinInterval(new Date(v.horario_entrada), { start: inicioHoje, end: fimHoje }),
      )

      const visitasAtivas = data.filter((v) => !v.finalizada)
      const visitasFinalizadas = data.filter((v) => v.finalizada)

      // Calcular tempo médio de atendimento
      const temposAtendimento = visitasFinalizadas
        .filter((v) => v.horario_saida)
        .map((v) => differenceInMinutes(new Date(v.horario_saida!), new Date(v.horario_entrada)))

      const tempoMedioAtendimento =
        temposAtendimento.length > 0
          ? Math.round(temposAtendimento.reduce((acc, tempo) => acc + tempo, 0) / temposAtendimento.length)
          : 0

      // Corretor mais ativo
      const corretorCount = data.reduce(
        (acc, v) => {
          acc[v.corretor_nome] = (acc[v.corretor_nome] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const corretorMaisAtivo = Object.entries(corretorCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

      // Empreendimento mais visitado
      const empreendimentoCount = data.reduce(
        (acc, v) => {
          if (v.empreendimento) {
            acc[v.empreendimento] = (acc[v.empreendimento] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

      const empreendimentoMaisVisitado =
        Object.entries(empreendimentoCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

      // Mesa mais usada
      const mesaCount = data.reduce(
        (acc, v) => {
          const mesa = `${v.loja} - Mesa ${v.mesa}`
          acc[mesa] = (acc[mesa] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const mesaMaisUsada = Object.entries(mesaCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"

      return {
        totalVisitas: data.length,
        visitasAtivas: visitasAtivas.length,
        visitasFinalizadas: visitasFinalizadas.length,
        tempoMedioAtendimento,
        visitasHoje: visitasHoje.length,
        corretorMaisAtivo,
        empreendimentoMaisVisitado,
        mesaMaisUsada,
      } as VisitaStats
    },
  })

  // Mutation para finalizar visita
  const finalizarVisitaMutation = useMutation({
    mutationFn: async (visitaId: string) => {
      const { error } = await supabase
        .from("visitas")
        .update({
          finalizada: true,
          horario_saida: new Date().toISOString(),
        })
        .eq("id", visitaId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitas"] })
      queryClient.invalidateQueries({ queryKey: ["visitas-stats"] })
      toast({
        title: "Visita finalizada!",
        description: "A visita foi finalizada com sucesso.",
      })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a visita.",
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

  // Filtrar visitas
  const visitasFiltradas = useMemo(() => {
    return visitas.filter((visita) => {
      const matchesSearch =
        visita.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
        visita.cliente_cpf.includes(busca) ||
        visita.corretor_nome.toLowerCase().includes(busca.toLowerCase())

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "ativa" && !visita.finalizada) ||
        (statusFilter === "finalizada" && visita.finalizada)

      const matchesCorretor =
        !filtroCorretor || visita.corretor_nome.toLowerCase().includes(filtroCorretor.toLowerCase())

      const matchesEmpreendimento =
        !filtroEmpreendimento ||
        (visita.empreendimento && visita.empreendimento.toLowerCase().includes(filtroEmpreendimento.toLowerCase()))

      const matchesLoja = !filtroLoja || visita.loja.toLowerCase().includes(filtroLoja.toLowerCase())

      return matchesSearch && matchesStatus && matchesCorretor && matchesEmpreendimento && matchesLoja
    })
  }, [visitas, busca, statusFilter, filtroCorretor, filtroEmpreendimento, filtroLoja])

  // Separar visitas ativas e finalizadas
  const visitasAtivas = visitasFiltradas.filter((v) => !v.finalizada)
  const visitasFinalizadas = visitasFiltradas.filter((v) => v.finalizada)

  // Dados para gráficos
  const dadosGraficos = useMemo(() => {
    const visitasPorCorretor = visitasFiltradas.reduce(
      (acc, visita) => {
        acc[visita.corretor_nome] = (acc[visita.corretor_nome] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const visitasPorEmpreendimento = visitasFiltradas.reduce(
      (acc, visita) => {
        if (visita.empreendimento) {
          acc[visita.empreendimento] = (acc[visita.empreendimento] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const visitasPorDia = visitasFiltradas.reduce(
      (acc, visita) => {
        const dia = format(new Date(visita.horario_entrada), "dd/MM")
        acc[dia] = (acc[dia] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const visitasPorHora = visitasFiltradas.reduce(
      (acc, visita) => {
        const hora = format(new Date(visita.horario_entrada), "HH:00")
        acc[hora] = (acc[hora] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      porCorretor: Object.entries(visitasPorCorretor).map(([corretor, quantidade]) => ({
        corretor,
        quantidade,
      })),
      porEmpreendimento: Object.entries(visitasPorEmpreendimento).map(([empreendimento, quantidade]) => ({
        empreendimento,
        quantidade,
        fill: `hsl(${Math.random() * 360}, 70%, 50%)`,
      })),
      porDia: Object.entries(visitasPorDia)
        .map(([dia, quantidade]) => ({ dia, quantidade }))
        .slice(-7),
      porHora: Object.entries(visitasPorHora)
        .map(([hora, quantidade]) => ({ hora, quantidade }))
        .sort((a, b) => a.hora.localeCompare(b.hora)),
    }
  }, [visitasFiltradas])

  // Paginação
  const totalPaginasAtivas = Math.ceil(visitasAtivas.length / ITEMS_PER_PAGE)
  const visitasAtivasPaginadas = visitasAtivas.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE)

  const totalPaginasFinalizadas = Math.ceil(visitasFinalizadas.length / ITEMS_PER_PAGE)
  const visitasFinalizadasPaginadas = visitasFinalizadas.slice(
    (paginaFinalizadas - 1) * ITEMS_PER_PAGE,
    paginaFinalizadas * ITEMS_PER_PAGE,
  )

  // Função para calcular tempo de atendimento
  const getTempoAtendimento = (horarioEntrada: string, horarioSaida?: string | null) => {
    const entrada = new Date(horarioEntrada)
    const saida = horarioSaida ? new Date(horarioSaida) : new Date()
    const minutos = differenceInMinutes(saida, entrada)

    if (minutos < 60) {
      return `${minutos}min`
    } else {
      const horas = Math.floor(minutos / 60)
      const minutosRestantes = minutos % 60
      return `${horas}h ${minutosRestantes}min`
    }
  }

  const finalizarVisita = (visitaId: string) => {
    finalizarVisitaMutation.mutate(visitaId)
  }

  const exportarCSV = () => {
    const csvContent = [
      ["Cliente", "CPF", "Corretor", "Empreendimento", "Loja", "Mesa", "Entrada", "Saída", "Tempo Atendimento"],
      ...visitasFiltradas.map((visita) => [
        visita.cliente_nome,
        visita.cliente_cpf,
        visita.corretor_nome,
        visita.empreendimento || "",
        visita.loja,
        visita.mesa,
        format(new Date(visita.horario_entrada), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        visita.horario_saida ? format(new Date(visita.horario_saida), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
        visita.horario_saida
          ? getTempoAtendimento(visita.horario_entrada, visita.horario_saida)
          : getTempoAtendimento(visita.horario_entrada),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `visitas_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()
  }

  const limparFiltros = () => {
    setFiltroDataInicio("")
    setFiltroDataFim("")
    setFiltroCorretor("")
    setFiltroEmpreendimento("")
    setFiltroLoja("")
    setFiltroPeriodo("")
    setBusca("")
    setStatusFilter("all")
    setPaginaAtual(1)
    setPaginaFinalizadas(1)
  }

  return (
    <RoleProtectedRoute allowedRoles={["recepcionista"]}>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Principal</h1>
                    <p className="text-gray-600">Controle completo de visitas e atendimentos</p>
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
                      queryClient.invalidateQueries({ queryKey: ["visitas"] })
                      queryClient.invalidateQueries({ queryKey: ["visitas-stats"] })
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
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ativos ({visitasAtivas.length})
                </TabsTrigger>
                <TabsTrigger value="finished" className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Finalizados ({visitasFinalizadas.length})
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Visitas Hoje</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.visitasHoje || 0}</div>
                        </div>
                        <CalendarIcon className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Atendimentos Ativos</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.visitasAtivas || 0}</div>
                        </div>
                        <Users className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Total Visitas</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.totalVisitas || 0}</div>
                        </div>
                        <FileText className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Tempo Médio</CardTitle>
                          <div className="text-3xl font-bold mt-1">{stats?.tempoMedioAtendimento || 0}min</div>
                        </div>
                        <Timer className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Visitas por Corretor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          quantidade: {
                            label: "Visitas",
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

                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-600" />
                        Distribuição por Empreendimento
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
                            data={dadosGraficos.porEmpreendimento}
                            dataKey="quantidade"
                            nameKey="empreendimento"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                          >
                            {dadosGraficos.porEmpreendimento.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </RechartsPieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico de Tendência */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Visitas por Dia (Últimos 7 dias)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          quantidade: {
                            label: "Visitas",
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

                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Distribuição por Horário
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          quantidade: {
                            label: "Visitas",
                            color: "hsl(var(--chart-3))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <LineChart data={dadosGraficos.porHora}>
                          <XAxis dataKey="hora" />
                          <YAxis />
                          <Line
                            type="monotone"
                            dataKey="quantidade"
                            stroke="var(--color-quantidade)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-quantidade)" }}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-cyan-700">
                        <Award className="w-5 h-5" />
                        Corretor Destaque
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-cyan-800">{stats?.corretorMaisAtivo}</p>
                      <p className="text-sm text-cyan-600">Maior número de atendimentos</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-700">
                        <Building2 className="w-5 h-5" />
                        Empreendimento Popular
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-emerald-800">{stats?.empreendimentoMaisVisitado}</p>
                      <p className="text-sm text-emerald-600">Mais visitado</p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700">
                        <MapPin className="w-5 h-5" />
                        Mesa Preferida
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-purple-800">{stats?.mesaMaisUsada}</p>
                      <p className="text-sm text-purple-600">Mais utilizada</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="active" className="space-y-6">
                {/* Filtros */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Filter className="w-6 h-6 text-blue-600" />
                        <CardTitle className="text-xl">Filtros de Busca</CardTitle>
                      </div>
                      <Button variant="outline" size="sm" onClick={limparFiltros}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Limpar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                        <Label className="text-sm font-medium">Corretor</Label>
                        <Input
                          placeholder="Nome do corretor..."
                          value={filtroCorretor}
                          onChange={(e) => setFiltroCorretor(e.target.value)}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Empreendimento</Label>
                        <Input
                          placeholder="Nome do empreendimento..."
                          value={filtroEmpreendimento}
                          onChange={(e) => setFiltroEmpreendimento(e.target.value)}
                          className="h-10"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Loja</Label>
                        <Input
                          placeholder="Nome da loja..."
                          value={filtroLoja}
                          onChange={(e) => setFiltroLoja(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Visitas Ativas */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-6 h-6 text-emerald-600" />
                        <div>
                          <CardTitle className="text-xl">Atendimentos Ativos</CardTitle>
                          <CardDescription className="text-base">Clientes sendo atendidos no momento</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {visitasAtivas.length} ativo{visitasAtivas.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando atendimentos</h3>
                        <p className="text-gray-500">Aguarde enquanto buscamos os atendimentos ativos...</p>
                      </div>
                    ) : visitasAtivas.length === 0 ? (
                      <div className="text-center py-12">
                        <UserX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento ativo</h3>
                        <p className="text-gray-500">Não há atendimentos em andamento no momento</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="font-semibold">Cliente</TableHead>
                                <TableHead className="font-semibold">Corretor</TableHead>
                                <TableHead className="font-semibold">Empreendimento</TableHead>
                                <TableHead className="font-semibold">Local</TableHead>
                                <TableHead className="font-semibold">Entrada</TableHead>
                                <TableHead className="font-semibold">Tempo</TableHead>
                                <TableHead className="font-semibold text-center">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {visitasAtivasPaginadas.map((visita) => (
                                <TableRow key={visita.id} className="hover:bg-gray-50/50">
                                  <TableCell>
                                    <div className="space-y-1">
                                      <p className="font-medium text-gray-900">{visita.cliente_nome}</p>
                                      <p className="text-sm text-gray-500">{visita.cliente_cpf}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      {visita.corretor_nome}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-gray-900">{visita.empreendimento || "-"}</span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">{visita.loja}</div>
                                      <div className="text-gray-500">
                                        {visita.andar} - Mesa {visita.mesa}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {format(new Date(visita.horario_entrada), "dd/MM", { locale: ptBR })}
                                      </div>
                                      <div className="text-gray-500">
                                        {format(new Date(visita.horario_entrada), "HH:mm", { locale: ptBR })}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className={`${
                                        differenceInMinutes(new Date(), new Date(visita.horario_entrada)) > 120
                                          ? "bg-red-100 text-red-800"
                                          : differenceInMinutes(new Date(), new Date(visita.horario_entrada)) > 60
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {getTempoAtendimento(visita.horario_entrada)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center gap-2 justify-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedVisit(visita)
                                          setDetailsDialogOpen(true)
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => finalizarVisita(visita.id)}
                                        disabled={finalizarVisitaMutation.isPending}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                      >
                                        {finalizarVisitaMutation.isPending ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <>
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Finalizar
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Paginação Ativos */}
                        {totalPaginasAtivas > 1 && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Página {paginaAtual} de {totalPaginasAtivas}
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
                                onClick={() => setPaginaAtual(Math.min(totalPaginasAtivas, paginaAtual + 1))}
                                disabled={paginaAtual === totalPaginasAtivas}
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

              <TabsContent value="finished" className="space-y-6">
                {/* Filtros de Período */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      Filtros de Período
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    {filtroPeriodo === "" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Data Início</Label>
                          <Input
                            type="date"
                            value={filtroDataInicio}
                            onChange={(e) => setFiltroDataInicio(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Data Fim</Label>
                          <Input
                            type="date"
                            value={filtroDataFim}
                            onChange={(e) => setFiltroDataFim(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Visitas Finalizadas */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-purple-600" />
                        <div>
                          <CardTitle className="text-xl">Visitas Finalizadas</CardTitle>
                          <CardDescription className="text-base">Histórico de atendimentos concluídos</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                          {visitasFinalizadas.length} finalizada{visitasFinalizadas.length !== 1 ? "s" : ""}
                        </Badge>
                        <Button
                          onClick={exportarCSV}
                          variant="outline"
                          className="hover:bg-green-50 hover:border-green-200 bg-transparent"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {visitasFinalizadas.length === 0 ? (
                      <div className="text-center py-12">
                        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma visita finalizada</h3>
                        <p className="text-gray-500">Não há visitas finalizadas no período selecionado</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border overflow-hidden">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="font-semibold">Cliente</TableHead>
                                <TableHead className="font-semibold">Corretor</TableHead>
                                <TableHead className="font-semibold">Empreendimento</TableHead>
                                <TableHead className="font-semibold">Local</TableHead>
                                <TableHead className="font-semibold">Entrada</TableHead>
                                <TableHead className="font-semibold">Saída</TableHead>
                                <TableHead className="font-semibold">Tempo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {visitasFinalizadasPaginadas.map((visita) => (
                                <TableRow key={visita.id} className="hover:bg-gray-50/50">
                                  <TableCell>
                                    <div className="space-y-1">
                                      <p className="font-medium text-gray-900">{visita.cliente_nome}</p>
                                      <p className="text-sm text-gray-500">{visita.cliente_cpf}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-medium">
                                      {visita.corretor_nome}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-gray-900">{visita.empreendimento || "-"}</span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">{visita.loja}</div>
                                      <div className="text-gray-500">
                                        {visita.andar} - Mesa {visita.mesa}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <div className="font-medium">
                                        {format(new Date(visita.horario_entrada), "dd/MM", { locale: ptBR })}
                                      </div>
                                      <div className="text-gray-500">
                                        {format(new Date(visita.horario_entrada), "HH:mm", { locale: ptBR })}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {visita.horario_saida ? (
                                      <div className="text-sm">
                                        <div className="font-medium">
                                          {format(new Date(visita.horario_saida), "dd/MM", { locale: ptBR })}
                                        </div>
                                        <div className="text-gray-500">
                                          {format(new Date(visita.horario_saida), "HH:mm", { locale: ptBR })}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      {getTempoAtendimento(visita.horario_entrada, visita.horario_saida)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Paginação Finalizadas */}
                        {totalPaginasFinalizadas > 1 && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              Página {paginaFinalizadas} de {totalPaginasFinalizadas}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPaginaFinalizadas(Math.max(1, paginaFinalizadas - 1))}
                                disabled={paginaFinalizadas === 1}
                              >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setPaginaFinalizadas(Math.min(totalPaginasFinalizadas, paginaFinalizadas + 1))
                                }
                                disabled={paginaFinalizadas === totalPaginasFinalizadas}
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
                        Insights de Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Eficiência</span>
                        </div>
                        <p className="text-blue-800">
                          Tempo médio de atendimento de <strong>{stats?.tempoMedioAtendimento}min</strong> indica boa
                          eficiência.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-900">Capacidade</span>
                        </div>
                        <p className="text-emerald-800">
                          <strong>{stats?.visitasAtivas}</strong> atendimentos ativos no momento.
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Movimento</span>
                        </div>
                        <p className="text-purple-800">
                          <strong>{stats?.visitasHoje}</strong> visitas registradas hoje.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        Métricas Operacionais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Total de Visitas</span>
                          <Badge variant="secondary">{stats?.totalVisitas || 0}</Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Taxa de Finalização</span>
                          <Badge className="bg-green-100 text-green-800">
                            {stats?.totalVisitas
                              ? Math.round((stats.visitasFinalizadas / stats.totalVisitas) * 100)
                              : 0}
                            %
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Atendimentos Ativos</span>
                          <Badge variant={Number(stats?.visitasAtivas) > 10 ? "destructive" : "secondary"}>
                            {stats?.visitasAtivas || 0}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Movimento Hoje</span>
                          <Badge variant="secondary">{stats?.visitasHoje || 0}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Dialog de Detalhes */}
          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Detalhes da Visita
                </DialogTitle>
              </DialogHeader>
              {selectedVisit && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Cliente</label>
                      <p className="text-sm text-gray-600">{selectedVisit.cliente_nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">CPF</label>
                      <p className="text-sm text-gray-600">{selectedVisit.cliente_cpf}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Corretor</label>
                      <p className="text-sm text-gray-600">{selectedVisit.corretor_nome}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Empreendimento</label>
                      <p className="text-sm text-gray-600">{selectedVisit.empreendimento || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Loja</label>
                      <p className="text-sm text-gray-600">{selectedVisit.loja}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Local</label>
                      <p className="text-sm text-gray-600">
                        {selectedVisit.andar} - Mesa {selectedVisit.mesa}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Horário de Entrada</label>
                      <p className="text-sm text-gray-600">
                        {format(new Date(selectedVisit.horario_entrada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {selectedVisit.horario_saida && (
                      <div>
                        <label className="text-sm font-medium">Horário de Saída</label>
                        <p className="text-sm text-gray-600">
                          {format(new Date(selectedVisit.horario_saida), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Tempo de Atendimento</label>
                      <p className="text-sm text-gray-600">
                        {getTempoAtendimento(selectedVisit.horario_entrada, selectedVisit.horario_saida)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Badge variant={selectedVisit.finalizada ? "default" : "secondary"} className="mt-1">
                        {selectedVisit.finalizada ? "Finalizada" : "Ativa"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    </RoleProtectedRoute>
  )
}

export default AdvancedDashboardHome
