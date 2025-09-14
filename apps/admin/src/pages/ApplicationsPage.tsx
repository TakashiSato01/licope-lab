import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";

type Application = {
  id: string;
  orgId: string;
  jobPubId: string;
  name: string;
  contact: string;
  message: string;
  createdAt?: any;
};

const ORG_ID = "demo-org";

export default function ApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, `organizations/${ORG_ID}/applications`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return unsub;
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">応募管理</h2>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">まだ応募はありません。</div>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="rounded-xl border border-black/5 bg-white p-4">
              <div className="text-sm text-gray-500 mb-1">
                {a.createdAt?.toDate ? a.createdAt.toDate().toLocaleString() : ""} / ID:{a.id}
              </div>
              <div className="font-medium">{a.name}</div>
              <div className="text-sm text-gray-600">連絡先: {a.contact}</div>
              {a.message && (
                <div className="mt-2 whitespace-pre-wrap text-sm">{a.message}</div>
              )}
              <div className="mt-3">
                <Link
                  to={`/p/${a.orgId}/jobs/${a.jobPubId}`}
                  target="_blank"
                  className="underline text-sm"
                >
                  対象の求人ページを開く
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}