import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, Calendar, ShoppingBag, CreditCard, Eye, Trash2, Lock, Unlock, UserCheck, UserX, TrendingUp, Filter } from 'lucide-react';

// Mock Data
const MOCK_ADDRESSES = [
  { label: 'Home', address: '15 Victoria Island Road', city: 'Lagos', state: 'Lagos State', phone: '+234 801 234 5678' },
  { label: 'Office', address: '42 Admiralty Way, Lekki Phase 1', city: 'Lagos', state: 'Lagos State', phone: '+234 802 345 6789' },
  { label: 'Home', address: '28 Wuse Zone 5', city: 'Abuja', state: 'FCT', phone: '+234 803 456 7890' },
  { label: 'Work', address: '67 Independence Layout', city: 'Enugu', state: 'Enugu State', phone: '+234 804 567 8901' },
  { label: 'Home', address: '91 Ring Road', city: 'Ibadan', state: 'Oyo State', phone: '+234 805 678 9012' }
];

const generateMockCustomers = () => {
  const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Jessica', 'Daniel', 'Amanda', 'Christopher', 'Jennifer', 'Matthew', 'Ashley', 'Joshua', 'Stephanie', 'Andrew', 'Elizabeth', 'Ryan', 'Nicole', 'Brandon'];
  const lastNames = ['Johnson', 'Chen', 'Rodriguez', 'Okonkwo', 'Anderson', 'Wilson', 'Martinez', 'Adebayo', 'Brown', 'Davis', 'Garcia', 'Miller', 'Taylor', 'Okeke', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson'];
  
  const authMethods = ['email', 'google', 'facebook'];
  const statuses = ['active', 'active', 'active', 'active', 'blocked']; // More active than blocked
  
  const customers = [];
  const now = new Date();
  
  for (let i = 0; i < 35; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const authMethod = authMethods[Math.floor(Math.random() * authMethods.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 365);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    const email = authMethod === 'google' 
      ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`
      : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    
    const photoURL = authMethod !== 'email' 
      ? `https://i.pravatar.cc/150?img=${i + 1}`
      : null;
    
    const hasOrders = Math.random() > 0.3; // 70% have made orders
    const orderCount = hasOrders ? Math.floor(Math.random() * 12) + 1 : 0;
    const totalSpent = hasOrders ? (Math.floor(Math.random() * 150000) + 5000) : 0;
    
    const numAddresses = Math.floor(Math.random() * 3) + 1;
    const addresses = [];
    for (let j = 0; j < numAddresses; j++) {
      const addressTemplate = MOCK_ADDRESSES[Math.floor(Math.random() * MOCK_ADDRESSES.length)];
      addresses.push({
        id: `addr_${i}_${j}`,
        name: `${firstName} ${lastName}`,
        ...addressTemplate,
        isDefault: j === 0
      });
    }
    
    const lastOrderDate = hasOrders 
      ? new Date(now.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
      : null;
    
    customers.push({
      id: `customer_${i + 1}`,
      displayName: `${firstName} ${lastName}`,
      email,
      phoneNumber: `+234 ${Math.floor(800 + Math.random() * 99)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`,
      photoURL,
      authMethod,
      status,
      createdAt,
      orderCount,
      totalSpent,
      addresses,
      lastOrderDate
    });
  }
  
  return customers.sort((a, b) => b.createdAt - a.createdAt);
};

const generateMockOrders = (customerId, orderCount) => {
  const orders = [];
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const now = new Date();
  
  const products = [
    { name: 'Cute Pink Dress', price: 8500 },
    { name: 'Blue Denim Jacket', price: 12000 },
    { name: 'Rainbow T-Shirt', price: 4500 },
    { name: 'Yellow Summer Shorts', price: 5500 },
    { name: 'Striped Cotton Shirt', price: 6000 }
  ];
  
  for (let i = 0; i < orderCount; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const numItems = Math.floor(Math.random() * 3) + 1;
    
    let total = 0;
    const items = [];
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      items.push({ ...product, quantity });
      total += product.price * quantity;
    }
    
    total += 1500; // Add shipping
    
    orders.push({
      id: `order_${customerId}_${i}`,
      orderNumber: `KID-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      createdAt,
      status,
      total,
      items
    });
  }
  
  return orders.sort((a, b) => b.createdAt - a.createdAt);
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [authMethodFilter, setAuthMethodFilter] = useState('all');
  const [customerOrders, setCustomerOrders] = useState([]);

  useEffect(() => {
    fetchAllCustomers();
  }, []);

  const fetchAllCustomers = () => {
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockCustomers = generateMockCustomers();
      setCustomers(mockCustomers);
      setLoading(false);
    }, 800);
  };

  const fetchCustomerOrders = (customer) => {
    const orders = generateMockOrders(customer.id, customer.orderCount);
    setCustomerOrders(orders);
  };

  const toggleCustomerStatus = (customerId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    setCustomers(customers.map(customer => 
      customer.id === customerId ? { ...customer, status: newStatus } : customer
    ));
    
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer({ ...selectedCustomer, status: newStatus });
    }
    
    alert(`Customer ${newStatus === 'blocked' ? 'blocked' : 'activated'} successfully`);
  };

  const deleteCustomer = (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }
    
    setCustomers(customers.filter(customer => customer.id !== customerId));
    setShowCustomerModal(false);
    alert('Customer deleted successfully');
  };

  const getAuthMethod = (customer) => {
    return customer.authMethod;
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => 
        (customer.status || 'active') === statusFilter
      );
    }

    // Auth method filter
    if (authMethodFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const authMethod = getAuthMethod(customer);
        return authMethod === authMethodFilter;
      });
    }

    return filtered;
  };

  const filteredCustomers = filterCustomers();

  // Statistics
  const stats = {
    total: customers.length,
    active: customers.filter(c => (c.status || 'active') === 'active').length,
    blocked: customers.filter(c => c.status === 'blocked').length,
    withOrders: customers.filter(c => c.orderCount > 0).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    avgOrderValue: customers.filter(c => c.orderCount > 0).length > 0
      ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / 
        customers.filter(c => c.orderCount > 0).reduce((sum, c) => sum + c.orderCount, 0)
      : 0,
    emailSignups: customers.filter(c => c.authMethod === 'email').length,
    googleSignups: customers.filter(c => c.authMethod === 'google').length,
    facebookSignups: customers.filter(c => c.authMethod === 'facebook').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
          <p className="text-gray-100">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-300 mb-2">Customer Management</h1>
          <p className="text-gray-100">View and manage all registered customers</p>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-950 rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-100">Total Customers</span>
              <Users className="text-gray-400" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-300">{stats.total}</p>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp size={12} className="inline mr-1" />
              {stats.active} active
            </p>
          </div>
          
          <div className="bg-slate-950 rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-100">Customers with Orders</span>
              <ShoppingBag className="text-purple-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.withOrders}</p>
            <p className="text-xs text-gray-100 mt-1">
              {((stats.withOrders / stats.total) * 100).toFixed(1)}% conversion
            </p>
          </div>
          
          <div className="bg-slate-950 rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-100">Total Revenue</span>
              <CreditCard className="text-green-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-green-600">₦{(stats.totalRevenue / 1000).toFixed(1)}k</p>
            <p className="text-xs text-gray-100 mt-1">
              From all customers
            </p>
          </div>
          
          <div className="bg-slate-950 rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-100">Avg Order Value</span>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <p className="text-3xl font-bold text-blue-600">₦{(stats.avgOrderValue / 1000).toFixed(1)}k</p>
            <p className="text-xs text-gray-100 mt-1">
              Per order average
            </p>
          </div>
        </div>

        {/* Auth Method Statistics */}
        <div className="bg-slate-950 rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Sign-up Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm text-gray-100 mb-1">Email Sign-ups</p>
                <p className="text-2xl font-bold text-blue-600">{stats.emailSignups}</p>
              </div>
              <Mail className="text-blue-500" size={32} />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-red-200">
              <div>
                <p className="text-sm text-gray-100 mb-1">Google Sign-ups</p>
                <p className="text-2xl font-bold text-red-600">{stats.googleSignups}</p>
              </div>
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-indigo-200">
              <div>
                <p className="text-sm text-gray-100 mb-1">Facebook Sign-ups</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.facebookSignups}</p>
              </div>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-950 rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Auth Method Filter */}
            <select
              value={authMethodFilter}
              onChange={(e) => setAuthMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Auth Methods</option>
              <option value="email">Email</option>
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-slate-950 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-100">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Total Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-100 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-900">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {customer.photoURL ? (
                            <img
                              src={customer.photoURL}
                              alt={customer.displayName}
                              className="w-10 h-10 rounded-full border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                              <Users className="text-pink-300" size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-300">{customer.displayName || 'No Name'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          {customer.email && (
                            <p className="text-gray-300 flex items-center gap-1">
                              <Mail size={14} className="text-gray-400" />
                              {customer.email}
                            </p>
                          )}
                          {customer.phoneNumber && (
                            <p className="text-gray-100 flex items-center gap-1 text-xs mt-1">
                              <Phone size={12} className="text-gray-400" />
                              {customer.phoneNumber}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-100">
                        {customer.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-300">
                        {customer.orderCount || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-300">
                        ₦{(customer.totalSpent || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          (customer.status || 'active') === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(customer.status || 'active') === 'active' ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              fetchCustomerOrders(customer);
                              setShowCustomerModal(true);
                            }}
                            className="text-pink-300 hover:text-pink-400"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => toggleCustomerStatus(customer.id, customer.status || 'active')}
                            className={`${
                              (customer.status || 'active') === 'active' 
                                ? 'text-red-500 hover:text-red-600' 
                                : 'text-green-500 hover:text-green-600'
                            }`}
                            title={(customer.status || 'active') === 'active' ? 'Block Customer' : 'Activate Customer'}
                          >
                            {(customer.status || 'active') === 'active' ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-950 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-950 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold text-gray-300">Customer Details</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-100 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
                {selectedCustomer.photoURL ? (
                  <img
                    src={selectedCustomer.photoURL}
                    alt={selectedCustomer.displayName}
                    className="w-24 h-24 rounded-full border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center border-4 border-gray-200">
                    <Users className="text-pink-300" size={40} />
                  </div>
                )}
                
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-300 mb-2">
                    {selectedCustomer.displayName || 'No Name'}
                  </h4>
                  
                  <div className="space-y-2 mb-4">
                    {selectedCustomer.email && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        {selectedCustomer.email}
                      </p>
                    )}
                    {selectedCustomer.phoneNumber && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        {selectedCustomer.phoneNumber}
                      </p>
                    )}
                    <p className="text-gray-700 flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      Joined: {selectedCustomer.createdAt.toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${
                      (selectedCustomer.status || 'active') === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(selectedCustomer.status || 'active') === 'active' ? 'Active' : 'Blocked'}
                    </span>
                    
                    <span className="px-3 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800 capitalize">
                      {selectedCustomer.authMethod} Auth
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-lg border border-purple-200 p-4 text-center">
                  <ShoppingBag className="mx-auto text-purple-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-purple-600">{selectedCustomer.orderCount || 0}</p>
                  <p className="text-xs text-gray-100">Total Orders</p>
                </div>
                
                <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
                  <CreditCard className="mx-auto text-green-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-green-600">₦{(selectedCustomer.totalSpent || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-100">Total Spent</p>
                </div>
                
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
                  <MapPin className="mx-auto text-blue-500 mb-2" size={24} />
                  <p className="text-2xl font-bold text-blue-600">{selectedCustomer.addresses?.length || 0}</p>
                  <p className="text-xs text-gray-100">Saved Addresses</p>
                </div>
              </div>

              {/* Saved Addresses */}
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <MapPin size={18} className="text-pink-300" />
                    Saved Addresses
                  </h4>
                  <div className="space-y-3">
                    {selectedCustomer.addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4 bg-slate-900">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-300">{address.label}</span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-pink-300 text-white text-xs font-medium rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 font-medium">{address.name}</p>
                        <p className="text-sm text-gray-100">{address.address}</p>
                        <p className="text-sm text-gray-100">{address.city}, {address.state}</p>
                        <p className="text-sm text-gray-100">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-pink-300" />
                  Recent Orders
                </h4>
                {customerOrders.length === 0 ? (
                  <p className="text-gray-100 text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-slate-900">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-300">{order.orderNumber}</p>
                            <p className="text-xs text-gray-100">{order.createdAt.toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-300">₦{(order.total || 0).toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-100">{order.items?.length || 0} items</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => toggleCustomerStatus(selectedCustomer.id, selectedCustomer.status || 'active')}
                  className={`flex-1 px-4 py-2 font-medium rounded flex items-center justify-center gap-2 ${
                    (selectedCustomer.status || 'active') === 'active'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {(selectedCustomer.status || 'active') === 'active' ? (
                    <>
                      <Lock size={18} />
                      Block Customer
                    </>
                  ) : (
                    <>
                      <Unlock size={18} />
                      Activate Customer
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => deleteCustomer(selectedCustomer.id)}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-medium rounded flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;