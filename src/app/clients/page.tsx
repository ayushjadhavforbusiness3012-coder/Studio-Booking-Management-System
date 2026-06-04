"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  Search,
  MoreVertical,
  UserPlus,
  User
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Booking, Client } from '@/types';
import { Modal } from '@/components/ui/Modal';

function ClientImage({ client, size = 'large' }: { client: Client; size?: 'large' | 'small' }) {
  const sizeClass = size === 'large' ? 'w-16 h-16 rounded-2xl' : 'w-12 h-12 rounded-xl';

  if (client.imageUrl) {
    return (
      <div
        role="img"
        aria-label={client.name}
        className={`${sizeClass} bg-cover bg-center border border-slate-600 shadow-inner`}
        style={{ backgroundImage: `url(${client.imageUrl})` }}
      />
    );
  }

  return (
    <div className={`${sizeClass} bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shadow-inner`}>
      <User className="w-6 h-6" />
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    imageUrl: '',
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const [clientData, bookingData] = await Promise.all([
          dataService.getClients(),
          dataService.getBookings(),
        ]);
        setClients(clientData);
        setBookings(bookingData);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === 'true') {
        setIsModalOpen(true);
      }
    }
  }, []);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setClientForm((current) => ({
        ...current,
        imageUrl: String(reader.result),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const createdClient = await dataService.createClient(clientForm);
    setClients((currentClients) => [createdClient, ...currentClients]);
    setClientForm({
      name: '',
      email: '',
      phone: '',
      notes: '',
      imageUrl: '',
    });
    setIsModalOpen(false);
  };

  const handleDeleteClient = async (client: Client) => {
    await dataService.deleteClient(client.id);
    setClients((currentClients) => currentClients.filter((c) => c.id !== client.id));
    setActiveMenuId(null);
  };

  const getClientBookings = (clientId: string) =>
    bookings.filter((booking) => booking.clientId === clientId);

  const openDetails = (client: Client) => {
    setSelectedClient(client);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Clients</h1>
          <p className="text-slate-400">View and manage your client database.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all premium-shadow active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-slate-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="h-48 bg-slate-900/50 rounded-3xl border border-slate-800 animate-pulse" />
          ))
        ) : filteredClients.map((client) => (
          <div key={client.id} className="group p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-violet-500/50 transition-all glass-dark premium-shadow">
            <div className="flex justify-between items-start mb-6">
              <ClientImage client={client} />
              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-500"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {activeMenuId === client.id && (
                  <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
                    <button
                      onClick={() => openDetails(client)}
                      className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client)}
                      className="w-full px-4 py-3 text-left text-sm text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white">{client.name}</h3>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client">
        <form onSubmit={handleCreateClient} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Full Name</label>
            <input
              type="text"
              required
              value={clientForm.name}
              onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email Address</label>
            <input
              type="email"
              required
              value={clientForm.email}
              onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Phone Number</label>
            <input
              type="tel"
              required
              value={clientForm.phone}
              onChange={(event) => setClientForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Notes</label>
            <textarea
              rows={3}
              value={clientForm.notes}
              onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="Any special requirements..."
            />
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-bold text-white shadow-xl hover:shadow-violet-600/20 transition-all active:scale-95">
            Add Client
          </button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedClient)} onClose={() => setSelectedClient(null)} title="Client Details">
        {selectedClient && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <ClientImage client={selectedClient} size="small" />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedClient.name}</h3>
                <p className="text-sm text-slate-500">Joined {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Phone Number</p>
                <p className="text-sm font-medium text-slate-200">{selectedClient.phone}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Email Address</p>
                <p className="text-sm font-medium text-slate-200">{selectedClient.email}</p>
              </div>
            </div>

            {selectedClient.notes && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Additional Information</p>
                <p className="text-sm text-slate-300">{selectedClient.notes}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Booking History</h4>
              {getClientBookings(selectedClient.id).length === 0 ? (
                <p className="text-sm text-slate-500">No bookings found for this client.</p>
              ) : (
                <div className="space-y-2">
                  {getClientBookings(selectedClient.id).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{booking.date}</p>
                        <p className="text-xs text-slate-500">{booking.startTime} - {booking.endTime}</p>
                      </div>
                      <span className="text-sm font-bold text-violet-300">Rs. {booking.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
