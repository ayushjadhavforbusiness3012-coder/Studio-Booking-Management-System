import React from 'react';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

const settingsSections = [
  { group: "Account", items: [
    { name: "Profile Info", desc: "Manage your studio profile details", icon: User },
    { name: "Security", desc: "Password and authentication settings", icon: Shield },
  ]},
  { group: "Preferences", items: [
    { name: "Notifications", desc: "Email and system alert triggers", icon: Bell },
    { name: "Appearance", desc: "Customize the dashboard theme", icon: Palette },
  ]}
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure your studio management preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl glass-dark">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 p-0.5 shadow-lg shadow-violet-500/20">
                   <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-bold text-xl text-white">AS</div>
                </div>
                <div>
                   <h3 className="font-bold text-white text-lg">Admin Studio</h3>
                   <p className="text-sm text-slate-500">Premium Member</p>
                </div>
             </div>
             <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700">
                Edit Studio Profile
             </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           {settingsSections.map((section) => (
             <div key={section.group} className="space-y-4">
               <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2">{section.group}</h2>
               <div className="grid grid-cols-1 gap-4">
                  {section.items.map((item) => (
                    <button key={item.name} className="flex items-center justify-between p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-violet-500/50 transition-all text-left group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-violet-600/10 group-hover:text-violet-500 transition-all">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-violet-400 transition-colors">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 group-hover:text-violet-500 transition-all">
                         →
                      </div>
                    </button>
                  ))}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
