"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Download,
  Gift,
  Film,
  Flame,
  Wine,
  Package,
  Loader2,
  Filter,
} from "lucide-react"
import { Layout } from "@/components/Layout"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Brinde {
  id: string
  cliente_nome: string
  cliente_cpf: string
  corretor_nome: string
  tipo_brinde: string
  validado: boolean
  data_validacao: string | null
  created_at: string
}

const Brindes = () => {
  const { toast } = useToast()

  const [filtroDataInicio, setFiltroDataInicio] = useState("")
  const [filtroDataFim, setFiltroDataFim] = useState("")
  const [filtroTipoBrinde, setFiltroTipoBrinde] = useState("all")

  // Buscar brindes validados
  const { data: brindes = [], isLoading } = useQuery({
    queryKey: ["brindes", filtroDataInicio, filtroDataFim, filtroTipoBrinde],
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
      if (filtroTipoBrinde !== "all") {
        query = query.eq("tipo_brinde", filtroTipoBrinde)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Brinde[]
    },
  })

  const exportarCSV = () => {
    if (brindes.length === 0) {
      toast({
        title: "Nenhum dado",
        description: "Não há brindes para exportar.",
        variant: "destructive",
      })
      return
    }

    const csvContent = [
      ["Cliente", "CPF", "Corretor", "Tipo Brinde", "Data Validação"],
      ...brindes.map((brinde) => [
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
    link.download = `brindes_${format(new Date(), "dd-MM-yyyy")}.csv`
    link.click()

    toast({
      title: "Exportado com sucesso!",
      description: "Os dados foram exportados para CSV.",
    })
  }

  const getBrindeIcon = (tipo: string) => {
    switch (tipo) {
      case "Cinemark":
        return <Film className="w-5 h-5 text-purple-600" />
      case "Churrasqueira":
        return <Flame className="w-5 h-5 text-orange-600" />
      case "Vinho":
        return <Wine className="w-5 h-5 text-red-600" />
      default:
        return <Gift className="w-5 h-5 text-gray-600" />
    }
  }

  const getBrindeColor = (tipo: string) => {
    switch (tipo) {
      case "Cinemark":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Churrasqueira":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Vinho":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Calcular estatísticas
  const totalBrindes = brindes.length
  const brindesCinemark = brindes.filter((b) => b.tipo_brinde === "Cinemark").length
  const brindesChurrasqueira = brindes.filter((b) => b.tipo_brinde === "Churrasqueira").length
  const brindesVinho = brindes.filter((b) => b.tipo_brinde === "Vinho").length

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
                <h1 className="text-4xl font-bold text-gray-900">Dashboard de Brindes</h1>
                <p className="text-gray-600 text-lg">Acompanhe os brindes retirados pelos clientes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Total de Brindes</CardTitle>
                    <div className="text-3xl font-bold mt-1">{totalBrindes}</div>
                  </div>
                  <Package className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Cinemark</CardTitle>
                    <div className="text-3xl font-bold mt-1">{brindesCinemark}</div>
                  </div>
                  <Film className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Churrasqueira</CardTitle>
                    <div className="text-3xl font-bold mt-1">{brindesChurrasqueira}</div>
                  </div>
                  <Flame className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium opacity-90">Vinho</CardTitle>
                    <div className="text-3xl font-bold mt-1">{brindesVinho}</div>
                  </div>
                  <Wine className="w-8 h-8 opacity-80" />
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Filtros</CardTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="tipo_brinde" className="text-sm font-medium flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Tipo de Brinde
                  </Label>
                  <Select value={filtroTipoBrinde} onValueChange={setFiltroTipoBrinde}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Cinemark">Cinemark</SelectItem>
                      <SelectItem value="Churrasqueira">Churrasqueira</SelectItem>
                      <SelectItem value="Vinho">Vinho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={exportarCSV}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                    disabled={brindes.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV ({brindes.length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Brindes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-xl">Brindes Retirados</CardTitle>
                    <p className="text-gray-600 mt-1">Histórico completo de brindes entregues</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {brindes.length} brinde{brindes.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando brindes</h3>
                  <p className="text-gray-500">Aguarde enquanto buscamos os dados...</p>
                </div>
              ) : brindes.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum brinde encontrado</h3>
                  <p className="text-gray-500">Não há brindes retirados no período selecionado.</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">CPF</TableHead>
                        <TableHead className="font-semibold">Corretor</TableHead>
                        <TableHead className="font-semibold">Tipo de Brinde</TableHead>
                        <TableHead className="font-semibold">Data Retirada</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {brindes.map((brinde) => (
                        <TableRow key={brinde.id} className="hover:bg-gray-50/50">
                          <TableCell>
                            <p className="font-medium text-gray-900">{brinde.cliente_nome}</p>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-900">{brinde.cliente_cpf}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {brinde.corretor_nome}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`border ${getBrindeColor(brinde.tipo_brinde)}`}>
                              <span className="flex items-center gap-2">
                                {getBrindeIcon(brinde.tipo_brinde)}
                                {brinde.tipo_brinde}
                              </span>
                            </Badge>
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
