import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Modal from '../components/Modal';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { UserPlus, Pencil, Trash2, Search, Mail, Phone, MapPin } from 'lucide-react';

import toast from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const fetchCustomers = React.useCallback(async () => {
    try {
      const res = await axios.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingCustomer ? 'Updating customer...' : 'Creating customer...');
    try {
      if (editingCustomer) {
        await axios.put(`/customers/${editingCustomer.id}`, formData);
        toast.success('Customer updated successfully!', { id: loadingToast });
      } else {
        await axios.post('/customers', formData);
        toast.success('Customer created successfully!', { id: loadingToast });
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to save customer', { id: loadingToast });
    }
  };

  const handleEdit = React.useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setIsModalOpen(true);
  }, []);

  const handleDelete = React.useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const loadingToast = toast.loading('Deleting customer...');
      try {
        await axios.delete(`/customers/${id}`);
        toast.success('Customer deleted successfully!', { id: loadingToast });
        fetchCustomers();
      } catch (err) {
        toast.error('Failed to delete customer', { id: loadingToast });
      }
    }
  }, [fetchCustomers]);

  const filteredCustomers = React.useMemo(() => 
    customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [customers, searchQuery]);

  const columns = React.useMemo(() => [
    {
      header: 'User Details',
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 font-bold">
            {c.name.charAt(0)}
          </div>
          <div className="text-white font-medium">{c.name}</div>
        </div>
      )
    },
    {
      header: 'Contact Info',
      render: (c: Customer) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Mail size={14} className="text-slate-500" /> {c.email}
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Phone size={14} className="text-slate-500" /> {c.phone}
          </div>
        </div>
      )
    },
    {
      header: 'Address',
      render: (c: Customer) => (
        <div className="flex items-center gap-2 text-slate-300 text-sm max-w-xs">
          <MapPin size={14} className="text-slate-500 flex-shrink-0" />
          <span className="truncate">{c.address}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'right' as const,
      render: (c: Customer) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleEdit(c)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
            <Pencil size={18} />
          </button>
          <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ], [handleEdit, handleDelete]);

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: '', email: '', phone: '', address: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-blue-600/20"
        >
          <UserPlus size={20} />
          Add Customer
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table 
          data={filteredCustomers} 
          columns={columns} 
          loading={loading} 
          emptyMessage="No customers found." 
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput 
            label="Full Name" 
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput 
              label="Email" 
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormInput 
              label="Phone" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <FormInput 
            label="Address" 
            isTextArea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
              {editingCustomer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;
