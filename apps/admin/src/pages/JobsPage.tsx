// src/pages/jobs/JobsPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const ORG_ID = "demo-org";

type PublicJobMeta = {
  id: string;
  title: string;
  wage: string;
  facilityName: string;
  facilityAddress: string;
  facilityType: string;
  employmentType: string;
  workingHours: string;
  thumbnailURL?: string | null;
  publishedAt?: any;
  storagePath?: string | null;
  thumbnailPath?: string | null;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<PublicJobMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const col = collection(db, `organizations/${ORG_ID}/publicJobs`);
    const qy = query(col, orderBy("publishedAt", "desc"));

    const unsub = onSnapshot(qy, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setJobs(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("本当に削除しますか？この求人の公開ページも消えます。")) return;
    await deleteDoc(doc(db, `organizations/${ORG_ID}/publicJobs/${id}`));
    alert("削除しました");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">求人ページ一覧</h1>

        <Link
          to="/jobs/new"
          className="px-4 py-2 rounded-xl bg-[#f579a4] text-white hover:opacity-90"
        >
          求人ページを新規作成
        </Link>
      </div>

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-black/5 rounded-lg"></div>
          <div className="h-16 bg-black/5 rounded-lg"></div>
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-sm text-gray-500">求人ページはありません。</div>
      )}

      <div className="grid gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="group flex gap-4 rounded-xl bg-white border border-black/5 p-4"
          >
            {/* サムネ */}
            <div className="w-32 h-24 rounded-lg bg-gray-100 overflow-hidden">
              {job.thumbnailURL ? (
                <img src={job.thumbnailURL} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-400 text-xs">
                  NO IMAGE
                </div>
              )}
            </div>

            {/* 詳細 */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{job.title}</h2>

              <div className="text-sm text-gray-600 mt-1">
                {job.facilityName}（{job.facilityType}）
              </div>

              <div className="text-pink-600 font-medium mt-1">{job.wage}</div>

              <div className="text-sm text-gray-500">{job.employmentType}</div>
              <div className="text-sm text-gray-500">{job.workingHours}</div>

              <div className="text-xs opacity-60 mt-2">
                公開日：
                {job.publishedAt?.toDate
                  ? job.publishedAt.toDate().toLocaleString("ja-JP")
                  : "—"}
              </div>

              {/* ボタン類 */}
              <div className="flex gap-3 mt-4 text-sm">
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="text-[#f579a4] hover:underline"
                >
                  編集
                </Link>

                <Link
                  to={`/p/${ORG_ID}/jobs/${job.id}`}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                >
                  公開LPを開く
                </Link>

                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-red-500 hover:underline"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
