import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, LayoutDashboard, Users, Calendar, LogOut } from 'lucide-react';

const Navbar: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Bookings', path: '/bookings', icon: Calendar },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 text-white w-64 min-h-screen flex flex-col p-4 shadow-xl">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
          <Car size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Rent-a-Car</h1>
      </div>
      
      <div className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 mt-auto transition-all group active:scale-95"
      >
        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Logout</span>
      </button>
    </nav>
  );
});

export default Navbar;
