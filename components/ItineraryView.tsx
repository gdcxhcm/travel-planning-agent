import { TripPlan } from '@/lib/types';

export function ItineraryView({ trip }: { trip: TripPlan }) {
  return (
    <div className="space-y-5">
      <section className="panel rounded-lg p-5">
        <div className="map-label text-xs font-semibold text-[#0f766e]">Plan summary</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{trip.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#4b5c73]">{trip.summary}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric label="目的地" value={trip.destination} />
          <Metric label="日期" value={`${trip.startDate} - ${trip.endDate}`} />
          <Metric label="总预算" value={`¥${trip.totalBudget}`} />
          <Metric label="节奏" value={paceText(trip.pace)} />
        </div>
      </section>

      {trip.days.map((day) => (
        <section className="panel rounded-lg p-5" key={day.dayIndex}>
          <div className="flex flex-col gap-2 border-b border-[rgba(20,33,61,0.12)] pb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="map-label text-xs font-semibold text-[#c2410c]">Day {day.dayIndex}</div>
              <h2 className="mt-1 text-2xl font-bold">{day.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#65758b]">{day.summary}</p>
            </div>
            <div className="rounded-full bg-[#0f766e]/10 px-4 py-2 text-sm font-semibold text-[#0f766e]">
              日预算 ¥{day.dayBudget}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {day.items.map((item, index) => (
              <div className="grid gap-4 md:grid-cols-[120px_1fr_110px]" key={`${day.dayIndex}-${item.placeName}-${index}`}>
                <div className="text-sm font-semibold text-[#14213d]">
                  {item.startTime} - {item.endTime}
                </div>
                <div className="border-l-2 border-[#0f766e] pl-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold">{item.placeName}</h3>
                    <span className="rounded-full bg-[#f59e0b]/15 px-2 py-1 text-xs font-semibold text-[#9a5a00]">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#4b5c73]">{item.notes}</p>
                </div>
                <div className="text-sm font-semibold text-[#0f766e]">¥{item.estimatedCost}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="panel rounded-lg p-5">
        <h2 className="text-xl font-bold">出发前建议</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {trip.tips.map((tip) => (
            <div className="rounded-lg border border-[rgba(20,33,61,0.12)] bg-white/50 p-4 text-sm leading-6 text-[#4b5c73]" key={tip}>
              {tip}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[rgba(20,33,61,0.12)] bg-white/55 p-4">
      <div className="text-xs text-[#65758b]">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function paceText(pace: TripPlan['pace']) {
  if (pace === 'relaxed') return '轻松';
  if (pace === 'intensive') return '高密度';
  return '标准';
}
