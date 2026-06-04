import { Client, Booking, DashboardStats } from '../types';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 234 567 8901',
    notes: 'Prefers Studio A',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+1 234 567 8902',
    createdAt: '2024-01-12T14:30:00Z',
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '+1 234 567 8903',
    notes: 'Always books evening slots',
    createdAt: '2024-01-15T09:15:00Z',
  },
];

export const mockBookings: Booking[] = [
  {
    id: '101',
    clientId: '1',
    clientName: 'Alice Johnson',
    date: '2026-06-01',
    startTime: '10:00',
    endTime: '12:30',
    status: 'confirmed',
    amount: 150,
    paymentStatus: 'paid',
    paidAmount: 150,
    studioRoom: 'Studio A',
    createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: '102',
    clientId: '2',
    clientName: 'Bob Smith',
    date: '2026-06-01',
    startTime: '14:00',
    endTime: '16:00',
    status: 'pending',
    amount: 120,
    paymentStatus: 'pending',
    paidAmount: 0,
    studioRoom: 'Studio B',
    createdAt: '2026-05-21T11:00:00Z',
  },
  {
    id: '103',
    clientId: '3',
    clientName: 'Charlie Brown',
    date: '2026-06-02',
    startTime: '18:00',
    endTime: '20:00',
    status: 'confirmed',
    amount: 200,
    paymentStatus: 'partial',
    paidAmount: 50,
    studioRoom: 'Studio A',
    createdAt: '2026-05-22T12:00:00Z',
  },
];

export const mockStats: DashboardStats = {
  totalBookings: 156,
  totalRevenue: 18450,
  pendingPayments: 1240,
  todayBookings: 8,
};
