import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  UserCheck,
  LogOut,
  Trophy,
  Clock,
  Calendar,
  Users,
  User,
  Gift,
  FileText,
  BookOpen,
  Settings,
  UserCog,
  Wallet,
  Package,
  Bell,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useNotificarVisita, NotificarVisitaResult } from "@/hooks/useNotificarVisita";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { userProfile, loading } = useUserRole();
  const { isAdmin } = useAdminRole();
  const { notificarVisita } = useNotificarVisita();
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<NotificarVisitaResult | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestNotificacao = async () => {
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    setTestDialogOpen(true);

    const result = await notificarVisita({
      corretor_nome: "Corretor Teste",
      cliente_nome: "Cliente Teste",
      loja: "Loja 1",
      andar: "N/A",
      mesa: 5,
      horario_entrada: new Date().toISOString(),
    });

    if (!result) {
      setTestError("Falha no envio. Verifique se VITE_METROCASA_API_TOKEN está configurado no .env");
    } else {
      setTestResult(result);
    }

    setTestLoading(false);
  };

  const handleLogout = async () => {
    console.log("Botão logout clicado");
    try {
      await signOut();
    } catch (error) {
      console.error("Erro no handleLogout:", error);
    }
  };

  // Definir menu items baseado no role
  const getMenuItems = () => {
    if (loading || !userProfile) return [];

    const items = [];

    if (userProfile.role === "corretor") {
      items.push(
        {
          title: "Minhas Visitas",
          url: "/corretor/visitas",
          icon: Users,
        },
        {
          title: "Perfil",
          url: "/corretor/perfil",
          icon: User,
        },
        {
          title: "Integração",
          url: "/integracao",
          icon: BookOpen,
        },
      );
    } else {
      // Recepcionista ou outros roles
      items.push(
        {
          title: "Dashboard",
          url: "/",
          icon: BarChart3,
        },
        {
          title: "Recepção",
          url: "/recepcao",
          icon: UserCheck,
        },
        {
          title: "Lista de Espera",
          url: "/lista-espera",
          icon: Clock,
        },
        {
          title: "Agendamentos",
          url: "/agendamentos",
          icon: Calendar,
        },
        {
          title: "Recebimentos",
          url: "/recebimento",
          icon: Wallet,
        },
        {
          title: "Entregas",
          url: "/entregas",
          icon: Package,
        },
        {
          title: "Brindes",
          url: "/brindes",
          icon: Gift,
        },
        {
          title: "Pesquisa de Satisfação",
          url: "/pesquisa",
          icon: FileText,
        },
        {
          title: "Integração",
          url: "/integracao",
          icon: BookOpen,
        },
      );
    }

    return items;
  };

  // Menu items administrativos
  const getAdminMenuItems = () => {
    if (!isAdmin) return [];

    return [
      {
        title: "Questionários de Persona",
        url: "/admin/persona",
        icon: UserCog,
      },
      {
        title: "Gestão de Brindes",
        url: "/admin/brindes",
        icon: Gift,
      },
    ];
  };

  const menuItems = getMenuItems();
  const adminMenuItems = getAdminMenuItems();

  if (loading) {
    return (
      <Sidebar className="border-r border-slate-200">
        <SidebarHeader className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/icons/icon-192x192.png" alt="Front Desk" className="w-10 h-10 rounded-lg" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900">Front Desk</h1>
              <p className="text-sm text-slate-500">Carregando...</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-slate-200" collapsible="icon">
      <SidebarHeader className="p-4 lg:p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            <img src="/icons/icon-192x192.png" alt="Front Desk" className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg" />
          </div>
          <div className="min-w-0 hidden lg:block group-data-[collapsible=icon]:hidden">
            <h1 className="font-bold text-base lg:text-lg text-slate-900 truncate">Front Desk</h1>
            <p className="text-xs lg:text-sm text-slate-500 truncate">
              {userProfile?.role === "corretor" ? "Portal do Corretor" : "Sistema de Recepção"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 lg:px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-semibold text-xs lg:text-sm px-2 group-data-[collapsible=icon]:hidden">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url} className="h-9 lg:h-10">
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && adminMenuItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-600 font-semibold text-xs lg:text-sm px-2 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Administração
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url} className="h-9 lg:h-10">
                      <a
                        href={item.url}
                        className="flex items-center gap-3 px-2 lg:px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleTestNotificacao}
                    disabled={testLoading}
                    className="h-9 lg:h-10"
                  >
                    {testLoading ? (
                      <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                    ) : (
                      <Bell className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      {testLoading ? "Enviando..." : "Testar Notificação"}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 lg:px-3 py-2">
              <PWAInstallButton />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 lg:p-6 border-t border-slate-200">
        {user && (
          <div className="mb-3 lg:mb-4">
            <div className="text-xs lg:text-sm font-medium text-slate-900 mb-1 truncate group-data-[collapsible=icon]:hidden">
              {userProfile?.name || user.email}
            </div>
            <div className="text-xs text-slate-500 mb-2 group-data-[collapsible=icon]:hidden">
              {userProfile?.role && (
                <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {userProfile.role}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs lg:text-sm text-slate-600 hover:text-slate-900 transition-colors w-full justify-center group-data-[collapsible=icon]:justify-center"
              title="Sair"
            >
              <LogOut className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sair</span>
            </button>
          </div>
        )}
        <div className="text-xs text-slate-500 text-center group-data-[collapsible=icon]:hidden">
          © 2025 Front Desk System | Metro Lab🧪
        </div>
      </SidebarFooter>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teste de Notificação de Visita</DialogTitle>
          </DialogHeader>

          {testLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando para a API...
            </div>
          )}

          {testError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {testError}
            </div>
          )}

          {testResult && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-slate-700 mb-1">Status</p>
                <p className={`font-mono ${testResult.ok ? "text-green-700" : "text-red-700"}`}>
                  {testResult.status} {testResult.statusText}
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-700 mb-1">Payload enviado</p>
                <pre className="rounded-lg bg-slate-100 p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(testResult.payload, null, 2)}
                </pre>
              </div>

              <div>
                <p className="font-medium text-slate-700 mb-1">Resposta da API</p>
                <pre className="rounded-lg bg-slate-100 p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(testResult.body), null, 2);
                    } catch {
                      return testResult.body || "(vazio)";
                    }
                  })()}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
