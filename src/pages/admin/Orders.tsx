import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Eye,
  Receipt,
  RefreshCw,
  Filter,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getRecentOrders,
  getOrdersByStatus,
  updateOrderStatus,
  getOrderStatistics
} from '@/services/orders';
import type { OrderWithItems, Order } from '@/types/order';

const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'preparing', label: 'Preparing', color: 'bg-blue-500' },
  { value: 'ready', label: 'Ready', color: 'bg-green-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch orders based on filter
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () =>
      statusFilter === 'all'
        ? getRecentOrders(100)
        : getOrdersByStatus(statusFilter as Order['status']),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['order-statistics'],
    queryFn: getOrderStatistics,
    refetchInterval: 30000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-statistics'] });
      toast.success('Order status updated');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });

  const openOrderDetail = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const closeOrderDetail = () => {
    setIsDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const printReceipt = (order: OrderWithItems) => {
    // Create a formatted receipt
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${order.order_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 300px; margin: 20px auto; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .items { margin: 20px 0; }
          .item { display: flex; justify-content: space-between; margin: 5px 0; }
          .totals { border-top: 2px dashed #000; padding-top: 10px; margin-top: 10px; }
          .total-row { display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>YeoEat Kiosk</h2>
          <p>Order #${order.order_number}</p>
          <p>${format(new Date(order.created_at), 'PPpp')}</p>
          <p>Service: ${order.service_type === 'eat-in' ? 'Eat In' : 'Take Away'}</p>
          <p>Payment: ${order.payment_method === 'card' ? 'Card' : 'Cashier'}</p>
        </div>

        <div class="items">
          ${order.order_items.map(item => `
            <div class="item">
              <span>${item.quantity}x ${item.product_name}</span>
              <span>€${item.total_price.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>€${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (19%):</span>
            <span>€${order.tax_amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>TOTAL:</span>
            <span>€${order.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p>Vielen Dank für Ihre Bestellung!</p>
        </div>
      </body>
      </html>
    `);

    receiptWindow.document.close();
    receiptWindow.print();
  };

  const filteredOrders = orders.filter((order) =>
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'preparing': return 'default';
      case 'ready': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Monitor and manage all kiosk orders</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todays_orders}</div>
                <p className="text-xs text-muted-foreground">Total: {stats.total_orders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{stats.todays_revenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Total: €{stats.total_revenue.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_orders}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_orders}</div>
                <p className="text-xs text-muted-foreground">Successfully fulfilled</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.order_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(order.created_at), 'PPP')}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(order.created_at), 'p')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.order_items.length} items</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.service_type === 'eat-in' ? 'Eat In' : 'Take Away'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.payment_method === 'card' ? 'Card' : 'Cashier'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">€{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusChange(order.id, value as Order['status'])
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.filter((s) => s.value !== 'all').map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openOrderDetail(order)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => printReceipt(order)}
                          title="Print Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Order Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder?.order_number} -{' '}
                {selectedOrder && format(new Date(selectedOrder.created_at), 'PPpp')}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Service Type</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.service_type === 'eat-in' ? 'Eat In' : 'Take Away'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.payment_method === 'card' ? 'Card' : 'Pay at Cashier'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.language === 'en' ? 'English' : 'German'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div>{item.product_name}</div>
                              {item.product_name_de && (
                                <div className="text-sm text-muted-foreground">
                                  {item.product_name_de}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>€{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            €{item.total_price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span>€{selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Tax (19%):</span>
                    <span>€{selectedOrder.tax_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>€{selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={() => printReceipt(selectedOrder)} className="flex-1">
                    <Receipt className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>
                  <Button variant="outline" onClick={closeOrderDetail}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
