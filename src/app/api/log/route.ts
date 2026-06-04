import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('\x1b[33m%s\x1b[0m', `[BROWSER LOG] ${JSON.stringify(body, null, 2)}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
