// apps/admin/src/lib/org.ts
import { doc, onSnapshot, collection, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

/** 法人と施設のメタ */
export type OrgMeta = { name?: string };
export type FacilityMeta = { name?: string; contractId?: string };

/** パスヘルパー */
export function orgDocRef(orgId: string) {
  return doc(db, `organizations/${orgId}`);
}
export function memberDocRef(orgId: string, uid: string) {
  return doc(db, `organizations/${orgId}/members/${uid}`);
}

/** 法人メタ live 取得 */
export function useOrgMeta(orgId: string) {
  const [meta, set] = useState<OrgMeta | null>(null);
  useEffect(() => onSnapshot(orgDocRef(orgId), (s) => set((s.data() as OrgMeta) ?? null)), [orgId]);
  return meta;
}

/**
 * 施設メタ live 取得（契約IDで検索）
 * メンバーdocの facilityId に「契約ID」を入れている前提で使える版。
 * facilities のドキュメントIDが自動IDでも問題なく動く。
 */
export function useFacilityMetaByContractId(orgId: string, contractId?: string | null) {
  const [meta, set] = useState<FacilityMeta | null>(null);

  useEffect(() => {
    if (!contractId) { set(null); return; }
    const col = collection(db, `organizations/${orgId}/facilities`);
    const q = query(col, where("contractId", "==", contractId), limit(1));
    return onSnapshot(q, (snap) => {
      const d = snap.docs[0];
      set(d ? ({ ...(d.data() as FacilityMeta) }) : null);
    });
  }, [orgId, contractId]);

  return meta;
}

/** 自分のメンバー情報 live 取得（displayName, facilityId など使う用） */
export function useMyMember(orgId: string, uid?: string | null) {
  const [me, set] = useState<{ displayName?: string; facilityId?: string; photoURL?: string } | null>(null);
  useEffect(() => {
    if (!uid) { set(null); return; }
    return onSnapshot(memberDocRef(orgId, uid), (s) => set((s.data() as any) ?? null));
  }, [orgId, uid]);
  return me;
}