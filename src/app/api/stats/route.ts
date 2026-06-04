import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { mockStats } from '@/data/mock-data';

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

    // 1. Total bookings count
    const totalBookings = await Booking.countDocuments();

    // 2. Total revenue (sum of paidAmount)
    const revenueAgg = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // 3. Pending payments (sum of amount - paidAmount)
    const pendingAgg = await Booking.aggregate([
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

    // 4. Today's bookings count (date format: YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = await Booking.countDocuments({ date: todayStr });

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      pendingPayments,
      todayBookings,
    });
  } catch (error: any) {
    console.error('[API GET /api/stats] Database connection failed:', error.message || error);

    if (isConnectionError(error)) {
      console.warn('[DATABASE FALLBACK] Returning mock stats due to database connection failure.');
      const response = NextResponse.json(mockStats);
      response.headers.set(
        'X-Database-Warning',
        `MongoDB connection failed: ${error.message || 'Offline'}. Returning mock stats fallback.`
      );
      return response;
    }

    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
