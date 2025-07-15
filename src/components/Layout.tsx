
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mobile header with trigger */}
          <header className="flex items-center justify-between p-4 lg:hidden border-b bg-white/80 backdrop-blur-sm">
            <SidebarTrigger className="h-9 w-9" />
            <h1 className="font-semibold text-lg">Front Desk</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </header>
          
          {/* Desktop trigger - hidden on mobile */}
          <div className="hidden lg:block p-6 pb-0">
            <SidebarTrigger className="mb-4" />
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-4 lg:p-6 overflow-x-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
