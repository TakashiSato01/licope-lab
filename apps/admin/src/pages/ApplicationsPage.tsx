import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
 import {
   collection,
   onSnapshot,
   orderBy,
   query,
   where,
  doc,
  updateDoc
 } from "firebase/firestore";

type Status = "pending" | "review" | "done";

type AppItem = {
  id: string;
  name: string;
  contact: string;
  message?: string;
  createdAt?: any;
  status?: Status;
};

const TABS: { key: Status; label: string }[] = [
  { key: "pending", label: "未対応" },
  { key: "review", label: "選考中" },
  { key: "done", label: "完了" },
];

export default function ApplicationsPage() {
  const [rows, setRows] = useState<AppItem[]>([]);
  const [tab, setTab] = useState<Status>("pending");

  useEffect(() => {
    // Firestore クエリ：status でフィルタし、createdAt で降順
    const baseCol = collection(db, `organizations/${ORG_ID}/applications`);
    const qy = query(
      baseCol,
      where("status", "==", tab),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(qy, (snap) => {
      setRows(
        snap.docs.map((d) => ({
          id: d.id,
          status: "pending", // fallback
          ...(d.data() as any),
        }))
      );
    });

    return () => unsub();
  }, [tab]);

  return (
    <div className="p-6">
      <div className="text-xl font-bold mb-6">応募管理</div>

      {/* --- タブ --- */}
      <div className="flex gap-3 mb-6 border-b border-gray-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 text-sm rounded ${
              tab === t.key
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- データなし --- */}
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">このステータスの応募はありません。</div>
      ) : (
        <ul className="grid md:grid-cols-2 gap-4">
          {rows.map((a) => (
            <li
              key={a.id}
              className="rounded-2xl bg-white p-4 border border-black/5"
            >
              <div className="flex items-start gap-3">
                <Avatar name={a.name} />
                <div className="flex-1">
                  <div className="font-semibold">{a.name}</div>
                  <div className="text-sm text-gray-500">{a.contact}</div>

                  {a.message && (
                    <div className="mt-2 text-sm whitespace-pre-wrap">
                      {a.message}
                    </div>
                  )}

                  {/* ステータス表示 */}
                  <div className="mt-3 text-xs text-gray-400">
                    ステータス: {statusLabel(a.status)}
                  </div>


         {/* ステータス変更ボタン */}
         <div className="mt-3 flex gap-2">
           {a.status === "pending" && (
             <button
               onClick={() => updateStatus(a.id, "review")}
               className="px-3 py-1 text-xs rounded bg-blue-500 text-white"
             >
               選考中へ
             </button>
           )}

           {a.status === "review" && (
             <>
               <button
                 onClick={() => updateStatus(a.id, "done")}
                 className="px-3 py-1 text-xs rounded bg-green-600 text-white"
               >
                 完了へ
               </button>
               <button
                 onClick={() => updateStatus(a.id, "pending")}
                 className="px-3 py-1 text-xs rounded bg-gray-300"
               >
                 戻す
               </button>
             </>
           )}

           {a.status === "done" && (
             <button
               onClick={() => updateStatus(a.id, "review")}
               className="px-3 py-1 text-xs rounded bg-yellow-500 text-white"
             >
               再開する
             </button>
           )}
         </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --- アバター --- */
function Avatar({ name }: { name?: string }) {
  const letter = (name?.[0] ?? "A").toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-200 to-orange-200 flex items-center justify-center font-bold">
      {letter}
    </div>
  );
}

/* --- ステータスの表示ラベル --- */
function statusLabel(s?: Status) {
  switch (s) {
    case "pending":
      return "未対応";
    case "review":
      return "選考中";
    case "done":
      return "完了";
    default:
      return "未対応";
  }
}


/* --- ステータス変更 --- */
async function updateStatus(id: string, next: Status) {
  const ref = doc(db, `organizations/${ORG_ID}/applications/${id}`);
  await updateDoc(ref, { status: next });
}