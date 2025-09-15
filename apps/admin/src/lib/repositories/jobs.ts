// repositories/jobs.ts
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";

const ORG_ID = "demo-org";

export type JobDraft = { title: string; wage: string; description: string };

// 下書き内容から公開スナップショットを作成して発行
export async function publishJob(
  form: JobDraft
): Promise<{ pubId: string; publicPath: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  // Firestore 側の公開ドキュメントIDを採番
  const pubRef = doc(collection(db, `organizations/${ORG_ID}/publicJobs`));
  const pubId = pubRef.id;

  // Storage に公開 JSON を保存
  const storagePath = `public/orgs/${ORG_ID}/jobs/${pubId}.json`;
  const json = JSON.stringify({
    orgId: ORG_ID,
    title: form.title,
    wage: form.wage,
    description: form.description,
    version: 1,
    generatedAt: Date.now(),
  });

  await uploadString(ref(storage, storagePath), json, "raw", {
    contentType: "application/json",
  });

  // Firestore に公開メタを記録
  await setDoc(pubRef, {
    orgId: ORG_ID,
    storagePath,
    title: form.title,
    publishedAt: serverTimestamp(),
    publishedBy: user.uid,
  });

  // 公開ページへのアプリ内ルート
  return { pubId, publicPath: `/p/${ORG_ID}/jobs/${pubId}` };
}