import { NextResponse } from 'next/server';
import { generateTripWithAgent } from '@/lib/agent';
import { getTrip, recordRun, saveTrip } from '@/lib/store';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const startedAt = Date.now();
  const original = await getTrip(params.id);

  if (!original) {
    return NextResponse.json({ error: '没有找到可重生成的旅行计划' }, { status: 404 });
  }

  try {
    const input = {
      origin: original.origin,
      destination: original.destination,
      startDate: original.startDate,
      endDate: original.endDate,
      budget: original.budget,
      preferences: original.preferences,
      pace: original.pace,
      specialRequests: original.specialRequests
    };
    const { trip, provider } = await generateTripWithAgent(input);
    const saved = await saveTrip(input, trip);
    await recordRun({
      tripPlanId: saved.id,
      provider,
      latencyMs: Date.now() - startedAt,
      status: 'success',
      destination: input.destination
    });

    return NextResponse.json({ trip: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : '重生成失败';
    await recordRun({
      tripPlanId: original.id,
      provider: process.env.DASHSCOPE_API_KEY ? 'dashscope' : 'mock-agent',
      latencyMs: Date.now() - startedAt,
      status: 'failed',
      errorMessage: message,
      destination: original.destination
    }).catch(() => undefined);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
