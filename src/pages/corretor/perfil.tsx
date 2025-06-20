
import { Layout } from '@/components/Layout';
import { RoleProtectedRoute } from '@/components/RoleProtectedRoute';
import { MetricasPersonais } from '@/components/corretor/MetricasPersonais';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Award, TrendingUp } from 'lucide-react';

const PerfilCorretor = () => {
  const { user } = useAuth();
  const { userProfile } = useUserRole();

  const { data: perfilCompleto } = useQuery({
    queryKey: ['perfil-corretor-completo', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil completo:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  return (
    <RoleProtectedRoute allowedRoles={['corretor']}>
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Meu Perfil</h1>
              <p className="text-slate-600">Informações pessoais e estatísticas de performance</p>
            </div>
          </div>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                  <p className="text-lg font-semibold">{perfilCompleto?.name || userProfile?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Apelido</label>
                  <p className="text-lg font-semibold">{perfilCompleto?.apelido}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">CPF</label>
                  <p className="text-lg font-semibold">{perfilCompleto?.cpf || userProfile?.cpf}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Função</label>
                  <p className="text-lg font-semibold capitalize">{userProfile?.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gerente</label>
                  <p className="text-lg font-semibold">{perfilCompleto?.gerente}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Superintendente</label>
                  <p className="text-lg font-semibold">{perfilCompleto?.superintendente}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-slate-900">Estatísticas de Performance</h2>
            </div>
            <MetricasPersonais />
          </div>

          {/* Reconhecimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Reconhecimentos e Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Sistema de reconhecimentos será implementado em breve
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Aqui você poderá ver suas conquistas e certificações
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
};

export default PerfilCorretor;
