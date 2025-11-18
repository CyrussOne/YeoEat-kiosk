import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  Tag,
  Building2,
  Printer,
  Receipt,
  Settings,
  RefreshCw,
  LogOut,
  FileText,
  Activity,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAdminAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Tag, label: 'Promotions', path: '/admin/promotions' },
    { icon: Building2, label: 'Company', path: '/admin/company' },
    { icon: Printer, label: 'Printer', path: '/admin/printer' },
    { icon: FileText, label: 'Tax Settings', path: '/admin/tax' },
    { icon: Receipt, label: 'Receipt Layout', path: '/admin/receipt' },
    { icon: RefreshCw, label: 'Odoo Sync', path: '/admin/odoo' },
    { icon: Activity, label: 'Diagnostic Logs', path: '/admin/diagnostic-logs' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Settings className="mr-2 h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Admin Panel</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info & logout */}
          <div className="border-t p-4">
            <div className="mb-3 text-sm">
              <div className="font-medium">Signed in as</div>
              <div className="text-muted-foreground truncate">{user?.email}</div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
