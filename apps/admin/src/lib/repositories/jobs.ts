// apps/admin/src/lib/repositories/jobs.ts
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  addDoc,                      // ★ 追加
} from "firebase/firestore";
import {
  ref,
  uploadString,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { auth, db, storage, ensureSignedIn } from "@/lib/firebase"; // ★ ensureSignedIn を明示

const ORG_ID = "demo-org";

export type JobDraft = { title: string; wage: string; description: string };

function getExtSafe(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? `.${m[1]}` : ".jpg";
}

/* ========= 公開LPの閲覧記録 ========= */
export async function recordJobView(
  pubId: string,
  opts?: { orgId?: string; referrer?: string; ua?: string }
): Promise<void> {
  const orgId = opts?.orgId ?? ORG_ID;
  try { await ensureSignedIn(); } catch {}

  const now = Date.now();
  const d = new Date(now);
  const dayKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  await addDoc(collection(db, `organizations/${orgId}/jobViews`), {
    orgId,
    jobId: pubId,
    viewedAt: serverTimestamp(),           // 監査用（確定）
    viewedAtMs: now,                       // 集計用（即時・number）
    dayKey,                                // 日別集計したくなったら使える
    referrer: opts?.referrer ?? document.referrer ?? "",
    ua: opts?.ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : ""),
    viewerUid: auth.currentUser?.uid ?? null,
  });
}

/* ========= 公開（新規発行） ========= */
export async function publishJob(
  form: JobDraft,
  options?: { thumbnailFile?: File | null }
): Promise<{ pubId: string; publicPath: string; thumbnailURL: string | null }> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const pubRef = doc(collection(db, `organizations/${ORG_ID}/publicJobs`));
  const pubId = pubRef.id;

  let thumbnailPath: string | null = null;
  let thumbnailURL: string | null = null;
  const file = options?.thumbnailFile ?? null;

  if (file) {
    const ext = getExtSafe(file.name);
    thumbnailPath = `public/orgs/${ORG_ID}/jobs/${pubId}/thumb${ext}`;
    const tRef = ref(storage, thumbnailPath);
    await uploadBytes(tRef, file, { contentType: file.type || "image/jpeg" });
    thumbnailURL = await getDownloadURL(tRef);
  }

  const storagePath = `public/orgs/${ORG_ID}/jobs/${pubId}.json`;
  const json = JSON.stringify(
    {
      orgId: ORG_ID,
      title: form.title,
      wage: form.wage,
      description: form.description,
      version: 1,
      generatedAt: Date.now(),
      thumbnailPath,
      thumbnailURL,
    },
    null,
    2
  );
  await uploadString(ref(storage, storagePath), json, "raw", {
    contentType: "application/json",
  });

  await setDoc(pubRef, {
    orgId: ORG_ID,
    storagePath,
    title: form.title,
    publishedAt: serverTimestamp(),
    publishedBy: user.uid,
    thumbnailPath,
    thumbnailURL,
  });

  return { pubId, publicPath: `/p/${ORG_ID}/jobs/${pubId}`, thumbnailURL };
}

/* ========= 公開済みの更新 ========= */
export async function updatePublishedJob(
  pubId: string,
  form: JobDraft,
  options?: { thumbnailFile?: File | null }
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const pubRef = doc(db, `organizations/${ORG_ID}/publicJobs/${pubId}`);
  const snap = await getDoc(pubRef);
  if (!snap.exists()) throw new Error("job not found");

  let thumbnailPath = (snap.get("thumbnailPath") as string | null) ?? null;
  let thumbnailURL = (snap.get("thumbnailURL") as string | null) ?? null;

  const file = options?.thumbnailFile ?? null;
  if (file) {
    const ext = getExtSafe(file.name);
    thumbnailPath = `public/orgs/${ORG_ID}/jobs/${pubId}/thumb${ext}`;
    const tRef = ref(storage, thumbnailPath);
    await uploadBytes(tRef, file, { contentType: file.type || "image/jpeg" });
    thumbnailURL = await getDownloadURL(tRef);
  }

  const storagePath =
    (snap.get("storagePath") as string | null) ??
    `public/orgs/${ORG_ID}/jobs/${pubId}.json`;
  const json = JSON.stringify(
    {
      orgId: ORG_ID,
      title: form.title,
      wage: form.wage,
      description: form.description,
      version: 1,
      generatedAt: Date.now(),
      thumbnailPath,
      thumbnailURL,
    },
    null,
    2
  );
  await uploadString(ref(storage, storagePath), json, "raw", {
    contentType: "application/json",
  });

  await setDoc(
    pubRef,
    {
      title: form.title,
      wage: form.wage,
      description: form.description,
      thumbnailPath,
      thumbnailURL,
      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    },
    { merge: true }
  );
}