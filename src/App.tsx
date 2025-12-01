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
import MKT from '@/pages/MKT';
import Persona from '@/pages/Persona';
import Recebimento from '@/pages/Recebimento';
import Entregas from '@/pages/Entregas';
import PersonaAdmin from '@/pages/admin/PersonaAdmin';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import GerarLink from '@/pages/GerarLink';
import Agendar from '@/pages/Agendar';
import CheckIn from '@/pages/CheckIn';
import Agendamentos from '@/pages/Agendamentos';

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
      <Route path="/agendamentos" element={<Agendamentos />} />
      <Route path="/recebimento" element={<Recebimento />} />
      <Route path="/entregas" element={<Entregas />} />
      <Route path="/admin/persona" element={<PersonaAdmin />} />
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
              <Route path="/mkt" element={<MKT />} />
              <Route path="/persona" element={<Persona />} />
              <Route path="/gerar-link" element={<GerarLink />} />
              <Route path="/agendar/:token" element={<Agendar />} />
              <Route path="/check-in" element={<CheckIn />} />
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
