// apps/licolog/src/lib/repositories/licolog.ts
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

// --- 型（必要なら types.ts から import でもOK） ---
export type LicologPostStatus = "pending" | "approved" | "hidden";
export type LicologPost = {
  id?: string;
  body: string;
  media?: Array<{ path: string; width?: number; height?: number; bytes?: number }>;
  authorUid: string;
  orgId: string;
  facilityId: string;
  status: LicologPostStatus;
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt: Timestamp | ReturnType<typeof serverTimestamp>;
};

// 固定ID（まずはハードコードでOK）
const ORG_ID = "demo-org";
const FACILITY_ID = "demo-facility";

// ============== 作成（コンポーザーから呼ぶ） ==============
export async function addLicologPost(body: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const colRef = collection(db, `organizations/${ORG_ID}/licologPosts`);
  const data: LicologPost = {
    body,
    orgId: ORG_ID,
    facilityId: FACILITY_ID,
    status: "pending", // ルールと一致
    authorUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await addDoc(colRef, data);
}

// ============== 購読（一覧表示で使う） ==============
export function subscribeLicologPosts(cb: (posts: LicologPost[]) => void) {
  const colRef = collection(db, `organizations/${ORG_ID}/licologPosts`);
  const q = query(
    colRef,
    where("orgId", "==", ORG_ID),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items: LicologPost[] = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...(doc.data() as LicologPost) }));
    cb(items);
  });
}