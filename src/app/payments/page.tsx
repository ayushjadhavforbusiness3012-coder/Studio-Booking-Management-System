import React from 'react';
import { CreditCard, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Payments</h1>
        <p className="text-slate-400">Track invoices and studio session payments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl glass-dark">
          <p className="text-slate-500 text-sm font-medium mb-1">Total Outstanding</p>
          <p className="text-3xl font-bold text-white">Rs. 1,240.00</p>
        </div>
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl glass-dark">
          <p className="text-slate-500 text-sm font-medium mb-1">Received This Month</p>
          <p className="text-3xl font-bold text-emerald-400">Rs. 8,450.00</p>
        </div>
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl glass-dark">
          <p className="text-slate-500 text-sm font-medium mb-1">Pending Invoices</p>
          <p className="text-3xl font-bold text-amber-400">12</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 glass-dark flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Detailed view coming soon</h3>
        <p className="text-slate-500 text-center max-w-sm">We are finalizing the payment integration module. You will soon be able to generate invoices directly from here.</p>
      </div>
    </div>
  );
}
