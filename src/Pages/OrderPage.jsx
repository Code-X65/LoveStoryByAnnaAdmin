import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  Eye, 
  Check, 
  X, 
  Clock,
  Truck,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  AlertCircle
} from 'lucide-react';

// Mock Data
const MOCK_CUSTOMERS = [
  { 
    id: '1', 
    firstName: 'Sarah', 
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+234 801 234 5678',
    address: '15 Victoria Island Road',
    city: 'Lagos',
    state: 'Lagos State',
    zipCode: '101241',
    country: 'Nigeria'
  },
  { 
    id: '2', 
    firstName: 'Michael', 
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+234 802 345 6789',
    address: '42 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos State',
    zipCode: '105102',
    country: 'Nigeria'
  },
  { 
    id: '3', 
    firstName: 'Emily', 
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@example.com',
    phone: '+234 803 456 7890',
    address: '28 Wuse Zone 5',
    city: 'Abuja',
    state: 'FCT',
    zipCode: '900001',
    country: 'Nigeria'
  },
  { 
    id: '4', 
    firstName: 'David', 
    lastName: 'Okonkwo',
    email: 'david.okonkwo@example.com',
    phone: '+234 804 567 8901',
    address: '67 Independence Layout',
    city: 'Enugu',
    state: 'Enugu State',
    zipCode: '400001',
    country: 'Nigeria'
  },
  { 
    id: '5', 
    firstName: 'Lisa', 
    lastName: 'Anderson',
    email: 'lisa.anderson@example.com',
    phone: '+234 805 678 9012',
    address: '91 Ring Road',
    city: 'Ibadan',
    state: 'Oyo State',
    zipCode: '200001',
    country: 'Nigeria'
  }
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'Cute Pink Dress', price: 8500, image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=100&h=100&fit=crop' },
  { id: '2', name: 'Blue Denim Jacket', price: 12000, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=100&h=100&fit=crop' },
  { id: '3', name: 'Rainbow T-Shirt', price: 4500, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=100&h=100&fit=crop' },
  { id: '4', name: 'Yellow Summer Shorts', price: 5500, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100&h=100&fit=crop' },
  { id: '5', name: 'Striped Cotton Shirt', price: 6000, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100&h=100&fit=crop' },
  { id: '6', name: 'Winter Hoodie', price: 9500, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=100&h=100&fit=crop' },
  { id: '7', name: 'Floral Sundress', price: 7500, image: 'https://images.unsplash.com/photo-1612336307429-8fe106d2e31b?w=100&h=100&fit=crop' },
  { id: '8', name: 'Cargo Pants', price: 8000, image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=100&h=100&fit=crop' }
];

const generateMockOrders = () => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'failed'];
  const paymentMethods = ['card', 'bank_transfer', 'cash_on_delivery'];
  const shippingMethods = ['standard', 'express', 'same_day'];
  const sizes = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const customer = MOCK_CUSTOMERS[Math.floor(Math.random() * MOCK_CUSTOMERS.length)];
    const numItems = Math.floor(Math.random() * 4) + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus = status === 'cancelled' ? 'failed' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
    
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      
      items.push({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        size
      });
      
      subtotal += product.price * quantity;
    }
    
    const shippingCost = shippingMethod === 'same_day' ? 3000 : shippingMethod === 'express' ? 2000 : 1000;
    const tax = Math.round(subtotal * 0.075); // 7.5% VAT
    const total = subtotal + shippingCost + tax;
    
    orders.push({
      id: `order_${i + 1}`,
      orderNumber: `KID-${String(i + 1).padStart(5, '0')}`,
      userId: customer.id,
      createdAt,
      status,
      paymentStatus,
      paymentMethod,
      paymentReference: paymentStatus === 'paid' ? `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      orderOtp: Math.floor(100000 + Math.random() * 900000).toString(),
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingMethod,
      shippingAddress: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        country: customer.country
      }
    });
  }
  
  return orders.sort((a, b) => b.createdAt - a.createdAt);
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchAllOrders = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      setTimeout(() => {
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.phone?.includes(searchTerm) ||
        `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = order.createdAt;
        const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        
        switch(dateFilter) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, orders]);

  // Update order status (mock)
  const updateOrderStatus = (userId, orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    
    alert('Order status updated successfully!');
  };

  // Update payment status (mock)
  const updatePaymentStatus = (userId, orderId, newPaymentStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
    );
    setOrders(updatedOrders);
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
    }
    
    alert('Payment status updated successfully!');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.pending;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-slate-800 text-gray-800'
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    paidOrders: orders.filter(o => o.paymentStatus === 'paid').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
          <p className="text-gray-200">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-950 border border-red-200 rounded-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-bold">Error Loading Orders</h2>
          </div>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchAllOrders}
            className="w-full py-2 bg-pink-300 text-white rounded font-medium hover:bg-pink-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Order Management</h1>
            <p className="text-gray-200">Manage and track all customer orders</p>
          </div>
          <button
            onClick={fetchAllOrders}
            className="px-4 py-2 bg-pink-300 text-white rounded font-medium hover:bg-pink-400 flex items-center gap-2"
          >
            <Clock size={18} />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-950 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-gray-100">{stats.total}</p>
              </div>
              <Package className="text-pink-300" size={32} />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200 mb-1">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <Check className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-200 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-100">₦{(stats.totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <DollarSign className="text-pink-300" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-950 rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Search Orders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="Search by order number, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300 text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Order Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300 text-gray-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payment Status</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300 text-gray-500"
              >
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Date Filter */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                dateFilter === 'all'
                  ? 'bg-pink-300 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('today')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                dateFilter === 'today'
                  ? 'bg-pink-300 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                dateFilter === 'week'
                  ? 'bg-pink-300 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                dateFilter === 'month'
                  ? 'bg-pink-300 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-950 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-950 divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Package className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-200 font-medium">No orders found</p>
                      <p className="text-sm text-gray-300 mt-1">
                        {orders.length === 0 
                          ? 'There are no orders in the system yet.'
                          : 'Try adjusting your filters to see more results.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-100">{order.orderNumber}</div>
                        <div className="text-xs text-gray-200">{order.items?.length || 0} items</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-100">
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </div>
                        <div className="text-xs text-gray-200">{order.shippingAddress?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-100">
                        ₦{order.total?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPaymentBadge(order.paymentStatus)}`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="text-pink-300 hover:text-pink-400 font-medium flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/70  flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-950 rounded-lg max-w-4xl w-full my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-100">Order Details</h2>
                  <p className="text-sm text-gray-200 mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-300 hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Status and Payment Update */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Status
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.userId, selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => updatePaymentStatus(selectedOrder.userId, selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-slate-800 rounded-lg border border-gray-200 p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <User size={20} className="text-pink-300" />
                    Customer Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-200">Name</p>
                      <p className="text-sm font-medium text-gray-100">
                        {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 flex items-center gap-1">
                        <Mail size={14} /> Email
                      </p>
                      <p className="text-sm font-medium text-gray-100">{selectedOrder.shippingAddress?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200 flex items-center gap-1">
                        <Phone size={14} /> Phone
                      </p>
                      <p className="text-sm font-medium text-gray-100">{selectedOrder.shippingAddress?.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-200">Order Date</p>
                      <p className="text-sm font-medium text-gray-100">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-slate-800 rounded-lg border border-gray-200 p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <MapPin size={20} className="text-pink-300" />
                    Shipping Address
                  </h3>
                  <p className="text-sm text-gray-100">
                    {selectedOrder.shippingAddress?.address}<br />
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                    {selectedOrder.shippingAddress?.zipCode && `${selectedOrder.shippingAddress.zipCode}, `}
                    {selectedOrder.shippingAddress?.country}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-sm text-gray-200">Shipping Method</p>
                    <p className="text-sm font-medium text-gray-100 capitalize">
                      {selectedOrder.shippingMethod?.replace('_', ' ')} - ₦{selectedOrder.shippingCost?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-slate-800 rounded-lg border border-gray-200 p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <CreditCard size={20} className="text-pink-300" />
                    Payment Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-200">Payment Method</p>
                      <p className="text-sm font-medium text-gray-100 capitalize">
                        {selectedOrder.paymentMethod?.replace('_', ' ')}
                      </p>
                    </div>
                    {selectedOrder.paymentReference && (
                      <div>
                        <p className="text-sm text-gray-200">Payment Reference</p>
                        <p className="text-sm font-medium text-gray-100">{selectedOrder.paymentReference}</p>
                      </div>
                    )}
                    {selectedOrder.orderOtp && (
                      <div>
                        <p className="text-sm text-gray-200">Order OTP</p>
                        <p className="text-sm font-bold text-pink-300">{selectedOrder.orderOtp}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex gap-4 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-100">{item.name}</h4>
                          <p className="text-xs text-gray-200">Size: {item.size}</p>
                          <p className="text-xs text-gray-200">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-gray-100 mt-1">
                            ₦{item.price?.toLocaleString()} × {item.quantity} = ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-800 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-200">Subtotal</span>
                      <span className="font-medium text-gray-100">₦{selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-200">Shipping</span>
                      <span className="font-medium text-gray-100">₦{selectedOrder.shippingCost?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-200">Tax (7.5% VAT)</span>
                      <span className="font-medium text-gray-100">₦{selectedOrder.tax?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                      <span className="text-gray-100">Total</span>
                      <span className="text-pink-300">₦{selectedOrder.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-slate-800 rounded-b-lg">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-6 py-2 border border-gray-300 rounded text-gray-300 font-medium hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-pink-300 rounded text-white font-medium hover:bg-pink-400"
                >
                  Print Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;