import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Users, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VisitCard } from "@/components/VisitCard";

interface Visit {
  id: string;
  cliente_nome: string;
  corretor_nome: string;
  empreendimento: string;
  loja: string;
  mesa: number;
  horario_entrada: string;
  status: string;
}

export default function Index() {
  const [activeVisits, setActiveVisits] = useState<Visit[]>([]);
  const [finishedVisits, setFinishedVisits] = useState<Visit[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalBrokers, setTotalBrokers] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    fetchActiveVisits();
    fetchFinishedVisits();
    fetchTotalVisits();
    fetchTotalBrokers();
    fetchTotalCustomers();
  }, []);

  const fetchActiveVisits = async () => {
    const { data, error } = await supabase
      .from("visitas")
      .select("*")
      .eq("status", "ativo");

    if (error) {
      console.error("Erro ao buscar visitas ativas:", error);
    } else {
      setActiveVisits(data || []);
    }
  };

  const fetchFinishedVisits = async () => {
    const { data, error } = await supabase
      .from("visitas")
      .select("*")
      .eq("status", "finalizado");

    if (error) {
      console.error("Erro ao buscar visitas finalizadas:", error);
    } else {
      setFinishedVisits(data || []);
    }
  };

  const fetchTotalVisits = async () => {
    const { count, error } = await supabase
      .from("visitas")
      .select("*", { count: "exact" });

    if (error) {
      console.error("Erro ao buscar total de visitas:", error);
    } else {
      setTotalVisits(count || 0);
    }
  };

  const fetchTotalBrokers = async () => {
    const { count, error } = await supabase
      .from("corretores")
      .select("*", { count: "exact" });

    if (error) {
      console.error("Erro ao buscar total de corretores:", error);
    } else {
      setTotalBrokers(count || 0);
    }
  };

  const fetchTotalCustomers = async () => {
    const { count, error } = await supabase
      .from("clientes")
      .select("*", { count: "exact" });

    if (error) {
      console.error("Erro ao buscar total de clientes:", error);
    } else {
      setTotalCustomers(count || 0);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Visão geral do sistema de recepção</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Visitas</p>
                <p className="text-2xl font-bold text-slate-900">{totalVisits}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Visitas Ativas</p>
                <p className="text-2xl font-bold text-slate-900">{activeVisits.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-orange-100 p-3">
                <User className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Corretores</p>
                <p className="text-2xl font-bold text-slate-900">{totalBrokers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Visitas Ativas</h2>
              <div className="space-y-4">
                {activeVisits.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-all duration-300">
            <CardContent>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Visitas Finalizadas</h2>
              <div className="space-y-4">
                {finishedVisits.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
