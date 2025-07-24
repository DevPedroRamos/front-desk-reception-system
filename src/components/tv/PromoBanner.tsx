import { Card } from '@/components/ui/card';
import { Sparkles, Home, Calendar } from 'lucide-react';
export function PromoBanner() {
  return <div className="">
      {/* Main Promotion */}
      <Card className="md:col-span-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 bg-white">
        <div className="flex items-center space-x-4 mb-6">
          <Sparkles className="h-12 w-12" />
          <div>
            <h3 className="text-3xl font-bold">Promoção Especial</h3>
            <p className="text-xl opacity-90">Condições exclusivas para você!</p>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-lg">
            🏠 <strong>0% de entrada</strong> em apartamentos selecionados
          </p>
          <p className="text-lg">
            💰 <strong>Desconto de até 15%</strong> à vista
          </p>
          <p className="text-lg">
            📅 <strong>Financiamento em até 420 meses</strong>
          </p>
        </div>
      </Card>

      {/* Side Promotions */}
      
    </div>;
}