// apps/admin/src/pages/PublicJobPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";

type Snap = {
  title: string;
  wage: string;
  description: string;
  orgId: string;
};

export default function PublicJobPage() {
  const { orgId = "demo-org", pubId = "" } = useParams();
  const [data, setData] = useState<Snap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Firestore で JSON への storagePath を取得
        const meta = await getDoc(doc(db, `organizations/${orgId}/publicJobs/${pubId}`));
        if (!meta.exists()) throw new Error("公開データが見つかりません。");
        const { storagePath } = meta.data() as any;

        // Storage から JSON を取得
        const url = await getDownloadURL(ref(storage, storagePath));
        const json = await fetch(url).then((r) => r.json());
        setData(json);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? String(e));
      }
    })();
  }, [orgId, pubId]);

  if (error) {
    return <div className="p-6 text-sm text-red-600">読み込みに失敗: {error}</div>;
  }
  if (!data) {
    return <div className="p-6 text-sm text-gray-500">読み込み中…</div>;
  }

  // ここから先はお好みの公開デザインに
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
      <div className="mb-2 text-[#f579a4] font-semibold">{data.wage}</div>
      <p className="whitespace-pre-wrap leading-7">{data.description}</p>
    </div>
  );
}