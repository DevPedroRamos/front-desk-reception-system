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
      }, 3000);
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
              <img src="/metrocasa-logo-white.png" alt="Metrocasa" className="h-12" />
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

      {/* Cards de Métricas em Tempo Real */}
      <div className="px-8 py-6 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">127</div>
                  <div className="text-sm opacity-90">Visitas Hoje</div>
                </div>
                <Users className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">23</div>
                  <div className="text-sm opacity-90">Ativos Agora</div>
                </div>
                <TrendingUp className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">89%</div>
                  <div className="text-sm opacity-90">Taxa Conversão</div>
                </div>
                <Target className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">15</div>
                  <div className="text-sm opacity-90">Mesas Ocupadas</div>
                </div>
                <Award className="w-10 h-10 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção Principal de Conteúdo */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Vídeo Institucional */}
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
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-8 h-8" />
                    PROMOÇÕES & NOVIDADES
                  </h2>
                  <p className="text-lg opacity-90">Ofertas exclusivas e lançamentos imperdíveis</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">50%</div>
                <div className="text-sm opacity-80">DE DESCONTO</div>
              </div>
            </div>
            <div className="mt-6">
              <PromoBanner />
            </div>
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <div className="mt-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
          <p className="text-gray-600 mb-12 text-lg">Entenda o processo de monitoramento em tempo real</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#AD1010]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-8 h-8 text-[#AD1010]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Monitore</h3>
                <p className="text-gray-600">
                  Acompanhe todas as visitas e atendimentos em tempo real através do nosso sistema
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#AD1010]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-[#AD1010]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Analise</h3>
                <p className="text-gray-600">
                  Nossos consultores analisam os dados e identificam oportunidades de melhoria
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#AD1010]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-8 h-8 text-[#AD1010]" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Conquiste</h3>
                <p className="text-gray-600">Alcance resultados extraordinários com base nos insights obtidos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img src="/metrocasa-logo-white.png" alt="Metrocasa" className="h-12 mb-4" />
              <p className="text-gray-400">Construindo sonhos, criando histórias.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Entre em Contato</li>
                <li>Carreiras</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Suporte Via Chat</li>
                <li>Central de Atendimento</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Siga-nos</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-[#AD1010] rounded-full flex items-center justify-center">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-10 h-10 bg-[#AD1010] rounded-full flex items-center justify-center">
                  <span className="text-sm">@</span>
                </div>
                <div className="w-10 h-10 bg-[#AD1010] rounded-full flex items-center justify-center">
                  <span className="text-sm">in</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>Copyright © 2025 Construtora Metrocasa - Todos os Direitos Reservados</p>
          </div>
        </div>
      </footer>

      {/* Notification Popup */}
      {newVisit && <NotificationPopup visit={newVisit} onClose={() => setNewVisit(null)} />}
    </div>;
}