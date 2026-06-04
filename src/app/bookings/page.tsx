"use client";

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Booking, BookingStatus, Client, PaymentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

const TIME_SLOTS = [
  { label: '00:00 - 01:00', start: '00:00', end: '01:00', hourStart: 0, hourEnd: 1 },
  { label: '01:00 - 02:00', start: '01:00', end: '02:00', hourStart: 1, hourEnd: 2 },
  { label: '02:00 - 03:00', start: '02:00', end: '03:00', hourStart: 2, hourEnd: 3 },
  { label: '03:00 - 04:00', start: '03:00', end: '04:00', hourStart: 3, hourEnd: 4 },
  { label: '04:00 - 05:00', start: '04:00', end: '05:00', hourStart: 4, hourEnd: 5 },
  { label: '05:00 - 06:00', start: '05:00', end: '06:00', hourStart: 5, hourEnd: 6 },
  { label: '06:00 - 07:00', start: '06:00', end: '07:00', hourStart: 6, hourEnd: 7 },
  { label: '07:00 - 08:00', start: '07:00', end: '08:00', hourStart: 7, hourEnd: 8 },
  { label: '08:00 - 09:00', start: '08:00', end: '09:00', hourStart: 8, hourEnd: 9 },
  { label: '09:00 - 10:00', start: '09:00', end: '10:00', hourStart: 9, hourEnd: 10 },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00', hourStart: 10, hourEnd: 11 },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00', hourStart: 11, hourEnd: 12 },
  { label: '12:00 - 13:00', start: '12:00', end: '13:00', hourStart: 12, hourEnd: 13 },
  { label: '13:00 - 14:00', start: '13:00', end: '14:00', hourStart: 13, hourEnd: 14 },
  { label: '14:00 - 15:00', start: '14:00', end: '15:00', hourStart: 14, hourEnd: 15 },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00', hourStart: 15, hourEnd: 16 },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00', hourStart: 16, hourEnd: 17 },
  { label: '17:00 - 18:00', start: '17:00', end: '18:00', hourStart: 17, hourEnd: 18 },
  { label: '18:00 - 19:00', start: '18:00', end: '19:00', hourStart: 18, hourEnd: 19 },
  { label: '19:00 - 20:00', start: '19:00', end: '20:00', hourStart: 19, hourEnd: 20 },
  { label: '20:00 - 21:00', start: '20:00', end: '21:00', hourStart: 20, hourEnd: 21 },
  { label: '21:00 - 22:00', start: '21:00', end: '22:00', hourStart: 21, hourEnd: 22 },
  { label: '22:00 - 23:00', start: '22:00', end: '23:00', hourStart: 22, hourEnd: 23 },
  { label: '23:00 - 00:00', start: '23:00', end: '00:00', hourStart: 23, hourEnd: 24 },
];

const STUDIO_RATES: Record<string, number> = {
  'Studio A': 1000,
  'Studio B': 2000,
  'Studio C': 3000,
  'Studio D': 4000,
  'Studio E': 5000,
};

const bookingStatuses: BookingStatus[] = ['confirmed', 'completed', 'cancelled'];
const paymentStatuses: PaymentStatus[] = ['pending', 'partial', 'paid'];

