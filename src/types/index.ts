export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  clientName: string; // Denormalized for easy display
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  amount: number;
  hourlyRate?: number;
  duration?: number;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  studioRoom?: string;
  notes?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  pendingPayments: number;
  todayBookings: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  studioRoom?: string;
  notes?: string;
  createdAt: string;
}
