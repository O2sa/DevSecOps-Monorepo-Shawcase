import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'UP',
      service: 'web',
      framework: 'Next.js',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
