// apps/licolog/src/lib/repositories/licolog.ts
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc, collection, doc, onSnapshot, orderBy, query, where,
  serverTimestamp, updateDoc, arrayUnion, arrayRemove, getDoc
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { LicologStatus as LicologPostStatus, LicologMedia, LicologPost } from "../types/licolog";
export type { LicologPost, LicologMedia, LicologStatus as LicologPostStatus } from "../types/licolog";

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
 let unsub: (() => void) | null = null;
 const stopAuth = onAuthStateChanged(auth, () => {
   if (unsub) { unsub(); unsub = null; }
   const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
   const qy = query(
     col,
     where("orgId", "==", ORG_ID),
    where("status", "==", "approved"),
     orderBy("createdAt", "desc"),
   );
   unsub = onSnapshot(
     qy,
     (snap) => {
       const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
       console.debug("[OrgWall] rows:", rows.length, rows[0]);
       cb(rows);
     },
     (err) => {
       console.error("[subscribeOrgWall] onSnapshot error:", err);
       cb([]);
     }
   );
 });
 return () => { if (unsub) unsub(); stopAuth(); };
}

  export function subscribeMyPosts(cb: (posts: LicologPost[]) => void) {
    let unsub: (() => void) | null = null;
    const stopAuth = onAuthStateChanged(auth, (user) => {
      // ユーザーが切り替わったら既存購読を解除
      if (unsub) { unsub(); unsub = null; }
      if (!user) { cb([]); return; }
  
      const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
      const qy = query(
        col,
        where("orgId", "==", ORG_ID),
        where("authorUid", "==", user.uid),
        orderBy("createdAt", "desc"),
      );
      unsub = onSnapshot(
        qy,
        (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))),
        (err) => console.error("[subscribeMyPosts] onSnapshot error:", err)
      );
    });
    return () => { if (unsub) unsub(); stopAuth(); };
  }

// ダウンロードURL（表示側で使う）
export async function pathToURL(path?: string | null): Promise<string | null> {
  if (!path) return null;
  try {
    return await getDownloadURL(ref(storage, path));
  } catch { return null; }
}