import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc, where } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import { Package, Search, Filter, Eye, Truck, Clock, CheckCircle, XCircle, Phone, Mail, MapPin, Calendar, CreditCard, User } from 'lucide-react';

import { getAllOrders, updateOrderStatus as updateOrderStatusService, updatePaymentStatus as updatePaymentStatusService } from '../Firebase/orderServices';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchAllOrders();
  }, []);

const fetchAllOrders = async () => {
  try {
    setLoading(true);
    console.log('Starting to fetch all orders...');
    
    // Use the new getAllOrders function
    const allOrders = await getAllOrders();
    console.log('Raw orders fetched:', allOrders);
    console.log('Number of orders:', allOrders.length);
    
    // Format dates
    const formattedOrders = allOrders.map(order => ({
      ...order,
      createdAt: order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || Date.now()),
      updatedAt: order.updatedAt?.toDate ? order.updatedAt.toDate() : (order.updatedAt ? new Date(order.updatedAt) : null)
    }));
    
    console.log('Formatted orders:', formattedOrders);
    
    // Sort by date (most recent first)
    formattedOrders.sort((a, b) => b.createdAt - a.createdAt);
    
    setOrders(formattedOrders);
    console.log('Orders set to state');
  } catch (error) {
    console.error('Error fetching orders:', error);
    alert('Failed to load orders: ' + error.message);
  } finally {
    setLoading(false);
  }
};

const updateOrderStatus = async (userId, orderId, newStatus) => {
  const result = await updateOrderStatusService(userId, orderId, newStatus);
  
  if (result.success) {
    // Update local state
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    
    alert('Order status updated successfully');
  } else {
    alert('Failed to update order status');
  }
};


const updatePaymentStatus = async (userId, orderId, newPaymentStatus) => {
  const result = await updatePaymentStatusService(userId, orderId, newPaymentStatus, null);
  
  if (result.success) {
    // Update local state
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
    ));
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: newPaymentStatus });
    }
    
    alert('Payment status updated successfully');
  } else {
    alert('Failed to update payment status');
  }
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filterOrders = () => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.phone?.includes(searchTerm) ||
        `${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
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
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    return filtered;
  };

  const filteredOrders = filterOrders();

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800 p-4 border border-pink-500 text-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Total Orders</span>
              <Package className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Pending</span>
              <Clock className="text-yellow-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Processing</span>
              <Package className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Shipped</span>
              <Truck className="text-purple-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Delivered</span>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-pink-300 to-pink-400 p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Revenue (Paid Orders)</p>
              <p className="text-3xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <CreditCard size={40} className="opacity-80" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900 border border-pink-500 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-pink-500 focus:outline-none 
                text-white focus:border-pink-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-pink-500 focus:outline-none
               focus:border-pink-300"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 border border-pink-500 focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-pink-500 focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p className="font-medium">
                            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{order.shippingAddress?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {order.items?.length || 0} items
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₦{(order.total || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(order.status)}`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-pink-300 hover:text-pink-400 font-medium text-sm"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Order Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Order Number */}
                  <div className="bg-gray-50 p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-lg font-bold text-gray-900">{selectedOrder.orderNumber}</p>
                  </div>

                  {/* Order OTP */}
                  {/* {selectedOrder.orderOtp && (
                    <div className="bg-pink-50 p-4 border-2 border-pink-300">
                      <p className="text-sm text-gray-600 mb-1">Order OTP</p>
                      <p className="text-2xl font-bold text-pink-300 tracking-widest">{selectedOrder.orderOtp}</p>
                    </div>
                  )} */}

                  {/* Customer Info */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User size={18} className="text-pink-300" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900">
                        <span className="font-medium">Name:</span> {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
                      </p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {selectedOrder.shippingAddress?.email}
                      </p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {selectedOrder.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin size={18} className="text-pink-300" />
                      Shipping Address
                    </h4>
                    <div className="text-sm text-gray-900">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                      {selectedOrder.shippingAddress?.zipCode && (
                        <p>Zip: {selectedOrder.shippingAddress.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Order Status */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Order Status</h4>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.userId, selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-pink-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Status</h4>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => updatePaymentStatus(selectedOrder.userId, selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-pink-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Payment Info */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard size={18} className="text-pink-300" />
                      Payment Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900">
                        <span className="font-medium">Method:</span> {selectedOrder.paymentMethod === 'card' ? 'Credit/Debit Card' : selectedOrder.paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash on Delivery'}
                      </p>
                      {selectedOrder.paymentReference && (
                        <p className="text-gray-900">
                          <span className="font-medium">Reference:</span> {selectedOrder.paymentReference}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Truck size={18} className="text-pink-300" />
                      Shipping Method
                    </h4>
                    <p className="text-sm text-gray-900">
                      {selectedOrder.shippingMethod === 'express' ? 'Express Delivery (2-3 days)' : 'Standard Delivery (5-7 days)'}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar size={18} className="text-pink-300" />
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-900">
                        <span className="font-medium">Ordered:</span> {selectedOrder.createdAt.toLocaleString()}
                      </p>
                   {selectedOrder.updatedAt && (
  <p className="text-gray-900">
    <span className="font-medium">Last Updated:</span>{' '}
    {selectedOrder.updatedAt instanceof Date 
      ? selectedOrder.updatedAt.toLocaleString() 
      : new Date(selectedOrder.updatedAt).toLocaleString()}
  </p>
)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover border border-gray-300"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">Size: {item.size}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">₦{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-gray-900">₦{(selectedOrder.shippingCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium text-gray-900">₦{(selectedOrder.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-gray-900">₦{(selectedOrder.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;