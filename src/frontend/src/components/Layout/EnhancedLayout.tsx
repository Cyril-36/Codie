import { 
  PanelLeft, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  GitBranch, 
  ChartLine, 
  AlertTriangle, 
  Beaker, 
  Wrench, 
  Shield, 
  Sliders, 
  Bot,
  Gauge,
  ChevronDown
} from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../styles/theme';

interface EnhancedLayoutProps {
  children: React.ReactNode;
}

export default function EnhancedLayout({ children }: EnhancedLayoutProps) {
  const { user, logout } = useAuth();
  const { toggle, isDark } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [stickyShadow, setStickyShadow] = useState(false);

  // Sticky shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setStickyShadow(window.scrollY > 4);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Stagger reveal animation
  useEffect(() => {
    const timer = setTimeout(() => {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach((el, i) => {
        setTimeout(() => el.classList.add('in'), i * 90);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleThemeToggle = useCallback(() => {
    toggle();
  }, [toggle]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const navigationItems = [
    { icon: Gauge, label: 'Dashboard', href: '/', current: true },
    { icon: GitBranch, label: 'Dependency Graph', href: '/graph' },
    { icon: ChartLine, label: 'Performance Charts', href: '/performance' },
    { icon: AlertTriangle, label: 'Alerts & Issues', href: '/security' },
    { icon: Beaker, label: 'Test Generator', href: '/test-gen' },
    { icon: Wrench, label: 'Refactor Planner', href: '/refactor' },
    { icon: Shield, label: 'Security Panel', href: '/security' },
    { icon: Sliders, label: 'Noise Filter / Export', href: '/export' },
    { icon: Bot, label: 'AI Chat', href: '/chat' },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Skip to main content */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      {/* Enhanced Header */}
      <header 
        className={`sticky top-0 z-30 bg-[color:var(--background)]/85 backdrop-blur border-b border-[color:var(--border)] transition-all duration-200 ${
          stickyShadow ? 'shadow-[var(--elevation-card)]' : ''
        }`}
        role="banner"
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button 
            onClick={handleSidebarToggle}
            className="p-2 rounded hover:bg-[color:var(--muted)] transition-colors ripple"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-[color:var(--muted-foreground)]" />
            <input 
              className="w-full pl-9 pr-3 py-2 rounded border border-[color:var(--border)] bg-[color:var(--card)] placeholder-[color:var(--muted-foreground)] focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--focus-ring)] transition-all"
              placeholder="Search projects, repos, issues…" 
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="flex items-center gap-2 ml-auto">
            <button 
              className="p-2 rounded hover:bg-[color:var(--muted)] relative transition-colors ripple"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[color:var(--destructive)] text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            <button 
              onClick={handleThemeToggle}
              className="p-2 rounded hover:bg-[color:var(--muted)] transition-colors ripple"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button 
                className="p-2 rounded hover:bg-[color:var(--muted)] transition-colors ripple flex items-center gap-2"
                aria-label="Profile menu"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.name || 'User'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 px-4 sm:px-6 py-6">
        {/* Enhanced Sidebar */}
        <aside 
          id="sidebar" 
          className={`sidebar lg:sticky lg:top-[64px] h-fit card p-3 transition-transform duration-300 ${
            sidebarCollapsed ? 'is-collapsed' : ''
          }`}
          role="navigation" 
          aria-label="Primary navigation"
        >
          <div className="flex items-center justify-between px-2 py-2 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--highlight)] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold">Codie</span>
            </div>
            <span className="text-xs text-[color:var(--muted-foreground)] bg-[color:var(--muted)] px-2 py-1 rounded">
              v1.0
            </span>
          </div>

          <nav className="mt-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 group ${
                    item.current 
                      ? 'bg-[color:var(--primary)]/10 text-[color:var(--primary)] border-r-2 border-[color:var(--primary)]' 
                      : 'hover:bg-[color:var(--muted)] text-[color:var(--foreground)]'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-200 ${
                    item.current ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {item.current && (
                    <div className="ml-auto w-2 h-2 bg-[color:var(--primary)] rounded-full animate-pulse" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* User info at bottom */}
          <div className="mt-6 pt-4 border-t border-[color:var(--border)]">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--highlight)] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name || 'Anonymous User'}
                </p>
                <p className="text-xs text-[color:var(--muted-foreground)] truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-[color:var(--muted)] transition-colors"
                aria-label="Logout"
              >
                <span className="text-xs text-[color:var(--muted-foreground)]">↪</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main 
          id="main" 
          role="main" 
          className="min-h-0"
        >
          {children}
        </main>
      </div>

      {/* Enhanced Mobile Sidebar Overlay */}
      {sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={handleSidebarToggle}
        />
      )}
    </div>
  );
}
