import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Auth } from '@/pages/auth';
import { Cliente } from '@/pages/cliente';
import { Index } from '@/pages/index';
import { ListaEspera } from '@/pages/lista-espera';
import { Podio } from '@/pages/podio';
import { Recepcao } from '@/pages/recepcao';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from '@tanstack/react-query';
import Corretor from '@/pages/corretor';
import PerfilCorretor from '@/pages/corretor/perfil';
import AgendamentosCorretor from '@/pages/corretor/agendamentos';
import VisitasCorretor from '@/pages/corretor/visitas';
import ConfirmarAgendamento from '@/pages/confirmar-agendamento/[token]';
import AgendarPage from '@/pages/agendar/[token]';
import NotFound from '@/pages/not-found';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <SidebarProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/cliente" element={<Cliente />} />
                <Route path="/recepcao" element={<Recepcao />} />
                <Route path="/lista-espera" element={<ListaEspera />} />
                <Route path="/podio" element={<Podio />} />
                <Route path="/corretor" element={<Corretor />} />
                <Route path="/corretor/perfil" element={<PerfilCorretor />} />
                <Route path="/corretor/agendamentos" element={<AgendamentosCorretor />} />
                <Route path="/corretor/visitas" element={<VisitasCorretor />} />
                <Route path="/confirmar-agendamento/:token" element={<ConfirmarAgendamento />} />
                <Route path="/agendar/:token" element={<AgendarPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SidebarProvider>
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
