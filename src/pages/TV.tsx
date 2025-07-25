"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VisitasTable } from "@/components/tv/VisitasTable";
import { NotificationPopup } from "@/components/tv/NotificationPopup";
import { YouTubeEmbed } from "@/components/tv/YouTubeEmbed";
import { PromoBanner } from "@/components/tv/PromoBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, TrendingUp, Star, Gift, Zap, Target, Award, Play, Eye, Clock, Sparkles } from "lucide-react";
interface Visit {
  id: string;
  corretor_nome: string;
  loja: string;
  andar: string;
  mesa: number;
  horario_entrada: string;
  cliente_nome: string;
}
export default function TV() {
  const [newVisit, setNewVisit] = useState<Visit | null>(null);
  useEffect(() => {
    // Subscribe to real-time changes in visits table
    const channel = supabase.channel("visits-realtime").on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "visits"
    }, payload => {
      console.log("Nova visita detectada:", payload);
      const visit = payload.new as Visit;
      setNewVisit(visit);

      // Auto-close popup after 3 seconds
      setTimeout(() => {
        setNewVisit(null);
      }, 9000);
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return <div className="min-h-screen bg-gray-100">
      {/* Header Promocional Metrocasa */}
      <div className="bg-[#AD1010] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#AD1010] via-red-600 to-[#AD1010] opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 px-8 py-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <img src="https://www.metrocasa.com.br/_next/image?url=%2Ftheme%2Fvc-perto-branco.png&w=384&q=75" alt="Metrocasa" className="h-12" />
              <div className="h-8 w-px bg-white/30"></div>
              <span className="text-xl font-medium">Central de Monitoramento</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                <Eye className="w-4 h-4 mr-2" />
                AO VIVO
              </Badge>
              <div className="text-right">
                <div className="text-sm opacity-80">Atualizado em tempo real</div>
                <div className="text-xs opacity-60">{new Date().toLocaleTimeString("pt-BR")}</div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          
        </div>
      </div>

      <div className="px-8 py-6 -mt-8 relative z-20">
        {/* Seção Principal de Conteúdo */}
        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Vídeo Institucional */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="bg-[#AD1010] text-white p-4 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Vídeo Institucional</h2>
                </div>
                <p className="text-sm opacity-90 mt-1">Conheça nossa história de sucesso</p>
              </div>
              <CardContent className="p-6">
                <YouTubeEmbed />
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>1.2M visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.9/5 avaliação</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Visitas */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <div className="bg-[#AD1010] text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6" />
                    <h2 className="text-xl font-semibold">Últimas Visitas</h2>
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Tempo Real
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mt-1">Acompanhe os atendimentos em andamento</p>
              </div>
              <CardContent className="p-6">
                <VisitasTable />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Banner Promocional */}
        <Card className="shadow-xl border-0 bg-gradient-to-r from-[#AD1010] via-red-600 to-[#AD1010] text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <CardContent className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    Desconto promocional para unidades <b>ESTAÇÃO ORATÓRIO</b>
                  </h2>
                  <p className="text-lg opacity-90">Mega Feirão Valido somente este fim de semana</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <PromoBanner />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        
      </footer>

      {/* Notification Popup */}
      {newVisit && <NotificationPopup visit={newVisit} onClose={() => setNewVisit(null)} />}
    </div>;
}