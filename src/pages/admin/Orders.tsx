import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Eye, Filter, X, 
  ChevronDown, ChevronUp, 
  Package, Truck, CheckCircle, 
  Clock, AlertCircle, RefreshCw,
  Download, Printer, CheckSquare, Square
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order } from '../../types/order';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminOrders: React.FC = () => {
  const { formatPrice } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');
  const [statusNote, setStatusNote] = useState('');
  const [sortField, setSortField] = useState<keyof Order>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Order['status']>('processing');
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  // ----- Load Orders (async) -----
  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await orderService.getAll();
      console.log('📦 Loaded orders:', allOrders.length);
      setOrders(allOrders);
      setFilteredOrders(allOrders);
      
      // Update stats via API
      const statsData = await orderService.getStatistics();
      setStats({
        total: statsData.total || allOrders.length,
        pending: statsData.pending || 0,
        processing: statsData.processing || 0,
        shipped: statsData.shipped || 0,
        delivered: statsData.delivered || 0,
        cancelled: statsData.cancelled || 0,
        refunded: statsData.refunded || 0,
      });
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // ----- Filter & Sort -----
  useEffect(() => {
    let result = [...orders];
    
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(term) ||
        (o.guestEmail && o.guestEmail.toLowerCase().includes(term)) ||
        o.shippingAddress?.email?.toLowerCase().includes(term) ||
        o.shippingAddress?.firstName?.toLowerCase().includes(term) ||
        o.shippingAddress?.lastName?.toLowerCase().includes(term) ||
        o.items.some(item => item.name.toLowerCase().includes(term))
      );
    }
    
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }
      return 0;
    });
    
    setFilteredOrders(result);
  }, [orders, searchTerm, filterStatus, sortField, sortDirection]);

  // ----- Bulk Status Update -----
  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0) {
      toast.error('No orders selected');
      return;
    }
    
    if (window.confirm(`Update ${selectedOrders.length} orders to ${bulkStatus}?`)) {
      let successCount = 0;
      for (const id of selectedOrders) {
        try {
          const updated = await orderService.updateStatus(id, bulkStatus, `Bulk update to ${bulkStatus}`);
          if (updated) successCount++;
        } catch (e) {
          console.error('Failed to update order', id);
        }
      }
      
      toast.success(`${successCount} orders updated to ${bulkStatus}`);
      setSelectedOrders([]);
      setShowBulkUpdate(false);
      await loadOrders();
    }
  };

  // ----- Toggle Selection -----
  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oid => oid !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  // ----- Status Badges -----
  const getStatusBadge = (status: Order['status']) => {
    const config = {
      pending: { color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', icon: Clock },
      processing: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', icon: RefreshCw },
      shipped: { color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', icon: Truck },
      delivered: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      cancelled: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: AlertCircle },
      refunded: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', icon: Package },
    };
    const { color, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const config = {
      pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
      paid: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      failed: 'text-red-600 bg-red-100 dark:bg-red-900/30',
      refunded: 'text-gray-600 bg-gray-100 dark:bg-gray-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${config[status] || config.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ----- View Order -----
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // ----- Status Update (single) -----
  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder) return;
    
    try {
      const updated = await orderService.updateStatus(selectedOrder.id, newStatus, statusNote);
      if (updated) {
        toast.success(`Order status updated to ${newStatus}`);
        await loadOrders();
        setShowStatusModal(false);
        if (showDetailsModal) {
          setSelectedOrder(updated);
        }
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // ----- Sort -----
  const toggleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ----- Format Date -----
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ----- Loading State -----
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage all customer orders ({filteredOrders.length} orders)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadOrders}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(orders, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders_export_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Orders exported!');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-purple-600">{stats.shipped}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Shipped</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-600">{stats.refunded}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Refunded</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by ID, customer, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-pink-800 dark:text-pink-300">
                {selectedOrders.length} orders selected
              </span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value as Order['status'])}
                className="px-3 py-2 border border-pink-300 dark:border-pink-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none text-sm"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition text-sm font-medium"
              >
                Update Status
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {selectedOrders.length === filteredOrders.length && filteredOrders.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('id')}>
                    Order ID {sortField === 'id' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('createdAt')}>
                    Date {sortField === 'createdAt' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('total')}>
                    Total {sortField === 'total' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('status')}>
                    Status {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No orders found</p>
                      <p className="text-sm mt-1">Orders will appear here once customers place them</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelectOrder(order.id)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          {selectedOrders.includes(order.id) ? (
                            <CheckSquare className="w-4 h-4 text-pink-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">
                          #{order.id.substring(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.shippingAddress?.firstName || 'Customer'} {order.shippingAddress?.lastName || ''}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.isGuest ? '👤 Guest' : '👤 User'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View order"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(order)}
                            className="p-1.5 text-gray-400 hover:text-purple-600 transition rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title="Update status"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer with count */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>
        </div>

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Order #{selectedOrder.id.substring(0, 8)}
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Order Status */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  {getStatusBadge(selectedOrder.status)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                            {item.size && <span className="ml-2">Size: {item.size}</span>}
                            {item.color && <span className="ml-2">Color: {item.color}</span>}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Shipping</span>
                        <span>{selectedOrder.shipping === 0 ? 'Free' : formatPrice(selectedOrder.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Tax</span>
                        <span>{formatPrice(selectedOrder.tax)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-white border-t pt-2">
                        <span>Total</span>
                        <span className="text-pink-600">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Customer Info</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p><strong>Name:</strong> {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                      <p><strong>Email:</strong> {selectedOrder.shippingAddress?.email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                      {selectedOrder.isGuest && <p><strong>Type:</strong> Guest</p>}
                    </div>
                  </div>
                </div>

                {/* Shipping & Billing Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                      <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                      {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}</p>
                      <p>{selectedOrder.shippingAddress?.country}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Billing Address</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>{selectedOrder.billingAddress?.firstName} {selectedOrder.billingAddress?.lastName}</p>
                      <p>{selectedOrder.billingAddress?.addressLine1}</p>
                      {selectedOrder.billingAddress?.addressLine2 && <p>{selectedOrder.billingAddress.addressLine2}</p>}
                      <p>{selectedOrder.billingAddress?.city}, {selectedOrder.billingAddress?.state} {selectedOrder.billingAddress?.postalCode}</p>
                      <p>{selectedOrder.billingAddress?.country}</p>
                    </div>
                  </div>
                </div>

                {selectedOrder.orderNotes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Notes</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {selectedOrder.orderNotes}
                    </p>
                  </div>
                )}

                {selectedOrder.trackingNumber && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tracking Number</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Update Order Status</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Order #{selectedOrder.id.substring(0, 8)} - Current status: {selectedOrder.status}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Order['status'])}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Note (optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status update..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition font-medium"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;