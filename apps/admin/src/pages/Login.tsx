// apps/admin/src/pages/Login.tsx
import React, { useState } from "react";
import { emailSignIn } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      await emailSignIn(email.trim(), pw);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf1f4]">
      <form onSubmit={submit} className="w-[360px] rounded-2xl bg-white p-6 shadow">
        <div className="text-xl font-bold mb-4 text-[#f579a4]">Licope 管理ログイン</div>
        <label className="block text-sm mb-1">メールアドレス</label>
        <input className="w-full rounded-lg border px-3 py-2 mb-3"
               value={email} onChange={e=>setEmail(e.target.value)} type="email" required/>
        <label className="block text-sm mb-1">パスワード</label>
        <input className="w-full rounded-lg border px-3 py-2 mb-4"
               value={pw} onChange={e=>setPw(e.target.value)} type="password" required/>
        {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
        <button disabled={busy} className="w-full rounded-xl bg-[#f579a4] text-white py-2">
          {busy ? "サインイン中…" : "ログイン"}
        </button>
        <div className="text-xs text-gray-500 mt-3">※ 新規登録は後日。ユーザーは管理側で追加します。</div>
      </form>
    </div>
  );
}