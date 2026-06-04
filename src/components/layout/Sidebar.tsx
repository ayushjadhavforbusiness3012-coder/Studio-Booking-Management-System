"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  CalendarCheck,
  Users, 
  CreditCard, 
  Settings,
  Mic2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Bookings', href: '/bookings', icon: CalendarCheck },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center premium-shadow">
          <Mic2 className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">Studio<span className="text-violet-500">Sync</span></span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-violet-600/10 text-violet-400" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-violet-500" : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="font-medium">{item.name}</span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
