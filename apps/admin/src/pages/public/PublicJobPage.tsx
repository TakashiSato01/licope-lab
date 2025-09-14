import React, { useEffect, useMemo, useState } from "react";
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
import { db, storage, functions } from "@/lib/firebase";
import { getBytes, ref } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

// === 型（旧ページのまま） ===
type JobSnapshot = {
  orgId: string;
  title: string;
  wage: string;
  description: string;
  version: number;
  generatedAt: number;
};

type LicologPost = {
  id: string;
  body: string;
  facilityId: string;
  status: "pending" | "approved" | "hidden" | "internal";
  createdAt?: any;
};

export default function PublicJobPage() {
  const { orgId = "demo-org", pubId = "" } = useParams<{
    orgId: string;
    pubId: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [licologs, setLicologs] = useState<LicologPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Firestore の公開メタドキュメント参照（旧実装継承）
  const pubDocRef = useMemo(
    () => doc(db, `organizations/${orgId}/publicJobs/${pubId}`),
    [orgId, pubId]
  );

  useEffect(() => {
    let unsubLicolog: (() => void) | undefined;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Firestore から Storage の JSON パスを取得
        const metaSnap = await getDoc(pubDocRef);
        if (!metaSnap.exists()) {
          throw new Error("公開データが見つかりませんでした。");
        }
        const { storagePath, title } = metaSnap.data() as {
          storagePath: string;
          title?: string;
        };

        // 2) Storage のスナップショット JSON を読む（＝公開時点の不変データ）
        const bytes = await getBytes(ref(storage, storagePath));
        const json = new TextDecoder().decode(bytes);
        const jobData = JSON.parse(json) as JobSnapshot;

        // Firestore の title が更新されている可能性に備え、表示上は補正
        setJob({ ...jobData, title: jobData.title || title || "(無題)" });

        // 2.5) ★ページビュー計測（Cloud Functions）
        // 失敗してもユーザー体験を阻害しないよう fire-and-forget。
        try {
          const track = httpsCallable(functions, "trackPublicJobView");
          // orgId / pubId を明示渡し
          track({ orgId, pubId }).catch(() => {});
        } catch {
          /* noop */
        }

        // 3) リコログは approved の最新3件をライブ購読（＝常に最新）
        const licologCol = collection(db, `organizations/${orgId}/licologPosts`);
        const q = query(
          licologCol,
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        unsubLicolog = onSnapshot(q, (snap) => {
          const rows = snap.docs.map(
            (d) => ({ id: d.id, ...(d.data() as any) }) as LicologPost
          );
          setLicologs(rows);
        });
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (unsubLicolog) unsubLicolog();
    };
  }, [pubDocRef, orgId, pubId]);

  // ====== 旧レイアウトそのまま ======
  if (loading) return <div className="p-6">読み込み中…</div>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        公開ページの取得に失敗しました：{error}
      </div>
    );
  if (!job) return <div className="p-6">データが見つかりませんでした。</div>;

  return (
    <div className="p-6 max-w-4xl">
      {/* 求人ヘッダ */}
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <div className="text-gray-600 mb-6">給与：{job.wage || "-"}</div>

      <div className="mb-6">
        <Link
          to={`/p/${orgId}/jobs/${pubId}/apply`}
          className="inline-block px-4 py-2 rounded-xl bg-[#f579a4] text-white"
        >
          この求人に応募する
        </Link>
      </div>

      {/* 説明 */}
      <div className="whitespace-pre-wrap leading-7 mb-10">
        {job.description || "(説明はありません)"}
      </div>

      {/* 最新リコログ */}
      <section>
        <div className="text-lg font-semibold mb-3">最新のリコログ</div>
        {licologs.length === 0 ? (
          <div className="text-sm text-gray-500">
            まだ公開済みのリコログはありません。
          </div>
        ) : (
          <ul className="space-y-3">
            {licologs.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-black/5 bg-white p-4"
              >
                <div className="text-xs opacity-60 mb-1">fac: {p.facilityId}</div>
                <div className="whitespace-pre-wrap">{p.body}</div>
              </li>
            ))}
          </ul>
        )}

        {/* 将来「他のリコログも読む」用の導線（当面は管理画面のリコログへ） */}
        <div className="mt-4">
          <Link to="/licolog" className="text-[#f579a4] hover:underline">
            他のリコログも読む
          </Link>
        </div>
      </section>
    </div>
  );
}