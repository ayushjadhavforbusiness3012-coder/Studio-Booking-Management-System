import mongoose from 'mongoose';
import { mockClients, mockBookings } from '../data/mock-data';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function seedDatabase() {
  try {
    const Client = (await import('../models/Client')).default;
    const Booking = (await import('../models/Booking')).default;

    const clientCount = await Client.countDocuments();
    if (clientCount === 0) {
      console.log('[DATABASE] Seeding initial mock data...');
      const clientMap: Record<string, string> = {};

      for (const c of mockClients) {
        const newClient = await Client.create({
          name: c.name,
          email: c.email,
          phone: c.phone,
          notes: c.notes,
          createdAt: new Date(c.createdAt),
        });
        clientMap[c.id] = newClient._id.toString();
      }

      for (const b of mockBookings) {
        const mappedClientId = clientMap[b.clientId];
        if (mappedClientId) {
          await Booking.create({
            clientId: mappedClientId,
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
            createdAt: new Date(b.createdAt),
          });
        }
      }
      console.log('[DATABASE] Seeding completed successfully!');
    }
  } catch (error) {
    console.error('[DATABASE ERROR] Seeding failed:', error);
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('[DATABASE] Connecting to MongoDB...');

    if (MONGODB_URI && MONGODB_URI.includes('<db_password>')) {
      const errorMsg = 'MONGODB_URI contains the placeholder \'<db_password>\'. Please replace it with your actual password in .env.local.';
      console.error('\x1b[31m%s\x1b[0m', `[DATABASE ERROR] ${errorMsg}`);
      cached.promise = Promise.reject(new Error(errorMsg));
    } else {
      cached.promise = mongoose.connect(MONGODB_URI!, opts)
        .then(async (mongooseInstance) => {
          console.log('[DATABASE] Connected to MongoDB successfully.');
          // Await the seeder to avoid race conditions
          await seedDatabase();
          return mongooseInstance;
        })
        .catch((err) => {
          console.error('\x1b[31m%s\x1b[0m', `[DATABASE ERROR] Connection failed: ${err.message}`);
          throw err;
        });
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
