import React, { useMemo } from "react";
import { BarChart3, Users, MessageSquare, FileText, ChevronDown, AlertCircle } from "lucide-react";

function cn(...a: Array<string | false | null | undefined>) { return a.filter(Boolean).join(" "); }
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={cn("bg-white rounded-2xl shadow-sm", className)}>{children}</div>
);
const CardBody: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={cn("p-5", className)}>{children}</div>
);
const Badge: React.FC<React.PropsWithChildren<{ intent?: "pink" | "gray"; className?: string }>> = ({ intent = "gray", className, children }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
    intent === "pink" ? "bg-[#fce3eb] text-[#3a3732]" : "bg-[#f1f1f1] text-[#3a3732]", className)}>{children}</span>
);

function Sparkline({ series }: { series: number[] }) {
  const path = useMemo(() => {
    if (!series?.length) return "";
    const w = 160, h = 48, min = Math.min(...series), max = Math.max(...series), range = max - min || 1;
    const pts = series.map((v, i) => `${(i/(series.length-1))*w},${h-((v-min)/range)*h}`);
    return `M ${pts[0]} L ${pts.slice(1).join(" ")}`;
  }, [series]);
  return <svg viewBox="0 0 160 48" className="w-full h-12"><path d={path} fill="none" stroke="#f579a4" strokeWidth={2} /></svg>;
}

type Kpi = { key:'views'|'applies'|'LicologPosts'|'LicologPublishes'; label:string; value:number; diff:number; series:number[] };
type JobItem = { id:string; title:string; status:'公開中'|'下書き'; thumbnail?:string };
type LicologItem = { id:string; date:string; excerpt:string; author:string; thumbnail?:string };

const kpis: Kpi[] = [
  { key:'views', label:'求人ページ閲覧数', value:1088, diff:+110, series:[12,18,11,25,19,30,28,40,35,45,42,55] },
  { key:'applies', label:'応募数', value:5, diff:-80, series:[8,7,6,5,4,6,4,3,2,4,3,2] },
  { key:'LicologPosts', label:'リコログ投稿数', value:33, diff:+125, series:[2,3,2,4,5,4,6,7,6,8,7,9] },
  { key:'LicologPublishes', label:'リコログ公開数', value:21, diff:+200, series:[1,1,1,2,2,3,3,4,4,5,5,6] },
];

const jobs: JobItem[] = [
  { id:'j1', title:'介護職正社員の募集【盛岡市本宮】※デイサービス', status:'公開中' },
  { id:'j2', title:'介護職正社員の募集【盛岡市本宮】※デイサービス', status:'下書き' },
  { id:'j3', title:'介護職正社員の募集【盛岡市本宮】※デイサービス', status:'下書き' },
];

const Licologs: LicologItem[] = [
  { id:'r1', date:'2025/09/06(土)', excerpt:'昨日はひまわり園で買い物に行きました！とても暑かったですが…', author:'佐藤' },
  { id:'r2', date:'2025/09/06(土)', excerpt:'昨日はひまわり園で買い物に行きました！とても暑かったですが…', author:'佐藤' },
  { id:'r3', date:'2025/09/06(土)', excerpt:'昨日はひまわり園で買い物に行きました！とても暑かったですが…', author:'佐藤' },
];

export default function DashboardHome() {
  return (
    <div className="px-4 sm:px-6 py-4 space-y-6">
      {/* KPI */}
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
                  <div className="opacity-60">
                    {k.key === 'views' && <BarChart3 size={18} />}
                    {k.key === 'applies' && <Users size={18} />}
                    {k.key === 'LicologPosts' && <MessageSquare size={18} />}
                    {k.key === 'LicologPublishes' && <FileText size={18} />}
                  </div>
                </div>
                <div className="mt-1 text-3xl font-semibold tracking-tight">{k.value.toLocaleString()}</div>
                <div className={cn("text-xs mt-1", k.diff >= 0 ? "text-[#f579a4]" : "text-rose-500")}>
                  {k.diff >= 0 ? "+" : ""}{k.diff}%
                </div>
                <div className="mt-3 -mb-1"><Sparkline series={k.series} /></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Lists */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">求人ページ一覧</h3>
              <a href="#" className="text-sm text-[#3a3732]/70 hover:text-[#3a3732]">求人ページ一覧はこちら</a>
            </div>
            <ul className="space-y-3">
              {jobs.map((j) => (
                <li key={j.id} className="flex items-center gap-3">
                  <div className="h-14 w-20 rounded-lg bg-black/5 grid place-items-center text-xs text-[#3a3732]/60">NO IMAGE</div>
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

        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">リコログ投稿一覧</h3>
              <a href="#" className="text-sm text-[#3a3732]/70 hover:text-[#3a3732]">リコログ一覧はこちら</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Licologs.map((r) => (
                <div key={r.id} className="rounded-2xl border border-black/5 p-3 bg-white">
                  <div className="h-28 w-full rounded-xl bg-black/5 grid place-items-center text-sm text-[#3a3732]/60">NO IMAGE</div>
                  <div className="mt-2 text-xs opacity-70">{r.date}</div>
                  <div className="mt-1 text-sm leading-6 line-clamp-2">{r.excerpt}</div>
                  <div className="mt-1 text-xs opacity-80">投稿者：{r.author}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Footer notice（ダッシュボードホームに持たせる/不要なら外してOK） */}
      <footer className="mt-6 bg-[#3a3732] text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm"><AlertCircle size={16} /><span>【事務局からのお知らせ】現在、最新版のリコぺverは1.0です。リリースノートはこちら</span></div>
          <div className="text-sm whitespace-nowrap">© GLOCALIZATION <span className="opacity-70 ml-3">規約とポリシー</span></div>
        </div>
      </footer>
    </div>
  );
}
