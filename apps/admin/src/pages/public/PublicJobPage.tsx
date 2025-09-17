// apps/admin/src/pages/public/PublicJobPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { db, storage } from "@/lib/firebase";
import { getBytes, getDownloadURL, ref } from "firebase/storage";
import { recordJobView } from "@/lib/repositories/jobs";

/* ---------- types ---------- */
type JobSnapshot = {
  orgId: string;
  title: string;
  wage: string;
  description: string;
  version: number;
  generatedAt: number;
  // 追加（JSONに入っている可能性がある）
  thumbnailURL?: string | null;
  thumbnailPath?: string | null;
};

type LicologPost = {
  id: string;
  body: string;
  facilityId: string;
  status: "pending" | "approved" | "hidden" | "internal";
  createdAt?: any;
};

/* ========== Component ========== */
export default function PublicJobPage() {
  // ルート param の表記ゆれを吸収
  const params = useParams();
  const orgId = (params.orgId || (params as any).org || "demo-org") as string;
  const pubId = (params.pubId || (params as any).jobId || (params as any).id || "") as string;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [thumbURL, setThumbURL] = useState<string | null>(null);
  const [licologs, setLicologs] = useState<LicologPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [licologNote, setLicologNote] = useState<string | null>(null);

  const pubDocRef = useMemo(
    () => doc(db, `organizations/${orgId}/publicJobs/${pubId}`),
    [orgId, pubId]
  );

  // 読み込み（Firestoreメタ → Storage JSON）
  useEffect(() => {
    if (!pubId) {
      setError("URL が不正です（pubId がありません）");
      setLoading(false);
      return;
    }

    let unmounted = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Firestore メタ
        const metaSnap = await getDoc(pubDocRef);
        if (!metaSnap.exists()) throw new Error("公開データが見つかりませんでした。");
        const meta = metaSnap.data() as Partial<JobSnapshot> & { storagePath?: string };
        if (!meta.storagePath) throw new Error("storagePath が設定されていません。");

        // 2) Storage の JSON（公開スナップショット）
        const bytes = await getBytes(ref(storage, meta.storagePath));
        const json = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(json) as JobSnapshot;

        if (unmounted) return;

        // Firestoreに入っている値で足りない所を補正
        const merged: JobSnapshot = {
          ...parsed,
          title: parsed.title || meta.title || "(無題)",
          wage: parsed.wage || (meta as any).wage || "",
          description: parsed.description || (meta as any).description || "",
          thumbnailURL: parsed.thumbnailURL ?? meta.thumbnailURL ?? null,
          thumbnailPath: parsed.thumbnailPath ?? meta.thumbnailPath ?? null,
        };
        setJob(merged);

        // 3) サムネ解決（URL優先 → Storage path）
        if (merged.thumbnailURL) setThumbURL(merged.thumbnailURL);
        else if (merged.thumbnailPath) {
          getDownloadURL(ref(storage, merged.thumbnailPath))
            .then((u) => !unmounted && setThumbURL(u))
            .catch(() => !unmounted && setThumbURL(null));
        } else {
          setThumbURL(null);
        }
      } catch (e: any) {
        console.error("[PublicJobPage] load error:", e);
        if (!unmounted) setError(e?.message ?? String(e));
      } finally {
        if (!unmounted) setLoading(false);
      }
    })();

    return () => {
      unmounted = true;
    };
  }, [pubDocRef, orgId, pubId]);

  // ページビュー記録（StrictModeの二重実行対策付き）
  const fired = useRef(false);
  useEffect(() => {
    if (!pubId || fired.current) return;
    fired.current = true;
    recordJobView(pubId, { orgId, referrer: document.referrer }).catch(() => {});
  }, [orgId, pubId]);

  // リコログ（approved 最新3件）
  useEffect(() => {
    const licologCol = collection(db, `organizations/${orgId}/licologPosts`);
    const qy = query(
      licologCol,
      where("orgId", "==", orgId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        setLicologs(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
      },
      (e: FirestoreError) => {
        console.error("[PublicJobPage] licolog onSnapshot error:", e);
        setLicologs([]);
        if (e.code === "failed-precondition") {
          setLicologNote(
            "リコログの並び替えに必要な複合インデックスが未作成です。" +
              "firestore.indexes.json に licologPosts の {orgId ASC, status ASC, createdAt DESC} を追加してデプロイしてください。"
          );
        }
      }
    );
    return () => unsub();
  }, [orgId]);

  /* ---------- UI（既存レイアウトを維持） ---------- */
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
      {/* サムネ（オプション） */}
      {thumbURL ? (
        <img src={thumbURL} alt="" className="w-full h-48 object-cover rounded-lg mb-4" />
      ) : null}

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
          <div className="mb-3 text-xs text-yellow-700">
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