import React from 'react';
import { Users, Clock, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-metrocasa-red to-metrocasa-red-dark text-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Descubra Seu Perfil de Investidor
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
          Responda nosso questionário e receba recomendações personalizadas de imóveis que combinam perfeitamente com o seu perfil.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="flex flex-col items-center">
            <Users className="h-12 w-12 mb-4 text-white/90" />
            <h3 className="text-lg font-semibold mb-2">Personalizado</h3>
            <p className="text-white/80">Análise baseada no seu perfil único</p>
          </div>
          <div className="flex flex-col items-center">
            <Clock className="h-12 w-12 mb-4 text-white/90" />
            <h3 className="text-lg font-semibold mb-2">Rápido</h3>
            <p className="text-white/80">Apenas 3 minutos para completar</p>
          </div>
          <div className="flex flex-col items-center">
            <Shield className="h-12 w-12 mb-4 text-white/90" />
            <h3 className="text-lg font-semibold mb-2">Seguro</h3>
            <p className="text-white/80">Seus dados são 100% protegidos</p>
          </div>
        </div>
      </div>
    </div>
  );
}