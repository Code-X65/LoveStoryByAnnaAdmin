import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';
import { Truck, Search, Package, MapPin, Clock, CheckCircle, AlertCircle, Phone, Mail, Calendar, Eye, Download } from 'lucide-react';

const Shipping = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    fetchAllShipments();
  }, []);

  const fetchAllShipments = async () => {
    try {
      setLoading(true);
      const allShipments = [];
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // For each user, get their orders that need shipping
      for (const userDoc of usersSnapshot.docs) {
        const ordersRef = collection(db, 'users', userDoc.id, 'orders');
        const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        
        ordersSnapshot.forEach(orderDoc => {
          const data = orderDoc.data();
          // Only include orders that are processing, shipped, or delivered
          if (['processing', 'shipped', 'delivered'].includes(data.status)) {
            allShipments.push({
              id: orderDoc.id,
              userId: userDoc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt ? new Date(data.updatedAt) : null),
              shippedAt: data.shippedAt?.toDate ? data.shippedAt.toDate() : (data.shippedAt ? new Date(data.shippedAt) : null),
              deliveredAt: data.deliveredAt?.toDate ? data.deliveredAt.toDate() : (data.deliveredAt ? new Date(data.deliveredAt) : null)
            });
          }
        });
      }
      
      setShipments(allShipments);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      alert('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const updateShipmentStatus = async (userId, orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date()
      };

      // Add timestamp for shipped/delivered status
      if (newStatus === 'shipped' && !selectedShipment.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (newStatus === 'delivered' && !selectedShipment.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      await updateDoc(orderRef, updateData);
      
      // Update local state
      setShipments(shipments.map(shipment => 
        shipment.id === orderId ? { ...shipment, ...updateData } : shipment
      ));
      
      if (selectedShipment?.id === orderId) {
        setSelectedShipment({ ...selectedShipment, ...updateData });
      }
      
      alert('Shipment status updated successfully');
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert('Failed to update shipment status');
    }
  };

  const addTrackingNumber = async (userId, orderId, tracking) => {
    try {
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      await updateDoc(orderRef, {
        trackingNumber: tracking,
        updatedAt: new Date()
      });
      
      // Update local state
      setShipments(shipments.map(shipment => 
        shipment.id === orderId ? { ...shipment, trackingNumber: tracking } : shipment
      ));
      
      if (selectedShipment?.id === orderId) {
        setSelectedShipment({ ...selectedShipment, trackingNumber: tracking });
      }
      
      setTrackingNumber('');
      alert('Tracking number added successfully');
    } catch (error) {
      console.error('Error adding tracking number:', error);
      alert('Failed to add tracking number');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const filterShipments = () => {
    let filtered = shipments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.shippingAddress?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${shipment.shippingAddress?.firstName} ${shipment.shippingAddress?.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    // Method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.shippingMethod === methodFilter);
    }

    return filtered;
  };

  const filteredShipments = filterShipments();

  // Statistics
  const stats = {
    total: shipments.length,
    processing: shipments.filter(s => s.status === 'processing').length,
    shipped: shipments.filter(s => s.status === 'shipped').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    needsTracking: shipments.filter(s => !s.trackingNumber && s.status === 'shipped').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-300 mx-auto mb-4"></div>
          <p className="text-white">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Shipping Management</h1>
          <p className="text-gray-400">Track and manage all shipments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Total Shipments</span>
              <Package className="text-white" size={20} />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Processing</span>
              <Clock className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.processing}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">In Transit</span>
              <Truck className="text-purple-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.shipped}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Delivered</span>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.delivered}</p>
          </div>
          
          <div className="bg-slate-800 p-4 border border-pink-500 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white">Needs Tracking</span>
              <AlertCircle className="text-yellow-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-yellow-400">{stats.needsTracking}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-pink-500 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by order, tracking, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-pink-500 text-white placeholder-gray-500 focus:outline-none focus:border-pink-300"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-pink-500 text-white focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Status</option>
              <option value="processing">Processing</option>
              <option value="shipped">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>

            {/* Shipping Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-pink-500 text-white focus:outline-none focus:border-pink-300"
            >
              <option value="all">All Methods</option>
              <option value="express">Express Delivery</option>
              <option value="standard">Standard Delivery</option>
            </select>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-slate-800 border border-pink-500 overflow-hidden">
          {filteredShipments.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">No shipments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700 border-b border-pink-500">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Tracking</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-500">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-slate-700">
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {shipment.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        <div>
                          <p className="font-medium">
                            {shipment.shippingAddress?.firstName} {shipment.shippingAddress?.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{shipment.shippingAddress?.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        <div>
                          <p>{shipment.shippingAddress?.city}</p>
                          <p className="text-xs text-gray-400">{shipment.shippingAddress?.state}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {shipment.shippingMethod === 'express' ? 'Express' : 'Standard'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {shipment.trackingNumber ? (
                          <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded border border-pink-500">
                            {shipment.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-yellow-400 text-xs">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(shipment.status)}`}>
                          {shipment.status === 'processing' ? 'Processing' : 
                           shipment.status === 'shipped' ? 'In Transit' : 'Delivered'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedShipment(shipment);
                            setShowShipmentModal(true);
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

      {/* Shipment Detail Modal */}
      {showShipmentModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-pink-500">
            <div className="sticky top-0 bg-slate-700 border-b border-pink-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Shipment Details</h3>
              <button
                onClick={() => setShowShipmentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Shipment Info Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Order Info */}
                  <div className="bg-slate-900 p-4 border border-pink-500">
                    <p className="text-sm text-gray-400 mb-1">Order Number</p>
                    <p className="text-lg font-bold text-white">{selectedShipment.orderNumber}</p>
                  </div>

                  {/* Customer Info */}
                  <div className="border border-pink-500 p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Package size={18} className="text-pink-300" />
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="font-medium">Name:</span> {selectedShipment.shippingAddress?.firstName} {selectedShipment.shippingAddress?.lastName}
                      </p>
                      <p className="text-white flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {selectedShipment.shippingAddress?.email}
                      </p>
                      <p className="text-white flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {selectedShipment.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border border-pink-500 p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <MapPin size={18} className="text-pink-300" />
                      Delivery Address
                    </h4>
                    <div className="text-sm text-white">
                      <p>{selectedShipment.shippingAddress?.address}</p>
                      <p>{selectedShipment.shippingAddress?.city}, {selectedShipment.shippingAddress?.state}</p>
                      <p>{selectedShipment.shippingAddress?.country}</p>
                      {selectedShipment.shippingAddress?.zipCode && (
                        <p>Zip: {selectedShipment.shippingAddress.zipCode}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Shipment Status */}
                  <div className="border border-pink-500 p-4">
                    <h4 className="font-semibold text-white mb-3">Update Status</h4>
                    <select
                      value={selectedShipment.status}
                      onChange={(e) => updateShipmentStatus(selectedShipment.userId, selectedShipment.id, e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-pink-500 text-white focus:outline-none focus:border-pink-300"
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>

                  {/* Tracking Number */}
                  <div className="border border-pink-500 p-4">
                    <h4 className="font-semibold text-white mb-3">Tracking Number</h4>
                    {selectedShipment.trackingNumber ? (
                      <div className="bg-slate-900 p-3 border border-pink-500">
                        <p className="font-mono text-white text-lg">{selectedShipment.trackingNumber}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-pink-500 text-white focus:outline-none focus:border-pink-300"
                        />
                        <button
                          onClick={() => addTrackingNumber(selectedShipment.userId, selectedShipment.id, trackingNumber)}
                          disabled={!trackingNumber}
                          className="w-full bg-pink-300 text-white px-4 py-2 hover:bg-pink-400 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                          Add Tracking Number
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shipping Method */}
                  <div className="border border-pink-500 p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Truck size={18} className="text-pink-300" />
                      Shipping Method
                    </h4>
                    <p className="text-sm text-white">
                      {selectedShipment.shippingMethod === 'express' ? 'Express Delivery (2-3 days)' : 'Standard Delivery (5-7 days)'}
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="border border-pink-500 p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar size={18} className="text-pink-300" />
                      Timeline
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-white">
                        <span className="font-medium">Ordered:</span> {selectedShipment.createdAt.toLocaleString()}
                      </p>
                      {selectedShipment.shippedAt && (
                        <p className="text-white">
                          <span className="font-medium">Shipped:</span> {selectedShipment.shippedAt.toLocaleString()}
                        </p>
                      )}
                      {selectedShipment.deliveredAt && (
                        <p className="text-white">
                          <span className="font-medium">Delivered:</span> {selectedShipment.deliveredAt.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Items */}
              <div className="border border-pink-500 p-4">
                <h4 className="font-semibold text-white mb-4">Package Contents</h4>
                <div className="space-y-3">
                  {selectedShipment.items?.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-slate-900 border border-pink-500">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover border border-pink-500"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{item.name}</h5>
                        <p className="text-sm text-gray-400">Size: {item.size}</p>
                        <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;