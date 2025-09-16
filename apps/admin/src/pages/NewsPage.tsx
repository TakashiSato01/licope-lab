// apps/admin/src/pages/NewsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
import { Bell, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

type NewsItem = {
  id: string;
  title: string;
  body?: string;
  createdAt?: Timestamp;
  level?: "info" | "update" | "alert";
  url?: string; // 外部詳細がある時
};

const levelChip: Record<NonNullable<NewsItem["level"]>, string> = {
  info: "bg-gray-100 text-gray-700",
  update: "bg-blue-100 text-blue-700",
  alert: "bg-red-100 text-red-700",
};

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qword, setQword] = useState("");

  useEffect(() => {
    const ref = collection(db, "organizations", ORG_ID, "news");
    const qq = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(qq, (snap) => {
      const rows: NewsItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const q = qword.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) =>
      [x.title, x.body].filter(Boolean).some((t) => t!.toLowerCase().includes(q))
    );
  }, [items, qword]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="inline-block" size={18} />
          お知らせ
        </h1>
        <input
          value={qword}
          onChange={(e) => setQword(e.target.value)}
          placeholder="検索（タイトル・本文）"
          className="px-3 py-2 rounded-xl border border-black/10 outline-none focus:ring-2 focus:ring-black/10"
        />
      </header>

      {loading && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl bg-black/5" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-sm text-gray-500 bg-black/5 rounded-xl p-6">
          今のところお知らせはありません。
        </div>
      )}

      <ul className="space-y-3">
        {filtered.map((n) => {
          const when = n.createdAt?.toDate();
          const tag = n.level ?? "info";
          return (
          <li id={n.id} className="scroll-mt-24 rounded-xl border border-black/10 p-4 bg-white">
            <div className="flex items-start justify-between gap-6">
              {/* 左: テキスト塊に幅の上限をつける */}
              <div className="min-w-0 max-w-[880px]">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${levelChip[tag]}`}>
                      {tag === "update" ? "更新情報" : tag === "alert" ? "重要" : "お知らせ"}
                    </span>
                    {when && (
                      <time className="text-xs text-gray-500">
                        {when.toLocaleDateString()} {when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    )}
                  </div>
                        <h2 className="font-semibold leading-tight truncate break-words py-2">
        {n.title}
      </h2>
                        {n.body && (
        <p className="text-sm text-gray-700 line-clamp-2 break-words">
          {n.body}
        </p>
      )}
                </div>
                {n.url && (
                  <Link
                    to={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm px-3 py-2 rounded-lg bg-black text-white hover:opacity-90"
                  >
                    詳細 <ExternalLink size={14} className="ml-1" />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-gray-400">
        表示順は新しい順。作成は管理者のみ。collection: <code>organizations/{ORG_ID}/news</code>
      </p>
    </div>
  );
}