// apps/admin/src/pages/JobsPage.tsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { getDownloadURL, ref } from "firebase/storage";

const ORG_ID = "demo-org";

type PublicJob = {
  id: string;
  title: string;
  publishedAt?: any;
  thumbnailPath?: string | null;
  thumbnailURL?: string | null;
};

function Thumb({ url, path }: { url?: string | null; path?: string | null }) {
  const [u, setU] = useState<string | null>(url ?? null);
  useEffect(() => {
    let dead = false;
    if (url) { setU(url); return; }
    if (!path) { setU(null); return; }
    getDownloadURL(ref(storage, path)).then((x) => !dead && setU(x)).catch(() => !dead && setU(null));
    return () => { dead = true; };
  }, [url, path]);
  return (
    <div className="w-[72px] h-[48px] rounded-lg overflow-hidden bg-gray-100 text-[10px] text-gray-400 grid place-items-center">
      {u ? <img src={u} alt="" className="w-full h-full object-cover" /> : "NO IMAGE"}
    </div>
  );
}

export default function JobsPage() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState<PublicJob[]>([]);

  useEffect(() => {
    const u = onSnapshot(
      query(collection(db, `organizations/${ORG_ID}/publicJobs`), orderBy("publishedAt", "desc")),
      (snap) => setJobs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
    );
    return () => u();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">求人ページ一覧</h1>
        <Link to="/jobs/new" className="px-3 py-1.5 rounded-lg bg-[#f579a4] text-white text-sm hover:opacity-90">
          かんたん求人ページ作成
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-sm text-gray-500">まだ公開済みの求人はありません。</div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => {
            const publicPath = `/p/${ORG_ID}/jobs/${j.id}`;
            const editPath = `/jobs/${j.id}/edit`;
            return (
              <li key={j.id} className="rounded-xl border border-black/5 bg-white p-3 flex items-center gap-3">
                <Thumb url={j.thumbnailURL ?? null} path={j.thumbnailPath ?? null} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{j.title || "(無題)"}</div>
                  <div className="text-xs text-gray-500">
                    {j.publishedAt?.toDate?.()?.toLocaleString?.() ?? ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded-lg border hover:bg-black/5" onClick={() => nav(editPath)}>
                    編集
                  </button>
                  <a className="px-3 py-1 rounded-lg border hover:bg-black/5" href={publicPath} target="_blank" rel="noopener">
                    開く
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