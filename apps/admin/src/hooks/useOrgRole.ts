// apps/admin/src/hooks/useOrgRole.ts
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Member, memberDocRef } from "@/lib/auth";

export function useOrgRole(uid: string | undefined) {
  const [role, setRole] = useState<Member["role"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setRole(null); setLoading(false); return; }
    const unsub = onSnapshot(memberDocRef(uid), (snap) => {
      setRole((snap.data()?.role as Member["role"]) ?? null);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [uid]);

  return { role, loading };
}