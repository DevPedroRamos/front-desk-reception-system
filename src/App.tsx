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
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import Corretor from '@/pages/corretor';
import PerfilCorretor from '@/pages/corretor/perfil';
import VisitasCorretor from '@/pages/corretor/visitas';

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
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
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h1 className="text-2xl font-bold text-foreground mb-2">404</h1><p className="text-muted-foreground">Página não encontrada</p></div></div>} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/pesquisa-satisfacao" element={<PesquisaSatisfacao />} />
                <Route path="/*" element={<ProtectedRoutes />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;