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
  limit as qLimit,         // ★ 追加
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

// ★ 承認イベントの型を追加
export type LicologApprovalEvent = {
  id: string;
  type: "licolog_approved";
  postId: string;
  orgId: string;
  approvedBy: string;
  createdAt?: any;
};

const ORG_ID = "demo-org";

// --- 既存: 承認待ち購読 ---
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

// --- 既存: 複数承認＋イベント書き込み ---
export async function bulkApproveLicologPosts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const batch = writeBatch(db);
  const now = serverTimestamp();

  ids.forEach((id) => {
    const postRef = doc(db, `organizations/${ORG_ID}/licologPosts/${id}`);
    batch.update(postRef, { status: "approved", updatedAt: now });

    const eventRef = doc(collection(db, `organizations/${ORG_ID}/events`));
    batch.set(eventRef, {
      type: "licolog_approved",
      postId: id,
      orgId: ORG_ID,
      approvedBy: user.uid,
      createdAt: now,
    } satisfies Omit<LicologApprovalEvent, "id">);
  });

  await batch.commit();
}

// ★ 新規: 承認履歴（events）購読
export function subscribeLicologApprovalEvents(
  cb: (events: LicologApprovalEvent[]) => void,
  options?: { limit?: number }
): () => void {
  const col = collection(db, `organizations/${ORG_ID}/events`);
  const q = query(
    col,
    where("orgId", "==", ORG_ID),
    where("type", "==", "licolog_approved"),
    orderBy("createdAt", "desc"),
    ...(options?.limit ? [qLimit(options.limit)] : [])
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<LicologApprovalEvent, "id">) })
    );
    cb(items);
  });
}