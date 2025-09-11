// apps/admin/src/lib/repositories/licolog.ts
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type AdminLicologPost = {
  id: string;
  body: string;
  orgId: string;
  facilityId: string;
  status: "pending" | "approved" | "hidden";
  createdAt?: any;
  updatedAt?: any;
};

const ORG_ID = "demo-org";

// 「承認待ち」を購読（ウォール表示用）
export function subscribePendingLicologPosts(
  cb: (posts: AdminLicologPost[]) => void
): () => void {
  const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
  const q = query(
    col,
    where("orgId", "==", ORG_ID),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<AdminLicologPost, "id">) })
    );
    cb(items);
  });
}

// 複数投稿をまとめて「公開(approved)」にする + 承認イベントを記録
export async function bulkApproveLicologPosts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const batch = writeBatch(db);
  const now = serverTimestamp();

  ids.forEach((id) => {
    // 1) 投稿の status を approved に
    const postRef = doc(db, `organizations/${ORG_ID}/licologPosts/${id}`);
    batch.update(postRef, { status: "approved", updatedAt: now });

    // 2) 承認イベントを記録
    const eventRef = doc(collection(db, `organizations/${ORG_ID}/events`));
    batch.set(eventRef, {
      type: "licolog_approved",
      postId: id,
      orgId: ORG_ID,
      approvedBy: user.uid,
      createdAt: now,
    });
  });

  await batch.commit();
}