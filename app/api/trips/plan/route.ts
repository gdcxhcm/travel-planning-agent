import { NextResponse } from 'next/server';
import { generateTripWithAgent } from '@/lib/agent';
import { recordRun, saveTrip } from '@/lib/store';
import { tripInputSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const startedAt = Date.now();
  let destination: string | null = null;

  try {
    const body = await request.json();
    const input = tripInputSchema.parse(body);
    destination = input.destination;

    const { trip, provider } = await generateTripWithAgent(input);
    const saved = await saveTrip(input, trip);
    await recordRun({
      tripPlanId: saved.id,
      provider,
      latencyMs: Date.now() - startedAt,
      status: 'success',
      destination
    });

    return NextResponse.json({ trip: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败';
    await recordRun({
      tripPlanId: null,
      provider: process.env.DASHSCOPE_API_KEY ? 'dashscope' : 'mock-agent',
      latencyMs: Date.now() - startedAt,
      status: 'failed',
      errorMessage: message,
      destination
    }).catch(() => undefined);

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
