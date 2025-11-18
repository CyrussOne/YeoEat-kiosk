import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tag, DollarSign, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    activePromotions: 0,
    lastSync: null as string | null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [productsData, activeProductsData, promotionsData, syncData] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('odoo_sync_config').select('last_sync_at').maybeSingle(),
    ]);

    setStats({
      totalProducts: productsData.count || 0,
      activeProducts: activeProductsData.count || 0,
      activePromotions: promotionsData.count || 0,
      lastSync: syncData.data?.last_sync_at || null,
    });
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: `${stats.activeProducts} active`,
    },
    {
      title: 'Active Promotions',
      value: stats.activePromotions,
      icon: Tag,
      description: 'Currently running',
    },
    {
      title: 'Last Odoo Sync',
      value: stats.lastSync ? new Date(stats.lastSync).toLocaleDateString() : 'Never',
      icon: RefreshCw,
      description: stats.lastSync ? new Date(stats.lastSync).toLocaleTimeString() : 'Not configured',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your kiosk system</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <a
                href="/admin/products"
                className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <h3 className="font-semibold mb-1">📦 Manage Products</h3>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or remove products from your menu
                </p>
              </a>
              <a
                href="/admin/orders"
                className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <h3 className="font-semibold mb-1">🛒 Manage Orders</h3>
                <p className="text-sm text-muted-foreground">
                  View and process customer orders
                </p>
              </a>
              <a
                href="/admin/users"
                className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <h3 className="font-semibold mb-1">👥 Manage Users</h3>
                <p className="text-sm text-muted-foreground">
                  Assign roles and manage user access
                </p>
              </a>
              <a
                href="/admin/promotions"
                className="p-4 border rounded-lg hover:bg-accent transition-colors opacity-50 pointer-events-none"
              >
                <h3 className="font-semibold mb-1">🎯 Promotions (Coming Soon)</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage discount campaigns
                </p>
              </a>
              <a
                href="/admin/settings"
                className="p-4 border rounded-lg hover:bg-accent transition-colors opacity-50 pointer-events-none"
              >
                <h3 className="font-semibold mb-1">⚙️ Settings (Coming Soon)</h3>
                <p className="text-sm text-muted-foreground">
                  Configure company and receipt settings
                </p>
              </a>
              <a
                href="/admin/odoo"
                className="p-4 border rounded-lg hover:bg-accent transition-colors opacity-50 pointer-events-none"
              >
                <h3 className="font-semibold mb-1">🔄 Odoo Sync (Coming Soon)</h3>
                <p className="text-sm text-muted-foreground">
                  Sync products from your ERP system
                </p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
