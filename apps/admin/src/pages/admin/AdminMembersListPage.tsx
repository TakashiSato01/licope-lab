import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { ORG_ID } from "@/lib/auth";
import { useOrgRole } from "@/hooks/useOrgRole";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

type MemberRow = {
  id: string;
  lastName?: string;
  firstName?: string;
  jobTitle?: string;
  facilityId?: string;     // 契約ID
  role?: "owner"|"admin"|"editor"|"staff"|"viewer";
  photoURL?: string;
  email?: string;
};

export default function AdminMembersListPage() {
  const uid = auth.currentUser?.uid || "";
  const { role, loading } = useOrgRole(uid);
  const nav = useNavigate();

  const [rows, setRows] = useState<MemberRow[]>([]);
  const [qtext, setQtext] = useState("");

  useEffect(() => {
    (async () => {
      const col = collection(db, "organizations", ORG_ID, "members");
      const snap = await getDocs(query(col, orderBy("lastName", "asc")));
      setRows(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    })();
  }, []);

  const filtered = useMemo(() => {
    const t = qtext.trim();
    if (!t) return rows;
    return rows.filter(r => {
      const name = `${r.lastName ?? ""} ${r.firstName ?? ""}`.trim();
      return name.includes(t) || (r.jobTitle ?? "").includes(t) || (r.email ?? "").includes(t);
    });
  }, [rows, qtext]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!role || (role !== "owner" && role !== "admin")) return <div className="p-6">権限がありません。</div>;

  async function onCreate() {
    const docRef = await addDoc(collection(db, "organizations", ORG_ID, "members"), {
      createdAt: serverTimestamp(),
      role: "viewer",                // 既定は viewer（編集不可方針）
      jobTitle: "",
      firstName: "",
      lastName: "",
      facilityId: "",                // 未割当
      photoURL: "",
      email: "",
    });
    nav(`/admin/members/${docRef.id}`);
  }

  return (
    <div className="p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">職員管理</h1>
        <button onClick={onCreate} className="px-4 py-2 rounded-md text-white bg-pink-500 hover:bg-pink-600">
          新規登録
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={qtext}
          onChange={(e)=>setQtext(e.target.value)}
          placeholder="氏名・メール・業務で検索"
          className="w-full max-w-md border rounded-lg px-3 py-2"
        />
      </div>

      <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left px-3 py-2">氏名</th>
              <th className="text-left px-3 py-2">業務</th>
              <th className="text-left px-3 py-2">施設（契約ID）</th>
              <th className="text-left px-3 py-2">ロール</th>
              <th className="text-left px-3 py-2">メール</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const name = `${m.lastName ?? ""} ${m.firstName ?? ""}`.trim() || "(未設定)";
              return (
                <tr key={m.id} className="border-t">
                  <td className="px-3 py-2">{name}</td>
                  <td className="px-3 py-2">{m.jobTitle ?? "-"}</td>
                  <td className="px-3 py-2">{m.facilityId || "-"}</td>
                  <td className="px-3 py-2">{m.role}</td>
                  <td className="px-3 py-2">{m.email || "-"}</td>
                  <td className="px-3 py-2 text-right">
                    <Link to={`/admin/members/${m.id}`} className="text-pink-600 hover:underline">詳細</Link>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr><td className="px-3 py-6 text-center text-gray-500" colSpan={6}>該当なし</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}