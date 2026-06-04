import { Booking, CalendarEvent, Client, DashboardStats } from '../types';
import { mockBookings, mockClients, mockStats } from '../data/mock-data';

const STORAGE_KEYS = {
  bookings: 'studio-bookings',
  archivedBookings: 'studio-archived-bookings',
  clients: 'studio-clients',
  events: 'studio-calendar-events',
};

function isConnectionError(error: any): boolean {
  const msg = error?.message || '';
  return (
    msg.includes('ECONNREFUSED') ||
    msg.includes('db_password') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('buffering timed out') ||
    msg.includes('connection')
  );
}

function readStorage<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`[STORAGE WARNING] Failed to read ${key}:`, error);
    return null;
  }
}

function writeStorage<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function getStoredOrSeeded<T>(key: string, seedLoader: () => Promise<T[]>): Promise<T[]> {
  const stored = readStorage<T>(key);
  if (stored) return stored;

  const seeded = await seedLoader();
  writeStorage(key, seeded);
  return seeded;
}

function calculateStats(bookings: Booking[]): DashboardStats {
  const todayStr = new Date().toISOString().split('T')[0];
  const completedRevenue = typeof window !== 'undefined' ? Number(window.localStorage.getItem('studio-completed-revenue') || 0) : 0;

  return {
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + booking.paidAmount, 0) + completedRevenue,
    pendingPayments: bookings.reduce((sum, booking) => sum + Math.max(booking.amount - booking.paidAmount, 0), 0),
    todayBookings: bookings.filter((booking) => booking.date === todayStr).length,
  };
}

function removeCompletedExpiredBookings(bookings: Booking[]): Booking[] {
  const now = new Date();
  const archived = readStorage<(Booking & { archivedAt: string; archiveReason: string })>(STORAGE_KEYS.archivedBookings) || [];
  const active: Booking[] = [];
  const newlyArchived: (Booking & { archivedAt: string; archiveReason: string })[] = [];

  for (const booking of bookings) {
    const scheduledEnd = new Date(`${booking.date}T${booking.endTime || '23:59'}`);
    if (booking.status === 'completed' && scheduledEnd < now) {
      newlyArchived.push({
        ...booking,
        archivedAt: new Date().toISOString(),
        archiveReason: 'completed-after-scheduled-end',
      });
    } else {
      active.push(booking);
    }
  }

  if (newlyArchived.length > 0) {
    writeStorage(STORAGE_KEYS.archivedBookings, [...archived, ...newlyArchived]);
    writeStorage(STORAGE_KEYS.bookings, active);
  }

  return active;
}

