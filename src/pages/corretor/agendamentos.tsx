
import { Layout } from '@/components/Layout';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { AgendamentosCalendar } from '@/components/corretor/AgendamentosCalendar';
import { Calendar } from 'lucide-react';

const AgendamentosCorretor = () => {
  return (
    <RoleProtectedRoute allowedRoles={['corretor']}>
      <Layout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Meus Agendamentos</h1>
              <p className="text-slate-600">Gerencie seus agendamentos e gere links de confirmação</p>
            </div>
          </div>

          {/* Calendário e Lista */}
          <AgendamentosCalendar />
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
};

export default AgendamentosCorretor;
