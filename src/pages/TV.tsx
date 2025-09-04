"use client";

import { useEffect, useState, useRef } from "react";
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
  const [lastVisitId, setLastVisitId] = useState<string | null>(null);
  const notifiedIds = useRef(new Set<string>());

  useEffect(() => {
    console.log("🔄 Configurando Realtime subscription para visitas...");
    
    // Subscribe to real-time changes in visits table
    const channel = supabase
      .channel("visits-realtime", {
        config: {
          broadcast: { self: false },
          presence: { key: "tv-page" }
        }
      })
      .on("postgres_changes", {
        event: "INSERT", 
        schema: "public",
        table: "visits"
      }, payload => {
        console.log("🚨 NOVA VISITA DETECTADA (Realtime):", payload);
        const visit = payload.new as Visit;
        
        if (!notifiedIds.current.has(visit.id)) {
          notifiedIds.current.add(visit.id);
          setNewVisit(visit);
          setLastVisitId(visit.id);
          
          setTimeout(() => {
            setNewVisit(null);
          }, 9000);
        }
      })
      .subscribe((status) => {
        console.log("📡 Status do canal Realtime:", status);
      });

    // Fallback polling mechanism
    const checkForNewVisits = async () => {
      try {
        const { data: latestVisit } = await supabase
          .from('visits')
          .select('id, corretor_nome, loja, andar, mesa, horario_entrada, cliente_nome')
          .order('horario_entrada', { ascending: false })
          .limit(1)
          .single();

        if (latestVisit && latestVisit.id !== lastVisitId && !notifiedIds.current.has(latestVisit.id)) {
          console.log("🔄 NOVA VISITA DETECTADA (Fallback Polling):", latestVisit);
          notifiedIds.current.add(latestVisit.id);
          setNewVisit(latestVisit);
          setLastVisitId(latestVisit.id);
          
          setTimeout(() => {
            setNewVisit(null);
          }, 9000);
        }
      } catch (error) {
        console.error("❌ Erro no fallback polling:", error);
      }
    };

    // Poll every 10 seconds as fallback
    const pollInterval = setInterval(checkForNewVisits, 10000);
    
    // Get initial latest visit
    checkForNewVisits();
    
    return () => {
      console.log("🧹 Limpando subscriptions...");
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [lastVisitId]);
  return <div className="min-h-screen bg-gray-100">
      {/* Header Promocional Metrocasa */}
      <div className="bg-[#AD1010] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#AD1010] via-red-600 to-[#AD1010] opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 px-8 py-[12px]">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <img src="https://www.metrocasa.com.br/_next/image?url=%2Ftheme%2Fvc-perto-branco.png&w=384&q=75" alt="Metrocasa" className="h-12" />
              <div className="h-8 w-px bg-white/30"></div>
              
            </div>
            <div className="flex items-center gap-4">
              
              <div className="text-right">
                <div className="text-sm opacity-80">Atualizado em tempo real</div>
                <div className="text-xs opacity-60">{new Date().toLocaleTimeString("pt-BR")}</div>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          
        </div>
      </div>

      <div className="px-8 py-2 -mt-8 relative z-20">
        {/* Seção Principal de Conteúdo */}
        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Vídeo Institucional */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
             
              <CardContent className="p-6">
                <YouTubeEmbed />
                
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
          
        </Card>

      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        
      </footer>

      {/* Notification Popup */}
      {newVisit && <NotificationPopup visit={newVisit} onClose={() => setNewVisit(null)} />}
    </div>;
}