type FilterType = 'dateTime' | 'amount' | 'paymentStatus' | 'bookingStatus';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [bookingToUpdate, setBookingToUpdate] = useState<Booking | null>(null);
  const [filterDraft, setFilterDraft] = useState<{ type: FilterType; value: string }>({
    type: 'dateTime',
    value: '',
  });
  const [activeFilter, setActiveFilter] = useState<{ type: FilterType; value: string } | null>(null);
  
  const [bookingForm, setBookingForm] = useState({
    clientId: '',
    date: '',
    startSlotIndex: 9,
    endSlotIndex: 9,
    paymentStatus: 'pending' as PaymentStatus,
    status: 'confirmed' as BookingStatus,
    studioRoom: 'Studio A',
    notes: '',
  });
  const [newClientName, setNewClientName] = useState('');

  const [updateForm, setUpdateForm] = useState({
    status: 'confirmed' as BookingStatus,
    paymentStatus: 'pending' as PaymentStatus,
  });

  const hourlyRate = useMemo(() => {
    return STUDIO_RATES[bookingForm.studioRoom] || 1000;
  }, [bookingForm.studioRoom]);

  const duration = useMemo(() => {
    const startSlot = TIME_SLOTS[bookingForm.startSlotIndex];
    const endSlot = TIME_SLOTS[bookingForm.endSlotIndex];
    if (!startSlot || !endSlot) return 0;
    return (endSlot.hourEnd - startSlot.hourStart) + 1;
  }, [bookingForm.startSlotIndex, bookingForm.endSlotIndex]);

  const totalCharge = useMemo(() => {
    return hourlyRate * duration;
  }, [hourlyRate, duration]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingData, clientData] = await Promise.all([
          dataService.getBookings(),
          dataService.getClients(),
        ]);
        setBookings(bookingData);
        setClients(clientData);
        setBookingForm((current) => ({
          ...current,
          clientId: clientData[0]?.id || '',
        }));
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = bookings
    .filter((booking) => booking.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((booking) => {
      if (!activeFilter || !activeFilter.value.trim()) return true;

      const value = activeFilter.value.trim().toLowerCase();
      if (activeFilter.type === 'dateTime') {
        return `${booking.date} ${booking.startTime} ${booking.endTime}`.toLowerCase().includes(value);
      }
      if (activeFilter.type === 'amount') {
        return String(booking.amount).includes(value);
      }
      if (activeFilter.type === 'paymentStatus') {
        return booking.paymentStatus.toLowerCase().includes(value);
      }
      return booking.status.toLowerCase().includes(value);
    });

  const resetBookingForm = () => {
    setBookingForm({
      clientId: clients[0]?.id || '',
      date: '',
      startSlotIndex: 9,
      endSlotIndex: 9,
      paymentStatus: 'pending',
      status: 'confirmed',
      studioRoom: 'Studio A',
      notes: '',
    });
    setNewClientName('');
  };

  const handleCreateBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newClientName.trim() && !bookingForm.clientId) return;

    let selectedClient;

    if (newClientName.trim()) {
      const name = newClientName.trim();
      const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}@example.com`;
      const phone = '000-000-0000';

      const createdClient = await dataService.createClient({
        name,
        email,
        phone,
        notes: 'Created automatically via booking form',
      });

      setClients((current) => [createdClient, ...current]);
      selectedClient = createdClient;
    } else {
      selectedClient = clients.find((client) => client.id === bookingForm.clientId);
    }

    if (!selectedClient || totalCharge <= 0) return;

    const startSlot = TIME_SLOTS[bookingForm.startSlotIndex];
    const endSlot = TIME_SLOTS[bookingForm.endSlotIndex];

    let paidAmount = 0;
    if (bookingForm.paymentStatus === 'paid') {
      paidAmount = totalCharge;
    } else if (bookingForm.paymentStatus === 'partial') {
      paidAmount = totalCharge / 2;
    }

    const createdBooking = await dataService.createBooking({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      date: bookingForm.date,
      startTime: startSlot.start,
      endTime: endSlot.end,
      status: bookingForm.status,
      amount: totalCharge,
      hourlyRate: hourlyRate,
      duration: duration,
      paymentStatus: bookingForm.paymentStatus,
      paidAmount: paidAmount,
      studioRoom: bookingForm.studioRoom,
      notes: bookingForm.notes,
    });

    setBookings((currentBookings) => [createdBooking, ...currentBookings]);
    resetBookingForm();
    setIsModalOpen(false);
  };

  const openUpdateModal = (booking: Booking) => {
    setBookingToUpdate(booking);
    setUpdateForm({
      status: booking.status,
      paymentStatus: booking.paymentStatus,
    });
    setActiveMenuId(null);
  };

  const handleUpdateBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingToUpdate) return;

    let paidAmount = 0;
    if (updateForm.paymentStatus === 'paid') {
      paidAmount = bookingToUpdate.amount;
    } else if (updateForm.paymentStatus === 'partial') {
      paidAmount = bookingToUpdate.amount / 2;
    }

    const updatedBooking = await dataService.updateBooking(bookingToUpdate.id, {
      status: updateForm.status,
      paymentStatus: updateForm.paymentStatus,
      paidAmount,
    });

    if (updateForm.status === 'completed' || updateForm.status === 'cancelled') {
      setBookings((currentBookings) =>
        currentBookings.filter((booking) => booking.id !== bookingToUpdate.id)
      );
    } else {
      setBookings((currentBookings) =>
        currentBookings.map((booking) => booking.id === updatedBooking.id ? updatedBooking : booking)
      );
    }
    setBookingToUpdate(null);
  };

  const handleDeleteBooking = async (booking: Booking) => {
    await dataService.deleteBooking(booking.id);
    setBookings((currentBookings) => currentBookings.filter((item) => item.id !== booking.id));
    setActiveMenuId(null);
  };

  const applyFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveFilter(filterDraft.value.trim() ? filterDraft : null);
    setIsFilterOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Bookings</h1>
          <p className="text-slate-400">Manage your studio sessions and schedules.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all premium-shadow active:scale-95"
        >
          <Plus className="w-5 h-5" />
          New Booking
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by client..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-slate-200"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden glass-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Client</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    No bookings found matching your search.
                  </td>
                </tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-violet-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-slate-500 font-mono text-sm">#{booking.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-200">{booking.clientName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-sm">{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-200 font-semibold">
                    Rs. {booking.amount}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className={cn(
                         "w-2 h-2 rounded-full",
                         booking.paymentStatus === 'paid' ? "bg-emerald-500" :
                         booking.paymentStatus === 'pending' ? "bg-rose-500" : "bg-amber-500"
                       )} />
                       <span className="text-sm capitalize text-slate-300">{booking.paymentStatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                      booking.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-400" :
                      booking.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                      booking.status === 'completed' ? "bg-blue-500/10 text-blue-400" :
                      "bg-rose-500/10 text-rose-400"
                    )}>
                      {booking.status === 'confirmed' || booking.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === booking.id ? null : booking.id)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-200 transition-all"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {activeMenuId === booking.id && (
                      <div className="absolute right-6 top-12 z-20 w-36 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
                        <button
                          onClick={() => openUpdateModal(booking)}
                          className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(booking)}
                          className="w-full px-4 py-3 text-left text-sm text-rose-300 hover:bg-slate-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Booking"
      >
        <form onSubmit={handleCreateBooking} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Enter Name (for new client)</label>
            <input
              type="text"
              value={newClientName}
              onChange={(event) => setNewClientName(event.target.value)}
              placeholder="Or type a new client name..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Client</label>
            <select
              required={!newClientName.trim()}
              value={bookingForm.clientId}
              onChange={(event) => setBookingForm((current) => ({ ...current, clientId: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Date</label>
              <input
                type="date"
                required
                value={bookingForm.date}
                onChange={(event) => setBookingForm((current) => ({ ...current, date: event.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Studio Room</label>
              <select
                value={bookingForm.studioRoom}
                onChange={(event) => setBookingForm((current) => ({ ...current, studioRoom: event.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white font-semibold"
              >
                <option value="Studio A">Studio A</option>
                <option value="Studio B">Studio B</option>
                <option value="Studio C">Studio C</option>
                <option value="Studio D">Studio D</option>
                <option value="Studio E">Studio E</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Start Time Slot</label>
                <select
                  required
                  value={bookingForm.startSlotIndex}
                  onChange={(event) => {
                    const val = parseInt(event.target.value, 10);
                    setBookingForm((current) => ({
                      ...current,
                      startSlotIndex: val,
                      endSlotIndex: Math.max(current.endSlotIndex, val)
                    }));
                  }}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
                >
                  {TIME_SLOTS.map((slot, idx) => (
                    <option key={idx} value={idx}>{slot.label}</option>
                  ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">End Time Slot</label>
                <select
                  required
                  value={bookingForm.endSlotIndex}
                  onChange={(event) => {
                    const val = parseInt(event.target.value, 10);
                    setBookingForm((current) => ({
                      ...current,
                      endSlotIndex: val
                    }));
                  }}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
                >
                  {TIME_SLOTS.slice(bookingForm.startSlotIndex).map((slot, idx) => {
                    const actualIdx = idx + bookingForm.startSlotIndex;
                    return (
                      <option key={actualIdx} value={actualIdx}>{slot.label}</option>
                    );
                  })}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Hourly Rate</label>
              <input
                type="number"
                readOnly
                value={hourlyRate}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl focus:outline-none cursor-not-allowed font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Duration (hrs)</label>
              <input
                type="number"
                readOnly
                value={duration}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl focus:outline-none cursor-not-allowed font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Total Charge</label>
              <div className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold">
                Rs. {totalCharge}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Booking Status</label>
              <select
                value={bookingForm.status}
                onChange={(event) => setBookingForm((current) => ({ ...current, status: event.target.value as BookingStatus }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              >
                {bookingStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Payment Status</label>
              <select
                value={bookingForm.paymentStatus}
                onChange={(event) => setBookingForm((current) => ({ ...current, paymentStatus: event.target.value as PaymentStatus }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-bold text-white shadow-xl hover:shadow-violet-600/20 transition-all active:scale-95">
            Create Booking
          </button>
        </form>
      </Modal>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filter Bookings">
        <form onSubmit={applyFilter} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Filter Type</label>
            <select
              value={filterDraft.type}
              onChange={(event) => setFilterDraft((current) => ({ ...current, type: event.target.value as FilterType }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
            >
              <option value="dateTime">Date & Time</option>
              <option value="amount">Amount / Charges</option>
              <option value="paymentStatus">Payment Status</option>
              <option value="bookingStatus">Booking Status</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Filter Value</label>
            <input
              type="text"
              value={filterDraft.value}
              onChange={(event) => setFilterDraft((current) => ({ ...current, value: event.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
              placeholder="2026-06-01, paid, pending, 150..."
            />
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-bold text-white shadow-xl hover:shadow-violet-600/20 transition-all active:scale-95">
            Filter
          </button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(bookingToUpdate)} onClose={() => setBookingToUpdate(null)} title="Update Booking">
        <form onSubmit={handleUpdateBooking} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Booking Status</label>
            <select
              value={updateForm.status}
              onChange={(event) => setUpdateForm((current) => ({ ...current, status: event.target.value as BookingStatus }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
            >
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Payment Status</label>
            <select
              value={updateForm.paymentStatus}
              onChange={(event) => setUpdateForm((current) => ({ ...current, paymentStatus: event.target.value as PaymentStatus }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 text-white"
            >
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl font-bold text-white shadow-xl hover:shadow-violet-600/20 transition-all active:scale-95">
            Save Changes
          </button>
        </form>
      </Modal>
    </div>
  );
}
