
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
import { Calendar, Users, UserCheck, BarChart3, Settings, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    roles: ["corretor", "recepcao"]
  },
  {
    title: "Recepção",
    url: "/recepcao",
    icon: UserCheck,
    roles: ["recepcao"]
  },
  {
    title: "Corretor",
    url: "/corretor",
    icon: Users,
    roles: ["corretor", "recepcao"]
  },
  {
    title: "Agendamentos",
    url: "/agendamentos",
    icon: Calendar,
    roles: ["recepcao"]
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    roles: ["recepcao"]
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuthContext();

  const filteredMenuItems = menuItems.filter(item => 
    profile?.role && item.roles.includes(profile.role)
  );

  return (
    <Sidebar className="border-r border-slate-200">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🛎️</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900">Front Desk</h1>
            <p className="text-sm text-slate-500">Sistema de Recepção</p>
          </div>
        </div>
        
        {profile && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm font-medium text-slate-900">{profile.name}</p>
            <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-semibold">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
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

      <SidebarFooter className="p-6 border-t border-slate-200">
        <Button variant="outline" size="sm" onClick={signOut} className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
        <div className="text-xs text-slate-500 text-center mt-2">
          © 2024 Front Desk System
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
