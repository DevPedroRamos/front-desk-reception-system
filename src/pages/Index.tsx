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
  Copy,
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
  origem_registro?: any
  empreendimento: string
  loja: string
  andar: string
  mesa: number
  horario_entrada: string
  horario_saida?: string
  status: string
}

export default function index() {
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

  // Inicializar filtros com data atual
  const hoje = new Date()
  const [startDate, setStartDate] = useState(format(hoje, "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(hoje, "yyyy-MM-dd"))
  const [selectedSuperintendente, setSelectedSuperintendente] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const loadSuperintendentes = async () => {
    const { data } = await supabase.from("users").select("superintendente").not("superintendente", "is", null)

    if (data) {
      // Filter out empty strings and null values, then get unique superintendentes
      const uniqueSuperintendentes = [
        ...new Set(
          data
            .map((u) => u.superintendente)
            .filter((sup) => sup && sup.trim() !== ""), // Filter out empty strings and null values
        ),
      ]
      setSuperintendentes(uniqueSuperintendentes)
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
      // Primeiro, tentar usar a função RPC
      const params: any = {}

      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      if (selectedSuperintendente !== "all") params.superintendente = selectedSuperintendente

      const { data, error } = await supabase.rpc("get_dashboard_stats_filtered", params)

      if (error) {
        console.log("RPC error, fallback to manual calculation:", error)
        // Fallback para cálculo manual se a função RPC falhar
        await loadDashboardStatsManual()
        return
      }

      if (data && data.length > 0) {
        setStats(data[0])
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
      // Fallback para cálculo manual
      await loadDashboardStatsManual()
    }
  }

  const loadDashboardStatsManual = async () => {
    try {
      // Cálculo manual das estatísticas
      const baseQuery = supabase.from("visits").select("*", { count: "exact" })

      // Total de visitas no período
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

      // Visitas ativas
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

      // Visitas finalizadas no período
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

      // Mesas ocupadas
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

      // Clientes na lista de espera
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
          // Incluir clientes sem corretor atribuído OU com corretor do superintendente selecionado
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
          origem_registro,
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

      // Aplicar filtros de data
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

  const copiarMensagemVisita = async (visit: Visit) => {
    try {
      // Buscar apelido do corretor
      const { data: corretorData } = await supabase
        .from('users')
        .select('apelido')
        .eq('id', visit.corretor_id)
        .single()
      
      const apelidoCorretor = corretorData?.apelido || visit.corretor_nome
      const primeiroNome = visit.cliente_nome.split(' ')[0]
      
      const mensagem = `Corretor ${apelidoCorretor} - Cliente ${primeiroNome} - ${visit.loja} - Mesa ${visit.mesa}`
      
      await navigator.clipboard.writeText(mensagem)
      
      toast.success("Mensagem copiada!", {
        description: "A mensagem foi copiada para a área de transferência.",
      })
    } catch (error) {
      console.error('Erro ao copiar:', error)
      toast.error("Erro ao copiar mensagem")
    }
  }

  const formatarOrigem = (origemRegistro: any) => {
    if (!origemRegistro) return "N/A"
    
    if (origemRegistro.tipo === "auto") {
      return "Auto Agendamento"
    }
    
    // Formato: "Recepcionista - Rayane" ou "Corretor - João"
    const role = origemRegistro.role || ""
    const nome = origemRegistro.nome || ""
    const roleCapitalizado = role.charAt(0).toUpperCase() + role.slice(1)
    
    return `${roleCapitalizado} - ${nome}`
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await loadSuperintendentes()
      await loadDashboardStats()
      await loadActiveVisits()
      await loadFinishedVisits()
      setLoading(false)
    }

    loadData()
  }, [startDate, endDate, selectedSuperintendente])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Carregando Dashboard</h3>
                <p className="text-gray-600">Aguarde enquanto buscamos os dados...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 mt-4">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600 text-lg">Visão geral dos atendimentos em tempo real</p>
              </div>
              <Button onClick={refreshData} disabled={refreshing} className="bg-blue-600 hover:bg-blue-700">
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

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 space-y-8">
          {/* Filtros */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-xl">Filtros</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Botões de Filtros Rápidos */}
              <div className="flex gap-3">
                <Button
                  variant={
                    startDate === format(new Date(), "yyyy-MM-dd") && endDate === format(new Date(), "yyyy-MM-dd")
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setFiltroRapido("hoje")}
                  className="bg-blue-600 hover:bg-blue-700"
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
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Mês Atual
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Data Inicial</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Data Final</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Superintendente</label>
                  <Select value={selectedSuperintendente} onValueChange={setSelectedSuperintendente}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os superintendentes</SelectItem>
                      {superintendentes
                        .filter((sup) => sup && sup.trim() !== "") // Additional safety filter
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
                    className="w-full h-11 hover:bg-red-50 hover:border-red-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Total de Visitas</CardTitle>
                <Users className="h-6 w-6 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total_visitas_hoje}</div>
                <p className="text-xs opacity-80 mt-1">Visitas no período</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Atendimentos Ativos</CardTitle>
                <Activity className="h-6 w-6 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.visitas_ativas}</div>
                <p className="text-xs opacity-80 mt-1">Em andamento</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Visitas Finalizadas</CardTitle>
                <CheckCircle2 className="h-6 w-6 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.visitas_finalizadas_hoje}</div>
                <p className="text-xs opacity-80 mt-1">Finalizadas no período</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Mesas Ocupadas</CardTitle>
                <Building2 className="h-6 w-6 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.mesas_ocupadas}</div>
                <p className="text-xs opacity-80 mt-1">Atualmente ocupadas</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Lista de Espera</CardTitle>
                <Timer className="h-6 w-6 opacity-80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.clientes_lista_espera}</div>
                <p className="text-xs opacity-80 mt-1">Clientes aguardando</p>
              </CardContent>
            </Card>
          </div>

          {/* Atendimentos Ativos */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-emerald-600" />
                  <div>
                    <CardTitle className="text-xl">Atendimentos Ativos</CardTitle>
                    <CardDescription className="text-base">Lista de atendimentos em andamento</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Corretor</TableHead>
                      <TableHead className="font-semibold">Origem</TableHead>
                      <TableHead className="font-semibold">Local</TableHead>
                      <TableHead className="font-semibold">Entrada</TableHead>
                      <TableHead className="font-semibold">Tempo</TableHead>
                      <TableHead className="font-semibold text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActiveVisits.map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{visit.cliente_nome}</p>
                            <p className="text-sm text-gray-500">{visit.cliente_cpf}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {visit.corretor_nome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50">
                            {formatarOrigem(visit.origem_registro)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{visit.loja}</div>
                            <div className="text-gray-500">
                              {visit.andar} - Mesa {visit.mesa}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(visit.horario_entrada), "dd/MM", { locale: ptBR })}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(visit.horario_entrada), "HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {getTempoAtendimento(visit.horario_entrada)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copiarMensagemVisita(visit)}
                              className="hover:bg-blue-50"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copiar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => finalizarVisita(visit.id)}
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Finalizar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredActiveVisits.length === 0 && (
                  <div className="text-center py-12">
                    <UserX className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento ativo</h3>
                    <p className="text-gray-500">Não há atendimentos em andamento no momento</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Visitas Finalizadas */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
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
                  <Button onClick={exportToCSV} variant="outline" className="hover:bg-green-50 hover:border-green-200">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finishedVisits.slice(0, 50).map((visit) => (
                      <TableRow key={visit.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{visit.cliente_nome}</p>
                            <p className="text-sm text-gray-500">{visit.cliente_cpf}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {visit.corretor_nome}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">{visit.empreendimento || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{visit.loja}</div>
                            <div className="text-gray-500">
                              {visit.andar} - Mesa {visit.mesa}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(visit.horario_entrada), "dd/MM", { locale: ptBR })}
                            </div>
                            <div className="text-gray-500">
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
                              <div className="text-gray-500">
                                {format(new Date(visit.horario_saida), "HH:mm", { locale: ptBR })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {finishedVisits.length === 0 && (
                  <div className="text-center py-12">
                    <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma visita finalizada</h3>
                    <p className="text-gray-500">Não há visitas finalizadas no período selecionado</p>
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
