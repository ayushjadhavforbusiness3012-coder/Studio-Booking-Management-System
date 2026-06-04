import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: booking._id.toString(),
      clientId: booking.clientId.toString(),
      clientName: booking.clientName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      amount: booking.amount,
      paymentStatus: booking.paymentStatus,
      paidAmount: booking.paidAmount,
      studioRoom: booking.studioRoom,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error in GET /api/bookings/[id]:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    const booking = await Booking.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: booking._id.toString(),
      clientId: booking.clientId.toString(),
      clientName: booking.clientName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      amount: booking.amount,
      paymentStatus: booking.paymentStatus,
      paidAmount: booking.paidAmount,
      studioRoom: booking.studioRoom,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/bookings/[id]:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/bookings/[id]:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
