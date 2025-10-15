// apps/admin/src/lib/avatar.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ORG_ID } from "@/lib/auth";

export async function updateAvatar({
  uid,
  file,
  prevAvatarPath,
}: { uid: string; file: File; prevAvatarPath?: string | null }) {
  // 1) アップロード先
  const safe = file.name.replace(/[^\w.\-]/g, "_");
  const path = `orgs/${ORG_ID}/members/${uid}/avatar_${Date.now()}_${safe}`;
  const sref = ref(storage, path);

  // 2) アップロード
  await uploadBytes(sref, file, { contentType: file.type });

  // 3) URL 取得
  const url = await getDownloadURL(sref);

  // 4) Firestore 更新
  const mref = doc(db, `organizations/${ORG_ID}/members/${uid}`);
  await updateDoc(mref, {
    photoURL: url,
    avatarPath: path,
    updatedAt: serverTimestamp(),
  });

  // 5) 古いファイルがあれば削除（失敗しても無視）
  if (prevAvatarPath) {
    try { await deleteObject(ref(storage, prevAvatarPath)); } catch {}
  }

  return { url, path };
}