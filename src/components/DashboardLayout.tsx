import { ReactNode, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar, MobileHeader, SidebarToggle } from './AppSidebar';
import { NotificationBell } from './NotificationBell';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar Toggle */}
      {!isMobile && sidebarOpen && (
        <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
      )}
      
      {/* Sidebar */}
      <AppSidebar isOpen={isMobile ? sidebarOpen : sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        {isMobile && <MobileHeader onMenuClick={toggleSidebar} />}
        
        {/* Desktop Header with Notification */}
        {!isMobile && !isAdmin && (
          <div className="flex justify-end p-4 pb-0">
            <NotificationBell />
          </div>
        )}
        
        {/* Desktop collapsed toggle */}
        {!isMobile && !sidebarOpen && (
          <SidebarToggle isOpen={sidebarOpen} onToggle={toggleSidebar} />
        )}
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className={cn(
            'p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full',
            !isMobile && !sidebarOpen && 'lg:pl-14'
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
