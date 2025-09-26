import React from 'react';
import { Users, Clock, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="py-16 px-6 bg-gradient-to-b from-background to-metrocasa-gray-light">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-metrocasa-gray mb-6">
          Questionário de Persona Metrocasa
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Ajude-nos a conhecer melhor nossos corretores para oferecermos 
          experiências personalizadas e oportunidades alinhadas ao seu perfil.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border">
            <div className="w-16 h-16 bg-metrocasa-red/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-metrocasa-red" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Personalizado</h3>
            <p className="text-muted-foreground text-center">
              Experiência adaptada ao seu perfil profissional
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border">
            <div className="w-16 h-16 bg-metrocasa-red/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-metrocasa-red" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Rápido</h3>
            <p className="text-muted-foreground text-center">
              Apenas alguns minutos para completar
            </p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border">
            <div className="w-16 h-16 bg-metrocasa-red/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-metrocasa-red" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Confidencial</h3>
            <p className="text-muted-foreground text-center">
              Suas informações são totalmente seguras
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}