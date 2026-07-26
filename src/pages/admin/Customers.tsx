import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Eye, Filter, X, 
  ChevronDown, ChevronUp, 
  Users, User, Mail, Phone, 
  Clock, CheckCircle, AlertCircle, 
  RefreshCw, Download, UserPlus,
  Edit2, Trash2, Star, ShoppingBag
} from 'lucide-react';
import { customerService } from '../../services/customerService';
import { Customer } from '../../types/customer';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

const AdminCustomers: React.FC = () => {
  const { formatPrice } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Customer['status']>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Customer>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    suspendedCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      // Fetch customers from API (no sync needed)
      const allCustomers = await customerService.getAll();
      setCustomers(allCustomers);
      setFilteredCustomers(allCustomers);
      
      // Fetch stats
      const statsData = await customerService.getStats();
      setStats({
        totalCustomers: statsData.totalCustomers || 0,
        activeCustomers: statsData.activeCustomers || 0,
        inactiveCustomers: statsData.inactiveCustomers || 0,
        suspendedCustomers: statsData.suspendedCustomers || 0,
        totalRevenue: statsData.totalRevenue || 0,
        averageOrderValue: statsData.averageOrderValue || 0,
      });
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...customers];
    
    if (filterStatus !== 'all') {
      result = result.filter(c => c.status === filterStatus);
    }
    
    if (filterRole !== 'all') {
      result = result.filter(c => c.role === filterRole);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.first_name.toLowerCase().includes(term) ||
        c.last_name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(term)
      );
    }
    
    // Sorting
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
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    
    setFilteredCustomers(result);
  }, [customers, searchTerm, filterStatus, filterRole, sortField, sortDirection]);

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      active: { color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
      inactive: { color: 'text-gray-600 bg-gray-100 dark:bg-gray-700', icon: Clock },
      suspended: { color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: AlertCircle },
    };
    const { color, icon: Icon } = config[status] || config.active;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { color: string }> = {
      admin: { color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
      user: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    };
    const { color } = config[role] || config.user;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const toggleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // --- Handlers ---
  const handleUpdateStatus = async (id: string, status: Customer['status']) => {
    try {
      await customerService.updateStatus(id, status);
      toast.success('Customer status updated');
      await loadCustomers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage all registered customers ({filteredCustomers.length} customers)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadCustomers}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                const data = JSON.stringify(customers, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `customers_export_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Customers exported!');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 text-gray-700 dark:text-white"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-green-600">{stats.activeCustomers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-gray-600">{stats.inactiveCustomers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Inactive</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-red-600">{stats.suspendedCustomers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Suspended</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-pink-600">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3 text-center border border-gray-200 dark:border-gray-800">
            <p className="text-xl font-bold text-blue-600">{formatPrice(stats.averageOrderValue)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Order</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterRole('all');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('first_name')}>
                    Customer {sortField === 'first_name' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('email')}>
                    Email {sortField === 'email' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('totalOrders')}>
                    Orders {sortField === 'totalOrders' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('totalSpent')}>
                    Spent {sortField === 'totalSpent' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('status')}>
                    Status {sortField === 'status' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200" onClick={() => toggleSort('createdAt')}>
                    Joined {sortField === 'createdAt' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium">No customers found</p>
                      <p className="text-sm mt-1">Customers will appear here once they register</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-semibold text-sm">
                            {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {customer.first_name} {customer.last_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {customer.id.substring(0, 8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3">
                        {getRoleBadge(customer.role)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(customer.id, 'active')}
                            className="p-1.5 text-gray-400 hover:text-green-600 transition rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                            title="Set active"
                          >
                            <CheckCircle className="w-4 h-4" />
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
              Showing {filteredCustomers.length} of {customers.length} customers
            </p>
          </div>
        </div>

        {/* Customer Details Modal */}
        {showDetailsModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Customer Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-white" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-semibold text-2xl">
                    {selectedCustomer.first_name.charAt(0)}{selectedCustomer.last_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedCustomer.status)}
                      {getRoleBadge(selectedCustomer.role)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCustomer.totalOrders}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-600">{formatPrice(selectedCustomer.totalSpent)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedCustomer.addresses?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Addresses</p>
                  </div>
                </div>

                {/* Addresses */}
                {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Saved Addresses</h4>
                    <div className="space-y-2">
                      {selectedCustomer.addresses.map((addr, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">{addr.addressLine1}</p>
                          {addr.addressLine2 && <p className="text-gray-600 dark:text-gray-400">{addr.addressLine2}</p>}
                          <p className="text-gray-600 dark:text-gray-400">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">{addr.country}</p>
                          {addr.isDefault && (
                            <span className="text-xs text-pink-600 dark:text-pink-400">Default</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      toast.success('Customer activity log opened');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                  >
                    View Activity
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Send email to customer');
                    }}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition font-medium"
                  >
                    Send Email
                  </button>
                  <button
                    onClick={async () => {
                      await handleUpdateStatus(selectedCustomer.id, 'suspended');
                      setShowDetailsModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                  >
                    Suspend Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;