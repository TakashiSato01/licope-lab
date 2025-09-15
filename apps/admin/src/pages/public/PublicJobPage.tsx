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
  FirestoreError,
} from "firebase/firestore";
import { db, storage, functions } from "@/lib/firebase";
import { getBytes, ref } from "firebase/storage";
import { httpsCallable } from "firebase/functions";

// --- types（既存構造を踏襲） ---
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
  // ルート param 名のブレを全部吸収（orgId|org、pubId|jobId|id）
  const params = useParams();
  const orgId = (params.orgId || (params as any).org || "demo-org") as string;
  const pubId = (params.pubId || (params as any).jobId || (params as any).id || "") as string;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [licologs, setLicologs] = useState<LicologPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [licologNote, setLicologNote] = useState<string | null>(null); // インデックス等の補足を表示

  // Firestore の公開メタ（偶数セグメント）
  const pubDocRef = useMemo(
    () => doc(db, `organizations/${orgId}/publicJobs/${pubId}`),
    [orgId, pubId]
  );

  useEffect(() => {
    if (!pubId) {
      setError("URL が不正です（pubId がありません）");
      setLoading(false);
      return;
    }

    let unsubLicolog: (() => void) | undefined;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setLicologNote(null);

        // 1) Firestore から公開メタを取得
        const metaSnap = await getDoc(pubDocRef);
        if (!metaSnap.exists()) {
          throw new Error("公開データが見つかりませんでした。");
        }
        const meta = metaSnap.data() as {
          storagePath?: string;
          title?: string;
          wage?: string;
          description?: string;
        };

        if (!meta.storagePath) {
          throw new Error("公開用ファイルのパス(storagePath)が設定されていません。");
        }

        // 2) Storage のスナップショット JSON を読む（不変の公開データ）
        const bytes = await getBytes(ref(storage, meta.storagePath));
        const json = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(json) as JobSnapshot;

        // Firestore 側により新しい値が入っている可能性もあるので軽く補正
        setJob({
          ...parsed,
          title: parsed.title || meta.title || "(無題)",
          wage: parsed.wage || meta.wage || "",
          description: parsed.description || meta.description || "",
        });

        // 2.5) ページビュー計測（失敗は無視）
        try {
          const track = httpsCallable(functions, "trackPublicJobView");
          void track({ orgId, pubId });
        } catch {
          /* noop */
        }

        // 3) リコログ：approved の最新3件をライブ購読
        const licologCol = collection(db, `organizations/${orgId}/licologPosts`);
        const qy = query(
          licologCol,
          where("orgId", "==", orgId),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(3)
        );
        unsubLicolog = onSnapshot(
          qy,
          (snap) => {
            const rows = snap.docs.map(
              (d) => ({ id: d.id, ...(d.data() as any) }) as LicologPost
            );
            setLicologs(rows);
          },
          (e: FirestoreError) => {
            console.error("[PublicJobPage] licolog onSnapshot error:", e);
            setLicologs([]);
            // インデックス未作成のときはヒントを画面に出す
            if (e.code === "failed-precondition") {
              setLicologNote(
                "リコログの並び替えに必要な複合インデックスが未作成です。" +
                "firestore.indexes.json に licologPosts の {orgId ASC, status ASC, createdAt DESC} を追加してデプロイしてください。"
              );
            }
          }
        );
      } catch (e: any) {
        console.error("[PublicJobPage] load error:", e);
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => { if (unsubLicolog) unsubLicolog(); };
  }, [pubDocRef, orgId, pubId]); // ← 重複を除去

  // ====== 既存レイアウトを維持 ======
  if (loading) return <div className="p-6">読み込み中…</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-500/20 border border-red-500/40 p-4 text-red-50">
          <div className="font-semibold mb-1">エラー</div>
          <div className="text-sm opacity-90 break-all">{error}</div>
        </div>
      </div>
    );
  }

  if (!job) return <div className="p-6">データが見つかりませんでした。</div>;

  return (
    <div className="p-6 max-w-4xl">
      {/* 求人ヘッダ */}
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <div className="text-gray-400 mb-6">給与：{job.wage || "-"}</div>

      <div className="mb-6">
        <Link
          to={`/p/${orgId}/jobs/${pubId}/apply`}
          className="inline-block px-4 py-2 rounded-xl bg-white text-black"
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

        {licologNote && (
          <div className="mb-3 text-xs text-yellow-300/80">
            {licologNote}
          </div>
        )}

        {licologs.length === 0 ? (
          <div className="text-sm text-gray-500">
            まだ公開済みのリコログはありません。
          </div>
        ) : (
          <ul className="space-y-3">
            {licologs.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-white"
              >
                <div className="text-xs opacity-60 mb-1">fac: {p.facilityId}</div>
                <div className="whitespace-pre-wrap">{p.body}</div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <Link to="/licolog" className="text-white/80 hover:underline">
            他のリコログも読む
          </Link>
        </div>
      </section>
    </div>
  );
}