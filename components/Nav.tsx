import Link from 'next/link';

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(20,33,61,0.12)] bg-[#f6f2ea]/85 backdrop-blur">
      <nav className="shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="route-pin">T</span>
          <span>Trip Agent</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-[#65758b]">
          <Link className="rounded-full px-3 py-2 hover:bg-white/60" href="/planner">规划</Link>
          <Link className="rounded-full px-3 py-2 hover:bg-white/60" href="/history">历史</Link>
          <Link className="rounded-full px-3 py-2 hover:bg-white/60" href="/admin">后台</Link>
        </div>
      </nav>
    </header>
  );
}
