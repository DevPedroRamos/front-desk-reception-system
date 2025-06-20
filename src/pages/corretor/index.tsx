
import { Layout } from '@/components/Layout';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { MetricasPersonais } from '@/components/corretor/MetricasPersonais';
import { VisitasAtivas } from '@/components/corretor/VisitasAtivas';
import { useUserRole } from '@/hooks/useUserRole';
import { User, TrendingUp } from 'lucide-react';

const DashboardCorretor = () => {
  const { userProfile } = useUserRole();

  return (
    <RoleProtectedRoute allowedRoles={['corretor']}>
      <Layout>
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Olá, {userProfile?.name || 'Corretor'}!
              </h1>
              <p className="text-slate-600">Acompanhe suas métricas e visitas ativas</p>
            </div>
          </div>

          {/* Métricas Pessoais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-slate-900">Suas Métricas</h2>
            </div>
            <MetricasPersonais />
          </div>

          {/* Visitas Ativas */}
          <VisitasAtivas />
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
};

export default DashboardCorretor;
