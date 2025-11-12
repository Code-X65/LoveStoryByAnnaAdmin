import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Data
const MOCK_PRODUCTS = [
  { id: '1', name: 'Cute Pink Dress', stock: 15, image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=100&h=100&fit=crop' },
  { id: '2', name: 'Blue Denim Jacket', stock: 8, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=100&h=100&fit=crop' },
  { id: '3', name: 'Rainbow T-Shirt', stock: 3, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100&h=100&fit=crop' },
  { id: '4', name: 'Yellow Summer Shorts', stock: 12, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100&h=100&fit=crop' },
  { id: '5', name: 'Striped Cotton Shirt', stock: 2, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop' },
  { id: '6', name: 'Winter Hoodie', stock: 20, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop' },
];

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', createdAt: new Date('2025-10-15') },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', createdAt: new Date('2025-10-20') },
  { id: '3', name: 'Emily Rodriguez', email: 'emily@example.com', createdAt: new Date('2025-11-01') },
  { id: '4', name: 'David Kim', email: 'david@example.com', createdAt: new Date('2025-11-05') },
  { id: '5', name: 'Lisa Anderson', email: 'lisa@example.com', createdAt: new Date('2025-11-08') },
  { id: '6', name: 'James Wilson', email: 'james@example.com', createdAt: new Date('2025-09-12') },
];

const generateMockOrders = () => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const customer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    
    const items = [];
    let total = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = Math.floor(Math.random() * 8000) + 2000;
      
      items.push({
        name: product.name,
        image: product.image,
        quantity,
        price
      });
      
      total += price * quantity;
    }
    
    orders.push({
      id: `order_${i + 1}`,
      orderNumber: `ORD-${String(i + 1).padStart(4, '0')}`,
      userId: customer.id,
      createdAt,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
      total,
      items,
      shippingAddress: {
        firstName: customer.name.split(' ')[0],
        lastName: customer.name.split(' ')[1]
      }
    });
  }
  
  return orders.sort((a, b) => b.createdAt - a.createdAt);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showFullRevenue, setShowFullRevenue] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    lowStockProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      fetchDashboardData();
    }, 1000);
  }, []);

  const fetchDashboardData = () => {
    try {
      setLoading(true);
      
      const orders = generateMockOrders();
      const customers = MOCK_CUSTOMERS;
      const products = MOCK_PRODUCTS;

      calculateStats(orders, customers, products);
      setRecentOrders(orders.slice(0, 5));
      calculateTopProducts(orders);
      calculateRevenueTrend(orders);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orders, customers, products) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(o => o.createdAt >= thirtyDaysAgo);
    const previousOrders = orders.filter(o => o.createdAt >= sixtyDaysAgo && o.createdAt < thirtyDaysAgo);

    const currentRevenue = recentOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    const previousRevenue = previousOrders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const ordersChange = previousOrders.length > 0
      ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
      : 0;

    const recentCustomers = customers.filter(c => c.createdAt >= thirtyDaysAgo).length;
    const previousCustomers = customers.filter(c => c.createdAt >= sixtyDaysAgo && c.createdAt < thirtyDaysAgo).length;

    const customersChange = previousCustomers > 0
      ? ((recentCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

    setStats({
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      lowStockProducts: products.filter(p => p.stock <= 5 && p.stock > 0).length,
      revenueChange,
      ordersChange,
      customersChange
    });
  };

  const calculateTopProducts = (orders) => {
    const productSales = {};
    
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = {
            name: item.name,
            image: item.image,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setTopProducts(topProducts);
  };

  const calculateRevenueTrend = (orders) => {
    const last7Days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = orders.filter(o => 
        o.paymentStatus === 'paid' && 
        o.createdAt >= dayStart && 
        o.createdAt <= dayEnd
      );

      const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      last7Days.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: revenue,
        orders: dayOrders.length
      });
    }

    setRevenueData(last7Days);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 shadow-lg rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <DollarSign className="text-white" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                stats.revenueChange >= 0 ? 'text-green-100' : 'text-red-100'
              }`}>
                {stats.revenueChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.revenueChange).toFixed(1)}%
              </div>
            </div>
            <p className="text-pink-100 text-sm mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white mb-2">
              ₦{(stats.totalRevenue / 1000).toFixed(1)}k
            </p>
            <p className="text-pink-100 text-xs">vs last 30 days</p>
          </div>

          {/* Total Orders */}
          <div className="bg-slate-800 border border-pink-500 p-6 shadow-lg rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-500/20 p-3 rounded-lg">
                <ShoppingBag className="text-pink-300" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                stats.ordersChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.ordersChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.ordersChange).toFixed(1)}%
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-white mb-2">{stats.totalOrders}</p>
            <p className="text-gray-400 text-xs">vs last 30 days</p>
          </div>

          {/* Total Customers */}
          <div className="bg-slate-800 border border-pink-500 p-6 shadow-lg rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Users className="text-blue-400" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-semibold ${
                stats.customersChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.customersChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(stats.customersChange).toFixed(1)}%
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-white mb-2">{stats.totalCustomers}</p>
            <p className="text-gray-400 text-xs">vs last 30 days</p>
          </div>

          {/* Total Products */}
          <div className="bg-slate-800 border border-pink-500 p-6 shadow-lg rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Package className="text-purple-400" size={24} />
              </div>
              {stats.lowStockProducts > 0 && (
                <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                  <AlertCircle size={16} />
                  {stats.lowStockProducts} low
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-white mb-2">{stats.totalProducts}</p>
            <p className="text-gray-400 text-xs">Active inventory</p>
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-yellow-500/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingOrders}</p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-blue-500/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Processing</p>
                <p className="text-2xl font-bold text-blue-400">{stats.processingOrders}</p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-purple-500/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Shipped</p>
                <p className="text-2xl font-bold text-purple-400">{stats.shippedOrders}</p>
              </div>
              <Truck className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-slate-800 border border-green-500/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-400">{stats.deliveredOrders}</p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-slate-800 border border-pink-500 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
  <h3 className="text-lg font-semibold text-white">Revenue Trend (Last {showFullRevenue ? '7' : '3'} Days)</h3>
  <button 
    onClick={() => setShowFullRevenue(!showFullRevenue)}
    className="text-pink-300 hover:text-pink-400 text-sm flex items-center gap-1"
  >
    {showFullRevenue ? 'Show Less' : 'View All'} <ArrowRight size={16} />
  </button>
</div>
            <div className="space-y-4">
            {(showFullRevenue ? revenueData : revenueData.slice(-3)).map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm w-12">{data.day}</span>
                  <div className="flex-1">
                    <div className="bg-slate-700 h-8 rounded-lg overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-pink-400 h-full flex items-center justify-end px-3"
                        style={{ 
                          width: `${Math.min((data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100, 100)}%` 
                        }}
                      >
                        <span className="text-white text-xs font-semibold">
                          ₦{(data.revenue / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm w-20 text-right">
                    {data.orders} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

       {/* Top Products Categories */}
<div className="bg-slate-800 border border-pink-500 p-6 rounded-lg">
  <h3 className="text-lg font-semibold text-white mb-6">Top Products</h3>
  
  <div className="space-y-6">
    {/* Most Revenue */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-pink-300">Most Revenue</p>
      </div>
      {topProducts.slice(0, 2).map((product, index) => (
        <div key={index} className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
            {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{product.name}</p>
            <p className="text-gray-400 text-xs">₦{(product.revenue / 1000).toFixed(1)}k</p>
          </div>
        </div>
      ))}
    </div>

    {/* Most Ordered */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-blue-300">Most Ordered</p>
      </div>
      {[...topProducts].sort((a, b) => b.quantity - a.quantity).slice(0, 2).map((product, index) => (
        <div key={index} className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
            {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{product.name}</p>
            <p className="text-gray-400 text-xs">{product.quantity} sold</p>
          </div>
        </div>
      ))}
    </div>

    <button 
      onClick={() => navigate('/products')}
      className="w-full text-pink-300 hover:text-pink-400 text-sm flex items-center justify-center gap-1 py-2 border border-pink-500 rounded-lg"
    >
      View All Products <ArrowRight size={16} />
    </button>
  </div>
</div>
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-800 border border-pink-500 overflow-hidden rounded-lg">
          <div className="px-6 py-4 border-b border-pink-500 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
            <button 
              onClick={() => navigate('/orders')}
              className="text-pink-300 hover:text-pink-400 text-sm flex items-center gap-1"
            >
              View All Orders <ArrowRight size={16} />
            </button>
          </div>
          
        <div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-slate-700 border-b border-pink-500">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Order #</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Customer</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Items</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Date</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Total</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Payment</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Action</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-pink-500">
      {recentOrders.map((order) => (
        <tr key={order.id} className="hover:bg-slate-700">
          <td className="px-4 py-4">
            <div>
              <p className="text-sm font-medium text-white">{order.orderNumber}</p>
              <p className="text-xs text-gray-400">{order.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </td>
          <td className="px-4 py-4">
            <div>
              <p className="text-sm text-white font-medium">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </p>
              <p className="text-xs text-gray-400">
                {MOCK_CUSTOMERS.find(c => c.id === order.userId)?.email || 'N/A'}
              </p>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full border-2 border-slate-800 overflow-hidden bg-slate-700">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                </p>
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div>
              <p className="text-sm text-gray-400">{order.createdAt.toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">
                {Math.floor((new Date() - order.createdAt) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </div>
          </td>
          <td className="px-4 py-4">
            <p className="text-sm font-semibold text-white">₦{(order.total || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400">
              ₦{Math.floor(order.total / order.items.reduce((sum, item) => sum + item.quantity, 0)).toLocaleString()}/item
            </p>
          </td>
          <td className="px-4 py-4">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              order.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-300'
            }`}>
              {order.paymentStatus}
            </span>
          </td>
          <td className="px-4 py-4">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(order.status)}`}>
              {order.status || 'pending'}
            </span>
          </td>
          <td className="px-4 py-4">
            <button
              onClick={() => navigate('/orders')}
              className="text-pink-300 hover:text-pink-400 p-2 hover:bg-slate-600 rounded transition-colors"
              title="View Details"
            >
              <Eye size={18} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button 
            onClick={() => navigate('/add-product')}
            className="bg-pink-500 hover:bg-pink-600 text-white p-6 rounded-lg transition-colors flex items-center justify-between"
          >
            <div>
              <p className="font-semibold mb-1">Add New Product</p>
              <p className="text-sm text-pink-100">Create a new product listing</p>
            </div>
            <Package size={32} className="opacity-80" />
          </button>

          <button 
            onClick={() => navigate('/orders')}
            className="bg-slate-800 hover:bg-slate-700 border border-pink-500 text-white p-6 rounded-lg transition-colors flex items-center justify-between"
          >
            <div>
              <p className="font-semibold mb-1">Manage Orders</p>
              <p className="text-sm text-gray-400">Process pending orders</p>
            </div>
            <ShoppingBag size={32} className="text-pink-300" />
          </button>

          <button 
            onClick={() => navigate('/customers')}
            className="bg-slate-800 hover:bg-slate-700 border border-pink-500 text-white p-6 rounded-lg transition-colors flex items-center justify-between"
          >
            <div>
              <p className="font-semibold mb-1">View Customers</p>
              <p className="text-sm text-gray-400">Manage customer accounts</p>
            </div>
            <Users size={32} className="text-pink-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;