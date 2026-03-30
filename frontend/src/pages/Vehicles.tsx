import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Table from '../components/Table';
import FormInput from '../components/FormInput';
import { Car, Pencil, Trash2, Search, Plus, Tag } from 'lucide-react';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  daily_rate: number;
  status: 'available' | 'booked';
}

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    daily_rate: 0,
    status: 'available' as 'available' | 'booked'
  });

  const fetchVehicles = React.useCallback(async () => {
    try {
      const res = await axios.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Error fetching vehicles', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingVehicle ? 'Updating vehicle...' : 'Creating vehicle...');
    try {
      if (editingVehicle) {
        await axios.put(`/vehicles/${editingVehicle.id}`, formData);
        toast.success('Vehicle updated successfully!', { id: loadingToast });
      } else {
        await axios.post('/vehicles', formData);
        toast.success('Vehicle created successfully!', { id: loadingToast });
      }
      setIsModalOpen(false);
      setEditingVehicle(null);
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        daily_rate: 0,
        status: 'available'
      });
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to save vehicle', { id: loadingToast });
    }
  };

  const handleEdit = React.useCallback((vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      daily_rate: vehicle.daily_rate,
      status: vehicle.status
    });
    setIsModalOpen(true);
  }, []);

  const handleDelete = React.useCallback(async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      const loadingToast = toast.loading('Deleting vehicle...');
      try {
        await axios.delete(`/vehicles/${id}`);
        toast.success('Vehicle deleted successfully!', { id: loadingToast });
        fetchVehicles();
      } catch (err) {
        toast.error('Failed to delete vehicle', { id: loadingToast });
      }
    }
  }, [fetchVehicles]);

  const filteredVehicles = React.useMemo(() => 
    vehicles.filter(v => 
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
    ), [vehicles, searchQuery]);

  const columns = React.useMemo(() => [
    {
      header: 'Vehicle',
      render: (v: Vehicle) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/10 text-purple-500 rounded-lg">
            <Car size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium">{v.make} {v.model}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Plate & Year',
      render: (v: Vehicle) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Tag size={14} className="text-slate-500" /> {v.license_plate}
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <Plus size={14} className="text-slate-500" /> {v.year}
          </div>
        </div>
      )
    },
    {
      header: 'Price/Day',
      render: (v: Vehicle) => (
        <div className="text-emerald-400 font-bold text-lg">${v.daily_rate}</div>
      )
    },
    {
      header: 'Status',
      render: (v: Vehicle) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
          v.status === 'available' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {v.status}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right' as const,
      render: (v: Vehicle) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEdit(v)}
            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => handleDelete(v.id)}
            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
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
          <h1 className="text-3xl font-bold text-white">Vehicles</h1>
          <p className="text-slate-400 mt-1">Manage your fleet inventory</p>
        </div>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setFormData({
              make: '',
              model: '',
              year: new Date().getFullYear(),
              license_plate: '',
              daily_rate: 0,
              status: 'available'
            });
            setIsModalOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg shadow-purple-600/20"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by make, model or license plate..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table 
          data={filteredVehicles} 
          columns={columns} 
          loading={loading} 
          emptyMessage="No vehicles found."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Make" 
              required
              placeholder="e.g. Toyota"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            />
            <FormInput 
              label="Model" 
              required
              placeholder="e.g. Camry"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Year" 
              type="number"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            />
            <FormInput 
              label="License Plate" 
              required
              value={formData.license_plate}
              onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput 
              label="Daily Rate ($)" 
              type="number"
              required
              placeholder="0"
              value={formData.daily_rate === 0 ? '' : formData.daily_rate}
              onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-400">Status</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-purple-600/20"
            >
              {editingVehicle ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
