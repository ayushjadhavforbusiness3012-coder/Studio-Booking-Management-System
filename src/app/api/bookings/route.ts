import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Client from '@/models/Client';
import { mockBookings } from '@/data/mock-data';

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

export async function GET() {
  try {
    await dbConnect();
    const bookings = await Booking.find().sort({ createdAt: -1 });
    const mappedBookings = bookings.map((b: any) => ({
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
    return NextResponse.json(mappedBookings);
  } catch (error: any) {
    console.error('[API GET /api/bookings] Database connection failed:', error.message || error);

    if (isConnectionError(error)) {
      console.warn('[DATABASE FALLBACK] Returning mock bookings due to database connection failure.');
      const response = NextResponse.json(mockBookings);
      response.headers.set(
        'X-Database-Warning',
        `MongoDB connection failed: ${error.message || 'Offline'}. Returning mock bookings fallback.`
      );
      return response;
    }

    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientId,
      clientName,
      date,
      startTime,
      endTime,
      status,
      amount,
      paymentStatus,
      paidAmount,
      studioRoom,
      notes,
    } = body;

    if (!clientId || !date || !startTime || !endTime || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields: clientId, date, startTime, endTime, amount' }, { status: 400 });
    }

    try {
      await dbConnect();

      // Resolve clientName if not provided
      let resolvedClientName = clientName;
      if (!resolvedClientName) {
        const client = await Client.findById(clientId);
        if (!client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        resolvedClientName = client.name;
      }

      const newBooking = await Booking.create({
        clientId,
        clientName: resolvedClientName,
        date,
        startTime,
        endTime,
        status: status || 'pending',
        amount,
        paymentStatus: paymentStatus || 'pending',
        paidAmount: paidAmount || 0,
        studioRoom,
        notes,
        createdAt: new Date(),
      });

      return NextResponse.json(
        {
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
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error('[API POST /api/bookings] Database connection failed:', dbError.message || dbError);

      if (isConnectionError(dbError)) {
        console.warn('[DATABASE FALLBACK] Appending booking to in-memory mock storage.');
        const newMockBooking = {
          id: Math.random().toString(36).substring(2, 11),
          clientId,
          clientName: clientName || 'Fallback Client',
          date,
          startTime,
          endTime,
          status: status || 'pending',
          amount,
          paymentStatus: paymentStatus || 'pending',
          paidAmount: paidAmount || 0,
          studioRoom,
          notes,
          createdAt: new Date().toISOString(),
        };
        mockBookings.push(newMockBooking);

        const response = NextResponse.json(newMockBooking, { status: 201 });
        response.headers.set(
          'X-Database-Warning',
          `MongoDB connection failed: ${dbError.message || 'Offline'}. Created booking in mock fallback storage.`
        );
        return response;
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error in POST /api/bookings:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
