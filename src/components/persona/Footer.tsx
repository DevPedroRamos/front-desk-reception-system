import React from 'react';
export function Footer() {
  return (
    <footer className="bg-metrocasa-gray py-12 px-6 mt-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <img src="/lovable-uploads/vc-perto-branco.png" alt="VC Perto" className="h-8 mx-auto mb-4" />
        </div>
        <div className="text-white/80 text-sm">
          <p className="mb-2">© 2024 VC Perto. Todos os direitos reservados.</p>
          <p>Rua das Flores, 123 - Centro - São Paulo/SP</p>
        </div>
      </div>
    </footer>
  );
}