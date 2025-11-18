// src/pages/public/PublicJobPage.tsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { getBytes, getDownloadURL, ref } from "firebase/storage";
import type { JobDraft } from "@/types/JobDraft";
import { JOB_FIELDS } from "@/types/JobDraft";
import { recordJobView } from "@/lib/repositories/jobs";

type JobSnapshot = JobDraft & {
  orgId: string;
  version: number;
  generatedAt: number;
  thumbnailURL?: string | null;
  thumbnailPath?: string | null;
};

export default function PublicJobPage() {
  const params = useParams();
  const orgId = params.orgId || "demo-org";
  const pubId =
    params.pubId || params.jobId || params.id || "";

  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [thumbURL, setThumbURL] = useState<string | null>(null);
  const [licologs, setLicologs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pubRef = useMemo(
    () => doc(db, `organizations/${orgId}/publicJobs/${pubId}`),
    [orgId, pubId]
  );

  /* ----------------------------------------------------------
     1) 公開 JSON 読み込み
  ---------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(pubRef);
        if (!snap.exists()) throw new Error("公開情報が存在しません");

        const storagePath = snap.get("storagePath");
        const bytes = await getBytes(ref(storage, storagePath));
        const json = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(json) as JobSnapshot;

        setJob(parsed);

        if (parsed.thumbnailURL) {
          setThumbURL(parsed.thumbnailURL);
        } else if (parsed.thumbnailPath) {
          setThumbURL(await getDownloadURL(ref(storage, parsed.thumbnailPath)));
        } else {
          setThumbURL(null);
        }
      } catch (e: any) {
        console.error(e);
        setError(String(e?.message ?? e));
      }
    })();
  }, [pubRef]);

  /* ----------------------------------------------------------
     2) PV 記録（重複防止）
  ---------------------------------------------------------- */
  const fired = useRef(false);
  useEffect(() => {
    if (!pubId || fired.current) return;
    fired.current = true;
    recordJobView(pubId, { orgId, referrer: document.referrer }).catch(() => {});
  }, [orgId, pubId]);

  /* ----------------------------------------------------------
     3) リコログ取得（最新3件）
  ---------------------------------------------------------- */
  useEffect(() => {
    const colRef = collection(db, `organizations/${orgId}/licologPosts`);
    const qy = query(
      colRef,
      where("orgId", "==", orgId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(3)
    );

    const unsub = onSnapshot(qy, (snap) => {
      setLicologs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });

    return () => unsub();
  }, [orgId]);

  /* ----------------------------------------------------------
     UI：描画
  ---------------------------------------------------------- */
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!job) return <div className="p-6">読み込み中…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* サムネ */}
      {thumbURL && (
        <img src={thumbURL} className="w-full h-48 object-cover rounded-xl" />
      )}

      <h1 className="text-2xl font-bold">{job.title}</h1>
      <div className="text-gray-400">給与：{job.wage}</div>

      <Link
        to={`/p/${orgId}/jobs/${pubId}/apply`}
        className="inline-block px-4 py-2 rounded-xl bg-black text-white"
      >
        この求人に応募する
      </Link>

      {/* JobDraft の自動描画 */}
      {JOB_FIELDS.map((f) => (
        <section key={f.key} className="bg-white rounded-xl p-4 border">
          <h2 className="text-lg font-semibold mb-2">{f.label}</h2>

          {f.type === "textarea" ? (
            <pre className="whitespace-pre-wrap">{job[f.key] || "-"}</pre>
          ) : (
            <div>{job[f.key] || "-"}</div>
          )}
        </section>
      ))}

      {/* リコログ */}
      <section className="bg-white rounded-xl p-4 border">
        <h2 className="text-lg font-semibold mb-3">最新のリコログ</h2>

        {licologs.length === 0 ? (
          <div className="text-sm text-gray-500">公開ログはありません。</div>
        ) : (
          <ul className="space-y-3">
            {licologs.map((p) => (
              <li key={p.id} className="rounded-xl border bg-white p-4">
                <div className="text-xs opacity-60 mb-1">
                  facility: {p.facilityId}
                </div>
                <div className="whitespace-pre-wrap">{p.body}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
