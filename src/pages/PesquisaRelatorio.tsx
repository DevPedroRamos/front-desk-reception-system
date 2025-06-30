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
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
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
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  Activity,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Home,
  FileBarChart,
  UserCheck,
  Zap,
} from "lucide-react"
import { Bar, BarChart, Pie, PieChart as RechartsPieChart, Cell, XAxis, YAxis, Area, AreaChart } from "recharts"
import { format, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns"
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

// Mock data para demonstração
const mockPesquisas: PesquisaSatisfacao[] = [
  {
    id: "1",
    nome_completo: "João Silva Santos",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    corretor_nome: "Maria Oliveira",
    codigo_validacao: "1234",
    validado: false,
    created_at: new Date().toISOString(),
    nota_consultor: 9,
  },
  {
    id: "2",
    nome_completo: "Ana Costa Lima",
    cpf: "987.654.321-00",
    email: "ana@email.com",
    corretor_nome: "Carlos Pereira",
    codigo_validacao: "5678",
    validado: false,
    created_at: subDays(new Date(), 1).toISOString(),
    nota_consultor: 8,
  },
  {
    id: "3",
    nome_completo: "Pedro Almeida",
    cpf: "456.789.123-00",
    email: "pedro@email.com",
    corretor_nome: "Maria Oliveira",
    codigo_validacao: "9012",
    validado: false,
    created_at: subDays(new Date(), 2).toISOString(),
    nota_consultor: 10,
  },
]

const mockBrindes: Brinde[] = [
  {
    id: "1",
    cliente_nome: "Roberto Silva",
    cliente_cpf: "111.222.333-44",
    corretor_nome: "Maria Oliveira",
    tipo_brinde: "Cinemark",
    validado: true,
    data_validacao: subDays(new Date(), 1).toISOString(),
    pesquisa_satisfacao_id: "p1",
    created_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: "2",
    cliente_nome: "Fernanda Costa",
    cliente_cpf: "555.666.777-88",
    corretor_nome: "Carlos Pereira",
    tipo_brinde: "Vinho",
    validado: true,
    data_validacao: subDays(new Date(), 2).toISOString(),
    pesquisa_satisfacao_id: "p2",
    created_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: "3",
    cliente_nome: "Lucas Mendes",
    cliente_cpf: "999.888.777-66",
    corretor_nome: "Maria Oliveira",
    tipo_brinde: "Cinemark",
    validado: true,
    data_validacao: subDays(new Date(), 3).toISOString(),
    pesquisa_satisfacao_id: "p3",
    created_at: subDays(new Date(), 3).toISOString(),
  },
]

const ITEMS_PER_PAGE = 10

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileBarChart className="w-4 h-4" />
                  <span>Relatórios</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <UserCheck className="w-4 h-4" />
                  <span>Validações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Gift className="w-4 h-4" />
                  <span>Brindes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

const AdvancedReportsDashboard = () => {
  // Estados para filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [filtroCorretor, setFiltroCorretor] = useState("")
  const [filtroTipoBrinde, setFiltroTipoBrinde] = useState("")
  const [filtroNota, setFiltroNota] = useState("")
  const [filtroPeriodo, setFiltroPeriodo] = useState("")
  const [busca, setBusca] = useState("")

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

  // Mock data (em produção viria do Supabase)
  const pesquisas = mockPesquisas
  const brindesValidados = mockBrindes
  const isLoading = false

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

  // Filtrar dados
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

  // Métricas calculadas
  const metricas = useMemo(() => {
    const totalPesquisas = pesquisas.length + dadosFiltrados.length
    const taxaConversao = totalPesquisas > 0 ? (dadosFiltrados.length / totalPesquisas) * 100 : 0
    const notaMedia = pesquisas.reduce((acc, p) => acc + (p.nota_consultor || 0), 0) / pesquisas.length || 0
    const brindesCinemark = dadosFiltrados.filter((b) => b.tipo_brinde === "Cinemark").length
    const brindesVinho = dadosFiltrados.filter((b) => b.tipo_brinde === "Vinho").length

    return {
      totalPesquisas: pesquisas.length,
      totalBrindes: dadosFiltrados.length,
      taxaConversao: Math.round(taxaConversao),
      notaMedia: Math.round(notaMedia * 10) / 10,
      brindesCinemark,
      brindesVinho,
      corretorMaisAtivo: dadosGraficos.porCorretor.sort((a, b) => b.quantidade - a.quantidade)[0]?.corretor || "N/A",
    }
  }, [pesquisas, dadosFiltrados, dadosGraficos])

  // Paginação
  const totalPaginas = Math.ceil(dadosFiltrados.length / ITEMS_PER_PAGE)
  const dadosPaginados = dadosFiltrados.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE)

  const handleValidarBrinde = () => {
    // Lógica de validação aqui
    console.log("Validando brinde...")
  }

  const exportarCSV = () => {
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
    setPaginaAtual(1)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
          {/* Header */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Avançado</h1>
                    <p className="text-gray-600">Análise completa de brindes e pesquisas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={atualizacaoAutomatica} onCheckedChange={setAtualizacaoAutomatica} />
                    <Label className="text-sm">Auto-refresh</Label>
                  </div>
                  <Button variant="outline" size="sm">
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
                  <UserCheck className="w-4 h-4" />
                  Validações
                </TabsTrigger>
                <TabsTrigger value="relatorios" className="flex items-center gap-2">
                  <FileBarChart className="w-4 h-4" />
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
                          <CardTitle className="text-sm font-medium opacity-90">Pesquisas Pendentes</CardTitle>
                          <div className="text-3xl font-bold mt-1">{metricas.totalPesquisas}</div>
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
                          <div className="text-3xl font-bold mt-1">{metricas.totalBrindes}</div>
                        </div>
                        <CheckCircle className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Taxa Conversão</CardTitle>
                          <div className="text-3xl font-bold mt-1">{metricas.taxaConversao}%</div>
                        </div>
                        <Trophy className="w-8 h-8 opacity-80" />
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium opacity-90">Nota Média</CardTitle>
                          <div className="text-3xl font-bold mt-1">{metricas.notaMedia}</div>
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
                        <UserCheck className="w-6 h-6 text-purple-600" />
                        <div>
                          <CardTitle className="text-xl">Pesquisas Pendentes</CardTitle>
                          <p className="text-gray-600 mt-1">Validações aguardando processamento</p>
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
                        <p className="text-gray-500">Carregando pesquisas...</p>
                      </div>
                    ) : pesquisas.length === 0 ? (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Todas validadas!</h3>
                        <p className="text-gray-500">Não há pesquisas pendentes no momento.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
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
                                      Corretor: <span className="font-medium">{pesquisa.corretor_nome || "N/A"}</span>
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
                                    Validar
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
                                      className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Validar Brinde
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
                        <Label className="text-sm font-medium">Corretor</Label>
                        <Select value={filtroCorretor} onValueChange={setFiltroCorretor}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todos os corretores" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="Maria Oliveira">Maria Oliveira</SelectItem>
                            <SelectItem value="Carlos Pereira">Carlos Pereira</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo de Brinde</Label>
                        <Select value={filtroTipoBrinde} onValueChange={setFiltroTipoBrinde}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Todos os tipos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Todos</SelectItem>
                            <SelectItem value="Cinemark">🎬 Cinemark</SelectItem>
                            <SelectItem value="Vinho">🍷 Vinho</SelectItem>
                          </SelectContent>
                        </Select>
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
                        Exportar CSV
                      </Button>
                      <Button onClick={exportarJSON} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar JSON
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Gerar PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabela de Resultados */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileBarChart className="w-6 h-6 text-emerald-600" />
                        <div>
                          <CardTitle className="text-xl">Resultados Filtrados</CardTitle>
                          <p className="text-gray-600 mt-1">
                            Mostrando {dadosPaginados.length} de {dadosFiltrados.length} registros
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setMostrarDetalhes(!mostrarDetalhes)}>
                          {mostrarDetalhes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {dadosFiltrados.length === 0 ? (
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
                                <TableHead className="font-semibold">
                                  <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                                    Cliente
                                    <ArrowUpDown className="w-4 h-4 ml-1" />
                                  </Button>
                                </TableHead>
                                <TableHead className="font-semibold">CPF</TableHead>
                                <TableHead className="font-semibold">Corretor</TableHead>
                                <TableHead className="font-semibold">Brinde</TableHead>
                                <TableHead className="font-semibold">
                                  <Button variant="ghost" size="sm" className="h-auto p-0 font-semibold">
                                    Data Validação
                                    <ArrowUpDown className="w-4 h-4 ml-1" />
                                  </Button>
                                </TableHead>
                                {mostrarDetalhes && <TableHead className="font-semibold">Ações</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dadosPaginados.map((brinde) => (
                                <TableRow key={brinde.id} className="hover:bg-gray-50/50">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-emerald-600" />
                                      </div>
                                      <div>
                                        <span className="font-medium">{brinde.cliente_nome}</span>
                                        {mostrarDetalhes && (
                                          <div className="text-xs text-gray-500">ID: {brinde.id}</div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">{brinde.cliente_cpf}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{brinde.corretor_nome}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{brinde.tipo_brinde === "Cinemark" ? "🎬" : "🍷"}</span>
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
                                  {mostrarDetalhes && (
                                    <TableCell>
                                      <Button variant="ghost" size="sm">
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </TableCell>
                                  )}
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
                          <span className="font-medium text-blue-900">Corretor Destaque</span>
                        </div>
                        <p className="text-blue-800">
                          <strong>{metricas.corretorMaisAtivo}</strong> lidera com mais validações este período.
                        </p>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-900">Satisfação</span>
                        </div>
                        <p className="text-emerald-800">
                          Nota média de <strong>{metricas.notaMedia}</strong> indica alta satisfação dos clientes.
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-900">Preferência</span>
                        </div>
                        <p className="text-purple-800">
                          {metricas.brindesCinemark > metricas.brindesVinho ? "Cinemark" : "Vinho"} é o brinde mais
                          escolhido.
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
                          <span className="text-gray-600">Taxa de Conversão</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${metricas.taxaConversao}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-blue-600">{metricas.taxaConversao}%</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Brindes Cinemark</span>
                          <Badge variant="secondary">{metricas.brindesCinemark}</Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Brindes Vinho</span>
                          <Badge variant="secondary">{metricas.brindesVinho}</Badge>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Pendências</span>
                          <Badge variant={metricas.totalPesquisas > 0 ? "destructive" : "secondary"}>
                            {metricas.totalPesquisas}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdvancedReportsDashboard
