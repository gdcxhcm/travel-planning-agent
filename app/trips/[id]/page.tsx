'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ItineraryView } from '@/components/ItineraryView';
import { TripPlan } from '@/lib/types';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/trips/${params.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.trip) setTrip(data.trip);
        if (data.error) setError(data.error);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function regenerate() {
    setRegenerating(true);
    setError('');
    const response = await fetch(`/api/trips/${params.id}/regenerate`, { method: 'POST' });
    const data = await response.json();
    setRegenerating(false);

    if (!response.ok) {
      setError(data.error || '重生成失败');
      return;
    }
    router.push(`/trips/${data.trip.id}`);
  }

  async function copyMarkdown() {
    if (!trip) return;
    const text = [
      `# ${trip.title}`,
      trip.summary,
      '',
      ...trip.days.flatMap((day) => [
        `## Day ${day.dayIndex} ${day.title}`,
        day.summary,
        ...day.items.map((item) => `- ${item.startTime}-${item.endTime} ${item.placeName}：${item.notes}（约 ¥${item.estimatedCost}）`)
      ]),
      '',
      '## 建议',
      ...trip.tips.map((tip) => `- ${tip}`)
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) return <main className="shell py-8"><div className="panel rounded-lg p-8">正在读取行程...</div></main>;
  if (!trip) return <main className="shell py-8"><div className="panel rounded-lg p-8 text-red-700">{error || '没有找到行程'}</div></main>;

  return (
    <main className="shell py-8">
      <div className="mb-5 flex flex-wrap gap-3">
        <button className="rounded-full bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white" disabled={regenerating} onClick={regenerate}>
          {regenerating ? '正在重生成...' : '按原条件重生成'}
        </button>
        <button className="rounded-full border border-[rgba(20,33,61,0.16)] bg-white/60 px-5 py-3 text-sm font-semibold" onClick={copyMarkdown}>
          {copied ? '已复制 Markdown' : '复制 Markdown'}
        </button>
        <button className="rounded-full border border-dashed border-[rgba(20,33,61,0.28)] bg-white/40 px-5 py-3 text-sm font-semibold text-[#65758b]" disabled>
          PDF 导出即将支持
        </button>
      </div>
      {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <ItineraryView trip={trip} />
    </main>
  );
}
