
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
        <main className="flex-1 p-6">
          <div className="mb-6">
            <SidebarTrigger className="mb-4" />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
