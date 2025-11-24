import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: PlusCircle, label: 'Add Expense', path: '/add-expense' },
  { icon: History, label: 'History', path: '/history' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Sparkles, label: 'AI Add', path: '/ai-add' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] glass-card border-r border-border/40 transition-all duration-300 animate-slide-up',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full p-3">
        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 transition-all',
                    collapsed && 'justify-center',
                    isActive && 'shadow-md'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground text-center">
            <p>v1.0.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};
