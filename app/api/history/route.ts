import { NextResponse } from 'next/server';
import { listTrips } from '@/lib/store';

export async function GET() {
  const trips = await listTrips();
  return NextResponse.json({ trips });
}
