import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import StatCard from '../components/StatCard';
import { Users, Car, Calendar, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stats {
  total_bookings: number;
  total_customers: number;
  total_vehicles: number;
  total_revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          axios.get('/dashboard'),
          axios.get('/bookings')
        ]);
        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Real-time statistics and recent activities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Bookings"
          value={stats?.total_bookings || 0}
          icon={Calendar}
          color="bg-blue-600"
        />
        <StatCard
          title="Total Customers"
          value={stats?.total_customers || 0}
          icon={Users}
          color="bg-emerald-600"
        />
        <StatCard
          title="Total Vehicles"
          value={stats?.total_vehicles || 0}
          icon={Car}
          color="bg-purple-600"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.total_revenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="bg-amber-600"
        />
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Bookings</h2>
          <Link to="/bookings" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium transition-colors">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Dates</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{booking.Customer?.name}</span>
                      <span className="text-slate-500 text-xs">{booking.Customer?.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white">{booking.Vehicle?.make} {booking.Vehicle?.model}</span>
                      <span className="text-slate-500 text-xs">{booking.Vehicle?.license_plate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-300 text-sm">
                      {booking.start_date} to {booking.end_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-white font-semibold">${booking.total_amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      booking.status === 'active' ? 'bg-blue-500/10 text-blue-500' :
                      booking.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      booking.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No bookings found. Start by creating a customer and a vehicle!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
