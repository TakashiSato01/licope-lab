import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Briefcase,
  BarChart3,
  Users,
  Settings,
  Bell,
  CircleHelp,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  AlertCircle,
  Menu as MenuIcon,
} from "lucide-react";

/**
 * Licope Dashboard (single-file TSX)
 * - TailwindCSS utility classes
 * - No external UI kit; small primitives below
 * - Colors fixed per spec
 */

// ---------- small helpers ----------
function cn(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

// ---------- UI primitives (lightweight) ----------
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm", className)}>{children}</div>
);
const CardBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={cn("p-5", className)}>{children}</div>
);
const Badge: React.FC<React.PropsWithChildren<{ intent?: "pink" | "gray"; className?: string }>> = ({ intent = "gray", className, children }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
      intent === "pink"
        ? "bg-[#fce3eb] text-[#3a3732]"
        : "bg-[#f1f1f1] text-[#3a3732]",
      className
    )}
  >
    {children}
  </span>
);
const Button: React.FC<React.PropsWithChildren<{ variant?: "solid" | "ghost"; className?: string; onClick?: () => void }>> = ({
  variant = "solid",
  className,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
      variant === "solid"
        ? "bg-[#f579a4] text-white hover:opacity-90"
        : "text-[#3a3732] hover:bg-black/5",
      className
    )}
  >
    {children}
  </button>
);

// ---------- tiny Sparkline (SVG) ----------
function Sparkline({ series }: { series: number[] }) {
  const path = useMemo(() => {
    if (!series || series.length === 0) return "";
    const w = 160;
    const h = 48;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const pts = series.map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    });
    return `M ${pts[0]} L ${pts.slice(1).join(" ")}`;
  }, [series]);
  return (
    <svg viewBox="0 0 160 48" className="w-full h-12">
      <path d={path} fill="none" stroke="#f579a4" strokeWidth={2} />
    </svg>
  );
}

// ---------- data types ----------
 type Kpi = { key: 'views' | 'applies' | 'ricologPosts' | 'ricologPublishes'; label: string; value: number; diff: number; series: number[] };
 type JobItem = { id: string; title: string; status: '公開中' | '下書き'; thumbnail?: string };
 type RicologItem = { id: string; date: string; excerpt: string; author: string; thumbnail?: string };

// ---------- dummy data ----------
const kpis: Kpi[] = [
  { key: 'views', label: '求人ページ閲覧数', value: 1088, diff: +110, series: [12,18,11,25,19,30,28,40,35,45,42,55] },
  { key: 'applies', label: '応募数', value: 5, diff: -80, series: [8,7,6,5,4,6,4,3,2,4,3,2] },
  { key: 'ricologPosts', label: 'リコログ投稿数', value: 33, diff: +125, series: [2,3,2,4,5,4,6,7,6,8,7,9] },
  { key: 'ricologPublishes', label: 'リコログ公開数', value: 21, diff: +200, series: [1,1,1,2,2,3,3,4,4,5,5,6] },
];

const jobs: JobItem[] = [
  { id: 'j1', title: '介護職正社員の募集【盛岡市本宮】※デイサービス', status: '公開中', thumbnail: '' },
  { id: 'j2', title: '介護職正社員の募集【盛岡市本宮】※デイサービス', status: '下書き', thumbnail: '' },
  { id: 'j3', title: '介護職正社員の募集【盛岡市本宮】※デイサービス', status: '下書き', thumbnail: '' },
];

const ricologs: RicologItem[] = [
  { id: 'r1', date: '2025/09/06(土)', excerpt: '昨日はひまわり園で買い物に行きました！とても暑かったですが…', author: '佐藤', thumbnail: '' },
  { id: 'r2', date: '2025/09/06(土)', excerpt: '昨日はひまわり園で買い物に行きました！とても暑かったですが…', author: '佐藤', thumbnail: '' },
  { id: 'r3', date: '2025/09/06(土)', excerpt: '昨日はひまわり園で買い物に行きました！とても暑かったですが…', author: '佐藤' },
];

