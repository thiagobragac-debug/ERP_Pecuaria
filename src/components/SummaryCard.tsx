import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
    icon?: LucideIcon;
  };
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'sky' | 'blue' | 'purple';
  delay?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  subtext,
  trend,
  icon: Icon,
  color,
  delay = '0s'
}) => {
  return (
    <div 
      className={`summary-card glass-card rounded-[24px] p-6 relative overflow-hidden animate-premium-fade-up group`} 
      style={{ animationDelay: delay }}
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all duration-500`}></div>
      
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className="summary-info">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">{label}</span>
          <span className="text-3xl font-black tracking-tighter text-slate-800 drop-shadow-sm tabular-nums">
            {value}
          </span>
          
          {trend ? (
            <div className={`mt-4 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 w-fit border ${
              trend.type === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
              trend.type === 'down' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
              'bg-slate-50 text-slate-500 border-slate-100'
            }`}>
              {trend.icon && <trend.icon size={12} strokeWidth={3} />}
              {trend.value}
            </div>
          ) : subtext ? (
            <span className="text-[10px] font-bold text-slate-400 mt-4 block uppercase tracking-wider">{subtext}</span>
          ) : null}
        </div>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${
          color === 'indigo' ? 'bg-indigo-500 text-white shadow-indigo-200' :
          color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-200' :
          color === 'rose' ? 'bg-rose-500 text-white shadow-rose-200' :
          color === 'amber' ? 'bg-amber-500 text-white shadow-amber-200' :
          color === 'sky' ? 'bg-sky-500 text-white shadow-sky-200' :
          color === 'blue' ? 'bg-blue-500 text-white shadow-blue-200' :
          'bg-purple-500 text-white shadow-purple-200'
        }`}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};
