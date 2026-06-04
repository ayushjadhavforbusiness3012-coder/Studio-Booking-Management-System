import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color: 'violet' | 'pink' | 'blue' | 'emerald';
}

const colorMap = {
  violet: 'from-violet-500/20 to-violet-600/5 text-violet-400 border-violet-500/20 icon-bg-violet-500',
  pink: 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/20 icon-bg-pink-500',
  blue: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20 icon-bg-blue-500',
  emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20 icon-bg-emerald-500',
};

const iconColorMap = {
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
};

export function StatCard({ title, value, icon: Icon, description, trend, color }: StatCardProps) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border bg-gradient-to-br premium-shadow transition-transform hover:scale-[1.02] duration-300",
      colorMap[color]
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl shadow-lg", iconColorMap[color])}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          {description && <span className="text-xs text-slate-500">{description}</span>}
        </div>
      </div>
    </div>
  );
}
