import { NextResponse } from 'next/server';
import { getTrip } from '@/lib/store';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const trip = await getTrip(params.id);
  if (!trip) {
    return NextResponse.json({ error: '没有找到这个旅行计划' }, { status: 404 });
  }
  return NextResponse.json({ trip });
}
