import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { Car, Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FormInput from '../components/FormInput';
import ThemeToggle from '../components/ThemeToggle';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/auth/register', formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-4 relative overflow-hidden">
      {/* Theme Toggle in Corner */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="glass-card rounded-[2rem] p-8 md:p-12 space-y-8 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors duration-500" />
          
          <div className="text-center space-y-2 relative">
            <div className="inline-flex p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 text-primary-foreground mb-4 active:scale-95 transition-transform">
              <UserPlus size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-tight">
              Join the fleet
            </h1>
            <p className="text-muted-foreground font-medium">Create your premium account today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Full Name"
              type="text"
              icon={User}
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormInput
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="name@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <FormInput
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all duration-300 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground font-medium">
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold transition-all">
              Initialize Login
            </Link>
          </p>
        </div>
        
        <p className="text-center mt-8 text-xs text-muted-foreground/50 font-bold uppercase tracking-widest">
          Premium Car Rental System v1.0
        </p>
      </div>
    </div>
  );
};

export default Register;
