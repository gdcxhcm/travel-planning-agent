import Link from 'next/link';

const demoDays = [
  ['09:30', '宽窄巷子', '城市漫游与早餐'],
  ['13:30', '武侯祠', '历史文化路线'],
  ['19:00', '锦里', '晚餐与夜游']
];

export default function HomePage() {
  return (
    <main className="shell py-10 md:py-16">
      <section className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div>
          <div className="map-label text-sm font-bold text-[#0f766e]">Travel planning agent</div>
          <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight md:text-7xl">
            把旅行想法变成可执行的每日行程
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4b5c73]">
            输入出发地、目的地、日期、预算和偏好，Agent 会生成结构化行程、预算拆分和出发前建议，并保存为可重生成的旅行计划。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/planner" className="rounded-full bg-[#0f766e] px-6 py-3 font-semibold text-white shadow-lg shadow-[#0f766e]/20">
              开始规划
            </Link>
            <Link href="/history" className="rounded-full border border-[rgba(20,33,61,0.18)] bg-white/50 px-6 py-3 font-semibold">
              查看历史
            </Link>
          </div>
        </div>

        <div className="panel rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-[rgba(20,33,61,0.12)] pb-4">
            <div>
              <div className="map-label text-xs font-semibold text-[#c2410c]">Demo itinerary</div>
              <h2 className="mt-1 text-2xl font-bold">成都 3 日美食文化线</h2>
            </div>
            <span className="rounded-full bg-[#f59e0b]/15 px-3 py-1 text-sm font-semibold text-[#9a5a00]">¥2600</span>
          </div>
          <div className="mt-5 space-y-4">
            {demoDays.map((item, index) => (
              <div className="grid grid-cols-[72px_1fr] gap-4" key={item[1]}>
                <div className="font-semibold text-[#0f766e]">{item[0]}</div>
                <div className="border-l-2 border-[#0f766e] pl-4">
                  <div className="font-bold">{item[1]}</div>
                  <div className="mt-1 text-sm text-[#65758b]">{item[2]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          ['结构化输入', '用表单收集日期、预算、偏好，避免泛泛聊天。'],
          ['结构化输出', '每天的时间、地点、费用和注意事项分开展示。'],
          ['可重用闭环', '计划保存到历史，后续可以打开、复制或重生成。']
        ].map(([title, text]) => (
          <div className="panel rounded-lg p-5" key={title}>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#65758b]">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