export const dataService = {
  // Stats
  async getStats(): Promise<DashboardStats> {
    if (typeof window === 'undefined') {
      try {
        const dbConnect = (await import('../lib/db')).default;
        const BookingModel = (await import('../models/Booking')).default;
        
        await dbConnect();
        
        const totalBookings = await BookingModel.countDocuments();
        
        const revenueAgg = await BookingModel.aggregate([
          { $group: { _id: null, total: { $sum: '$paidAmount' } } },
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        const pendingAgg = await BookingModel.aggregate([
          {
            $group: {
              _id: null,
              total: {
                $sum: { $subtract: ['$amount', '$paidAmount'] },
              },
            },
          },
        ]);
        const pendingPayments = pendingAgg[0]?.total || 0;

        const todayStr = new Date().toISOString().split('T')[0];
        const todayBookings = await BookingModel.countDocuments({ date: todayStr });

        return {
          totalBookings,
          totalRevenue,
          pendingPayments,
          todayBookings,
        };
      } catch (error: any) {
        console.error('[SERVER ERROR] dataService.getStats failed:', error.message || error);
        if (isConnectionError(error)) {
          console.warn('[DATABASE FALLBACK] Server-side fallback to mock stats.');
          return mockStats;
        }
        throw error;
      }
    } else {
      const bookings = await dataService.getBookings();
      return calculateStats(bookings);
    }
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    if (typeof window === 'undefined') {
      try {
        const dbConnect = (await import('../lib/db')).default;
        const BookingModel = (await import('../models/Booking')).default;
        
        await dbConnect();
        
        const bookings = await BookingModel.find().sort({ createdAt: -1 });
        return bookings.map((b: any) => ({
          id: b._id.toString(),
          clientId: b.clientId.toString(),
          clientName: b.clientName,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
          amount: b.amount,
          paymentStatus: b.paymentStatus,
          paidAmount: b.paidAmount,
          studioRoom: b.studioRoom,
          notes: b.notes,
          createdAt: b.createdAt.toISOString(),
        }));
      } catch (error: any) {
        console.error('[SERVER ERROR] dataService.getBookings failed:', error.message || error);
        if (isConnectionError(error)) {
          console.warn('[DATABASE FALLBACK] Server-side fallback to mock bookings.');
          return mockBookings;
        }
        throw error;
      }
    } else {
      const bookings = await getStoredOrSeeded<Booking>(STORAGE_KEYS.bookings, async () => {
        const res = await fetch('/api/bookings');

        const dbWarning = res.headers.get('X-Database-Warning');
        if (dbWarning) {
          console.warn(`[DATABASE WARNING] ${dbWarning}`);
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Failed to fetch bookings (Status ${res.status})`);
        }

        return res.json();
      });

      return removeCompletedExpiredBookings(bookings);
    }
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    if (typeof window === 'undefined') {
      try {
        const dbConnect = (await import('../lib/db')).default;
        const BookingModel = (await import('../models/Booking')).default;
        const ClientModel = (await import('../models/Client')).default;
        
        await dbConnect();

        let resolvedClientName = booking.clientName;
        if (!resolvedClientName) {
          const client = await ClientModel.findById(booking.clientId);
          if (!client) {
            throw new Error('Client not found');
          }
          resolvedClientName = client.name;
        }

        const newBooking = await BookingModel.create({
          ...booking,
          clientName: resolvedClientName,
          createdAt: new Date(),
        });

        return {
          id: newBooking._id.toString(),
          clientId: newBooking.clientId.toString(),
          clientName: newBooking.clientName,
          date: newBooking.date,
          startTime: newBooking.startTime,
          endTime: newBooking.endTime,
          status: newBooking.status,
          amount: newBooking.amount,
          paymentStatus: newBooking.paymentStatus,
          paidAmount: newBooking.paidAmount,
          studioRoom: newBooking.studioRoom,
          notes: newBooking.notes,
          createdAt: newBooking.createdAt.toISOString(),
        };
      } catch (error: any) {
        console.error('[SERVER ERROR] dataService.createBooking failed:', error.message || error);
        if (isConnectionError(error)) {
          console.warn('[DATABASE FALLBACK] Server-side fallback: creating booking in mock storage.');
          const newMockBooking = {
            ...booking,
            id: Math.random().toString(36).substring(2, 11),
            createdAt: new Date().toISOString(),
          };
          mockBookings.push(newMockBooking as Booking);
          return newMockBooking as Booking;
        }
        throw error;
      }
    } else {
      const bookings = await dataService.getBookings();
      let nextNum = 1001;
      const bkIds = bookings
        .map(b => b.id)
        .filter(id => id.startsWith('BK-'))
        .map(id => parseInt(id.replace('BK-', ''), 10))
        .filter(num => !isNaN(num));
      if (bkIds.length > 0) {
        nextNum = Math.max(...bkIds) + 1;
      }
      const newBookingId = `BK-${nextNum}`;

      const newBooking: Booking = {
        ...booking,
        id: newBookingId,
        createdAt: new Date().toISOString(),
      };
      writeStorage(STORAGE_KEYS.bookings, [newBooking, ...bookings]);
      return newBooking;
    }
  },

  // Clients
  async getClients(): Promise<Client[]> {
    if (typeof window === 'undefined') {
      try {
        const dbConnect = (await import('../lib/db')).default;
        const ClientModel = (await import('../models/Client')).default;
        
        await dbConnect();
        
        const clients = await ClientModel.find().sort({ createdAt: -1 });
        return clients.map((c: any) => ({
          id: c._id.toString(),
          name: c.name,
          email: c.email,
          phone: c.phone,
          notes: c.notes,
          createdAt: c.createdAt.toISOString(),
        }));
      } catch (error: any) {
        console.error('[SERVER ERROR] dataService.getClients failed:', error.message || error);
        if (isConnectionError(error)) {
          console.warn('[DATABASE FALLBACK] Server-side fallback to mock clients.');
          return mockClients;
        }
        throw error;
      }
    } else {
      return getStoredOrSeeded<Client>(STORAGE_KEYS.clients, async () => {
        const res = await fetch('/api/clients');

        const dbWarning = res.headers.get('X-Database-Warning');
        if (dbWarning) {
          console.warn(`[DATABASE WARNING] ${dbWarning}`);
        }

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Failed to fetch clients (Status ${res.status})`);
        }

        return res.json();
      });
    }
  },

  async createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    if (typeof window === 'undefined') {
      try {
        const dbConnect = (await import('../lib/db')).default;
        const ClientModel = (await import('../models/Client')).default;
        
        await dbConnect();

        const newClient = await ClientModel.create({
          ...client,
          createdAt: new Date(),
        });

        return {
          id: newClient._id.toString(),
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          notes: newClient.notes,
          createdAt: newClient.createdAt.toISOString(),
        };
      } catch (error: any) {
        console.error('[SERVER ERROR] dataService.createClient failed:', error.message || error);
        if (isConnectionError(error)) {
          console.warn('[DATABASE FALLBACK] Server-side fallback: creating client in mock storage.');
          const newMockClient = {
            ...client,
            id: Math.random().toString(36).substring(2, 11),
            createdAt: new Date().toISOString(),
          };
          mockClients.push(newMockClient as Client);
          return newMockClient as Client;
        }
        throw error;
      }
    } else {
      const clients = await dataService.getClients();
      const newClient: Client = {
        ...client,
        id: makeId('client'),
        createdAt: new Date().toISOString(),
      };
      writeStorage(STORAGE_KEYS.clients, [newClient, ...clients]);
      return newClient;
    }
  },

  async updateBooking(
    id: string,
    updates: Pick<Booking, 'status' | 'paymentStatus' | 'paidAmount'>
  ): Promise<Booking> {
    const bookings = await dataService.getBookings();
    const targetBooking = bookings.find((b) => b.id === id);
    if (!targetBooking) {
      throw new Error('Booking not found');
    }

    if (updates.status === 'completed') {
      const updatedBookings = bookings.filter((booking) => booking.id !== id);
      writeStorage(STORAGE_KEYS.bookings, updatedBookings);
      if (typeof window !== 'undefined') {
        const currentRev = Number(window.localStorage.getItem('studio-completed-revenue') || 0);
        window.localStorage.setItem('studio-completed-revenue', String(currentRev + targetBooking.amount));
      }
      return { ...targetBooking, ...updates };
    } else if (updates.status === 'cancelled') {
      const updatedBookings = bookings.filter((booking) => booking.id !== id);
      writeStorage(STORAGE_KEYS.bookings, updatedBookings);
      return { ...targetBooking, ...updates };
    } else {
      const updatedBookings = bookings.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking
      );
      const updatedBooking = updatedBookings.find((booking) => booking.id === id);
      if (!updatedBooking) {
        throw new Error('Booking not found');
      }
      writeStorage(STORAGE_KEYS.bookings, updatedBookings);
      return updatedBooking;
    }
  },

  async deleteBooking(id: string): Promise<void> {
    const bookings = await dataService.getBookings();
    writeStorage(
      STORAGE_KEYS.bookings,
      bookings.filter((booking) => booking.id !== id)
    );
  },

  async deleteClient(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const clients = await dataService.getClients();
    writeStorage(
      STORAGE_KEYS.clients,
      clients.filter((client) => client.id !== id)
    );
  },

  async deleteCalendarEvent(id: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const events = await dataService.getCalendarEvents();
    writeStorage(
      STORAGE_KEYS.events,
      events.filter((event) => event.id !== id)
    );
  },

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    if (typeof window === 'undefined') return [];

    return getStoredOrSeeded<CalendarEvent>(STORAGE_KEYS.events, async () => []);
  },

  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const events = await dataService.getCalendarEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: makeId('event'),
      createdAt: new Date().toISOString(),
    };
    writeStorage(STORAGE_KEYS.events, [newEvent, ...events]);
    return newEvent;
  },
};
