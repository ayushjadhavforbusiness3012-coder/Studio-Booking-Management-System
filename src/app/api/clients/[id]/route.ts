import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Client from '@/models/Client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const client = await Client.findById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error in GET /api/clients/[id]:', error);
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

    const client = await Client.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({
      id: client._id.toString(),
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/clients/[id]:', error);
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
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/clients/[id]:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}
