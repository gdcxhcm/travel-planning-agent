'use client';

import { useEffect, useState } from 'react';
import { AdminStats } from '@/lib/types';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/runs')
      .then((response) => response.json())
      .then((data) => setStats(data.stats));
  }, []);

  return (
    <main className="shell py-8">
      <div className="mb-6">
        <div className="map-label text-sm font-bold text-[#0f766e]">Operations center</div>
        <h1 className="mt-2 text-4xl font-black tracking-tight">任务与反馈后台</h1>
      </div>

      {!stats ? (
        <div className="panel rounded-lg p-8">正在读取任务统计...</div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="生成任务" value={String(stats.totalRuns)} />
            <Metric label="成功率" value={`${stats.successRate}%`} />
            <Metric label="失败任务" value={String(stats.failedRuns)} />
            <Metric label="平均耗时" value={`${stats.averageLatencyMs}ms`} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <section className="panel rounded-lg p-5">
              <h2 className="text-xl font-bold">热门目的地</h2>
              <div className="mt-4 space-y-3">
                {stats.popularDestinations.length === 0 ? (
                  <p className="text-sm text-[#65758b]">还没有足够的生成记录。</p>
                ) : stats.popularDestinations.map((item) => (
                  <div className="flex items-center justify-between rounded-lg bg-white/55 p-3" key={item.destination}>
                    <span className="font-semibold">{item.destination}</span>
                    <span className="text-sm text-[#0f766e]">{item.count} 次</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel rounded-lg p-5">
              <h2 className="text-xl font-bold">最近任务</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-[rgba(20,33,61,0.12)]">
                {stats.recentRuns.length === 0 ? (
                  <div className="p-4 text-sm text-[#65758b]">暂无任务日志。</div>
                ) : stats.recentRuns.map((run) => (
                  <div className="grid gap-2 border-b border-[rgba(20,33,61,0.1)] bg-white/45 p-3 text-sm md:grid-cols-[90px_1fr_100px_100px]" key={run.id}>
                    <span className={run.status === 'success' ? 'font-semibold text-[#0f766e]' : 'font-semibold text-red-700'}>{run.status}</span>
                    <span>{run.destination || '未知目的地'} · {run.provider}</span>
                    <span>{run.latencyMs}ms</span>
                    <span>{new Date(run.createdAt).toLocaleDateString()}</span>
                    {run.errorMessage && <span className="md:col-span-4 text-red-700">{run.errorMessage}</span>}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel rounded-lg p-5">
      <div className="text-sm text-[#65758b]">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}
