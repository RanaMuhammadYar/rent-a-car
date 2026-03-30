import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon: Icon, color }) => {
  return (
    <div className="group bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl hover:border-blue-500/50 transition-all duration-300 hover:translate-y-[-4px]">
      <div className="flex items-center justify-between mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={color.replace('bg-', 'text-')} size={26} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{title}</span>
        <span className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</span>
      </div>
    </div>
  );
});

export default StatCard;
