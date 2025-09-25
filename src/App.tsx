import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '@/pages/auth';
import Cliente from '@/pages/cliente';
import Index from '@/pages/Index';
import ListaEspera from '@/pages/ListaEspera';
import Podio from '@/pages/Podio';
import Recepcao from '@/pages/recepcao';
import Brindes from '@/pages/Brindes';
import PesquisaSatisfacao from '@/pages/PesquisaSatisfacao';
import PesquisaRelatorio from '@/pages/PesquisaRelatorio';
import Integracao from '@/pages/Integracao';
import TV from '@/pages/TV';
import Persona from '@/pages/Persona';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import Corretor from '@/pages/corretor';
import PerfilCorretor from '@/pages/corretor/perfil';
import VisitasCorretor from '@/pages/corretor/visitas';

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/cliente" element={<Cliente />} />
      <Route path="/recepcao" element={<Recepcao />} />
      <Route path="/lista-espera" element={<ListaEspera />} />
      <Route path="/podio" element={<Podio />} />
      <Route path="/brindes" element={<Brindes />} />
      <Route path="/pesquisa" element={<PesquisaRelatorio />} />
      <Route path="/integracao" element={<Integracao />} />
      <Route path="/corretor" element={<Corretor />} />
      <Route path="/corretor/perfil" element={<PerfilCorretor />} />
      <Route path="/corretor/visitas" element={<VisitasCorretor />} />
      <Route path="*" element={<div>404 - Página não encontrada</div>} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/pesquisa-satisfacao" element={<PesquisaSatisfacao />} />
              <Route path="/tv-corretor" element={<TV />} />
              <Route path="/persona" element={<Persona />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
            <PWAInstallPrompt />
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
