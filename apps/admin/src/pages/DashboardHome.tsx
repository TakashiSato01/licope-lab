import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link, useNavigate, NavLink } from "react-router-dom";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { AlertCircle } from "lucide-react";

const ORG_ID = "demo-org";

/* ---------- 小ユーティリティ ---------- */
// グラフ用カスタムドット
function CircleDot({ cx, cy, stroke }: any) {
  return <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="#fff" strokeWidth={1.5} />;
}
function DiamondDot({ cx, cy, stroke }: any) {
  const s = 4;
  return (
    <rect
      x={cx - s}
      y={cy - s}
      width={s * 2}
      height={s * 2}
      fill={stroke}
      transform={`rotate(45 ${cx} ${cy})`}
      rx="1"
      ry="1"
    />
  );
}
function HollowDot({ cx, cy, stroke }: any) {
  return <circle cx={cx} cy={cy} r={4} fill="#fff" stroke={stroke} strokeWidth={2} />;
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, delta: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + delta);
  return x;
}
function fmtMMDD(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${m}/${day}`;
}
function pctDelta(curr: number, prev: number) {
  if (prev <= 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}
function deltaColor(p: number) {
  return p >= 0 ? "text-sky-600" : "text-[#f579a4]";
}
const nav = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? "text-sky-600" : "text-gray-500"}`;

/* ---------- 型 ---------- */

type NewsItem = {
  id: string;
  title: string;
  body?: string;
  createdAt?: Timestamp;
  level?: "info" | "update" | "alert";
};

type PublicJob = {
  id: string;
  title: string;
  publishedAt?: any;
};

type LicologStatus = "pending" | "approved" | "hidden" | "internal";

const STATUS_MAP: Record<LicologStatus, { label: string; chip: string }> = {
  pending:  { label: "非公開",   chip: "bg-gray-100 text-gray-700" },
  approved: { label: "公開済み", chip: "bg-emerald-100 text-emerald-700" },
  hidden:   { label: "非表示",   chip: "bg-slate-200 text-slate-700" },
  internal: { label: "社内限定", chip: "bg-amber-100 text-amber-700" },
};

function StatusChip({ status }: { status: LicologStatus }) {
  const m = STATUS_MAP[status] ?? { label: String(status), chip: "bg-black/10" };
  return (
    <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full ${m.chip}`}>
      {m.label}
    </span>
  );
}

/* ---------- 最新お知らせバナー ---------- */
function AnnouncementBanner({ orgId = ORG_ID }: { orgId?: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, "organizations", orgId, "news");
    const qq = query(ref, orderBy("createdAt", "desc"), limit(3));
    const unsub = onSnapshot(qq, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    });
    return () => unsub();
  }, [orgId]);

  const latest = items[0];

  // 骨
  if (loading) {
    return (
      <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
        <div className="h-5 w-2/3 animate-pulse bg-black/10 rounded" />
      </div>
    );
  }

  // データなしなら既存文＋一覧リンク
  if (!latest) {
    return (
      <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
        <div className="text-[12px]">
          <span className="inline-block mr-2">【事務局からのお知らせ】</span>
          現在、最新版のリコペ ver1.0 です。リリースノートは
          <Link to="/news" className="text-sky-600 hover:underline ml-1">こちら</Link>
        </div>
      </div>
    );
  }

  const chip =
    latest.level === "alert" ? "bg-red-100 text-red-700" :
    latest.level === "update" ? "bg-blue-100 text-blue-700" :
    "bg-gray-100 text-gray-700";

  return (
    <Link
      to={`/news#${latest.id}`}
      className="group block rounded-xl border border-black/10 bg-white px-4 py-3 hover:shadow-sm hover:border-black/20 transition relative overflow-hidden"
    >
      {/* 左の薄いアクセント */}
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-black/20 to-black/5" />

      <div className="flex items-start gap-3">
        <div className="mt-0.5 opacity-70"><AlertCircle size={18} /></div>
        <div className="min-w-0 max-w-[720px]">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-[2px] rounded-full ${chip}`}>
              {latest.level === "alert" ? "重要" : latest.level === "update" ? "更新" : "お知らせ"}
            </span>
            {latest.createdAt?.toDate && (
              <time className="text-[11px] text-gray-500">
                {latest.createdAt.toDate().toLocaleDateString()}
              </time>
            )}
          </div>
  <div className="text-[13px] font-medium truncate break-words">
    {latest.title}
  </div>
          {latest.body &&   <div className="text-[12px] text-gray-600 line-clamp-1 break-words">
    {latest.body}
  </div>}
  <div className="text-[12px] text-sky-600 mt-0.5 underline-offset-2 group-hover:underline">
    詳細を見る
  </div>
        </div>
      </div>
    </Link>
  );
}

/* =========================
   メイン（ダッシュボード）
   ========================= */
export default function DashboardHome() {
  const navigate = useNavigate();

  // KPI（今日／昨日）
  const [todayViews, setTodayViews] = useState(0);
  const [ydayViews, setYdayViews] = useState(0);
  const [todayApps, setTodayApps] = useState(0);
  const [ydayApps, setYdayApps] = useState(0);
  const [todayPosts, setTodayPosts] = useState(0);
  const [ydayPosts, setYdayPosts] = useState(0);
  const [todayApproved, setTodayApproved] = useState(0);
  const [ydayApproved, setYdayApproved] = useState(0);

  // 合同グラフ（直近7日）
  const [series, setSeries] = useState<
    { date: string; views: number; apps: number; posts: number; approved: number }[]
  >([]);

  // 一覧
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [licologs, setLicologs] = useState<LicologPost[]>([]);

  const today0 = useMemo(() => startOfDay(new Date()), []);
  const yday0 = useMemo(() => startOfDay(addDays(new Date(), -1)), []);
  const week0 = useMemo(() => startOfDay(addDays(new Date(), -6)), []);

  /* ---------- KPI 監視 ---------- */
  useEffect(() => {
    const qViewsToday = query(
      collection(db, `organizations/${ORG_ID}/jobViews`),
      where("viewedAt", ">=", Timestamp.fromDate(today0))
    );
    const qViewsYday = query(
      collection(db, `organizations/${ORG_ID}/jobViews`),
      where("viewedAt", ">=", Timestamp.fromDate(yday0)),
      where("viewedAt", "<", Timestamp.fromDate(today0))
    );
    const u1 = onSnapshot(qViewsToday, (s) => setTodayViews(s.size));
    const u2 = onSnapshot(qViewsYday, (s) => setYdayViews(s.size));

    const qAppsToday = query(
      collection(db, `organizations/${ORG_ID}/applications`),
      where("createdAt", ">=", Timestamp.fromDate(today0))
    );
    const qAppsYday = query(
      collection(db, `organizations/${ORG_ID}/applications`),
      where("createdAt", ">=", Timestamp.fromDate(yday0)),
      where("createdAt", "<", Timestamp.fromDate(today0))
    );
    const u3 = onSnapshot(qAppsToday, (s) => setTodayApps(s.size));
    const u4 = onSnapshot(qAppsYday, (s) => setYdayApps(s.size));

    const qPostsToday = query(
      collection(db, `organizations/${ORG_ID}/licologPosts`),
      where("createdAt", ">=", Timestamp.fromDate(today0))
    );
    const qPostsYday = query(
      collection(db, `organizations/${ORG_ID}/licologPosts`),
      where("createdAt", ">=", Timestamp.fromDate(yday0)),
      where("createdAt", "<", Timestamp.fromDate(today0))
    );
    const u5 = onSnapshot(qPostsToday, (s) => setTodayPosts(s.size));
    const u6 = onSnapshot(qPostsYday, (s) => setYdayPosts(s.size));

    const qApprovedToday = query(
      collection(db, `organizations/${ORG_ID}/events`),
      where("type", "==", "licolog_approved"),
      where("createdAt", ">=", Timestamp.fromDate(today0))
    );
    const qApprovedYday = query(
      collection(db, `organizations/${ORG_ID}/events`),
      where("type", "==", "licolog_approved"),
      where("createdAt", ">=", Timestamp.fromDate(yday0)),
      where("createdAt", "<", Timestamp.fromDate(today0))
    );
    const u7 = onSnapshot(qApprovedToday, (s) => setTodayApproved(s.size));
    const u8 = onSnapshot(qApprovedYday, (s) => setYdayApproved(s.size));

    return () => [u1, u2, u3, u4, u5, u6, u7, u8].forEach((u) => u());
  }, [today0, yday0]);

  /* ---------- 合同グラフ（7日） ---------- */
  useEffect(() => {
    const days: { key: string; from: Date; to: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d0 = startOfDay(addDays(new Date(), -i));
      const d1 = startOfDay(addDays(new Date(), -(i - 1)));
      days.push({ key: fmtMMDD(d0), from: d0, to: d1 });
    }
    const base = days.map((d) => ({ date: d.key, views: 0, apps: 0, posts: 0, approved: 0 }));
    setSeries(base);

    const uA = onSnapshot(
      query(
        collection(db, `organizations/${ORG_ID}/jobViews`),
        where("viewedAt", ">=", Timestamp.fromDate(week0)),
        orderBy("viewedAt", "asc")
      ),
      (snap) => {
        const copy = base.map((r) => ({ ...r, views: 0 }));
        snap.forEach((d) => {
          const t = d.get("viewedAt") as Timestamp | undefined;
          if (!t) return;
          const time = t.toDate().getTime();
          days.forEach((day, idx) => {
            if (time >= day.from.getTime() && time < day.to.getTime()) copy[idx].views++;
          });
        });
        setSeries((prev) => copy.map((c, i) => ({ ...prev[i], ...c })));
      }
    );

    const uB = onSnapshot(
      query(
        collection(db, `organizations/${ORG_ID}/applications`),
        where("createdAt", ">=", Timestamp.fromDate(week0)),
        orderBy("createdAt", "asc")
      ),
      (snap) => {
        setSeries((prev) => {
          const copy = prev.length ? prev.map((p) => ({ ...p })) : base.map((r) => ({ ...r }));
          snap.forEach((d) => {
            const t = d.get("createdAt") as Timestamp | undefined;
            if (!t) return;
            const time = t.toDate().getTime();
            days.forEach((day, idx) => {
              if (time >= day.from.getTime() && time < day.to.getTime()) copy[idx].apps++;
            });
          });
          return copy;
        });
      }
    );

    const uC = onSnapshot(
      query(
        collection(db, `organizations/${ORG_ID}/licologPosts`),
        where("createdAt", ">=", Timestamp.fromDate(week0)),
        orderBy("createdAt", "asc")
      ),
      (snap) => {
        setSeries((prev) => {
          const copy = prev.length ? prev.map((p) => ({ ...p })) : base.map((r) => ({ ...r }));
          snap.forEach((d) => {
            const t = d.get("createdAt") as Timestamp | undefined;
            if (!t) return;
            const time = t.toDate().getTime();
            days.forEach((day, idx) => {
              if (time >= day.from.getTime() && time < day.to.getTime()) copy[idx].posts++;
            });
          });
          return copy;
        });
      }
    );

    const uD = onSnapshot(
      query(
        collection(db, `organizations/${ORG_ID}/events`),
        where("type", "==", "licolog_approved"),
        where("createdAt", ">=", Timestamp.fromDate(week0)),
        orderBy("createdAt", "asc")
      ),
      (snap) => {
        setSeries((prev) => {
          const copy = prev.length ? prev.map((p) => ({ ...p })) : base.map((r) => ({ ...r }));
          snap.forEach((d) => {
            const t = d.get("createdAt") as Timestamp | undefined;
            if (!t) return;
            const time = t.toDate().getTime();
            days.forEach((day, idx) => {
              if (time >= day.from.getTime() && time < day.to.getTime()) copy[idx].approved++;
            });
          });
          return copy;
        });
      }
    );

    return () => [uA, uB, uC, uD].forEach((u) => u());
  }, [week0]);

  /* ---------- 一覧：Jobs & Licolog ---------- */
  useEffect(() => {
    const uJobs = onSnapshot(
      query(
        collection(db, `organizations/${ORG_ID}/publicJobs`),
        orderBy("publishedAt", "desc"),
        limit(5)
      ),
      (snap) => {
        setJobs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      }
    );

    const uLico = onSnapshot(
      query(
        collection(db, `organizations/${ORG_ID}/licologPosts`),
        orderBy("createdAt", "desc"),
        limit(6)
      ),
      (snap) => {
        setLicologs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      }
    );

    return () => {
      uJobs();
      uLico();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* 合同グラフ */}
      <div className="rounded-xl bg-white border border-black/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">速報データ（７日間）</h3>
          <div className="text-xs text-gray-500">
            右軸：求人ページ閲覧数 / 左軸：応募・投稿・公開
          </div>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
<ComposedChart data={series}>
  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
  <XAxis dataKey="date" />
  <YAxis yAxisId="left" allowDecimals={false} />
  <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
  <Tooltip />
  <Legend />
              <Bar yAxisId="right" dataKey="views" name="求人ページ閲覧数" fill="#93c5fd" />

  {/* 左軸ライン3本にドットを付ける */}
  <Line
    yAxisId="left"
    type="monotone"
    dataKey="apps"
    name="応募数"
    stroke="#0ea5e9"
    dot={<DiamondDot />}           // ひし形
    activeDot={{ r: 6 }}           // ホバー時ちょい大きく
  />
  <Line
    yAxisId="left"
    type="monotone"
    dataKey="posts"
    name="リコログ投稿数"
    stroke="#22c55e"
    dot={<CircleDot />}            // 塗りつぶし丸
    activeDot={{ r: 6 }}
  />
  <Line
    yAxisId="left"
    type="monotone"
    dataKey="approved"
    name="リコログ公開数"
    stroke="#f43f5e"
    dot={<HollowDot />}            // 白抜き丸
    activeDot={{ r: 6 }}
  />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI 4枚 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="求人ページ閲覧数" value={todayViews} delta={pctDelta(todayViews, ydayViews)} />
        <KpiCard title="応募数" value={todayApps} delta={pctDelta(todayApps, ydayApps)} />
        <KpiCard title="リコログ投稿数" value={todayPosts} delta={pctDelta(todayPosts, ydayPosts)} />
        <KpiCard title="リコログ公開数" value={todayApproved} delta={pctDelta(todayApproved, ydayApproved)} />
      </div>

      {/* 下段：2カラム */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 求人一覧 */}
        <section className="rounded-xl bg-white border border-black/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">求人ページ一覧</h3>
            <Link to="/jobs" className="text-sm text-sky-600 hover:underline">求人ページはこちら</Link>
          </div>
          {jobs.length === 0 ? (
            <div className="text-sm text-gray-500">まだ公開済みの求人はありません。</div>
          ) : (
            <ul className="space-y-3">
              {jobs.map((j) => {
                const publicPath = `/p/${ORG_ID}/jobs/${j.id}`;
                return (
                  <li key={j.id} className="rounded-xl border border-black/5 bg-white p-3 flex items-center gap-3">
                    <div className="w-[72px] h-[48px] rounded-lg bg-gray-100 text-[10px] text-gray-400 grid place-items-center">NO IMAGE</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{j.title || "(無題)"}</div>
                      <div className="text-xs text-gray-500">{j.publishedAt?.toDate?.()?.toLocaleString?.() ?? ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 rounded-lg border hover:bg-black/5" onClick={() => navigate(publicPath)}>開く</button>
                      <a className="px-3 py-1 rounded-lg border hover:bg-black/5" href={publicPath} target="_blank" rel="noopener">新しいタブで</a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* リコログ一覧 */}
        <section className="rounded-xl bg-white border border-black/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">リコログ投稿一覧</h3>
            <Link to="/licolog" className="text-sm text-sky-600 hover:underline">リコログ一覧はこちら</Link>
          </div>

          {licologs.length === 0 ? (
            <div className="text-sm text-gray-500">まだ投稿はありません。</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {licologs.map((p) => (
                <article key={p.id} className="rounded-xl border border-black/5 bg-white p-3 flex flex-col">
                  <div className="w-full h-[90px] rounded-lg bg-gray-100 text-[10px] text-gray-400 grid place-items-center">NO IMAGE</div>
                  <div className="mt-2 text-xs text-gray-500">{p.createdAt?.toDate?.()?.toLocaleString?.() ?? ""}</div>
                  <div className="mt-1 text-sm line-clamp-2">{p.body}</div>
                  <div className="mt-auto pt-2">
                    <StatusChip status={p.status as LicologStatus} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

<AnnouncementBanner />

      <footer className="py-6 text-[12px] text-gray-500 flex items-center justify-between">
        <div>© GLOCALIZATION</div>
        <div className="space-x-4">
          <NavLink to="/legal/tokusho" className={nav}>特定商取引法に関する表記</NavLink>
          <NavLink to="/legal/policy" className={nav}>ポリシー</NavLink>
        </div>
      </footer>
    </div>
  );
}

/* ---------- サブ：KPI カード ---------- */
function KpiCard({ title, value, delta }: { title: string; value: number; delta: number }) {
  return (
    <div className="rounded-xl bg-white border border-black/5 p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value.toLocaleString()}</div>
      <div className={`mt-1 text-xs ${deltaColor(delta)}`}>
        {delta >= 0 ? "+" : ""}
        {delta}%（前日比）
      </div>
    </div>
  );
}