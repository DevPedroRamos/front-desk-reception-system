import React from 'react';

export function Footer() {
  return (
    <footer className="bg-metrocasa-gray text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <img 
              src="/lovable-uploads/c1c1d076-9abb-4f71-b95c-abfbb74f4d43.png" 
              alt="Metrocasa" 
              className="h-8 mb-4" 
            />
            <p className="text-gray-300 text-sm">
              Sua imobiliária de confiança há mais de 20 anos no mercado.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>(11) 3456-7890</p>
              <p>contato@metrocasa.com.br</p>
              <p>Seg - Sex: 8h às 18h</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Endereço</h4>
            <p className="text-sm text-gray-300">
              Av. Paulista, 1000<br />
              São Paulo - SP<br />
              CEP: 01310-100
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2024 Metrocasa. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}