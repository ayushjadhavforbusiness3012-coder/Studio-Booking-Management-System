import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';
import { mockClients } from '@/data/mock-data';

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
    const clients = await Client.find().sort({ createdAt: -1 });
    const mappedClients = clients.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      notes: c.notes,
      createdAt: c.createdAt.toISOString(),
    }));
    return NextResponse.json(mappedClients);
  } catch (error: any) {
    console.error('[API GET /api/clients] Database connection failed:', error.message || error);

    if (isConnectionError(error)) {
      console.warn('[DATABASE FALLBACK] Returning mock clients due to database connection failure.');
      const response = NextResponse.json(mockClients);
      response.headers.set(
        'X-Database-Warning',
        `MongoDB connection failed: ${error.message || 'Offline'}. Returning mock clients fallback.`
      );
      return response;
    }

    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, notes } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields: name, email, phone' }, { status: 400 });
    }

    try {
      await dbConnect();
      const newClient = await Client.create({
        name,
        email,
        phone,
        notes,
        createdAt: new Date(),
      });

      return NextResponse.json(
        {
          id: newClient._id.toString(),
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          notes: newClient.notes,
          createdAt: newClient.createdAt.toISOString(),
        },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error('[API POST /api/clients] Database connection failed:', dbError.message || dbError);

      if (isConnectionError(dbError)) {
        console.warn('[DATABASE FALLBACK] Appending client to in-memory mock storage.');
        const newMockClient = {
          id: Math.random().toString(36).substring(2, 11),
          name,
          email,
          phone,
          notes,
          createdAt: new Date().toISOString(),
        };
        mockClients.push(newMockClient);

        const response = NextResponse.json(newMockClient, { status: 201 });
        response.headers.set(
          'X-Database-Warning',
          `MongoDB connection failed: ${dbError.message || 'Offline'}. Created client in mock fallback storage.`
        );
        return response;
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
