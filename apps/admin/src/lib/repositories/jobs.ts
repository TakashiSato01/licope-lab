// apps/admin/src/lib/repositories/jobs.ts
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

const ORG_ID = "demo-org";

export type JobDraft = {
  title: string;
  wage: string;
  description: string;
};

// 下書き内容から公開スナップショットを作成して発行
export async function publishJob(
  form: JobDraft
): Promise<{ pubId: string; publicPath: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  // 公開メタ用の doc id を先に採番
  const pubRef = doc(collection(db, `organizations/${ORG_ID}/publicJobs`));
  const pubId = pubRef.id;

  // Storage に JSON を保存（公開スナップショット）
  const storagePath = `public/orgs/${ORG_ID}/jobs/${pubId}.json`;
  const payload = {
    orgId: ORG_ID,
    title: form.title,
    wage: form.wage,
    description: form.description,
    version: 1,
    generatedAt: Date.now(),
  };

  await uploadString(ref(storage, storagePath), JSON.stringify(payload), "raw", {
    contentType: "application/json",
  });

  // Firestore に公開メタを記録（一覧・遷移用）
  await setDoc(pubRef, {
    orgId: ORG_ID,
    storagePath,
    title: form.title,
    publishedAt: serverTimestamp(),
    publishedBy: auth.currentUser?.uid ?? "unknown",
  });

  return { pubId, publicPath: `/p/${ORG_ID}/jobs/${pubId}` };
}