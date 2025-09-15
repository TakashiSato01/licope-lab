import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

type AppItem = { id: string; name: string; contact: string; message?: string; createdAt?: any };

export default function ApplicationsPage() {
  const [rows, setRows] = useState<AppItem[]>([]);

  useEffect(() => {
    const qy = query(collection(db, `organizations/${ORG_ID}/applications`), orderBy("createdAt","desc"));
    const unsub = onSnapshot(qy, s => setRows(s.docs.map(d=>({id:d.id, ...(d.data() as any)}))));
    return () => unsub();
  }, []);

  return (
    <div className="p-6">
      <div className="text-xl font-bold mb-4">応募管理</div>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">まだ応募はありません。</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {rows.map(a => (
            <li key={a.id} className="rounded-2xl bg-white p-4 border border-black/5">
              <div className="flex items-start gap-3">
                <Avatar name={a.name} />
                <div className="flex-1">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm text-gray-500">{a.contact}</div>
                  {a.message && <div className="mt-2 text-sm whitespace-pre-wrap">{a.message}</div>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Avatar({ name }: {name?: string}) {
  const letter = (name?.[0] ?? "A").toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-200 to-orange-200 flex items-center justify-center font-bold">
      {letter}
    </div>
  );
}