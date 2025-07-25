"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCheck, Sparkles, Trophy, MapPin, Clock, User, Zap, Star, CheckCircle2, TrendingUp } from "lucide-react"

interface Visit {
  id: string
  corretor_nome: string
  loja: string
  andar: string
  mesa: number
  horario_entrada: string
  cliente_nome: string
}

interface NotificationPopupProps {
  visit: Visit
  onClose: () => void
}

export function NotificationPopup({ visit, onClose }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger animation
    setIsVisible(true)

    // Show confetti effect
    setTimeout(() => setShowConfetti(true), 200)

    // Auto close after 6 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 500) // Wait for animation to complete
    }, 6000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      <Card className="relative max-w-5xl w-full mx-8 border-0 shadow-2xl overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#dc2626] via-red-600 to-[#dc2626]"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-12 text-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Trophy className="h-12 w-12 text-yellow-400" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-pulse">🎉 NOVA VISITA! 🎉</h1>

            <div className="flex justify-center gap-4 mb-6">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                REGISTRADA COM SUCESSO
              </Badge>
             
            </div>
          </div>

          {/* Visit Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Corretor */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-6 h-6 text-yellow-400" />
                  <span className="text-lg font-semibold opacity-90">Corretor Responsável</span>
                </div>
                <div className="text-3xl font-bold">{visit.corretor_nome}</div>
              </div>

              {/* Cliente */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <UserCheck className="w-6 h-6 text-green-400" />
                  <span className="text-lg font-semibold opacity-90">Cliente</span>
                </div>
                <div className="text-3xl font-bold text-green-200">{visit.cliente_nome}</div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Local */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-semibold opacity-90">Ambiente</span>
                </div>
                <div className="text-2xl font-bold mb-2">{visit.loja}</div>
                <div className="text-xl opacity-90">
                  {visit.andar} - Mesa {visit.mesa}
                </div>
              </div>

              {/* Horário */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <span className="text-lg font-semibold opacity-90">Horário de Entrada</span>
                </div>
                <div className="text-3xl font-bold text-purple-200">
                  {format(new Date(visit.horario_entrada), "HH:mm", { locale: ptBR })}
                </div>
                <div className="text-sm opacity-80 mt-2">
                  {format(new Date(visit.horario_entrada), "dd 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 text-center">
            <div className="text-sm opacity-70 mb-2">Esta notificação será fechada automaticamente</div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-6000 ease-linear"
                style={{
                  animation: "progress 6s linear forwards",
                  width: "0%",
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
