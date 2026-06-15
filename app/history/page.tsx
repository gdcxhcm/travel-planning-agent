'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TripPlan } from '@/lib/types';

export default function HistoryPage() {
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then((response) => response.json())
      .then((data) => setTrips(data.trips || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="shell py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="map-label text-sm font-bold text-[#0f766e]">Trip library</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">我的旅行计划库</h1>
        </div>
        <Link className="rounded-full bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white" href="/planner">新建计划</Link>
      </div>

      {loading ? (
        <div className="panel rounded-lg p-8 text-[#65758b]">正在读取历史计划...</div>
      ) : trips.length === 0 ? (
        <div className="panel rounded-lg p-8">
          <h2 className="text-2xl font-bold">还没有计划</h2>
          <p className="mt-3 text-[#65758b]">先去规划页生成一条路线，保存后会出现在这里。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => (
            <Link className="panel rounded-lg p-5 transition hover:-translate-y-1 hover:shadow-xl" href={`/trips/${trip.id}`} key={trip.id}>
              <div className="map-label text-xs font-semibold text-[#c2410c]">{trip.origin} to {trip.destination}</div>
              <h2 className="mt-2 text-2xl font-bold">{trip.title}</h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#65758b]">{trip.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#0f766e]">
                <span className="rounded-full bg-[#0f766e]/10 px-3 py-1">{trip.startDate} - {trip.endDate}</span>
                <span className="rounded-full bg-[#0f766e]/10 px-3 py-1">¥{trip.totalBudget}</span>
                <span className="rounded-full bg-[#0f766e]/10 px-3 py-1">{trip.preferences.join(' / ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
