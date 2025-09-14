// apps/admin/src/pages/JobsPage.tsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";

const ORG_ID = "demo-org";

type Job = {
  id: string;
  title: string;
  wage: string;
  status: "draft" | "published" | string;
  createdAt?: any;
};

export default function JobsPage() {
  const [items, setItems] = useState<Job[]>([]);

  useEffect(() => {
    const col = collection(db, `organizations/${ORG_ID}/jobs`);
    const q = query(col, where("orgId", "==", ORG_ID), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Job,"id">) }));
      setItems(rows as Job[]);
    });
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">求人ページ一覧</h2>
        <Link to="/jobs/new" className="rounded px-4 py-2 bg-pink-500 text-white">
          求人ページを作成する
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">まだ求人ページはありません。</p>
      ) : (
        <ul className="space-y-2">
          {items.map(j => (
            <li key={j.id} className="rounded border p-3 bg-white">
              <div className="text-sm text-gray-500">{j.status}</div>
              <div className="font-semibold">{j.title || "(無題)"}</div>
              <div className="text-sm text-gray-600">{j.wage}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}