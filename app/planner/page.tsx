'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { ItineraryView } from '@/components/ItineraryView';
import { TripPlan } from '@/lib/types';

const preferenceOptions = ['美食', '历史文化', '自然风景', '亲子', '拍照', '购物', '博物馆', '城市漫游'];

export default function PlannerPage() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<string[]>(['美食', '历史文化']);
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const payload = {
      origin: String(form.get('origin') || ''),
      destination: String(form.get('destination') || ''),
      startDate: String(form.get('startDate') || ''),
      endDate: String(form.get('endDate') || ''),
      budget: Number(form.get('budget') || 0),
      pace: String(form.get('pace') || 'standard'),
      specialRequests: String(form.get('specialRequests') || ''),
      preferences
    };

    const response = await fetch('/api/trips/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    setLoading(false);
    if (!response.ok) {
      setError(data.error || '生成失败，请检查输入后重试');
      return;
    }

    setTrip(data.trip);
  }

  return (
    <main className="shell py-8">
      <div className="mb-6">
        <div className="map-label text-sm font-bold text-[#0f766e]">Planner desk</div>
        <h1 className="mt-2 text-4xl font-black tracking-tight">规划一条可执行路线</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form className="panel h-fit rounded-lg p-5" onSubmit={submit}>
          <div className="grid gap-4">
            <Field label="出发地" name="origin" defaultValue="上海" />
            <Field label="目的地" name="destination" defaultValue="成都" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="开始日期" name="startDate" type="date" defaultValue="2026-07-01" />
              <Field label="结束日期" name="endDate" type="date" defaultValue="2026-07-03" />
            </div>
            <Field label="总预算" name="budget" type="number" defaultValue="3500" />
            <label className="grid gap-2 text-sm font-semibold">
              旅行节奏
              <select name="pace" className="rounded-lg border border-[rgba(20,33,61,0.16)] bg-white/70 px-3 py-3">
                <option value="relaxed">轻松</option>
                <option value="standard">标准</option>
                <option value="intensive">高密度</option>
              </select>
            </label>
            <div>
              <div className="mb-2 text-sm font-semibold">旅行偏好</div>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map((item) => {
                  const active = preferences.includes(item);
                  return (
                    <button
                      className={`rounded-full border px-3 py-2 text-sm ${active ? 'border-[#0f766e] bg-[#0f766e] text-white' : 'border-[rgba(20,33,61,0.16)] bg-white/60'}`}
                      key={item}
                      onClick={() => setPreferences((current) => active ? current.filter((value) => value !== item) : [...current, item])}
                      type="button"
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="grid gap-2 text-sm font-semibold">
              特殊要求
              <textarea
                className="min-h-[92px] rounded-lg border border-[rgba(20,33,61,0.16)] bg-white/70 px-3 py-3"
                name="specialRequests"
                placeholder="例如：不要太累，想多安排本地小吃，晚上不要太晚回酒店"
              />
            </label>
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <button
            className="mt-5 w-full rounded-lg bg-[#0f766e] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? '正在生成行程...' : '生成旅行计划'}
          </button>
        </form>

        <div>
          {trip ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-[#14213d] px-5 py-3 text-sm font-semibold text-white" onClick={() => router.push(`/trips/${trip.id}`)}>
                  打开详情页
                </button>
                <button className="rounded-full border border-[rgba(20,33,61,0.16)] bg-white/60 px-5 py-3 text-sm font-semibold" onClick={() => router.push('/history')}>
                  查看历史
                </button>
              </div>
              <ItineraryView trip={trip} />
            </div>
          ) : (
            <div className="panel rounded-lg p-8">
              <div className="map-label text-xs font-bold text-[#c2410c]">Preview</div>
              <h2 className="mt-3 text-3xl font-black">结果会在这里变成时间轴</h2>
              <p className="mt-4 leading-7 text-[#65758b]">
                提交表单后，系统会调用 Agent 生成按天拆分的路线、预算和注意事项。未配置阿里云 Key 时会自动用 mock Agent，方便先跑通产品流程。
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, name, type = 'text', defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        className="rounded-lg border border-[rgba(20,33,61,0.16)] bg-white/70 px-3 py-3"
        defaultValue={defaultValue}
        name={name}
        type={type}
      />
    </label>
  );
}
