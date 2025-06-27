"use client"

import { useState, useEffect } from "react"
import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import {
  Trophy,
  Medal,
  Award,
  X,
  Crown,
  Star,
  TrendingUp,
  Users,
  Target,
  Zap,
  Calendar,
  Filter,
  Sparkles,
} from "lucide-react"

interface CorretorRanking {
  corretor_id: string
  corretor_nome: string
  total_visitas: number
  posicao: number
}

interface GerenteRanking {
  gerente: string
  total_visitas: number
  posicao: number
}

interface SuperintendenciaRanking {
  superintendente: string
  total_visitas: number
  posicao: number
}

export default function Podio() {
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [topCorretores, setTopCorretores] = useState<CorretorRanking[]>([])
  const [topGerentes, setTopGerentes] = useState<GerenteRanking[]>([])
  const [topSuperintendencias, setTopSuperintendencias] = useState<SuperintendenciaRanking[]>([])

  const loadRankings = async () => {
    try {
      setLoading(true)

      // Buscar top corretores
      let corretoresQuery = supabase.from("visits").select(`
          corretor_id,
          corretor_nome,
          users!visits_corretor_id_fkey(name)
        `)

      if (startDate) {
        corretoresQuery = corretoresQuery.gte("horario_entrada", startDate)
      }
      if (endDate) {
        corretoresQuery = corretoresQuery.lte("horario_entrada", endDate + "T23:59:59")
      }

      const { data: corretoresData, error: corretoresError } = await corretoresQuery

      if (corretoresError) throw corretoresError

      // Agrupar por corretor e contar visitas
      const corretoresMap = new Map<string, { nome: string; count: number }>()

      corretoresData?.forEach((visit) => {
        const key = visit.corretor_id
        const nome = visit.corretor_nome

        if (corretoresMap.has(key)) {
          corretoresMap.get(key)!.count++
        } else {
          corretoresMap.set(key, { nome, count: 1 })
        }
      })

      const corretoresRanking = Array.from(corretoresMap.entries())
        .map(([id, data], index) => ({
          corretor_id: id,
          corretor_nome: data.nome,
          total_visitas: data.count,
          posicao: index + 1,
        }))
        .sort((a, b) => b.total_visitas - a.total_visitas)
        .slice(0, 10)
        .map((item, index) => ({ ...item, posicao: index + 1 }))

      setTopCorretores(corretoresRanking)

      // Buscar top gerentes
      let gerentesQuery = supabase.from("visits").select(`
          corretor_id,
          users!visits_corretor_id_fkey(gerente)
        `)

      if (startDate) {
        gerentesQuery = gerentesQuery.gte("horario_entrada", startDate)
      }
      if (endDate) {
        gerentesQuery = gerentesQuery.lte("horario_entrada", endDate + "T23:59:59")
      }

      const { data: gerentesData, error: gerentesError } = await gerentesQuery

      if (gerentesError) throw gerentesError

      // Agrupar por gerente
      const gerentesMap = new Map<string, number>()

      gerentesData?.forEach((visit) => {
        const gerente = (visit.users as any)?.gerente
        if (gerente) {
          gerentesMap.set(gerente, (gerentesMap.get(gerente) || 0) + 1)
        }
      })

      const gerentesRanking = Array.from(gerentesMap.entries())
        .map(([gerente, count]) => ({
          gerente,
          total_visitas: count,
          posicao: 0,
        }))
        .sort((a, b) => b.total_visitas - a.total_visitas)
        .slice(0, 3)
        .map((item, index) => ({ ...item, posicao: index + 1 }))

      setTopGerentes(gerentesRanking)

      // Buscar top superintendências
      let superintendenciasQuery = supabase.from("visits").select(`
          corretor_id,
          users!visits_corretor_id_fkey(superintendente)
        `)

      if (startDate) {
        superintendenciasQuery = superintendenciasQuery.gte("horario_entrada", startDate)
      }
      if (endDate) {
        superintendenciasQuery = superintendenciasQuery.lte("horario_entrada", endDate + "T23:59:59")
      }

      const { data: superintendenciasData, error: superintendenciasError } = await superintendenciasQuery

      if (superintendenciasError) throw superintendenciasError

      // Agrupar por superintendência
      const superintendenciasMap = new Map<string, number>()

      superintendenciasData?.forEach((visit) => {
        const superintendente = (visit.users as any)?.superintendente
        if (superintendente) {
          superintendenciasMap.set(superintendente, (superintendenciasMap.get(superintendente) || 0) + 1)
        }
      })

      const superintendenciasRanking = Array.from(superintendenciasMap.entries())
        .map(([superintendente, count]) => ({
          superintendente,
          total_visitas: count,
          posicao: 0,
        }))
        .sort((a, b) => b.total_visitas - a.total_visitas)
        .slice(0, 3)
        .map((item, index) => ({ ...item, posicao: index + 1 }))

      setTopSuperintendencias(superintendenciasRanking)
    } catch (error) {
      console.error("Error loading rankings:", error)
      toast.error("Erro ao carregar rankings")
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setStartDate("")
    setEndDate("")
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-full text-sm font-bold text-slate-700 shadow-sm">
            {position}
          </div>
        )
    }
  }

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return {
          card: "bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50 border-2 border-yellow-300 shadow-lg shadow-yellow-200/50",
          badge: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white",
          glow: "shadow-2xl shadow-yellow-300/30",
        }
      case 2:
        return {
          card: "bg-gradient-to-br from-gray-50 via-slate-100 to-gray-50 border-2 border-gray-300 shadow-lg shadow-gray-200/50",
          badge: "bg-gradient-to-r from-gray-500 to-slate-500 text-white",
          glow: "shadow-xl shadow-gray-300/30",
        }
      case 3:
        return {
          card: "bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 shadow-lg shadow-amber-200/50",
          badge: "bg-gradient-to-r from-amber-600 to-orange-500 text-white",
          glow: "shadow-xl shadow-amber-300/30",
        }
      default:
        return {
          card: "bg-white border border-slate-200 hover:shadow-md transition-shadow",
          badge: "bg-slate-100 text-slate-700",
          glow: "",
        }
    }
  }

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1:
        return "h-32"
      case 2:
        return "h-24"
      case 3:
        return "h-20"
      default:
        return "h-16"
    }
  }

  useEffect(() => {
    loadRankings()
  }, [startDate, endDate])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Carregando Rankings</h3>
                <p className="text-gray-600">Calculando as melhores performances...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Pódio de Vendas</h1>
                <p className="text-gray-600 text-lg">Rankings dos melhores performers da equipe</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Filtros */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Filtros de Período</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Inicial
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data Final
                  </label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11" />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full h-11 hover:bg-red-50 hover:border-red-200 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pódio dos Top 3 Corretores */}
          {topCorretores.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <div>
                    <CardTitle className="text-2xl">🏆 Pódio dos Campeões</CardTitle>
                    <CardDescription className="text-yellow-100">Top 3 corretores com mais visitas</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex justify-center items-end gap-8 mb-8">
                  {topCorretores.slice(0, 3).map((corretor, index) => {
                    const position = index + 1
                    const style = getPositionStyle(position)
                    return (
                      <div key={corretor.corretor_id} className="text-center">
                        <div
                          className={`${getPodiumHeight(position)} w-32 ${style.card} ${
                            style.glow
                          } rounded-t-lg flex flex-col justify-end p-4 relative overflow-hidden`}
                        >
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                            {getPositionIcon(position)}
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{corretor.total_visitas}</div>
                            <div className="text-xs text-gray-600">visitas</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Badge className={`${style.badge} px-3 py-1 text-sm font-medium`}>#{position}</Badge>
                          <p className="font-semibold text-gray-900 mt-2 text-sm">{corretor.corretor_nome}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rankings Detalhados */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Top 10 Corretores */}
            <div className="xl:col-span-2">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl">Top 10 Corretores</CardTitle>
                        <CardDescription>Ranking completo por número de visitas</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {topCorretores.length} corretor{topCorretores.length !== 1 ? "es" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topCorretores.map((corretor) => {
                      const style = getPositionStyle(corretor.posicao)
                      return (
                        <div
                          key={corretor.corretor_id}
                          className={`flex items-center justify-between p-4 rounded-xl ${style.card} transition-all hover:scale-[1.02]`}
                        >
                          <div className="flex items-center gap-4">
                            {getPositionIcon(corretor.posicao)}
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{corretor.corretor_nome}</p>
                              <Badge className={`${style.badge} text-xs`}>#{corretor.posicao} lugar</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-3xl font-bold text-gray-900">{corretor.total_visitas}</span>
                            </div>
                            <p className="text-sm text-gray-600">visitas realizadas</p>
                          </div>
                        </div>
                      )
                    })}
                    {topCorretores.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
                        <p className="text-gray-500">Não há dados para o período selecionado</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {/* Top 3 Gerentes */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-purple-600" />
                      <div>
                        <CardTitle className="text-xl">Top 3 Gerentes</CardTitle>
                        <CardDescription>Liderança em performance</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {topGerentes.length} gerente{topGerentes.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topGerentes.map((gerente) => {
                      const style = getPositionStyle(gerente.posicao)
                      return (
                        <div
                          key={gerente.gerente}
                          className={`flex items-center justify-between p-4 rounded-xl ${style.card} transition-all hover:scale-[1.02]`}
                        >
                          <div className="flex items-center gap-3">
                            {getPositionIcon(gerente.posicao)}
                            <div>
                              <p className="font-semibold text-gray-900">{gerente.gerente}</p>
                              <Badge className={`${style.badge} text-xs`}>#{gerente.posicao} lugar</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-blue-600" />
                              <span className="text-2xl font-bold text-gray-900">{gerente.total_visitas}</span>
                            </div>
                            <p className="text-xs text-gray-600">visitas</p>
                          </div>
                        </div>
                      )
                    })}
                    {topGerentes.length === 0 && (
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">Nenhum dado</h3>
                        <p className="text-sm text-gray-500">Sem dados para o período</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Superintendências */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6 text-emerald-600" />
                      <div>
                        <CardTitle className="text-xl">Top 3 Superintendências</CardTitle>
                        <CardDescription>Excelência regional</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {topSuperintendencias.length} região{topSuperintendencias.length !== 1 ? "ões" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSuperintendencias.map((superintendencia) => {
                      const style = getPositionStyle(superintendencia.posicao)
                      return (
                        <div
                          key={superintendencia.superintendente}
                          className={`flex items-center justify-between p-4 rounded-xl ${style.card} transition-all hover:scale-[1.02]`}
                        >
                          <div className="flex items-center gap-3">
                            {getPositionIcon(superintendencia.posicao)}
                            <div>
                              <p className="font-semibold text-gray-900">{superintendencia.superintendente}</p>
                              <Badge className={`${style.badge} text-xs`}>#{superintendencia.posicao} lugar</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                              <span className="text-2xl font-bold text-gray-900">{superintendencia.total_visitas}</span>
                            </div>
                            <p className="text-xs text-gray-600">visitas</p>
                          </div>
                        </div>
                      )
                    })}
                    {topSuperintendencias.length === 0 && (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-900 mb-1">Nenhum dado</h3>
                        <p className="text-sm text-gray-500">Sem dados para o período</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
