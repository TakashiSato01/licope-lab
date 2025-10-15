// apps/admin/src/lib/auth.ts
import { doc } from "firebase/firestore";
import { db } from "./firebase";

export const ORG_ID = "demo-org";

export type Role = "owner" | "admin" | "editor" | "staff" | "viewer";
export type Member = {
  role: Role;
  email?: string;
  displayName?: string;
  photoURL?: string;
  avatarPath?: string;
};

export function memberDocRef(uid: string) {
  return doc(db, `organizations/${ORG_ID}/members/${uid}`);
}

export const ROLE_LABEL: Record<Role,string> = {
  owner: "オーナー", admin: "管理者", editor: "編集者", staff: "スタッフ", viewer: "閲覧者",
};