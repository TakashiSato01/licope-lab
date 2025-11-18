// src/lib/repositories/jobs.ts
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  addDoc,
} from "firebase/firestore";
import {
  ref,
  uploadString,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { auth, db, storage, ensureSignedIn } from "@/lib/firebase";
import type { JobDraft } from "@/types/JobDraft";

const ORG_ID = "demo-org";

/* ===========================================================================
   1) JobSnapshot（Storage に保存する JSON の型）
============================================================================ */
type JobSnapshotJSON = JobDraft & {
  orgId: string;
  version: number;
  generatedAt: number;
};

/* ===========================================================================
   2) ユーティリティ
============================================================================ */
function buildSnapshotJSON(form: JobDraft): string {
  const json: JobSnapshotJSON = {
    orgId: ORG_ID,
    version: 1,
    generatedAt: Date.now(),
    ...form,
  };
  return JSON.stringify(json, null, 2);
}

function getExtSafe(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? `.${m[1]}` : ".jpg";
}

/* ===========================================================================
   3) PV 記録（PublicJobPage が使う）
============================================================================ */
export async function recordJobView(
  pubId: string,
  opts?: { orgId?: string; referrer?: string; ua?: string }
): Promise<void> {
  const orgId = opts?.orgId ?? ORG_ID;
  try {
    await ensureSignedIn();
  } catch {}

  const now = Date.now();
  const d = new Date(now);
  const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;

  await addDoc(collection(db, `organizations/${orgId}/jobViews`), {
    orgId,
    jobId: pubId,
    viewedAt: serverTimestamp(),
    viewedAtMs: now,
    dayKey,
    referrer: opts?.referrer ?? document.referrer ?? "",
    ua:
      opts?.ua ??
      (typeof navigator !== "undefined" ? navigator.userAgent : ""),
    viewerUid: auth.currentUser?.uid ?? null,
  });
}

/* ===========================================================================
   4) 求人公開（新規 publishJob）
============================================================================ */
export async function publishJob(
  form: JobDraft,
  options?: { thumbnailFile?: File | null }
): Promise<{
  pubId: string;
  publicPath: string;
  thumbnailURL: string | null;
}> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const pubRef = doc(collection(db, `organizations/${ORG_ID}/publicJobs`));
  const pubId = pubRef.id;

  let thumbnailPath: string | null = null;
  let thumbnailURL: string | null = null;

  // サムネアップロード
  if (options?.thumbnailFile) {
    const f = options.thumbnailFile;
    const ext = getExtSafe(f.name);
    thumbnailPath = `public/orgs/${ORG_ID}/jobs/${pubId}/thumb${ext}`;
    const tRef = ref(storage, thumbnailPath);
    await uploadBytes(tRef, f, { contentType: f.type || "image/jpeg" });
    thumbnailURL = await getDownloadURL(tRef);
  }

  // Storage の JSON 作成
  const storagePath = `public/orgs/${ORG_ID}/jobs/${pubId}.json`;
  const json = buildSnapshotJSON({
    ...form,
    thumbnailPath,
    thumbnailURL,
  });

  await uploadString(ref(storage, storagePath), json, "raw", {
    contentType: "application/json",
  });

  // Firestore メタ
  await setDoc(pubRef, {
    orgId: ORG_ID,
    storagePath,

    title: form.title,
    wage: form.wage,
    description: form.description,

    facilityName: form.facilityName,
    facilityAddress: form.facilityAddress,
    facilityType: form.facilityType,

    employmentType: form.employmentType,
    workingHours: form.workingHours,
    requirements: form.requirements,
    benefits: form.benefits,

    publishedAt: serverTimestamp(),
    publishedBy: user.uid,

    thumbnailPath,
    thumbnailURL,
  });

  return {
    pubId,
    publicPath: `/p/${ORG_ID}/jobs/${pubId}`,
    thumbnailURL,
  };
}

/* ===========================================================================
   5) 求人編集（updatePublishedJob）
============================================================================ */
export async function updatePublishedJob(
  pubId: string,
  form: JobDraft,
  options?: { thumbnailFile?: File | null }
) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const pubRef = doc(db, `organizations/${ORG_ID}/publicJobs/${pubId}`);
  const snap = await getDoc(pubRef);
  if (!snap.exists()) throw new Error("job not found");

  let thumbnailPath = (snap.get("thumbnailPath") as string | null) ?? null;
  let thumbnailURL = (snap.get("thumbnailURL") as string | null) ?? null;

  // サムネ差し替え
  if (options?.thumbnailFile) {
    const f = options.thumbnailFile;
    const ext = getExtSafe(f.name);
    thumbnailPath = `public/orgs/${ORG_ID}/jobs/${pubId}/thumb${ext}`;
    const tRef = ref(storage, thumbnailPath);
    await uploadBytes(tRef, f, { contentType: f.type || "image/jpeg" });
    thumbnailURL = await getDownloadURL(tRef);
  }

  // JSON 更新
  const storagePath =
    (snap.get("storagePath") as string | null) ??
    `public/orgs/${ORG_ID}/jobs/${pubId}.json`;

  const json = buildSnapshotJSON({
    ...form,
    thumbnailPath,
    thumbnailURL,
  });

  await uploadString(ref(storage, storagePath), json, "raw", {
    contentType: "application/json",
  });

  // Firestore メタ更新
  await setDoc(
    pubRef,
    {
      title: form.title,
      wage: form.wage,
      description: form.description,

      facilityName: form.facilityName,
      facilityAddress: form.facilityAddress,
      facilityType: form.facilityType,

      employmentType: form.employmentType,
      workingHours: form.workingHours,
      requirements: form.requirements,
      benefits: form.benefits,

      thumbnailPath,
      thumbnailURL,

      updatedAt: serverTimestamp(),
      updatedBy: user.uid,
    },
    { merge: true }
  );
}