// ---------- navigation ----------
const nav = [
  { key: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { key: 'jobs', label: '求人ページ', icon: FileText },
  { key: 'ricolog', label: 'リコログ', icon: MessageSquare },
  { key: 'works', label: 'リコペワークス', icon: Briefcase },
  { key: 'analytics', label: '詳細分析', icon: BarChart3 },
];

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#3a3732]">
      {/* top bar */}
      <header className="sticky top-0 z-30 h-14 bg-[#f579a4] text-[#3a3732]/95">
        <div className="h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-xl tracking-tight">Licope!</span>
            <div className="hidden sm:block text-white/95 text-sm">
              社会福祉法人 岩手盛岡園 <span className="opacity-80">|</span> 契約ID: FDENIS001
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-white/95 text-sm mr-2">リコベ 太郎</div>
            <div className="relative">
              <button aria-label="お知らせ" className="p-2 rounded-full hover:bg-white/15 text-white">
                <Bell size={18} />
              </button>
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-white text-[10px] text-[#f579a4] font-semibold">•</span>
            </div>
            <button aria-label="ヘルプ" className="p-2 rounded-full hover:bg-white/15 text-white">
              <CircleHelp size={18} />
            </button>
            <div className="relative">
              <button
                aria-label="ユーザーメニュー"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-white/15 text-white flex items-center"
              >
                <MenuIcon size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white shadow-lg text-sm text-[#3a3732]">
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5">ユーザー設定</button>
                  <button className="w-full text-left px-3 py-2 hover:bg-black/5">ログアウト</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid" style={{ gridTemplateColumns: `${collapsed ? '72px' : '248px'} 1fr` }}>
        {/* sidebar */}
        <aside className={cn("min-h-[calc(100vh-56px)] bg-[#faf1f4] border-r border-black/5 transition-all",
          collapsed ? "px-2" : "px-4")}
        >
          <nav className="py-4 flex flex-col h-full">
            <div className="flex-1">
              {nav.map((n) => (
                <a
                  key={n.key}
                  href="#"
                  title={n.label}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors",
                    collapsed && "justify-center"
                  )}
                >
                  <n.icon size={18} className="shrink-0" />
                  {!collapsed && <span className="text-sm">{n.label}</span>}
                </a>
              ))}

              {/* primary buttons */}
              <div className="mt-4 space-y-2">
                <Button className={cn("w-full", collapsed && "justify-center px-2")}>
                  <FileText size={16} /> {!collapsed && <span>求人ページを作成する</span>}
                </Button>
                <Button variant="ghost" className={cn("w-full", collapsed && "justify-center px-2")}> 
                  <Users size={16} /> {!collapsed && <span>応募管理</span>}
                </Button>
              </div>
            </div>

            {/* bottom items */}
            <div className="pt-4 border-t border-black/5">
              <a
                href="#"
                title="設定"
                className={cn("group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5",
                  collapsed && "justify-center")}
              >
                <Settings size={18} />
                {!collapsed && <span className="text-sm">設定</span>}
              </a>

              <button
                onClick={() => setCollapsed((v) => !v)}
                className={cn(
                  "mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5",
                  collapsed && "justify-center"
                )}
                title="メニューを閉じる"
              >
                {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                {!collapsed && <span className="text-sm">メニューを閉じる</span>}
              </button>
            </div>
          </nav>
        </aside>

        {/* main content */}
        <main className="min-h-[calc(100vh-56px)]">
          <div className="px-4 sm:px-6 py-4 space-y-6">
            {/* KPI section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">主要数値</h2>
                <button className="inline-flex items-center gap-1 text-sm text-[#3a3732]/70 hover:text-[#3a3732]">
                  今月 <ChevronDown size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpis.map((k) => (
                  <Card key={k.key}>
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <div className="text-sm opacity-80">{k.label}</div>
                        {/* right-top tiny icon (visual only) */}
                        <div className="opacity-60">
                          {k.key === 'views' && <BarChart3 size={18} />}
                          {k.key === 'applies' && <Users size={18} />}
                          {k.key === 'ricologPosts' && <MessageSquare size={18} />}
                          {k.key === 'ricologPublishes' && <FileText size={18} />}
                        </div>
                      </div>
                      <div className="mt-1 text-3xl font-semibold tracking-tight">{k.value.toLocaleString()}</div>
                      <div className={cn("text-xs mt-1", k.diff >= 0 ? "text-[#f579a4]" : "text-rose-500")}> 
                        {k.diff >= 0 ? "+" : ""}{k.diff}%
                      </div>
                      <div className="mt-3 -mb-1">
                        <Sparkline series={k.series} />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>

            {/* lists */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* jobs list */}
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">求人ページ一覧</h3>
                    <a href="#" className="text-sm text-[#3a3732]/70 hover:text-[#3a3732]">求人ページ一覧はこちら</a>
                  </div>

                  <ul className="space-y-3">
                    {jobs.map((j) => (
                      <li key={j.id} className="flex items-center gap-3">
                        {/* thumbnail */}
                        {j.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={j.thumbnail} alt="job" className="h-14 w-20 rounded-lg object-cover" />
                        ) : (
                          <div className="h-14 w-20 rounded-lg bg-black/5 grid place-items-center text-xs text-[#3a3732]/60">NO IMAGE</div>
                        )}
                        {/* content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge intent={j.status === '公開中' ? 'pink' : 'gray'}>{j.status}</Badge>
                            <div className="truncate text-sm">{j.title}</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              {/* ricolog list */}
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold">リコログ投稿一覧</h3>
                    <a href="#" className="text-sm text-[#3a3732]/70 hover:text-[#3a3732]">リコログ一覧はこちら</a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {ricologs.map((r) => (
                      <div key={r.id} className="rounded-2xl border border-black/5 p-3 bg-white">
                        {/* thumb */}
                        {r.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.thumbnail} alt="ricolog" className="h-28 w-full rounded-xl object-cover" />
                        ) : (
                          <div className="h-28 w-full rounded-xl bg-black/5 grid place-items-center text-sm text-[#3a3732]/60">NO IMAGE</div>
                        )}
                        <div className="mt-2 text-xs opacity-70">{r.date}</div>
                        <div className="mt-1 text-sm leading-6 line-clamp-2">{r.excerpt}</div>
                        <div className="mt-1 text-xs opacity-80">投稿者：{r.author}</div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </section>
          </div>

          {/* footer notice */}
          <footer className="mt-6 bg-[#3a3732] text-white">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>
                  【事務局からのお知らせ】現在、最新版のリコぺverは1.0です。リリースノートはこちら
                </span>
              </div>
              <div className="text-sm whitespace-nowrap">
                © GLOCALIZATION <span className="opacity-70 ml-3">規約とポリシー</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}