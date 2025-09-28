import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, LogOut, Package, Copy, CheckCircle, Key, Download } from "lucide-react";

interface CustomerOrder {
  id: string;
  productName: string;
  productPrice: string;
  customerEmail: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  licenseKey?: string;
  downloadUrl?: string;
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const orderId = searchParams.get('order');
  
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLocation('/customer-login');
      return;
    }
    
    checkAuth();
    fetchOrders();
  }, [orderId]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/customer/check', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        setLocation('/customer-login');
      }
    } catch (err) {
      setLocation('/customer-login');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/customer/orders?orderId=${orderId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : [data]);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLogout = () => {
    fetch('/api/customer/logout', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      setLocation('/customer-login');
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'We are verifying your payment. This usually takes 10-60 minutes.';
      case 'confirmed':
        return 'Your payment has been confirmed. We are preparing your order.';
      case 'completed':
        return 'Your order is complete! Your license key and download are ready below.';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading your orders...</h2>
        </div>
      </div>
    );
  }

  const completedOrders = orders.filter(order => order.status === 'completed');
  const pendingOrders = orders.filter(order => order.status !== 'completed');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Key className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Keys</p>
                  <p className="text-2xl font-bold">
                    {completedOrders.filter(o => o.licenseKey).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Completed Orders - Ready to Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="border border-green-500/20 bg-green-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{order.productName}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                            <div>
                              <p><strong>Price:</strong> ${order.productPrice}</p>
                              <p><strong>Payment:</strong> {order.paymentMethod}</p>
                            </div>
                            <div>
                              <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                              <p><strong>Order ID:</strong> {order.id}</p>
                            </div>
                          </div>
                          
                          {order.licenseKey && (
                            <div className="bg-background p-4 rounded border mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Key className="w-4 h-4" />
                                  License Key
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(order.licenseKey!)}
                                >
                                  {copiedKey === order.licenseKey ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              <code className="text-sm font-mono bg-muted p-2 rounded block">
                                {order.licenseKey}
                              </code>
                            </div>
                          )}
                          
                          {order.downloadUrl && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => window.open(order.downloadUrl, '_blank')}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="font-semibold">{order.productName}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getStatusMessage(order.status)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Order ID: {order.id}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {orders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}