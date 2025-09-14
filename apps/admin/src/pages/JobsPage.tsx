// apps/admin/src/pages/JobsPage.tsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link, useNavigate } from "react-router-dom";

type PublicJob = {
  id: string;
  title: string;
  orgId: string;
  storagePath: string;
  publishedAt?: any;
};

const ORG_ID = "demo-org";

export default function JobsPage() {
  const [items, setItems] = useState<PublicJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, `organizations/${ORG_ID}/publicJobs`),
      orderBy("publishedAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err.message ?? String(err));
      }
    );
    return unsub;
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">公開済みの求人ページ</h2>
        <Link to="/jobs/new" className="px-3 py-2 rounded-xl bg-[#f579a4] text-white">
          求人ページを作成する
        </Link>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600">
          取得に失敗しました: {error}（エミュレータが起動しているか確認）
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">まだ公開済みの求人はありません。</div>
      ) : (
        <ul className="space-y-2">
          {items.map((j) => {
            const publicPath = `/p/${ORG_ID}/jobs/${j.id}`;
            return (
              <li key={j.id} className="rounded-xl bg-white border border-black/5 p-3 flex items-center justify-between">
                <div className="font-medium">{j.title || "(無題)"}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded-lg border hover:bg-black/5"
                    onClick={() => navigate(publicPath)}
                    title="アプリ内で開く"
                  >
                    開く
                  </button>
                  <a
                    className="px-3 py-1 rounded-lg border hover:bg-black/5"
                    href={publicPath}
                    target="_blank"
                    rel="noopener"
                    title="新しいタブで開く"
                  >
                    新しいタブで開く
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}