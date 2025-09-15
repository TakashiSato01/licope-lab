// apps/licolog/src/lib/repositories/licolog.ts
import {
  addDoc, collection, doc, onSnapshot, orderBy, query, where,
  serverTimestamp, updateDoc, arrayUnion, arrayRemove, getDoc
} from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export type LicologPostStatus = "pending" | "approved" | "hidden";
export type LicologMedia = { path: string; width?: number; height?: number; bytes?: number };
export type LicologPost = {
  id?: string;
  body: string;
  media?: LicologMedia[];
  authorUid: string;
  orgId: string;
  facilityId: string;
  status: LicologPostStatus;
  createdAt: any;
  updatedAt: any;
};

const ORG_ID = "demo-org";
const FACILITY_ID = "demo-facility";

// -------- helpers --------
async function uploadOne(file: File, uid: string, postId: string) {
  const safeName = `${Date.now()}_${file.name.replace(/[^\w.\-]/g, "_")}`;
  const storagePath = `orgs/${ORG_ID}/users/${uid}/posts/${postId}/${safeName}`;
  const sref = ref(storage, storagePath);
  const snap = await uploadBytes(sref, file, { contentType: file.type });
  return {
    path: storagePath,
    bytes: snap.metadata.size ? Number(snap.metadata.size) : file.size,
  } as LicologMedia;
}

// ============== 作成 ==============
export async function addLicologPost(body: string, files: File[]) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const colRef = collection(db, `organizations/${ORG_ID}/licologPosts`);
  // 先に空で作って postId を採番
  const base = {
    body,
    orgId: ORG_ID,
    facilityId: FACILITY_ID,
    authorUid: user.uid,
    status: "pending" as const,
    media: [] as LicologMedia[],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const created = await addDoc(colRef, base);
  const postId = created.id;

  // 画像アップロード
  const medias: LicologMedia[] = [];
  for (const f of files) {
    const m = await uploadOne(f, user.uid, postId);
    medias.push(m);
  }
  if (medias.length) {
    await updateDoc(created, {
      media: arrayUnion(...medias),
      updatedAt: serverTimestamp(),
    });
  }
}

// ============== 編集 ==============
// 追加画像: files、削除: removePaths、本文: newBody
export async function updateLicologPost(postId: string, {
  newBody, files, removePaths,
}: { newBody?: string; files?: File[]; removePaths?: string[]; }) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const dref = doc(db, `organizations/${ORG_ID}/licologPosts/${postId}`);
  const cur = await getDoc(dref);
  if (!cur.exists()) throw new Error("not found");

  const updates: any = { updatedAt: serverTimestamp() };

  if (newBody != null) updates.body = newBody;

  if (files && files.length) {
    const addMedias: LicologMedia[] = [];
    for (const f of files) addMedias.push(await uploadOne(f, user.uid, postId));
    updates.media = arrayUnion(...addMedias);
  }

  if (removePaths && removePaths.length) {
    const toRemove = removePaths.map((p) => ({ path: p } as LicologMedia));
    // arrayRemove は完全一致で消す。path 以外のキーは入れない
    updates.media = arrayRemove(...toRemove);
  }

  // 一方通行法：編集したら pending に戻す
  updates.status = "pending";

  await updateDoc(dref, updates);
}

// ============== 購読 ==============
export function subscribeOrgWall(cb: (posts: LicologPost[]) => void) {
  const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
  const qy = query(col, where("orgId", "==", ORG_ID), orderBy("createdAt", "desc"));
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

export function subscribeMyPosts(cb: (posts: LicologPost[]) => void) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("not signed in");
  const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
  const qy = query(col,
    where("orgId", "==", ORG_ID),
    where("authorUid", "==", uid),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(qy, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

// ダウンロードURL（表示側で使う）
export async function pathToURL(path?: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    return await getDownloadURL(ref(storage, path));
  } catch { return null; }
}