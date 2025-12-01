import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export interface Entrega {
  id: string;
  remetente: string;
  destinatario: string;
  usuario_registro_id: string;
  usuario_registro_nome: string;
  loja: string;
  andar: string | null;
  status: string;
  data_hora_registro: string;
  quem_retirou: string | null;
  quem_retirou_cpf: string | null;
  data_hora_retirada: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEntregaData {
  remetente: string;
  destinatario: string;
  usuario_registro_id: string;
  usuario_registro_nome: string;
  loja: string;
  andar?: string;
}

export interface RetirarEntregaData {
  entrega_id: string;
  quem_retirou: string;
  quem_retirou_cpf: string;
  user_id: string;
}

export interface EntregaFilters {
  startDate: string;
  endDate: string;
  status: string;
  andar: string;
  searchTerm: string;
}

export function useEntregas(filters: EntregaFilters) {
  const queryClient = useQueryClient();

  const { data: entregas = [], isLoading } = useQuery({
    queryKey: ["entregas", filters],
    queryFn: async () => {
      let query = supabase
        .from("entregas")
        .select("*")
        .order("data_hora_registro", { ascending: false });

      if (filters.startDate) {
        query = query.gte("data_hora_registro", filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte("data_hora_registro", filters.endDate);
      }

      if (filters.status && filters.status !== "todos") {
        query = query.eq("status", filters.status);
      }

      if (filters.andar) {
        query = query.eq("andar", filters.andar);
      }

      if (filters.searchTerm) {
        query = query.or(
          `remetente.ilike.%${filters.searchTerm}%,destinatario.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar entregas:", error);
        throw error;
      }

      return data as Entrega[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["entregas-stats"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      const [totalHoje, aguardando, finalizadas] = await Promise.all([
        supabase
          .from("entregas")
          .select("id", { count: "exact", head: true })
          .gte("data_hora_registro", `${today}T00:00:00`)
          .lte("data_hora_registro", `${today}T23:59:59`),
        supabase
          .from("entregas")
          .select("id", { count: "exact", head: true })
          .eq("status", "aguardando_retirada"),
        supabase
          .from("entregas")
          .select("id", { count: "exact", head: true })
          .eq("status", "finalizado")
          .gte("data_hora_registro", `${today}T00:00:00`)
          .lte("data_hora_registro", `${today}T23:59:59`),
      ]);

      return {
        totalHoje: totalHoje.count || 0,
        aguardando: aguardando.count || 0,
        finalizadas: finalizadas.count || 0,
      };
    },
  });

  const createEntrega = useMutation({
    mutationFn: async (data: CreateEntregaData) => {
      const { data: entrega, error } = await supabase
        .from("entregas")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return entrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      queryClient.invalidateQueries({ queryKey: ["entregas-stats"] });
      toast.success("Entrega registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar entrega:", error);
      toast.error("Erro ao registrar entrega");
    },
  });

  const retirarEntrega = useMutation({
    mutationFn: async (data: RetirarEntregaData) => {
      const { data: entrega, error } = await supabase
        .from("entregas")
        .update({
          status: "finalizado",
          quem_retirou: data.quem_retirou,
          quem_retirou_cpf: data.quem_retirou_cpf,
          data_hora_retirada: new Date().toISOString(),
        })
        .eq("id", data.entrega_id)
        .select()
        .single();

      if (error) throw error;
      return entrega;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      queryClient.invalidateQueries({ queryKey: ["entregas-stats"] });
      toast.success("Entrega retirada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao retirar entrega:", error);
      toast.error("Erro ao registrar retirada");
    },
  });

  const exportToCSV = () => {
    if (entregas.length === 0) {
      toast.error("Não há entregas para exportar");
      return;
    }

    const headers = [
      "Data/Hora Registro",
      "Remetente",
      "Destinatário",
      "Loja",
      "Andar",
      "Registrado Por",
      "Status",
      "Quem Retirou",
      "CPF",
      "Data/Hora Retirada",
    ];

    const rows = entregas.map((entrega) => [
      format(new Date(entrega.data_hora_registro), "dd/MM/yyyy HH:mm"),
      entrega.remetente,
      entrega.destinatario,
      entrega.loja,
      entrega.andar || "-",
      entrega.usuario_registro_nome,
      entrega.status === "aguardando_retirada" ? "Aguardando" : "Finalizado",
      entrega.quem_retirou || "-",
      entrega.quem_retirou_cpf || "-",
      entrega.data_hora_retirada
        ? format(new Date(entrega.data_hora_retirada), "dd/MM/yyyy HH:mm")
        : "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `entregas-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório exportado com sucesso!");
  };

  return {
    entregas,
    isLoading,
    stats,
    createEntrega,
    retirarEntrega,
    exportToCSV,
  };
}