import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  serverTimestamp,
  limit as qLimit,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type LicologMedia = {
  path: string;
  width?: number;
  height?: number;
  bytes?: number;
};

export type AdminLicologPost = {
  id: string;
  body: string;
  orgId: string;
  facilityId: string;
  status: "pending" | "approved" | "hidden";
  media?: LicologMedia[];
  createdAt?: any;
  updatedAt?: any;
};

export type LicologEvent =
  | {
      id: string;
      type: "licolog_approved";
      postId: string;
      orgId: string;
      approvedBy: string;
      createdAt?: any;
    }
  | {
      id: string;
      type: "licolog_unapproved"; // 取り消し（approved→pending）
      postId: string;
      orgId: string;
      approvedBy: string;
      createdAt?: any;
    };

const ORG_ID = "demo-org";

/** 承認待ち購読 */
export function subscribePendingLicologPosts(
  cb: (posts: AdminLicologPost[]) => void
): () => void {
  const col = collection(db, `organizations/${ORG_ID}/licologPosts`);
  const qy = query(
    col,
    where("orgId", "==", ORG_ID),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(qy, (snap) => {
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<AdminLicologPost, "id">) })
    );
    cb(items);
  });
}

/** 一括承認（pending→approved）＆イベント記録 */
export async function bulkApproveLicologPosts(ids: string[]): Promise<void> {
  if (!ids.length) return;
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
    } as Omit<LicologEvent, "id">);
  });

  await batch.commit();
}

/** 履歴（承認・取消）購読 */
export function subscribeLicologEvents(
  cb: (events: LicologEvent[]) => void,
  options?: { limit?: number }
): () => void {
  const col = collection(db, `organizations/${ORG_ID}/events`);
  const qy = query(
    col,
    where("orgId", "==", ORG_ID),
    where("type", "in", ["licolog_approved", "licolog_unapproved"]),
    orderBy("createdAt", "desc"),
    ...(options?.limit ? [qLimit(options.limit)] : [])
  );
  return onSnapshot(qy, (snap) => {
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<LicologEvent, "id">) })
    );
    cb(items);
  });
}

/** 承認取消（approved→pending）＆イベント記録 */
export async function unapproveLicologPost(id: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("not signed in");

  const now = serverTimestamp();
  const postRef = doc(db, `organizations/${ORG_ID}/licologPosts/${id}`);
  const evRef = doc(collection(db, `organizations/${ORG_ID}/events`));

  const batch = writeBatch(db);
  batch.update(postRef, { status: "pending", updatedAt: now });
  batch.set(evRef, {
    type: "licolog_unapproved",
    postId: id,
    orgId: ORG_ID,
    approvedBy: user.uid,
    createdAt: now,
  } as Omit<LicologEvent, "id">);

  await batch.commit();
}