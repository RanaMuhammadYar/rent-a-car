import React, { useEffect, useState, useMemo } from 'react';
import axios from '../api/axios';
import Modal from '../components/Modal';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Calendar, Plus, Trash2, Search, User, Car, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Booking {
  id: number;
  customer_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  Customer?: { name: string; email: string };
  Vehicle?: { make: string; model: string; license_plate: string; daily_rate: number };
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    start_date: '',
    end_date: '',
    status: 'pending'
  });

  const fetchData = async () => {
    try {
      const [bookingsRes, customersRes, vehiclesRes] = await Promise.all([
        axios.get('/bookings'),
        axios.get('/customers'),
        axios.get('/vehicles')
      ]);
      setBookings(bookingsRes.data);
      setCustomers(customersRes.data);
      // Load ALL vehicles now so we can check availability by date
      setVehicles(vehiclesRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const overlapBooking = useMemo(() => {
    if (!formData.vehicle_id || !formData.start_date || !formData.end_date) return null;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const vehicleId = parseInt(formData.vehicle_id);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    return bookings.find(b => {
      if (b.vehicle_id !== vehicleId) return false;
      if (b.status === 'cancelled' || b.status === 'completed') return false;

      const bStart = new Date(b.start_date);
      const bEnd = new Date(b.end_date);

      // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
      return start <= bEnd && end >= bStart;
    });
  }, [formData.vehicle_id, formData.start_date, formData.end_date, bookings]);

  // Show warning toast if overlap is detected
  useEffect(() => {
    if (overlapBooking) {
      toast.error(`Vehicle already booked for these dates (${overlapBooking.start_date} to ${overlapBooking.end_date})`, {
        id: 'overlap-error', // Prevent duplicate toasts
      });
    }
  }, [overlapBooking]);

  const calculateTotal = () => {
    if (!formData.start_date || !formData.end_date || !formData.vehicle_id) return 0;
    const vehicle = vehicles.find(v => v.id === parseInt(formData.vehicle_id));
    if (!vehicle) return 0;

    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return diffDays * vehicle.daily_rate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (overlapBooking) {
      toast.error('Cannot book: Vehicle is already reserved for these dates');
      return;
    }

    try {
      await axios.post('/bookings', formData);
      toast.success('Booking created successfully!');
      setIsModalOpen(false);
      setFormData({ customer_id: '', vehicle_id: '', start_date: '', end_date: '', status: 'pending' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error creating booking');
      console.error('Error creating booking', err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await axios.put(`/bookings/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await axios.delete(`/bookings/${id}`);
        toast.success('Booking deleted');
        fetchData();
      } catch (err) {
        toast.error('Failed to delete booking');
        console.error('Error deleting booking', err);
      }
    }
  };

  const filteredBookings = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    return bookings.filter(b => {
      const customerName = b.Customer?.name.toLowerCase() || '';
      const vehicleMake = b.Vehicle?.make.toLowerCase() || '';
      const vehicleModel = b.Vehicle?.model.toLowerCase() || '';
      
      const startDate = new Date(b.start_date);
      const startMonthName = months[startDate.getMonth()];
      const startFormatted = `${b.start_date} ${startMonthName}`;

      const endDate = new Date(b.end_date);
      const endMonthName = months[endDate.getMonth()];
      const endFormatted = `${b.end_date} ${endMonthName}`;

      return customerName.includes(query) ||
             vehicleMake.includes(query) ||
             vehicleModel.includes(query) ||
             startFormatted.toLowerCase().includes(query) ||
             endFormatted.toLowerCase().includes(query);
    });
  }, [bookings, searchQuery]);

  const columns = [
    {
      header: 'Customer',
      render: (b: Booking) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{b.Customer?.name}</span>
          <span className="text-slate-500 text-xs font-normal">{b.Customer?.email}</span>
        </div>
      )
    },
    {
      header: 'Vehicle',
      render: (b: Booking) => (
        <div className="flex flex-col">
          <span className="text-white">{b.Vehicle?.make} {b.Vehicle?.model}</span>
          <span className="text-slate-500 text-xs font-normal">{b.Vehicle?.license_plate}</span>
        </div>
      )
    },
    {
      header: 'Duration',
      render: (b: Booking) => {
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
        };
        return (
          <div className="flex item
          s-center gap-1 text-slate-300 text-sm">
            <Calendar size={14} className="text-slate-500" />
            <span>{formatDate(b.start_date)}</span>
            <span className="text-slate-600 px-1">to</span>
            <span>{formatDate(b.end_date)}</span>
          </div>
        );
      }
    },
    {
      header: 'Total',
      align: 'right' as const,
      render: (b: Booking) => (
        <span className="font-bold text-emerald-400">${b.total_amount}</span>
      )
    },
    {
      header: 'Status',
      render: (b: Booking) => (
        <select
          value={b.status}
          onChange={(e) => handleUpdateStatus(b.id, e.target.value)}
          className={`text-xs font-bold uppercase py-1 px-2 rounded-lg bg-slate-900 border-none cursor-pointer focus:ring-1 focus:ring-emerald-500 ${
            b.status === 'active' ? 'text-blue-500' :
            b.status === 'completed' ? 'text-emerald-500' :
            b.status === 'cancelled' ? 'text-red-500' :
            'text-amber-500'
          }`}
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      )
    },
    {
      header: 'Actions',
      align: 'right' as const,
      render: (b: Booking) => (
        <button
          onClick={() => handleDelete(b.id)}
          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  const isFormValid = formData.customer_id && formData.vehicle_id && formData.start_date && formData.end_date && !overlapBooking;

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Bookings</h1>
          <p className="text-slate-400 mt-1">Manage reservations and active rentals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-emerald-600/20"
        >
          <Plus size={20} />
          Create Booking
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by customer or car..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table 
          data={filteredBookings} 
          columns={columns} 
          loading={loading} 
          emptyMessage="No bookings found. Try creating one!"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Booking"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-400">Select Customer</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                >
                  <option value="">Choose Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-400">Select Vehicle</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} (${v.daily_rate}/day) {v.status === 'booked' ? '(Currently Rented)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Start Date" 
              type="date"
              required
              selectDate={true}
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <FormInput 
              label="End Date (Return)" 
              type="date"
              required
              selectDate={true}
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          {overlapBooking && (
            <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm animate-in zoom-in duration-300">
              <AlertCircle size={18} />
              <span>Already booked: {overlapBooking.start_date} to {overlapBooking.end_date}</span>
            </div>
          )}

          <div className="bg-slate-900/50 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CreditCard size={20} />
              </div>
              <div>
                <span className="text-slate-400 text-xs block uppercase tracking-wider font-semibold">Estimated Total</span>
                <span className="text-white text-xl font-bold">${calculateTotal()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-8 py-2 rounded-lg font-semibold transition-all shadow-lg ${
                isFormValid 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bookings;
