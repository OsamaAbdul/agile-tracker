import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  LogOut,
  Calendar,
  Upload,
  Menu,
  X,
  ChevronLeft,
  MessageCircle,
} from 'lucide-react';
import { ContactAdminDialog } from '@/components/ContactAdminDialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import agileLogo from '@/assets/agile-logo.jpg';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
  onClick?: () => void;
}

function NavItem({ to, icon: Icon, label, end = false, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className={cn(
        'h-5 w-5 shrink-0 transition-transform duration-200',
        isActive ? '' : 'group-hover:scale-110'
      )} />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

import { useSettings } from '@/hooks/useSettings';
import { isSubmissionWindowOpen } from '@/types';

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const { profile, isAdmin, logout, getComponentName } = useAuth();
  const [componentName, setComponentName] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    getComponentName().then(setComponentName);
  }, [getComponentName]);

  const { isSubmissionsOpenOverride } = useSettings();
  const isWindowOpen = isSubmissionWindowOpen(isSubmissionsOpenOverride);

  const adminNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/components', icon: Building2, label: 'Components' },
    { to: '/submissions', icon: FileText, label: 'Submissions' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/users', icon: Users, label: 'Users' },
  ];

  const memberNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    ...(isWindowOpen ? [{ to: '/upload', icon: Upload, label: 'Submit Report' }] : []),
  ];

  const navItems = isAdmin ? adminNavItems : memberNavItems;

  const handleNavClick = () => {
    if (isMobile) {
      onToggle();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={agileLogo}
              alt="AGILE Logo"
              className="h-11 w-11 rounded-xl bg-white object-contain ring-2 ring-sidebar-border"
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-sidebar-primary border-2 border-sidebar" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">
              AGILE Tracker
            </h1>
            <p className="text-xs text-sidebar-foreground/50">Nasarawa State</p>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider">
          Menu
        </p>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} onClick={handleNavClick} />
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="px-3 py-2.5 mb-2 rounded-xl bg-sidebar-accent/50">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {profile?.full_name || 'User'}
          </p>
          <p className="text-xs text-sidebar-foreground/50 truncate">
            {isAdmin ? 'Administrator' : componentName || 'Member'}
          </p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setIsContactDialogOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 mb-1 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Contact Support</span>
          </button>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
      <ContactAdminDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sidebar-overlay"
              onClick={onToggle}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Desktop Sidebar
  return (
    <aside className={cn(
      'h-screen bg-sidebar flex-shrink-0 border-r border-sidebar-border transition-all duration-300',
      isOpen ? 'w-64' : 'w-0 overflow-hidden'
    )}>
      {sidebarContent}
    </aside>
  );
}

// Mobile Header with Menu Toggle
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { isAdmin } = useAuth();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <img
            src={agileLogo}
            alt="AGILE"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="font-semibold text-sm">AGILE Tracker</span>
        </div>
        {!isAdmin ? <NotificationBell /> : <div className="w-9" />}
      </div>
    </header>
  );
}

// Desktop Toggle Button
export function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="hidden lg:flex h-8 w-8 fixed left-2 top-4 z-50 bg-background shadow-sm border"
    >
      <ChevronLeft className={cn(
        'h-4 w-4 transition-transform duration-200',
        !isOpen && 'rotate-180'
      )} />
    </Button>
  );
}
