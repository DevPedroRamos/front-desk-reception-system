"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { MetricsGrid } from "@/components/analytics/MetricsGrid"
import { ChartContainer } from "@/components/analytics/ChartContainer"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import {
  Calendar,
  Users,
  X,
  Search,
  Filter,
  TrendingUp,
  Activity,
  CheckCircle2,
  Timer,
  Building2,
  Loader2,
  RefreshCw,
  Download,
  Eye,
  UserX,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react"

interface DashboardStats {
  total_visitas_hoje: number
  visitas_ativas: number
  visitas_finalizadas_hoje: number
  mesas_ocupadas: number
  clientes_lista_espera: number
}

interface Visit {
  id: string
  cliente_nome: string
  cliente_cpf: string
  cliente_whatsapp?: string
  corretor_nome: string
  corretor_id: string
  empreendimento: string
  loja: string
  andar: string
  mesa: number
  horario_entrada: string
  horario_saida?: string
  status: string
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Index() {
  const [stats, setStats] = useState<DashboardStats>({
    total_visitas_hoje: 0,
    visitas_ativas: 0,
    visitas_finalizadas_hoje: 0,
    mesas_ocupadas: 0,
    clientes_lista_espera: 0,
  })

  const [activeVisits, setActiveVisits] = useState<Visit[]>([])
  const [finishedVisits, setFinishedVisits] = useState<Visit[]>([])
  const [superintendentes, setSuperintendentes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [corretorData, setCorretorData] = useState<any[]>([])
  const [lojaData, setLojaData] = useState<any[]>([])

  // Inicializar filtros com data atual
  const hoje = new Date()
  const [startDate, setStartDate] = useState(format(hoje, "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(hoje, "yyyy-MM-dd"))
  const [selectedSuperintendente, setSelectedSuperintendente] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const loadSuperintendentes = async () => {
    const { data } = await supabase.from("users").select("superintendente").not("superintendente", "is", null)

    if (data) {
      const uniqueSuperintendentes = [
        ...new Set(
          data
            .map((u) => u.superintendente)
            .filter((sup) => sup && sup.trim() !== ""),
        ),
      ]
      setSuperintendentes(uniqueSuperintendentes)
    }
  }

  const loadAnalyticsData = async () => {
    try {
      // Dados para gráfico de visitas por dia (últimos 7 dias)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return format(date, 'yyyy-MM-dd')
      }).reverse()

      const chartPromises = last7Days.map(async (date) => {
        const { count } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .gte('horario_entrada', `${date}T00:00:00`)
          .lt('horario_entrada', `${date}T23:59:59`)

        return {
          date: format(new Date(date), 'dd/MM'),
          visitas: count || 0
        }
      })

      const chartResults = await Promise.all(chartPromises)
      setChartData(chartResults)

      // Dados por corretor (top 5)
      const { data: visitasCorretores } = await supabase
        .from('visits')
        .select('corretor_nome')
        .gte('horario_entrada', `${startDate}T00:00:00`)
        .lte('horario_entrada', `${endDate}T23:59:59`)

      if (visitasCorretores) {
        const corretorCount = visitasCorretores.reduce((acc: any, visit) => {
          const nome = visit.corretor_nome || 'Sem corretor'
          acc[nome] = (acc[nome] || 0) + 1
          return acc
        }, {})

        const corretorArray = Object.entries(corretorCount)
          .map(([nome, count]) => ({ nome, visitas: count }))
          .sort((a: any, b: any) => b.visitas - a.visitas)
          .slice(0, 5)

        setCorretorData(corretorArray)
      }

      // Dados por loja
      const { data: visitasLojas } = await supabase
        .from('visits')
        .select('loja')
        .gte('horario_entrada', `${startDate}T00:00:00`)
        .lte('horario_entrada', `${endDate}T23:59:59`)

      if (visitasLojas) {
        const lojaCount = visitasLojas.reduce((acc: any, visit) => {
          const loja = visit.loja
          acc[loja] = (acc[loja] || 0) + 1
          return acc
        }, {})

        const lojaArray = Object.entries(lojaCount)
          .map(([nome, count]) => ({ nome, value: count }))

        setLojaData(lojaArray)
      }

    } catch (error) {
      console.error('Erro ao carregar dados analíticos:', error)
    }
  }

  // Função para filtros rápidos
  const setFiltroRapido = (tipo: "hoje" | "mes") => {
    const hoje = new Date()

    if (tipo === "hoje") {
      const dataHoje = format(hoje, "yyyy-MM-dd")
      setStartDate(dataHoje)
      setEndDate(dataHoje)
    } else if (tipo === "mes") {
      const inicioMes = format(startOfMonth(hoje), "yyyy-MM-dd")
      const fimMes = format(endOfMonth(hoje), "yyyy-MM-dd")
      setStartDate(inicioMes)
      setEndDate(fimMes)
    }
  }

  const loadDashboardStats = async () => {
    try {
      const params: any = {}

      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (selectedSuperintendente !== "all") params.superintendente = selectedSuperintendente

      const { data, error } = await supabase.rpc("get_dashboard_stats_filtered", params)

      if (error) {
        console.log("RPC error, fallback to manual calculation:", error)
        await loadDashboardStatsManual()
        return
      }

      if (data && data.length > 0) {
        setStats(data[0])
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
      await loadDashboardStatsManual()
    }
  }

  const loadDashboardStatsManual = async () => {
    try {
      const baseQuery = supabase.from("visits").select("*", { count: "exact" })

      let totalQuery = baseQuery
      if (startDate) {
        totalQuery = totalQuery.gte("horario_entrada", startDate)
      }
      if (endDate) {
        totalQuery = totalQuery.lte("horario_entrada", endDate + "T23:59:59")
      }
      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          totalQuery = totalQuery.in("corretor_id", userIds)
        }
      }

      const { count: totalVisitas } = await totalQuery

      let activeQuery = supabase.from("visits").select("*", { count: "exact" }).eq("status", "ativo")
      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          activeQuery = activeQuery.in("corretor_id", userIds)
        }
      }

      const { count: visitasAtivas } = await activeQuery

      let finishedQuery = supabase.from("visits").select("*", { count: "exact" }).eq("status", "finalizado")
      if (startDate) {
        finishedQuery = finishedQuery.gte("horario_entrada", startDate)
      }
      if (endDate) {
        finishedQuery = finishedQuery.lte("horario_entrada", endDate + "T23:59:59")
      }
      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          finishedQuery = finishedQuery.in("corretor_id", userIds)
        }
      }

      const { count: visitasFinalizadas } = await finishedQuery

      let mesasQuery = supabase.from("visits").select("mesa").eq("status", "ativo")
      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          mesasQuery = mesasQuery.in("corretor_id", userIds)
        }
      }

      const { data: mesasData } = await mesasQuery
      const mesasOcupadas = mesasData ? new Set(mesasData.map((v) => v.mesa)).size : 0

      let listaEsperaQuery = supabase.from("lista_espera").select("*", { count: "exact" }).eq("status", "aguardando")
      if (startDate) {
        listaEsperaQuery = listaEsperaQuery.gte("created_at", startDate)
      }
      if (endDate) {
        listaEsperaQuery = listaEsperaQuery.lte("created_at", endDate + "T23:59:59")
      }
      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          listaEsperaQuery = listaEsperaQuery.or(`corretor_id.is.null,corretor_id.in.(${userIds.join(",")})`)
        }
      }

      const { count: clientesListaEspera } = await listaEsperaQuery

      setStats({
        total_visitas_hoje: totalVisitas || 0,
        visitas_ativas: visitasAtivas || 0,
        visitas_finalizadas_hoje: visitasFinalizadas || 0,
        mesas_ocupadas: mesasOcupadas,
        clientes_lista_espera: clientesListaEspera || 0,
      })
    } catch (error) {
      console.error("Error in manual stats calculation:", error)
      toast.error("Erro ao carregar estatísticas do dashboard")
    }
  }

  const loadActiveVisits = async () => {
    try {
      let query = supabase
        .from("visits")
        .select(
          `
          id,
          cliente_nome,
          cliente_cpf,
          corretor_nome,
          corretor_id,
          empreendimento,
          loja,
          andar,
          mesa,
          horario_entrada,
          status,
          users!visits_corretor_id_fkey(superintendente)
        `,
        )
        .eq("status", "ativo")
        .order("horario_entrada", { ascending: false })

      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          query = query.in("corretor_id", userIds)
        }
      }

      const { data, error } = await query

      if (error) throw error
      if (data) {
        setActiveVisits(data)
      }
    } catch (error) {
      console.error("Error loading active visits:", error)
      toast.error("Erro ao carregar visitas ativas")
    }
  }

  const loadFinishedVisits = async () => {
    try {
      let query = supabase
        .from("visits")
        .select(
          `
          id,
          cliente_nome,
          cliente_cpf,
          cliente_whatsapp,
          corretor_nome,
          corretor_id,
          empreendimento,
          loja,
          andar,
          mesa,
          horario_entrada,
          horario_saida,
          status,
          users!visits_corretor_id_fkey(superintendente)
        `,
        )
        .eq("status", "finalizado")
        .order("horario_saida", { ascending: false })

      if (startDate) {
        query = query.gte("horario_entrada", startDate)
      }
      if (endDate) {
        query = query.lte("horario_entrada", endDate + "T23:59:59")
      }

      if (selectedSuperintendente !== "all") {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("superintendente", selectedSuperintendente)

        if (userData) {
          const userIds = userData.map((u) => u.id)
          query = query.in("corretor_id", userIds)
        }
      }

      const { data, error } = await query

      if (error) throw error
      if (data) {
        setFinishedVisits(data)
      }
    } catch (error) {
      console.error("Error loading finished visits:", error)
      toast.error("Erro ao carregar visitas finalizadas")
    }
  }

  const finalizarVisita = async (visitId: string) => {
    try {
      const { error } = await supabase.rpc("finalizar_visita", { visit_id: visitId })

      if (error) {
        console.error('Erro ao finalizar visita:', error)
        toast.error("Erro ao finalizar visita")
        return
      }

      toast.success("Visita finalizada com sucesso!")
      loadActiveVisits()
      loadFinishedVisits()
      loadDashboardStats()
    } catch (error) {
      console.error("Error finishing visit:", error)
      toast.error("Erro ao finalizar visita")
    }
  }

  const exportToCSV = () => {
    const csvData = finishedVisits.map((visit) => ({
      Cliente: visit.cliente_nome,
      CPF: visit.cliente_cpf,
      WhatsApp: visit.cliente_whatsapp || "",
      Corretor: visit.corretor_nome,
      Empreendimento: visit.empreendimento || "",
      Loja: visit.loja,
      Andar: visit.andar,
      Mesa: visit.mesa,
      Entrada: format(new Date(visit.horario_entrada), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      Saída: visit.horario_saida ? format(new Date(visit.horario_saida), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `visitas_${format(new Date(), "dd-MM-yyyy")}.csv`)
    link.click()
  }

  const clearFilters = () => {
    const hoje = format(new Date(), "yyyy-MM-dd")
    setStartDate(hoje)
    setEndDate(hoje)
    setSelectedSuperintendente("all")
    setSearchTerm("")
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadDashboardStats()
    await loadActiveVisits()
    await loadFinishedVisits()
    await loadAnalyticsData()
    setRefreshing(false)
    toast.success("Dados atualizados!")
  }

  const filteredActiveVisits = activeVisits.filter((visit) =>
    visit.corretor_nome.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTempoAtendimento = (horarioEntrada: string) => {
    const entrada = new Date(horarioEntrada)
    const agora = new Date()
    const diffMs = agora.getTime() - entrada.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Dados para o MetricsGrid
  const metricsData = {
    totalVisitas: stats.total_visitas_hoje,
    visitasHoje: stats.total_visitas_hoje,
    visitasAtivas: stats.visitas_ativas,
    tempoMedio: 45, // Valor exemplo
    taxaConversao: 68, // Valor exemplo
    crescimentoSemanal: 12, // Valor exemplo
    metaMensal: 85, // Valor exemplo
    performanceGeral: 92, // Valor exemplo
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await loadSuperintendentes()
      await loadDashboardStats()
      await loadActiveVisits()
      await loadFinishedVisits()
      await loadAnalyticsData()
      setLoading(false)
    }

    loadData()
  }, [startDate, endDate, selectedSuperintendente])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Carregando Dashboard</h3>
                <p className="text-muted-foreground">Aguarde enquanto buscamos os dados...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Analytics</h1>
                <p className="text-muted-foreground text-lg">Visão geral dos atendimentos em tempo real</p>
              </div>
              <Button onClick={refreshData} disabled={refreshing} className="bg-primary hover:bg-primary/90">
                {refreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Filtros */}
          <Card className="shadow-lg border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Filtros</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-3">
                <Button
                  variant={
                    startDate === format(new Date(), "yyyy-MM-dd") && endDate === format(new Date(), "yyyy-MM-dd")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setFiltroRapido("hoje")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Hoje
                </Button>
                <Button
                  variant={
                    startDate === format(startOfMonth(new Date()), "yyyy-MM-dd") &&
                    endDate === format(endOfMonth(new Date()), "yyyy-MM-dd")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setFiltroRapido("mes")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Mês Atual
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data Inicial</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data Final</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Superintendente</label>
                  <Select value={selectedSuperintendente} onValueChange={setSelectedSuperintendente}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os superintendentes</SelectItem>
                      {superintendentes
                        .filter((sup) => sup && sup.trim() !== "")
                        .map((sup) => (
                          <SelectItem key={sup} value={sup}>
                            {sup}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full h-11 hover:bg-destructive/10 hover:border-destructive/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Principais */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Métricas Principais</h2>
            </div>
            <MetricsGrid data={metricsData} isLoading={loading} />
          </div>

          {/* Gráficos Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartContainer
              title="Visitas por Dia"
              description="Últimos 7 dias"
              isLoading={loading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitas" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="Top 5 Corretores"
              description="Visitas no período"
              isLoading={loading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={corretorData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="nome" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="visitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="Distribuição por Loja"
              description="Visitas por localização"
              isLoading={loading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lojaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lojaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer
              title="Performance Semanal"
              description="Comparativo de performance"
              isLoading={loading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { semana: 'Sem 1', meta: 100, realizado: 85 },
                  { semana: 'Sem 2', meta: 100, realizado: 92 },
                  { semana: 'Sem 3', meta: 100, realizado: 78 },
                  { semana: 'Sem 4', meta: 100, realizado: 105 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="semana" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="meta" fill="hsl(var(--muted))" name="Meta" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="realizado" fill="hsl(var(--primary))" name="Realizado" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Atendimentos Ativos */}
          <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-green-600" />
                  <div>
                    <CardTitle className="text-xl">Atendimentos Ativos</CardTitle>
                    <CardDescription className="text-base">Lista de atendimentos em andamento</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar por corretor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {filteredActiveVisits.length} ativo{filteredActiveVisits.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
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
                    {filteredActiveVisits.map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{visit.cliente_nome}</p>
                            <p className="text-sm text-muted-foreground">{visit.cliente_cpf}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {visit.corretor_nome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground">{visit.empreendimento || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{visit.loja}</div>
                            <div className="text-muted-foreground">
                              {visit.andar} - Mesa {visit.mesa}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(visit.horario_entrada), "dd/MM", { locale: ptBR })}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(visit.horario_entrada), "HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {getTempoAtendimento(visit.horario_entrada)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => finalizarVisita(visit.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Finalizar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredActiveVisits.length === 0 && (
                  <div className="text-center py-12">
                    <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhum atendimento ativo</h3>
                    <p className="text-muted-foreground">Não há atendimentos em andamento no momento</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visitas Finalizadas */}
          <Card className="shadow-lg border-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-xl">Visitas Finalizadas</CardTitle>
                    <CardDescription className="text-base">Histórico de visitas finalizadas</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {finishedVisits.length} finalizada{finishedVisits.length !== 1 ? "s" : ""}
                  </Badge>
                  <Button onClick={exportToCSV} variant="outline" className="hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Corretor</TableHead>
                      <TableHead className="font-semibold">Empreendimento</TableHead>
                      <TableHead className="font-semibold">Local</TableHead>
                      <TableHead className="font-semibold">Entrada</TableHead>
                      <TableHead className="font-semibold">Saída</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finishedVisits.slice(0, 50).map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{visit.cliente_nome}</p>
                            <p className="text-sm text-muted-foreground">{visit.cliente_cpf}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {visit.corretor_nome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground">{visit.empreendimento || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{visit.loja}</div>
                            <div className="text-muted-foreground">
                              {visit.andar} - Mesa {visit.mesa}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(visit.horario_entrada), "dd/MM", { locale: ptBR })}
                            </div>
                            <div className="text-muted-foreground">
                              {format(new Date(visit.horario_entrada), "HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {visit.horario_saida ? (
                            <div className="text-sm">
                              <div className="font-medium">
                                {format(new Date(visit.horario_saida), "dd/MM", { locale: ptBR })}
                              </div>
                              <div className="text-muted-foreground">
                                {format(new Date(visit.horario_saida), "HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {finishedVisits.length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma visita finalizada</h3>
                    <p className="text-muted-foreground">Não há visitas finalizadas no período selecionado</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}