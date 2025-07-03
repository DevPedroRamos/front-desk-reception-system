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
import { BarChart3, UserCheck, LogOut, Trophy, Clock, Calendar, Users, User, Gift, FileText, BookOpen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { userProfile, loading } = useUserRole();

  const handleLogout = async () => {
    console.log('Botão logout clicado');
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no handleLogout:', error);
    }
  };

  // Definir menu items baseado no role
  const getMenuItems = () => {
    if (loading || !userProfile) return [];

    if (userProfile.role === 'corretor') {
      return [
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
      ];
    } else {
      // Recepcionista ou outros roles
      return [
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
          title: "Pódio",
          url: "/podio",
          icon: Trophy,
        },
        {
          title: "Integração",
          url: "/integracao",
          icon: BookOpen,
        },
      ];
    }
  };

  const menuItems = getMenuItems();

  if (loading) {
    return (
      <Sidebar className="border-r border-border">
        <SidebarHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">📊</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Front Desk</h1>
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">📊</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Front Desk</h1>
            <p className="text-sm text-muted-foreground">
              {userProfile?.role === 'corretor' ? 'Portal do Corretor' : 'Sistema de Recepção'}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-semibold">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-6 border-t border-border">
        {user && (
          <div className="mb-4">
            <div className="text-sm font-medium text-foreground mb-1">
              {userProfile?.name || user.email}
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              {userProfile?.role && (
                <span className="capitalize bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                  {userProfile.role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex-1"
              >
                <LogOut className="h-3 w-3" />
                Sair
              </button>
            </div>
          </div>
        )}
        <div className="text-xs text-muted-foreground text-center">
          © 2025 Front Desk System | Metro Lab🧪
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}