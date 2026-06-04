"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CalendarCheck, 
  IndianRupee, 
  Clock, 
  Users,
  ArrowUpRight
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { dataService } from '@/services/dataService';
import { DashboardStats, Booking } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [todayEventsCount, setTodayEventsCount] = useState<number>(0);
  const [showAllRecent, setShowAllRecent] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const logToApi = (type: string, message: string, details?: any) => {
    if (typeof window !== 'undefined') {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, details, pathname: window.location.pathname })
      }).catch(() => {});
    }
  };

  logToApi("info", "Render", { loading, statsCount: stats ? 1 : 0 });

  useEffect(() => {
    // Listen for global window errors
    const handleError = (e: ErrorEvent) => {
      logToApi("error", "Window error", { message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno });
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      logToApi("error", "Unhandled promise rejection", { reason: String(e.reason?.message || e.reason) });
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    logToApi("info", "useEffect start");
    const fetchData = async () => {
      try {
        logToApi("info", "fetchData calling getStats and getBookings");
        const [s, b, evs] = await Promise.all([
          dataService.getStats(),
          dataService.getBookings(),
          dataService.getCalendarEvents()
        ]);
        logToApi("info", "fetchData resolved", { s, bLength: b?.length });
        setStats(s);
        setRecentBookings(b);

        const todayStr = new Date().toISOString().split('T')[0];
        const count = evs.filter(e => e.date === todayStr).length;
        setTodayEventsCount(count);
      } catch (error) {
        logToApi("error", "fetchData failed", { error: String(error) });
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        logToApi("info", "fetchData finally - setting loading to false");
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const bookingsToRender = showAllRecent ? recentBookings : recentBookings.slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-400">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={CalendarCheck}
          color="violet"
        />
        <StatCard
          title="Revenue"
          value={`Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Pending Payments"
          value={`Rs. ${(stats?.pendingPayments || 0).toLocaleString()}`}
          icon={Clock}
          color="pink"
        />
        <StatCard
          title="Today's Bookings"
          value={stats?.todayBookings || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Today's Events"
          value={todayEventsCount}
          icon={CalendarCheck}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 glass-dark">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <button
              onClick={() => setShowAllRecent(!showAllRecent)}
              className="text-sm text-violet-400 font-medium hover:text-violet-300"
            >
              {showAllRecent ? 'Show Less' : 'View All'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Client</th>
                  <th className="pb-4 font-semibold">Date & Time</th>
                  <th className="pb-4 font-semibold">Amount</th>
                  <th className="pb-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookingsToRender.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-slate-800/30 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 border border-slate-700">
                          {booking.clientName.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-200">{booking.clientName}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-sm">
                        <p className="text-slate-200">{booking.date}</p>
                        <p className="text-slate-500">{booking.startTime} - {booking.endTime}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="font-semibold text-slate-200">Rs. {booking.amount}</span>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                        booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 glass-dark flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-4 flex-1">
            <Link href="/calendar" className="block w-full">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-200">Check Availability</p>
                    <p className="text-xs text-slate-500">View free slots for today</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-violet-500" />
              </button>
            </Link>
            
            <Link href="/clients?add=true" className="block w-full">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-600/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition-all">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-200">Add New Client</p>
                    <p className="text-xs text-slate-500">Register a new studio user</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-pink-500" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
